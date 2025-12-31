import type { BeltChange, FranchiseInfo } from '@/lib/types'
import TeamLogo from './TeamLogo'
import { getTeamDisplayName, getTeamColor } from '@/lib/franchises'

interface ChampionshipTimelineProps {
  changes: BeltChange[]
  franchises: FranchiseInfo[]
  startingTeam: string
}

export default function ChampionshipTimeline({ changes, franchises, startingTeam }: ChampionshipTimelineProps) {
  // Take first 50 changes to keep it performant
  const displayChanges = changes.slice(0, 50)

  return (
    <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />

      <div className="relative z-10">
        <h3 className="text-xl font-bebas tracking-wider mb-4">Belt Journey</h3>
        <p className="text-sm text-muted-foreground font-bebas mb-6">
          Showing first {displayChanges.length} of {changes.length} belt changes
        </p>

      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-center gap-2 min-w-max">
          {/* Starting team */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 group">
            <div className="transition-transform group-hover:scale-110">
              <TeamLogo teamCode={startingTeam} franchises={franchises} size="sm" />
            </div>
            <div className="text-xs text-muted-foreground text-center w-20 font-bebas">
              Start
            </div>
          </div>

          {/* Belt changes */}
          {displayChanges.map((change, idx) => {
            const teamColor = getTeamColor(change.toTeam, franchises)
            return (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0 group">
                {/* Arrow with team color */}
                <svg
                  className="w-6 h-6 flex-shrink-0 transition-all"
                  fill="none"
                  stroke={teamColor}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{
                    filter: 'drop-shadow(0 0 2px ' + teamColor + '40)',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>

                {/* New holder */}
                <div className="flex flex-col items-center gap-2">
                  <div className="transition-transform group-hover:scale-110 relative">
                    <TeamLogo teamCode={change.toTeam} franchises={franchises} size="sm" />
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 blur-md transition-opacity -z-10"
                      style={{ backgroundColor: teamColor }}
                    />
                  </div>
                  <div className="text-xs text-center w-20">
                    <div className="font-medium truncate font-bebas" style={{ color: teamColor }}>
                      {getTeamDisplayName(change.toTeam, franchises).split(' ').slice(-1)[0]}
                    </div>
                    <div className="text-muted-foreground font-bebas text-[10px]">
                      {new Date(change.game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Indicator if more changes exist */}
          {changes.length > displayChanges.length && (
            <div className="flex items-center gap-2 ml-4 text-muted-foreground">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span className="text-xs">+{changes.length - displayChanges.length} more</span>
            </div>
          )}
        </div>
      </div>

        {/* Scroll hint */}
        <div className="text-xs text-muted-foreground text-center mt-2 font-bebas">
          ← Scroll to see belt history →
        </div>
      </div>
    </div>
  )
}
