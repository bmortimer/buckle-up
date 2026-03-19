import type { TeamBeltStats, FranchiseInfo, Game, League } from '@/lib/types'
import { getTeamColor, getTeamDisplayName, dedupeByFranchise } from '@/lib/franchises'
import TeamLogo from './TeamLogo'
import { useState } from 'react'

interface BarChartViewProps {
  teams: TeamBeltStats[]
  franchises: FranchiseInfo[]
  allGames: Game[]
  selectedTeam?: string | null
  league: League
  isAllTime?: boolean
}

type SortOption = 'games' | 'wins' | 'streak' | 'winpct'

export default function BarChartView({
  teams,
  franchises,
  allGames,
  selectedTeam,
  league = 'wnba',
  isAllTime = false,
}: BarChartViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('wins')
  // Get all unique teams from the games
  const allTeams = new Set<string>()
  allGames.forEach((game) => {
    allTeams.add(game.homeTeam)
    allTeams.add(game.awayTeam)
  })

  // Create a map of belt stats for quick lookup
  const beltStatsMap = new Map(teams.map((t) => [t.team, t]))

  // Merge all teams with their belt stats (0 if they never held the belt)
  // In All Time mode, merge by franchise (e.g., UTA -> LVA)
  let allTeamsStats: TeamBeltStats[]

  if (isAllTime) {
    // Dedupe teams by franchise
    const franchiseAbbrs = dedupeByFranchise(allTeams, franchises)

    allTeamsStats = franchiseAbbrs.map((franchiseAbbr) => {
      return (
        beltStatsMap.get(franchiseAbbr) || {
          team: franchiseAbbr,
          timesHeld: 0,
          totalGames: 0,
          longestReign: 0,
          wins: 0,
          losses: 0,
        }
      )
    })
  } else {
    allTeamsStats = Array.from(allTeams).map((teamCode) => {
      return (
        beltStatsMap.get(teamCode) || {
          team: teamCode,
          timesHeld: 0,
          totalGames: 0,
          longestReign: 0,
          wins: 0,
          losses: 0,
        }
      )
    })
  }

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

  const maxValue =
    sortBy === 'winpct'
      ? 1
      : sortedTeams[0]?.[
          sortBy === 'wins' ? 'wins' : sortBy === 'streak' ? 'longestReign' : 'totalGames'
        ] || 1

  return (
    <div
      data-card="team-stats"
      className="scoreboard-panel px-2 lg:px-6 py-3 sm:py-4 md:py-6 relative overflow-hidden"
    >
      {/* Header with sort controls */}
      <div className="flex flex-col items-center gap-3 mb-6 border-b-2 border-border pb-3">
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground text-center font-normal">
          <span aria-hidden="true">◆ </span>
          Bouts By Team
          <span aria-hidden="true"> ◆</span>
        </h2>

        <div
          className="flex flex-wrap gap-1.5 justify-center"
          role="group"
          aria-label="Sort options"
        >
          {[
            { value: 'wins', label: 'Wins' },
            { value: 'games', label: 'Games' },
            { value: 'winpct', label: 'Win%' },
            { value: 'streak', label: 'Streak' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortOption)}
              className={`px-3 sm:px-4 py-2 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
          const value =
            sortBy === 'wins'
              ? team.wins
              : sortBy === 'streak'
                ? team.longestReign
                : sortBy === 'winpct'
                  ? winPct
                  : team.totalGames
          const percentage = sortBy === 'winpct' ? winPct * 100 : (value / maxValue) * 100
          const isSelected = selectedTeam === team.team
          const isGreyedOut = selectedTeam && !isSelected
          const color = isGreyedOut
            ? 'hsl(var(--muted-foreground))'
            : getTeamColor(team.team, franchises)
          const teamDisplayName = getTeamDisplayName(team.team, franchises)

          return (
            <div
              key={team.team}
              className="flex items-center gap-2 lg:gap-3 group"
              title={teamDisplayName}
            >
              {/* Rank number - hidden until hover */}
              <div className="w-6 flex justify-center">
                <span className="text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {index + 1}
                </span>
              </div>

              {/* Team abbreviation - hidden until hover */}
              <div className="w-8 flex justify-center">
                <span className="text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {team.team}
                </span>
              </div>

              {/* Team Logo */}
              <TeamLogo teamCode={team.team} franchises={franchises} league={league} size="sm" />

              {/* LED bar display */}
              <div className="flex-1 bg-black/40 h-7 overflow-hidden relative border border-border/30">
                {/* Segmented LED bar */}
                <div
                  className={`h-full flex items-center px-2.5 transition-all duration-300 relative ${isSelected ? 'ring-1 ring-amber-500' : ''}`}
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color} 90%, transparent 100%)`,
                    boxShadow: isGreyedOut
                      ? 'none'
                      : `0 0 10px ${color}40, inset 0 1px 2px rgba(255,255,255,0.2)`,
                    borderTop: '1px solid rgba(255,255,255,0.3)',
                    borderBottom: '1px solid rgba(0,0,0,0.3)',
                  }}
                >
                  {/* LED segments overlay */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 5px)',
                    }}
                  />

                  <span
                    className="text-xs font-mono text-white whitespace-nowrap tabular-nums relative z-10"
                    style={{
                      textShadow: isGreyedOut
                        ? 'none'
                        : '0 0 4px currentColor, 0 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {sortBy === 'winpct'
                      ? `${(winPct * 100).toFixed(1)}% (${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ''})`
                      : sortBy === 'games'
                        ? `${value} (${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ''})`
                        : `${value}`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Corner rivets for retro hardware look */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
    </div>
  )
}
