/**
 * Core data types for belt tracking
 */

export type League = 'nba' | 'wnba' | 'nhl'

export interface Game {
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null  // null for scheduled/unplayed games
  awayScore: number | null  // null for scheduled/unplayed games
}

/**
 * Check if a game has been played (has scores)
 */
export function isGameCompleted(game: Game): boolean {
  return game.homeScore !== null && game.awayScore !== null
}

export interface SeasonData {
  season: string
  league: 'NBA' | 'WNBA'
  games: Game[]
  metadata?: {
    total_games: number
    ingested_at: string
  }
}

export interface BeltChange {
  game: Game
  fromTeam: string
  toTeam: string
  reason: 'loss' | 'start'
}

export interface BeltHistory {
  season: string
  league: string
  startingTeam: string
  changes: BeltChange[]
  summary: BeltSummary
}

export interface BeltSummary {
  totalGames: number
  totalChanges: number
  teams: TeamBeltStats[]
  currentHolder: string
}

export interface TeamBeltStats {
  team: string
  timesHeld: number
  totalGames: number
  longestReign: number
  wins: number
  losses: number
  ties?: number
}

export interface FranchiseInfo {
  franchiseId: string
  teamAbbr: string
  displayName: string
  city: string
  startYear: string
  endYear: string
  status: string
  successorFranchiseId: string
  hexColor: string
}

/**
 * Day data for calendar views (BeltCalendar and DetailedCalendar)
 */
export interface CalendarDayData {
  date: string
  holder: string
  game?: Game
  played?: boolean              // BeltCalendar: whether holder played
  won?: boolean | null          // BeltCalendar: whether holder won (null for ties/unplayed)
  beltChanged?: boolean         // DetailedCalendar: belt changed hands
  holderWon?: boolean | null    // DetailedCalendar: whether holder won (null for ties/unplayed)
  winner?: string               // Team that won this game (if played)
  challenger?: string           // Team that challenged for the belt
  isTie?: boolean               // Game ended in a tie
  isUpcomingTitleBout?: boolean // BeltCalendar: next unplayed title bout
  isScheduledTitleBout?: boolean // DetailedCalendar: has an unplayed title bout
  isUncertain?: boolean         // BeltCalendar: day is after an unplayed title bout
  isUncertainFuture?: boolean   // DetailedCalendar: after an unplayed title bout
}
