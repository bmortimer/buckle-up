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
      startDate: '2026-01-29',
      endDate: '2026-02-26',
      reason: '2026 Milano Cortina Winter Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
}

/**
 * NBA schedule breaks
 * NBA has All-Star Break in February
 */
export const NBA_BREAKS: Record<string, ScheduleBreak[]> = {
  '2024-25': [
    {
      startDate: '2025-02-14',
      endDate: '2025-02-20',
      reason: 'NBA All-Star Break',
      emoji: '⭐',
      minimumGapDays: 5,
    },
  ],
  '2025-26': [
    {
      startDate: '2026-02-13',
      endDate: '2026-02-19',
      reason: 'NBA All-Star Break',
      emoji: '⭐',
      minimumGapDays: 5,
    },
  ],
}

/**
 * NHL schedule breaks
 * NHL has All-Star Break and Olympic breaks in Olympic years
 */
export const NHL_BREAKS: Record<string, ScheduleBreak[]> = {
  '2024-25': [
    {
      startDate: '2025-01-31',
      endDate: '2025-02-03',
      reason: 'NHL All-Star Weekend',
      emoji: '⭐',
      minimumGapDays: 3,
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
  '2024': [
    {
      startDate: '2024-07-15',
      endDate: '2024-08-15',
      reason: '2024 Paris Summer Olympics',
      emoji: '🏅',
      minimumGapDays: 14,
    },
  ],
  '2025': [
    {
      startDate: '2025-07-11',
      endDate: '2025-07-13',
      reason: 'WNBA All-Star Weekend',
      emoji: '⭐',
      minimumGapDays: 2,
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
