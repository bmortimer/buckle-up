'use client'

import { useState } from 'react'

interface SeasonPickerProps {
  minYear: number
  maxYear: number
  value: [number, number]
  onChange: (range: [number, number]) => void
  isAllTime: boolean
  onAllTimeChange: (isAllTime: boolean) => void
  league?: 'nba' | 'wnba'
}

// Format year for display based on league
// NBA: "2024-25" format (season spans two calendar years)
// WNBA: "2024" format (single calendar year)
function formatSeasonDisplay(year: number, league: 'nba' | 'wnba'): string {
  if (league === 'wnba') {
    return year.toString()
  }
  // NBA uses YYYY-YY format
  const nextYear = (year + 1) % 100
  return `${year}-${nextYear.toString().padStart(2, '0')}`
}

export default function SeasonPicker({
  minYear,
  maxYear,
  value,
  onChange,
  isAllTime,
  onAllTimeChange,
  league = 'wnba'
}: SeasonPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentYear = isAllTime ? null : value[0]

  // Get unique decades with data
  const decades = Array.from(
    new Set(
      Array.from(
        { length: maxYear - minYear + 1 },
        (_, i) => minYear + i
      ).map(year => Math.floor(year / 10) * 10)
    )
  ).sort((a, b) => b - a) // Newest first

  // Group years by decade for organized display
  const yearsByDecade = decades.map(decade => {
    const years = Array.from(
      { length: maxYear - minYear + 1 },
      (_, i) => minYear + i
    ).filter(year => Math.floor(year / 10) * 10 === decade)
    return { decade, years: years.sort((a, b) => b - a) } // Newest first within decade
  })

  const handleYearChange = (year: number | null) => {
    if (year === null) {
      onAllTimeChange(true)
      onChange([minYear, maxYear])
    } else {
      onAllTimeChange(false)
      onChange([year, year])
    }
    setIsOpen(false)
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAllTime) {
      onAllTimeChange(true)
      onChange([minYear, maxYear])
    }
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span id="time-period-label" className="text-[0.65rem] sm:text-xs font-orbitron text-muted-foreground uppercase tracking-wide sm:tracking-wider">
          <span aria-hidden="true">◆ </span>Time Period
        </span>
        {!isAllTime && (
          <button
            onClick={handleReset}
            className="text-[0.6rem] font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
            aria-label="Reset to All Time"
          >
            Reset ×
          </button>
        )}
      </div>

      {/* Clickable Year Display */}
      <button
        onClick={() => setIsOpen(true)}
        aria-labelledby="time-period-label"
        aria-haspopup="dialog"
        className="w-full scoreboard-panel p-2 sm:p-3 relative group hover:border-primary transition-all active:scale-[0.98]"
      >
        {/* Year Display */}
        <div className="text-center">
          <div className="text-lg sm:text-xl md:text-lg lg:text-xl font-mono font-bold tabular-nums tracking-wider transition-all group-hover:scale-105" style={{ color: 'hsl(var(--primary))' }}>
            {isAllTime ? 'ALL TIME' : formatSeasonDisplay(currentYear!, league)}
          </div>
          <div className="text-[0.55rem] text-muted-foreground/60 font-mono mt-1 uppercase tracking-wider">
            Click to change ▸
          </div>
        </div>
      </button>

      {/* Year Selection Modal */}
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
            aria-labelledby="time-period-dialog-title"
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[80vh] scoreboard-panel z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-muted/20 border-b-2 border-border p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 id="time-period-dialog-title" className="text-base sm:text-lg font-orbitron uppercase tracking-wider">
                  <span aria-hidden="true">◆ </span>Select {league === 'nba' ? 'Season' : 'Year'}
                </h3>
                <div className="text-[0.6rem] text-muted-foreground/60 font-mono mt-1">
                  {formatSeasonDisplay(minYear, league)} — {formatSeasonDisplay(maxYear, league)}
                </div>
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
                {/* ALL TIME Button */}
                <div>
                  <button
                    onClick={() => handleYearChange(null)}
                    aria-current={isAllTime ? 'true' : undefined}
                    className={`
                      w-full px-4 py-3 text-base sm:text-lg font-mono font-bold uppercase
                      border-2 transition-all
                      ${isAllTime
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-[0.98]'
                      }
                    `}
                  >
                    ALL TIME
                  </button>
                </div>

                {/* Years by Decade */}
                {yearsByDecade.map(({ decade, years }) => {
                  const decadeLabel = `${decade}s`

                  return (
                    <div key={decade}>
                      {/* Decade Label */}
                      <div className="text-xs sm:text-sm font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <span>{decadeLabel}</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
                      </div>

                      {/* Year Grid */}
                      <div className={`grid gap-2 ${league === 'nba' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5' : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'}`}>
                        {years.map(year => {
                          const isSelected = currentYear === year

                          return (
                            <button
                              key={year}
                              onClick={() => handleYearChange(year)}
                              aria-current={isSelected ? 'true' : undefined}
                              className={`
                                px-3 py-2 text-sm sm:text-base font-mono font-bold tabular-nums
                                border-2 transition-all
                                ${isSelected
                                  ? 'bg-primary/10 text-primary border-primary scale-105'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary active:scale-95'
                                }
                              `}
                            >
                              {formatSeasonDisplay(year, league)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

