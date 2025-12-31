/**
 * Season configuration for different leagues
 * This will need to be updated as seasons change
 */

export interface SeasonConfig {
  currentYear: number
  isInSeason: boolean
}

export const WNBA_CONFIG: SeasonConfig = {
  currentYear: 2025,
  isInSeason: false, // Off-season as of Dec 31, 2025
}

export const NBA_CONFIG: SeasonConfig = {
  currentYear: 2025,
  isInSeason: true, // In-season as of Dec 31, 2025
}

/**
 * Get the appropriate season config for a league
 */
export function getSeasonConfig(league: 'wnba' | 'nba'): SeasonConfig {
  return league === 'wnba' ? WNBA_CONFIG : NBA_CONFIG
}
