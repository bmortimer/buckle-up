'use client'

import Link from 'next/link'
import { AestheticSwitcher } from '@/components/AestheticSwitcher'
import CornerRivets from '@/components/CornerRivets'
import { LEAGUES, LEAGUE_ORDER, type LeagueInfo } from '@/lib/leagues'

// Full class names so Tailwind's content scan can see them
const HOVER_TEXT: Record<LeagueInfo['accent'], string> = {
  'led-red': 'group-hover:text-led-red',
  'led-amber': 'group-hover:text-led-amber',
  'led-green': 'group-hover:text-led-green',
  'led-purple': 'group-hover:text-led-purple',
}

export default function HomeClient() {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Top navigation - About & Theme */}
      <div className="flex items-stretch justify-end gap-2 mb-8">
        <Link
          href="/about"
          className="px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground bg-card transition-colors"
        >
          About
        </Link>
        <AestheticSwitcher />
      </div>

      {/* Header - Scoreboard Style */}
      <header className="scoreboard-panel p-4 sm:p-6 md:p-8 text-center mb-8 sm:mb-12 relative overflow-hidden">
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4">
          ◆ Championship Belt Tracker ◆
        </div>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display tracking-wide uppercase mb-4 sm:mb-6 led-text"
          style={{ color: 'hsl(var(--led-amber))' }}
        >
          The Belt
        </h1>

        <div className="h-0.5 bg-border mb-4 sm:mb-6" />

        <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto mb-6">
          What if our sports leagues worked a bit more like boxing or wrestling? One belt to rule
          them all. To become the champion, you have to <em className="text-foreground">beat</em>{' '}
          the champion.
        </p>

        {/* How It Works link */}
        <Link
          href="/about"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary border border-border hover:border-primary transition-colors rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>How It Works</span>
        </Link>

        {/* Corner rivets for retro hardware look */}
        <CornerRivets />
      </header>

      {/* League Selection */}
      <nav className="mb-8 sm:mb-12" aria-label="League selection">
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-6 text-center font-normal">
          <span aria-hidden="true">◆ </span>
          Select League
          <span aria-hidden="true"> ◆</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {LEAGUE_ORDER.map((id) => {
            const { name, sport, trackedSince, accent } = LEAGUES[id]
            return (
              <Link
                key={id}
                href={`/${id}`}
                className="group scoreboard-panel p-6 sm:p-8 relative overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:scale-[1.02] hover:shadow-lg"
                data-league={id}
              >
                <div className="text-center space-y-4">
                  <div className="text-xs font-orbitron uppercase tracking-[0.2em] text-muted-foreground">
                    {sport}
                  </div>

                  <h3
                    className="text-2xl sm:text-3xl font-display tracking-wide uppercase led-text"
                    style={{ color: `hsl(var(--${accent}))` }}
                  >
                    {name}
                  </h3>

                  <div className="h-px bg-border" />

                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    Track the lineal championship from {trackedSince} to present. See who holds the
                    belt, upcoming title bouts, and a complete history of the {name}.
                  </p>

                  <div
                    className={`flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-primary ${HOVER_TEXT[accent]} transition-colors`}
                  >
                    <span>Enter</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>

                {/* Corner rivets */}
                <CornerRivets />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="scoreboard-panel p-4 sm:p-6 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border" />

        <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
          Data updates nightly ~3:30 AM Pacific (winter) / 4:30 AM (summer)
        </p>

        {/* Corner rivets */}
        <CornerRivets />
      </footer>
    </article>
  )
}
