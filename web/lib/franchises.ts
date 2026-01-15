/**
 * Franchise data and colors (client-side)
 */

import type { FranchiseInfo } from './types'

// Cache for loaded franchise data
let franchiseCache: Map<string, FranchiseInfo[]> = new Map()

export function parseFranchisesCSV(csvContent: string): FranchiseInfo[] {
  const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('franchise_id'))

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
  const info = franchises.find(f => f.teamAbbr === teamAbbr)
  if (!info) return teamAbbr

  const franchiseMap = new Map(franchises.map(f => [f.franchiseId, f]))

  let current = info
  while (current.successorFranchiseId) {
    const next = franchiseMap.get(current.successorFranchiseId)
    if (!next) break
    current = next
  }

  return current.franchiseId
}

export function getTeamColor(teamAbbr: string, franchises: FranchiseInfo[]): string {
  const rootFranchiseId = getRootFranchiseId(teamAbbr, franchises)
  const rootFranchise = franchises.find(f => f.franchiseId === rootFranchiseId)
  return rootFranchise?.hexColor || '#8b949e'
}

export function isSameFranchise(team1: string, team2: string, franchises: FranchiseInfo[]): boolean {
  if (team1 === team2) return true

  // Use franchise data to check if teams are the same franchise (handles relocations)
  const root1 = getRootFranchiseId(team1, franchises)
  const root2 = getRootFranchiseId(team2, franchises)

  return root1 === root2
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
  const rootId = getRootFranchiseId(teamAbbr, franchises)
  return franchises
    .filter(f => getRootFranchiseId(f.teamAbbr, franchises) === rootId)
    .map(f => f.teamAbbr)
}

/**
 * Get the current franchise display name from any era's abbreviation.
 * For example, "UTA" returns "Las Vegas Aces".
 */
export function getCurrentFranchiseName(teamAbbr: string, franchises: FranchiseInfo[]): string {
  const currentAbbr = getCurrentFranchiseAbbr(teamAbbr, franchises)
  return getTeamDisplayName(currentAbbr, franchises)
}
