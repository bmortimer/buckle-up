import { Suspense } from 'react'
import { loadSeasonData, loadFranchises, getAvailableSeasons } from '@/lib/dataLoader'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

export default function Home() {
  // Load all available WNBA seasons
  const wnbaSeasonsList = getAvailableSeasons('wnba')
  console.log('WNBA seasons list:', wnbaSeasonsList)
  const wnbaSeasons: Record<string, SeasonData> = {}
  wnbaSeasonsList.forEach(season => {
    const data = loadSeasonData('wnba', season)
    if (data) {
      wnbaSeasons[season] = data
      console.log(`Loaded WNBA ${season}: ${data.games.length} games`)
    } else {
      console.log(`Failed to load WNBA ${season}`)
    }
  })

  // Load all available NBA seasons
  const nbaSeasonsList = getAvailableSeasons('nba')
  const nbaSeasons: Record<string, SeasonData> = {}
  nbaSeasonsList.forEach(season => {
    const data = loadSeasonData('nba', season)
    if (data) nbaSeasons[season] = data
  })

  // Load franchise data
  const wnbaFranchises = loadFranchises('wnba')
  const nbaFranchises = loadFranchises('nba')
  console.log('WNBA franchises loaded:', wnbaFranchises.length)
  console.log('WNBA seasons loaded:', Object.keys(wnbaSeasons).length)
  console.log('NBA seasons loaded:', Object.keys(nbaSeasons).length)

  // Defending champions by season (previous year's champion starts with belt)
  const wnbaChampions: Record<string, string> = {
    '1997': 'HOU', // Inaugural season - Houston won first game
    '1998': 'HOU', // 1997 champion: Houston Comets
    '1999': 'HOU', // 1998 champion: Houston Comets
    '2000': 'HOU', // 1999 champion: Houston Comets
    '2001': 'HOU', // 2000 champion: Houston Comets
    '2002': 'LAS', // 2001 champion: Los Angeles Sparks
    '2003': 'LAS', // 2002 champion: Los Angeles Sparks
    '2004': 'DET', // 2003 champion: Detroit Shock
    '2005': 'SEA', // 2004 champion: Seattle Storm
    '2006': 'SAC', // 2005 champion: Sacramento Monarchs
    '2007': 'DET', // 2006 champion: Detroit Shock
    '2008': 'PHO', // 2007 champion: Phoenix Mercury
    '2009': 'DET', // 2008 champion: Detroit Shock
    '2010': 'PHO', // 2009 champion: Phoenix Mercury
    '2011': 'SEA', // 2010 champion: Seattle Storm
    '2012': 'MIN', // 2011 champion: Minnesota Lynx
    '2013': 'IND', // 2012 champion: Indiana Fever
    '2014': 'MIN', // 2013 champion: Minnesota Lynx
    '2015': 'PHO', // 2014 champion: Phoenix Mercury
    '2016': 'MIN', // 2015 champion: Minnesota Lynx
    '2017': 'LAS', // 2016 champion: Los Angeles Sparks
    '2018': 'MIN', // 2017 champion: Minnesota Lynx
    '2019': 'SEA', // 2018 champion: Seattle Storm
    '2020': 'WAS', // 2019 champion: Washington Mystics
    '2021': 'SEA', // 2020 champion: Seattle Storm
    '2022': 'CHI', // 2021 champion: Chicago Sky
    '2023': 'LVA', // 2022 champion: Las Vegas Aces
    '2024': 'LVA', // 2023 champion: Las Vegas Aces
    '2025': 'NYL', // 2024 champion: New York Liberty
  }

  const nbaChampions: Record<string, string> = {
    '2024-25': 'BOS',
    '2023-24': 'DEN',
    '2022-23': 'GSW',
    '2021-22': 'MIL',
  }

  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <BeltDashboard
        wnbaSeasons={wnbaSeasons}
        nbaSeasons={nbaSeasons}
        wnbaFranchises={wnbaFranchises}
        nbaFranchises={nbaFranchises}
        wnbaChampions={wnbaChampions}
        nbaChampions={nbaChampions}
      />
    </Suspense>
  )
}
