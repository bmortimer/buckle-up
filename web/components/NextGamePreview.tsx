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
    <div data-card="next-game" className="scoreboard-panel p-6 relative overflow-hidden">
      {/* Top LED status bar - different color to distinguish */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 opacity-70" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-[0.65rem] font-orbitron uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          ◆ Next Championship Game
        </div>

        {/* Game Info */}
        <div className="space-y-3">
          {/* Date & Time */}
          <div className="text-center">
            <div
              className="text-2xl font-mono tracking-[0.15em] mb-1 led-text"
              style={{
                color: 'hsl(var(--led-amber))',
              }}
            >
              {nextGame.date}
            </div>
            <div className="text-sm font-mono text-muted-foreground tracking-wider">
              {nextGame.time}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Opponent */}
          <div className="text-center">
            <div className="text-[0.6rem] font-orbitron uppercase tracking-wider text-muted-foreground mb-2">
              {nextGame.isAway ? '@ OPPONENT' : 'VS OPPONENT'}
            </div>
            <div
              className="text-3xl font-mono tracking-[0.2em] mb-1 led-text"
              style={{
                color: 'hsl(var(--led-red))',
              }}
            >
              WSH
            </div>
            <div className="text-sm font-orbitron text-foreground">
              {nextGame.opponent}
            </div>
          </div>

          {/* Location */}
          <div className="text-center pt-2">
            <div className="text-[0.6rem] font-mono text-muted-foreground uppercase tracking-wider">
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
