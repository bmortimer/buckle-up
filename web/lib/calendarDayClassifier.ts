/**
 * Calendar Day Classifier
 *
 * Pure functions for classifying a day's belt status for a selected team.
 * Extracted from BeltCalendar component for testability.
 */

import type { FranchiseInfo } from './types'
import { isSameFranchise } from './franchises'

export interface DayData {
  date: string
  holder: string
  played: boolean
  won: boolean | null
  winner?: string
  challenger?: string
  isTie?: boolean
  isUncertain?: boolean  // Day is after an unplayed title bout - outcome unknown
  isUpcomingTitleBout?: boolean  // This day has the next unplayed title bout
}

export interface DayClassification {
  // Is the selected team involved in this day at all?
  isInvolved: boolean

  // Primary states (mutually exclusive for display purposes)
  heldBelt: boolean        // Team held the belt at start of day
  wonBelt: boolean         // Team won the belt from another team
  challengedBelt: boolean  // Team challenged for the belt (completed game only)

  // Detailed outcomes (for display logic)
  wonBeltThisDay: boolean    // Won belt from another team (bright color)
  defendedBelt: boolean      // Held belt and won (bright color)
  tiedWhileHolding: boolean  // Held belt and tied (dim color, belt stays)
  lostBelt: boolean          // Held belt and lost (transparent with X)
  offDay: boolean            // Held belt, no game (dim color)
  failedChallenge: boolean   // Challenged and lost or tied (tan color)
  isUpcomingTitleBout: boolean  // Has upcoming unplayed game as belt holder (show "?")
  isUncertain: boolean       // Day is after an unplayed title bout - outcome unknown

  // Aggregates for styling
  isWinOrDefense: boolean    // Bright team color
  isLoss: boolean            // Transparent with border
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
  // Check if selected team is involved: held belt, won belt, OR challenged for belt
  // Use franchise matching to include historical team codes (UTA/SAS for LVA)
  const heldBelt = Boolean(dayData.holder && isSameFranchise(dayData.holder, selectedTeam, franchises))
  const wonBelt = Boolean(dayData.winner && isSameFranchise(dayData.winner, selectedTeam, franchises) && !heldBelt)

  // Only count as challenged if the game was actually played
  // Unplayed games where team would be challenger should not show as involved
  const challengedBelt = Boolean(
    dayData.challenger &&
    isSameFranchise(dayData.challenger, selectedTeam, franchises) &&
    !heldBelt &&
    !wonBelt &&
    dayData.played
  )

  const isInvolved = heldBelt || wonBelt || challengedBelt

  // Detailed outcomes
  const wonBeltThisDay = wonBelt && dayData.played
  const defendedBelt = heldBelt && dayData.played && dayData.won === true
  const tiedWhileHolding = heldBelt && dayData.played && Boolean(dayData.isTie)
  const lostBelt = heldBelt && dayData.played && dayData.won === false
  const offDay = heldBelt && !dayData.played && !dayData.isUpcomingTitleBout && !dayData.isUncertain
  const failedChallenge = challengedBelt && dayData.played  // Both tie and loss when challenging
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
