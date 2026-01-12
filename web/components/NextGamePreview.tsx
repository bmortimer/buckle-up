export default function NextGamePreview() {
  return (
    <div data-card="next-game" className="scoreboard-panel p-3 sm:p-4 md:p-6 relative overflow-hidden h-full flex flex-col">
      {/* Top LED status bar - matches BeltHolderCard style */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

      <div className="relative z-10 flex flex-col flex-1 justify-between">
        {/* Header */}
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 text-center">
          ◆ Next Title Bout ◆
        </div>

        {/* TBD State - centered vertically */}
        <div className="flex-1 flex flex-col justify-center">
          {/* TBD Display */}
          <div className="text-center mb-3 sm:mb-4">
            <div
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-mono tracking-[0.15em] sm:tracking-[0.2em] led-text"
              style={{
                color: 'hsl(var(--led-amber))',
              }}
            >
              TBD
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-3 sm:mb-4" />

          {/* Explanation */}
          <div className="text-center px-2">
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
              The 2026 season schedule is not yet available due to the lapse in the {' '}
              <a
                href="https://en.wikipedia.org/wiki/2026_WNBA_season"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:opacity-80 underline"
              >
                collective bargaining agreement
              </a>
              .
            </p>
          </div>
        </div>

        {/* Status indicator - anchored to bottom */}
        <div className="text-center pt-3 sm:pt-4">
          <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-mono text-muted-foreground uppercase tracking-wide sm:tracking-wider">
            ▸ Awaiting Schedule Release ◂
          </div>
        </div>
      </div>

    </div>
  )
}
