export default function NextGamePreview() {
  // Stubbed data for now
  const nextGame = {
    date: 'Friday, May 15, 2026',
    time: '7:00 PM ET',
    opponent: 'Washington Mystics',
    location: 'Capital One Arena',
    isAway: true,
  }

  return (
    <div data-card="next-game" className="scoreboard-panel p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Top LED status bar - different color to distinguish */}
      <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-amber-500 opacity-70" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-2 sm:mb-3 md:mb-4 text-center">
          ◆ Next Title Bout
        </div>

        {/* Game Info */}
        <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
          {/* Date & Time */}
          <div className="text-center">
            <div
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-mono tracking-[0.1em] sm:tracking-[0.15em] mb-0.5 sm:mb-1 led-text"
              style={{
                color: 'hsl(var(--led-amber))',
              }}
            >
              {nextGame.date}
            </div>
            <div className="text-xs sm:text-sm font-mono text-muted-foreground tracking-wide sm:tracking-wider">
              {nextGame.time}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Opponent */}
          <div className="text-center">
            <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-orbitron uppercase tracking-wide sm:tracking-wider text-muted-foreground mb-1 sm:mb-2">
              {nextGame.isAway ? '@ OPPONENT' : 'VS OPPONENT'}
            </div>
            <div
              className="text-xl sm:text-2xl md:text-3xl font-mono tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 led-text"
              style={{
                color: 'hsl(var(--led-red))',
              }}
            >
              WSH
            </div>
            <div className="text-xs sm:text-sm font-orbitron text-foreground">
              {nextGame.opponent}
            </div>
          </div>

          {/* Location */}
          <div className="text-center pt-1 sm:pt-2">
            <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-mono text-muted-foreground uppercase tracking-wide sm:tracking-wider">
              ▸ {nextGame.location} ◂
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar with pulsing indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 opacity-40 animate-pulse" />
    </div>
  )
}
