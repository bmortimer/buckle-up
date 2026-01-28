import { Suspense } from 'react'
import type { Metadata } from 'next'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

export const metadata: Metadata = {
  title: 'NBA Belt Tracker',
  description: 'Track the NBA lineal championship belt from 1976 to present. See who holds the belt, upcoming title bouts, and complete history.',
  alternates: {
    canonical: 'https://whohasthebelt.com/nba'
  },
  openGraph: {
    title: 'NBA Championship Belt Tracker',
    description: 'The lineal championship belt - every game is a title defense. Track the NBA belt from 1976 to present.',
    url: 'https://whohasthebelt.com/nba',
    siteName: 'Championship Belt Tracker',
    images: [{
      url: 'https://whohasthebelt.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'NBA Championship Belt Tracker - Lineal Title History'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NBA Championship Belt Tracker',
    description: 'Track the NBA lineal championship belt from 1976 to present. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png']
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
