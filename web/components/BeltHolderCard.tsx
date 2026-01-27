import type { TeamBeltStats, FranchiseInfo } from '@/lib/types'
import { getTeamColor, getTeamDisplayName } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface BeltHolderCardProps {
  currentHolder: string
  stats: TeamBeltStats | undefined
  franchises: FranchiseInfo[]
  isPastSeason?: boolean
  league: 'nba' | 'wnba' | 'nhl'
}

export default function BeltHolderCard({ currentHolder, stats, franchises, isPastSeason = false, league = 'wnba' }: BeltHolderCardProps) {
  const color = getTeamColor(currentHolder, franchises)
  const displayName = getTeamDisplayName(currentHolder, franchises)

  return (
    <div data-card="current-holder" className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* LED status bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />

      <div className="relative z-10">
        {/* Header - always centered */}
        <div className="text-[0.6rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 font-orbitron text-center">
          <span aria-hidden="true">◆ </span>
          <h2 className="inline font-normal">{isPastSeason ? 'Offseason Belt Holder' : 'Current Belt Holder'}</h2>
          <span aria-hidden="true"> ◆</span>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="md:hidden text-center">
          {/* Team Logo */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <TeamLogo teamCode={currentHolder} franchises={franchises} league={league} size="xl" />
          </div>

          <h3 className="text-sm sm:text-base text-foreground mb-4 sm:mb-6 font-orbitron tracking-wide sm:tracking-wider uppercase font-normal">
            {displayName}
          </h3>

          {/* Divider line */}
          <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-border to-transparent mb-4 sm:mb-6" />

          {stats && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Belt Games */}
              <div className="scoreboard-panel p-2 sm:p-3">
                <div
                  className="text-2xl sm:text-3xl font-mono tabular-nums led-text mb-1 sm:mb-2"
                  style={{ color: 'hsl(var(--led-green))' }}
                >
                  {stats.totalGames}
                </div>
                <div className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-wider sm:tracking-widest text-muted-foreground font-orbitron">
                  BELT<br/>GAMES
                </div>
              </div>

              {/* Record */}
              <div className="scoreboard-panel p-2 sm:p-3">
                <div
                  className="text-2xl sm:text-3xl font-mono tabular-nums led-text mb-1 sm:mb-2"
                  style={{ color: 'hsl(var(--led-amber))' }}
                >
                  {stats.wins}-{stats.losses}{stats.ties ? `-${stats.ties}` : ''}
                </div>
                <div className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-wider sm:tracking-widest text-muted-foreground font-orbitron">
                  W-L{stats.ties ? '-T' : ''}<br/>RECORD
                </div>
              </div>

              {/* Longest Streak */}
              <div className="scoreboard-panel p-2 sm:p-3">
                <div
                  className="text-2xl sm:text-3xl font-mono tabular-nums led-text mb-1 sm:mb-2"
                  style={{ color: 'hsl(var(--led-red))' }}
                >
                  {stats.longestReign}
                </div>
                <div className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-wider sm:tracking-widest text-muted-foreground font-orbitron">
                  LONGEST<br/>STREAK
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout: Logo left, stats right */}
        <div className="hidden md:flex gap-6 lg:gap-8">
          {/* Left side: Logo and name */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-0">
            <div className="mb-4">
              <TeamLogo teamCode={currentHolder} franchises={franchises} league={league} size="xl" />
            </div>
            <div aria-hidden="true" className="text-base lg:text-lg text-foreground font-orbitron tracking-wider uppercase text-center">
              {displayName}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Right side: Stats stacked vertically */}
          {stats && (
            <div className="flex flex-col gap-3 lg:gap-4 flex-1 min-w-0">
              {/* Belt Games */}
              <div className="scoreboard-panel p-3 lg:p-4 flex items-center gap-4">
                <div
                  className="text-3xl lg:text-4xl xl:text-5xl font-mono tabular-nums led-text"
                  style={{ color: 'hsl(var(--led-green))' }}
                >
                  {stats.totalGames}
                </div>
                <div className="text-[0.6rem] lg:text-[0.65rem] uppercase tracking-widest text-muted-foreground font-orbitron">
                  BELT GAMES
                </div>
              </div>

              {/* Record */}
              <div className="scoreboard-panel p-3 lg:p-4 flex items-center gap-4">
                <div
                  className="text-2xl lg:text-4xl xl:text-5xl font-mono tabular-nums led-text whitespace-nowrap"
                  style={{ color: 'hsl(var(--led-amber))' }}
                >
                  {stats.wins}-{stats.losses}{stats.ties ? `-${stats.ties}` : ''}
                </div>
                <div className="text-[0.6rem] lg:text-[0.65rem] uppercase tracking-widest text-muted-foreground font-orbitron">
                  W-L{stats.ties ? '-T' : ''} RECORD
                </div>
              </div>

              {/* Longest Streak */}
              <div className="scoreboard-panel p-3 lg:p-4 flex items-center gap-4">
                <div
                  className="text-3xl lg:text-4xl xl:text-5xl font-mono tabular-nums led-text"
                  style={{ color: 'hsl(var(--led-red))' }}
                >
                  {stats.longestReign}
                </div>
                <div className="text-[0.6rem] lg:text-[0.65rem] uppercase tracking-widest text-muted-foreground font-orbitron">
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
