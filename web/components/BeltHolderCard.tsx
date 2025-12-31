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
    <div className="scoreboard-panel p-8 text-center relative overflow-hidden">
      {/* LED status bar at top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />

      <div className="relative z-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 font-orbitron">
          {isPastSeason ? '◆ SEASON CHAMPION ◆' : '◆ BELT HOLDER ◆'}
        </div>

        {/* Team Logo */}
        <div className="flex justify-center mb-6">
          <TeamLogo teamCode={currentHolder} franchises={franchises} size="xl" />
        </div>

        {/* Team code in giant LED style */}
        <div
          className="text-8xl font-mono mb-3 tabular-nums tracking-[0.3em] led-text"
          style={{
            color: 'hsl(var(--led-red))',
          }}
        >
          {currentHolder}
        </div>

        <div className="text-lg text-foreground mb-8 font-orbitron tracking-wider uppercase">
          {displayName}
        </div>

        {/* Divider line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        {stats && (
          <div className="grid grid-cols-3 gap-6">
            {/* Belt Games */}
            <div className="scoreboard-panel p-4">
              <div
                className="text-5xl font-mono tabular-nums led-text mb-2"
                style={{ color: 'hsl(var(--led-green))' }}
              >
                {stats.totalGames}
              </div>
              <div className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-orbitron">
                BELT<br/>GAMES
              </div>
            </div>

            {/* Record */}
            <div className="scoreboard-panel p-4">
              <div
                className="text-5xl font-mono tabular-nums led-text mb-2"
                style={{ color: 'hsl(var(--led-amber))' }}
              >
                {stats.wins}-{stats.losses}
              </div>
              <div className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-orbitron">
                W-L<br/>RECORD
              </div>
            </div>

            {/* Longest Streak */}
            <div className="scoreboard-panel p-4">
              <div
                className="text-5xl font-mono tabular-nums led-text mb-2"
                style={{ color: 'hsl(var(--led-red))' }}
              >
                {stats.longestReign}
              </div>
              <div className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-orbitron">
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
