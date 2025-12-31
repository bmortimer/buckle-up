interface RetroScoreboardProps {
  totalGames: number
  totalChanges: number
  season?: string
  champion?: string
}

export default function RetroScoreboard({ totalGames, totalChanges, season, champion }: RetroScoreboardProps) {
  return (
    <div className="scoreboard-panel p-6 relative overflow-hidden">
      {/* Top LED status bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 opacity-70" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-[0.65rem] font-orbitron uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          ◆ Season Stats
        </div>

        {/* Stats Grid */}
        <div className="flex items-center justify-center gap-8">
          {/* Games stat */}
          <div className="text-center">
            <div
              className="text-5xl font-mono tabular-nums tracking-[0.2em] mb-1 led-text"
              style={{
                color: 'hsl(var(--led-red))',
              }}
            >
              {totalGames}
            </div>
            <div className="text-[0.6rem] font-orbitron uppercase tracking-wider text-muted-foreground">
              GAMES
            </div>
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Changes stat */}
          <div className="text-center">
            <div
              className="text-5xl font-mono tabular-nums tracking-[0.2em] mb-1 led-text"
              style={{
                color: 'hsl(var(--led-green))',
              }}
            >
              {totalChanges}
            </div>
            <div className="text-[0.6rem] font-orbitron uppercase tracking-wider text-muted-foreground">
              CHANGES
            </div>
          </div>

          {/* Champion info if present */}
          {season && champion && (
            <>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center">
                <div
                  className="text-4xl font-mono tracking-[0.2em] mb-1 led-text"
                  style={{ color: 'hsl(var(--led-amber))' }}
                >
                  {champion}
                </div>
                <div className="text-[0.6rem] font-orbitron uppercase tracking-wider text-muted-foreground">
                  {season} CHAMP
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 opacity-40" />
    </div>
  )
}
