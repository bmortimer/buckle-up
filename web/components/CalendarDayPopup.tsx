'use client'

import { useEffect, useState } from 'react'
import type { FranchiseInfo, Game } from '@/lib/types'
import { getTeamDisplayName } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface DayData {
  date: string
  holder: string
  game?: Game
  beltChanged?: boolean
  holderWon?: boolean | null
  winner?: string
  challenger?: string
  played?: boolean
  won?: boolean | null
}

interface PopupPosition {
  x: number
  y: number
}

interface CalendarDayPopupProps {
  dayData: DayData
  position: PopupPosition | null
  franchises: FranchiseInfo[]
  selectedTeam?: string | null
  onClose: () => void
}

export default function CalendarDayPopup({ dayData, position, franchises, selectedTeam, onClose }: CalendarDayPopupProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 640)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal - positioned near click on desktop, bottom sheet on mobile */}
      <div
        className={`fixed bg-card border-2 border-amber-500 p-4 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-50 ${
          isDesktop && position ? 'w-72' : 'bottom-4 left-4 right-4'
        }`}
        style={isDesktop && position ? {
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.min(position.y + 10, window.innerHeight - 250),
        } : {}}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-amber-500 transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Date */}
        <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-3 uppercase">
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
              const homeWon = game.homeScore > game.awayScore
              const awayWon = game.awayScore > game.homeScore
              const awayName = getTeamDisplayName(game.awayTeam, franchises)
              const homeName = getTeamDisplayName(game.homeTeam, franchises)

              return (
                <div className="text-sm font-mono mb-3">
                  <div className={`flex items-center gap-2 ${awayWon ? 'font-bold' : ''}`}>
                    <TeamLogo teamCode={game.awayTeam} franchises={franchises} size="xs" />
                    <span className="flex-1">{awayName}</span>
                    <span className="tabular-nums">{game.awayScore}</span>
                  </div>
                  <div className="text-muted-foreground text-xs my-1 pl-6">@</div>
                  <div className={`flex items-center gap-2 ${homeWon ? 'font-bold' : ''}`}>
                    <TeamLogo teamCode={game.homeTeam} franchises={franchises} size="xs" />
                    <span className="flex-1">{homeName}</span>
                    <span className="tabular-nums">{game.homeScore}</span>
                  </div>
                </div>
              )
            })()}

            {/* Belt Status */}
            <div className="text-xs sm:text-sm text-amber-500 font-orbitron uppercase border-t border-border/40 pt-3">
              {(() => {
                if (selectedTeam) {
                  const heldBelt = dayData.holder === selectedTeam
                  const wonBelt = dayData.winner === selectedTeam && !heldBelt
                  const challengedBelt = dayData.challenger === selectedTeam && !heldBelt && !wonBelt

                  if (wonBelt) return <span>⚡ Won The Belt</span>
                  if (challengedBelt) return <span>Failed Challenge</span>
                  if (heldBelt && (dayData.holderWon || dayData.won)) return <span>🏆 Defended Belt</span>
                  if (heldBelt && (dayData.holderWon === false || dayData.won === false)) return <span>⚡ Lost Belt</span>
                  return null
                }

                // Default mode
                if (dayData.beltChanged) return <span>⚡ Belt Changed Hands</span>
                if (dayData.holderWon) return <span>🏆 Defended Belt</span>
                return <span>Belt Not On The Line</span>
              })()}
            </div>
          </>
        ) : (
          /* Off Day - show belt holder */
          <div className="flex items-center gap-3">
            <TeamLogo teamCode={dayData.holder} franchises={franchises} size="sm" />
            <div>
              <div className="text-xs text-muted-foreground uppercase mb-1">Belt Holder</div>
              <div className="text-sm font-mono">{getTeamDisplayName(dayData.holder, franchises)}</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
