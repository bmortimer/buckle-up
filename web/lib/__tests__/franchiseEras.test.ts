import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseFranchisesCSV, getFranchiseEras, type FranchiseEra } from '../franchises'

// Load WNBA fixture which includes Portland Fire with gap
const wnbaFixture = readFileSync(join(__dirname, 'fixtures/wnba-franchises-test.csv'), 'utf-8')
const wnbaFranchises = parseFranchisesCSV(wnbaFixture)

describe('getFranchiseEras - gap detection for calendar display', () => {
  describe('Portland Fire scenario (team with 20+ year gap)', () => {
    it('should detect two distinct eras for Portland Fire', () => {
      // Portland Fire: 2000-2002, then revived 2026+
      const eras = getFranchiseEras('FIRE26', wnbaFranchises)

      expect(eras).toHaveLength(2)
      expect(eras[0]).toEqual({ startYear: 2000, endYear: 2002 })
      expect(eras[1].startYear).toBe(2026)
    })

    it('should work from historical team code POR', () => {
      const eras = getFranchiseEras('POR', wnbaFranchises)

      expect(eras).toHaveLength(2)
      expect(eras[0]).toEqual({ startYear: 2000, endYear: 2002 })
    })

    it('should report consistent eras regardless of which team code is used', () => {
      const erasFromCurrent = getFranchiseEras('FIRE26', wnbaFranchises)
      const erasFromHistorical = getFranchiseEras('POR', wnbaFranchises)

      expect(erasFromCurrent).toEqual(erasFromHistorical)
    })
  })

  describe('continuous franchise chains (no gaps)', () => {
    it('should return single era for Las Vegas Aces lineage', () => {
      // UTA (1997-2002) -> SAS (2003-2017) -> LVA (2018+)
      // Gap between periods is exactly 1 year (2002 to 2003), which should NOT create separate eras
      const eras = getFranchiseEras('LVA', wnbaFranchises)

      expect(eras).toHaveLength(1)
      expect(eras[0].startYear).toBe(1997)
    })

    it('should return single era for Connecticut Sun lineage', () => {
      // ORL (1999-2002) -> CON (2003+)
      const eras = getFranchiseEras('CON', wnbaFranchises)

      expect(eras).toHaveLength(1)
      expect(eras[0].startYear).toBe(1999)
    })
  })

  describe('teams with no relocations', () => {
    it('should return single era for New York Liberty', () => {
      const eras = getFranchiseEras('NYL', wnbaFranchises)

      expect(eras).toHaveLength(1)
      expect(eras[0].startYear).toBe(1997)
    })

    it('should return single era for Minnesota Lynx', () => {
      const eras = getFranchiseEras('MIN', wnbaFranchises)

      expect(eras).toHaveLength(1)
      expect(eras[0].startYear).toBe(1999)
    })
  })

  describe('edge cases', () => {
    it('should return empty array for unknown team', () => {
      const eras = getFranchiseEras('FAKE_TEAM', wnbaFranchises)
      expect(eras).toHaveLength(0)
    })

    it('should handle empty franchises array', () => {
      const eras = getFranchiseEras('NYL', [])
      expect(eras).toHaveLength(0)
    })
  })

  describe('era boundary detection (>1 year gap threshold)', () => {
    it('should NOT create separate eras for 1-year gap', () => {
      // Las Vegas Aces: UTA ends 2002, SAS starts 2003 (1 year gap = contiguous)
      const eras = getFranchiseEras('LVA', wnbaFranchises)
      expect(eras).toHaveLength(1)
    })

    it('should create separate eras for >1 year gap', () => {
      // Portland Fire: POR ends 2002, FIRE26 starts 2026 (23 year gap)
      const eras = getFranchiseEras('FIRE26', wnbaFranchises)
      expect(eras).toHaveLength(2)
    })
  })
})

describe('calendar era grouping helper logic', () => {
  // Test the helper function that would be used in BeltCalendar to group months by era
  const getEraIndex = (monthKey: string, eras: FranchiseEra[]): number => {
    if (eras.length <= 1) return 0
    const [yearStr] = monthKey.split('-')
    const year = parseInt(yearStr)
    for (let i = 0; i < eras.length; i++) {
      if (year >= eras[i].startYear && year <= eras[i].endYear) {
        return i
      }
    }
    return 0
  }

  it('should assign months to correct era for Portland Fire', () => {
    const eras = getFranchiseEras('FIRE26', wnbaFranchises)

    // First era: 2000-2002
    expect(getEraIndex('2000-05', eras)).toBe(0)
    expect(getEraIndex('2001-07', eras)).toBe(0)
    expect(getEraIndex('2002-08', eras)).toBe(0)

    // Second era: 2026+
    expect(getEraIndex('2026-05', eras)).toBe(1)
    expect(getEraIndex('2026-09', eras)).toBe(1)
  })

  it('should group consecutive months within same era', () => {
    const eras = getFranchiseEras('FIRE26', wnbaFranchises)

    const months = ['2000-05', '2000-06', '2000-07', '2026-05', '2026-06']
    const eraGroups = months.reduce(
      (acc, month) => {
        const eraIdx = getEraIndex(month, eras)
        if (acc.length === 0 || acc[acc.length - 1].eraIndex !== eraIdx) {
          acc.push({ eraIndex: eraIdx, months: [] })
        }
        acc[acc.length - 1].months.push(month)
        return acc
      },
      [] as { eraIndex: number; months: string[] }[]
    )

    expect(eraGroups).toHaveLength(2)
    expect(eraGroups[0].months).toEqual(['2000-05', '2000-06', '2000-07'])
    expect(eraGroups[1].months).toEqual(['2026-05', '2026-06'])
  })
})
