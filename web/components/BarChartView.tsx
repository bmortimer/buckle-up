import type { TeamBeltStats, FranchiseInfo, Game } from '@/lib/types'
import { getTeamColor, getTeamDisplayName } from '@/lib/franchises'
import TeamLogo from './TeamLogo'
import { useState } from 'react'

interface BarChartViewProps {
  teams: TeamBeltStats[]
  franchises: FranchiseInfo[]
  allGames: Game[]
  selectedTeam?: string | null
}

type SortOption = 'games' | 'wins' | 'streak' | 'winpct'

export default function BarChartView({ teams, franchises, allGames, selectedTeam }: BarChartViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('wins')
  // Get all unique teams from the games
  const allTeams = new Set<string>()
  allGames.forEach(game => {
    allTeams.add(game.homeTeam)
    allTeams.add(game.awayTeam)
  })

  // Create a map of belt stats for quick lookup
  const beltStatsMap = new Map(teams.map(t => [t.team, t]))

  // Merge all teams with their belt stats (0 if they never held the belt)
  const allTeamsStats: TeamBeltStats[] = Array.from(allTeams).map(teamCode => {
    return beltStatsMap.get(teamCode) || {
      team: teamCode,
      timesHeld: 0,
      totalGames: 0,
      longestReign: 0,
      wins: 0,
      losses: 0,
    }
  })

  // Sort based on selected option
  const sortedTeams = allTeamsStats.sort((a, b) => {
    switch (sortBy) {
      case 'wins':
        return b.wins - a.wins
      case 'streak':
        return b.longestReign - a.longestReign
      case 'winpct':
        const pctA = a.totalGames > 0 ? a.wins / a.totalGames : 0
        const pctB = b.totalGames > 0 ? b.wins / b.totalGames : 0
        return pctB - pctA
      case 'games':
      default:
        return b.totalGames - a.totalGames
    }
  })

  const maxValue = sortBy === 'winpct'
    ? 1
    : sortedTeams[0]?.[sortBy === 'wins' ? 'wins' : sortBy === 'streak' ? 'longestReign' : 'totalGames'] || 1

  return (
    <div data-card="team-stats" className="scoreboard-panel p-4 sm:p-6">
      {/* Header with sort controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b-2 border-border pb-3">
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground text-center sm:text-left">
          ◆ Bouts By Team ◆
        </div>

        <div className="flex gap-1.5 justify-center sm:justify-end" role="group" aria-label="Sort options">
          {[
            { value: 'wins', label: 'Wins' },
            { value: 'games', label: 'Games' },
            { value: 'winpct', label: 'Win%' },
            { value: 'streak', label: 'Streak' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortOption)}
              className={`px-2 sm:px-2.5 py-1 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                sortBy === option.value
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                  : 'bg-card text-muted-foreground border-border hover:border-muted-foreground'
              }`}
              aria-pressed={sortBy === option.value}
              aria-label={`Sort by ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {sortedTeams.map((team, index) => {
          const winPct = team.totalGames > 0 ? team.wins / team.totalGames : 0
          const value = sortBy === 'wins' ? team.wins : sortBy === 'streak' ? team.longestReign : sortBy === 'winpct' ? winPct : team.totalGames
          const percentage = sortBy === 'winpct' ? winPct * 100 : (value / maxValue) * 100
          const isSelected = selectedTeam === team.team
          const isGreyedOut = selectedTeam && !isSelected
          const color = isGreyedOut ? 'hsl(var(--muted-foreground))' : getTeamColor(team.team, franchises)
          const teamDisplayName = getTeamDisplayName(team.team, franchises)

          return (
            <div key={team.team} className="flex items-center gap-3 group" title={teamDisplayName}>
              {/* Rank number */}
              <div className="w-6 flex justify-center">
                <span className="text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {index + 1}
                </span>
              </div>

              {/* Team Logo */}
              <TeamLogo teamCode={team.team} franchises={franchises} size="xs" />

              {/* LED bar display */}
              <div className="flex-1 bg-black/40 h-7 overflow-hidden relative border border-border/30">
                {/* Segmented LED bar */}
                <div
                  className={`h-full flex items-center px-2.5 transition-all duration-300 relative ${isSelected ? 'ring-1 ring-amber-500' : ''}`}
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color} 90%, transparent 100%)`,
                    boxShadow: isGreyedOut ? 'none' : `0 0 10px ${color}40, inset 0 1px 2px rgba(255,255,255,0.2)`
                  }}
                >
                  {/* LED segments overlay */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 5px)'
                    }}
                  />

                  <span
                    className="text-xs font-mono text-white whitespace-nowrap tabular-nums relative z-10"
                    style={{
                      textShadow: isGreyedOut ? 'none' : '0 0 4px currentColor, 0 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    {sortBy === 'winpct'
                      ? `${(winPct * 100).toFixed(1)}% (${team.wins}-${team.losses})`
                      : sortBy === 'games'
                        ? `${value} (${team.wins}-${team.losses})`
                        : `${value}`
                    }
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
