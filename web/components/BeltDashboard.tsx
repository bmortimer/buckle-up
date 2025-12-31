'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import { BeltTracker, trackAllSeasons } from '@/lib/beltTracker'
import BeltHolderCard from './BeltHolderCard'
import BarChartView from './BarChartView'
import Timeline from './Timeline'
import BeltCalendar from './BeltCalendar'
import RetroScoreboard from './RetroScoreboard'
import NextGamePreview from './NextGamePreview'
import YearRangeSlider from './YearRangeSlider'
import TeamLogo from './TeamLogo'
import { ThemeToggle } from './ThemeToggle'

interface BeltDashboardProps {
  wnbaSeasons: Record<string, SeasonData>
  nbaSeasons: Record<string, SeasonData>
  wnbaFranchises: FranchiseInfo[]
  nbaFranchises: FranchiseInfo[]
  wnbaChampions: Record<string, string>
  nbaChampions: Record<string, string>
}

export default function BeltDashboard({
  wnbaSeasons,
  nbaSeasons,
  wnbaFranchises,
  nbaFranchises,
  wnbaChampions,
  nbaChampions,
}: BeltDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [league, setLeague] = useState<'nba' | 'wnba'>('wnba')
  const [season, setSeason] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Check if league toggle should be visible
  const showLeagueToggle = searchParams.get('time') === 'dame'

  // Get current league data
  const seasons = league === 'wnba' ? wnbaSeasons : nbaSeasons
  const franchises = league === 'wnba' ? wnbaFranchises : nbaFranchises

  // Get available years for range slider
  const availableYears = Object.keys(seasons).map(Number).sort((a, b) => a - b)
  const minYear = availableYears[0] || 1997
  const maxYear = availableYears[availableYears.length - 1] || new Date().getFullYear()

  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear])

  // Read season from URL on mount
  useEffect(() => {
    const urlSeason = searchParams.get('season')
    if (urlSeason) {
      setSeason(urlSeason)
    }
  }, [searchParams])

  // Reset year range when league changes
  useEffect(() => {
    const newSeasons = league === 'wnba' ? wnbaSeasons : nbaSeasons
    const newYears = Object.keys(newSeasons).map(Number).sort((a, b) => a - b)
    const newMin = newYears[0] || 1997
    const newMax = newYears[newYears.length - 1] || new Date().getFullYear()
    setYearRange([newMin, newMax])
    setSelectedTeam(null)
  }, [league, wnbaSeasons, nbaSeasons])

  const champions = league === 'wnba' ? wnbaChampions : nbaChampions

  // Get all games for the current view (filtered by year range)
  const allGames = useMemo(() => {
    const filteredSeasons = Object.keys(seasons)
      .filter(s => {
        const year = parseInt(s)
        return year >= yearRange[0] && year <= yearRange[1]
      })
      .sort()

    return filteredSeasons.flatMap(s => seasons[s].games)
  }, [yearRange, seasons])

  // Track belt when data changes (filtered by year range)
  const history = useMemo(() => {
    const filteredSeasons = Object.keys(seasons)
      .filter(s => {
        const year = parseInt(s)
        return year >= yearRange[0] && year <= yearRange[1]
      })
      .sort()

    if (filteredSeasons.length === 0) return null

    const seasonsData = filteredSeasons.map(s => ({
      season: s,
      games: seasons[s].games
    }))

    return trackAllSeasons(seasonsData, franchises, 'LAS')
  }, [yearRange, seasons, franchises])

  // Get all teams that appear in the data
  const allTeams = useMemo(() => {
    if (!history) return []
    const teamSet = new Set<string>()
    allGames.forEach(game => {
      teamSet.add(game.homeTeam)
      teamSet.add(game.awayTeam)
    })
    return Array.from(teamSet).sort()
  }, [allGames, history])

  if (!history) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          No Data Available
        </h1>
        <p className="text-muted-foreground">
          No data found for {league.toUpperCase()} {season}
        </p>
      </div>
    )
  }

  const currentHolderStats = history.summary.teams.find(
    t => t.team === history.summary.currentHolder
  )

  return (
    <div className="space-y-8">
      {/* Theme Toggle - Top Right */}
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      {/* Header - Full retro LED scoreboard style */}
      <div className="scoreboard-panel p-8 text-center space-y-4 relative overflow-hidden">
        {/* Top LED strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 opacity-70" />

        <h1 className="text-6xl font-orbitron tracking-[0.25em] uppercase led-text" style={{ color: 'hsl(var(--led-red))' }}>
          CHAMPIONSHIP
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
          <h2 className="text-4xl font-mono tracking-[0.3em] uppercase led-text" style={{ color: 'hsl(var(--led-amber))' }}>
            BELT TRACKER
          </h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
        </div>
        <p className="text-muted-foreground text-xs font-mono tracking-[0.2em] uppercase pt-2">
          ▸ Lineal Championship Tracking System ◂
        </p>

        {/* Bottom LED indicator dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-60" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-60" />
        </div>
      </div>

      {/* League Toggle - Only visible with ?time=dame */}
      {showLeagueToggle && (
        <div
          className="flex justify-center gap-4"
          role="group"
          aria-label="League selection"
        >
          <button
            onClick={() => setLeague('wnba')}
            className={`px-8 py-3 font-orbitron text-sm uppercase tracking-wider border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              league === 'wnba'
                ? 'bg-amber-500/20 text-amber-500 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'bg-card text-muted-foreground border-border hover:border-muted-foreground'
            }`}
            aria-pressed={league === 'wnba'}
            aria-label="View WNBA data"
          >
            ◆ WNBA
          </button>
          <button
            onClick={() => setLeague('nba')}
            className={`px-8 py-3 font-orbitron text-sm uppercase tracking-wider border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              league === 'nba'
                ? 'bg-amber-500/20 text-amber-500 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'bg-card text-muted-foreground border-border hover:border-muted-foreground'
            }`}
            aria-pressed={league === 'nba'}
            aria-label="View NBA data"
          >
            ◆ NBA
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="scoreboard-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Range Slider */}
          <YearRangeSlider
            minYear={minYear}
            maxYear={maxYear}
            value={yearRange}
            onChange={setYearRange}
          />

          {/* Team Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-orbitron text-muted-foreground uppercase tracking-wider">
              ▸ Filter by Team
            </label>
            <select
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(e.target.value || null)}
              className="w-full px-4 py-2.5 bg-background border-2 border-border text-foreground font-mono text-sm cursor-pointer hover:border-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <option value="">◆ ALL TEAMS</option>
              {allTeams.map((team) => {
                const franchise = franchises.find(f => f.teamAbbr === team)
                const displayName = franchise?.displayName || team
                return (
                  <option key={team} value={team}>
                    {displayName}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Stats & Next Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetroScoreboard
          totalGames={history.summary.totalGames}
          totalChanges={history.summary.totalChanges}
          season={yearRange[0] === yearRange[1] ? yearRange[0].toString() : undefined}
          champion={yearRange[0] === yearRange[1] ? champions[yearRange[0].toString()] : undefined}
        />
        <NextGamePreview />
      </div>

      {/* Current Holder Card - Only show when not filtering by specific team */}
      {!selectedTeam && (
        <BeltHolderCard
          currentHolder={history.summary.currentHolder}
          stats={currentHolderStats}
          franchises={franchises}
          isPastSeason={yearRange[1] < new Date().getFullYear()}
        />
      )}

      {/* Visualizations Grid */}
      <div className={selectedTeam ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
        {selectedTeam && (
          <BeltCalendar history={history} franchises={franchises} selectedTeam={selectedTeam} allGames={allGames} />
        )}
        <BarChartView teams={history.summary.teams} franchises={franchises} allGames={allGames} selectedTeam={selectedTeam} />
      </div>

      {/* Timeline */}
      <Timeline changes={history.changes} franchises={franchises} selectedTeam={selectedTeam} />

      {/* Footer */}
      <div className="scoreboard-panel p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
            Data updates nightly at 03:00 ET • System Active
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <p className="text-[0.65rem] font-mono text-muted-foreground tracking-wider">
          ▸ {league.toUpperCase()} {season === 'all' ? 'ALL-TIME' : season} • {history.summary.teams.length} TEAMS TRACKED ◂
        </p>
      </div>
    </div>
  )
}
