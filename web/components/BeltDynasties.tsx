import type { BeltChange, FranchiseInfo } from '@/lib/types'
import { getTeamColor, getTeamDisplayName } from '@/lib/franchises'
import TeamLogo from './TeamLogo'
import MedalIcon from './MedalIcon'

interface Dynasty {
  team: string
  startDate: string
  endDate: string
  games: number
  wins: number
}

interface BeltDynastiesProps {
  changes: BeltChange[]
  franchises: FranchiseInfo[]
}

export default function BeltDynasties({ changes, franchises }: BeltDynastiesProps) {
  // Calculate dynasties (continuous reigns)
  const dynasties: Dynasty[] = []
  let currentDynasty: Dynasty | null = null

  changes.forEach((change, index) => {
    if (!currentDynasty || currentDynasty.team !== change.toTeam) {
      // Save previous dynasty if it exists
      if (currentDynasty) {
        dynasties.push(currentDynasty)
      }
      // Start new dynasty
      currentDynasty = {
        team: change.toTeam,
        startDate: change.game.date,
        endDate: change.game.date,
        games: 1,
        wins: 1,
      }
    } else {
      // Continue current dynasty
      currentDynasty.endDate = change.game.date
      currentDynasty.games++
      currentDynasty.wins++
    }
  })

  // Don't forget the last dynasty
  if (currentDynasty) {
    dynasties.push(currentDynasty)
  }

  // Sort by games (longest reigns first) and take top 5
  const topDynasties = dynasties.sort((a, b) => b.games - a.games).slice(0, 5)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-bebas tracking-wider mb-6">Belt Dynasties</h3>

      <div className="space-y-3">
        {topDynasties.map((dynasty, index) => {
          const color = getTeamColor(dynasty.team, franchises)
          const displayName = getTeamDisplayName(dynasty.team, franchises)
          const showMedal = index < 3

          return (
            <div
              key={`${dynasty.team}-${dynasty.startDate}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 group"
            >
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {showMedal ? (
                  <MedalIcon rank={(index + 1) as 1 | 2 | 3} />
                ) : (
                  <span className="text-sm font-bebas text-muted-foreground">#{index + 1}</span>
                )}
              </div>

              {/* Team Logo */}
              <TeamLogo teamCode={dynasty.team} franchises={franchises} size="xs" />

              {/* Team Name and Dates */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color }}>
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(dynasty.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {' - '}
                  {new Date(dynasty.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-lg font-bebas tabular-nums" style={{ color }}>
                  {dynasty.games}
                </div>
                <div className="text-xs text-muted-foreground font-bebas">GAMES</div>
              </div>
            </div>
          )
        })}
      </div>

      {topDynasties.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No dynasties yet this season
        </div>
      )}
    </div>
  )
}
