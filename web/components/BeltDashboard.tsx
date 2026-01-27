'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import { trackAllSeasons } from '@/lib/beltTracker'
import { getCurrentFranchiseAbbr, getAllFranchiseAbbrs } from '@/lib/franchises'
import { getSeasonConfig } from '@/lib/seasonConfig'
import BeltHolderCard from './BeltHolderCard'
import TeamBeltCard from './TeamBeltCard'
import BarChartView from './BarChartView'
import BeltCalendar from './BeltCalendar'
import DetailedCalendar from './DetailedCalendar'
import RetroScoreboard from './RetroScoreboard'
import NextGamePreview from './NextGamePreview'
import Last5BeltChanges from './Last5BeltChanges'
import SeasonPicker from './SeasonPicker'
import TeamSelector from './TeamSelector'
import { ThemeSwitcher } from './ThemeSwitcher'
import BuyMeCoffee from './BuyMeCoffee'
import Link from 'next/link'

interface BeltDashboardProps {
  league: 'nba' | 'wnba'
  seasons: Record<string, SeasonData>
  franchises: FranchiseInfo[]
  champions: Record<string, string>
}

export default function BeltDashboard({
  league,
  seasons,
  franchises,
  champions,
}: BeltDashboardProps) {
  const searchParams = useSearchParams()

  const [season, setSeason] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [isAllTime, setIsAllTime] = useState(true)

  // Get available years for range slider
  const availableYears = useMemo(() => {
    // For NBA, parse the season format (e.g., "2023-24" -> 2023)
    return Object.keys(seasons).map(s => {
      const year = parseInt(s)
      return isNaN(year) ? parseInt(s.split('-')[0]) : year
    }).sort((a, b) => a - b)
  }, [seasons])

  const minYear = availableYears[0] || (league === 'wnba' ? 1997 : 2012)
  const maxYear = availableYears[availableYears.length - 1] || new Date().getFullYear()

  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear])

  // Read season from URL on mount
  useEffect(() => {
    const urlSeason = searchParams.get('season')
    if (urlSeason) {
      setSeason(urlSeason)
    }
  }, [searchParams])

  // Reset year range when component mounts with new league
  useEffect(() => {
    setYearRange([minYear, maxYear])
    setIsAllTime(true)
    setSelectedTeam(null)
  }, [league, minYear, maxYear])

  // Get season config for current league
  const seasonConfig = getSeasonConfig(league)

  // Detect current context
  const context = useMemo(() => {
    const isSingleYear = yearRange[0] === yearRange[1]
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
  }, [yearRange, selectedTeam, seasonConfig])

  // Helper to convert year to season key
  const yearToSeasonKey = (year: number): string => {
    if (league === 'wnba') {
      return year.toString()
    }
    // NBA uses YYYY-YY format
    const nextYear = (year + 1) % 100
    return `${year}-${nextYear.toString().padStart(2, '0')}`
  }

  // Get all games for the current view (filtered by year range)
  const allGames = useMemo(() => {
    const filteredSeasons = Object.keys(seasons)
      .filter(s => {
        const year = parseInt(s.split('-')[0]) || parseInt(s)
        return year >= yearRange[0] && year <= yearRange[1]
      })
      .sort()

    return filteredSeasons.flatMap(s => seasons[s].games)
  }, [yearRange, seasons])

  // Get ALL games (unfiltered) for accurate streak calculation across seasons
  const allGamesUnfiltered = useMemo(() => {
    return Object.keys(seasons)
      .sort()
      .flatMap(s => seasons[s].games)
  }, [seasons])

  // Track belt when data changes (filtered by year range)
  const { history, mergedByFranchise } = useMemo(() => {
    const filteredSeasons = Object.keys(seasons)
      .filter(s => {
        const year = parseInt(s.split('-')[0]) || parseInt(s)
        return year >= yearRange[0] && year <= yearRange[1]
      })
      .sort()

    if (filteredSeasons.length === 0) return { history: null, mergedByFranchise: false }

    const seasonsData = filteredSeasons.map(s => ({
      season: s,
      games: seasons[s].games
    }))

    // Merge by franchise logic:
    // - No team selected + All Time: merge by franchise (show current teams with full history)
    // - Current franchise selected + All Time: merge by franchise (show full franchise history)
    // - Historical team selected + All Time: don't merge (show only that team's era)
    const shouldMerge = isAllTime && (!selectedTeam || getCurrentFranchiseAbbr(selectedTeam, franchises) === selectedTeam)
    const history = trackAllSeasons(seasonsData, franchises, champions, { mergeByFranchise: shouldMerge })
    return { history, mergedByFranchise: shouldMerge }
  }, [yearRange, seasons, franchises, champions, isAllTime, selectedTeam])

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

  // Get all teams across all seasons (unfiltered) for the team selector
  // This ensures users can switch to any team regardless of current year filter
  // In All Time mode, dedupe by franchise (Utah Starzz -> Las Vegas Aces)
  const allTeamsAllYears = useMemo(() => {
    const teamSet = new Set<string>()
    Object.values(seasons).forEach(seasonData => {
      seasonData.games.forEach(game => {
        teamSet.add(game.homeTeam)
        teamSet.add(game.awayTeam)
      })
    })

    if (isAllTime) {
      // Dedupe by franchise - only keep current franchise abbreviation
      const franchiseSet = new Set<string>()
      teamSet.forEach(team => {
        franchiseSet.add(getCurrentFranchiseAbbr(team, franchises))
      })
      return Array.from(franchiseSet).sort()
    }

    return Array.from(teamSet).sort()
  }, [seasons, isAllTime, franchises])

  // Get available years for the selected team (if any)
  const availableYearsForTeam = useMemo(() => {
    if (!selectedTeam) return availableYears

    const teamYears = new Set<number>()

    // If selecting current franchise in All Time mode, find all historical team codes
    const currentFranchise = getCurrentFranchiseAbbr(selectedTeam, franchises)
    const isCurrentFranchise = currentFranchise === selectedTeam
    const franchiseCodes = isCurrentFranchise && isAllTime
      ? getAllFranchiseAbbrs(selectedTeam, franchises)
      : [selectedTeam]

    Object.keys(seasons).forEach(seasonKey => {
      const yearNum = parseInt(seasonKey.split('-')[0]) || parseInt(seasonKey)
      const games = seasons[seasonKey].games
      const teamPlayedThisYear = games.some(
        game => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
      )
      if (teamPlayedThisYear) {
        teamYears.add(yearNum)
      }
    })

    return Array.from(teamYears).sort((a, b) => a - b)
  }, [selectedTeam, seasons, availableYears, franchises, isAllTime])

  // Adjust year range when team is selected
  useEffect(() => {
    if (selectedTeam && availableYearsForTeam.length > 0) {
      const teamMin = availableYearsForTeam[0]
      const teamMax = availableYearsForTeam[availableYearsForTeam.length - 1]

      if (isAllTime) {
        setYearRange([teamMin, teamMax])
      } else {
        if (yearRange[0] > teamMax || yearRange[1] < teamMin) {
          setYearRange([teamMin, teamMax])
          setIsAllTime(true)
        } else if (yearRange[0] < teamMin || yearRange[1] > teamMax) {
          setYearRange([
            Math.max(yearRange[0], teamMin),
            Math.min(yearRange[1], teamMax)
          ])
        }
      }
    } else if (!selectedTeam && isAllTime) {
      setYearRange([minYear, maxYear])
    }
  }, [selectedTeam, availableYearsForTeam, isAllTime, minYear, maxYear])

  if (!history) {
    return (
      <div className="text-center py-20">
        <div className="scoreboard-panel p-8 max-w-md mx-auto">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
          <h1 className="text-3xl font-mono tracking-wider led-text mb-4" style={{ color: 'hsl(var(--led-amber))' }}>
            Data Not Yet Available
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-4">
            The {season} season data is still being added to the tracker.
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Select a different season from the dropdown above, or check back soon.
          </p>
        </div>
      </div>
    )
  }

  const currentHolderStats = history.summary.teams.find(
    t => t.team === history.summary.currentHolder
  )

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center gap-2">
        {/* League Switcher - Left */}
        <div className="flex items-center gap-2">
          <Link
            href="/wnba"
            className={`px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider border transition-all ${
              league === 'wnba'
                ? 'text-amber-500 border-amber-500 bg-amber-500/10'
                : 'text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground bg-card'
            }`}
          >
            WNBA
          </Link>
          <Link
            href="/nba"
            className={`px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider border transition-all ${
              league === 'nba'
                ? 'text-amber-500 border-amber-500 bg-amber-500/10'
                : 'text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground bg-card'
            }`}
          >
            NBA
          </Link>
        </div>

        {/* About & Theme - Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground bg-card transition-all"
          >
            About
          </Link>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Header */}
      <header data-card="header" className="scoreboard-panel panel-rivets p-4 sm:p-6 md:p-8 text-center space-y-2 sm:space-y-4 relative overflow-hidden">
        <div className="led-bar-top" />

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] uppercase led-text accent-line" style={{ color: 'hsl(var(--led-red))' }}>
          {league.toUpperCase()} BELT TRACKER
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-border" />
          <span className="text-xl sm:text-3xl md:text-4xl font-mono tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase led-text" style={{ color: 'hsl(var(--led-amber))' }}>
            REGULAR SEASON
          </span>
          <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-border" />
        </div>
        <p className="text-muted-foreground text-[0.65rem] sm:text-xs font-mono tracking-[0.1em] sm:tracking-[0.2em] uppercase pt-1 sm:pt-2">
          Lineal Championship Tracker
        </p>

        <div className="led-bar-bottom" />
      </header>

      {/* Filters */}
      <div data-card="filters" className="scoreboard-panel p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <SeasonPicker
            minYear={selectedTeam ? availableYearsForTeam[0] || minYear : minYear}
            maxYear={selectedTeam ? availableYearsForTeam[availableYearsForTeam.length - 1] || maxYear : maxYear}
            value={yearRange}
            onChange={setYearRange}
            isAllTime={isAllTime}
            onAllTimeChange={setIsAllTime}
            league={league}
          />

          <TeamSelector
            league={league}
            teams={isAllTime ? allTeamsAllYears : allTeams}
            franchises={franchises}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
            isAllTime={isAllTime}
          />
        </div>
      </div>

      {/* Stats */}
      {context !== 'TEAM' && (
        <RetroScoreboard
          totalGames={history.summary.totalGames}
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
            league={league}
          />
          {(context === 'THIS_YEAR' || context === 'OFF_SEASON') && (
            <NextGamePreview
              league={league}
              currentHolder={history.summary.currentHolder}
              games={allGames}
              franchises={franchises}
              champions={champions}
              allGamesUnfiltered={allGamesUnfiltered}
            />
          )}
        </div>
      )}

      {/* Last 5 Belt Changes - show in All Time or Current Year view */}
      {context !== 'TEAM' && (isAllTime || context === 'THIS_YEAR') && (
        <Last5BeltChanges
          league={league}
          history={history}
          franchises={franchises}
        />
      )}

      {/* Team Belt Card - show on TEAM context */}
      {context === 'TEAM' && selectedTeam && (() => {
        const teamStats = history.summary.teams.find(t => t.team === selectedTeam)
        const isCurrentHolder = history.summary.currentHolder === selectedTeam
        const isSingleYear = yearRange[0] === yearRange[1]
        const seasonKey = yearToSeasonKey(yearRange[0])
        const isSeasonChampion = isSingleYear && champions[seasonKey] === selectedTeam

        return (
          <TeamBeltCard
            team={selectedTeam}
            stats={teamStats}
            franchises={franchises}
            isCurrentHolder={isCurrentHolder}
            isSeasonChampion={isSeasonChampion}
            year={isSingleYear ? yearRange[0] : undefined}
            league={league}
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
          league={league}
        />
      )}

      {/* Visualizations Grid */}
      <div className={context === 'TEAM' ? "space-y-6" : ""}>
        {context === 'TEAM' && (
          <BeltCalendar history={history} franchises={franchises} selectedTeam={selectedTeam} allGames={allGames} league={league} />
        )}
        <BarChartView teams={history.summary.teams} franchises={franchises} allGames={allGames} selectedTeam={selectedTeam} league={league} isAllTime={mergedByFranchise} />
      </div>

      {/* Footer */}
      <footer data-card="footer" className="scoreboard-panel p-4 sm:p-6 md:p-8 text-center relative overflow-hidden">
        <div className="led-bar-top" />
        <div className="relative z-10">
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">
            Data updates nightly at 05:00 ET
          </p>
          <p className="text-[0.65rem] font-mono text-muted-foreground tracking-wider mb-2">
            {league.toUpperCase()} {isAllTime ? 'ALL-TIME' : yearRange[0] === yearRange[1] 
              ? (league === 'nba' ? `${yearRange[0]}-${String((yearRange[0] + 1) % 100).padStart(2, '0')}` : yearRange[0]) 
              : (league === 'nba' ? `${yearRange[0]}-${String((yearRange[1] + 1) % 100).padStart(2, '0')}` : `${yearRange[0]}-${yearRange[1]}`)} • {history.summary.teams.length} TEAMS
          </p>
          <p className="text-[0.65rem] font-mono text-muted-foreground tracking-wider">
            Created by Avid Squid LLC • <a href="https://buymeacoffee.com/bmortimer" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline decoration-1 underline-offset-2 transition-colors">DONATE</a> • <a href="https://forms.gle/LPBtZDxih1HQT53E9" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 underline decoration-1 underline-offset-2 transition-colors">FEEDBACK</a>
          </p>
        </div>
        <div className="led-bar-bottom" />

        {/* Corner rivets for retro hardware look */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-border opacity-50" />
      </footer>

      {/* Buy Me a Coffee */}
      <BuyMeCoffee />
    </div>
  )
}
