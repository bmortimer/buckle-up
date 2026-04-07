import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { computeSeasonChampions, yearToSeasonKey } from '../seasonChampions'
import { parseFranchisesCSV } from '../franchises'
import type { Game, SeasonData } from '../types'

const wnbaFixture = readFileSync(join(__dirname, 'fixtures/wnba-franchises-test.csv'), 'utf-8')
const wnbaFranchises = parseFranchisesCSV(wnbaFixture)

function makeGame(
  date: string,
  home: string,
  away: string,
  homeScore: number | null,
  awayScore: number | null
): Game {
  return { date, homeTeam: home, awayTeam: away, homeScore, awayScore }
}

function makeSeason(season: string, games: Game[]): SeasonData {
  return { season, league: 'WNBA', games }
}

describe('yearToSeasonKey', () => {
  it('should return year string for WNBA', () => {
    expect(yearToSeasonKey(2024, 'wnba')).toBe('2024')
  })

  it('should return YYYY-YY format for NBA', () => {
    expect(yearToSeasonKey(2023, 'nba')).toBe('2023-24')
  })

  it('should handle century boundary', () => {
    expect(yearToSeasonKey(1999, 'nhl')).toBe('1999-00')
  })
})

describe('computeSeasonChampions', () => {
  it('should return empty array when no completed seasons', () => {
    const seasons: Record<string, SeasonData> = {
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'NYL', 'MIN', null, null),
      ]),
    }
    const champions = { '2024': 'NYL' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2024, 2024])
    expect(result).toEqual([])
  })

  it('should identify the season-ending belt holder', () => {
    const seasons: Record<string, SeasonData> = {
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'NYL', 'MIN', 95, 87), // NYL holds
        makeGame('2024-05-15', 'NYL', 'CON', 80, 85), // CON takes belt
        makeGame('2024-05-16', 'CON', 'MIN', 90, 88), // CON holds
      ]),
    }
    const champions = { '2024': 'NYL' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2024, 2024])
    expect(result).toHaveLength(1)
    expect(result[0].team).toBe('CON')
    expect(result[0].count).toBe(1)
    expect(result[0].seasons).toEqual(['2024'])
  })

  it('should count multiple championships for same team', () => {
    const seasons: Record<string, SeasonData> = {
      '2023': makeSeason('2023', [
        makeGame('2023-05-14', 'NYL', 'MIN', 95, 87), // NYL holds through season
      ]),
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'NYL', 'MIN', 90, 85), // NYL holds again
      ]),
    }
    const champions = { '2023': 'NYL', '2024': 'NYL' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2023, 2024])
    expect(result).toHaveLength(1)
    expect(result[0].team).toBe('NYL')
    expect(result[0].count).toBe(2)
    expect(result[0].seasons).toEqual(['2023', '2024'])
  })

  it('should sort by championship count descending', () => {
    const seasons: Record<string, SeasonData> = {
      '2022': makeSeason('2022', [
        makeGame('2022-05-14', 'CON', 'MIN', 90, 85),
      ]),
      '2023': makeSeason('2023', [
        makeGame('2023-05-14', 'NYL', 'MIN', 95, 87),
      ]),
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'NYL', 'MIN', 90, 85),
      ]),
    }
    const champions = { '2022': 'CON', '2023': 'NYL', '2024': 'NYL' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2022, 2024])
    expect(result[0].team).toBe('NYL')
    expect(result[0].count).toBe(2)
    expect(result[1].team).toBe('CON')
    expect(result[1].count).toBe(1)
  })

  it('should break ties by earliest most-recent championship', () => {
    const seasons: Record<string, SeasonData> = {
      '2022': makeSeason('2022', [
        makeGame('2022-05-14', 'CON', 'MIN', 90, 85), // CON ends with belt
      ]),
      '2023': makeSeason('2023', [
        makeGame('2023-05-14', 'NYL', 'MIN', 95, 87), // NYL ends with belt
      ]),
    }
    const champions = { '2022': 'CON', '2023': 'NYL' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2022, 2023])
    expect(result).toHaveLength(2)
    // Both have 1 championship; CON's most recent (2022) is further back than NYL's (2023)
    expect(result[0].team).toBe('CON')
    expect(result[1].team).toBe('NYL')
  })

  it('should skip seasons with unplayed games', () => {
    const seasons: Record<string, SeasonData> = {
      '2023': makeSeason('2023', [
        makeGame('2023-05-14', 'NYL', 'MIN', 95, 87), // completed
      ]),
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'CON', 'MIN', 90, 85), // completed
        makeGame('2024-05-20', 'CON', 'NYL', null, null), // unplayed
      ]),
    }
    const champions = { '2023': 'NYL', '2024': 'CON' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2023, 2024])
    expect(result).toHaveLength(1)
    expect(result[0].team).toBe('NYL')
  })

  it('should skip seasons with no champion defined', () => {
    const seasons: Record<string, SeasonData> = {
      '2023': makeSeason('2023', [
        makeGame('2023-05-14', 'NYL', 'MIN', 95, 87),
      ]),
    }
    const champions: Record<string, string> = {} // no champion

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2023, 2023])
    expect(result).toEqual([])
  })

  it('should merge franchise lineage (historical team maps to current)', () => {
    // UTA (Utah Starzz) -> SAS -> LVA (Las Vegas Aces)
    const seasons: Record<string, SeasonData> = {
      '2000': makeSeason('2000', [
        makeGame('2000-06-01', 'UTA', 'NYL', 80, 75), // UTA holds belt
      ]),
    }
    const champions = { '2000': 'UTA' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2000, 2000])
    expect(result).toHaveLength(1)
    // UTA should map to LVA (current franchise)
    expect(result[0].team).toBe('LVA')
  })

  it('should only include seasons within the year range', () => {
    const seasons: Record<string, SeasonData> = {
      '2022': makeSeason('2022', [
        makeGame('2022-05-14', 'CON', 'MIN', 90, 85),
      ]),
      '2023': makeSeason('2023', [
        makeGame('2023-05-14', 'NYL', 'MIN', 95, 87),
      ]),
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'NYL', 'MIN', 90, 85),
      ]),
    }
    const champions = { '2022': 'CON', '2023': 'NYL', '2024': 'NYL' }

    // Only look at 2023-2024
    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2023, 2024])
    expect(result).toHaveLength(1)
    expect(result[0].team).toBe('NYL')
    expect(result[0].count).toBe(2)
  })

  it('should not include teams with zero championships', () => {
    const seasons: Record<string, SeasonData> = {
      '2024': makeSeason('2024', [
        makeGame('2024-05-14', 'NYL', 'MIN', 95, 87), // NYL wins (MIN loses but was never holder)
        makeGame('2024-05-15', 'NYL', 'CON', 80, 85), // CON takes belt
      ]),
    }
    const champions = { '2024': 'NYL' }

    const result = computeSeasonChampions('wnba', seasons, wnbaFranchises, champions, [2024, 2024])
    // Only CON (season-ending holder), not NYL or MIN
    expect(result).toHaveLength(1)
    expect(result[0].team).toBe('CON')
    expect(result.find((e) => e.team === 'MIN')).toBeUndefined()
  })
})
