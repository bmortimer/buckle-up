import type { Metadata } from 'next'
import { Suspense } from 'react'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Championship Belt Tracker | WNBA, NBA, NHL & PWHL Lineal Title',
  description:
    'Track lineal championship belts for WNBA, NBA, NHL, and PWHL. Boxing-style title tracking for basketball and hockey. Every game is a title defense.',
  alternates: {
    canonical: 'https://whohasthebelt.com',
  },
  openGraph: {
    title: 'Championship Belt Tracker | WNBA, NBA, NHL & PWHL',
    description:
      'The lineal championship belt - every game is a title defense. Track WNBA, NBA, NHL, and PWHL belts.',
    url: 'https://whohasthebelt.com',
    siteName: 'Championship Belt Tracker',
    images: [
      {
        url: 'https://whohasthebelt.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Championship Belt Tracker - Lineal Title History',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Championship Belt Tracker | WNBA, NBA, NHL & PWHL',
    description:
      'Track lineal championship belts across WNBA, NBA, NHL, and PWHL. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png'],
  },
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <HomeClient />
    </Suspense>
  )
}
