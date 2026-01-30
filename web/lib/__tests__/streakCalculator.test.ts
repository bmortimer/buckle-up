import { describe, it, expect } from 'vitest'
import { getCurrentStreak } from '../streakCalculator'
import type { Game, FranchiseInfo } from '../types'

describe('getCurrentStreak', () => {
  const emptyFranchises: FranchiseInfo[] = []

  describe('Basic streak calculation', () => {
    it('should return 0 when no completed games', () => {
      const games: Game[] = [
        {
          date: '2026-01-30',
          homeTeam: 'TBL',
          awayTeam: 'WPG',
          homeScore: null,
          awayScore: null,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'TBL' }

      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions)
      expect(streak).toBe(0)
    })

    it('should calculate streak of 1 when team just won the belt', () => {
      const games: Game[] = [
        // FLA starts with belt, loses to TBL
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'FLA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'FLA' }

      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions)
      expect(streak).toBe(1)
    })

    it('should calculate streak of 2 when team won belt and defended once', () => {
      const games: Game[] = [
        // FLA starts with belt
        {
          date: '2026-01-24',
          homeTeam: 'UTA',
          awayTeam: 'FLA',
          homeScore: 6,
          awayScore: 1,
          isPlayoffs: false,
        },
        // UTA wins, takes belt
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
        // TBL wins, takes belt (streak = 1)
        {
          date: '2026-01-29',
          homeTeam: 'TBL',
          awayTeam: 'WPG',
          homeScore: 4,
          awayScore: 1,
          isPlayoffs: false,
        },
        // TBL defends (streak = 2)
      ]
      const champions = { '2025-26': 'FLA' }

      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions)
      expect(streak).toBe(2)
    })

    it('should calculate longer streaks correctly', () => {
      const games: Game[] = [
        // NYK starts with belt, wins 5 in a row
        { date: '2026-01-15', homeTeam: 'NYK', awayTeam: 'BOS', homeScore: 110, awayScore: 105, isPlayoffs: false },
        { date: '2026-01-17', homeTeam: 'BRK', awayTeam: 'NYK', homeScore: 98, awayScore: 102, isPlayoffs: false },
        { date: '2026-01-19', homeTeam: 'NYK', awayTeam: 'PHI', homeScore: 115, awayScore: 108, isPlayoffs: false },
        { date: '2026-01-21', homeTeam: 'MIA', awayTeam: 'NYK', homeScore: 95, awayScore: 100, isPlayoffs: false },
        { date: '2026-01-23', homeTeam: 'NYK', awayTeam: 'CHI', homeScore: 120, awayScore: 112, isPlayoffs: false },
      ]
      const champions = { '2025-26': 'NYK' }

      const streak = getCurrentStreak(games, 'NYK', emptyFranchises, champions)
      expect(streak).toBe(5)
    })
  })

  describe('Season transitions with proper season key formatting', () => {
    it('should correctly group games by season (2025-26 format) for games in January', () => {
      // This is the bug we're fixing: games in Jan 2026 should be in season "2025-26"
      const games: Game[] = [
        // FLA is 2025-26 champion, but loses to UTA early in season
        {
          date: '2026-01-13',
          homeTeam: 'UTA',
          awayTeam: 'FLA',
          homeScore: 6,
          awayScore: 1,
          isPlayoffs: false,
        },
        // UTA defends a couple times
        {
          date: '2026-01-15',
          homeTeam: 'UTA',
          awayTeam: 'CHI',
          homeScore: 4,
          awayScore: 2,
          isPlayoffs: false,
        },
        // TBL takes belt from UTA
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
        // TBL defends
        {
          date: '2026-01-29',
          homeTeam: 'TBL',
          awayTeam: 'WPG',
          homeScore: 4,
          awayScore: 1,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'FLA' }

      // Before the fix, this would return 0 because it was looking for champion "2026"
      // After the fix, it should return 2
      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions)
      expect(streak).toBe(2)
    })

    it('should correctly group games by season for games in October', () => {
      // Games in Oct 2025 should be in season "2025-26"
      const games: Game[] = [
        {
          date: '2025-10-15',
          homeTeam: 'FLA',
          awayTeam: 'BOS',
          homeScore: 5,
          awayScore: 3,
          isPlayoffs: false,
        },
        {
          date: '2025-10-17',
          homeTeam: 'FLA',
          awayTeam: 'NYR',
          homeScore: 4,
          awayScore: 2,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'FLA' }

      const streak = getCurrentStreak(games, 'FLA', emptyFranchises, champions)
      expect(streak).toBe(2)
    })

    it('should handle season boundary correctly (Sept to Oct)', () => {
      // Sept 2025 = 2024-25 season, Oct 2025 = 2025-26 season
      const games: Game[] = [
        // Late 2024-25 season (Sept 2025)
        {
          date: '2025-09-28',
          homeTeam: 'BOS',
          awayTeam: 'CHI',
          homeScore: 3,
          awayScore: 2,
          isPlayoffs: false,
        },
        // Early 2025-26 season (Oct 2025) - FLA is new champion
        {
          date: '2025-10-10',
          homeTeam: 'FLA',
          awayTeam: 'TBL',
          homeScore: 4,
          awayScore: 2,
          isPlayoffs: false,
        },
        {
          date: '2025-10-12',
          homeTeam: 'FLA',
          awayTeam: 'NYR',
          homeScore: 3,
          awayScore: 1,
          isPlayoffs: false,
        },
      ]
      const champions = {
        '2024-25': 'BOS',
        '2025-26': 'FLA',
      }

      const streak = getCurrentStreak(games, 'FLA', emptyFranchises, champions)
      expect(streak).toBe(2) // FLA's streak in new season
    })

    it('should handle streak continuing across seasons when same team is champion', () => {
      // Edge case: team held belt at end of season AND won championship
      const games: Game[] = [
        // End of 2024-25 season
        {
          date: '2025-06-15',
          homeTeam: 'BOS',
          awayTeam: 'NYR',
          homeScore: 3,
          awayScore: 2,
          isPlayoffs: false,
        },
        {
          date: '2025-06-17',
          homeTeam: 'BOS',
          awayTeam: 'TBL',
          homeScore: 4,
          awayScore: 1,
          isPlayoffs: false,
        },
        // Start of 2025-26 season (BOS is champion again)
        {
          date: '2025-10-10',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 5,
          awayScore: 2,
          isPlayoffs: false,
        },
      ]
      const champions = {
        '2024-25': 'BOS',
        '2025-26': 'BOS', // Same team
      }

      const streak = getCurrentStreak(games, 'BOS', emptyFranchises, champions)
      expect(streak).toBe(3) // Streak continues across seasons
    })

    it('should reset streak when different team is champion in new season', () => {
      const games: Game[] = [
        // End of 2024-25 season (NYK has belt)
        {
          date: '2025-04-15',
          homeTeam: 'NYK',
          awayTeam: 'BOS',
          homeScore: 110,
          awayScore: 105,
          isPlayoffs: false,
        },
        {
          date: '2025-04-17',
          homeTeam: 'NYK',
          awayTeam: 'PHI',
          homeScore: 108,
          awayScore: 102,
          isPlayoffs: false,
        },
        // Start of 2025-26 season (BOS is new champion)
        {
          date: '2025-10-22',
          homeTeam: 'BOS',
          awayTeam: 'NYK',
          homeScore: 112,
          awayScore: 108,
          isPlayoffs: false,
        },
      ]
      const champions = {
        '2024-25': 'MIA',
        '2025-26': 'BOS', // Different champion
      }

      const streakNYK = getCurrentStreak(games, 'NYK', emptyFranchises, champions)
      const streakBOS = getCurrentStreak(games, 'BOS', emptyFranchises, champions)

      expect(streakNYK).toBe(0) // NYK lost the belt
      expect(streakBOS).toBe(1) // BOS just won
    })
  })

  describe('Edge cases', () => {
    it('should return 0 for team that never had the belt', () => {
      const games: Game[] = [
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'UTA' }

      const streak = getCurrentStreak(games, 'BOS', emptyFranchises, champions)
      expect(streak).toBe(0)
    })

    it('should return 0 for team that lost the belt', () => {
      const games: Game[] = [
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'UTA' }

      const streak = getCurrentStreak(games, 'UTA', emptyFranchises, champions)
      expect(streak).toBe(0)
    })

    it('should handle games with no champion defined (fallback to first game winner)', () => {
      const games: Game[] = [
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
        {
          date: '2026-01-29',
          homeTeam: 'TBL',
          awayTeam: 'WPG',
          homeScore: 4,
          awayScore: 1,
          isPlayoffs: false,
        },
      ]
      const champions = {} // No champion defined

      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions)
      expect(streak).toBe(2) // Should use first game winner as starting holder
    })
  })

  describe('Real-world NHL scenario', () => {
    it('should correctly calculate TBL streak as 2 on 2026-01-29', () => {
      // Simplified version of the actual bug scenario
      const games: Game[] = [
        // FLA is champion, loses early in season to TOR
        {
          date: '2026-01-06',
          homeTeam: 'TOR',
          awayTeam: 'FLA',
          homeScore: 4,
          awayScore: 1,
          isPlayoffs: false,
        },
        // TOR loses to UTA
        {
          date: '2026-01-13',
          homeTeam: 'UTA',
          awayTeam: 'TOR',
          homeScore: 6,
          awayScore: 1,
          isPlayoffs: false,
        },
        // UTA has belt, plays a few more games
        {
          date: '2026-01-15',
          homeTeam: 'UTA',
          awayTeam: 'CHI',
          homeScore: 4,
          awayScore: 2,
          isPlayoffs: false,
        },
        {
          date: '2026-01-17',
          homeTeam: 'DAL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 3,
          isPlayoffs: false,
        },
        // TBL takes belt from UTA on 1/26
        {
          date: '2026-01-26',
          homeTeam: 'TBL',
          awayTeam: 'UTA',
          homeScore: 2,
          awayScore: 0,
          isPlayoffs: false,
        },
        // TBL defends against WPG on 1/29
        {
          date: '2026-01-29',
          homeTeam: 'TBL',
          awayTeam: 'WPG',
          homeScore: 4,
          awayScore: 1,
          isPlayoffs: false,
        },
      ]
      const champions = { '2025-26': 'FLA' }

      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions)
      expect(streak).toBe(2)
    })
  })
})
