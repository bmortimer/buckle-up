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
    let currentReign = 0

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
      currentReign++

      const holderWon = holderIsHome
        ? game.homeScore > game.awayScore
        : game.awayScore > game.homeScore

      if (holderWon) {
        holderStats.wins++
        challengerStats.losses++
      } else {
        holderStats.losses++
        challengerStats.wins++

        if (currentReign > holderStats.longestReign) {
          holderStats.longestReign = currentReign
        }

        currentHolder = challenger
        currentReign = 0
        challengerStats.timesHeld++
      }
    }

    const finalStats = teamStats.get(currentHolder)
    if (finalStats && currentReign > finalStats.longestReign) {
      finalStats.longestReign = currentReign
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
 * Track belt across multiple seasons continuously
 * The belt carries over from the end of one season to the start of the next
 */
export function trackAllSeasons(
  seasonsData: { season: string; games: Game[] }[],
  franchises: FranchiseInfo[],
  initialHolder: string
): BeltHistory {
  // Combine all games in chronological order
  const allGames: Game[] = []
  for (const seasonData of seasonsData) {
    allGames.push(...seasonData.games)
  }

  // Track through all games at once (this naturally carries belt across seasons)
  const tracker = new BeltTracker(initialHolder)
  const history = tracker.trackSeason(allGames, franchises)

  // Override season info for all-time view
  history.season = 'All-Time'
  history.league = 'WNBA'

  return history
}
