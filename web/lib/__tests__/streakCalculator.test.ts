import { describe, it, expect } from 'vitest'
import { getCurrentStreak } from '../streakCalculator'
import type { Game, FranchiseInfo, League } from '../types'

describe('getCurrentStreak', () => {
  const emptyFranchises: FranchiseInfo[] = []
  const nhl: League = 'nhl'
  const nba: League = 'nba'
  const wnba: League = 'wnba'

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
        {
          date: '2026-01-15',
          homeTeam: 'NYK',
          awayTeam: 'BOS',
          homeScore: 110,
          awayScore: 105,
          isPlayoffs: false,
        },
        {
          date: '2026-01-17',
          homeTeam: 'BRK',
          awayTeam: 'NYK',
          homeScore: 98,
          awayScore: 102,
          isPlayoffs: false,
        },
        {
          date: '2026-01-19',
          homeTeam: 'NYK',
          awayTeam: 'PHI',
          homeScore: 115,
          awayScore: 108,
          isPlayoffs: false,
        },
        {
          date: '2026-01-21',
          homeTeam: 'MIA',
          awayTeam: 'NYK',
          homeScore: 95,
          awayScore: 100,
          isPlayoffs: false,
        },
        {
          date: '2026-01-23',
          homeTeam: 'NYK',
          awayTeam: 'CHI',
          homeScore: 120,
          awayScore: 112,
          isPlayoffs: false,
        },
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

      const streak = getCurrentStreak(games, 'TBL', emptyFranchises, champions, nhl)
      expect(streak).toBe(2)
    })
  })

  describe('WNBA season key format (single year)', () => {
    it('should use single year format for WNBA seasons', () => {
      // WNBA uses "2026" not "2025-26" format
      const games: Game[] = [
        // LVA is 2026 champion, defends the belt
        {
          date: '2026-05-20',
          homeTeam: 'LVA',
          awayTeam: 'NYL',
          homeScore: 85,
          awayScore: 78,
          isPlayoffs: false,
        },
        {
          date: '2026-05-24',
          homeTeam: 'SEA',
          awayTeam: 'LVA',
          homeScore: 72,
          awayScore: 80,
          isPlayoffs: false,
        },
      ]
      const champions = { '2026': 'LVA' }

      const streak = getCurrentStreak(games, 'LVA', emptyFranchises, champions, wnba)
      expect(streak).toBe(2)
    })

    it('should reset streak when WNBA champion differs from previous belt holder', () => {
      // Common case: team won championship but didn't hold belt at end of regular season
      const games: Game[] = [
        // End of 2025 season - NYL holds the belt
        {
          date: '2025-09-10',
          homeTeam: 'NYL',
          awayTeam: 'CHI',
          homeScore: 90,
          awayScore: 82,
          isPlayoffs: false,
        },
        {
          date: '2025-09-14',
          homeTeam: 'NYL',
          awayTeam: 'LVA',
          homeScore: 88,
          awayScore: 85,
          isPlayoffs: false,
        },
        // Start of 2026 season - LVA is champion (won 2025 championship)
        // but NYL had the belt at end of 2025 regular season
        {
          date: '2026-05-16',
          homeTeam: 'LVA',
          awayTeam: 'PHO',
          homeScore: 92,
          awayScore: 84,
          isPlayoffs: false,
        },
        {
          date: '2026-05-20',
          homeTeam: 'LVA',
          awayTeam: 'SEA',
          homeScore: 88,
          awayScore: 79,
          isPlayoffs: false,
        },
      ]
      const champions = {
        '2025': 'NYL', // NYL was 2024 champion, started 2025 with belt
        '2026': 'LVA', // LVA won 2025 championship, starts 2026 with belt
      }

      // LVA's streak should be 2 (new season, they're champion)
      // NYL's belt streak from 2025 doesn't carry over because they didn't win championship
      const streakLVA = getCurrentStreak(games, 'LVA', emptyFranchises, champions, wnba)
      expect(streakLVA).toBe(2)
    })

    it('should continue streak when WNBA champion also held belt at season end', () => {
      // Edge case (~10% of time): team both held belt AND won championship
      // This is the LVA 2026 scenario - they held belt at end of 2025 AND won championship
      const games: Game[] = [
        // End of 2025 season - LVA holds the belt and wins championship
        {
          date: '2025-08-25',
          homeTeam: 'LVA',
          awayTeam: 'NYL',
          homeScore: 95,
          awayScore: 88,
          isPlayoffs: false,
        },
        {
          date: '2025-08-28',
          homeTeam: 'SEA',
          awayTeam: 'LVA',
          homeScore: 78,
          awayScore: 85,
          isPlayoffs: false,
        },
        {
          date: '2025-09-01',
          homeTeam: 'LVA',
          awayTeam: 'CHI',
          homeScore: 92,
          awayScore: 84,
          isPlayoffs: false,
        },
        // ... LVA wins championship (playoffs happen, they win)
        // Start of 2026 season - LVA is champion again, streak should continue
        {
          date: '2026-05-16',
          homeTeam: 'LVA',
          awayTeam: 'PHO',
          homeScore: 88,
          awayScore: 80,
          isPlayoffs: false,
        },
        {
          date: '2026-05-20',
          homeTeam: 'CON',
          awayTeam: 'LVA',
          homeScore: 75,
          awayScore: 82,
          isPlayoffs: false,
        },
      ]
      const champions = {
        '2025': 'LVA', // LVA was 2024 champion, started 2025 with belt
        '2026': 'LVA', // LVA won 2025 championship too, starts 2026 with belt
      }

      // LVA's streak should be 5 (3 from end of 2025 + 2 in 2026)
      // because they held the belt at end of 2025 AND won the championship
      const streak = getCurrentStreak(games, 'LVA', emptyFranchises, champions, wnba)
      expect(streak).toBe(5)
    })

    it('should handle multi-season WNBA streak with championship continuity', () => {
      // Real-world LVA scenario: won 2023, 2024 championships
      // Held belt going into 2024, kept it, won championship again
      const games: Game[] = [
        // Late 2024 season - LVA defending
        {
          date: '2024-09-05',
          homeTeam: 'LVA',
          awayTeam: 'NYL',
          homeScore: 88,
          awayScore: 80,
          isPlayoffs: false,
        },
        {
          date: '2024-09-08',
          homeTeam: 'LVA',
          awayTeam: 'MIN',
          homeScore: 92,
          awayScore: 85,
          isPlayoffs: false,
        },
        {
          date: '2024-09-12',
          homeTeam: 'SEA',
          awayTeam: 'LVA',
          homeScore: 79,
          awayScore: 86,
          isPlayoffs: false,
        },
        // 2025 season starts - LVA is 2024 champion
        {
          date: '2025-05-17',
          homeTeam: 'LVA',
          awayTeam: 'PHO',
          homeScore: 90,
          awayScore: 82,
          isPlayoffs: false,
        },
        {
          date: '2025-05-21',
          homeTeam: 'DAL',
          awayTeam: 'LVA',
          homeScore: 75,
          awayScore: 88,
          isPlayoffs: false,
        },
      ]
      const champions = {
        '2024': 'LVA', // LVA was 2023 champion
        '2025': 'LVA', // LVA won 2024 championship
      }

      // Streak should continue: 3 from 2024 + 2 from 2025 = 5
      const streak = getCurrentStreak(games, 'LVA', emptyFranchises, champions, wnba)
      expect(streak).toBe(5)
    })
  })
})
