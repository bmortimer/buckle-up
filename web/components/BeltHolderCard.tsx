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
        <div className="text-[0.6rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 font-orbitron text-center">
          {isPastSeason ? '◆ SEASON CHAMPION ◆' : '◆ BELT HOLDER ◆'}
        </div>

        {/* Main content: Logo/Team on left, Stats on right */}
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
          {/* Left: Team Logo and Name */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Team Logo */}
            <div className="mb-3 sm:mb-4">
              <TeamLogo teamCode={currentHolder} franchises={franchises} size="xl" />
            </div>

            {/* Team code in giant LED style */}
            <div
              className="text-5xl sm:text-6xl md:text-7xl font-mono mb-2 tabular-nums tracking-[0.2em] sm:tracking-[0.25em] led-text"
              style={{
                color: 'hsl(var(--led-red))',
              }}
            >
              {currentHolder}
            </div>

            <div className="text-sm sm:text-base md:text-lg text-foreground font-orbitron tracking-wide sm:tracking-wider uppercase">
              {displayName}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="sm:hidden h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Right: Stats stacked */}
          {stats && (
            <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 justify-center">
              {/* Belt Games */}
              <div className="scoreboard-panel p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px]">
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-mono tabular-nums led-text mb-1"
                  style={{ color: 'hsl(var(--led-green))' }}
                >
                  {stats.totalGames}
                </div>
                <div className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider text-muted-foreground font-orbitron">
                  BELT GAMES
                </div>
              </div>

              {/* Record */}
              <div className="scoreboard-panel p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px]">
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-mono tabular-nums led-text mb-1"
                  style={{ color: 'hsl(var(--led-amber))' }}
                >
                  {stats.wins}-{stats.losses}
                </div>
                <div className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider text-muted-foreground font-orbitron">
                  W-L RECORD
                </div>
              </div>

              {/* Longest Streak */}
              <div className="scoreboard-panel p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px]">
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-mono tabular-nums led-text mb-1"
                  style={{ color: 'hsl(var(--led-red))' }}
                >
                  {stats.longestReign}
                </div>
                <div className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider text-muted-foreground font-orbitron">
                  LONGEST STREAK
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corner rivets for retro hardware look */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
    </div>
  )
}
