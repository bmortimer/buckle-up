'use client'

import { useState, useEffect } from 'react'

interface YearRangeSliderProps {
  minYear: number
  maxYear: number
  value: [number, number]
  onChange: (range: [number, number]) => void
}

export default function YearRangeSlider({ minYear, maxYear, value, onChange }: YearRangeSliderProps) {
  const isAllYears = value[0] === minYear && value[1] === maxYear
  const [showAllYears, setShowAllYears] = useState(isAllYears)
  const [selectedYear, setSelectedYear] = useState(maxYear)

  useEffect(() => {
    const isAll = value[0] === minYear && value[1] === maxYear
    setShowAllYears(isAll)
    if (!isAll) {
      setSelectedYear(value[0])
    }
  }, [value, minYear, maxYear])

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value)
    setSelectedYear(year)
    if (!showAllYears) {
      onChange([year, year])
    }
  }

  const toggleAllYears = () => {
    if (showAllYears) {
      // Switch to single year
      setShowAllYears(false)
      onChange([selectedYear, selectedYear])
    } else {
      // Switch to all years
      setShowAllYears(true)
      onChange([minYear, maxYear])
    }
  }

  const yearPercent = ((selectedYear - minYear) / (maxYear - minYear)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-orbitron text-muted-foreground uppercase tracking-wider">▸ Year Select</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold tabular-nums">
            {showAllYears ? 'ALL YEARS' : selectedYear}
          </span>
          <button
            onClick={toggleAllYears}
            className={`px-2 py-0.5 text-[0.6rem] font-mono uppercase border transition-all ${
              showAllYears
                ? 'bg-amber-500/20 text-amber-500 border-amber-500'
                : 'bg-card text-muted-foreground border-border hover:border-amber-500'
            }`}
          >
            ALL
          </button>
        </div>
      </div>

      <div className="relative h-8 flex items-center">
        {/* Track - LED style */}
        <div className="absolute w-full h-1.5 bg-black/40 border border-border/30" />

        {/* Active position - glowing LED indicator */}
        {!showAllYears && (
          <div
            className="absolute h-1.5 w-1 bg-amber-500 border border-amber-500/50 transition-all"
            style={{
              left: `${yearPercent}%`,
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.6), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          />
        )}

        {/* All years indicator */}
        {showAllYears && (
          <div
            className="absolute h-1.5 bg-amber-500/30 border border-amber-500/30"
            style={{
              left: '0%',
              right: '0%',
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.3)'
            }}
          />
        )}

        {/* Year slider */}
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYear}
          onChange={handleYearChange}
          disabled={showAllYears}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)] [&::-webkit-slider-thumb]:disabled:opacity-30 [&::-webkit-slider-thumb]:disabled:cursor-not-allowed [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)] [&::-moz-range-thumb]:disabled:opacity-30 [&::-moz-range-thumb]:disabled:cursor-not-allowed"
        />
      </div>

      {/* Year markers */}
      <div className="flex justify-between text-[0.65rem] text-muted-foreground font-mono tabular-nums">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  )
}
