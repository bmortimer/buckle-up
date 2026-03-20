'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { FranchiseInfo, League } from '@/lib/types'
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap'
import TeamLogo from './TeamLogo'

interface TeamSelectorProps {
  league: League
  teams: string[]
  franchises: FranchiseInfo[]
  selectedTeam: string | null
  onTeamChange: (team: string | null) => void
  isAllTime?: boolean
}

// WNBA Conference organization (current active teams)
const WNBA_EASTERN_CONFERENCE = ['ATL', 'CHI', 'CON', 'IND', 'NYL', 'WAS', 'TOR']
const WNBA_WESTERN_CONFERENCE = ['DAL', 'LVA', 'LAS', 'MIN', 'PHO', 'SEA', 'GSV', 'PDX']

// NBA Conference organization (current active teams)
const NBA_EASTERN_CONFERENCE = [
  'ATL',
  'BOS',
  'BKN',
  'CHA',
  'CHI',
  'CLE',
  'DET',
  'IND',
  'MIA',
  'MIL',
  'NYK',
  'ORL',
  'PHI',
  'TOR',
  'WAS',
]
const NBA_WESTERN_CONFERENCE = [
  'DAL',
  'DEN',
  'GSW',
  'HOU',
  'LAC',
  'LAL',
  'MEM',
  'MIN',
  'NOP',
  'OKC',
  'PHX',
  'POR',
  'SAC',
  'SAS',
  'UTA',
]

// NHL Conference organization (current active teams)
const NHL_EASTERN_CONFERENCE = [
  // Metropolitan Division
  'CAR',
  'CBJ',
  'NJD',
  'NYI',
  'NYR',
  'PHI',
  'PIT',
  'WSH',
  // Atlantic Division
  'BOS',
  'BUF',
  'DET',
  'FLA',
  'MTL',
  'OTT',
  'TBL',
  'TOR',
]
const NHL_WESTERN_CONFERENCE = [
  // Central Division
  'UTA',
  'CHI',
  'COL',
  'DAL',
  'MIN',
  'NSH',
  'STL',
  'WPG',
  // Pacific Division
  'ANA',
  'CGY',
  'EDM',
  'LAK',
  'SJS',
  'SEA',
  'VAN',
  'VEG',
]

export default function TeamSelector({
  league,
  teams,
  franchises,
  selectedTeam,
  onTeamChange,
  isAllTime = false,
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)

  const closeModal = useCallback(() => setIsOpen(false), [])

  // Return focus to trigger button when modal closes
  useEffect(() => {
    if (!isOpen) {
      triggerButtonRef.current?.focus()
    }
  }, [isOpen])

  useModalFocusTrap(isOpen, closeModal, modalRef, closeButtonRef)

  const easternConference =
    league === 'nba'
      ? NBA_EASTERN_CONFERENCE
      : league === 'nhl'
        ? NHL_EASTERN_CONFERENCE
        : WNBA_EASTERN_CONFERENCE
  const westernConference =
    league === 'nba'
      ? NBA_WESTERN_CONFERENCE
      : league === 'nhl'
        ? NHL_WESTERN_CONFERENCE
        : WNBA_WESTERN_CONFERENCE

  // For PWHL, show all active teams in one section (no divisions)
  const isPwhl = league === 'pwhl'

  // Organize teams by status and conference
  const activeEast = isPwhl ? [] : teams.filter((t) => easternConference.includes(t))
  const activeWest = isPwhl ? [] : teams.filter((t) => westernConference.includes(t))

  // PWHL: all active teams (not defunct/relocated/rebranded)
  const pwhlActiveTeams = isPwhl
    ? teams.filter((t) => {
        const franchise = franchises.find((f) => f.teamAbbr === t)
        return franchise?.status === 'active'
      })
    : []

  // In All Time mode, only show truly defunct teams (no successor)
  // Relocated/rebranded teams are merged into their current franchise
  const former = teams.filter((t) => {
    const franchise = franchises.find((f) => f.teamAbbr === t)
    if (!franchise) return false

    if (isAllTime) {
      // Only show defunct teams (no successor) in All Time mode
      return franchise.status === 'defunct'
    }

    // In year-filtered mode, show all former teams
    return (
      franchise.status === 'defunct' ||
      franchise.status === 'relocated' ||
      franchise.status === 'rebranded'
    )
  })

  const handleTeamChange = (team: string | null) => {
    onTeamChange(team)
    setIsOpen(false)
  }

  const getTeamDisplayName = (teamAbbr: string) => {
    const franchise = franchises.find((f) => f.teamAbbr === teamAbbr)
    return franchise?.displayName || teamAbbr
  }

  const displayText = selectedTeam ? getTeamDisplayName(selectedTeam) : 'ALL TEAMS'

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedTeam) {
      onTeamChange(null)
    }
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span
          id="team-filter-label"
          className="text-[0.65rem] sm:text-xs font-orbitron text-muted-foreground uppercase tracking-wide sm:tracking-wider"
        >
          <span aria-hidden="true">◆ </span>Filter by Team
        </span>
        {selectedTeam && (
          <button
            onClick={handleReset}
            className="text-[0.6rem] font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
            aria-label="Reset to All Teams"
          >
            Reset ×
          </button>
        )}
      </div>

      {/* Clickable Team Display */}
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        aria-labelledby="team-filter-label"
        aria-haspopup="dialog"
        className="w-full scoreboard-panel p-2 sm:p-3 relative group hover:border-primary transition-all active:scale-[0.98]"
      >
        {/* Team Display */}
        <div className="text-center">
          <div
            className="text-lg sm:text-xl md:text-lg lg:text-xl font-mono font-bold uppercase tracking-wider transition-all group-hover:scale-105"
            style={{ color: 'hsl(var(--primary))' }}
          >
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
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-select-dialog-title"
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl sm:max-h-[80vh] scoreboard-panel z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-muted/20 border-b-2 border-border p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3
                  id="team-select-dialog-title"
                  className="text-base sm:text-lg font-orbitron uppercase tracking-wider"
                >
                  <span aria-hidden="true">◆ </span>Select Team
                </h3>
              </div>
              <button
                ref={closeButtonRef}
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
                    aria-label="Select all teams"
                    className={`
                      w-full px-4 py-3 text-base sm:text-lg font-mono font-bold uppercase
                      border-2 transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      ${
                        !selectedTeam
                          ? 'bg-primary/10 text-primary border-primary'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-[0.98]'
                      }
                    `}
                  >
                    ALL TEAMS
                  </button>
                </div>

                {/* PWHL Teams (No Divisions) */}
                {isPwhl && pwhlActiveTeams.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Teams</span>
                      <div
                        className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {pwhlActiveTeams.map((team) => {
                        const isSelected = selectedTeam === team
                        const displayName = getTeamDisplayName(team)

                        return (
                          <button
                            key={team}
                            onClick={() => handleTeamChange(team)}
                            aria-current={isSelected ? 'true' : undefined}
                            aria-label={`Select ${displayName}`}
                            className={`
                              p-3 flex flex-col items-center gap-2
                              border-2 transition-all
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                              ${
                                isSelected
                                  ? 'bg-primary/10 text-primary border-primary scale-105'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo
                              teamCode={team}
                              franchises={franchises}
                              league={league}
                              size="md"
                            />
                            <span className="text-xs sm:text-sm font-mono font-bold text-center leading-tight">
                              {displayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Eastern Conference */}
                {!isPwhl && activeEast.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Eastern Conference</span>
                      <div
                        className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activeEast.map((team) => {
                        const isSelected = selectedTeam === team
                        const displayName = getTeamDisplayName(team)

                        return (
                          <button
                            key={team}
                            onClick={() => handleTeamChange(team)}
                            aria-current={isSelected ? 'true' : undefined}
                            aria-label={`Select ${displayName}`}
                            className={`
                              p-3 flex flex-col items-center gap-2
                              border-2 transition-all
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                              ${
                                isSelected
                                  ? 'bg-primary/10 text-primary border-primary scale-105'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo
                              teamCode={team}
                              franchises={franchises}
                              league={league}
                              size="md"
                            />
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
                {!isPwhl && activeWest.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Western Conference</span>
                      <div
                        className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activeWest.map((team) => {
                        const isSelected = selectedTeam === team
                        const displayName = getTeamDisplayName(team)

                        return (
                          <button
                            key={team}
                            onClick={() => handleTeamChange(team)}
                            aria-current={isSelected ? 'true' : undefined}
                            aria-label={`Select ${displayName}`}
                            className={`
                              p-3 flex flex-col items-center gap-2
                              border-2 transition-all
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                              ${
                                isSelected
                                  ? 'bg-primary/10 text-primary border-primary scale-105'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo
                              teamCode={team}
                              franchises={franchises}
                              league={league}
                              size="md"
                            />
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
                      <div
                        className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {former.map((team) => {
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
                              ${
                                isSelected
                                  ? 'bg-primary/10 text-primary border-primary scale-105'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                              }
                            `}
                          >
                            <TeamLogo
                              teamCode={team}
                              franchises={franchises}
                              league={league}
                              size="md"
                            />
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
