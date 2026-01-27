/**
 * Franchise data loader from CSV
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface FranchiseInfo {
  franchiseId: string;
  teamAbbr: string;
  displayName: string;
  city: string;
  startYear: string;
  endYear: string;
  status: string;
  successorFranchiseId: string;
  hexColor: string;
}

// League-specific caches to avoid cross-contamination
const franchiseCacheByLeague: Map<string, FranchiseInfo[]> = new Map();
const franchiseMapCacheByLeague: Map<string, Map<string, FranchiseInfo>> = new Map();
const franchiseColorCacheByLeague: Map<string, Map<string, string>> = new Map();

/**
 * Load franchise data from CSV
 */
export function loadFranchises(league: string): FranchiseInfo[] {
  // Check league-specific cache
  if (franchiseCacheByLeague.has(league)) {
    return franchiseCacheByLeague.get(league)!;
  }

  const csvPath = resolve(process.cwd(), 'data', league, 'franchises.csv');

  try {
    const content = readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('franchise_id') && !line.startsWith('#'));

    const franchises = lines.map(line => {
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
      ] = line.split(',');

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
      };
    }).filter(f => f.franchiseId);

    franchiseCacheByLeague.set(league, franchises);
    return franchises;
  } catch (error) {
    console.warn(`Could not load franchises.csv: ${error}`);
    return [];
  }
}

/**
 * Get franchise info for a team abbreviation
 */
export function getFranchiseInfo(teamAbbr: string, league: string = 'wnba'): FranchiseInfo | undefined {
  if (!franchiseMapCacheByLeague.has(league)) {
    const franchises = loadFranchises(league);
    franchiseMapCacheByLeague.set(league, new Map(franchises.map(f => [f.teamAbbr, f])));
  }
  return franchiseMapCacheByLeague.get(league)!.get(teamAbbr);
}

/**
 * Get the root franchise ID for a team (following successor chain)
 */
export function getRootFranchiseId(teamAbbr: string, league: string = 'wnba'): string {
  const info = getFranchiseInfo(teamAbbr, league);
  if (!info) return teamAbbr;

  const franchises = loadFranchises(league);
  const franchiseMap = new Map(franchises.map(f => [f.franchiseId, f]));

  let current = info;
  while (current.successorFranchiseId) {
    const next = franchiseMap.get(current.successorFranchiseId);
    if (!next) break;
    current = next;
  }

  return current.franchiseId;
}

/**
 * Get hex color for a team (from root franchise)
 */
export function getTeamColor(teamAbbr: string, league: string = 'wnba'): string {
  if (!franchiseColorCacheByLeague.has(league)) {
    franchiseColorCacheByLeague.set(league, new Map());
  }
  const colorCache = franchiseColorCacheByLeague.get(league)!;

  if (colorCache.has(teamAbbr)) {
    return colorCache.get(teamAbbr)!;
  }

  const rootFranchiseId = getRootFranchiseId(teamAbbr, league);
  const franchises = loadFranchises(league);
  const rootFranchise = franchises.find(f => f.franchiseId === rootFranchiseId);

  const color = rootFranchise?.hexColor || '#8b949e'; // Default gray if not found
  colorCache.set(teamAbbr, color);

  return color;
}

/**
 * Check if two teams are the same franchise
 */
export function isSameFranchiseFromCSV(team1: string, team2: string, league: string = 'wnba'): boolean {
  const root1 = getRootFranchiseId(team1, league);
  const root2 = getRootFranchiseId(team2, league);
  return root1 === root2;
}

/**
 * Get all team abbreviations that belong to a franchise
 */
export function getFranchiseTeams(teamAbbr: string, league: string = 'wnba'): string[] {
  const rootId = getRootFranchiseId(teamAbbr, league);
  const franchises = loadFranchises(league);

  const teams: string[] = [];

  // Find all franchises in this lineage
  for (const f of franchises) {
    let current = f;
    const franchiseMap = new Map(franchises.map(fr => [fr.franchiseId, fr]));

    // Follow successor chain to see if it leads to rootId
    while (current) {
      if (current.franchiseId === rootId) {
        teams.push(f.teamAbbr);
        break;
      }
      if (!current.successorFranchiseId) break;
      const next = franchiseMap.get(current.successorFranchiseId);
      if (!next) break;
      current = next;
    }
  }

  return teams;
}
