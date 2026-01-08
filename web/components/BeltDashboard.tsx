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
import TeamSelector from './TeamSelector'
import TeamLogo from './TeamLogo'
import { ThemeSwitcher } from './ThemeSwitcher'
import BuyMeCoffee from './BuyMeCoffee'
import Link from 'next/link'

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
  const [isAllTime, setIsAllTime] = useState(true) // Track "ALL TIME" selection explicitly

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
    setIsAllTime(true) // Reset to ALL TIME when switching leagues
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

    return trackAllSeasons(seasonsData, franchises, champions)
  }, [yearRange, seasons, franchises, champions])

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

  // Adjust year range when team is selected
  useEffect(() => {
    if (selectedTeam && availableYearsForTeam.length > 0) {
      const teamMin = availableYearsForTeam[0]
      const teamMax = availableYearsForTeam[availableYearsForTeam.length - 1]

      // If "ALL TIME" is selected, constrain to team's full range but keep isAllTime true
      if (isAllTime) {
        setYearRange([teamMin, teamMax])
      }
      // If specific year/range is selected, clamp to team's available years
      else {
        // If current year range doesn't overlap with team's years, reset to all team years
        if (yearRange[0] > teamMax || yearRange[1] < teamMin) {
          setYearRange([teamMin, teamMax])
          setIsAllTime(true) // Reset to ALL TIME since we're showing all team years
        }
        // If current year is outside team's range, clamp it
        else if (yearRange[0] < teamMin || yearRange[1] > teamMax) {
          setYearRange([
            Math.max(yearRange[0], teamMin),
            Math.min(yearRange[1], teamMax)
          ])
        }
      }
    } else if (!selectedTeam && isAllTime) {
      // When deselecting team, reset to full league range if ALL TIME
      setYearRange([minYear, maxYear])
    }
  }, [selectedTeam, availableYearsForTeam, isAllTime, minYear, maxYear])

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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Theme Switcher - Top Right */}
      <div className="flex justify-end">
        <ThemeSwitcher />
      </div>

      {/* Header */}
      <div data-card="header" className="scoreboard-panel panel-rivets p-4 sm:p-6 md:p-8 text-center space-y-2 sm:space-y-4 relative overflow-hidden">
        {/* LED strip - shown/hidden by CSS */}
        <div className="led-bar-top" />

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] uppercase led-text accent-line" style={{ color: 'hsl(var(--led-red))' }}>
          BELT TRACKER
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-border" />
          <h2 className="text-xl sm:text-3xl md:text-4xl font-mono tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase led-text" style={{ color: 'hsl(var(--led-amber))' }}>
            REGULAR SEASON
          </h2>
          <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-border" />
        </div>
        <p className="text-muted-foreground text-[0.65rem] sm:text-xs font-mono tracking-[0.1em] sm:tracking-[0.2em] uppercase pt-1 sm:pt-2">
          <Link href="/about" className="hover:text-primary transition-colors">
            Lineal Championship Tracker <span className="text-primary">?</span>
          </Link>
        </p>

        {/* Bottom LED bar - shown/hidden by CSS */}
        <div className="led-bar-bottom" />
      </div>

      {/* League Toggle - Only visible with ?time=dame */}
      {showLeagueToggle && (
        <div
          className="flex justify-center gap-2 sm:gap-4"
          role="group"
          aria-label="League selection"
        >
          <button
            onClick={() => setLeague('wnba')}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-orbitron text-xs sm:text-sm uppercase tracking-wider border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              league === 'wnba'
                ? 'bg-amber-500/20 text-amber-500 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'bg-card text-muted-foreground border-border active:border-muted-foreground'
            }`}
            aria-pressed={league === 'wnba'}
            aria-label="View WNBA data"
          >
            ◆ WNBA
          </button>
          <button
            onClick={() => setLeague('nba')}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-orbitron text-xs sm:text-sm uppercase tracking-wider border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              league === 'nba'
                ? 'bg-amber-500/20 text-amber-500 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'bg-card text-muted-foreground border-border active:border-muted-foreground'
            }`}
            aria-pressed={league === 'nba'}
            aria-label="View NBA data"
          >
            ◆ NBA
          </button>
        </div>
      )}

      {/* Filters */}
      <div data-card="filters" className="scoreboard-panel p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Year Range Slider */}
          <YearRangeSlider
            minYear={selectedTeam ? availableYearsForTeam[0] || minYear : minYear}
            maxYear={selectedTeam ? availableYearsForTeam[availableYearsForTeam.length - 1] || maxYear : maxYear}
            value={yearRange}
            onChange={setYearRange}
            isAllTime={isAllTime}
            onAllTimeChange={setIsAllTime}
          />

          {/* Team Selector */}
          <TeamSelector
            teams={allTeams}
            franchises={franchises}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
          />
        </div>
      </div>

      {/* Stats */}
      {context !== 'TEAM' && (
        <RetroScoreboard
          totalGames={allGames.length}
          totalChanges={history.summary.totalChanges}
          totalTitleBouts={history.summary.teams.reduce((sum, t) => sum + t.totalGames, 0) / 2}
          isAllTime={isAllTime}
        />
      )}

      {/* Current Holder Card + Next Game Preview */}
      {context !== 'TEAM' && (
        <div className={(context === 'THIS_YEAR' || context === 'OFF_SEASON') ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" : ""}>
          <BeltHolderCard
            currentHolder={history.summary.currentHolder}
            stats={currentHolderStats}
            franchises={franchises}
            isPastSeason={context === 'PAST_YEAR'}
          />
          {(context === 'THIS_YEAR' || context === 'OFF_SEASON') && (
            <NextGamePreview franchises={franchises} />
          )}
        </div>
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
      <div data-card="footer" className="scoreboard-panel panel-rivets p-6 text-center relative overflow-hidden">
        <div className="led-bar-top" />
        <div className="relative z-10">
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">
            Data updates nightly at 03:00 ET
          </p>
          <p className="text-[0.65rem] font-mono text-muted-foreground tracking-wider">
            {league.toUpperCase()} {isAllTime ? 'ALL-TIME' : yearRange[0] === yearRange[1] ? yearRange[0] : `${yearRange[0]}-${yearRange[1]}`} • {history.summary.teams.length} TEAMS • <a href="https://buymeacoffee.com/bmortimer" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 transition-colors">DONATE</a>
          </p>
        </div>
        <div className="led-bar-bottom" />
      </div>

      {/* Buy Me a Coffee */}
      <BuyMeCoffee />
    </div>
  )
}
