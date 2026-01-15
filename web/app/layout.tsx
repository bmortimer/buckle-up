import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Oswald, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

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
    default: 'WNBA Championship Belt Tracker | Lineal Title History',
    template: '%s | Belt Tracker'
  },
  description: 'Track the lineal championship belt across WNBA seasons (1997-present). Boxing-style title tracking for basketball. See current champion, stats, and next title bout.',
  keywords: ['WNBA', 'championship belt', 'lineal title', 'basketball', 'belt tracker', 'WNBA stats'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whohasthebelt.com',
    siteName: 'Championship Belt Tracker',
    title: 'WNBA Championship Belt Tracker',
    description: 'Track the lineal championship belt across WNBA seasons. See current champion and full history.',
    images: [{
      url: 'https://whohasthebelt.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Championship Belt Tracker - WNBA Lineal Title'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WNBA Championship Belt Tracker',
    description: 'Track the lineal championship belt across WNBA seasons. Every game is a title defense.',
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
      description: 'Interactive tracker for lineal championship belts in WNBA basketball. Track which team holds the belt, view historical data from 1997-present, and see upcoming title bouts.',
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'WNBA lineal championship belt tracking (1997-present)',
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
      description: 'Track the lineal championship belt across WNBA seasons',
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
      </body>
    </html>
  )
}
