/**
 * Data loader - loads season data and franchise info
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { SeasonData, FranchiseInfo } from './types'
import { parseFranchisesCSV } from './franchises'

const DATA_DIR = join(process.cwd(), '..', 'data')

export function loadSeasonData(league: 'nba' | 'wnba', season: string): SeasonData | null {
  try {
    const filePath = join(DATA_DIR, league, `${season}.json`)
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error: any) {
    // Only log non-ENOENT errors (file not found is expected for missing seasons)
    if (error.code !== 'ENOENT') {
      console.error(`Failed to load ${league} season ${season}:`, error)
    }
    return null
  }
}

export function loadFranchises(league: 'nba' | 'wnba'): FranchiseInfo[] {
  try {
    const filePath = join(DATA_DIR, league, 'franchises.csv')
    const content = readFileSync(filePath, 'utf-8')
    return parseFranchisesCSV(content)
  } catch (error: any) {
    // Only log non-ENOENT errors (file not found is expected for some leagues)
    if (error.code !== 'ENOENT') {
      console.error(`Failed to load ${league} franchises:`, error)
    }
    return []
  }
}

export function getAvailableSeasons(league: 'nba' | 'wnba'): string[] {
  try {
    const { readdirSync } = require('fs')
    const leagueDir = join(DATA_DIR, league)
    const files = readdirSync(leagueDir)

    return files
      .filter((f: string) => f.endsWith('.json') && !f.includes('belt'))
      .map((f: string) => f.replace('.json', ''))
      .sort()
      .reverse() // Most recent first
  } catch (error) {
    console.error(`Failed to get seasons for ${league}:`, error)
    return []
  }
}

export function getCurrentSeason(league: 'nba' | 'wnba'): string {
  const seasons = getAvailableSeasons(league)
  return seasons[0] || (league === 'wnba' ? '2024' : '2024-25')
}

export function getDefendingChampion(league: 'nba' | 'wnba', season: string): string {
  // Hardcoded for now - could be loaded from a champions.json file
  const wnbaChampions: Record<string, string> = {
    '2024': 'LVA', // 2023 champion
    '2023': 'LVA', // 2022 champion
    '2022': 'CHI', // 2021 champion
  }

  const nbaChampions: Record<string, string> = {
    '2024-25': 'BOS', // 2024 champion
    '2023-24': 'DEN', // 2023 champion
    '2022-23': 'GSW', // 2022 champion
  }

  if (league === 'wnba') {
    return wnbaChampions[season] || 'LVA'
  } else {
    return nbaChampions[season] || 'BOS'
  }
}
