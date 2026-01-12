'use client'

import { useState, useEffect } from 'react'
import type { BeltHistory, FranchiseInfo, Game } from '@/lib/types'
import { getTeamColor, getTeamDisplayName } from '@/lib/franchises'
import TeamLogo from './TeamLogo'
import { isSameFranchise } from '@/lib/franchises'
import CalendarDayPopup from './CalendarDayPopup'

interface BeltCalendarProps {
  history: BeltHistory
  franchises: FranchiseInfo[]
  selectedTeam?: string | null
  allGames: Game[]
}

interface DayData {
  date: string
  holder: string
  played: boolean
  won: boolean | null
  winner?: string // Team that won this game (if played)
  challenger?: string // Team that challenged for the belt (if played)
  game?: Game // The actual game that was played (if any)
}

interface PopupPosition {
  x: number
  y: number
}

export default function BeltCalendar({ history, franchises, selectedTeam: externalSelectedTeam, allGames }: BeltCalendarProps) {
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
  const dayMap = new Map<string, DayData>()

  // Start with initial holder from the first change, or current holder if no changes
  let currentHolder = history.startingTeam

  // Get date range from all games (already filtered by year range in parent)
  if (allGames.length === 0) return null
  const gameDates = allGames.map(g => new Date(g.date))
  const minDate = new Date(Math.min(...gameDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...gameDates.map(d => d.getTime())))

  // Create a map of ALL games by date (sorted)
  const gamesByDate = new Map<string, Game[]>()
  allGames.forEach(game => {
    const dateStr = game.date
    if (!gamesByDate.has(dateStr)) {
      gamesByDate.set(dateStr, [])
    }
    gamesByDate.get(dateStr)!.push(game)
  })

  // Fill in every day from min to max
  const currentDate = new Date(minDate)
  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const gamesOnDate = gamesByDate.get(dateStr) || []

    // Find if belt holder played on this day
    const holderGame = gamesOnDate.find(game =>
      isSameFranchise(game.homeTeam, currentHolder, franchises) ||
      isSameFranchise(game.awayTeam, currentHolder, franchises)
    )

    if (holderGame) {
      // Belt holder played
      const holderIsHome = isSameFranchise(holderGame.homeTeam, currentHolder, franchises)
      const holderWon = holderIsHome
        ? holderGame.homeScore > holderGame.awayScore
        : holderGame.awayScore > holderGame.homeScore

      const winner = holderIsHome
        ? (holderWon ? holderGame.homeTeam : holderGame.awayTeam)
        : (holderWon ? holderGame.awayTeam : holderGame.homeTeam)

      const challenger = holderIsHome ? holderGame.awayTeam : holderGame.homeTeam

      dayMap.set(dateStr, {
        date: dateStr,
        holder: currentHolder,
        played: true,
        won: holderWon,
        winner: winner,
        challenger: challenger,
        game: holderGame,
      })

      // Update holder if they lost
      if (!holderWon) {
        currentHolder = winner
      }
    } else {
      // Belt holder didn't play (off day)
      dayMap.set(dateStr, {
        date: dateStr,
        holder: currentHolder,
        played: false,
        won: null,
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Group days by month
  const monthsData = new Map<string, DayData[]>()
  dayMap.forEach((dayData) => {
    const date = new Date(dayData.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthsData.has(monthKey)) {
      monthsData.set(monthKey, [])
    }
    monthsData.get(monthKey)!.push(dayData)
  })

  // Only show months that have games
  const relevantMonths = Array.from(monthsData.entries())
    .filter(([_, days]) => days.some(d => d.played))
    .sort((a, b) => a[0].localeCompare(b[0]))

  // Determine year display for title
  const yearDisplay = (() => {
    const uniqueYears = new Set(allGames.map(g => g.date.substring(0, 4)))
    if (uniqueYears.size === 1) {
      return Array.from(uniqueYears)[0]
    }
    const years = Array.from(uniqueYears).sort()
    return `${years[0]}-${years[years.length - 1]}`
  })()

  return (
    <div data-card="calendar" className="scoreboard-panel p-6 relative">
      <div className="flex items-center justify-center mb-6 border-b-2 border-border pb-3">
        <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
          ◆ History · {selectedTeam} · {yearDisplay} ◆
        </div>
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
                <TeamLogo teamCode={team} franchises={franchises} size="xs" />
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

      <div className="flex flex-wrap gap-4">
        {relevantMonths.map(([monthKey, days]) => {
          const monthDate = new Date(monthKey + '-01')
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

          // Build calendar grid (7 columns for days of week)
          const firstDay = new Date(days[0].date)
          const lastDay = new Date(days[days.length - 1].date)
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

                      // Check if selected team is involved: held belt, won belt, OR challenged for belt
                      const heldBelt = dayData.holder === selectedTeam
                      const wonBelt = dayData.winner === selectedTeam && !heldBelt
                      const challengedBelt = dayData.challenger === selectedTeam && !heldBelt && !wonBelt
                      const isInvolved = heldBelt || wonBelt || challengedBelt

                      // Show empty cell for days team wasn't involved
                      if (!isInvolved) {
                        return (
                          <div
                            key={dayIdx}
                            className="w-2.5 h-2.5 bg-muted/10 border border-border/20"
                          />
                        )
                      }

                      const color = getTeamColor(selectedTeam!, franchises)

                      // Determine what happened:
                      // 1. Won belt from another team (bright team color)
                      // 2. Defended belt successfully (bright team color)
                      // 3. Lost belt (grey with X)
                      // 4. Off day while holding (dim team color)
                      // 5. Failed title challenge (darker tan/muted)

                      const wonBeltThisDay = wonBelt && dayData.played
                      const defendedBelt = heldBelt && dayData.played && dayData.won === true
                      const lostBelt = heldBelt && dayData.played && dayData.won === false
                      const offDay = heldBelt && !dayData.played
                      const failedChallenge = challengedBelt && dayData.played

                      const isWinOrDefense = wonBeltThisDay || defendedBelt
                      const isLoss = lostBelt

                      // Color logic: team color for wins/defenses/off days, transparent for losses, tan for failed challenges
                      const cellColor = isLoss
                        ? 'transparent'
                        : failedChallenge
                          ? 'hsl(30, 30%, 50%)' // Darker tan/brown
                          : color
                      const opacity = isWinOrDefense ? 1 : isLoss ? 1 : failedChallenge ? 0.6 : 0.25

                      const isSelected = clickedDay?.date === dayData.date

                      return (
                        <div
                          key={dayIdx}
                          className={`w-2.5 h-2.5 cursor-pointer transition-all hover:scale-[2] active:scale-[2.2] hover:z-10 active:z-10 relative flex items-center justify-center ${isSelected ? 'scale-[2] z-10 ring-1 ring-amber-500' : ''} ${isLoss ? 'border border-muted-foreground' : ''}`}
                          style={{
                            backgroundColor: cellColor,
                            opacity: opacity,
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
        </>
      )}

      {/* Shared popup component */}
      {clickedDay && selectedTeam && (
        <CalendarDayPopup
          dayData={clickedDay}
          position={popupPosition}
          franchises={franchises}
          selectedTeam={selectedTeam}
          onClose={() => {
            setClickedDay(null)
            setPopupPosition(null)
          }}
        />
      )}
    </div>
  )
}
