/**
 * Franchise continuity using CSV data
 */

import { isSameFranchiseFromCSV } from './franchiseLoader.js';

/**
 * Check if two team codes represent the same franchise
 * Uses the franchises.csv file to handle relocations
 */
export function isSameFranchise(team1: string, team2: string, league: string = 'wnba'): boolean {
  // If they're exactly the same, no need to check CSV
  if (team1 === team2) return true;

  // Check using CSV data
  return isSameFranchiseFromCSV(team1, team2, league);
}
