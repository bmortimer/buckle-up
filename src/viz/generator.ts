/**
 * Visualization Generator
 *
 * Generates HTML visualizations from belt history data
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { BeltHistory, SeasonData } from '../models/types.js';
import { getTeamColor } from '../models/franchiseLoader.js';

interface DayStatus {
  date: string;
  team: string;
  status: 'won-belt' | 'defended' | 'lost' | 'holding-idle';
  score?: string;
}

export class VizGenerator {
  private beltHistory: BeltHistory;
  private seasonData: SeasonData;
  private dailyStatus: Map<string, DayStatus>;

  constructor(beltHistory: BeltHistory, seasonData: SeasonData) {
    this.beltHistory = beltHistory;
    this.seasonData = seasonData;
    this.dailyStatus = new Map();
    this.buildDailyStatus();
  }

  /**
   * Build daily status for each day of the season
   */
  private buildDailyStatus(): void {
    let currentHolder = this.beltHistory.startingTeam;
    const gamesByDate = new Map<string, typeof this.seasonData.games>();

    // Group games by date
    for (const game of this.seasonData.games) {
      if (!gamesByDate.has(game.date)) {
        gamesByDate.set(game.date, []);
      }
      gamesByDate.get(game.date)!.push(game);
    }

    // Get all dates in season
    const dates = Array.from(gamesByDate.keys()).sort();
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    // Process each date
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const gamesOnDate = gamesByDate.get(dateStr) || [];

      // Check if belt holder played this date
      const beltGame = gamesOnDate.find(
        g => g.homeTeam === currentHolder || g.awayTeam === currentHolder
      );

      if (beltGame) {
        const holderIsHome = beltGame.homeTeam === currentHolder;
        const holderWon = holderIsHome
          ? beltGame.homeScore > beltGame.awayScore
          : beltGame.awayScore > beltGame.homeScore;

        const opponent = holderIsHome ? beltGame.awayTeam : beltGame.homeTeam;
        const score = holderIsHome
          ? `${beltGame.homeScore}-${beltGame.awayScore}`
          : `${beltGame.awayScore}-${beltGame.homeScore}`;

        if (holderWon) {
          // Check if this is the game where they won the belt
          const isFirstGame = this.beltHistory.changes.some(
            c => c.toTeam === currentHolder && c.game.date <= dateStr
          ) && this.dailyStatus.size === 0;

          this.dailyStatus.set(dateStr, {
            date: dateStr,
            team: currentHolder,
            status: isFirstGame ? 'won-belt' : 'defended',
            score,
          });
        } else {
          // Lost the belt
          this.dailyStatus.set(dateStr, {
            date: dateStr,
            team: currentHolder,
            status: 'lost',
            score,
          });
          currentHolder = opponent;
        }
      } else if (dates.includes(dateStr)) {
        // Belt holder didn't play, but season is ongoing
        this.dailyStatus.set(dateStr, {
          date: dateStr,
          team: currentHolder,
          status: 'holding-idle',
        });
      }
    }
  }

  /**
   * Generate calendar view HTML
   */
  private generateCalendarView(): string {
    const dates = Array.from(this.dailyStatus.keys()).sort();
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    let html = '<div class="calendar-view">';
    html += '<h2>Calendar View</h2>';
    html += '<div class="calendar-grid">';

    // Generate month grids
    let currentMonth = startDate.getMonth();
    let currentYear = startDate.getFullYear();

    for (let d = new Date(startDate); d <= endDate; ) {
      const month = d.getMonth();
      const year = d.getFullYear();

      if (month !== currentMonth || year !== currentYear) {
        currentMonth = month;
        currentYear = year;
      }

      const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      html += `<div class="calendar-month">`;
      html += `<h3>${monthName}</h3>`;
      html += '<div class="calendar-days">';

      // Days in month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const status = this.dailyStatus.get(dateStr);

        if (status) {
          const className = `calendar-day ${status.status}`;
          const title = status.score
            ? `${status.team} ${status.status} (${status.score})`
            : `${status.team} ${status.status}`;

          html += `<div class="${className}" title="${title}" data-date="${dateStr}">`;
          html += `<span class="day-number">${day}</span>`;
          html += `<span class="team-code">${status.team}</span>`;
          html += '</div>';
        } else {
          html += `<div class="calendar-day empty"><span class="day-number">${day}</span></div>`;
        }
      }

      html += '</div></div>';

      // Move to next month
      d = new Date(year, month + 1, 1);
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Generate bar chart view HTML
   */
  private generateBarChartView(): string {
    const teams = this.beltHistory.summary.teams.sort(
      (a, b) => b.totalGames - a.totalGames
    );

    let html = '<div class="bar-chart-view">';
    html += '<h2>Games Held by Team</h2>';
    html += '<div class="bar-chart">';

    const maxGames = teams[0]?.totalGames || 1;

    for (const team of teams) {
      if (team.totalGames === 0) continue;

      const percentage = (team.totalGames / maxGames) * 100;
      const teamColor = getTeamColor(team.team, this.beltHistory.league.toLowerCase());

      html += '<div class="bar-row">';
      html += `<div class="bar-label">${team.team}</div>`;
      html += `<div class="bar-container">`;
      html += `<div class="bar-fill" style="width: ${percentage}%; background: ${teamColor};">`;
      html += `<span class="bar-value">${team.totalGames} games (${team.wins}-${team.losses})</span>`;
      html += `</div></div></div>`;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Generate GitHub-style contribution view (month x day grid)
   */
  private generateContributionView(): string {
    const teams = Array.from(
      new Set(this.seasonData.games.flatMap(g => [g.homeTeam, g.awayTeam]))
    ).sort();

    let html = '<div class="contribution-view">';
    html += '<h2>Team Belt Activity</h2>';
    html += '<div class="team-selector">';
    html += '<label for="team-select">Select Team:</label>';
    html += '<select id="team-select">';
    teams.forEach((team, idx) => {
      html += `<option value="${team}" ${idx === 0 ? 'selected' : ''}>${team}</option>`;
    });
    html += '</select></div>';

    // Get date range
    const dates = Array.from(this.dailyStatus.keys()).sort();
    if (dates.length === 0) return html + '</div>';

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    // Build month list (only months with games)
    interface MonthKey {
      year: number;
      month: number;
      label: string;
    }
    const monthsWithGames = new Set<string>();
    for (const date of dates) {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthsWithGames.add(key);
    }

    const months: MonthKey[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${month}`;

      // Only include months that have games
      if (monthsWithGames.has(key)) {
        const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        months.push({ year, month, label });
      }
    }

    // Generate grid for each team
    teams.forEach((team, idx) => {
      const display = idx === 0 ? 'block' : 'none';
      html += `<div class="contribution-grid" data-team="${team}" style="display: ${display}">`;
      html += `<h3>${team}</h3>`;
      html += '<div class="contrib-grid-container">';

      // Header row (day numbers)
      html += '<div class="contrib-grid-header">';
      html += '<div class="contrib-month-label"></div>'; // Empty corner
      for (let day = 1; day <= 31; day++) {
        html += `<div class="contrib-day-label">${day}</div>`;
      }
      html += '</div>';

      // Month rows
      for (const { year, month, label } of months) {
        html += '<div class="contrib-month-row">';
        html += `<div class="contrib-month-label">${label}</div>`;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= 31; day++) {
          if (day > daysInMonth) {
            // Empty cell for days that don't exist in this month
            html += '<div class="contrib-square empty-day"></div>';
          } else {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = this.dailyStatus.get(dateStr);

            let className = 'contrib-square empty';
            let title = dateStr;

            if (status) {
              if (status.team === team) {
                // Team has/had the belt this day
                if (status.status === 'won-belt') {
                  className = 'contrib-square won';
                  title = `${dateStr}: Won belt`;
                } else if (status.status === 'defended') {
                  className = 'contrib-square defended';
                  title = `${dateStr}: Defended belt`;
                } else if (status.status === 'holding-idle') {
                  className = 'contrib-square idle';
                  title = `${dateStr}: Holding (no game)`;
                } else if (status.status === 'lost') {
                  className = 'contrib-square lost';
                  title = `${dateStr}: Lost belt`;
                }
              } else {
                // Team doesn't have belt, check if they challenged
                const game = this.seasonData.games.find(
                  g => g.date === dateStr && (g.homeTeam === team || g.awayTeam === team)
                );
                if (game) {
                  const teamIsHome = game.homeTeam === team;
                  const teamWon = teamIsHome
                    ? game.homeScore > game.awayScore
                    : game.awayScore > game.homeScore;
                  const opponentIsHolder = status.team === (teamIsHome ? game.awayTeam : game.homeTeam);

                  if (opponentIsHolder && !teamWon) {
                    className = 'contrib-square challenged-lost';
                    title = `${dateStr}: Challenged, lost`;
                  } else if (opponentIsHolder && teamWon) {
                    className = 'contrib-square won';
                    title = `${dateStr}: Won belt from ${status.team}`;
                  }
                }
              }
            }

            html += `<div class="${className}" title="${title}"></div>`;
          }
        }

        html += '</div>';
      }

      html += '</div></div>';
    });

    html += '</div>';
    return html;
  }

  /**
   * Generate complete HTML dashboard
   */
  generateHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.beltHistory.league} ${this.beltHistory.season} - Belt Tracker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { margin-bottom: 30px; color: #58a6ff; }
    h2 { margin: 40px 0 20px; color: #8b949e; font-size: 24px; }
    h3 { margin: 20px 0 10px; color: #8b949e; font-size: 18px; }

    /* Calendar View */
    .calendar-grid { display: flex; flex-wrap: wrap; gap: 30px; }
    .calendar-month { background: #161b22; padding: 15px; border-radius: 8px; }
    .calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 10px; }
    .calendar-day {
      aspect-ratio: 1;
      background: #21262d;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .calendar-day:hover { transform: scale(1.1); }
    .calendar-day.empty { background: #0d1117; }
    .day-number { font-size: 10px; color: #6e7681; }
    .team-code { font-weight: bold; font-size: 12px; margin-top: 2px; }
    .calendar-day.won-belt { background: #238636; box-shadow: 0 0 8px #238636; }
    .calendar-day.won-belt .team-code { color: #fff; }
    .calendar-day.defended { background: #2ea043; }
    .calendar-day.defended .team-code { color: #fff; }
    .calendar-day.lost { background: #da3633; }
    .calendar-day.lost .team-code { color: #fff; }
    .calendar-day.holding-idle { background: #58a6ff44; }
    .calendar-day.holding-idle .team-code { color: #58a6ff; }

    /* Bar Chart */
    .bar-chart { display: flex; flex-direction: column; gap: 10px; }
    .bar-row { display: flex; align-items: center; gap: 10px; }
    .bar-label { width: 60px; font-weight: bold; color: #58a6ff; }
    .bar-container { flex: 1; background: #21262d; border-radius: 4px; height: 30px; position: relative; }
    .bar-fill {
      height: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      transition: width 0.3s;
    }
    .bar-value { color: #fff; font-size: 12px; white-space: nowrap; }

    /* Contribution View */
    .team-selector { margin-bottom: 20px; }
    .team-selector label { margin-right: 10px; color: #8b949e; }
    .team-selector select {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
    }
    .contribution-grid { margin-top: 20px; }
    .contrib-grid-container {
      background: #161b22;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
    }
    .contrib-grid-header {
      display: grid;
      grid-template-columns: 80px repeat(31, 14px);
      gap: 2px;
      margin-bottom: 5px;
    }
    .contrib-month-row {
      display: grid;
      grid-template-columns: 80px repeat(31, 14px);
      gap: 2px;
      margin-bottom: 2px;
    }
    .contrib-month-label {
      font-size: 11px;
      color: #8b949e;
      display: flex;
      align-items: center;
      padding-right: 10px;
      text-align: right;
      justify-content: flex-end;
    }
    .contrib-day-label {
      font-size: 9px;
      color: #6e7681;
      text-align: center;
    }
    .contrib-square {
      width: 14px;
      height: 14px;
      border-radius: 2px;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .contrib-square:hover { transform: scale(1.2); }
    .contrib-square.empty { background: #0d1117; }
    .contrib-square.empty-day { background: transparent; }
    .contrib-square.won { background: #238636; }
    .contrib-square.defended { background: #2ea043; }
    .contrib-square.idle { background: #58a6ff22; }
    .contrib-square.lost { background: #da3633; }
    .contrib-square.challenged-lost { background: #21262d; }

    /* Legend */
    .legend {
      background: #161b22;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 10px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${this.beltHistory.league} ${this.beltHistory.season} Championship Belt Tracker</h1>

    <div class="legend">
      <h3>Legend</h3>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color" style="background: #238636; box-shadow: 0 0 8px #238636;"></div>
          <span>Won Belt</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #2ea043;"></div>
          <span>Defended Belt</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #58a6ff44;"></div>
          <span>Holding (No Game)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #da3633;"></div>
          <span>Lost Belt</span>
        </div>
      </div>
    </div>

    ${this.generateCalendarView()}
    ${this.generateBarChartView()}
    ${this.generateContributionView()}
  </div>

  <script>
    // Team selector functionality
    const teamSelect = document.getElementById('team-select');
    const contributionGrids = document.querySelectorAll('.contribution-grid');

    teamSelect.addEventListener('change', (e) => {
      const selectedTeam = e.target.value;
      contributionGrids.forEach(grid => {
        grid.style.display = grid.dataset.team === selectedTeam ? 'block' : 'none';
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Save HTML to file
   */
  saveToFile(outputPath: string): void {
    const html = this.generateHTML();
    writeFileSync(outputPath, html, 'utf-8');
    console.log(`\n✓ Visualization saved to ${outputPath}`);
  }
}

/**
 * Generate visualizations from saved belt history
 */
export function generateVizFromFiles(
  league: string,
  season: string
): void {
  const dataDir = resolve(process.cwd(), 'data', league);

  // Load belt history
  const beltHistoryPath = resolve(dataDir, `${season}-belt.json`);
  const beltHistory: BeltHistory = JSON.parse(
    readFileSync(beltHistoryPath, 'utf-8')
  );

  // Load season data
  const seasonDataPath = resolve(dataDir, `${season}.json`);
  const seasonData: SeasonData = JSON.parse(
    readFileSync(seasonDataPath, 'utf-8')
  );

  // Generate visualization
  const generator = new VizGenerator(beltHistory, seasonData);
  const outputPath = resolve(dataDir, `${season}-viz.html`);
  generator.saveToFile(outputPath);
}
