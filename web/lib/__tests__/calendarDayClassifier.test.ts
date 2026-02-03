import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { classifyDayForTeam, getActiveMonthsForTeam, type DayData } from '../calendarDayClassifier'
import { parseFranchisesCSV } from '../franchises'
import type { Game } from '../types'

// Load test fixtures
const wnbaFixture = readFileSync(
  join(__dirname, 'fixtures/wnba-franchises-test.csv'),
  'utf-8'
)
const franchises = parseFranchisesCSV(wnbaFixture)

describe('classifyDayForTeam', () => {
  describe('Team holding the belt', () => {
    it('should classify defended belt (holder won)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: true,
        winner: 'NYL',
        challenger: 'MIN',
      }

      const result = classifyDayForTeam(dayData, 'NYL', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(true)
      expect(result.defendedBelt).toBe(true)
      expect(result.isWinOrDefense).toBe(true)
      expect(result.isLoss).toBe(false)
      expect(result.failedChallenge).toBe(false)
    })

    it('should classify lost belt (holder lost)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: false,
        winner: 'MIN',
        challenger: 'MIN',
      }

      const result = classifyDayForTeam(dayData, 'NYL', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(true)
      expect(result.lostBelt).toBe(true)
      expect(result.isLoss).toBe(true)
      expect(result.isWinOrDefense).toBe(false)
      expect(result.failedChallenge).toBe(false)
    })

    it('should classify tie while holding (belt stays with holder)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: null,
        winner: undefined,
        challenger: 'MIN',
        isTie: true,
      }

      const result = classifyDayForTeam(dayData, 'NYL', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(true)
      expect(result.tiedWhileHolding).toBe(true)
      expect(result.isWinOrDefense).toBe(false)
      expect(result.isLoss).toBe(false)
      expect(result.failedChallenge).toBe(false)
    })

    it('should classify off day (holder has no game)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: false,
        won: null,
      }

      const result = classifyDayForTeam(dayData, 'NYL', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(true)
      expect(result.offDay).toBe(true)
      expect(result.isWinOrDefense).toBe(false)
      expect(result.isLoss).toBe(false)
      expect(result.failedChallenge).toBe(false)
    })

    it('should classify scheduled title bout (holder has unplayed game)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: false,
        won: null,
        challenger: 'MIN',
      }

      const result = classifyDayForTeam(dayData, 'NYL', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(true)
      expect(result.offDay).toBe(true)  // Treated as off day until game is played
      expect(result.isWinOrDefense).toBe(false)
      expect(result.isLoss).toBe(false)
    })
  })

  describe('Team challenging for the belt', () => {
    it('should classify failed challenge (challenger lost)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: true,  // Holder won
        winner: 'NYL',
        challenger: 'MIN',
      }

      const result = classifyDayForTeam(dayData, 'MIN', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(false)
      expect(result.wonBelt).toBe(false)
      expect(result.challengedBelt).toBe(true)
      expect(result.failedChallenge).toBe(true)
      expect(result.isWinOrDefense).toBe(false)
      expect(result.isLoss).toBe(false)  // isLoss is only for losing the belt while holding
    })

    it('should classify failed challenge on tie (challenger tied)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: null,
        winner: undefined,
        challenger: 'MIN',
        isTie: true,
      }

      const result = classifyDayForTeam(dayData, 'MIN', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.challengedBelt).toBe(true)
      expect(result.failedChallenge).toBe(true)
      expect(result.isWinOrDefense).toBe(false)
    })

    it('should NOT classify as involved for unplayed challenge game', () => {
      // This is the bug case - team would be challenger but game hasn't been played yet
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: false,
        won: null,
        challenger: 'MIN',
      }

      const result = classifyDayForTeam(dayData, 'MIN', franchises)

      // Team should NOT be considered involved - the game hasn't happened yet
      expect(result.isInvolved).toBe(false)
      expect(result.challengedBelt).toBe(false)
      expect(result.failedChallenge).toBe(false)
    })
  })

  describe('Team winning the belt', () => {
    it('should classify won belt (challenger won)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: false,  // Holder lost
        winner: 'MIN',
        challenger: 'MIN',
      }

      const result = classifyDayForTeam(dayData, 'MIN', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(false)
      expect(result.wonBelt).toBe(true)
      expect(result.wonBeltThisDay).toBe(true)
      expect(result.isWinOrDefense).toBe(true)
      expect(result.failedChallenge).toBe(false)
    })
  })

  describe('Team not involved', () => {
    it('should classify as not involved when team is neither holder nor in game', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: true,
        winner: 'NYL',
        challenger: 'MIN',
      }

      // CON is not involved in this game
      const result = classifyDayForTeam(dayData, 'CON', franchises)

      expect(result.isInvolved).toBe(false)
      expect(result.heldBelt).toBe(false)
      expect(result.wonBelt).toBe(false)
      expect(result.challengedBelt).toBe(false)
    })

    it('should classify as not involved on off day when another team holds belt', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: false,
        won: null,
      }

      const result = classifyDayForTeam(dayData, 'MIN', franchises)

      expect(result.isInvolved).toBe(false)
    })
  })

  describe('Franchise matching across relocations', () => {
    it('should match historical team code to current franchise', () => {
      // UTA -> SAS -> LVA is the same franchise
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'UTA',  // Historical team code
        played: true,
        won: true,
        winner: 'UTA',
        challenger: 'NYL',
      }

      // Selecting LVA (current franchise) should match UTA (historical)
      const result = classifyDayForTeam(dayData, 'LVA', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.heldBelt).toBe(true)
      expect(result.defendedBelt).toBe(true)
    })

    it('should match current franchise to historical team code as challenger', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: true,
        winner: 'NYL',
        challenger: 'SAS',  // Historical team code (now LVA)
      }

      // Selecting LVA (current franchise) should match SAS (historical)
      const result = classifyDayForTeam(dayData, 'LVA', franchises)

      expect(result.isInvolved).toBe(true)
      expect(result.challengedBelt).toBe(true)
      expect(result.failedChallenge).toBe(true)
    })

    it('should NOT match unplayed challenger game even with franchise matching', () => {
      // The bug case with franchise matching - still should not show as involved
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: false,
        won: null,
        challenger: 'SAS',  // Historical team code
      }

      // Selecting LVA should NOT be involved - game hasn't been played
      const result = classifyDayForTeam(dayData, 'LVA', franchises)

      expect(result.isInvolved).toBe(false)
      expect(result.challengedBelt).toBe(false)
      expect(result.failedChallenge).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle missing winner field (tie scenario)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: true,
        won: null,
        challenger: 'MIN',
        isTie: true,
        // winner is undefined
      }

      const holderResult = classifyDayForTeam(dayData, 'NYL', franchises)
      expect(holderResult.tiedWhileHolding).toBe(true)

      const challengerResult = classifyDayForTeam(dayData, 'MIN', franchises)
      expect(challengerResult.failedChallenge).toBe(true)
    })

    it('should handle missing challenger field (off day)', () => {
      const dayData: DayData = {
        date: '2024-05-14',
        holder: 'NYL',
        played: false,
        won: null,
        // challenger is undefined
      }

      const result = classifyDayForTeam(dayData, 'NYL', franchises)
      expect(result.offDay).toBe(true)
    })
  })
})

describe('getActiveMonthsForTeam', () => {
  // Helper to create a completed game
  const makeGame = (date: string, homeTeam: string, awayTeam: string): Game => ({
    date,
    homeTeam,
    awayTeam,
    homeScore: 100,
    awayScore: 95,
  })

  // Helper to create a scheduled (unplayed) game
  const makeScheduledGame = (date: string, homeTeam: string, awayTeam: string): Game => ({
    date,
    homeTeam,
    awayTeam,
    homeScore: null,
    awayScore: null,
  })

  it('should return months where team played completed games', () => {
    const games: Game[] = [
      makeGame('2024-01-15', 'NYL', 'MIN'),
      makeGame('2024-02-20', 'NYL', 'CON'),
      makeGame('2024-03-10', 'LVA', 'PHO'),
    ]

    const result = getActiveMonthsForTeam(games, 'NYL', franchises)

    expect(result.has('2024-01')).toBe(true)
    expect(result.has('2024-02')).toBe(true)
    expect(result.has('2024-03')).toBe(false) // NYL didn't play in March
    expect(result.size).toBe(2)
  })

  it('should include months where team played as away team', () => {
    const games: Game[] = [
      makeGame('2024-01-15', 'MIN', 'NYL'), // NYL is away
      makeGame('2024-02-20', 'CON', 'NYL'), // NYL is away
    ]

    const result = getActiveMonthsForTeam(games, 'NYL', franchises)

    expect(result.has('2024-01')).toBe(true)
    expect(result.has('2024-02')).toBe(true)
  })

  it('should NOT include months with only scheduled (unplayed) games', () => {
    const games: Game[] = [
      makeGame('2024-01-15', 'NYL', 'MIN'),           // Completed
      makeScheduledGame('2024-02-20', 'NYL', 'CON'),  // Scheduled only
    ]

    const result = getActiveMonthsForTeam(games, 'NYL', franchises)

    expect(result.has('2024-01')).toBe(true)
    expect(result.has('2024-02')).toBe(false) // Only scheduled game, not completed
  })

  it('should match franchise across relocations (historical team codes)', () => {
    const games: Game[] = [
      makeGame('1999-06-15', 'UTA', 'HOU'),  // Utah Starzz (now LVA)
      makeGame('2003-07-20', 'SAS', 'PHO'),  // San Antonio (now LVA)
      makeGame('2024-08-10', 'LVA', 'SEA'),  // Las Vegas Aces
    ]

    // Selecting LVA should find all franchise history
    const result = getActiveMonthsForTeam(games, 'LVA', franchises)

    expect(result.has('1999-06')).toBe(true)
    expect(result.has('2003-07')).toBe(true)
    expect(result.has('2024-08')).toBe(true)
    expect(result.size).toBe(3)
  })

  it('should return empty set for team with no games', () => {
    const games: Game[] = [
      makeGame('2024-01-15', 'NYL', 'MIN'),
      makeGame('2024-02-20', 'CON', 'PHO'),
    ]

    const result = getActiveMonthsForTeam(games, 'SEA', franchises)

    expect(result.size).toBe(0)
  })

  it('should handle team playing multiple games in same month', () => {
    const games: Game[] = [
      makeGame('2024-01-05', 'NYL', 'MIN'),
      makeGame('2024-01-10', 'NYL', 'CON'),
      makeGame('2024-01-15', 'LVA', 'NYL'),
      makeGame('2024-01-20', 'NYL', 'PHO'),
    ]

    const result = getActiveMonthsForTeam(games, 'NYL', franchises)

    expect(result.has('2024-01')).toBe(true)
    expect(result.size).toBe(1) // Should only count January once
  })

  it('should show months team was active even without belt involvement', () => {
    // This is the key test case - team plays games but never holds/challenges belt
    // The calendar should still show these months
    const games: Game[] = [
      // January: Belt holder (NYL) plays MIN - CON not involved in belt
      makeGame('2024-01-15', 'NYL', 'MIN'),
      // January: CON plays a regular game (no belt)
      makeGame('2024-01-16', 'CON', 'LVA'),
      // February: Only CON plays, no belt games at all
      makeGame('2024-02-10', 'CON', 'LVA'),
      makeGame('2024-02-15', 'MIN', 'CON'),
    ]

    const result = getActiveMonthsForTeam(games, 'CON', franchises)

    // CON should have both January and February as active months
    // even though they had no belt involvement
    expect(result.has('2024-01')).toBe(true)
    expect(result.has('2024-02')).toBe(true)
    expect(result.size).toBe(2)
  })
})
