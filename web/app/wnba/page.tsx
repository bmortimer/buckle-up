import { Suspense } from 'react'
import type { Metadata } from 'next'
import { loadSeasonData, loadFranchises, getAvailableSeasons, loadChampions } from '@/lib/dataLoader'
import type { SeasonData } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

export const metadata: Metadata = {
  title: 'WNBA Belt Tracker',
  description: 'Track the WNBA lineal championship belt from 1997 to present. See who holds the belt, upcoming title bouts, and complete history.',
  alternates: {
    canonical: 'https://whohasthebelt.com/wnba'
  },
  openGraph: {
    title: 'WNBA Championship Belt Tracker',
    description: 'The lineal championship belt - every game is a title defense. Track the WNBA belt from 1997 to present.',
    url: 'https://whohasthebelt.com/wnba',
    siteName: 'Championship Belt Tracker',
    images: [{
      url: 'https://whohasthebelt.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'WNBA Championship Belt Tracker - Lineal Title History'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WNBA Championship Belt Tracker',
    description: 'Track the WNBA lineal championship belt from 1997 to present. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png']
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
