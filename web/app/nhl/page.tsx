import type { Metadata } from 'next'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import NhlClient from './NhlClient'

export const metadata: Metadata = {
  title: 'NHL Belt Tracker',
  description: 'Track the NHL lineal championship belt from 1942 to present. See who holds the belt, upcoming title bouts, and complete history.',
  alternates: {
    canonical: 'https://whohasthebelt.com/nhl'
  },
  openGraph: {
    title: 'NHL Championship Belt Tracker',
    description: 'The lineal championship belt - every game is a title defense. Track the NHL belt from 1942 to present.',
  },
}

export default function NhlPage() {
  // Load NHL data on the server
  const seasonsList = getAvailableSeasons('nhl')
  const seasons: Record<string, SeasonData> = {}
  seasonsList.forEach(season => {
    const data = loadSeasonData('nhl', season)
    if (data) seasons[season] = data
  })

  const franchises = loadFranchises('nhl')
  const champions = loadChampions('nhl')

  return (
    <NhlClient
      seasons={seasons}
      franchises={franchises}
      champions={champions}
    />
  )
}
