import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Oswald, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Midnight Court fonts
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://whohasthebelt.com'),
  title: {
    default: 'Championship Belt Tracker | WNBA, NBA & NHL Lineal Title',
    template: '%s | Belt Tracker'
  },
  description: 'Track lineal championship belts for WNBA, NBA, and NHL. Boxing-style title tracking for basketball and hockey. Every game is a title defense.',
  keywords: ['championship belt', 'lineal title', 'basketball', 'hockey', 'belt tracker', 'WNBA', 'NBA', 'NHL', 'sports stats'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whohasthebelt.com',
    siteName: 'Championship Belt Tracker',
    title: 'Championship Belt Tracker | WNBA, NBA & NHL',
    description: 'Track the lineal championship belt across WNBA, NBA, and NHL seasons. See current champions and complete history.',
    images: [{
      url: 'https://whohasthebelt.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Championship Belt Tracker - Lineal Title History'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Championship Belt Tracker | WNBA, NBA & NHL',
    description: 'Track the lineal championship belt across basketball and hockey. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

// JSON-LD structured data for search engines
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://whohasthebelt.com/#webapp',
      name: 'Championship Belt Tracker',
      url: 'https://whohasthebelt.com',
      description: 'Interactive tracker for lineal championship belts in basketball and hockey. Track which team holds the belt across WNBA, NBA, and NHL, view historical data, and see upcoming title bouts.',
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'WNBA lineal championship belt tracking (1997-present)',
        'NBA lineal championship belt tracking (1976-present)',
        'NHL lineal championship belt tracking (1942-present)',
        'Real-time belt holder information',
        'Historical championship statistics',
        'Team performance analytics',
        'Next title bout schedule'
      ],
      inLanguage: 'en-US'
    },
    {
      '@type': 'WebSite',
      '@id': 'https://whohasthebelt.com/#website',
      url: 'https://whohasthebelt.com',
      name: 'Championship Belt Tracker',
      description: 'Track the lineal championship belt across WNBA, NBA, and NHL seasons',
      inLanguage: 'en-US'
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`min-h-screen bg-background text-foreground transition-colors ${oswald.variable} ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
