import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.resetModules()
})

// Load getUpcomingSeason with a stubbed config so tests don't depend on the
// manually-maintained values in seasonConfig.ts.
async function withConfig(currentYear: number, isInSeason: boolean) {
  const actual = await vi.importActual<typeof import('../seasonConfig')>('../seasonConfig')
  const stub = { currentYear, isInSeason }
  for (const key of ['WNBA_CONFIG', 'NBA_CONFIG', 'NHL_CONFIG', 'PWHL_CONFIG'] as const) {
    Object.assign(actual[key], stub)
  }
  return actual.getUpcomingSeason
}

describe('getUpcomingSeason', () => {
  it('returns the current season while it is in progress', async () => {
    const getUpcomingSeason = await withConfig(2026, true)
    expect(getUpcomingSeason('nba').label).toBe('2026-27')
    expect(getUpcomingSeason('wnba').label).toBe('2026')
  })

  it('returns the next season during the off-season', async () => {
    const getUpcomingSeason = await withConfig(2026, false)
    expect(getUpcomingSeason('wnba').label).toBe('2027')
    expect(getUpcomingSeason('pwhl').label).toBe('2027-28')
  })

  it('handles the century-style suffix for split seasons', async () => {
    const getUpcomingSeason = await withConfig(2099, true)
    expect(getUpcomingSeason('nhl').label).toBe('2099-00')
  })

  it('builds Wikipedia URLs with an en dash for split seasons', async () => {
    const getUpcomingSeason = await withConfig(2026, true)
    expect(getUpcomingSeason('nba').wikiUrl).toBe(
      'https://en.wikipedia.org/wiki/2026–27_NBA_season'
    )
    expect(getUpcomingSeason('wnba').wikiUrl).toBe(
      'https://en.wikipedia.org/wiki/2026_WNBA_season'
    )
  })
})
