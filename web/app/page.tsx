import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export const metadata: Metadata = {
  title: 'Championship Belt Tracker | WNBA, NBA & NHL Lineal Title',
  description: 'Track lineal championship belts for WNBA, NBA, and NHL. Boxing-style title tracking for basketball and hockey. Every game is a title defense.',
  alternates: {
    canonical: 'https://whohasthebelt.com'
  },
  openGraph: {
    title: 'Championship Belt Tracker | WNBA, NBA & NHL',
    description: 'The lineal championship belt - every game is a title defense. Track WNBA, NBA, and NHL belts.',
    url: 'https://whohasthebelt.com',
    siteName: 'Championship Belt Tracker',
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
    description: 'Track lineal championship belts across WNBA, NBA, and NHL. Every game is a title defense.',
    images: ['https://whohasthebelt.com/og-image.png']
  },
}

export default function Home() {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Top navigation - About & Theme */}
      <div className="flex items-center justify-end gap-2 mb-8">
        <Link
          href="/about"
          className="px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground bg-card transition-all"
        >
          About
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Header - Scoreboard Style */}
      <header className="scoreboard-panel p-4 sm:p-6 md:p-8 text-center mb-8 sm:mb-12 relative overflow-hidden">
        {/* Top LED strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" aria-hidden="true" />

        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4">
          ◆ Championship Belt Tracker ◆
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display tracking-wide uppercase mb-4 sm:mb-6 led-text" style={{ color: 'hsl(var(--led-amber))' }}>
          The Belt
        </h1>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-border to-transparent mb-4 sm:mb-6" />

        <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto mb-6">
          What if our sports leagues worked a bit more like boxing or wrestling? One belt to rule them all. To become the champion, you have to <em className="text-foreground">beat</em> the champion.
        </p>

        {/* How It Works link */}
        <Link
          href="/about"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary border border-border hover:border-primary transition-all rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>How It Works</span>
        </Link>

        {/* Corner rivets for retro hardware look */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
      </header>

      {/* League Selection */}
      <nav className="mb-8 sm:mb-12" aria-label="League selection">
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-6 text-center font-normal">
          <span aria-hidden="true">◆ </span>
          Select League
          <span aria-hidden="true"> ◆</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* WNBA Card */}
          <Link
            href="/wnba"
            className="group scoreboard-panel p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            {/* Top LED strip - red for WNBA */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="text-center space-y-4">
              <div className="text-xs font-orbitron uppercase tracking-[0.2em] text-muted-foreground">
                Women's Basketball
              </div>

              <h3 className="text-2xl sm:text-3xl font-display tracking-wide uppercase led-text" style={{ color: 'hsl(var(--led-red))' }}>
                WNBA
              </h3>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Track the lineal championship from 1997 to present. See who holds the belt, upcoming title bouts, and a complete history of the WNBA.
              </p>

              <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-primary group-hover:text-red-500 transition-colors">
                <span>Enter</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>

            {/* Corner rivets */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
          </Link>

          {/* NBA Card */}
          <Link
            href="/nba"
            className="group scoreboard-panel p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            {/* Top LED strip - amber for NBA */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="text-center space-y-4">
              <div className="text-xs font-orbitron uppercase tracking-[0.2em] text-muted-foreground">
                Men's Basketball
              </div>

              <h3 className="text-2xl sm:text-3xl font-display tracking-wide uppercase led-text" style={{ color: 'hsl(var(--led-amber))' }}>
                NBA
              </h3>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Track the lineal championship from 1976 to present. See who holds the belt, upcoming title bouts, and a complete history of the NBA.
              </p>

              <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-primary group-hover:text-amber-500 transition-colors">
                <span>Enter</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>

            {/* Corner rivets */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
          </Link>

          {/* NHL Card */}
          <Link
            href="/nhl"
            className="group scoreboard-panel p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            {/* Top LED strip - green for NHL */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="text-center space-y-4">
              <div className="text-xs font-orbitron uppercase tracking-[0.2em] text-muted-foreground">
                Ice Hockey
              </div>

              <h3 className="text-2xl sm:text-3xl font-display tracking-wide uppercase led-text" style={{ color: 'hsl(var(--led-green))' }}>
                NHL
              </h3>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Track the lineal championship from 1942 to present. See who holds the belt, upcoming title bouts, and a complete history of the NHL.
              </p>

              <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-primary group-hover:text-green-500 transition-colors">
                <span>Enter</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>

            {/* Corner rivets */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <footer className="scoreboard-panel p-4 sm:p-6 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

        <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
          Data updates nightly ~3:30 AM Pacific
        </p>

        {/* Corner rivets */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
      </footer>
    </article>
  )
}
