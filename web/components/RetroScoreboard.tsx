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
  return (
    <div
      data-card="season-stats"
      className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden"
    >
      {/* Top LED status bar - shown/hidden by CSS based on theme */}
      <div className="led-bar-top" />

      <div className="relative z-10">
        {/* Header */}
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-2 sm:mb-3 md:mb-4 text-center font-normal">
          <span aria-hidden="true">◆ </span>
          {isAllTime ? 'All Time Stats' : 'Season Stats'}
          <span aria-hidden="true"> ◆</span>
        </h2>

        {/* Stats Grid */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-8">
          {/* Games stat */}
          <div className="text-center">
            <div
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 led-text"
              style={{
                color: 'hsl(var(--led-red))',
              }}
            >
              {totalGames}
            </div>
            <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-orbitron uppercase tracking-wide sm:tracking-wider text-muted-foreground">
              GAMES
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 sm:h-10 md:h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Title Bouts stat */}
          <div className="text-center">
            <div
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 led-text"
              style={{
                color: 'hsl(var(--led-amber))',
              }}
            >
              {totalTitleBouts}
            </div>
            <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-orbitron uppercase tracking-wide sm:tracking-wider text-muted-foreground">
              TITLE BOUTS
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 sm:h-10 md:h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Changes stat */}
          <div className="text-center">
            <div
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 led-text"
              style={{
                color: 'hsl(var(--led-green))',
              }}
            >
              {totalChanges}
            </div>
            <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-orbitron uppercase tracking-wide sm:tracking-wider text-muted-foreground">
              BELT CHANGES
            </div>
          </div>
        </div>
      </div>

      {/* Bottom LED bar - shown/hidden by CSS based on theme */}
      <div className="led-bar-bottom" />

      {/* Corner rivets for retro hardware look */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
    </div>
  )
}
