'use client'

import { useMemo } from 'react'
import type { BeltHistory, FranchiseInfo, League } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface Last5BeltChangesProps {
  league: League
  history: BeltHistory
  franchises: FranchiseInfo[]
}

export default function Last5BeltChanges({
  league,
  history,
  franchises,
}: Last5BeltChangesProps) {
  const last5Changes = useMemo(() => {
    return history.changes
      .filter(change => change.reason === 'loss')
      .slice(-5) // Get last 5 changes, chronologically oldest to newest
  }, [history.changes])

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
  }

  if (last5Changes.length === 0) {
    return (
      <div data-card="last-5-changes" className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="led-bar-top" />
        <div className="relative z-10">
          <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 text-center font-normal">
            <span aria-hidden="true">◆ </span>
            Last 5 Belt Changes
            <span aria-hidden="true"> ◆</span>
          </h2>
          <div className="text-center py-4">
            <p className="text-[0.6rem] sm:text-xs text-muted-foreground font-mono">No changes yet</p>
          </div>
        </div>
        <div className="led-bar-bottom" />

        {/* Corner rivets for retro hardware look */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      </div>
    )
  }

  // Just show the 5 winners in chronological order (left to right = old to new)
  const fullPath = last5Changes.map(c => c.toTeam)

  return (
    <div data-card="last-5-changes" className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Top LED status bar - green */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
      <div className="relative z-10">
        {/* Header */}
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 text-center font-normal">
          <span aria-hidden="true">◆ </span>
          Last 5 Belt Changes
          <span aria-hidden="true"> ◆</span>
        </h2>

        {/* Horizontal flow showing belt path */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {fullPath.map((team, idx) => {
            const isEnd = idx === fullPath.length - 1
            const changeForThisTeam = last5Changes[idx]

            return (
              <div key={`${team}-${idx}`} className="flex items-center gap-2 sm:gap-3">
                {/* Team */}
                <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <div className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10">
                    <TeamLogo
                      teamCode={team}
                      franchises={franchises}
                      league={league}
                      size="md"
                      className="w-full h-full"
                    />
                    {isEnd && (
                      <div
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor: 'hsl(var(--led-green))',
                          boxShadow: '0 0 4px hsl(var(--led-green) / 0.5)',
                        }}
                      />
                    )}
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-mono tracking-wide ${isEnd ? 'font-bold' : ''} led-text`}
                    style={{ color: getTeamColor(team, franchises) || 'hsl(var(--foreground))' }}
                  >
                    {team}
                  </div>
                  <div className="text-[0.6rem] sm:text-xs font-mono text-muted-foreground">
                    {formatDateShort(changeForThisTeam.game.date)}
                  </div>
                </div>

                {/* Arrow between teams */}
                {idx < fullPath.length - 1 && (
                  <div
                    className="text-base sm:text-lg md:text-xl led-text"
                    style={{ color: 'hsl(var(--led-amber))' }}
                  >
                    ▸
                  </div>
                )}
              </div>
            )
          })}
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
