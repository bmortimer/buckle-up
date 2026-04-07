'use client'

import { useMemo } from 'react'
import type { SeasonData, FranchiseInfo, League } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import { computeSeasonChampions } from '@/lib/seasonChampions'
import TeamLogo from './TeamLogo'
import CornerRivets from './CornerRivets'

interface SeasonChampionsProps {
  league: League
  seasons: Record<string, SeasonData>
  franchises: FranchiseInfo[]
  champions: Record<string, string>
  yearRange: [number, number]
}

export default function SeasonChampions({
  league,
  seasons,
  franchises,
  champions,
  yearRange,
}: SeasonChampionsProps) {
  const championEntries = useMemo(
    () => computeSeasonChampions(league, seasons, franchises, champions, yearRange),
    [league, seasons, franchises, champions, yearRange]
  )

  if (championEntries.length === 0) return null

  return (
    <div
      data-card="season-champions"
      className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden"
    >
      {/* Top LED status bar - purple */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />

      <div className="relative z-10">
        {/* Header */}
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 sm:mb-6 text-center font-normal">
          <span aria-hidden="true">◆ </span>
          Season Champions
          <span aria-hidden="true"> ◆</span>
        </h2>

        {/* Champions grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {championEntries.map((entry) => {
            const teamColor = getTeamColor(entry.team, franchises) || 'hsl(var(--foreground))'
            return (
              <div
                key={entry.team}
                className="flex flex-col items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border/50 dark:border-border"
                style={{
                  boxShadow: `0 0 8px ${teamColor}20`,
                }}
              >
                <TeamLogo teamCode={entry.team} franchises={franchises} league={league} size="sm" />
                <div
                  className="text-xs sm:text-sm font-mono tracking-wide font-bold led-text"
                  style={{ color: teamColor }}
                >
                  {entry.team}
                </div>
                {/* Stars - rows of 5 */}
                <div className="flex flex-col items-center gap-0.5" aria-label={`${entry.count} championship${entry.count !== 1 ? 's' : ''}`}>
                  {Array.from({ length: Math.ceil(entry.count / 5) }, (_, row) => (
                    <div key={row} className="flex gap-0.5">
                      {Array.from({ length: Math.min(5, entry.count - row * 5) }, (_, i) => (
                        <span
                          key={i}
                          className="text-xs sm:text-sm text-muted-foreground/60 dark:text-foreground/50"
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CornerRivets />
    </div>
  )
}
