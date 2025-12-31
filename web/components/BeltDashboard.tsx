'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import { BeltTracker, trackAllSeasons } from '@/lib/beltTracker'
import { getSeasonConfig } from '@/lib/seasonConfig'
import BeltHolderCard from './BeltHolderCard'
import TeamBeltCard from './TeamBeltCard'
import BarChartView from './BarChartView'
import Timeline from './Timeline'
import BeltCalendar from './BeltCalendar'
import DetailedCalendar from './DetailedCalendar'
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

  // Get season config for current league
  const seasonConfig = getSeasonConfig(league)

  // Detect current context
  const context = useMemo(() => {
    const isSingleYear = yearRange[0] === yearRange[1]
    const isAllYears = yearRange[0] === minYear && yearRange[1] === maxYear
    const selectedYear = yearRange[0]

    if (selectedTeam) {
      return 'TEAM' as const
    } else if (isSingleYear && selectedYear < seasonConfig.currentYear) {
      return 'PAST_YEAR' as const
    } else if (isSingleYear && selectedYear === seasonConfig.currentYear && seasonConfig.isInSeason) {
      return 'THIS_YEAR' as const
    } else {
      return 'OFF_SEASON' as const
    }
  }, [yearRange, minYear, maxYear, selectedTeam, seasonConfig])

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

  // Get all teams that appear in the selected year range
  const allTeams = useMemo(() => {
    if (!history) return []
    const teamSet = new Set<string>()
    allGames.forEach(game => {
      teamSet.add(game.homeTeam)
      teamSet.add(game.awayTeam)
    })
    return Array.from(teamSet).sort()
  }, [allGames, history])

  // Get available years for the selected team (if any)
  const availableYearsForTeam = useMemo(() => {
    if (!selectedTeam) return availableYears

    const teamYears = new Set<number>()
    Object.keys(seasons).forEach(year => {
      const yearNum = parseInt(year)
      const games = seasons[year].games
      const teamPlayedThisYear = games.some(
        game => game.homeTeam === selectedTeam || game.awayTeam === selectedTeam
      )
      if (teamPlayedThisYear) {
        teamYears.add(yearNum)
      }
    })

    return Array.from(teamYears).sort((a, b) => a - b)
  }, [selectedTeam, seasons])

  // Adjust year range when team is selected if current range is invalid
  useEffect(() => {
    if (selectedTeam && availableYearsForTeam.length > 0) {
      const teamMin = availableYearsForTeam[0]
      const teamMax = availableYearsForTeam[availableYearsForTeam.length - 1]

      // If current year range doesn't overlap with team's years, reset to all team years
      if (yearRange[0] > teamMax || yearRange[1] < teamMin) {
        setYearRange([teamMin, teamMax])
      }
      // If current year is outside team's range, clamp it
      else if (yearRange[0] < teamMin || yearRange[1] > teamMax) {
        setYearRange([
          Math.max(yearRange[0], teamMin),
          Math.min(yearRange[1], teamMax)
        ])
      }
    }
  }, [selectedTeam, availableYearsForTeam, yearRange])

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
      <div data-card="header" className="scoreboard-panel p-8 text-center space-y-4 relative overflow-hidden">
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
      <div data-card="filters" className="scoreboard-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Range Slider */}
          <YearRangeSlider
            minYear={selectedTeam ? availableYearsForTeam[0] || minYear : minYear}
            maxYear={selectedTeam ? availableYearsForTeam[availableYearsForTeam.length - 1] || maxYear : maxYear}
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
      {/* season-stats: show on PAST_YEAR, THIS_YEAR, OFF_SEASON (not TEAM) */}
      {/* next-game: show on THIS_YEAR, OFF_SEASON, and TEAM if team in title match */}
      {context !== 'TEAM' && (
        <div className={context === 'PAST_YEAR' ? "" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
          <RetroScoreboard
            totalGames={history.summary.totalGames}
            totalChanges={history.summary.totalChanges}
            season={yearRange[0] === yearRange[1] ? yearRange[0].toString() : undefined}
            champion={yearRange[0] === yearRange[1] ? champions[yearRange[0].toString()] : undefined}
          />
          {(context === 'THIS_YEAR' || context === 'OFF_SEASON') && <NextGamePreview />}
        </div>
      )}

      {/* Current Holder Card - show on PAST_YEAR, THIS_YEAR, OFF_SEASON */}
      {context !== 'TEAM' && (
        <BeltHolderCard
          currentHolder={history.summary.currentHolder}
          stats={currentHolderStats}
          franchises={franchises}
          isPastSeason={context === 'PAST_YEAR'}
        />
      )}

      {/* Team Belt Card - show on TEAM context */}
      {context === 'TEAM' && selectedTeam && (() => {
        const teamStats = history.summary.teams.find(t => t.team === selectedTeam)
        const isCurrentHolder = history.summary.currentHolder === selectedTeam
        const isSingleYear = yearRange[0] === yearRange[1]
        const isSeasonChampion = isSingleYear && champions[yearRange[0].toString()] === selectedTeam

        return (
          <TeamBeltCard
            team={selectedTeam}
            stats={teamStats}
            franchises={franchises}
            isCurrentHolder={isCurrentHolder}
            isSeasonChampion={isSeasonChampion}
            year={isSingleYear ? yearRange[0] : undefined}
          />
        )
      })()}

      {/* Detailed Calendar - show on PAST_YEAR, THIS_YEAR, OFF_SEASON (1 year only) */}
      {context !== 'TEAM' && yearRange[0] === yearRange[1] && (
        <DetailedCalendar
          history={history}
          franchises={franchises}
          allGames={allGames}
          year={yearRange[0]}
        />
      )}

      {/* Visualizations Grid */}
      {/* Calendar (github-style): show only on TEAM */}
      {/* team-stats: always show */}
      <div className={context === 'TEAM' ? "space-y-6" : ""}>
        {context === 'TEAM' && (
          <BeltCalendar history={history} franchises={franchises} selectedTeam={selectedTeam} allGames={allGames} />
        )}
        <BarChartView teams={history.summary.teams} franchises={franchises} allGames={allGames} selectedTeam={selectedTeam} />
      </div>

      {/* Timeline - Hidden for now */}
      {/* <Timeline changes={history.changes} franchises={franchises} selectedTeam={selectedTeam} /> */}

      {/* Footer */}
      <div data-card="footer" className="scoreboard-panel p-6 text-center">
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
