/**
 * Core data types for belt tracking
 */

export interface Game {
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
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
