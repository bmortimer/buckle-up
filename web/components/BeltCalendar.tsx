'use client'

import { useState, useEffect } from 'react'
import type { BeltHistory, FranchiseInfo, Game, League } from '@/lib/types'
import { isGameCompleted } from '@/lib/types'
import { getTeamColor, getTeamDisplayName, isSameFranchise, getFranchiseEras } from '@/lib/franchises'
import { classifyDayForTeam } from '@/lib/calendarDayClassifier'
import TeamLogo from './TeamLogo'
import CalendarDayPopup from './CalendarDayPopup'

interface BeltCalendarProps {
  history: BeltHistory
  franchises: FranchiseInfo[]
  selectedTeam?: string | null
  allGames: Game[]
  league: 'nba' | 'wnba' | 'nhl'
}

interface DayData {
  date: string
  holder: string
  played: boolean
  won: boolean | null
  winner?: string // Team that won this game (if played)
  challenger?: string // Team that challenged for the belt (if played)
  isTie?: boolean // Game ended in a tie
  game?: Game // The actual game that was played (if any)
}

interface PopupPosition {
  x: number
  y: number
}

export default function BeltCalendar({ history, franchises, selectedTeam: externalSelectedTeam, allGames, league = 'wnba' }: BeltCalendarProps) {
  const [clickedDay, setClickedDay] = useState<DayData | null>(null)
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(externalSelectedTeam || null)

  // Sync with external selection
  useEffect(() => {
    setSelectedTeam(externalSelectedTeam || null)
  }, [externalSelectedTeam])

  // Get list of teams that held the belt
  const teamsWithBelt = Array.from(new Set([
    ...history.changes.map(c => c.fromTeam),
    ...history.changes.map(c => c.toTeam),
  ])).sort()

  // Build a map of each day to its belt holder and game status
  // Use history.changes to properly track belt across seasons (respecting season resets)
  const dayMap = new Map<string, DayData>()

  if (allGames.length === 0) return null

  // Get date range from all games
  const gameDates = allGames.map(g => {
    const [y, m, d] = g.date.split('-').map(Number)
    return new Date(y, m - 1, d)
  })
  const minDate = new Date(Math.min(...gameDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...gameDates.map(d => d.getTime())))

  // Create a map of games where belt holder played (from history.changes)
  const beltGamesByDate = new Map<string, Game>()
  history.changes.forEach(change => {
    // Belt changes include 'start' (season start) and 'loss' (belt changed hands)
    if (change.reason === 'loss') {
      beltGamesByDate.set(change.game.date, change.game)
    } else if (change.reason === 'start' && change.game) {
      // First game of season where champion defended
      beltGamesByDate.set(change.game.date, change.game)
    }
  })

  // Build chronological list of belt holder periods from history.changes
  const holderPeriods: { start: string; holder: string; franchiseHolder: string }[] = []
  let currentHolder = history.startingTeam
  let currentFranchiseHolder = history.startingTeam

  // Add initial period
  if (history.changes.length > 0) {
    holderPeriods.push({
      start: minDate.toISOString().split('T')[0],
      holder: currentHolder,
      franchiseHolder: currentFranchiseHolder
    })
  }

  // Process changes to build holder periods
  for (const change of history.changes) {
    if (change.reason === 'loss') {
      // Belt changed hands - new holder's period starts the NEXT day
      // (because they won it during the game on this day)
      const gameDate = new Date(change.game.date)
      gameDate.setDate(gameDate.getDate() + 1)
      const nextDay = gameDate.toISOString().split('T')[0]

      holderPeriods.push({
        start: nextDay,
        holder: change.toTeam,
        franchiseHolder: change.toTeam
      })
      currentHolder = change.toTeam
      currentFranchiseHolder = change.toTeam
    } else if (change.reason === 'start') {
      // New season started - belt reset to champion
      holderPeriods.push({
        start: change.game?.date || change.toTeam, // Use game date or fallback
        holder: change.toTeam,
        franchiseHolder: change.toTeam
      })
      currentHolder = change.toTeam
      currentFranchiseHolder = change.toTeam
    }
  }

  // Helper to find who held belt on a given date (at the START of the day)
  const getHolderOnDate = (dateStr: string): { holder: string; franchiseHolder: string } => {
    // Find the most recent holder period that started before or on this date
    for (let i = holderPeriods.length - 1; i >= 0; i--) {
      if (holderPeriods[i].start <= dateStr) {
        return {
          holder: holderPeriods[i].holder,
          franchiseHolder: holderPeriods[i].franchiseHolder
        }
      }
    }
    return { holder: history.startingTeam, franchiseHolder: history.startingTeam }
  }

  // Create map of all games by date
  const gamesByDate = new Map<string, Game[]>()
  allGames.forEach(game => {
    if (!gamesByDate.has(game.date)) {
      gamesByDate.set(game.date, [])
    }
    gamesByDate.get(game.date)!.push(game)
  })

  // Fill in every day from min to max
  const currentDate = new Date(minDate)
  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const { holder: franchiseHolder } = getHolderOnDate(dateStr)
    const gamesOnDate = gamesByDate.get(dateStr) || []

    // Find if belt holder played on this day (check by franchise)
    const holderGame = gamesOnDate.find(game =>
      isSameFranchise(game.homeTeam, franchiseHolder, franchises) ||
      isSameFranchise(game.awayTeam, franchiseHolder, franchises)
    )

    if (holderGame && isGameCompleted(holderGame)) {
      // Belt holder played a completed game
      const holderIsHome = isSameFranchise(holderGame.homeTeam, franchiseHolder, franchises)
      const isTie = holderGame.homeScore === holderGame.awayScore
      const holderWon = !isTie && (holderIsHome
        ? holderGame.homeScore! > holderGame.awayScore!
        : holderGame.awayScore! > holderGame.homeScore!)

      const winner = isTie ? null : (holderIsHome
        ? (holderWon ? holderGame.homeTeam : holderGame.awayTeam)
        : (holderWon ? holderGame.awayTeam : holderGame.homeTeam))

      const challenger = holderIsHome ? holderGame.awayTeam : holderGame.homeTeam
      const actualHolder = holderIsHome ? holderGame.homeTeam : holderGame.awayTeam

      dayMap.set(dateStr, {
        date: dateStr,
        holder: actualHolder,
        played: true,
        won: isTie ? null : holderWon,
        winner: winner || undefined,
        challenger: challenger,
        game: holderGame,
        isTie: isTie,
      })
    } else if (holderGame && !isGameCompleted(holderGame)) {
      // Belt holder has a scheduled (not yet played) game
      const holderIsHome = isSameFranchise(holderGame.homeTeam, franchiseHolder, franchises)
      const challenger = holderIsHome ? holderGame.awayTeam : holderGame.homeTeam
      const actualHolder = holderIsHome ? holderGame.homeTeam : holderGame.awayTeam

      dayMap.set(dateStr, {
        date: dateStr,
        holder: actualHolder,
        played: false,
        won: null,
        challenger: challenger,
        game: holderGame,
      })
    } else {
      // Belt holder didn't play (off day)
      dayMap.set(dateStr, {
        date: dateStr,
        holder: franchiseHolder,
        played: false,
        won: null,
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Group days by month
  const monthsData = new Map<string, DayData[]>()
  dayMap.forEach((dayData) => {
    // Parse date as local time to avoid timezone issues
    const [y, m, d] = dayData.date.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthsData.has(monthKey)) {
      monthsData.set(monthKey, [])
    }
    monthsData.get(monthKey)!.push(dayData)
  })

  // Only show months where the selected team was involved in belt activity
  const relevantMonths = Array.from(monthsData.entries())
    .filter(([_, days]) => {
      if (!selectedTeam) {
        // No team selected - show all months with belt games
        return days.some(d => d.played)
      }
      // Team selected - only show months where that team was involved
      return days.some(d => {
        const classification = classifyDayForTeam(d, selectedTeam, franchises)
        return classification.isInvolved && d.played
      })
    })
    .sort((a, b) => a[0].localeCompare(b[0]))

  // Get franchise eras to detect gaps in team history
  const franchiseEras = selectedTeam ? getFranchiseEras(selectedTeam, franchises) : []

  // Helper to determine which era a month belongs to
  const getEraIndex = (monthKey: string): number => {
    if (franchiseEras.length <= 1) return 0
    const [yearStr] = monthKey.split('-')
    const year = parseInt(yearStr)
    for (let i = 0; i < franchiseEras.length; i++) {
      if (year >= franchiseEras[i].startYear && year <= franchiseEras[i].endYear) {
        return i
      }
    }
    return 0
  }

  // Group months by era for rendering with dividers
  const monthsByEra: { eraIndex: number; months: typeof relevantMonths }[] = []
  let currentEraIndex = -1
  for (const monthEntry of relevantMonths) {
    const eraIndex = getEraIndex(monthEntry[0])
    if (eraIndex !== currentEraIndex) {
      monthsByEra.push({ eraIndex, months: [] })
      currentEraIndex = eraIndex
    }
    monthsByEra[monthsByEra.length - 1].months.push(monthEntry)
  }

  // Determine year display for title
  const yearDisplay = (() => {
    const uniqueYears = new Set(allGames.map(g => g.date.substring(0, 4)))
    if (uniqueYears.size === 1) {
      return Array.from(uniqueYears)[0]
    }
    const years = Array.from(uniqueYears).sort()
    return `${years[0]}-${years[years.length - 1]}`
  })()

  // Determine which team codes actually appear in the displayed data
  const displayedTeamCodes = (() => {
    if (!selectedTeam) return null

    // Get unique team codes from days where belt holder played
    // and filter to only team codes that match the selected team's franchise
    const teamCodes = new Set<string>()
    dayMap.forEach(day => {
      if (day.played && day.holder && isSameFranchise(day.holder, selectedTeam, franchises)) {
        teamCodes.add(day.holder)
      }
    })

    // Sort chronologically by finding first appearance
    const codesArray = Array.from(teamCodes)
    codesArray.sort((a, b) => {
      const firstA = Array.from(dayMap.values()).find(d => d.holder === a)?.date || ''
      const firstB = Array.from(dayMap.values()).find(d => d.holder === b)?.date || ''
      return firstA.localeCompare(firstB)
    })

    return codesArray.length > 0 ? codesArray.join(' · ') : selectedTeam
  })()

  return (
    <div data-card="calendar" className="scoreboard-panel p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="flex items-center justify-center mb-6 border-b-2 border-border pb-3">
        <h2 className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground text-center font-normal">
          <span aria-hidden="true">◆ </span>
          History
          <span> · {displayedTeamCodes || 'All Teams'} · {yearDisplay} </span>
          <span aria-hidden="true"> ◆</span>
        </h2>
      </div>

      {/* Team selector */}
      {!selectedTeam && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-3 font-orbitron uppercase tracking-wider">
            ▸ Select Team
          </p>
          <div className="flex flex-wrap gap-2">
            {teamsWithBelt.map(team => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className="flex items-center gap-2 px-3 py-2 border border-border hover:border-amber-500 transition-all group"
              >
                <TeamLogo teamCode={team} franchises={franchises} league={league} size="xs" />
                <span className="text-xs font-mono group-hover:text-amber-500 transition-colors">
                  {team}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTeam && (
        <>
          <p className="text-[0.65rem] text-muted-foreground mb-4 font-mono">
            ▸ BRIGHT = WON/DEFENDED • TAN = FAILED CHALLENGE
          </p>

      <div className="flex flex-wrap gap-4 items-start">
        {monthsByEra.map((eraGroup, eraGroupIndex) => (
          <div key={eraGroupIndex} className="contents">
            {/* Era divider - show between eras when there are multiple */}
            {eraGroupIndex > 0 && (
              <div className="flex items-center justify-center self-stretch px-2">
                <span className="text-muted-foreground text-lg" aria-label="gap in team history">◆</span>
              </div>
            )}
            {eraGroup.months.map(([monthKey, days]) => {
              // Parse month key (YYYY-MM) and create date at noon to avoid timezone issues
              const [year, month] = monthKey.split('-')
              const monthDate = new Date(parseInt(year), parseInt(month) - 1, 15) // 15th of month at local time

              // Build calendar grid (7 columns for days of week)
              // Parse dates as local time to avoid timezone issues
              const [fy, fm, fd] = days[0].date.split('-').map(Number)
              const firstDay = new Date(fy, fm - 1, fd)
              const [ly, lm, ld] = days[days.length - 1].date.split('-').map(Number)
              const lastDay = new Date(ly, lm - 1, ld)
              const startDayOfWeek = firstDay.getDay() // 0 = Sunday

              // Calculate weeks needed
              const totalDays = Math.ceil((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1
              const weeksNeeded = Math.ceil((startDayOfWeek + totalDays) / 7)

              const grid: (DayData | null)[][] = []
              for (let week = 0; week < weeksNeeded; week++) {
                grid[week] = []
                for (let day = 0; day < 7; day++) {
                  const dayIndex = week * 7 + day - startDayOfWeek
                  if (dayIndex >= 0 && dayIndex < totalDays) {
                    const targetDate = new Date(firstDay)
                    targetDate.setDate(firstDay.getDate() + dayIndex)
                    const dateStr = targetDate.toISOString().split('T')[0]
                    grid[week][day] = dayMap.get(dateStr) || null
                  } else {
                    grid[week][day] = null
                  }
                }
              }

              return (
                <div key={monthKey} className="flex-shrink-0">
                  <div className="text-[0.65rem] font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
                    {monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>

                  {/* Calendar grid - no day labels, more compact */}
                  <div className="space-y-0.5">
                    {grid.map((week, weekIdx) => (
                      <div key={weekIdx} className="grid grid-cols-7 gap-0.5">
                        {week.map((dayData, dayIdx) => {
                          if (!dayData) {
                            return <div key={dayIdx} className="w-2.5 h-2.5" />
                          }

                          // Classify this day for the selected team
                          const classification = classifyDayForTeam(dayData, selectedTeam!, franchises)

                          // Show empty cell for days team wasn't involved
                          if (!classification.isInvolved) {
                            return (
                              <div
                                key={dayIdx}
                                className="w-2.5 h-2.5 bg-muted/40 border border-border/50"
                              />
                            )
                          }

                          const color = getTeamColor(selectedTeam!, franchises)

                          // Extract classification results for styling
                          const { tiedWhileHolding, failedChallenge, isWinOrDefense, isLoss } = classification

                          // Color logic with opacity baked into the color:
                          // - Wins/defenses: full team color
                          // - Ties while holding: dim team color (25% opacity)
                          // - Losses while holding: transparent with border and X
                          // - Failed challenges (tie or loss): tan with 60% opacity
                          // - Off days: dim team color (25% opacity)

                          // Helper to convert hex to rgba with opacity
                          const hexToRgba = (hex: string, alpha: number) => {
                            const r = parseInt(hex.slice(1, 3), 16)
                            const g = parseInt(hex.slice(3, 5), 16)
                            const b = parseInt(hex.slice(5, 7), 16)
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`
                          }

                          let cellColor: string
                          // IMPORTANT: Check isLoss first to ensure lost belt shows transparent (not tan)
                          if (isLoss) {
                            cellColor = 'transparent'
                          } else if (isWinOrDefense) {
                            cellColor = color // Full opacity
                          } else if (failedChallenge) {
                            cellColor = 'rgba(153, 102, 76, 0.6)' // Tan with 60% opacity for failed challenges
                          } else {
                            cellColor = hexToRgba(color, 0.25) // Dim (off day or tie while holding)
                          }

                          const isSelected = clickedDay?.date === dayData.date

                          return (
                            <div
                              key={dayIdx}
                              className={`w-2.5 h-2.5 cursor-pointer transition-all hover:scale-[2] active:scale-[2.2] hover:z-10 active:z-10 relative flex items-center justify-center ${isSelected ? 'scale-[2] z-10 ring-1 ring-amber-500' : ''} ${isLoss ? 'border border-muted-foreground' : ''}`}
                              style={{
                                backgroundColor: cellColor,
                                boxShadow: isWinOrDefense ? `0 0 4px ${color}60` : 'none',
                                border: isLoss ? undefined : '1px solid rgba(255,255,255,0.3)'
                              }}
                              onClick={(e) => {
                                if (isSelected) {
                                  setClickedDay(null)
                                  setPopupPosition(null)
                                } else {
                                  setClickedDay(dayData)
                                  setPopupPosition({ x: e.clientX, y: e.clientY })
                                }
                              }}
                            >
                              {isLoss && (
                                <span className="text-[7px] font-bold leading-none text-muted-foreground pointer-events-none">
                                  ×
                                </span>
                              )}
                              {tiedWhileHolding && (
                                <span className="text-[6px] font-bold leading-none pointer-events-none">
                                  T
                                </span>
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
        ))}
      </div>
        </>
      )}

      {/* Shared popup component */}
      {clickedDay && selectedTeam && (
        <CalendarDayPopup
          dayData={clickedDay}
          position={popupPosition}
          franchises={franchises}
          selectedTeam={selectedTeam}
          league={league}
          onClose={() => {
            setClickedDay(null)
            setPopupPosition(null)
          }}
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
