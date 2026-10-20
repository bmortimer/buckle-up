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
  currentYear: 2026,
  isInSeason: false, // 2026 regular season ended Sep 24, 2026
}

export const NBA_CONFIG: SeasonConfig = {
  currentYear: 2026, // 2026-27 season
  isInSeason: true, // 2026-27 season; NYK (2026 champ) starts the belt
}

export const NHL_CONFIG: SeasonConfig = {
  currentYear: 2026, // 2026-27 season
  isInSeason: true, // 2026-27 season; CAR (2026 Stanley Cup champ) starts the belt
}

export const PWHL_CONFIG: SeasonConfig = {
  currentYear: 2025, // 2025-26 season
  isInSeason: false, // Off-season as of Apr 2026
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

/**
 * The season fans should look to for schedule news: the current season while
 * it's running, otherwise the next one. Derived from the manual config above
 * (not the calendar) so leagues whose seasons span years stay correct.
 */
export function getUpcomingSeason(league: 'wnba' | 'nba' | 'nhl' | 'pwhl'): {
  label: string
  wikiUrl: string
} {
  const { currentYear, isInSeason } = getSeasonConfig(league)
  const year = isInSeason ? currentYear : currentYear + 1
  const label =
    league === 'wnba' ? year.toString() : `${year}-${(year + 1).toString().slice(2)}`
  // Wikipedia titles use an en dash for split seasons (e.g. 2026–27_NBA_season)
  const wikiSeason = label.replace('-', '\u2013')
  return {
    label,
    wikiUrl: `https://en.wikipedia.org/wiki/${wikiSeason}_${league.toUpperCase()}_season`,
  }
}
