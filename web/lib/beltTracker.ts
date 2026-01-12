/**
 * Belt Tracker - Client-side belt tracking logic
 */

import type { Game, BeltHistory, BeltSummary, TeamBeltStats, BeltChange, FranchiseInfo } from './types'
import { isSameFranchise } from './franchises'

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
    const holderIsHome = isSameFranchise(game.homeTeam, this.currentHolder, this.franchises)
    const holderIsAway = isSameFranchise(game.awayTeam, this.currentHolder, this.franchises)

    if (!holderIsHome && !holderIsAway) {
      return
    }

    const holderWon = holderIsHome
      ? game.homeScore > game.awayScore
      : game.awayScore > game.homeScore

    if (!holderWon) {
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

    const initStats = (team: string): TeamBeltStats => ({
      team,
      timesHeld: 0,
      totalGames: 0,
      longestReign: 0,
      wins: 0,
      losses: 0,
    })

    let currentHolder = this.startingTeam
    let currentWinStreak = 0

    for (const game of games) {
      const holderIsHome = isSameFranchise(game.homeTeam, currentHolder, this.franchises)
      const holderIsAway = isSameFranchise(game.awayTeam, currentHolder, this.franchises)

      if (!holderIsHome && !holderIsAway) {
        continue
      }

      const challenger = holderIsHome ? game.awayTeam : game.homeTeam

      if (!teamStats.has(currentHolder)) {
        const stats = initStats(currentHolder)
        stats.timesHeld = 1
        teamStats.set(currentHolder, stats)
      }

      if (!teamStats.has(challenger)) {
        teamStats.set(challenger, initStats(challenger))
      }

      const holderStats = teamStats.get(currentHolder)!
      const challengerStats = teamStats.get(challenger)!

      holderStats.totalGames++
      challengerStats.totalGames++

      const holderWon = holderIsHome
        ? game.homeScore > game.awayScore
        : game.awayScore > game.homeScore

      if (holderWon) {
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

    const teams = Array.from(teamStats.values()).sort(
      (a, b) => b.totalGames - a.totalGames
    )

    return {
      totalGames: games.length,
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
 * Track belt across multiple seasons with per-season reset
 * Each season starts with the previous year's actual champion (from champions lookup)
 * Belt transfers during the season when holder loses, but resets at season start
 */
export function trackAllSeasons(
  seasonsData: { season: string; games: Game[] }[],
  franchises: FranchiseInfo[],
  champions: Record<string, string>
): BeltHistory {
  const allChanges: BeltChange[] = []
  const teamStatsMap = new Map<string, TeamBeltStats>()

  const initStats = (team: string): TeamBeltStats => ({
    team,
    timesHeld: 0,
    totalGames: 0,
    longestReign: 0,
    wins: 0,
    losses: 0,
  })

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

    // Merge changes
    allChanges.push(...seasonHistory.changes)

    // Merge team stats
    for (const teamStats of seasonHistory.summary.teams) {
      const existing = teamStatsMap.get(teamStats.team)
      if (existing) {
        existing.timesHeld += teamStats.timesHeld
        existing.totalGames += teamStats.totalGames
        existing.wins += teamStats.wins
        existing.losses += teamStats.losses
        existing.longestReign = Math.max(existing.longestReign, teamStats.longestReign)
      } else {
        teamStatsMap.set(teamStats.team, { ...teamStats })
      }
    }

    // Track the final holder (from the last season processed)
    finalHolder = seasonHistory.summary.currentHolder
  }

  // Convert team stats map to sorted array
  const teams = Array.from(teamStatsMap.values()).sort(
    (a, b) => b.totalGames - a.totalGames
  )

  // Calculate total games from all seasons
  const totalGames = seasonsData.reduce((sum, sd) => sum + sd.games.length, 0)

  return {
    season: 'All-Time',
    league: 'WNBA',
    startingTeam: champions[seasonsData[0]?.season] || '',
    changes: allChanges,
    summary: {
      totalGames,
      totalChanges: allChanges.length,
      teams,
      currentHolder: finalHolder,
    },
  }
}
