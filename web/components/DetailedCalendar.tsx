'use client'

import { useMemo, useState } from 'react'
import type { BeltHistory, FranchiseInfo, Game } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import { isSameFranchise } from '@/lib/franchises'
import TeamLogo from './TeamLogo'

interface DetailedCalendarProps {
  history: BeltHistory
  franchises: FranchiseInfo[]
  allGames: Game[]
  year: number
}

interface DayData {
  date: string
  holder: string
  game?: Game
  beltChanged: boolean
  holderWon: boolean | null
}

export default function DetailedCalendar({ history, franchises, allGames, year }: DetailedCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  // Build day-by-day data for the year
  const dayMap = useMemo(() => {
    const map = new Map<string, DayData>()
    let currentHolder = history.startingTeam

    // Filter games to this year only
    const yearGames = allGames.filter(g => g.date.startsWith(year.toString()))

    // Get date range for this year
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    // Create a map of games by date
    const gamesByDate = new Map<string, Game[]>()
    yearGames.forEach(game => {
      const dateStr = game.date
      if (!gamesByDate.has(dateStr)) {
        gamesByDate.set(dateStr, [])
      }
      gamesByDate.get(dateStr)!.push(game)
    })

    // Iterate through every day of the year
    const currentDate = new Date(yearStart)
    while (currentDate <= yearEnd) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const gamesOnDate = gamesByDate.get(dateStr) || []

      // Find if belt holder played
      const holderGame = gamesOnDate.find(game =>
        isSameFranchise(game.homeTeam, currentHolder, franchises) ||
        isSameFranchise(game.awayTeam, currentHolder, franchises)
      )

      if (holderGame) {
        const holderIsHome = isSameFranchise(holderGame.homeTeam, currentHolder, franchises)
        const holderWon = holderIsHome
          ? holderGame.homeScore > holderGame.awayScore
          : holderGame.awayScore > holderGame.homeScore

        const newHolder = holderWon ? currentHolder : (holderIsHome ? holderGame.awayTeam : holderGame.homeTeam)
        const beltChanged = !holderWon

        map.set(dateStr, {
          date: dateStr,
          holder: currentHolder,
          game: holderGame,
          beltChanged,
          holderWon,
        })

        currentHolder = newHolder
      } else {
        // Off day
        map.set(dateStr, {
          date: dateStr,
          holder: currentHolder,
          beltChanged: false,
          holderWon: null,
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return map
  }, [history, allGames, year, franchises])

  // Group by month (only months with games)
  const monthsData = useMemo(() => {
    const months: Map<number, DayData[]> = new Map()

    dayMap.forEach((dayData) => {
      const date = new Date(dayData.date)
      const month = date.getMonth()

      if (!months.has(month)) {
        months.set(month, [])
      }
      months.get(month)!.push(dayData)
    })

    // Filter to only months that have at least one game
    const monthsWithGames = new Map<number, DayData[]>()
    months.forEach((days, month) => {
      if (days.some(day => day.game)) {
        monthsWithGames.set(month, days)
      }
    })

    return monthsWithGames
  }, [dayMap])

  return (
    <div data-card="detailed-calendar" className="scoreboard-panel p-4 sm:p-6 relative">
      <div className="flex items-center justify-center mb-4 sm:mb-6 border-b-2 border-border pb-2 sm:pb-3">
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
          ◆ {year} Calendar ◆
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from(monthsData.entries()).map(([month, days]) => {
          const monthDate = new Date(year, month, 1)
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' })
          const firstDayOfWeek = monthDate.getDay() // 0 = Sunday

          // Build calendar grid
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const weeks: (DayData | null)[][] = []
          let currentWeek: (DayData | null)[] = []

          // Add empty cells for days before month starts
          for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null)
          }

          // Add all days in month
          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            currentWeek.push(dayMap.get(dateStr) || null)

            if (currentWeek.length === 7) {
              weeks.push(currentWeek)
              currentWeek = []
            }
          }

          // Add final week if it has any days
          if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
              currentWeek.push(null)
            }
            weeks.push(currentWeek)
          }

          return (
            <div key={month} className="border border-border/40">
              {/* Month header */}
              <div className="bg-muted/20 px-2 py-1.5 border-b border-border/40">
                <div className="text-xs font-orbitron uppercase tracking-wider text-center">
                  {monthName}
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border/40">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-[0.5rem] font-mono text-muted-foreground text-center py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div>
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7">
                    {week.map((dayData, dayIdx) => {
                      if (!dayData) {
                        return <div key={dayIdx} className="aspect-square border-r border-b border-border/20" />
                      }

                      const date = new Date(dayData.date)
                      const dayNum = date.getDate()
                      const holderColor = getTeamColor(dayData.holder, franchises)

                      const isSelected = selectedDay?.date === dayData.date

                      return (
                        <div
                          key={dayIdx}
                          className={`aspect-square border-r border-b border-border/20 p-0.5 relative group transition-colors ${dayData.game ? 'cursor-pointer hover:bg-muted/30 active:bg-muted/40' : ''}`}
                          style={{
                            backgroundColor: `${holderColor}15`
                          }}
                          onClick={() => dayData.game && setSelectedDay(isSelected ? null : dayData)}
                        >
                          {/* Day number */}
                          <div className="text-[0.5rem] font-mono text-muted-foreground pointer-events-none">
                            {dayNum}
                          </div>

                          {/* Belt holder indicator */}
                          <div className="absolute top-0 right-0 w-1 h-1 rounded-full opacity-60 pointer-events-none"
                            style={{ backgroundColor: holderColor }}
                          />

                          {/* Belt change indicator */}
                          {dayData.beltChanged && (
                            <div className="absolute top-0.5 left-0.5 text-[0.5rem] pointer-events-none">
                              ⚡
                            </div>
                          )}

                          {/* Game indicator */}
                          {dayData.game && (
                            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 pb-0.5 pointer-events-none">
                              <TeamLogo teamCode={dayData.holder} franchises={franchises} size="xxs" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Day Modal - tap-friendly */}
      {selectedDay && selectedDay.game && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedDay(null)}
          />

          {/* Modal */}
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card border-2 border-amber-500 p-4 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-50">
            {/* Close button */}
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-amber-500 transition-colors"
              aria-label="Close"
            >
              ×
            </button>

            {/* Date */}
            <div className="text-xs sm:text-sm font-mono text-muted-foreground mb-3 uppercase">
              {new Date(selectedDay.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>

            {/* Game Details */}
            {(() => {
              const game = selectedDay.game
              const homeWon = game.homeScore > game.awayScore
              const awayWon = game.awayScore > game.homeScore

              return (
                <div className="text-sm sm:text-base font-mono mb-3">
                  <div className={awayWon ? 'font-bold' : ''}>
                    {game.awayTeam} [{game.awayScore}]
                  </div>
                  <div className="text-muted-foreground text-xs my-1">@</div>
                  <div className={homeWon ? 'font-bold' : ''}>
                    {game.homeTeam} [{game.homeScore}]
                  </div>
                </div>
              )
            })()}

            {/* Belt Status */}
            <div className="text-xs sm:text-sm text-amber-500 font-orbitron uppercase border-t border-border/40 pt-3">
              {selectedDay.beltChanged ? (
                <span>⚡ Belt Changed Hands</span>
              ) : selectedDay.holderWon ? (
                <span>Defended Belt</span>
              ) : (
                <span>Holder Retained</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
