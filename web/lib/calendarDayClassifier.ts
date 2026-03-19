/**
 * Calendar Day Classifier
 *
 * Pure functions for classifying a day's belt status for a selected team.
 * Extracted from BeltCalendar component for testability.
 */

import type { FranchiseInfo, CalendarDayData, Game } from './types'
import { isGameCompleted } from './types'
import { isSameFranchise, getAllFranchiseAbbrs } from './franchises'

// Cache for getActiveMonthsForTeam - keyed by games array, then by team code
const activeMonthsCache = new WeakMap<Game[], Map<string, Set<string>>>()

// Re-export CalendarDayData as DayData for backwards compatibility
export type DayData = CalendarDayData

export interface DayClassification {
  // Is the selected team involved in this day at all?
  isInvolved: boolean

  // Primary states (mutually exclusive for display purposes)
  heldBelt: boolean // Team held the belt at start of day
  wonBelt: boolean // Team won the belt from another team
  challengedBelt: boolean // Team challenged for the belt (completed game only)

  // Detailed outcomes (for display logic)
  wonBeltThisDay: boolean // Won belt from another team (bright color)
  defendedBelt: boolean // Held belt and won (bright color)
  tiedWhileHolding: boolean // Held belt and tied (dim color, belt stays)
  lostBelt: boolean // Held belt and lost (transparent with X)
  offDay: boolean // Held belt, no game (dim color)
  failedChallenge: boolean // Challenged and lost or tied (tan color)
  isUpcomingTitleBout: boolean // Has upcoming unplayed game as belt holder (show "?")
  isUncertain: boolean // Day is after an unplayed title bout - outcome unknown

  // Aggregates for styling
  isWinOrDefense: boolean // Bright team color
  isLoss: boolean // Transparent with border
}

/**
 * Classify a day's belt status for a selected team.
 *
 * @param dayData - The day's data including holder, game results, etc.
 * @param selectedTeam - The team code to check involvement for
 * @param franchises - Franchise info for matching team codes across relocations
 * @returns Classification of the day's status for the selected team
 */
export function classifyDayForTeam(
  dayData: DayData,
  selectedTeam: string,
  franchises: FranchiseInfo[]
): DayClassification {
  // Normalize optional played field (default to false if undefined)
  const played = dayData.played ?? false

  // Check if selected team is involved: held belt, won belt, OR challenged for belt
  // Use franchise matching to include historical team codes (UTA/SAS for LVA)
  const heldBelt = Boolean(
    dayData.holder && isSameFranchise(dayData.holder, selectedTeam, franchises)
  )
  const wonBelt = Boolean(
    dayData.winner && isSameFranchise(dayData.winner, selectedTeam, franchises) && !heldBelt
  )

  // Only count as challenged if the game was actually played
  // Unplayed games where team would be challenger should not show as involved
  const challengedBelt = Boolean(
    dayData.challenger &&
    isSameFranchise(dayData.challenger, selectedTeam, franchises) &&
    !heldBelt &&
    !wonBelt &&
    played
  )

  const isInvolved = heldBelt || wonBelt || challengedBelt

  // Detailed outcomes
  const wonBeltThisDay = wonBelt && played
  const defendedBelt = heldBelt && played && dayData.won === true
  const tiedWhileHolding = heldBelt && played && Boolean(dayData.isTie)
  const lostBelt = heldBelt && played && dayData.won === false
  const offDay = heldBelt && !played && !dayData.isUpcomingTitleBout && !dayData.isUncertain
  const failedChallenge = challengedBelt && played // Both tie and loss when challenging
  const isUpcomingTitleBout = Boolean(heldBelt && dayData.isUpcomingTitleBout)
  const isUncertain = Boolean(dayData.isUncertain)

  // Aggregates
  const isWinOrDefense = wonBeltThisDay || defendedBelt
  const isLoss = lostBelt

  return {
    isInvolved,
    heldBelt,
    wonBelt,
    challengedBelt,
    wonBeltThisDay,
    defendedBelt,
    tiedWhileHolding,
    lostBelt,
    offDay,
    failedChallenge,
    isUpcomingTitleBout,
    isUncertain,
    isWinOrDefense,
    isLoss,
  }
}

/**
 * Get the set of months (YYYY-MM format) where a team played any completed game.
 * This is used to show all months a team was active, not just months with belt activity.
 * Results are cached by games array and team code for performance.
 *
 * @param games - All games to search through
 * @param teamCode - The team code to find active months for
 * @param franchises - Franchise info for matching team codes across relocations
 * @returns Set of month keys in YYYY-MM format
 */
export function getActiveMonthsForTeam(
  games: Game[],
  teamCode: string,
  franchises: FranchiseInfo[]
): Set<string> {
  // Check cache first
  let teamCache = activeMonthsCache.get(games)
  if (!teamCache) {
    teamCache = new Map()
    activeMonthsCache.set(games, teamCache)
  }

  const cached = teamCache.get(teamCode)
  if (cached) return cached

  // Build set of all team codes in the franchise lineage for faster lookup
  const franchiseCodes = new Set(getAllFranchiseAbbrs(teamCode, franchises))

  const activeMonths = new Set<string>()

  games.forEach((game) => {
    // Use direct Set lookup instead of isSameFranchise for each game
    const teamPlayed = franchiseCodes.has(game.homeTeam) || franchiseCodes.has(game.awayTeam)
    if (teamPlayed && isGameCompleted(game)) {
      const [y, m] = game.date.split('-').map(Number)
      const monthKey = `${y}-${String(m).padStart(2, '0')}`
      activeMonths.add(monthKey)
    }
  })

  // Cache the result
  teamCache.set(teamCode, activeMonths)
  return activeMonths
}
