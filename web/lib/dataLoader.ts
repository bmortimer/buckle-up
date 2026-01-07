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
      .filter((f: string) => f.endsWith('.json') && !f.includes('belt') && !f.includes('champions'))
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

export function loadChampions(league: 'nba' | 'wnba'): Record<string, string> {
  try {
    const filePath = join(DATA_DIR, league, 'champions.json')
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    return data.champions || {}
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to load ${league} champions:`, error)
    }
    return {}
  }
}

export function getDefendingChampion(league: 'nba' | 'wnba', season: string): string {
  const champions = loadChampions(league)
  return champions[season] || (league === 'wnba' ? 'LVA' : 'BOS')
}
