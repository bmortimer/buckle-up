/**
 * Season Champions - computes which teams ended each regular season holding the belt
 */

import type { SeasonData, FranchiseInfo, League } from './types'
import { BeltTracker } from './beltTracker'
import { getCurrentFranchiseAbbr } from './franchises'

export interface ChampionEntry {
  team: string
  count: number
  seasons: string[] // season keys, chronologically ordered
}

export function yearToSeasonKey(year: number, league: League): string {
  if (league === 'wnba') return year.toString()
  const nextYear = (year + 1) % 100
  return `${year}-${nextYear.toString().padStart(2, '0')}`
}

/**
 * Compute season-ending belt holders and aggregate by franchise.
 * Only completed seasons (no unplayed games) are counted.
 * Returns entries sorted by championship count (desc), with ties broken
 * by who got their most recent championship further back (asc).
 */
export function computeSeasonChampions(
  league: League,
  seasons: Record<string, SeasonData>,
  franchises: FranchiseInfo[],
  champions: Record<string, string>,
  yearRange: [number, number]
): ChampionEntry[] {
  // Get sorted season keys in selected range
  const seasonKeys: string[] = []
  for (let y = yearRange[0]; y <= yearRange[1]; y++) {
    const key = yearToSeasonKey(y, league)
    if (seasons[key]) seasonKeys.push(key)
  }

  // Track each season to find the end-of-season belt holder
  const seasonEndHolders: { season: string; holder: string }[] = []

  for (const seasonKey of seasonKeys) {
    const startingChampion = champions[seasonKey]
    if (!startingChampion) continue

    const seasonData = seasons[seasonKey]
    if (!seasonData?.games.length) continue

    const tracker = new BeltTracker(startingChampion)
    const result = tracker.trackSeason(seasonData.games, franchises)

    // Only count completed seasons (all games have scores)
    const hasUnplayedGames = seasonData.games.some(
      (g) => g.homeScore === null || g.awayScore === null
    )
    if (hasUnplayedGames) continue

    const holder = getCurrentFranchiseAbbr(result.summary.currentHolder, franchises)
    seasonEndHolders.push({ season: seasonKey, holder })
  }

  // Aggregate by team
  const teamMap = new Map<string, ChampionEntry>()
  for (const { season, holder } of seasonEndHolders) {
    const existing = teamMap.get(holder)
    if (existing) {
      existing.count++
      existing.seasons.push(season)
    } else {
      teamMap.set(holder, { team: holder, count: 1, seasons: [season] })
    }
  }

  // Sort: most championships first, ties broken by earliest most-recent-championship
  const entries = Array.from(teamMap.values())
  entries.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    const aLatest = a.seasons[a.seasons.length - 1]
    const bLatest = b.seasons[b.seasons.length - 1]
    return aLatest.localeCompare(bLatest)
  })

  return entries
}
