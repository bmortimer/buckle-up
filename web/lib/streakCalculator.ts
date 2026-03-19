/**
 * Streak Calculator - Utility for calculating current belt holder's streak
 */

import type { Game, FranchiseInfo, League } from './types'

/**
 * Calculate the current holder's win streak (consecutive wins WITH the belt)
 * This counts how many games they've won since acquiring the belt, including the acquisition game.
 *
 * We need to track the belt through ALL games across all seasons to properly handle
 * the edge case where a team holds the belt at season's end AND wins the championship,
 * continuing their streak into the next season.
 *
 * @param league - The league type affects season key format:
 *   - 'wnba': Summer league, uses single year format (e.g., "2026")
 *   - 'nba', 'nhl': Fall/winter leagues, use spanning format (e.g., "2025-26")
 */
export function getCurrentStreak(
  games: Game[],
  currentHolder: string,
  franchises: FranchiseInfo[],
  champions: Record<string, string>,
  league: League = 'nhl'
): number {
  // Track the belt from the beginning to find when current holder acquired it
  const completedGames = games
    .filter((g) => g.homeScore !== null && g.awayScore !== null)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (completedGames.length === 0) {
    return 0
  }

  // Group games by season to handle season transitions
  // NHL/NBA seasons span two years (e.g., "2025-26"), so we need to determine
  // which season a game belongs to based on the month
  const gamesBySeason = new Map<string, Game[]>()
  for (const game of completedGames) {
    const gameDate = new Date(game.date + 'T12:00:00')
    const gameYear = gameDate.getFullYear()
    const gameMonth = gameDate.getMonth() + 1 // 1-12

    // Season key format depends on league type:
    // - WNBA: Summer league, single year (e.g., "2026" for games May-Oct 2026)
    // - NBA/NHL: Fall/winter leagues, spanning format (e.g., "2025-26" for Oct 2025 - Jun 2026)
    let seasonKey: string
    if (league === 'wnba') {
      // WNBA runs May-Oct within a single calendar year
      seasonKey = gameYear.toString()
    } else {
      // NHL/NBA seasons run Oct-Jun
      // Oct-Dec: game is in season that started this year (e.g., Oct 2025 = 2025-26)
      // Jan-Sep: game is in season that started last year (e.g., Jan 2026 = 2025-26)
      let seasonStartYear: number
      if (gameMonth >= 10) {
        seasonStartYear = gameYear
      } else {
        seasonStartYear = gameYear - 1
      }
      const seasonEndYear = seasonStartYear + 1
      seasonKey = `${seasonStartYear}-${seasonEndYear.toString().slice(-2)}`
    }

    if (!gamesBySeason.has(seasonKey)) {
      gamesBySeason.set(seasonKey, [])
    }
    gamesBySeason.get(seasonKey)!.push(game)
  }

  // Track belt across all seasons
  let holder: string | null = null
  let streak = 0
  let currentStreak = 0

  const sortedSeasons = Array.from(gamesBySeason.keys()).sort()

  for (const seasonKey of sortedSeasons) {
    const seasonGames = gamesBySeason.get(seasonKey)!

    // At the start of each season, reset to the champion
    // (unless continuing from previous season - handled below)
    const seasonChampion = champions[seasonKey]

    if (seasonChampion) {
      // If the previous holder is the same as the new season champion,
      // the streak continues (edge case: team held belt + won championship)
      if (holder !== seasonChampion) {
        holder = seasonChampion
        currentStreak = 0
      }
      // else: streak continues from previous season
    } else if (!holder && seasonGames.length > 0) {
      // Fallback: start with winner of first game
      const firstGame = seasonGames[0]
      holder = firstGame.homeScore! > firstGame.awayScore! ? firstGame.homeTeam : firstGame.awayTeam
      currentStreak = 0
    }

    // Process games in this season
    for (const game of seasonGames) {
      const holderIsHome = game.homeTeam === holder
      const holderIsAway = game.awayTeam === holder

      if (!holderIsHome && !holderIsAway) {
        continue // Belt holder not in this game
      }

      const holderWon = holderIsHome
        ? game.homeScore! > game.awayScore!
        : game.awayScore! > game.homeScore!

      if (holderWon) {
        // Holder defended the belt
        currentStreak++
        if (holder === currentHolder) {
          streak = currentStreak
        }
      } else {
        // Belt changes hands
        const newHolder = holderIsHome ? game.awayTeam : game.homeTeam
        holder = newHolder
        currentStreak = 1 // The win that takes the belt counts as game #1

        if (holder === currentHolder) {
          streak = currentStreak
        }
      }
    }
  }

  return streak
}
