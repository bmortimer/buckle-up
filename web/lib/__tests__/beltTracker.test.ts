import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  BeltTracker,
  trackAllSeasons,
  findNextTitleBout,
  findNextGameForTeam,
} from '../beltTracker'
import { parseFranchisesCSV } from '../franchises'
import type { Game, FranchiseInfo } from '../types'

// Load test fixtures
const nbaFixture = readFileSync(join(__dirname, 'fixtures/nba-franchises-test.csv'), 'utf-8')
const wnbaFixture = readFileSync(join(__dirname, 'fixtures/wnba-franchises-test.csv'), 'utf-8')
const nbaFranchises = parseFranchisesCSV(nbaFixture)
const wnbaFranchises = parseFranchisesCSV(wnbaFixture)

// Sample games for testing
const sampleGames: Game[] = [
  // NYL starts with belt, beats MIN
  {
    date: '2024-05-14',
    homeTeam: 'NYL',
    awayTeam: 'MIN',
    homeScore: 95,
    awayScore: 87,

  },
  // MIN challenges but loses (NYL retains)
  {
    date: '2024-05-15',
    homeTeam: 'MIN',
    awayTeam: 'NYL',
    homeScore: 78,
    awayScore: 82,

  },
  // NYL loses to LVA (belt changes)
  {
    date: '2024-05-17',
    homeTeam: 'NYL',
    awayTeam: 'LVA',
    homeScore: 85,
    awayScore: 89,

  },
  // LVA loses to CON (belt changes)
  {
    date: '2024-05-18',
    homeTeam: 'LVA',
    awayTeam: 'CON',
    homeScore: 88,
    awayScore: 92,

  },
]

// Games with ties for testing (ties don't occur in NBA/WNBA, but logic handles them for NHL)
const gamesWithTie: Game[] = [
  // BOS starts with belt, beats MTL
  {
    date: '2024-10-10',
    homeTeam: 'BOS',
    awayTeam: 'MTL',
    homeScore: 3,
    awayScore: 2,

  },
  // BOS ties with MTL (belt stays with BOS)
  {
    date: '2024-10-12',
    homeTeam: 'BOS',
    awayTeam: 'MTL',
    homeScore: 2,
    awayScore: 2,

  },
  // BOS beats MTL again
  {
    date: '2024-10-14',
    homeTeam: 'BOS',
    awayTeam: 'MTL',
    homeScore: 4,
    awayScore: 1,

  },
]

// Games with unplayed (scheduled) games
const gamesWithScheduled: Game[] = [
  {
    date: '2024-05-14',
    homeTeam: 'NYL',
    awayTeam: 'MIN',
    homeScore: 95,
    awayScore: 87,

  },
  // Scheduled game (no scores yet)
  {
    date: '2024-05-20',
    homeTeam: 'NYL',
    awayTeam: 'LVA',
    homeScore: null,
    awayScore: null,

  },
]

describe('BeltTracker', () => {
  describe('Basic belt tracking', () => {
    it('should initialize with starting team', () => {
      const tracker = new BeltTracker('NYL')
      expect(tracker.getCurrentHolder()).toBe('NYL')
    })

    it('should transfer belt when holder loses', () => {
      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(sampleGames, wnbaFranchises)

      // After all games: NYL -> LVA -> CON
      expect(history.summary.currentHolder).toBe('CON')
      expect(history.changes).toHaveLength(2)
      expect(history.changes[0].toTeam).toBe('LVA')
      expect(history.changes[1].toTeam).toBe('CON')
    })

    it('should not transfer belt when holder wins', () => {
      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(sampleGames.slice(0, 2), wnbaFranchises)

      // NYL won both games
      expect(history.summary.currentHolder).toBe('NYL')
      expect(history.changes).toHaveLength(0)
    })

    it('should skip unplayed games', () => {
      // Only use scheduled game (no completed games)
      const onlyScheduled: Game[] = [
        {
          date: '2024-05-20',
          homeTeam: 'NYL',
          awayTeam: 'LVA',
          homeScore: null,
          awayScore: null,
        },
      ]

      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(onlyScheduled, wnbaFranchises)

      // Belt should stay with NYL (scheduled game ignored)
      expect(history.summary.currentHolder).toBe('NYL')
      expect(history.changes).toHaveLength(0)
    })
  })

  describe('Statistics calculation', () => {
    it('should calculate correct win/loss records', () => {
      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(sampleGames, wnbaFranchises)

      const nylStats = history.summary.teams.find((t) => t.team === 'NYL')
      const lvaStats = history.summary.teams.find((t) => t.team === 'LVA')
      const minStats = history.summary.teams.find((t) => t.team === 'MIN')
      const conStats = history.summary.teams.find((t) => t.team === 'CON')

      // NYL: 2 wins, 1 loss
      expect(nylStats?.wins).toBe(2)
      expect(nylStats?.losses).toBe(1)
      expect(nylStats?.totalGames).toBe(3)

      // LVA: 1 win, 1 loss
      expect(lvaStats?.wins).toBe(1)
      expect(lvaStats?.losses).toBe(1)
      expect(lvaStats?.totalGames).toBe(2)

      // MIN: 0 wins, 2 losses
      expect(minStats?.wins).toBe(0)
      expect(minStats?.losses).toBe(2)
      expect(minStats?.totalGames).toBe(2)

      // CON: 1 win, 0 losses
      expect(conStats?.wins).toBe(1)
      expect(conStats?.losses).toBe(0)
      expect(conStats?.totalGames).toBe(1)
    })

    it('should calculate longest reign correctly', () => {
      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(sampleGames, wnbaFranchises)

      const nylStats = history.summary.teams.find((t) => t.team === 'NYL')
      // NYL won 2 consecutive games before losing
      expect(nylStats?.longestReign).toBe(2)
    })

    it('should track times held', () => {
      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(sampleGames, wnbaFranchises)

      const nylStats = history.summary.teams.find((t) => t.team === 'NYL')
      const lvaStats = history.summary.teams.find((t) => t.team === 'LVA')
      const conStats = history.summary.teams.find((t) => t.team === 'CON')

      expect(nylStats?.timesHeld).toBe(1) // Started with belt
      expect(lvaStats?.timesHeld).toBe(1) // Won it once
      expect(conStats?.timesHeld).toBe(1) // Won it once
    })

    it('should track multiple separate streaks and return longest', () => {
      const gamesMultipleStreaks: Game[] = [
        // NYL starts with belt, wins 2 games (streak = 2)
        {
          date: '2024-05-14',
          homeTeam: 'NYL',
          awayTeam: 'MIN',
          homeScore: 95,
          awayScore: 87,
      
        },
        {
          date: '2024-05-15',
          homeTeam: 'NYL',
          awayTeam: 'LVA',
          homeScore: 88,
          awayScore: 85,
      
        },
        // NYL loses to CON (streak ends at 2)
        {
          date: '2024-05-17',
          homeTeam: 'NYL',
          awayTeam: 'CON',
          homeScore: 85,
          awayScore: 89,
      
        },
        // CON wins once then loses (streak = 1)
        {
          date: '2024-05-18',
          homeTeam: 'CON',
          awayTeam: 'MIN',
          homeScore: 92,
          awayScore: 88,
      
        },
        {
          date: '2024-05-20',
          homeTeam: 'CON',
          awayTeam: 'NYL',
          homeScore: 78,
          awayScore: 82,
      
        },
        // NYL gets belt back (win that takes belt = 1), then wins 2 more (total streak = 3 for second reign)
        {
          date: '2024-05-22',
          homeTeam: 'NYL',
          awayTeam: 'MIN',
          homeScore: 90,
          awayScore: 85,
      
        },
        {
          date: '2024-05-24',
          homeTeam: 'NYL',
          awayTeam: 'LVA',
          homeScore: 88,
          awayScore: 80,
      
        },
      ]

      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(gamesMultipleStreaks, wnbaFranchises)

      const nylStats = history.summary.teams.find((t) => t.team === 'NYL')
      const conStats = history.summary.teams.find((t) => t.team === 'CON')

      // NYL had two separate streaks: 2 and 3. Longest should be 3
      expect(nylStats?.longestReign).toBe(3)
      expect(nylStats?.timesHeld).toBe(2) // Held belt twice

      // CON had one streak of 2 (win that took belt + 1 more win)
      expect(conStats?.longestReign).toBe(2)
      expect(conStats?.timesHeld).toBe(1)
    })

    it('should count the winning game that takes the belt toward new holder streak', () => {
      const gamesStreakTransfer: Game[] = [
        // NYL starts with belt, wins 2
        {
          date: '2024-05-14',
          homeTeam: 'NYL',
          awayTeam: 'MIN',
          homeScore: 95,
          awayScore: 87,
      
        },
        {
          date: '2024-05-15',
          homeTeam: 'NYL',
          awayTeam: 'LVA',
          homeScore: 88,
          awayScore: 85,
      
        },
        // LVA takes belt (this win should count toward LVA's streak)
        {
          date: '2024-05-17',
          homeTeam: 'NYL',
          awayTeam: 'LVA',
          homeScore: 85,
          awayScore: 89,
      
        },
        // LVA wins 2 more (total streak = 3 including the win that took the belt)
        {
          date: '2024-05-18',
          homeTeam: 'LVA',
          awayTeam: 'MIN',
          homeScore: 92,
          awayScore: 88,
      
        },
        {
          date: '2024-05-20',
          homeTeam: 'LVA',
          awayTeam: 'CON',
          homeScore: 90,
          awayScore: 85,
      
        },
      ]

      const tracker = new BeltTracker('NYL')
      const history = tracker.trackSeason(gamesStreakTransfer, wnbaFranchises)

      const lvaStats = history.summary.teams.find((t) => t.team === 'LVA')

      // LVA's streak should be 3: the win that took the belt + 2 more wins
      expect(lvaStats?.longestReign).toBe(3)
      expect(lvaStats?.wins).toBe(3)
    })
  })

  describe('Tie handling', () => {
    it('should not transfer belt on tie when holder is home', () => {
      const tracker = new BeltTracker('BOS')
      const history = tracker.trackSeason(gamesWithTie, nbaFranchises)

      // Belt should stay with BOS despite tie
      expect(history.summary.currentHolder).toBe('BOS')
      expect(history.changes).toHaveLength(0)
    })

    it('should not transfer belt on tie when holder is away', () => {
      const gamesAwayTie: Game[] = [
        // MTL starts with belt, wins on the road
        {
          date: '1969-10-11',
          homeTeam: 'LAK',
          awayTeam: 'MTL',
          homeScore: 1,
          awayScore: 5,
      
        },
        // MTL ties on the road (belt should stay with MTL)
        {
          date: '1969-10-15',
          homeTeam: 'TOR',
          awayTeam: 'MTL',
          homeScore: 2,
          awayScore: 2,
      
        },
      ]

      const tracker = new BeltTracker('MTL')
      const history = tracker.trackSeason(gamesAwayTie, nbaFranchises)

      // Belt should stay with MTL despite tie
      expect(history.summary.currentHolder).toBe('MTL')
      expect(history.changes).toHaveLength(0)
    })

    it('should count ties correctly in records', () => {
      const tracker = new BeltTracker('BOS')
      const history = tracker.trackSeason(gamesWithTie, nbaFranchises)

      const bosStats = history.summary.teams.find((t) => t.team === 'BOS')
      const mtlStats = history.summary.teams.find((t) => t.team === 'MTL')

      // BOS: 2 wins, 0 losses, 1 tie
      expect(bosStats?.wins).toBe(2)
      expect(bosStats?.losses).toBe(0)
      expect(bosStats?.ties).toBe(1)

      // MTL: 0 wins, 2 losses, 1 tie
      expect(mtlStats?.wins).toBe(0)
      expect(mtlStats?.losses).toBe(2)
      expect(mtlStats?.ties).toBe(1)
    })

    it('should not break streak on tie', () => {
      const tracker = new BeltTracker('BOS')
      const history = tracker.trackSeason(gamesWithTie, nbaFranchises)

      const bosStats = history.summary.teams.find((t) => t.team === 'BOS')
      // BOS won twice with a tie in between - ties don't break streaks
      // Note: longestReign tracks consecutive WINS, not games
      expect(bosStats?.longestReign).toBe(2)
    })

    it('should not add ties to streak count', () => {
      const gamesWithMultipleTies: Game[] = [
        // BOS starts with belt, wins 3 times
        {
          date: '2024-10-10',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 3,
          awayScore: 2,
      
        },
        {
          date: '2024-10-12',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 4,
          awayScore: 1,
      
        },
        {
          date: '2024-10-14',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 3,
          awayScore: 1,
      
        },
        // Then ties twice
        {
          date: '2024-10-16',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 2,
          awayScore: 2,
      
        },
        {
          date: '2024-10-18',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 1,
          awayScore: 1,
      
        },
        // Then wins again
        {
          date: '2024-10-20',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 5,
          awayScore: 3,
      
        },
      ]

      const tracker = new BeltTracker('BOS')
      const history = tracker.trackSeason(gamesWithMultipleTies, nbaFranchises)

      const bosStats = history.summary.teams.find((t) => t.team === 'BOS')
      // BOS won 4 times total (3 + 1 after ties), ties don't count toward streak
      // Streak should be 4 consecutive WINS (ties don't reset or increment)
      expect(bosStats?.wins).toBe(4)
      expect(bosStats?.ties).toBe(2)
      expect(bosStats?.losses).toBe(0)
      expect(bosStats?.longestReign).toBe(4)
      expect(bosStats?.totalGames).toBe(6) // 4 wins + 2 ties
    })

    it('should handle ties at start of belt holding period', () => {
      const gamesStartWithTie: Game[] = [
        // BOS starts with belt, immediately ties
        {
          date: '2024-10-10',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 2,
          awayScore: 2,
      
        },
        // Then wins twice
        {
          date: '2024-10-12',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 3,
          awayScore: 1,
      
        },
        {
          date: '2024-10-14',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 4,
          awayScore: 2,
      
        },
      ]

      const tracker = new BeltTracker('BOS')
      const history = tracker.trackSeason(gamesStartWithTie, nbaFranchises)

      const bosStats = history.summary.teams.find((t) => t.team === 'BOS')
      // Streak should be 2 (only the wins count)
      expect(bosStats?.wins).toBe(2)
      expect(bosStats?.ties).toBe(1)
      expect(bosStats?.longestReign).toBe(2)
    })

    it('should handle ties at end of belt holding period', () => {
      const gamesEndWithTie: Game[] = [
        // BOS starts with belt, wins 3 times
        {
          date: '2024-10-10',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 3,
          awayScore: 2,
      
        },
        {
          date: '2024-10-12',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 4,
          awayScore: 1,
      
        },
        {
          date: '2024-10-14',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 3,
          awayScore: 1,
      
        },
        // Ends with tie (season ends)
        {
          date: '2024-10-16',
          homeTeam: 'BOS',
          awayTeam: 'MTL',
          homeScore: 2,
          awayScore: 2,
      
        },
      ]

      const tracker = new BeltTracker('BOS')
      const history = tracker.trackSeason(gamesEndWithTie, nbaFranchises)

      const bosStats = history.summary.teams.find((t) => t.team === 'BOS')
      // Final streak should be recorded as 3 wins (tie at end doesn't add to it)
      expect(bosStats?.wins).toBe(3)
      expect(bosStats?.ties).toBe(1)
      expect(bosStats?.longestReign).toBe(3)
      expect(history.summary.currentHolder).toBe('BOS') // Belt stays with BOS
    })
  })

  describe('Franchise lineage handling', () => {
    it('should recognize same franchise across relocations', () => {
      const games: Game[] = [
        // UTA (old abbreviation) starts with belt
        {
          date: '2003-06-10',
          homeTeam: 'UTA',
          awayTeam: 'MIN',
          homeScore: 85,
          awayScore: 80,
      
        },
        // SAS (relocated team) plays next game
        {
          date: '2003-06-12',
          homeTeam: 'SAS',
          awayTeam: 'NYL',
          homeScore: 90,
          awayScore: 87,
      
        },
      ]

      const tracker = new BeltTracker('UTA')
      const history = tracker.trackSeason(games, wnbaFranchises)

      // Should recognize UTA and SAS as same franchise
      // No changes because SAS is same franchise as UTA
      expect(history.changes).toHaveLength(0)
      // Current holder stays as UTA since that's what tracker has internally
      // (the belt doesn't "change hands" when franchise relocates)
      expect(history.summary.currentHolder).toBe('UTA')
    })
  })
})

describe('trackAllSeasons', () => {
  it('should track belt across multiple seasons', () => {
    const season1Games: Game[] = [
      {
        date: '2023-05-14',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: 95,
        awayScore: 87,
    
      },
      {
        date: '2023-05-15',
        homeTeam: 'NYL',
        awayTeam: 'LVA',
        homeScore: 85,
        awayScore: 89,
    
      },
    ]

    const season2Games: Game[] = [
      {
        date: '2024-05-14',
        homeTeam: 'CON',
        awayTeam: 'MIN',
        homeScore: 92,
        awayScore: 88,
    
      },
    ]

    const seasonsData = [
      { season: '2023', games: season1Games },
      { season: '2024', games: season2Games },
    ]

    const champions = {
      '2023': 'NYL', // NYL is champion for 2023
      '2024': 'CON', // CON is champion for 2024
    }

    const history = trackAllSeasons(seasonsData, wnbaFranchises, champions)

    expect(history.season).toBe('All-Time')
    // Changes: season1 start + 1 belt loss in season1 + season2 start = 3
    expect(history.changes).toHaveLength(3)
    expect(history.summary.currentHolder).toBe('CON')

    // Verify season start markers are present
    const seasonStarts = history.changes.filter((c) => c.reason === 'start')
    expect(seasonStarts).toHaveLength(2)
    expect(seasonStarts[0].toTeam).toBe('NYL') // 2023 champion
    expect(seasonStarts[1].toTeam).toBe('CON') // 2024 champion
  })

  it('should merge stats across seasons', () => {
    const season1Games: Game[] = [
      {
        date: '2023-05-14',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: 95,
        awayScore: 87,
    
      },
    ]

    const season2Games: Game[] = [
      {
        date: '2024-05-14',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: 90,
        awayScore: 85,
    
      },
    ]

    const seasonsData = [
      { season: '2023', games: season1Games },
      { season: '2024', games: season2Games },
    ]

    const champions = {
      '2023': 'NYL',
      '2024': 'NYL',
    }

    const history = trackAllSeasons(seasonsData, wnbaFranchises, champions)

    const nylStats = history.summary.teams.find((t) => t.team === 'NYL')
    const minStats = history.summary.teams.find((t) => t.team === 'MIN')

    // NYL should have 2 wins total
    expect(nylStats?.wins).toBe(2)
    expect(nylStats?.totalGames).toBe(2)

    // MIN should have 2 losses total
    expect(minStats?.losses).toBe(2)
    expect(minStats?.totalGames).toBe(2)
  })

  it('should merge by franchise when option enabled', () => {
    const gamesWithOldAbbr: Game[] = [
      {
        date: '2003-05-14',
        homeTeam: 'UTA', // Old abbreviation
        awayTeam: 'MIN',
        homeScore: 85,
        awayScore: 80,
    
      },
    ]

    const gamesWithNewAbbr: Game[] = [
      {
        date: '2018-05-14',
        homeTeam: 'LVA', // Current abbreviation
        awayTeam: 'MIN',
        homeScore: 90,
        awayScore: 85,
    
      },
    ]

    const seasonsData = [
      { season: '2003', games: gamesWithOldAbbr },
      { season: '2018', games: gamesWithNewAbbr },
    ]

    const champions = {
      '2003': 'UTA',
      '2018': 'LVA',
    }

    const history = trackAllSeasons(seasonsData, wnbaFranchises, champions, {
      mergeByFranchise: true,
    })

    // Should have stats for LVA (current franchise), not separate UTA and LVA
    const lvaStats = history.summary.teams.find((t) => t.team === 'LVA')
    const utaStats = history.summary.teams.find((t) => t.team === 'UTA')

    expect(lvaStats).toBeDefined()
    expect(utaStats).toBeUndefined() // Should be merged into LVA
    expect(lvaStats?.wins).toBe(2) // Combined wins from both seasons
    expect(lvaStats?.totalGames).toBe(2)
  })
})

describe('findNextTitleBout', () => {
  it('should find next scheduled game for belt holder', () => {
    const futureGames: Game[] = [
      {
        date: '2025-05-14',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: null,
        awayScore: null,
    
      },
      {
        date: '2025-05-15',
        homeTeam: 'LVA',
        awayTeam: 'CON',
        homeScore: null,
        awayScore: null,
    
      },
    ]

    const nextBout = findNextTitleBout(futureGames, 'NYL', wnbaFranchises)
    expect(nextBout).toBeDefined()
    expect(nextBout?.date).toBe('2025-05-14')
    expect(nextBout?.homeTeam).toBe('NYL')
  })

  it('should return null if no scheduled games', () => {
    const nextBout = findNextTitleBout([], 'NYL', wnbaFranchises)
    expect(nextBout).toBeNull()
  })

  it('should recognize franchise across relocations', () => {
    const futureGames: Game[] = [
      {
        date: '2025-05-14',
        homeTeam: 'LVA',
        awayTeam: 'MIN',
        homeScore: null,
        awayScore: null,
    
      },
    ]

    // Search for UTA (old abbreviation), should find LVA game
    const nextBout = findNextTitleBout(futureGames, 'UTA', wnbaFranchises)
    expect(nextBout).toBeDefined()
    expect(nextBout?.homeTeam).toBe('LVA')
  })
})

describe('findNextGameForTeam', () => {
  it('should find next scheduled game for a specific team', () => {
    const futureGames: Game[] = [
      {
        date: '2025-05-14',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: null,
        awayScore: null,
    
      },
      {
        date: '2025-05-15',
        homeTeam: 'LVA',
        awayTeam: 'MIN',
        homeScore: null,
        awayScore: null,
    
      },
    ]

    const nextGame = findNextGameForTeam(futureGames, 'MIN', wnbaFranchises)
    expect(nextGame).toBeDefined()
    expect(nextGame?.date).toBe('2025-05-14')
    expect(nextGame?.awayTeam).toBe('MIN')
  })

  it('should skip completed games', () => {
    const mixedGames: Game[] = [
      {
        date: '2024-05-14',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: 95,
        awayScore: 87,
    
      },
      {
        date: '2025-05-15',
        homeTeam: 'NYL',
        awayTeam: 'MIN',
        homeScore: null,
        awayScore: null,
    
      },
    ]

    const nextGame = findNextGameForTeam(mixedGames, 'NYL', wnbaFranchises)
    expect(nextGame?.date).toBe('2025-05-15')
  })
})
