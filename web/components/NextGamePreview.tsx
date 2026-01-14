'use client'

import { useMemo } from 'react'
import type { Game, FranchiseInfo } from '@/lib/types'
import { findNextTitleBout } from '@/lib/beltTracker'
import { getTeamColor } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface NextGamePreviewProps {
  league: 'nba' | 'wnba'
  currentHolder: string
  games: Game[]
  franchises: FranchiseInfo[]
}

export default function NextGamePreview({
  league,
  currentHolder,
  games,
  franchises,
}: NextGamePreviewProps) {
  const nextGame = useMemo(() => {
    return findNextTitleBout(games, currentHolder, franchises)
  }, [games, currentHolder, franchises])

  const leagueUpper = league.toUpperCase()

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00') // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // Determine if it's a home or away game for the belt holder
  const isHolderHome = nextGame?.homeTeam === currentHolder

  // If no next game found, show TBD
  if (!nextGame) {
    const currentYear = new Date().getFullYear()
    const seasonYear =
      league === 'nba'
        ? `${currentYear}-${(currentYear + 1).toString().slice(2)}`
        : currentYear.toString()
    const wikiLink =
      league === 'wnba'
        ? `https://en.wikipedia.org/wiki/${currentYear}_WNBA_season`
        : `https://en.wikipedia.org/wiki/${currentYear}-${(currentYear + 1).toString().slice(2)}_NBA_season`

    return (
      <div
        data-card="next-game"
        className="scoreboard-panel p-3 sm:p-4 md:p-6 relative overflow-hidden h-full flex flex-col"
      >
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
        <div className="relative z-10 flex flex-col flex-1 justify-between">
          <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 text-center">
            <span aria-hidden="true">◆ </span>
            <h2 className="inline font-normal">Next Title Bout</h2>
            <span aria-hidden="true"> ◆</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-3 sm:mb-4">
              <div
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-mono tracking-[0.15em] sm:tracking-[0.2em] led-text"
                style={{ color: 'hsl(var(--led-amber))' }}
              >
                TBD
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-3 sm:mb-4" />
            <div className="text-center px-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                Check the{' '}
                <a
                  href={wikiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 underline"
                >
                  {seasonYear} {leagueUpper} season
                </a>{' '}
                for schedule updates.
              </p>
            </div>
          </div>
          <div className="text-center pt-3 sm:pt-4">
            <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-mono text-muted-foreground uppercase tracking-wide sm:tracking-wider">
              ▸ Awaiting Schedule ◂
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      data-card="next-game"
      className="scoreboard-panel p-3 sm:p-4 md:p-6 relative overflow-hidden h-full flex flex-col"
    >
      {/* Top LED status bar */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 text-center">
          <span aria-hidden="true">◆ </span>
          <h2 className="inline font-normal">Next Title Bout</h2>
          <span aria-hidden="true"> ◆</span>
        </div>

        {/* Matchup Display */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Date */}
          <div className="text-center mb-3 sm:mb-4">
            <div
              className="text-lg sm:text-xl md:text-2xl font-mono tracking-[0.1em] led-text"
              style={{ color: 'hsl(var(--led-amber))' }}
            >
              {formatDate(nextGame.date)}
            </div>
          </div>

          {/* Teams - Always Away @ Home */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4">
            {/* Away Team (Left) */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 relative">
                <TeamLogo
                  teamCode={nextGame.awayTeam}
                  franchises={franchises}
                  league={league}
                  size="md"
                  className="w-full h-full"
                />
                {/* Belt indicator for away team if they're the champion */}
                {!isHolderHome && (
                  <div className="absolute -top-1 -right-1 text-amber-500 text-xs sm:text-sm">
                    🏆
                  </div>
                )}
              </div>
              <div className="text-center">
                <div
                  className="text-xs sm:text-sm md:text-base font-mono tracking-wider led-text truncate max-w-[80px] sm:max-w-[100px]"
                  style={{ color: getTeamColor(nextGame.awayTeam, franchises) || 'hsl(var(--led-amber))' }}
                >
                  {nextGame.awayTeam}
                </div>
                <div className="text-[0.5rem] sm:text-[0.6rem] text-muted-foreground uppercase tracking-wide">
                  {isHolderHome ? 'Challenger' : 'Champion'}
                </div>
              </div>
            </div>

            {/* @ */}
            <div className="flex flex-col items-center px-2">
              <div
                className="text-lg sm:text-xl md:text-2xl font-display tracking-wider led-text"
                style={{ color: 'hsl(var(--led-red))' }}
              >
                @
              </div>
            </div>

            {/* Home Team (Right) */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 relative">
                <TeamLogo
                  teamCode={nextGame.homeTeam}
                  franchises={franchises}
                  league={league}
                  size="md"
                  className="w-full h-full"
                />
                {/* Belt indicator for home team if they're the champion */}
                {isHolderHome && (
                  <div className="absolute -top-1 -right-1 text-amber-500 text-xs sm:text-sm">
                    🏆
                  </div>
                )}
              </div>
              <div className="text-center">
                <div
                  className="text-xs sm:text-sm md:text-base font-mono tracking-wider led-text truncate max-w-[80px] sm:max-w-[100px]"
                  style={{ color: getTeamColor(nextGame.homeTeam, franchises) || 'hsl(var(--led-green))' }}
                >
                  {nextGame.homeTeam}
                </div>
                <div className="text-[0.5rem] sm:text-[0.6rem] text-muted-foreground uppercase tracking-wide">
                  {isHolderHome ? 'Champion' : 'Challenger'}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Status indicator */}
        <div className="text-center pt-3 sm:pt-4">
          <div className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] font-mono text-muted-foreground uppercase tracking-wide sm:tracking-wider">
            ▸ Title Defense #{getCurrentDefenseNumber(games, currentHolder, franchises)} ◂
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Count how many title defenses the current holder has had (completed games where they had the belt)
 */
function getCurrentDefenseNumber(
  games: Game[],
  currentHolder: string,
  franchises: FranchiseInfo[]
): number {
  // This is a simplified count - just counting scheduled games would work for display
  // For now, return a placeholder
  return 1
}
