import { Suspense } from 'react'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
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

  // Load champions data from JSON files (previous year's champion starts with belt each season)
  const wnbaChampions = loadChampions('wnba')
  const nbaChampions = loadChampions('nba')

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
