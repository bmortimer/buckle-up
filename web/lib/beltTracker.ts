/**
 * Belt Tracker - Client-side belt tracking logic
 */

import type {
  Game,
  BeltHistory,
  BeltSummary,
  TeamBeltStats,
  BeltChange,
  FranchiseInfo,
} from './types'
import { isGameCompleted } from './types'
import { isSameFranchise, getCurrentFranchiseAbbr } from './franchises'

export function createEmptyStats(team: string): TeamBeltStats {
  return {
    team,
    timesHeld: 0,
    totalGames: 0,
    longestReign: 0,
    wins: 0,
    losses: 0,
  }
}

export function mergeTeamStats(existing: TeamBeltStats, incoming: TeamBeltStats): void {
  existing.timesHeld += incoming.timesHeld
  existing.totalGames += incoming.totalGames
  existing.wins += incoming.wins
  existing.losses += incoming.losses
  existing.ties = (existing.ties || 0) + (incoming.ties || 0)
  existing.longestReign = Math.max(existing.longestReign, incoming.longestReign)
}

export class BeltTracker {
  private currentHolder: string
  private changes: BeltChange[] = []
  private startingTeam: string
  private franchises: FranchiseInfo[] = []

  constructor(startingTeam: string) {
    this.startingTeam = startingTeam
    this.currentHolder = startingTeam
  }

  processGame(game: Game): void {
    // Skip unplayed games (no scores yet)
    if (!isGameCompleted(game)) {
      return
    }

    const holderIsHome = isSameFranchise(game.homeTeam, this.currentHolder, this.franchises)
    const holderIsAway = isSameFranchise(game.awayTeam, this.currentHolder, this.franchises)

    if (!holderIsHome && !holderIsAway) {
      return
    }

    const isTie = game.homeScore === game.awayScore
    const holderWon =
      !isTie &&
      (holderIsHome ? game.homeScore! > game.awayScore! : game.awayScore! > game.homeScore!)

    // On a tie, belt stays with holder (no change)
    if (!isTie && !holderWon) {
      const newHolder = holderIsHome ? game.awayTeam : game.homeTeam

      this.changes.push({
        game,
        fromTeam: this.currentHolder,
        toTeam: newHolder,
        reason: 'loss',
      })

      this.currentHolder = newHolder
    }
  }

  trackSeason(games: Game[], franchises: FranchiseInfo[]): BeltHistory {
    this.currentHolder = this.startingTeam
    this.changes = []
    this.franchises = franchises

    for (const game of games) {
      this.processGame(game)
    }

    const summary = this.calculateSummary(games)

    return {
      season: '',
      league: '',
      startingTeam: this.startingTeam,
      changes: this.changes,
      summary,
    }
  }

  public calculateSummary(games: Game[]): BeltSummary {
    const teamStats = new Map<string, TeamBeltStats>()

    let currentHolder = this.startingTeam
    let currentWinStreak = 0

    // Only process completed games
    const completedGames = games.filter(isGameCompleted)

    for (const game of completedGames) {
      const holderIsHome = isSameFranchise(game.homeTeam, currentHolder, this.franchises)
      const holderIsAway = isSameFranchise(game.awayTeam, currentHolder, this.franchises)

      if (!holderIsHome && !holderIsAway) {
        continue
      }

      const challenger = holderIsHome ? game.awayTeam : game.homeTeam

      if (!teamStats.has(currentHolder)) {
        const stats = createEmptyStats(currentHolder)
        stats.timesHeld = 1
        teamStats.set(currentHolder, stats)
      }

      if (!teamStats.has(challenger)) {
        teamStats.set(challenger, createEmptyStats(challenger))
      }

      const holderStats = teamStats.get(currentHolder)!
      const challengerStats = teamStats.get(challenger)!

      holderStats.totalGames++
      challengerStats.totalGames++

      // Since we filtered for completed games, scores are guaranteed to be non-null
      const isTie = game.homeScore === game.awayScore
      const holderWon =
        !isTie &&
        (holderIsHome ? game.homeScore! > game.awayScore! : game.awayScore! > game.homeScore!)

      if (isTie) {
        // Tie: belt holder retains the belt, both teams get a tie
        holderStats.ties = (holderStats.ties || 0) + 1
        challengerStats.ties = (challengerStats.ties || 0) + 1
        // Ties don't break the win streak
      } else if (holderWon) {
        holderStats.wins++
        challengerStats.losses++
        currentWinStreak++
      } else {
        holderStats.losses++
        challengerStats.wins++

        // Update longest streak before resetting (streak = consecutive wins, not including the loss)
        if (currentWinStreak > holderStats.longestReign) {
          holderStats.longestReign = currentWinStreak
        }

        currentHolder = challenger
        // The win that takes the belt counts toward the new holder's streak
        currentWinStreak = 1
        challengerStats.timesHeld++
      }
    }

    // Check final holder's current streak at end of season
    const finalStats = teamStats.get(currentHolder)
    if (finalStats && currentWinStreak > finalStats.longestReign) {
      finalStats.longestReign = currentWinStreak
    }

    const teams = Array.from(teamStats.values()).sort((a, b) => b.totalGames - a.totalGames)

    return {
      totalGames: completedGames.length,
      totalChanges: this.changes.length,
      teams,
      currentHolder: this.currentHolder,
    }
  }

  getCurrentHolder(): string {
    return this.currentHolder
  }
}

/**
 * Find the next scheduled game for a team
 */
export function findNextGameForTeam(
  games: Game[],
  team: string,
  franchises: FranchiseInfo[]
): Game | null {
  // Find the latest completed game date to detect postponed games
  // (unplayed games before this date are postponed, not upcoming)
  let lastPlayedDate = ''
  for (const game of games) {
    if (isGameCompleted(game) && game.date > lastPlayedDate) {
      lastPlayedDate = game.date
    }
  }

  // Sort games by date to find the next one
  const sortedGames = [...games].sort((a, b) => a.date.localeCompare(b.date))

  for (const game of sortedGames) {
    // Skip completed games
    if (isGameCompleted(game)) {
      continue
    }

    // Skip unplayed games before the last played date (postponed/cancelled)
    if (game.date <= lastPlayedDate) {
      continue
    }

    // Check if the team is in this game
    const isHome = isSameFranchise(game.homeTeam, team, franchises)
    const isAway = isSameFranchise(game.awayTeam, team, franchises)

    if (isHome || isAway) {
      return game
    }
  }

  return null
}

/**
 * Find the next title bout - the current belt holder's next scheduled game
 */
export function findNextTitleBout(
  games: Game[],
  currentHolder: string,
  franchises: FranchiseInfo[]
): Game | null {
  return findNextGameForTeam(games, currentHolder, franchises)
}

/**
 * Merge stats by franchise - combines all historical team eras into current franchise
 */
function mergeStatsByFranchise(
  statsMap: Map<string, TeamBeltStats>,
  franchises: FranchiseInfo[]
): Map<string, TeamBeltStats> {
  const merged = new Map<string, TeamBeltStats>()

  statsMap.forEach((stats) => {
    const currentAbbr = getCurrentFranchiseAbbr(stats.team, franchises)
    const existing = merged.get(currentAbbr)

    if (existing) {
      mergeTeamStats(existing, stats)
    } else {
      merged.set(currentAbbr, { ...stats, team: currentAbbr })
    }
  })

  return merged
}

export interface TrackAllSeasonsOptions {
  mergeByFranchise?: boolean
}

/**
 * Track belt across multiple seasons with per-season reset
 * Each season starts with the previous year's actual champion (from champions lookup)
 * Belt transfers during the season when holder loses, but resets at season start
 */
export function trackAllSeasons(
  seasonsData: { season: string; games: Game[] }[],
  franchises: FranchiseInfo[],
  champions: Record<string, string>,
  options?: TrackAllSeasonsOptions
): BeltHistory {
  const allChanges: BeltChange[] = []
  const teamStatsMap = new Map<string, TeamBeltStats>()

  let finalHolder = ''

  // Process each season separately
  for (const seasonData of seasonsData) {
    // Get the starting champion for this season from the champions lookup
    const startingChampion = champions[seasonData.season]
    if (!startingChampion) {
      console.warn(`No champion defined for season ${seasonData.season}, skipping`)
      continue
    }

    // Track this season
    const tracker = new BeltTracker(startingChampion)
    const seasonHistory = tracker.trackSeason(seasonData.games, franchises)

    // Add a season start marker before this season's changes
    // This helps the calendar know when the belt was reset to a new champion
    // We set the date to be the first day of the month of the first game
    // This ensures off-days before the season show the correct champion
    if (seasonData.games.length > 0) {
      const firstGame = seasonData.games[0]
      // Extract year-month from first game date and set to 1st of that month
      const [year, month] = firstGame.date.split('-')
      const seasonStartDate = `${year}-${month}-01`

      // Create a pseudo-game object for the season start marker
      const seasonStartGame = {
        ...firstGame,
        date: seasonStartDate,
      }

      allChanges.push({
        game: seasonStartGame,
        fromTeam: finalHolder || startingChampion, // Previous season's final holder
        toTeam: startingChampion,
        reason: 'start' as const,
      })
    }

    // Merge changes
    allChanges.push(...seasonHistory.changes)

    // Merge team stats
    for (const teamStats of seasonHistory.summary.teams) {
      const existing = teamStatsMap.get(teamStats.team)
      if (existing) {
        mergeTeamStats(existing, teamStats)
      } else {
        teamStatsMap.set(teamStats.team, { ...teamStats })
      }
    }

    // Update finalHolder to this season's ending belt holder
    // This will be used as the "fromTeam" for the next season's start marker
    finalHolder = seasonHistory.summary.currentHolder
  }

  // Optionally merge stats by franchise (for All Time view)
  let finalStatsMap = teamStatsMap
  if (options?.mergeByFranchise) {
    finalStatsMap = mergeStatsByFranchise(teamStatsMap, franchises)
    // Also update finalHolder to use current franchise abbreviation
    finalHolder = getCurrentFranchiseAbbr(finalHolder, franchises)
  }

  // Convert team stats map to sorted array
  const teams = Array.from(finalStatsMap.values()).sort((a, b) => b.totalGames - a.totalGames)

  // Calculate total completed games from all seasons
  const totalGames = seasonsData.reduce(
    (sum, sd) => sum + sd.games.filter(isGameCompleted).length,
    0
  )

  return {
    season: 'All-Time',
    league: 'WNBA',
    startingTeam: champions[seasonsData[0]?.season] || '',
    changes: allChanges,
    summary: {
      totalGames,
      totalChanges: allChanges.filter(
        (c) =>
          c.reason === 'loss' ||
          (c.reason === 'start' && c.fromTeam !== c.toTeam)
      ).length,
      teams,
      currentHolder: finalHolder,
    },
  }
}
