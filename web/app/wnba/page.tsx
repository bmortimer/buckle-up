import { Suspense } from 'react'
import type { Metadata } from 'next'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

export const metadata: Metadata = {
  title: 'WNBA Belt Tracker',
  description: 'Track the WNBA lineal championship belt from 1997 to present. See who holds the belt, upcoming title bouts, and complete history.',
  openGraph: {
    title: 'WNBA Championship Belt Tracker',
    description: 'The lineal championship belt - every game is a title defense. Track the WNBA belt from 1997 to present.',
  },
}

export default function WnbaPage() {
  const seasonsList = getAvailableSeasons('wnba')
  const seasons: Record<string, SeasonData> = {}
  seasonsList.forEach(season => {
    const data = loadSeasonData('wnba', season)
    if (data) seasons[season] = data
  })

  const franchises = loadFranchises('wnba')
  const champions = loadChampions('wnba')

  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <BeltDashboard
        league="wnba"
        seasons={seasons}
        franchises={franchises}
        champions={champions}
      />
    </Suspense>
  )
}
