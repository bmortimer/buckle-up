/**
 * Schedule breaks configuration for all leagues
 * Defines major international tournaments and breaks that cause gaps in league schedules
 */

import type { League } from './types'

export interface ScheduleBreak {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  reason: string // Display text
  emoji?: string // Optional emoji to display
  minimumGapDays?: number // Only show if gap is at least this many days (default: 7)
}

/**
 * PWHL schedule breaks
 */
export const PWHL_BREAKS: Record<string, ScheduleBreak[]> = {
  '2023-24': [
    {
      startDate: '2024-04-03',
      endDate: '2024-04-14',
      reason: '2024 IIHF Women\'s World Championship',
      emoji: '🌍',
      minimumGapDays: 7,
    },
  ],
  '2024-25': [
    {
      startDate: '2025-04-09',
      endDate: '2025-04-20',
      reason: '2025 IIHF Women\'s World Championship',
      emoji: '🌍',
      minimumGapDays: 7,
    },
  ],
  '2025-26': [
    {
      startDate: '2026-02-06',
      endDate: '2026-02-22',
      reason: '2026 Milano Cortina Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
}

/**
 * NBA schedule breaks
 */
export const NBA_BREAKS: Record<string, ScheduleBreak[]> = {
  '2019-20': [
    {
      startDate: '2020-03-11',
      endDate: '2020-07-30',
      reason: 'COVID-19 Pandemic Pause',
      emoji: '🦠',
      minimumGapDays: 14,
    },
  ],
}

/**
 * NHL schedule breaks
 * NHL has All-Star Break and Olympic breaks in Olympic years
 */
export const NHL_BREAKS: Record<string, ScheduleBreak[]> = {
  '2019-20': [
    {
      startDate: '2020-03-12',
      endDate: '2020-08-01',
      reason: 'COVID-19 Pandemic - Season Cancelled',
      emoji: '🦠',
      minimumGapDays: 14,
    },
  ],
  '1997-98': [
    {
      startDate: '1998-02-07',
      endDate: '1998-02-22',
      reason: '1998 Nagano Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2005-06': [
    {
      startDate: '2006-02-10',
      endDate: '2006-02-26',
      reason: '2006 Torino Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2009-10': [
    {
      startDate: '2010-02-12',
      endDate: '2010-02-28',
      reason: '2010 Vancouver Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2013-14': [
    {
      startDate: '2014-02-07',
      endDate: '2014-02-23',
      reason: '2014 Sochi Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2025-26': [
    {
      startDate: '2026-02-06',
      endDate: '2026-02-22',
      reason: '2026 Milano Cortina Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
}

/**
 * WNBA schedule breaks
 * WNBA has Olympic breaks and All-Star break
 */
export const WNBA_BREAKS: Record<string, ScheduleBreak[]> = {
  '2004': [
    {
      startDate: '2004-08-13',
      endDate: '2004-08-29',
      reason: '2004 Athens Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2008': [
    {
      startDate: '2008-08-08',
      endDate: '2008-08-24',
      reason: '2008 Beijing Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2012': [
    {
      startDate: '2012-07-27',
      endDate: '2012-08-12',
      reason: '2012 London Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2016': [
    {
      startDate: '2016-08-05',
      endDate: '2016-08-21',
      reason: '2016 Rio Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2021': [
    {
      startDate: '2021-07-23',
      endDate: '2021-08-08',
      reason: '2020 Tokyo Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2024': [
    {
      startDate: '2024-07-26',
      endDate: '2024-08-11',
      reason: '2024 Paris Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2026': [
    {
      startDate: '2026-09-04',
      endDate: '2026-09-13',
      reason: '2026 FIBA Women\'s Basketball World Cup',
      emoji: '🏀',
      minimumGapDays: 14,
    },
  ],
}

/**
 * Get schedule breaks for a specific league and season
 */
export function getScheduleBreaks(league: League, season: string): ScheduleBreak[] {
  const breaksMap = {
    pwhl: PWHL_BREAKS,
    nba: NBA_BREAKS,
    nhl: NHL_BREAKS,
    wnba: WNBA_BREAKS,
  }

  return breaksMap[league]?.[season] || []
}

/**
 * Check if a date range overlaps with a schedule break
 */
export function findBreakInRange(
  league: League,
  season: string,
  startDate: string,
  endDate: string
): ScheduleBreak | null {
  const breaks = getScheduleBreaks(league, season)

  for (const breakInfo of breaks) {
    // Check if the break overlaps with the given range
    if (breakInfo.startDate <= endDate && breakInfo.endDate >= startDate) {
      return breakInfo
    }
  }

  return null
}

/**
 * Check if a specific date falls within a schedule break
 */
export function isDateInBreak(league: League, season: string, date: string): ScheduleBreak | null {
  const breaks = getScheduleBreaks(league, season)

  for (const breakInfo of breaks) {
    if (date >= breakInfo.startDate && date <= breakInfo.endDate) {
      return breakInfo
    }
  }

  return null
}
