import { Suspense } from 'react'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'
import NbaGate from '@/components/NbaGate'

export default function NbaPage() {
  const seasonsList = getAvailableSeasons('nba')
  const seasons: Record<string, SeasonData> = {}
  seasonsList.forEach(season => {
    const data = loadSeasonData('nba', season)
    if (data) seasons[season] = data
  })

  const franchises = loadFranchises('nba')
  const champions = loadChampions('nba')

  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <NbaGate>
        <BeltDashboard
          league="nba"
          seasons={seasons}
          franchises={franchises}
          champions={champions}
        />
      </NbaGate>
    </Suspense>
  )
}
