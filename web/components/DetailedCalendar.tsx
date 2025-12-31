'use client'

import { useMemo } from 'react'
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
    <div data-card="detailed-calendar" className="scoreboard-panel p-6 relative">
      <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-3">
        <h3 className="text-base font-orbitron tracking-[0.2em] uppercase">
          ◆ {year} Calendar
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

                      return (
                        <div
                          key={dayIdx}
                          className="aspect-square border-r border-b border-border/20 p-0.5 relative group hover:bg-muted/30 transition-colors"
                          style={{
                            backgroundColor: `${holderColor}15`
                          }}
                        >
                          {/* Day number */}
                          <div className="text-[0.5rem] font-mono text-muted-foreground">
                            {dayNum}
                          </div>

                          {/* Belt holder indicator */}
                          <div className="absolute top-0 right-0 w-1 h-1 rounded-full opacity-60"
                            style={{ backgroundColor: holderColor }}
                          />

                          {/* Belt change indicator */}
                          {dayData.beltChanged && (
                            <div className="absolute top-0.5 left-0.5 text-[0.5rem]" title="Belt changed hands">
                              ⚡
                            </div>
                          )}

                          {/* Game indicator */}
                          {dayData.game && (
                            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 pb-0.5">
                              <TeamLogo teamCode={dayData.holder} franchises={franchises} size="xxs" />
                            </div>
                          )}

                          {/* Tooltip on hover */}
                          {dayData.game && (
                            <div className="hidden group-hover:block absolute z-10 left-full ml-2 top-0 bg-card border-2 border-amber-500 p-2 shadow-lg min-w-[200px]">
                              <div className="text-[0.6rem] font-mono text-muted-foreground mb-1">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <TeamLogo teamCode={dayData.game.homeTeam} franchises={franchises} size="xs" />
                                <span className="text-xs font-mono">{dayData.game.homeScore}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TeamLogo teamCode={dayData.game.awayTeam} franchises={franchises} size="xs" />
                                <span className="text-xs font-mono">{dayData.game.awayScore}</span>
                              </div>
                              {dayData.beltChanged && (
                                <div className="text-[0.6rem] text-amber-500 mt-1 font-orbitron uppercase">
                                  ⚡ Belt Changed
                                </div>
                              )}
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
    </div>
  )
}
