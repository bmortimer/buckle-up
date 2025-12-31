/**
 * Core data types for belt tracking
 */

/**
 * A single game with teams and scores
 */
export interface Game {
  date: string; // ISO date string YYYY-MM-DD
  homeTeam: string; // Team abbreviation (e.g., "MIA", "BOS")
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

/**
 * Season data loaded from JSON
 */
export interface SeasonData {
  season: string; // e.g., "2012-13"
  league: 'NBA' | 'WNBA';
  games: Game[];
  metadata?: {
    total_games: number;
    ingested_at: string;
  };
}

/**
 * Represents a belt change event
 */
export interface BeltChange {
  game: Game;
  fromTeam: string;
  toTeam: string;
  reason: 'loss' | 'start'; // 'start' for the initial holder
}

/**
 * Complete belt tracking history for a season
 */
export interface BeltHistory {
  season: string;
  league: string;
  startingTeam: string;
  changes: BeltChange[];
  summary: BeltSummary;
}

/**
 * Statistical summary of belt tracking
 */
export interface BeltSummary {
  totalGames: number;
  totalChanges: number;
  teams: TeamBeltStats[];
  currentHolder: string;
}

/**
 * Belt statistics for a single team
 */
export interface TeamBeltStats {
  team: string;
  timesHeld: number; // Number of times they held the belt
  totalGames: number; // Total games played while holding belt
  longestReign: number; // Longest consecutive games with belt
  wins: number; // Games won while holding belt
  losses: number; // Games lost while holding belt
}
