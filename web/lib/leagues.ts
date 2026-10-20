/**
 * League registry: the single place for facts that differ between leagues.
 *
 * Components and lib code should ask this module (e.g. formatSeason,
 * getLeague(league).conferences) instead of branching on `league === '...'`.
 * Adding a league starts here.
 */
import type { League } from './types'

// WNBA Conference organization (current active teams)
const WNBA_EASTERN_CONFERENCE = ['ATL', 'CHI', 'CON', 'IND', 'NYL', 'WAS', 'TOR']
const WNBA_WESTERN_CONFERENCE = ['DAL', 'LVA', 'LAS', 'MIN', 'PHO', 'SEA', 'GSV', 'PDX']

// NBA Conference organization (current active teams)
const NBA_EASTERN_CONFERENCE = [
  'ATL',
  'BOS',
  'BKN',
  'CHA',
  'CHI',
  'CLE',
  'DET',
  'IND',
  'MIA',
  'MIL',
  'NYK',
  'ORL',
  'PHI',
  'TOR',
  'WAS',
]
const NBA_WESTERN_CONFERENCE = [
  'DAL',
  'DEN',
  'GSW',
  'HOU',
  'LAC',
  'LAL',
  'MEM',
  'MIN',
  'NOP',
  'OKC',
  'PHX',
  'POR',
  'SAC',
  'SAS',
  'UTA',
]

// NHL Conference organization (current active teams)
const NHL_EASTERN_CONFERENCE = [
  // Metropolitan Division
  'CAR',
  'CBJ',
  'NJD',
  'NYI',
  'NYR',
  'PHI',
  'PIT',
  'WSH',
  // Atlantic Division
  'BOS',
  'BUF',
  'DET',
  'FLA',
  'MTL',
  'OTT',
  'TBL',
  'TOR',
]
const NHL_WESTERN_CONFERENCE = [
  // Central Division
  'UTA',
  'CHI',
  'COL',
  'DAL',
  'MIN',
  'NSH',
  'STL',
  'WPG',
  // Pacific Division
  'ANA',
  'CGY',
  'EDM',
  'LAK',
  'SJS',
  'SEA',
  'VAN',
  'VEG',
]

// PWHL conferences (introduced 2026-27 with 12 teams)
const PWHL_EASTERN_CONFERENCE = ['BOS', 'HAM', 'MTL', 'NYS', 'OTT', 'TOR']
const PWHL_WESTERN_CONFERENCE = ['DET', 'MIN', 'SEA', 'SJS', 'VAN', 'VGS']

export interface LeagueInfo {
  id: League
  /** Display name, e.g. "NBA" */
  name: string
  /** Home-card kicker, e.g. "Men's Basketball" */
  sport: string
  /** Calendar year the tracked history begins (home-card copy) */
  trackedSince: number
  /** Earliest season start year; fallback when no season data is loaded */
  firstSeasonYear: number
  /**
   * true: a season spans two calendar years and is keyed/labelled "2026-27".
   * false: a season sits within one calendar year and is keyed "2026".
   */
  splitYear: boolean
  /**
   * Regular-season window used to lay out the detailed calendar, or null to
   * derive it from the season's actual game dates.
   */
  seasonWindow: ((year: number) => { start: Date; end: Date }) | null
  /** Active teams by conference for the team picker */
  conferences: { east: string[]; west: string[] }
  /** Theme LED token used for this league's accents on the home page */
  accent: 'led-red' | 'led-amber' | 'led-green' | 'led-purple'
}

export const LEAGUES: Record<League, LeagueInfo> = {
  wnba: {
    id: 'wnba',
    name: 'WNBA',
    sport: "Women's Basketball",
    trackedSince: 1997,
    firstSeasonYear: 1997,
    splitYear: false,
    // Season length varies (Olympic years, bubble), so use real game dates
    seasonWindow: null,
    conferences: { east: WNBA_EASTERN_CONFERENCE, west: WNBA_WESTERN_CONFERENCE },
    accent: 'led-red',
  },
  nba: {
    id: 'nba',
    name: 'NBA',
    sport: "Men's Basketball",
    trackedSince: 1976,
    firstSeasonYear: 1976,
    splitYear: true,
    seasonWindow: (year) => ({
      start: new Date(year, 9, 1), // October 1st
      // 2019-20 ran to October 2020 (COVID bubble)
      end: year === 2019 ? new Date(2020, 9, 31) : new Date(year + 1, 5, 30), // June 30th
    }),
    conferences: { east: NBA_EASTERN_CONFERENCE, west: NBA_WESTERN_CONFERENCE },
    accent: 'led-amber',
  },
  nhl: {
    id: 'nhl',
    name: 'NHL',
    sport: "Men's Ice Hockey",
    trackedSince: 1942,
    firstSeasonYear: 1942,
    splitYear: true,
    seasonWindow: (year) => ({
      start: new Date(year, 9, 1), // October 1st
      end: new Date(year + 1, 5, 30), // June 30th
    }),
    conferences: { east: NHL_EASTERN_CONFERENCE, west: NHL_WESTERN_CONFERENCE },
    accent: 'led-green',
  },
  pwhl: {
    id: 'pwhl',
    name: 'PWHL',
    sport: "Women's Ice Hockey",
    trackedSince: 2024,
    firstSeasonYear: 2023,
    splitYear: true,
    seasonWindow: (year) =>
      year === 2023
        ? // Shortened inaugural season: January to May 2024
          { start: new Date(2024, 0, 1), end: new Date(2024, 4, 31) }
        : { start: new Date(year, 10, 1), end: new Date(year + 1, 4, 31) }, // Nov 1 - May 31
    conferences: { east: PWHL_EASTERN_CONFERENCE, west: PWHL_WESTERN_CONFERENCE },
    accent: 'led-purple',
  },
}

/** Display order for navigation and the home page */
export const LEAGUE_ORDER: League[] = ['wnba', 'nba', 'nhl', 'pwhl']

export function getLeague(league: League): LeagueInfo {
  return LEAGUES[league]
}

/**
 * Season key / label for the season starting in `year`:
 * "2026" for single-year leagues, "2026-27" for split-year leagues.
 * Matches the season JSON file names and champions.json keys.
 */
export function formatSeason(league: League, year: number): string {
  if (!LEAGUES[league].splitYear) return year.toString()
  return `${year}-${((year + 1) % 100).toString().padStart(2, '0')}`
}

/**
 * Label for a span of seasons, e.g. "2020-2024" (single-year) or
 * "2020-25" (split-year seasons 2020-21 through 2024-25).
 */
export function formatSeasonRange(league: League, startYear: number, endYear: number): string {
  if (startYear === endYear) return formatSeason(league, startYear)
  if (!LEAGUES[league].splitYear) return `${startYear}-${endYear}`
  return `${startYear}-${((endYear + 1) % 100).toString().padStart(2, '0')}`
}

/**
 * Season key for a game played on `date`. Split-year seasons start in the
 * fall: October-December belongs to the season starting that year,
 * January-September to the one that started the previous year.
 */
export function seasonKeyForDate(league: League, date: Date): string {
  const year = date.getFullYear()
  if (!LEAGUES[league].splitYear) return year.toString()
  return formatSeason(league, date.getMonth() + 1 >= 10 ? year : year - 1)
}
