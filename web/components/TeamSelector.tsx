'use client'

import { useState } from 'react'
import type { FranchiseInfo } from '@/lib/types'
import TeamLogo from './TeamLogo'

interface TeamSelectorProps {
  league: 'nba' | 'wnba'
  teams: string[]
  franchises: FranchiseInfo[]
  selectedTeam: string | null
  onTeamChange: (team: string | null) => void
  isAllTime?: boolean
}

// WNBA Conference organization (current active teams)
const WNBA_EASTERN_CONFERENCE = ['ATL', 'CHI', 'CON', 'IND', 'NYL', 'WAS']
const WNBA_WESTERN_CONFERENCE = ['DAL', 'LVA', 'LAS', 'MIN', 'PHO', 'SEA', 'GSV']

// NBA Conference organization (current active teams)
const NBA_EASTERN_CONFERENCE = [
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NYK', 'ORL', 'PHI', 'TOR', 'WAS'
]
const NBA_WESTERN_CONFERENCE = [
  'DAL', 'DEN', 'GSW', 'HOU', 'LAC', 'LAL', 'MEM', 'MIN', 'NOP', 'OKC', 'PHX', 'POR', 'SAC', 'SAS', 'UTA'
]

export default function TeamSelector({ league, teams, franchises, selectedTeam, onTeamChange, isAllTime = false }: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const easternConference = league === 'nba' ? NBA_EASTERN_CONFERENCE : WNBA_EASTERN_CONFERENCE
  const westernConference = league === 'nba' ? NBA_WESTERN_CONFERENCE : WNBA_WESTERN_CONFERENCE

  // Organize teams by status and conference
  const activeEast = teams.filter(t => easternConference.includes(t))
  const activeWest = teams.filter(t => westernConference.includes(t))

  // In All Time mode, only show truly defunct teams (no successor)
  // Relocated/rebranded teams are merged into their current franchise
  const former = teams.filter(t => {
    const franchise = franchises.find(f => f.teamAbbr === t)
    if (!franchise) return false

    if (isAllTime) {
      // Only show defunct teams (no successor) in All Time mode
      return franchise.status === 'defunct'
    }

    // In year-filtered mode, show all former teams
    return franchise.status === 'defunct' ||
           franchise.status === 'relocated' ||
           franchise.status === 'rebranded'
  })

  const handleTeamChange = (team: string | null) => {
    onTeamChange(team)
    setIsOpen(false)
  }

  const getTeamDisplayName = (teamAbbr: string) => {
    const franchise = franchises.find(f => f.teamAbbr === teamAbbr)
    return franchise?.displayName || teamAbbr
  }

  const displayText = selectedTeam
    ? getTeamDisplayName(selectedTeam)
    : 'ALL TEAMS'

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span id="team-filter-label" className="text-[0.65rem] sm:text-xs font-orbitron text-muted-foreground uppercase tracking-wide sm:tracking-wider">
          <span aria-hidden="true">◆ </span>Filter by Team
        </span>
      </div>

      {/* Clickable Team Display */}
      <button
        onClick={() => setIsOpen(true)}
        aria-labelledby="team-filter-label"
        aria-haspopup="dialog"
        className="w-full scoreboard-panel p-2 sm:p-3 relative group hover:border-primary transition-all active:scale-[0.98]"
      >
        {/* Team Display */}
        <div className="text-center">
          <div className="text-lg sm:text-xl md:text-lg lg:text-xl font-mono font-bold uppercase tracking-wider transition-all group-hover:scale-105" style={{ color: 'hsl(var(--primary))' }}>
            {displayText}
          </div>
          <div className="text-[0.55rem] text-muted-foreground/60 font-mono mt-1 uppercase tracking-wider">
            Click to change ▸
          </div>
        </div>
      </button>

      {/* Team Selection Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-select-dialog-title"
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl sm:max-h-[80vh] scoreboard-panel z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-muted/20 border-b-2 border-border p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 id="team-select-dialog-title" className="text-base sm:text-lg font-orbitron uppercase tracking-wider">
                  <span aria-hidden="true">◆ </span>Select Team
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-border bg-card text-muted-foreground hover:border-primary hover:text-primary active:scale-95 transition-all"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6">
                {/* ALL TEAMS Button */}
                <div>
                  <button
                    onClick={() => handleTeamChange(null)}
                    aria-current={!selectedTeam ? 'true' : undefined}
                    className={`
                      w-full px-4 py-3 text-base sm:text-lg font-mono font-bold uppercase
                      border-2 transition-all
                      ${!selectedTeam
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-[0.98]'
                      }
                    `}
                  >
                    ALL TEAMS
                  </button>
                </div>

                {/* Eastern Conference */}
                {activeEast.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Eastern Conference</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activeEast.map(team => {
                        const isSelected = selectedTeam === team
                        const displayName = getTeamDisplayName(team)

                        return (
                          <button
                            key={team}
                            onClick={() => handleTeamChange(team)}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`
                              p-3 flex flex-col items-center gap-2
                              border-2 transition-all
                              ${isSelected
                                ? 'bg-primary/10 text-primary border-primary scale-105'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo teamCode={team} franchises={franchises} league={league} size="md" />
                            <span className="text-xs sm:text-sm font-mono font-bold text-center leading-tight">
                              {displayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Western Conference */}
                {activeWest.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Western Conference</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activeWest.map(team => {
                        const isSelected = selectedTeam === team
                        const displayName = getTeamDisplayName(team)

                        return (
                          <button
                            key={team}
                            onClick={() => handleTeamChange(team)}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`
                              p-3 flex flex-col items-center gap-2
                              border-2 transition-all
                              ${isSelected
                                ? 'bg-primary/10 text-primary border-primary scale-105'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo teamCode={team} franchises={franchises} league={league} size="md" />
                            <span className="text-xs sm:text-sm font-mono font-bold text-center leading-tight">
                              {displayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Former Teams - in All Time mode, only shows defunct teams (relocated/rebranded are merged) */}
                {former.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Former Teams</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {former.map(team => {
                        const isSelected = selectedTeam === team
                        const displayName = getTeamDisplayName(team)

                        return (
                          <button
                            key={team}
                            onClick={() => handleTeamChange(team)}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`
                              p-3 flex flex-col items-center gap-2
                              border-2 transition-all
                              ${isSelected
                                ? 'bg-primary/10 text-primary border-primary scale-105'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo teamCode={team} franchises={franchises} league={league} size="md" />
                            <span className="text-xs sm:text-sm font-mono font-bold text-center leading-tight opacity-60">
                              {displayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
