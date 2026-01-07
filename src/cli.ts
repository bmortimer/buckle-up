#!/usr/bin/env node
/**
 * Championship Belt Tracker CLI
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { SeasonData, BeltHistory } from './models/types.js';
import { BeltTracker } from './tracker/BeltTracker.js';
import { VizGenerator } from './viz/generator.js';

interface CliOptions {
  league: 'nba' | 'wnba';
  seasons: string[]; // Can be multiple seasons
  champion?: string; // Optional - will auto-lookup if not provided
  save?: boolean;
  visualize?: boolean;
}

interface ChampionsData {
  description: string;
  champions: Record<string, string>;
}

function parseArgs(): CliOptions | null {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return null;
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : undefined;
  };

  const league = getArg('--league') as 'nba' | 'wnba' | undefined;
  const seasonArg = getArg('--season') || getArg('--seasons');
  const champion = getArg('--champion');
  const save = args.includes('--save');
  const visualize = args.includes('--visualize');

  if (!league || !seasonArg) {
    console.error('Error: Missing required arguments\n');
    printHelp();
    process.exit(1);
  }

  if (league !== 'nba' && league !== 'wnba') {
    console.error('Error: --league must be "nba" or "wnba"\n');
    process.exit(1);
  }

  // Parse seasons (comma-separated)
  const seasons = seasonArg.split(',').map(s => s.trim());

  return { league, seasons, champion, save, visualize };
}

function printHelp(): void {
  console.log(`
Championship Belt Tracker

Usage:
  npm run track -- --league <nba|wnba> --season <YYYY-YY> --champion <TEAM>

Options:
  --league      League to track (nba or wnba)
  --season      Single season or multiple seasons (comma-separated)
                NBA: YYYY-YY (e.g., 2012-13)
                WNBA: YYYY (e.g., 2024)
                Multiple: 2023,2024 or 2022-23,2023-24
  --seasons     Alias for --season
  --champion    Team abbreviation of defending champion at start (e.g., MIA)
  --save        Save belt history to JSON file
  --visualize   Generate HTML visualization (requires --save)
  --help, -h    Show this help message

Examples:
  npm run track -- --league nba --season 2012-13 --champion MIA
  npm run track -- --league wnba --seasons 2023,2024 --champion LVA --visualize
  npm run track -- --league nba --seasons 2021-22,2022-23,2023-24 --champion MIL --save

Notes:
  - Season data must exist in data/<league>/<season>.json
  - Run ingestion first: python scripts/ingest_nba.py --season 2012-13
`);
}

function loadSeasonData(league: string, season: string): SeasonData {
  const dataPath = resolve(process.cwd(), 'data', league, `${season}.json`);

  try {
    const content = readFileSync(dataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: Season data not found at ${dataPath}`);
      console.error(
        `\nRun ingestion first: python scripts/ingest_${league}.py --season ${season}`
      );
    } else {
      console.error(`Error loading season data: ${error}`);
    }
    process.exit(1);
  }
}

function displayResults(history: BeltHistory, seasonData: SeasonData): void {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${seasonData.league} ${seasonData.season} CHAMPIONSHIP BELT`);
  console.log('='.repeat(60));

  console.log(`\nStarting team: ${history.startingTeam}`);
  console.log(`Total games: ${seasonData.games.length}`);
  console.log(`Belt changes: ${history.summary.totalChanges}`);
  console.log(`Final holder: ${history.summary.currentHolder}\n`);

  // Display belt changes
  console.log('BELT CHANGES:');
  console.log('-'.repeat(60));

  if (history.changes.length === 0) {
    console.log('  No changes - starting team held belt all season!');
  } else {
    history.changes.forEach((change, index) => {
      const { game, fromTeam, toTeam } = change;
      const score =
        game.homeTeam === toTeam
          ? `${game.homeScore}-${game.awayScore}`
          : `${game.awayScore}-${game.homeScore}`;

      console.log(
        `  ${index + 1}. ${game.date} | ${fromTeam} → ${toTeam} | ${toTeam} wins ${score}`
      );
    });
  }

  // Display team statistics
  console.log('\n' + '='.repeat(60));
  console.log('TEAM STATISTICS:');
  console.log('-'.repeat(60));
  console.log(
    'Team | Times Held | Total Games | W-L | Longest Reign'
  );
  console.log('-'.repeat(60));

  history.summary.teams.forEach((team) => {
    const wl = `${team.wins}-${team.losses}`;
    console.log(
      `${team.team.padEnd(5)} | ${String(team.timesHeld).padStart(10)} | ${String(team.totalGames).padStart(11)} | ${wl.padStart(7)} | ${String(team.longestReign).padStart(13)}`
    );
  });

  console.log('='.repeat(60) + '\n');
}

function saveBeltHistory(
  history: BeltHistory,
  league: string,
  season: string
): void {
  const outputDir = resolve(process.cwd(), 'data', league);
  const outputPath = resolve(outputDir, `${season}-belt.json`);

  writeFileSync(outputPath, JSON.stringify(history, null, 2), 'utf-8');
  console.log(`\n✓ Belt history saved to ${outputPath}\n`);
}

function main(): void {
  const options = parseArgs();
  if (!options) return;

  const { league, seasons, champion, save, visualize } = options;

  console.log(`Loading ${league.toUpperCase()} ${seasons.join(', ')} season data...`);

  // Load all season data files
  const allSeasonData: SeasonData[] = [];
  for (const season of seasons) {
    const seasonData = loadSeasonData(league, season);
    allSeasonData.push(seasonData);
  }

  // Combine all games chronologically
  const allGames = allSeasonData
    .flatMap(sd => sd.games)
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log(`Total games across all seasons: ${allGames.length}`);

  // Create combined season data
  const combinedSeasonData: SeasonData = {
    season: seasons.join(','),
    league: allSeasonData[0].league,
    games: allGames,
    metadata: {
      total_games: allGames.length,
      ingested_at: new Date().toISOString(),
    },
  };

  // Track belt
  console.log(`Tracking belt starting with ${champion}...`);
  const tracker = new BeltTracker(champion);
  const history = tracker.trackSeason(allGames);

  // Add season/league info
  history.season = seasons.join(',');
  history.league = allSeasonData[0].league;

  // Display results
  displayResults(history, combinedSeasonData);

  // Save if requested
  if (save) {
    const seasonSlug = seasons.join('-');
    saveBeltHistory(history, league, seasonSlug);
  }

  // Generate visualization if requested
  if (visualize) {
    if (!save) {
      console.log('\nWarning: --visualize requires --save flag. Saving belt history...');
      const seasonSlug = seasons.join('-');
      saveBeltHistory(history, league, seasonSlug);
    }

    console.log('Generating visualization...');
    const generator = new VizGenerator(history, combinedSeasonData);
    const seasonSlug = seasons.join('-');
    const outputPath = resolve(process.cwd(), 'data', league, `${seasonSlug}-viz.html`);
    generator.saveToFile(outputPath);
    console.log(`\n✓ Open ${outputPath} in your browser to view visualizations`);
  }
}

main();
