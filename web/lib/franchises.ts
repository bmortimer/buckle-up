/**
 * Franchise data and colors (client-side)
 */

import type { FranchiseInfo } from './types'

// Memoization caches - keyed by franchises array reference
const franchiseMapCache = new WeakMap<FranchiseInfo[], Map<string, FranchiseInfo>>()
const rootFranchiseCache = new WeakMap<FranchiseInfo[], Map<string, string>>()
const sameFranchiseCache = new WeakMap<FranchiseInfo[], Map<string, boolean>>()
const allFranchiseAbbrsCache = new WeakMap<FranchiseInfo[], Map<string, string[]>>()

function getFranchiseMap(franchises: FranchiseInfo[]): Map<string, FranchiseInfo> {
  let map = franchiseMapCache.get(franchises)
  if (!map) {
    map = new Map(franchises.map(f => [f.franchiseId, f]))
    franchiseMapCache.set(franchises, map)
  }
  return map
}

export function parseFranchisesCSV(csvContent: string): FranchiseInfo[] {
  const lines = csvContent.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith('franchise_id') && !trimmed.startsWith('#')
  })

  return lines.map(line => {
    const [
      franchiseId,
      teamAbbr,
      displayName,
      city,
      startYear,
      endYear,
      status,
      successorFranchiseId,
      hexColor,
    ] = line.split(',')

    return {
      franchiseId: franchiseId?.trim() || '',
      teamAbbr: teamAbbr?.trim() || '',
      displayName: displayName?.trim() || '',
      city: city?.trim() || '',
      startYear: startYear?.trim() || '',
      endYear: endYear?.trim() || '',
      status: status?.trim() || '',
      successorFranchiseId: successorFranchiseId?.trim() || '',
      hexColor: hexColor?.trim() || '',
    }
  }).filter(f => f.franchiseId)
}

export function getRootFranchiseId(teamAbbr: string, franchises: FranchiseInfo[]): string {
  // Check cache first
  let cache = rootFranchiseCache.get(franchises)
  if (!cache) {
    cache = new Map()
    rootFranchiseCache.set(franchises, cache)
  }

  const cached = cache.get(teamAbbr)
  if (cached !== undefined) return cached

  // Compute if not cached
  const info = franchises.find(f => f.teamAbbr === teamAbbr)
  if (!info) {
    cache.set(teamAbbr, teamAbbr)
    return teamAbbr
  }

  const franchiseMap = getFranchiseMap(franchises)

  let current = info
  while (current.successorFranchiseId) {
    const next = franchiseMap.get(current.successorFranchiseId)
    if (!next) break
    current = next
  }

  const result = current.franchiseId
  cache.set(teamAbbr, result)
  return result
}

export function getTeamColor(teamAbbr: string, franchises: FranchiseInfo[]): string {
  const rootFranchiseId = getRootFranchiseId(teamAbbr, franchises)
  const rootFranchise = franchises.find(f => f.franchiseId === rootFranchiseId)
  return rootFranchise?.hexColor || '#8b949e'
}

export function isSameFranchise(team1: string, team2: string, franchises: FranchiseInfo[]): boolean {
  if (team1 === team2) return true

  // Check cache first
  const cacheKey = team1 < team2 ? `${team1}:${team2}` : `${team2}:${team1}`
  let cache = sameFranchiseCache.get(franchises)
  if (!cache) {
    cache = new Map()
    sameFranchiseCache.set(franchises, cache)
  }

  const cached = cache.get(cacheKey)
  if (cached !== undefined) return cached

  // Use franchise data to check if teams are the same franchise (handles relocations)
  const root1 = getRootFranchiseId(team1, franchises)
  const root2 = getRootFranchiseId(team2, franchises)

  const result = root1 === root2
  cache.set(cacheKey, result)
  return result
}

export function getTeamDisplayName(teamAbbr: string, franchises: FranchiseInfo[]): string {
  const info = franchises.find(f => f.teamAbbr === teamAbbr)
  return info?.displayName || teamAbbr
}

/**
 * Get the current/active franchise abbreviation from any era's abbreviation.
 * For example, "UTA" (Utah Starzz) returns "LVA" (Las Vegas Aces).
 */
export function getCurrentFranchiseAbbr(teamAbbr: string, franchises: FranchiseInfo[]): string {
  const rootId = getRootFranchiseId(teamAbbr, franchises)
  const rootFranchise = franchises.find(f => f.franchiseId === rootId)
  return rootFranchise?.teamAbbr || teamAbbr
}

/**
 * Get all team abbreviations that belong to the same franchise lineage.
 * For example, "LVA" returns ["UTA", "SAS", "LVA"].
 */
export function getAllFranchiseAbbrs(teamAbbr: string, franchises: FranchiseInfo[]): string[] {
  // Check cache first
  let cache = allFranchiseAbbrsCache.get(franchises)
  if (!cache) {
    cache = new Map()
    allFranchiseAbbrsCache.set(franchises, cache)
  }

  const cached = cache.get(teamAbbr)
  if (cached !== undefined) return cached

  // Compute if not cached
  const rootId = getRootFranchiseId(teamAbbr, franchises)

  // Build result by filtering franchises that share the same root
  const result = franchises
    .filter(f => getRootFranchiseId(f.teamAbbr, franchises) === rootId)
    .map(f => f.teamAbbr)

  cache.set(teamAbbr, result)
  return result
}

/**
 * Get the current franchise display name from any era's abbreviation.
 * For example, "UTA" returns "Las Vegas Aces".
 */
export function getCurrentFranchiseName(teamAbbr: string, franchises: FranchiseInfo[]): string {
  const currentAbbr = getCurrentFranchiseAbbr(teamAbbr, franchises)
  return getTeamDisplayName(currentAbbr, franchises)
}

/**
 * Get the team code that was active during a specific year.
 * For example, getTeamCodeForYear("WAS", 1979, franchises) returns "WSB" (Washington Bullets).
 * Returns the input teamAbbr if no historical code is found for that year.
 */
export function getTeamCodeForYear(teamAbbr: string, year: number, franchises: FranchiseInfo[]): string {
  // Get all team codes in the franchise lineage
  const allAbbrs = getAllFranchiseAbbrs(teamAbbr, franchises)

  // Find which team code was active in the given year
  for (const abbr of allAbbrs) {
    const info = franchises.find(f => f.teamAbbr === abbr)
    if (!info) continue

    const startYear = info.startYear ? parseInt(info.startYear) : -Infinity
    const endYear = info.endYear ? parseInt(info.endYear) : Infinity

    // Check if this team was active during the given year
    if (year >= startYear && year <= endYear) {
      return abbr
    }
  }

  // If no match found, return the original team abbreviation
  return teamAbbr
}

export interface FranchiseEra {
  startYear: number
  endYear: number
}

/**
 * Get the distinct eras when a franchise was active, accounting for gaps.
 * For example, Portland Fire (2000-2002, 2026+) would return two eras.
 * An era is defined as a contiguous period of activity. A gap of >1 year
 * between franchise periods creates separate eras.
 */
/**
 * Dedupe a set of team codes by franchise, returning only current franchise abbreviations.
 * For example, ["UTA", "SAS", "LVA", "NYL"] becomes ["LVA", "NYL"] (Utah Starzz and San Antonio Stars map to Las Vegas Aces).
 */
export function dedupeByFranchise(teams: Set<string> | string[], franchises: FranchiseInfo[]): string[] {
  const teamArray = teams instanceof Set ? Array.from(teams) : teams
  const franchiseSet = new Set<string>()
  teamArray.forEach(team => {
    franchiseSet.add(getCurrentFranchiseAbbr(team, franchises))
  })
  return Array.from(franchiseSet).sort()
}

export function getFranchiseEras(teamAbbr: string, franchises: FranchiseInfo[]): FranchiseEra[] {
  const allAbbrs = getAllFranchiseAbbrs(teamAbbr, franchises)

  // Collect all periods from franchise info
  const periods: { start: number; end: number | null }[] = []

  for (const abbr of allAbbrs) {
    const info = franchises.find(f => f.teamAbbr === abbr)
    if (!info) continue

    const startYear = info.startYear ? parseInt(info.startYear) : null
    const endYear = info.endYear ? parseInt(info.endYear) : null

    if (startYear !== null) {
      periods.push({ start: startYear, end: endYear })
    }
  }

  if (periods.length === 0) return []

  // Sort by start year
  periods.sort((a, b) => a.start - b.start)

  // Merge contiguous periods (gap <= 1 year)
  const eras: FranchiseEra[] = []
  let currentEra: { start: number; end: number | null } = { ...periods[0] }

  for (let i = 1; i < periods.length; i++) {
    const period = periods[i]
    const currentEnd = currentEra.end ?? new Date().getFullYear()

    // Check for gap > 1 year
    if (period.start - currentEnd > 1) {
      // Close current era and start new one
      eras.push({
        startYear: currentEra.start,
        endYear: currentEnd
      })
      currentEra = { ...period }
    } else {
      // Extend current era
      if (period.end === null) {
        currentEra.end = null
      } else if (currentEra.end !== null) {
        currentEra.end = Math.max(currentEra.end, period.end)
      }
    }
  }

  // Add final era
  eras.push({
    startYear: currentEra.start,
    endYear: currentEra.end ?? new Date().getFullYear()
  })

  return eras
}
