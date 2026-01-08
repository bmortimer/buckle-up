import type { TeamBeltStats, FranchiseInfo } from '@/lib/types'
import { getTeamColor, getTeamDisplayName } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface BeltHolderCardProps {
  currentHolder: string
  stats: TeamBeltStats | undefined
  franchises: FranchiseInfo[]
  isPastSeason?: boolean
}

export default function BeltHolderCard({ currentHolder, stats, franchises, isPastSeason = false }: BeltHolderCardProps) {
  const color = getTeamColor(currentHolder, franchises)
  const displayName = getTeamDisplayName(currentHolder, franchises)

  return (
    <div data-card="current-holder" className="scoreboard-panel p-4 sm:p-6 md:p-8 text-center relative overflow-hidden">
      {/* LED status bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />

      <div className="relative z-10">
        <div className="text-[0.6rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 md:mb-8 font-orbitron">
          {isPastSeason ? '◆ SEASON CHAMPION ◆' : '◆ BELT HOLDER ◆'}
        </div>

        {/* Team Logo */}
        <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
          <TeamLogo teamCode={currentHolder} franchises={franchises} size="xl" />
        </div>

        {/* Team code in giant LED style */}
        <div
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-mono mb-2 sm:mb-3 tabular-nums tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] led-text"
          style={{
            color: 'hsl(var(--led-red))',
          }}
        >
          {currentHolder}
        </div>

        <div className="text-sm sm:text-base md:text-lg text-foreground mb-4 sm:mb-6 md:mb-8 font-orbitron tracking-wide sm:tracking-wider uppercase">
          {displayName}
        </div>

        {/* Divider line */}
        <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-border to-transparent mb-4 sm:mb-6 md:mb-8" />

        {stats && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6">
            {/* Belt Games */}
            <div className="scoreboard-panel p-2 sm:p-3 md:p-4">
              <div
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums led-text mb-1 sm:mb-2"
                style={{ color: 'hsl(var(--led-green))' }}
              >
                {stats.totalGames}
              </div>
              <div className="text-[0.5rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-wider sm:tracking-widest text-muted-foreground font-orbitron">
                BELT<br/>GAMES
              </div>
            </div>

            {/* Record */}
            <div className="scoreboard-panel p-2 sm:p-3 md:p-4">
              <div
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums led-text mb-1 sm:mb-2"
                style={{ color: 'hsl(var(--led-amber))' }}
              >
                {stats.wins}-{stats.losses}
              </div>
              <div className="text-[0.5rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-wider sm:tracking-widest text-muted-foreground font-orbitron">
                W-L<br/>RECORD
              </div>
            </div>

            {/* Longest Streak */}
            <div className="scoreboard-panel p-2 sm:p-3 md:p-4">
              <div
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tabular-nums led-text mb-1 sm:mb-2"
                style={{ color: 'hsl(var(--led-red))' }}
              >
                {stats.longestReign}
              </div>
              <div className="text-[0.5rem] sm:text-[0.6rem] md:text-[0.65rem] uppercase tracking-wider sm:tracking-widest text-muted-foreground font-orbitron">
                LONGEST<br/>STREAK
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Corner rivets for retro hardware look */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
    </div>
  )
}
