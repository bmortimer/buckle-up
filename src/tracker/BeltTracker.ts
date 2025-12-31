/**
 * Belt Tracker - Core logic for tracking championship belt through games
 */

import type {
  Game,
  BeltChange,
  BeltHistory,
  BeltSummary,
  TeamBeltStats,
} from '../models/types.js';
import { isSameFranchise } from '../models/franchises.js';

export class BeltTracker {
  private currentHolder: string;
  private changes: BeltChange[] = [];
  private startingTeam: string;

  constructor(startingTeam: string) {
    this.startingTeam = startingTeam;
    this.currentHolder = startingTeam;
  }

  /**
   * Process a single game and update belt holder if necessary
   */
  processGame(game: Game): void {
    // Check if the current belt holder is playing in this game
    // Use franchise continuity to handle team relocations
    const holderIsHome = isSameFranchise(game.homeTeam, this.currentHolder);
    const holderIsAway = isSameFranchise(game.awayTeam, this.currentHolder);

    // If belt holder isn't playing, nothing happens
    if (!holderIsHome && !holderIsAway) {
      return;
    }

    // Determine if belt holder won
    const holderWon = holderIsHome
      ? game.homeScore > game.awayScore
      : game.awayScore > game.homeScore;

    // If belt holder lost, belt changes hands
    if (!holderWon) {
      const newHolder = holderIsHome ? game.awayTeam : game.homeTeam;

      this.changes.push({
        game,
        fromTeam: this.currentHolder,
        toTeam: newHolder,
        reason: 'loss',
      });

      this.currentHolder = newHolder;
    }
  }

  /**
   * Track belt through all games in a season
   */
  trackSeason(games: Game[]): BeltHistory {
    // Reset state
    this.currentHolder = this.startingTeam;
    this.changes = [];

    // Process each game in chronological order
    for (const game of games) {
      this.processGame(game);
    }

    // Calculate summary statistics
    const summary = this.calculateSummary(games);

    return {
      season: '', // Will be set by caller
      league: '', // Will be set by caller
      startingTeam: this.startingTeam,
      changes: this.changes,
      summary,
    };
  }

  /**
   * Calculate statistical summary of belt tracking
   */
  private calculateSummary(games: Game[]): BeltSummary {
    const teamStats = new Map<string, TeamBeltStats>();

    // Initialize starting team stats
    const initStats = (team: string): TeamBeltStats => ({
      team,
      timesHeld: 0,
      totalGames: 0,
      longestReign: 0,
      wins: 0,
      losses: 0,
    });

    // Track current holder and reign length
    let currentHolder = this.startingTeam;
    let currentReign = 0;
    let changeIndex = 0;

    // Process each game to build team statistics
    for (const game of games) {
      const holderIsHome = isSameFranchise(game.homeTeam, currentHolder);
      const holderIsAway = isSameFranchise(game.awayTeam, currentHolder);

      if (!holderIsHome && !holderIsAway) {
        continue; // Belt holder not playing
      }

      // Identify the challenger (opponent of belt holder)
      const challenger = holderIsHome ? game.awayTeam : game.homeTeam;

      // Ensure stats exist for current holder
      if (!teamStats.has(currentHolder)) {
        const stats = initStats(currentHolder);
        stats.timesHeld = 1;
        teamStats.set(currentHolder, stats);
      }

      // Ensure stats exist for challenger
      if (!teamStats.has(challenger)) {
        teamStats.set(challenger, initStats(challenger));
      }

      const holderStats = teamStats.get(currentHolder)!;
      const challengerStats = teamStats.get(challenger)!;

      // Both teams played a belt game
      holderStats.totalGames++;
      challengerStats.totalGames++;
      currentReign++;

      // Determine if holder won
      const holderWon = holderIsHome
        ? game.homeScore > game.awayScore
        : game.awayScore > game.homeScore;

      if (holderWon) {
        // Holder defended the belt
        holderStats.wins++;
        challengerStats.losses++;
      } else {
        // Challenger took the belt
        holderStats.losses++;
        challengerStats.wins++;

        // Update longest reign for previous holder
        if (currentReign > holderStats.longestReign) {
          holderStats.longestReign = currentReign;
        }

        // Belt changes hands - challenger is now the new holder
        currentHolder = challenger;
        currentReign = 0;
        changeIndex++;

        // Update times held for new holder
        challengerStats.timesHeld++;
      }
    }

    // Update final reign length
    const finalStats = teamStats.get(currentHolder);
    if (finalStats && currentReign > finalStats.longestReign) {
      finalStats.longestReign = currentReign;
    }

    // Convert to sorted array
    const teams = Array.from(teamStats.values()).sort(
      (a, b) => b.totalGames - a.totalGames
    );

    return {
      totalGames: games.filter((g) =>
        teams.some((t) => t.team === g.homeTeam || t.team === g.awayTeam)
      ).length,
      totalChanges: this.changes.length,
      teams,
      currentHolder: this.currentHolder,
    };
  }

  /**
   * Get the current belt holder
   */
  getCurrentHolder(): string {
    return this.currentHolder;
  }

  /**
   * Get all belt changes
   */
  getChanges(): BeltChange[] {
    return this.changes;
  }
}
