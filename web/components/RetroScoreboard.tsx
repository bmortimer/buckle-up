import { Fragment } from 'react'
import CornerRivets from './CornerRivets'

interface RetroScoreboardProps {
  totalGames: number
  totalChanges: number
  totalTitleBouts: number
  isAllTime?: boolean
}

export default function RetroScoreboard({
  totalGames,
  totalChanges,
  totalTitleBouts,
  isAllTime = false,
}: RetroScoreboardProps) {
  const stats = [
    { label: 'GAMES', value: totalGames, color: '--led-red' },
    { label: 'TITLE BOUTS', value: totalTitleBouts, color: '--led-amber' },
    { label: 'BELT CHANGES', value: totalChanges, color: '--led-green' },
  ]

  return (
    <div
      data-card="season-stats"
      className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden"
    >
      {/* Top LED status bar - shown/hidden by CSS based on theme */}
      <div className="led-bar-top" />

      <div className="relative z-10">
        {/* Header */}
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] pl-[0.15em] sm:tracking-[0.2em] sm:pl-[0.2em] text-muted-foreground mb-2 sm:mb-3 md:mb-4 text-center font-normal">
          <span aria-hidden="true">◆ </span>
          {isAllTime ? 'All Time Stats' : 'Season Stats'}
          <span aria-hidden="true"> ◆</span>
        </h2>

        {/* Stats Grid. Equal-width columns (each 1fr grows to the widest
            column's content because the grid is w-fit), so the dividers are
            evenly spaced and the middle stat sits at the panel's center. */}
        <div className="mx-auto grid w-fit grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-x-3 sm:gap-x-5 md:gap-x-8">
          {stats.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && <div className="h-8 sm:h-10 md:h-12 w-px bg-border" aria-hidden="true" />}
              <div className="text-center">
                {/* letter-spacing adds trailing space after the last glyph;
                    matching left padding keeps the text optically centered */}
                <div
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums tracking-[0.15em] pl-[0.15em] sm:tracking-[0.2em] sm:pl-[0.2em] mb-0.5 sm:mb-1 led-text"
                  style={{ color: `hsl(var(${stat.color}))` }}
                >
                  {stat.value}
                </div>
                <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-orbitron uppercase tracking-wide pl-[0.025em] sm:tracking-wider sm:pl-[0.05em] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Bottom LED bar - shown/hidden by CSS based on theme */}
      <div className="led-bar-bottom" />

      {/* Corner rivets for retro hardware look */}
      <CornerRivets />
    </div>
  )
}
