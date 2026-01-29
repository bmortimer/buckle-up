import type { Metadata } from 'next'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import NhlClient from './NhlClient'

export const metadata: Metadata = {
  title: 'NHL Championship Belt Tracker | Lineal Title Since 1942',
  description: 'Track the NHL lineal championship belt from 1942 to present. See who holds the belt, upcoming title bouts, and complete history.',
  alternates: {
    canonical: 'https://whohasthebelt.com/nhl'
  },
  openGraph: {
    title: 'NHL Championship Belt Tracker',
    description: 'The lineal championship belt - every game is a title defense. Track the NHL belt from 1942 to present.',
    url: 'https://whohasthebelt.com/nhl',
    siteName: 'Championship Belt Tracker',
    images: [{
      url: 'https://whohasthebelt.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'NHL Championship Belt Tracker - Lineal Title History'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NHL Championship Belt Tracker',
    description: 'Track the NHL lineal championship belt from 1942 to present. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png']
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
