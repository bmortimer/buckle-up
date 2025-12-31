'use client'

import { useState, useEffect } from 'react'

interface YearRangeSliderProps {
  minYear: number
  maxYear: number
  value: [number, number]
  onChange: (range: [number, number]) => void
}

export default function YearRangeSlider({ minYear, maxYear, value, onChange }: YearRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value)
    const newRange: [number, number] = [newMin, Math.max(newMin, localValue[1])]
    setLocalValue(newRange)
    onChange(newRange)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value)
    const newRange: [number, number] = [Math.min(localValue[0], newMax), newMax]
    setLocalValue(newRange)
    onChange(newRange)
  }

  const totalYears = maxYear - minYear
  const minPercent = ((localValue[0] - minYear) / totalYears) * 100
  const maxPercent = ((localValue[1] - minYear) / totalYears) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-orbitron text-muted-foreground uppercase tracking-wider">▸ Year Range</span>
        <span className="text-sm font-mono font-bold tabular-nums">
          {localValue[0]} - {localValue[1]}
        </span>
      </div>

      <div className="relative h-8 flex items-center">
        {/* Track - LED style */}
        <div className="absolute w-full h-1.5 bg-black/40 border border-border/30" />

        {/* Active range - glowing LED bar */}
        <div
          className="absolute h-1.5 bg-amber-500 border border-amber-500/50"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.6), inset 0 1px 2px rgba(255,255,255,0.3)'
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)]"
        />

        {/* Max slider */}
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)]"
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
