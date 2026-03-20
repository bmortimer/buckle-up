'use client'

import { useEffect, useState, useRef } from 'react'
import type { FranchiseInfo, League, CalendarDayData, PopupPosition } from '@/lib/types'
import { isGameCompleted } from '@/lib/types'
import { getTeamDisplayName } from '@/lib/franchises'
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap'
import TeamLogo from './TeamLogo'

interface CalendarDayPopupProps {
  dayData: CalendarDayData
  position: PopupPosition | null
  franchises: FranchiseInfo[]
  selectedTeam?: string | null
  league: League
  onClose: () => void
}

export default function CalendarDayPopup({
  dayData,
  position,
  franchises,
  selectedTeam,
  league = 'wnba',
  onClose,
}: CalendarDayPopupProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 640)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useModalFocusTrap(true, onClose, modalRef, closeButtonRef)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />

      {/* Modal - positioned near click on desktop, bottom sheet on mobile */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-date"
        className={`fixed bg-card border-2 border-amber-500 p-4 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-50 ${
          isDesktop && position ? 'w-72' : 'bottom-4 left-4 right-4'
        }`}
        style={
          isDesktop && position
            ? {
                left: Math.min(position.x, window.innerWidth - 300),
                top: Math.min(position.y + 10, window.innerHeight - 250),
              }
            : {}
        }
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-amber-500 transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Date */}
        <div
          id="popup-date"
          className="text-xs sm:text-sm font-mono text-muted-foreground mb-3 uppercase"
        >
          {new Date(dayData.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>

        {dayData.game ? (
          <>
            {/* Game Details */}
            {(() => {
              const game = dayData.game!
              const completed = isGameCompleted(game)
              const homeWon = completed ? game.homeScore! > game.awayScore! : false
              const awayWon = completed ? game.awayScore! > game.homeScore! : false
              const awayName = getTeamDisplayName(game.awayTeam, franchises)
              const homeName = getTeamDisplayName(game.homeTeam, franchises)

              return (
                <div className="text-sm font-mono mb-3">
                  <div className={`flex items-center gap-2 ${awayWon ? 'font-bold' : ''}`}>
                    <TeamLogo
                      teamCode={game.awayTeam}
                      franchises={franchises}
                      league={league}
                      size="xs"
                    />
                    <span className="flex-1">{awayName}</span>
                    <span className="tabular-nums">{completed ? game.awayScore : '—'}</span>
                  </div>
                  <div className="text-muted-foreground text-xs my-1 pl-6">@</div>
                  <div className={`flex items-center gap-2 ${homeWon ? 'font-bold' : ''}`}>
                    <TeamLogo
                      teamCode={game.homeTeam}
                      franchises={franchises}
                      league={league}
                      size="xs"
                    />
                    <span className="flex-1">{homeName}</span>
                    <span className="tabular-nums">{completed ? game.homeScore : '—'}</span>
                  </div>
                </div>
              )
            })()}

            {/* Belt Status */}
            <div className="text-xs sm:text-sm text-amber-500 font-orbitron uppercase border-t border-border/40 pt-3">
              {(() => {
                // Handle scheduled title bout (unplayed game where belt is on the line)
                if (dayData.isScheduledTitleBout) {
                  return (
                    <span>
                      <span aria-hidden="true">🏆 </span>Upcoming Title Bout
                    </span>
                  )
                }

                if (selectedTeam) {
                  const heldBelt = dayData.holder === selectedTeam
                  const wonBelt = dayData.winner === selectedTeam && !heldBelt
                  const challengedBelt =
                    dayData.challenger === selectedTeam && !heldBelt && !wonBelt

                  if (wonBelt)
                    return (
                      <span>
                        <span aria-hidden="true">⚡ </span>Won The Belt
                      </span>
                    )
                  if (challengedBelt) return <span>Failed Challenge</span>
                  if (heldBelt && (dayData.holderWon || dayData.won))
                    return (
                      <span>
                        <span aria-hidden="true">🏆 </span>Defended Belt
                      </span>
                    )
                  if (heldBelt && (dayData.holderWon === false || dayData.won === false))
                    return (
                      <span>
                        <span aria-hidden="true">⚡ </span>Lost Belt
                      </span>
                    )
                  return null
                }

                // Default mode
                if (dayData.beltChanged)
                  return (
                    <span>
                      <span aria-hidden="true">⚡ </span>Belt Changed Hands
                    </span>
                  )
                if (dayData.holderWon)
                  return (
                    <span>
                      <span aria-hidden="true">🏆 </span>Defended Belt
                    </span>
                  )
                return <span>Belt Not On The Line</span>
              })()}
            </div>
          </>
        ) : dayData.isUncertainFuture ? (
          /* Uncertain Future - after an unplayed title bout */
          <div className="text-center">
            <div className="text-amber-500 text-2xl mb-2" aria-hidden="true">
              🏆
            </div>
            <div className="text-xs text-muted-foreground uppercase">Belt Holder Unknown</div>
            <div className="text-xs text-muted-foreground/60 mt-1">
              Waiting for title bout result
            </div>
          </div>
        ) : (
          /* Off Day - show belt holder */
          <div className="flex items-center gap-3">
            <TeamLogo teamCode={dayData.holder} franchises={franchises} league={league} size="sm" />
            <div>
              <div className="text-xs text-muted-foreground uppercase mb-1">Belt Holder</div>
              <div className="text-sm font-mono">
                {getTeamDisplayName(dayData.holder, franchises)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
