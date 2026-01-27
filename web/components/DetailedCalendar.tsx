'use client'

import { useMemo, useState } from 'react'
import type { BeltHistory, FranchiseInfo, Game } from '@/lib/types'
import { isGameCompleted } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import { isSameFranchise } from '@/lib/franchises'
import TeamLogo from './TeamLogo'
import CalendarDayPopup from './CalendarDayPopup'

interface DetailedCalendarProps {
  history: BeltHistory
  franchises: FranchiseInfo[]
  allGames: Game[]
  year: number
  league: 'nba' | 'wnba' | 'nhl'
}

interface PopupPosition {
  x: number
  y: number
}

interface DayData {
  date: string
  holder: string
  game?: Game
  beltChanged: boolean
  holderWon: boolean | null
  winner?: string
  challenger?: string
  isScheduledTitleBout?: boolean  // Has an unplayed title bout
  isUncertainFuture?: boolean     // After an unplayed title bout - outcome unknown
}

export default function DetailedCalendar({ history, franchises, allGames, year, league = 'wnba' }: DetailedCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null)

  // Build day-by-day data for the season
  const dayMap = useMemo(() => {
    const map = new Map<string, DayData>()
    let currentHolder = history.startingTeam

    // For NBA/NHL, seasons span two calendar years (Oct to Apr/Jun)
    // For WNBA, seasons are within a single calendar year (May to Oct)
    let seasonStart: Date
    let seasonEnd: Date

    if (league === 'nba' || league === 'nhl') {
      // NBA/NHL season: October of year to June of year+1
      seasonStart = new Date(year, 9, 1)  // October 1st
      seasonEnd = new Date(year + 1, 5, 30)  // June 30th
    } else {
      // WNBA season: January to December of same year
      seasonStart = new Date(year, 0, 1)
      seasonEnd = new Date(year, 11, 31)
    }

    // Filter games to this season
    const seasonGames = allGames.filter(g => {
      // Parse date as local time to avoid timezone issues
      const [y, m, d] = g.date.split('-').map(Number)
      const gameDate = new Date(y, m - 1, d)
      return gameDate >= seasonStart && gameDate <= seasonEnd
    })

    // Create a map of games by date
    const gamesByDate = new Map<string, Game[]>()
    seasonGames.forEach(game => {
      const dateStr = game.date
      if (!gamesByDate.has(dateStr)) {
        gamesByDate.set(dateStr, [])
      }
      gamesByDate.get(dateStr)!.push(game)
    })

    // Iterate through every day of the season
    // Track when we encounter the first unplayed title bout - after that, future is uncertain
    let hasHitUnplayedTitleBout = false
    
    const currentDate = new Date(seasonStart)
    while (currentDate <= seasonEnd) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const gamesOnDate = gamesByDate.get(dateStr) || []

      // Find if belt holder played (only matters if we haven't hit uncertainty)
      const holderGame = !hasHitUnplayedTitleBout 
        ? gamesOnDate.find(game =>
            isSameFranchise(game.homeTeam, currentHolder, franchises) ||
            isSameFranchise(game.awayTeam, currentHolder, franchises)
          )
        : undefined

      if (hasHitUnplayedTitleBout) {
        // After an unplayed title bout - outcome is uncertain
        map.set(dateStr, {
          date: dateStr,
          holder: currentHolder,
          beltChanged: false,
          holderWon: null,
          isUncertainFuture: true,
        })
      } else if (holderGame && isGameCompleted(holderGame)) {
        // Belt holder played a completed game
        const holderIsHome = isSameFranchise(holderGame.homeTeam, currentHolder, franchises)
        const holderWon = holderIsHome
          ? holderGame.homeScore! > holderGame.awayScore!
          : holderGame.awayScore! > holderGame.homeScore!

        const challenger = holderIsHome ? holderGame.awayTeam : holderGame.homeTeam
        const winner = holderWon ? currentHolder : challenger
        const newHolder = holderWon ? currentHolder : challenger
        const beltChanged = !holderWon

        map.set(dateStr, {
          date: dateStr,
          holder: currentHolder,
          game: holderGame,
          beltChanged,
          holderWon,
          winner,
          challenger,
        })

        currentHolder = newHolder
      } else if (holderGame && !isGameCompleted(holderGame)) {
        // Belt holder has a scheduled game (not yet played) - this is a title bout!
        const holderIsHome = isSameFranchise(holderGame.homeTeam, currentHolder, franchises)
        const challenger = holderIsHome ? holderGame.awayTeam : holderGame.homeTeam

        map.set(dateStr, {
          date: dateStr,
          holder: currentHolder,
          game: holderGame,
          beltChanged: false,
          holderWon: null,
          challenger,
          isScheduledTitleBout: true,
        })
        
        // Mark that we've hit an unplayed title bout - all future days are uncertain
        hasHitUnplayedTitleBout = true
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
  }, [history, allGames, year, franchises, league])

  // Group by month (only months with games)
  // For NBA, we need to track year+month since seasons span two calendar years
  const monthsData = useMemo(() => {
    // Use a composite key of "YYYY-MM" to handle cross-year seasons
    const months: Map<string, DayData[]> = new Map()

    dayMap.forEach((dayData) => {
      // Parse date as local time to avoid timezone issues
      const [y, m, d] = dayData.date.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`

      if (!months.has(yearMonth)) {
        months.set(yearMonth, [])
      }
      months.get(yearMonth)!.push(dayData)
    })

    // Filter to only months that have at least one game
    const monthsWithGames = new Map<string, DayData[]>()
    months.forEach((days, yearMonth) => {
      if (days.some(day => day.game)) {
        monthsWithGames.set(yearMonth, days)
      }
    })

    // Sort months chronologically
    const sortedMonths = new Map<string, DayData[]>()
    Array.from(monthsWithGames.keys())
      .sort()
      .forEach(key => {
        sortedMonths.set(key, monthsWithGames.get(key)!)
      })

    return sortedMonths
  }, [dayMap])

  const handleClose = () => {
    setSelectedDay(null)
    setPopupPosition(null)
  }

  return (
    <div data-card="detailed-calendar" className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="flex items-center justify-center mb-4 sm:mb-6 border-b-2 border-border pb-2 sm:pb-3">
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true">◆ </span>
          <h2 className="inline font-normal">
            {(league === 'nba' || league === 'nhl') ? `${year}-${String((year + 1) % 100).padStart(2, '0')}` : year} Calendar
          </h2>
          <span aria-hidden="true"> ◆</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from(monthsData.entries()).map(([yearMonth, days]) => {
          // Parse the YYYY-MM key
          const [calendarYear, monthNum] = yearMonth.split('-').map(Number)
          const monthDate = new Date(calendarYear, monthNum, 1)
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' })
          const firstDayOfWeek = monthDate.getDay() // 0 = Sunday

          // Build calendar grid
          const daysInMonth = new Date(calendarYear, monthNum + 1, 0).getDate()
          const weeks: (DayData | null)[][] = []
          let currentWeek: (DayData | null)[] = []

          // Add empty cells for days before month starts
          for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null)
          }

          // Add all days in month
          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${calendarYear}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
            <div key={yearMonth} className="border border-border/40">
              {/* Month header */}
              <div className="bg-muted/20 px-2 py-1.5 border-b border-border/40">
                <h3 className="text-xs font-orbitron uppercase tracking-wider text-center font-normal">
                  {monthName}
                </h3>
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

                      const [dy, dm, dd] = dayData.date.split('-').map(Number)
                      const date = new Date(dy, dm - 1, dd)
                      const dayNum = date.getDate()
                      const isSelectedDay = selectedDay?.date === dayData.date

                      // Determine display based on day state
                      const winner = dayData.winner
                      const isScheduledBout = dayData.isScheduledTitleBout
                      const isUncertain = dayData.isUncertainFuture
                      
                      // Background color logic:
                      // - Completed game: winner's color
                      // - Known holder (no game): holder's color  
                      // - Scheduled title bout: no color (transparent)
                      // - Uncertain future: neutral gray
                      let bgStyle: React.CSSProperties = {}
                      if (isUncertain) {
                        bgStyle = { backgroundColor: 'hsl(var(--muted) / 0.3)' }
                      } else if (isScheduledBout) {
                        bgStyle = {} // No team color for scheduled bouts
                      } else {
                        const displayColor = winner ? getTeamColor(winner, franchises) : getTeamColor(dayData.holder, franchises)
                        bgStyle = { backgroundColor: `${displayColor}15` }
                      }

                      return (
                        <div
                          key={dayIdx}
                          className="aspect-square border-r border-b border-border/20 p-0.5 relative group transition-colors cursor-pointer hover:bg-muted/30 active:bg-muted/40"
                          style={bgStyle}
                          onClick={(e) => {
                            if (isSelectedDay) {
                              handleClose()
                            } else {
                              setSelectedDay(dayData)
                              setPopupPosition({ x: e.clientX, y: e.clientY })
                            }
                          }}
                        >
                          {/* Day number */}
                          <div className="text-[0.5rem] font-mono text-muted-foreground pointer-events-none">
                            {dayNum}
                          </div>

                          {/* Belt holder indicator - only show for known states */}
                          {!isScheduledBout && !isUncertain && (
                            <div 
                              className="absolute top-0 right-0 w-1 h-1 rounded-full opacity-60 pointer-events-none"
                              style={{ backgroundColor: winner ? getTeamColor(winner, franchises) : getTeamColor(dayData.holder, franchises) }}
                            />
                          )}

                          {/* Belt change indicator */}
                          {dayData.beltChanged && (
                            <div className="absolute top-0 right-2 text-[0.6rem] font-bold pointer-events-none" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                              ⚡
                            </div>
                          )}

                          {/* Game indicator - show the winner for completed games */}
                          {winner && (
                            <div className="absolute inset-0 flex items-end justify-center pb-[10%] pointer-events-none">
                              <TeamLogo teamCode={winner} franchises={franchises} league={league} size="xs" />
                            </div>
                          )}
                          
                          {/* Trophy icon for scheduled title bouts */}
                          {isScheduledBout && (
                            <div className="absolute inset-0 flex items-end justify-center pb-[5%] pointer-events-none">
                              <span className="text-sm">🏆</span>
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

      {/* Shared popup component */}
      {selectedDay && (
        <CalendarDayPopup
          dayData={selectedDay}
          position={popupPosition}
          franchises={franchises}
          league={league}
          onClose={handleClose}
        />
      )}

      {/* Corner rivets for retro hardware look */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
    </div>
  )
}
