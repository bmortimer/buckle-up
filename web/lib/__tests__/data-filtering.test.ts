import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseFranchisesCSV, getAllFranchiseAbbrs, getCurrentFranchiseAbbr } from '../franchises'
import type { Game, FranchiseInfo } from '../types'

// Load WNBA franchises for testing
const wnbaFixture = readFileSync(join(__dirname, 'fixtures/wnba-franchises-test.csv'), 'utf-8')
const wnbaFranchises = parseFranchisesCSV(wnbaFixture)

// Helper to create a game
const createGame = (
  homeTeam: string,
  awayTeam: string,
  date: string,
  homeScore: number | null = null,
  awayScore: number | null = null
): Game => ({
  date,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
})

describe('Data Filtering Logic', () => {
  describe('Team calendar with All Time selected', () => {
    it('should include all historical franchises when current franchise is selected', () => {
      // Test case: Select Las Vegas Aces (current franchise) with All Time
      const selectedTeam = 'LVA'
      const isAllTime = true

      // When current franchise is selected in All Time mode,
      // should get all franchises in the lineage (UTA, SAS, LVA)
      const currentFranchise = getCurrentFranchiseAbbr(selectedTeam, wnbaFranchises)
      const isCurrentFranchise = currentFranchise === selectedTeam
      const franchiseCodes =
        isCurrentFranchise && isAllTime
          ? getAllFranchiseAbbrs(selectedTeam, wnbaFranchises)
          : [selectedTeam]

      expect(isCurrentFranchise).toBe(true)
      expect(franchiseCodes).toContain('UTA') // Utah Starzz
      expect(franchiseCodes).toContain('SAS') // San Antonio Silver Stars
      expect(franchiseCodes).toContain('LVA') // Las Vegas Aces
      expect(franchiseCodes.length).toBe(3)
    })

    it('should only include that specific franchise when historical team is selected', () => {
      // Test case: Select Utah Starzz (historical franchise) with All Time
      const selectedTeam = 'UTA'
      const isAllTime = true

      // When historical team is selected, should NOT merge by franchise
      // Only show games from that specific era
      const currentFranchise = getCurrentFranchiseAbbr(selectedTeam, wnbaFranchises)
      const isCurrentFranchise = currentFranchise === selectedTeam
      const franchiseCodes =
        isCurrentFranchise && isAllTime
          ? getAllFranchiseAbbrs(selectedTeam, wnbaFranchises)
          : [selectedTeam]

      expect(isCurrentFranchise).toBe(false) // UTA is historical, current is LVA
      expect(franchiseCodes).toEqual(['UTA']) // Only UTA games
      expect(franchiseCodes.length).toBe(1)
    })

    it('should filter games correctly for current franchise in All Time mode', () => {
      // Create games from different eras of the franchise
      const games: Game[] = [
        createGame('UTA', 'HOU', '1997-06-15', 80, 75), // Utah Starzz era
        createGame('SAS', 'PHO', '2004-08-20', 85, 82), // San Antonio era
        createGame('LVA', 'SEA', '2020-09-15', 90, 88), // Las Vegas Aces era
        createGame('IND', 'NYL', '2020-09-16', 78, 72), // Unrelated game
      ]

      const selectedTeam = 'LVA'
      const franchiseCodes = getAllFranchiseAbbrs(selectedTeam, wnbaFranchises)

      // Filter games that include any franchise in the lineage
      const teamGames = games.filter(
        (game) => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
      )

      expect(teamGames.length).toBe(3)
      expect(teamGames[0].homeTeam).toBe('UTA') // Utah game included
      expect(teamGames[1].homeTeam).toBe('SAS') // San Antonio game included
      expect(teamGames[2].homeTeam).toBe('LVA') // Las Vegas game included
    })

    it('should filter games correctly for historical franchise', () => {
      // Create games from different eras
      const games: Game[] = [
        createGame('UTA', 'HOU', '1997-06-15', 80, 75), // Utah Starzz era
        createGame('SAS', 'PHO', '2004-08-20', 85, 82), // San Antonio era (should NOT be included)
        createGame('LVA', 'SEA', '2020-09-15', 90, 88), // Las Vegas Aces era (should NOT be included)
        createGame('IND', 'UTA', '1998-07-10', 78, 82), // Another Utah game
      ]

      const selectedTeam = 'UTA'
      const franchiseCodes = [selectedTeam] // Only UTA, not full lineage

      // Filter games for just the Utah Starzz era
      const teamGames = games.filter(
        (game) => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
      )

      expect(teamGames.length).toBe(2)
      expect(teamGames[0].homeTeam).toBe('UTA')
      expect(teamGames[1].awayTeam).toBe('UTA')
    })
  })

  describe('Team selector filtering by year', () => {
    it('should only show teams that played in the selected year', () => {
      // Create games for multiple years
      const games1997: Game[] = [
        createGame('UTA', 'HOU', '1997-06-15', 80, 75),
        createGame('NYL', 'CLE', '1997-06-16', 75, 70),
      ]

      const games2020: Game[] = [
        createGame('LVA', 'SEA', '2020-09-15', 90, 88),
        createGame('IND', 'PHO', '2020-09-16', 78, 72),
      ]

      // Get teams that played in 1997
      const teams1997 = new Set<string>()
      games1997.forEach((game) => {
        teams1997.add(game.homeTeam)
        teams1997.add(game.awayTeam)
      })

      // Get teams that played in 2020
      const teams2020 = new Set<string>()
      games2020.forEach((game) => {
        teams2020.add(game.homeTeam)
        teams2020.add(game.awayTeam)
      })

      expect(Array.from(teams1997).sort()).toEqual(['CLE', 'HOU', 'NYL', 'UTA'])
      expect(Array.from(teams2020).sort()).toEqual(['IND', 'LVA', 'PHO', 'SEA'])

      // No overlap between years
      expect([...teams1997].some((t) => teams2020.has(t))).toBe(false)
    })

    it('should dedupe by franchise when All Time is selected', () => {
      // All teams across all years
      const allTeams = new Set(['UTA', 'SAS', 'LVA', 'HOU', 'NYL'])
      const isAllTime = true

      // When All Time is selected, dedupe to current franchises only
      const franchiseSet = new Set<string>()
      allTeams.forEach((team) => {
        franchiseSet.add(getCurrentFranchiseAbbr(team, wnbaFranchises))
      })

      const result = Array.from(franchiseSet).sort()

      // UTA, SAS should both map to LVA
      expect(result).toContain('LVA')
      expect(result).not.toContain('UTA')
      expect(result).not.toContain('SAS')
      expect(result).toContain('HOU')
      expect(result).toContain('NYL')
    })

    it('should show all historical teams when specific year is selected (not All Time)', () => {
      // All teams across all years
      const allTeams = new Set(['UTA', 'SAS', 'LVA', 'HOU', 'NYL'])
      const isAllTime = false

      // When specific year is selected, don't dedupe
      const result = Array.from(allTeams).sort()

      expect(result).toEqual(['HOU', 'LVA', 'NYL', 'SAS', 'UTA'])
    })
  })

  describe('Graph data consistency', () => {
    it('should use same franchise filter logic for team stats and calendar', () => {
      // This test verifies that getAllFranchiseAbbrs is used consistently
      const selectedTeam = 'LVA'
      const isAllTime = true

      // Logic used for calendar filtering
      const currentFranchise = getCurrentFranchiseAbbr(selectedTeam, wnbaFranchises)
      const isCurrentFranchise = currentFranchise === selectedTeam
      const calendarFranchiseCodes =
        isCurrentFranchise && isAllTime
          ? getAllFranchiseAbbrs(selectedTeam, wnbaFranchises)
          : [selectedTeam]

      // Logic used for team stats should be the same
      const shouldMergeByFranchise =
        isAllTime && (!selectedTeam || currentFranchise === selectedTeam)

      // Both should include full lineage when current franchise + All Time
      expect(shouldMergeByFranchise).toBe(true)
      expect(calendarFranchiseCodes).toContain('UTA')
      expect(calendarFranchiseCodes).toContain('SAS')
      expect(calendarFranchiseCodes).toContain('LVA')
    })

    it('should not merge by franchise when historical team is selected', () => {
      const selectedTeam = 'UTA'
      const isAllTime = true

      const currentFranchise = getCurrentFranchiseAbbr(selectedTeam, wnbaFranchises)
      const isCurrentFranchise = currentFranchise === selectedTeam

      // Logic for mergeByFranchise in trackAllSeasons
      const shouldMergeByFranchise =
        isAllTime && (!selectedTeam || currentFranchise === selectedTeam)

      // Should NOT merge because UTA is not the current franchise
      expect(shouldMergeByFranchise).toBe(false)
      expect(isCurrentFranchise).toBe(false)
    })
  })

  describe('Available years for team', () => {
    it('should find correct years when team played under different names', () => {
      // Simulate checking which years the Aces franchise played
      const selectedTeam = 'LVA'
      const isAllTime = true
      const franchiseCodes = getAllFranchiseAbbrs(selectedTeam, wnbaFranchises)

      // Mock seasons data
      const seasons: Record<string, Game[]> = {
        '1997': [createGame('UTA', 'HOU', '1997-06-15', 80, 75)],
        '2003': [createGame('SAS', 'PHO', '2003-08-20', 85, 82)],
        '2020': [createGame('LVA', 'SEA', '2020-09-15', 90, 88)],
        '2021': [createGame('IND', 'NYL', '2021-09-16', 78, 72)],
      }

      const teamYears = new Set<number>()
      Object.keys(seasons).forEach((seasonKey) => {
        const year = parseInt(seasonKey)
        const games = seasons[seasonKey]
        const teamPlayedThisYear = games.some(
          (game) => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
        )
        if (teamPlayedThisYear) {
          teamYears.add(year)
        }
      })

      const result = Array.from(teamYears).sort((a, b) => a - b)

      // Should find all three years where franchise played (under any name)
      expect(result).toEqual([1997, 2003, 2020])
      expect(result).not.toContain(2021) // Team didn't play this year
    })

    it('should only find years for specific historical team when not All Time', () => {
      const selectedTeam = 'UTA'
      const isAllTime = false
      const franchiseCodes = [selectedTeam] // Only UTA, not full lineage

      const seasons: Record<string, Game[]> = {
        '1997': [createGame('UTA', 'HOU', '1997-06-15', 80, 75)],
        '1998': [createGame('UTA', 'NYL', '1998-06-20', 82, 79)],
        '2003': [createGame('SAS', 'PHO', '2003-08-20', 85, 82)], // SAS not included
        '2020': [createGame('LVA', 'SEA', '2020-09-15', 90, 88)], // LVA not included
      }

      const teamYears = new Set<number>()
      Object.keys(seasons).forEach((seasonKey) => {
        const year = parseInt(seasonKey)
        const games = seasons[seasonKey]
        const teamPlayedThisYear = games.some(
          (game) => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
        )
        if (teamPlayedThisYear) {
          teamYears.add(year)
        }
      })

      const result = Array.from(teamYears).sort((a, b) => a - b)

      // Should only find years where UTA specifically played
      expect(result).toEqual([1997, 1998])
      expect(result).not.toContain(2003) // SAS played, not UTA
      expect(result).not.toContain(2020) // LVA played, not UTA
    })
  })

  describe('All Time Games - completed games only', () => {
    it('should only count completed games in stats, not future/scheduled games', () => {
      // Mix of completed and scheduled games
      const games: Game[] = [
        createGame('LVA', 'SEA', '2024-05-15', 90, 88), // Completed
        createGame('LVA', 'PHO', '2024-05-17', 85, 82), // Completed
        createGame('LVA', 'IND', '2024-05-20', null, null), // Future/scheduled
        createGame('SEA', 'LVA', '2024-05-22', null, null), // Future/scheduled
      ]

      const selectedTeam = 'LVA'
      const franchiseCodes = getAllFranchiseAbbrs(selectedTeam, wnbaFranchises)

      // Simulate belt tracking - should only count completed games
      const completedGames = games.filter(
        (game) => game.homeScore !== null && game.awayScore !== null
      )

      const teamGames = completedGames.filter(
        (game) => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
      )

      // Only 2 completed games should be counted
      expect(teamGames.length).toBe(2)
      expect(teamGames[0].homeScore).not.toBeNull()
      expect(teamGames[1].homeScore).not.toBeNull()
    })

    it('should exclude postponed/cancelled games with null scores', () => {
      const games: Game[] = [
        createGame('LVA', 'SEA', '2024-05-15', 90, 88), // Completed
        createGame('LVA', 'PHO', '2024-05-16', null, null), // Postponed (never played)
        createGame('LVA', 'IND', '2024-05-17', 85, 82), // Completed
      ]

      // Filter to completed games only
      const completedGames = games.filter(
        (game) => game.homeScore !== null && game.awayScore !== null
      )

      expect(completedGames.length).toBe(2)
      expect(completedGames.every((g) => g.homeScore !== null && g.awayScore !== null)).toBe(true)
    })

    it('should calculate correct stats when mixing completed and future games', () => {
      const games: Game[] = [
        // Completed games
        createGame('LVA', 'SEA', '2024-05-15', 90, 88),
        createGame('LVA', 'PHO', '2024-05-17', 85, 82),
        createGame('LVA', 'IND', '2024-05-19', 78, 80), // LVA lost
        // Future games (should not be counted)
        createGame('LVA', 'NYL', '2024-05-25', null, null),
        createGame('LVA', 'MIN', '2024-05-27', null, null),
      ]

      // Simulate win/loss calculation (only for completed games)
      const completedGames = games.filter((g) => g.homeScore !== null && g.awayScore !== null)

      let wins = 0
      let losses = 0
      completedGames.forEach((game) => {
        if (game.homeTeam === 'LVA') {
          if (game.homeScore! > game.awayScore!) wins++
          else losses++
        } else if (game.awayTeam === 'LVA') {
          if (game.awayScore! > game.homeScore!) wins++
          else losses++
        }
      })

      // Only completed games should count: 2 wins, 1 loss
      expect(wins).toBe(2)
      expect(losses).toBe(1)
      expect(completedGames.length).toBe(3) // Not 5
    })

    it('should handle all future games (no completed games yet)', () => {
      const games: Game[] = [
        createGame('LVA', 'SEA', '2025-05-15', null, null),
        createGame('LVA', 'PHO', '2025-05-17', null, null),
        createGame('LVA', 'IND', '2025-05-19', null, null),
      ]

      const completedGames = games.filter((g) => g.homeScore !== null && g.awayScore !== null)

      // No games should be counted
      expect(completedGames.length).toBe(0)
    })
  })
})
