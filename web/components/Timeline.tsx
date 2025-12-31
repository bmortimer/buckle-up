import type { BeltChange, FranchiseInfo } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface TimelineProps {
  changes: BeltChange[]
  franchises: FranchiseInfo[]
  selectedTeam?: string | null
}

export default function Timeline({ changes, franchises, selectedTeam }: TimelineProps) {
  return (
    <div className="scoreboard-panel p-6">
      {/* Header with LED indicators */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-3">
        <h3 className="text-base font-orbitron tracking-[0.2em] uppercase">
          ◆ Belt Changes
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            {changes.length.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-1.5">
        {changes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-orbitron text-sm tracking-wider">
            ═══ NO CHANGES RECORDED ═══
          </div>
        ) : (
          changes.map((change, idx) => {
            const { game } = change

            const score = game.homeTeam === change.toTeam
              ? `${game.homeScore}-${game.awayScore}`
              : `${game.awayScore}-${game.homeScore}`

            const involvesSelectedTeam = selectedTeam && (change.fromTeam === selectedTeam || change.toTeam === selectedTeam)
            const isGreyedOut = selectedTeam && !involvesSelectedTeam

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 border border-border/40 transition-all duration-200 group cursor-pointer ${
                  isGreyedOut ? 'bg-muted/20 opacity-40' : 'bg-card hover:bg-muted/30 hover:border-amber-500/50'
                }`}
              >
                {/* Date display - LED style */}
                <div className="text-xs text-muted-foreground w-16 tabular-nums font-mono">
                  {new Date(game.date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </div>

                <div className="flex items-center gap-2 flex-1">
                  {/* From team */}
                  <div className="transition-transform group-hover:scale-110">
                    <TeamLogo teamCode={change.fromTeam} franchises={franchises} size="xs" />
                  </div>

                  {/* Arrow with LED styling */}
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-px bg-gradient-to-r from-muted-foreground to-transparent group-hover:from-amber-500" />
                    <div className="text-muted-foreground group-hover:text-amber-500 transition-colors text-xs">▸</div>
                  </div>

                  {/* To team */}
                  <div className="transition-transform group-hover:scale-110">
                    <TeamLogo teamCode={change.toTeam} franchises={franchises} size="xs" />
                  </div>

                  {/* Score in LED style */}
                  <span className="text-sm ml-auto tabular-nums font-mono group-hover:text-amber-500 transition-colors">
                    {score}
                  </span>

                  {/* Position indicator */}
                  <span className="text-[0.6rem] text-muted-foreground font-mono w-6 text-right">
                    #{idx + 1}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom LED status strip */}
      <div className="mt-4 pt-3 border-t-2 border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-60" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-60" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-60" />
        </div>
        <div className="text-[0.6rem] font-mono text-muted-foreground tracking-wider">
          ▸ CHRONOLOGICAL ORDER
        </div>
      </div>
    </div>
  )
}
