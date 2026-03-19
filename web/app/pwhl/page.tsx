import type { Metadata } from 'next'
import {
  loadSeasonData,
  loadFranchises,
  getAvailableSeasons,
  loadChampions,
} from '@/lib/dataLoader'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import PwhlClient from './PwhlClient'

export const metadata: Metadata = {
  title: 'PWHL Championship Belt Tracker | Lineal Title Since 2024',
  description:
    'Track the PWHL lineal championship belt from 2024 to present. See who holds the belt, upcoming title bouts, and complete history.',
  keywords: [
    'PWHL',
    'championship belt',
    'lineal title',
    "women's hockey",
    'belt tracker',
    'PWHL stats',
    "professional women's hockey",
  ],
  alternates: {
    canonical: 'https://whohasthebelt.com/pwhl',
  },
  openGraph: {
    title: 'PWHL Championship Belt Tracker',
    description:
      'The lineal championship belt - every game is a title defense. Track the PWHL belt from 2024 to present.',
    url: 'https://whohasthebelt.com/pwhl',
    siteName: 'Championship Belt Tracker',
    images: [
      {
        url: 'https://whohasthebelt.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PWHL Championship Belt Tracker - Lineal Title History',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PWHL Championship Belt Tracker',
    description:
      'Track the PWHL lineal championship belt from 2024 to present. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png'],
  },
}

// Breadcrumb structured data for search engines
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://whohasthebelt.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'PWHL',
      item: 'https://whohasthebelt.com/pwhl',
    },
  ],
}

export default function PwhlPage() {
  // Load PWHL data on the server
  const seasonsList = getAvailableSeasons('pwhl')
  const seasons: Record<string, SeasonData> = {}
  seasonsList.forEach((season) => {
    const data = loadSeasonData('pwhl', season)
    if (data) seasons[season] = data
  })

  const franchises = loadFranchises('pwhl')
  const champions = loadChampions('pwhl')

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PwhlClient seasons={seasons} franchises={franchises} champions={champions} />
    </>
  )
}
