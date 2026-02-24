/**
 * Season configuration for different leagues
 * This will need to be updated as seasons change
 * 
 * For NBA: currentYear is the starting year of the season
 * e.g., currentYear: 2025 means the "2025-26" season
 * 
 * For WNBA: currentYear is the calendar year of the season
 * e.g., currentYear: 2025 means the "2025" season
 */

export interface SeasonConfig {
  currentYear: number
  isInSeason: boolean
}

export const WNBA_CONFIG: SeasonConfig = {
  currentYear: 2025,
  isInSeason: false, // Off-season as of Jan 2026
}

export const NBA_CONFIG: SeasonConfig = {
  currentYear: 2025, // 2025-26 season
  isInSeason: true, // In-season as of Jan 2026
}

export const NHL_CONFIG: SeasonConfig = {
  currentYear: 2025, // 2025-26 season
  isInSeason: true, // In-season as of Feb 2026
}

export const PWHL_CONFIG: SeasonConfig = {
  currentYear: 2025, // 2025-26 season
  isInSeason: true, // In-season as of Feb 2026
}

/**
 * Get the appropriate season config for a league
 */
export function getSeasonConfig(league: 'wnba' | 'nba' | 'nhl' | 'pwhl'): SeasonConfig {
  if (league === 'wnba') return WNBA_CONFIG
  if (league === 'nhl') return NHL_CONFIG
  if (league === 'pwhl') return PWHL_CONFIG
  return NBA_CONFIG
}
