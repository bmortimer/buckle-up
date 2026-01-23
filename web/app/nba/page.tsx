import { Suspense } from 'react'
import type { Metadata } from 'next'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

export const metadata: Metadata = {
  title: 'NBA Belt Tracker',
  description: 'Track the NBA lineal championship belt. See who holds the belt, upcoming title bouts, and complete history.',
  alternates: {
    canonical: 'https://whohasthebelt.com/nba'
  },
  openGraph: {
    title: 'NBA Championship Belt Tracker',
    description: 'The lineal championship belt - every game is a title defense. Track the NBA belt.',
  },
}

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
      <BeltDashboard
        league="nba"
        seasons={seasons}
        franchises={franchises}
        champions={champions}
      />
    </Suspense>
  )
}
