import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  LEAGUES,
  LEAGUE_ORDER,
  formatSeason,
  formatSeasonRange,
  seasonKeyForDate,
} from '../leagues'
import { parseFranchisesCSV } from '../franchises'
import logoManifest from '../logoManifest.json'
import { buildLogoManifest } from '../../scripts/generate-logo-manifest.mjs'

const dataDir = join(process.cwd(), '../data')

describe('formatSeason', () => {
  it('uses the calendar year for single-year leagues', () => {
    expect(formatSeason('wnba', 2026)).toBe('2026')
  })

  it('uses YYYY-YY for split-year leagues', () => {
    expect(formatSeason('nba', 2026)).toBe('2026-27')
    expect(formatSeason('nhl', 1999)).toBe('1999-00')
    expect(formatSeason('pwhl', 2023)).toBe('2023-24')
  })
})

describe('formatSeasonRange', () => {
  it('collapses a single season to its label', () => {
    expect(formatSeasonRange('nba', 2024, 2024)).toBe('2024-25')
    expect(formatSeasonRange('wnba', 2024, 2024)).toBe('2024')
  })

  it('spans first start year to last end year', () => {
    expect(formatSeasonRange('nhl', 2020, 2024)).toBe('2020-25')
    expect(formatSeasonRange('wnba', 2020, 2024)).toBe('2020-2024')
  })
})

describe('seasonKeyForDate', () => {
  it('keys single-year leagues by calendar year', () => {
    expect(seasonKeyForDate('wnba', new Date(2026, 8, 24))).toBe('2026')
  })

  it('splits split-year seasons at October', () => {
    expect(seasonKeyForDate('nba', new Date(2026, 9, 21))).toBe('2026-27')
    expect(seasonKeyForDate('nba', new Date(2027, 3, 10))).toBe('2026-27')
    expect(seasonKeyForDate('pwhl', new Date(2026, 11, 5))).toBe('2026-27')
    expect(seasonKeyForDate('pwhl', new Date(2024, 0, 1))).toBe('2023-24')
  })
})

describe('league registry', () => {
  it('lists every league exactly once in display order', () => {
    expect([...LEAGUE_ORDER].sort()).toEqual(Object.keys(LEAGUES).sort())
  })

  describe.each(LEAGUE_ORDER)('%s conferences', (league) => {
    const franchises = parseFranchisesCSV(
      readFileSync(join(dataDir, league, 'franchises.csv'), 'utf-8')
    )
    const { east, west } = LEAGUES[league].conferences

    it('places every active franchise in exactly one conference', () => {
      const active = franchises.filter((f) => f.status === 'active').map((f) => f.teamAbbr)
      const missing = active.filter((t) => !east.includes(t) && !west.includes(t))
      const both = active.filter((t) => east.includes(t) && west.includes(t))
      expect({ missing, both }).toEqual({ missing: [], both: [] })
    })

    it('only lists teams that exist in franchises.csv', () => {
      const known = new Set(franchises.map((f) => f.teamAbbr))
      expect([...east, ...west].filter((t) => !known.has(t))).toEqual([])
    })
  })
})

describe('logo manifest', () => {
  it('matches public/logos (run `npm run logos` if this fails)', () => {
    expect(buildLogoManifest(join(process.cwd(), 'public/logos'))).toEqual(logoManifest)
  })
})
