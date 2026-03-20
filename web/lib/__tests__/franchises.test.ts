import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  parseFranchisesCSV,
  getRootFranchiseId,
  getTeamColor,
  isSameFranchise,
  getCurrentFranchiseAbbr,
  getAllFranchiseAbbrs,
  getCurrentFranchiseName,
  getTeamDisplayName,
  getTeamCodeForYear,
  getFranchiseEras,
} from '../franchises'
import type { FranchiseInfo } from '../types'

// Load test fixtures
const nbaFixture = readFileSync(join(__dirname, 'fixtures/nba-franchises-test.csv'), 'utf-8')
const wnbaFixture = readFileSync(join(__dirname, 'fixtures/wnba-franchises-test.csv'), 'utf-8')

const nbaFranchises = parseFranchisesCSV(nbaFixture)
const wnbaFranchises = parseFranchisesCSV(wnbaFixture)

describe('parseFranchisesCSV', () => {
  it('should parse CSV content into franchise objects', () => {
    expect(nbaFranchises).toBeInstanceOf(Array)
    expect(nbaFranchises.length).toBeGreaterThan(0)

    const gsw = nbaFranchises.find((f) => f.franchiseId === 'GSW')
    expect(gsw).toBeDefined()
    expect(gsw?.teamAbbr).toBe('GSW')
    expect(gsw?.displayName).toBe('Golden State Warriors')
    expect(gsw?.hexColor).toBe('#1D428A')
  })

  it('should filter out empty lines and header', () => {
    const allIds = nbaFranchises.map((f) => f.franchiseId)
    expect(allIds).not.toContain('')
    expect(allIds).not.toContain('franchise_id')
  })
})

describe('getRootFranchiseId', () => {
  describe('NBA franchises', () => {
    it('should return same ID for teams that never relocated/rebranded', () => {
      expect(getRootFranchiseId('BOS', nbaFranchises)).toBe('BOS')
      expect(getRootFranchiseId('LAL', nbaFranchises)).toBe('LAL')
    })

    it('should return root ID for simple rebranding chain', () => {
      // GOS -> GSW
      expect(getRootFranchiseId('GOS', nbaFranchises)).toBe('GSW')
      expect(getRootFranchiseId('GSW', nbaFranchises)).toBe('GSW')
    })

    it('should return root ID for relocation chain', () => {
      // NJN -> BKN
      expect(getRootFranchiseId('NJN', nbaFranchises)).toBe('BKN')
      expect(getRootFranchiseId('BKN', nbaFranchises)).toBe('BKN')
    })

    it('should return root ID for complex chain (CHH -> NOH -> NOP)', () => {
      expect(getRootFranchiseId('CHH', nbaFranchises)).toBe('NOP')
      expect(getRootFranchiseId('NOH', nbaFranchises)).toBe('NOP')
      expect(getRootFranchiseId('NOP', nbaFranchises)).toBe('NOP')
    })

    it('should return root ID for rebranding only', () => {
      // WSB -> WAS
      expect(getRootFranchiseId('WSB', nbaFranchises)).toBe('WAS')
      expect(getRootFranchiseId('WAS', nbaFranchises)).toBe('WAS')
    })
  })

  describe('WNBA franchises', () => {
    it('should return root ID for multi-city relocation', () => {
      // UTA -> SAST -> SAST14 -> ACES
      expect(getRootFranchiseId('UTA', wnbaFranchises)).toBe('ACES')
      expect(getRootFranchiseId('SAS', wnbaFranchises)).toBe('ACES')
      expect(getRootFranchiseId('LVA', wnbaFranchises)).toBe('ACES')
    })

    it('should return root ID for single relocation', () => {
      // ORL -> CON
      expect(getRootFranchiseId('ORL', wnbaFranchises)).toBe('CON')
      expect(getRootFranchiseId('CON', wnbaFranchises)).toBe('CON')
    })
  })

  it('should return original team abbr if not found in franchises', () => {
    expect(getRootFranchiseId('UNKNOWN', nbaFranchises)).toBe('UNKNOWN')
  })
})

describe('isSameFranchise', () => {
  it('should return true for identical team codes', () => {
    expect(isSameFranchise('GSW', 'GSW', nbaFranchises)).toBe(true)
  })

  it('should return true for teams in same franchise chain', () => {
    // GOS and GSW are same franchise
    expect(isSameFranchise('GOS', 'GSW', nbaFranchises)).toBe(true)
    expect(isSameFranchise('GSW', 'GOS', nbaFranchises)).toBe(true)

    // UTA, SAS, and LVA are same franchise
    expect(isSameFranchise('UTA', 'LVA', wnbaFranchises)).toBe(true)
    expect(isSameFranchise('SAS', 'LVA', wnbaFranchises)).toBe(true)
    expect(isSameFranchise('UTA', 'SAS', wnbaFranchises)).toBe(true)
  })

  it('should return false for different franchises', () => {
    expect(isSameFranchise('BOS', 'LAL', nbaFranchises)).toBe(false)
    expect(isSameFranchise('NYL', 'MIN', wnbaFranchises)).toBe(false)
  })
})

describe('getCurrentFranchiseAbbr', () => {
  it('should return current abbreviation for historical teams', () => {
    expect(getCurrentFranchiseAbbr('GOS', nbaFranchises)).toBe('GSW')
    expect(getCurrentFranchiseAbbr('UTA', wnbaFranchises)).toBe('LVA')
    expect(getCurrentFranchiseAbbr('SAS', wnbaFranchises)).toBe('LVA')
  })

  it('should return same abbreviation for current teams', () => {
    expect(getCurrentFranchiseAbbr('GSW', nbaFranchises)).toBe('GSW')
    expect(getCurrentFranchiseAbbr('LVA', wnbaFranchises)).toBe('LVA')
  })
})

describe('getAllFranchiseAbbrs', () => {
  it('should return all abbreviations in a franchise lineage', () => {
    const gswAbbrs = getAllFranchiseAbbrs('GSW', nbaFranchises)
    expect(gswAbbrs).toContain('GSW')
    expect(gswAbbrs).toContain('GOS')
    expect(gswAbbrs.length).toBe(2)
  })

  it('should return all abbreviations for multi-step chain', () => {
    // ACES(LVA), SAST14(SAS), SAST(SAS), UTA - 4 entries, but SAS appears twice (rebrand)
    const lvaAbbrs = getAllFranchiseAbbrs('LVA', wnbaFranchises)
    expect(lvaAbbrs).toContain('LVA')
    expect(lvaAbbrs).toContain('SAS')
    expect(lvaAbbrs).toContain('UTA')
    expect(lvaAbbrs.length).toBe(4)
  })

  it('should return single abbreviation for teams that never relocated', () => {
    const bosAbbrs = getAllFranchiseAbbrs('BOS', nbaFranchises)
    expect(bosAbbrs).toEqual(['BOS'])
  })
})

describe('getTeamColor', () => {
  it('should return color from root franchise', () => {
    // GOS should use GSW color
    expect(getTeamColor('GOS', nbaFranchises)).toBe('#1D428A')
    expect(getTeamColor('GSW', nbaFranchises)).toBe('#1D428A')
  })

  it('should return color for historical teams based on root', () => {
    // UTA should use LVA color
    expect(getTeamColor('UTA', wnbaFranchises)).toBe('#000000')
    expect(getTeamColor('SAS', wnbaFranchises)).toBe('#000000')
    expect(getTeamColor('LVA', wnbaFranchises)).toBe('#000000')
  })

  it('should return default color for unknown team', () => {
    expect(getTeamColor('UNKNOWN', nbaFranchises)).toBe('#8b949e')
  })
})

describe('getTeamDisplayName', () => {
  it('should return display name for team abbreviation', () => {
    expect(getTeamDisplayName('GSW', nbaFranchises)).toBe('Golden State Warriors')
    expect(getTeamDisplayName('GOS', nbaFranchises)).toBe('Golden State Warriors')
    expect(getTeamDisplayName('LVA', wnbaFranchises)).toBe('Las Vegas Aces')
  })

  it('should return abbreviation if team not found', () => {
    expect(getTeamDisplayName('UNKNOWN', nbaFranchises)).toBe('UNKNOWN')
  })
})

describe('getCurrentFranchiseName', () => {
  it('should return current franchise name for historical abbreviation', () => {
    expect(getCurrentFranchiseName('GOS', nbaFranchises)).toBe('Golden State Warriors')
    expect(getCurrentFranchiseName('UTA', wnbaFranchises)).toBe('Las Vegas Aces')
    expect(getCurrentFranchiseName('SAS', wnbaFranchises)).toBe('Las Vegas Aces')
  })

  it('should return current name for current teams', () => {
    expect(getCurrentFranchiseName('GSW', nbaFranchises)).toBe('Golden State Warriors')
    expect(getCurrentFranchiseName('LVA', wnbaFranchises)).toBe('Las Vegas Aces')
  })
})

describe('Caching behavior', () => {
  it('should cache results for repeated calls', () => {
    // First calls
    const result1 = getRootFranchiseId('GOS', nbaFranchises)
    const result2 = isSameFranchise('GOS', 'GSW', nbaFranchises)
    const result3 = getAllFranchiseAbbrs('LVA', wnbaFranchises)

    // Second calls should hit cache (same results)
    expect(getRootFranchiseId('GOS', nbaFranchises)).toBe(result1)
    expect(isSameFranchise('GOS', 'GSW', nbaFranchises)).toBe(result2)
    expect(getAllFranchiseAbbrs('LVA', wnbaFranchises)).toEqual(result3)
  })
})

describe('getFranchiseEras', () => {
  it('should return single era for teams with continuous history', () => {
    const eras = getFranchiseEras('NYL', wnbaFranchises)
    expect(eras).toHaveLength(1)
    expect(eras[0].startYear).toBe(1997)
    // endYear should be current year since team is still active
    expect(eras[0].endYear).toBeGreaterThanOrEqual(2024)
  })

  it('should return single era for franchise with continuous relocations', () => {
    // Las Vegas Aces: UTA (1997-2002) -> SAS (2003-2017) -> LVA (2018+)
    // These are contiguous (no gap > 1 year)
    const eras = getFranchiseEras('LVA', wnbaFranchises)
    expect(eras).toHaveLength(1)
    expect(eras[0].startYear).toBe(1997) // Utah Starzz start
    expect(eras[0].endYear).toBeGreaterThanOrEqual(2024)
  })

  it('should return multiple eras for teams with gaps in history', () => {
    // Portland Fire: 2000-2002, then revived 2026+
    const eras = getFranchiseEras('FIRE26', wnbaFranchises)
    expect(eras).toHaveLength(2)
    expect(eras[0]).toEqual({ startYear: 2000, endYear: 2002 })
    expect(eras[1].startYear).toBe(2026)
    expect(eras[1].endYear).toBeGreaterThanOrEqual(2026)
  })

  it('should work with historical team code as input', () => {
    // Using POR (historical) should give same result as FIRE26 (current)
    const erasFromHistorical = getFranchiseEras('POR', wnbaFranchises)
    const erasFromCurrent = getFranchiseEras('FIRE26', wnbaFranchises)
    expect(erasFromHistorical).toEqual(erasFromCurrent)
  })

  it('should return empty array for unknown team', () => {
    const eras = getFranchiseEras('UNKNOWN', wnbaFranchises)
    expect(eras).toHaveLength(0)
  })
})

describe('getTeamCodeForYear', () => {
  it('should resolve correct team code for each era of a franchise', () => {
    expect(getTeamCodeForYear('LVA', 2000, wnbaFranchises)).toBe('UTA')
    expect(getTeamCodeForYear('LVA', 2002, wnbaFranchises)).toBe('UTA')
    expect(getTeamCodeForYear('LVA', 2018, wnbaFranchises)).toBe('LVA')
    expect(getTeamCodeForYear('LVA', 2024, wnbaFranchises)).toBe('LVA')
  })

  it('should handle rebrands that share the same team abbreviation', () => {
    // SAST (Silver Stars, 2003-2013) and SAST14 (Stars, 2014-2017) both use "SAS"
    // Must resolve correctly for years in both eras
    expect(getTeamCodeForYear('LVA', 2003, wnbaFranchises)).toBe('SAS')
    expect(getTeamCodeForYear('LVA', 2010, wnbaFranchises)).toBe('SAS')
    expect(getTeamCodeForYear('LVA', 2013, wnbaFranchises)).toBe('SAS')
    expect(getTeamCodeForYear('LVA', 2014, wnbaFranchises)).toBe('SAS')
    expect(getTeamCodeForYear('LVA', 2017, wnbaFranchises)).toBe('SAS')
  })

  it('should work when queried from a historical team code', () => {
    expect(getTeamCodeForYear('UTA', 2000, wnbaFranchises)).toBe('UTA')
    expect(getTeamCodeForYear('UTA', 2010, wnbaFranchises)).toBe('SAS')
    expect(getTeamCodeForYear('UTA', 2020, wnbaFranchises)).toBe('LVA')
  })

  it('should return input abbreviation for unknown teams', () => {
    expect(getTeamCodeForYear('UNKNOWN', 2020, wnbaFranchises)).toBe('UNKNOWN')
  })
})
