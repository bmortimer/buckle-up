'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { SeasonData, FranchiseInfo, League } from '@/lib/types'
import { trackAllSeasons } from '@/lib/beltTracker'
import {
  getCurrentFranchiseAbbr,
  getAllFranchiseAbbrs,
  getTeamCodeForYear,
  dedupeByFranchise,
} from '@/lib/franchises'
import { getSeasonConfig } from '@/lib/seasonConfig'
import BeltHolderCard from './BeltHolderCard'
import TeamBeltCard from './TeamBeltCard'
import BarChartView from './BarChartView'
import BeltCalendar from './BeltCalendar'
import DetailedCalendar from './DetailedCalendar'
import RetroScoreboard from './RetroScoreboard'
import NextGamePreview from './NextGamePreview'
import Last5BeltChanges from './Last5BeltChanges'
import SeasonChampions from './SeasonChampions'
import SeasonPicker from './SeasonPicker'
import TeamSelector from './TeamSelector'
import { ThemeSwitcher } from './ThemeSwitcher'
import BuyMeCoffee from './BuyMeCoffee'
import CornerRivets from './CornerRivets'
import Link from 'next/link'

interface BeltDashboardProps {
  league: League
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
  const router = useRouter()
  const pathname = usePathname()

  // Get season config for current league
  const seasonConfig = getSeasonConfig(league)

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Track whether we're updating team due to historical year selection
  const isHistoricalTeamUpdate = useRef(false)

  // Get available years for range slider
  const availableYears = useMemo(() => {
    // For NBA/NHL, parse the season format (e.g., "2023-24" -> 2023)
    return Object.keys(seasons)
      .map((s) => {
        const year = parseInt(s)
        return isNaN(year) ? parseInt(s.split('-')[0]) : year
      })
      .sort((a, b) => a - b)
  }, [seasons])

  const minYear = availableYears[0] || (league === 'wnba' ? 1997 : 2012)
  const maxYear = availableYears[availableYears.length - 1] || new Date().getFullYear()

  // Default to current year if in season, All Time if off-season
  const defaultYearRange: [number, number] = useMemo(
    () =>
      seasonConfig.isInSeason
        ? [seasonConfig.currentYear, seasonConfig.currentYear]
        : [minYear, maxYear],
    [seasonConfig, minYear, maxYear]
  )
  const defaultIsAllTime = !seasonConfig.isInSeason

  const [yearRange, setYearRange] = useState<[number, number]>(defaultYearRange)
  const [isAllTime, setIsAllTime] = useState(defaultIsAllTime)

  // Helper to convert a year number to a season key for the URL
  const yearToSeasonParam = useCallback(
    (year: number): string => {
      if (league === 'wnba') return year.toString()
      const nextYear = (year + 1) % 100
      return `${year}-${nextYear.toString().padStart(2, '0')}`
    },
    [league]
  )

  // Helper to parse a season param from URL into a year number
  const seasonParamToYear = (param: string): number | null => {
    const year = parseInt(param.split('-')[0])
    return isNaN(year) ? null : year
  }

  // Suppress URL sync when we're applying URL → state
  const isSyncingFromUrl = useRef(false)

  // Apply URL params to state (runs on searchParams changes, including back/forward)
  useEffect(() => {
    const urlSeason = searchParams.get('season')
    const urlTeam = searchParams.get('team')

    // Derive what state the URL implies
    let urlYearRange: [number, number]
    let urlIsAllTime: boolean

    if (urlSeason) {
      const year = seasonParamToYear(urlSeason)
      if (year !== null && year >= minYear && year <= maxYear) {
        urlYearRange = [year, year]
        urlIsAllTime = false
      } else {
        // Invalid season param — use defaults
        urlYearRange = defaultYearRange
        urlIsAllTime = defaultIsAllTime
      }
    } else {
      urlYearRange = defaultYearRange
      urlIsAllTime = defaultIsAllTime
    }

    isSyncingFromUrl.current = true
    setYearRange(urlYearRange)
    setIsAllTime(urlIsAllTime)
    setSelectedTeam(urlTeam)
  }, [searchParams, minYear, maxYear, defaultYearRange, defaultIsAllTime])

  // Sync state → URL query params
  useEffect(() => {
    // Don't sync back to URL if we're applying URL → state
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false
      return
    }

    const params = new URLSearchParams()
    const isSingleYear = yearRange[0] === yearRange[1]

    if (!isAllTime && isSingleYear) {
      params.set('season', yearToSeasonParam(yearRange[0]))
    }

    if (selectedTeam) {
      params.set('team', selectedTeam)
    }

    const paramString = params.toString()
    const newUrl = paramString ? `${pathname}?${paramString}` : pathname
    const currentUrl = `${pathname}${window.location.search}`

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false })
    }
  }, [yearRange, isAllTime, selectedTeam, pathname, router, yearToSeasonParam])

  // Detect current context
  const context = useMemo(() => {
    const isSingleYear = yearRange[0] === yearRange[1]
    const selectedYear = yearRange[0]

    if (selectedTeam) {
      return 'TEAM' as const
    } else if (isSingleYear && selectedYear < seasonConfig.currentYear) {
      return 'PAST_YEAR' as const
    } else if (
      isSingleYear &&
      selectedYear === seasonConfig.currentYear &&
      seasonConfig.isInSeason
    ) {
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
    // NBA/NHL uses YYYY-YY format
    const nextYear = (year + 1) % 100
    return `${year}-${nextYear.toString().padStart(2, '0')}`
  }

  // Get all games for the current view (filtered by year range)
  const allGames = useMemo(() => {
    const filteredSeasons = Object.keys(seasons)
      .filter((s) => {
        const year = parseInt(s.split('-')[0]) || parseInt(s)
        return year >= yearRange[0] && year <= yearRange[1]
      })
      .sort()

    return filteredSeasons.flatMap((s) => seasons[s].games)
  }, [yearRange, seasons])

  // Get ALL games (unfiltered) for accurate streak calculation across seasons
  const allGamesUnfiltered = useMemo(() => {
    return Object.keys(seasons)
      .sort()
      .flatMap((s) => seasons[s].games)
  }, [seasons])

  // Track belt when data changes (filtered by year range)
  const { history, mergedByFranchise } = useMemo(() => {
    const filteredSeasons = Object.keys(seasons)
      .filter((s) => {
        const year = parseInt(s.split('-')[0]) || parseInt(s)
        return year >= yearRange[0] && year <= yearRange[1]
      })
      .sort()

    if (filteredSeasons.length === 0) return { history: null, mergedByFranchise: false }

    const seasonsData = filteredSeasons.map((s) => ({
      season: s,
      games: seasons[s].games,
    }))

    // Merge by franchise logic:
    // - No team selected + All Time: merge by franchise (show current teams with full history)
    // - Current franchise selected + All Time: merge by franchise (show full franchise history)
    // - Historical team selected + All Time: don't merge (show only that team's era)
    const shouldMerge =
      isAllTime &&
      (!selectedTeam || getCurrentFranchiseAbbr(selectedTeam, franchises) === selectedTeam)
    const history = trackAllSeasons(seasonsData, franchises, champions, {
      mergeByFranchise: shouldMerge,
    })
    return { history, mergedByFranchise: shouldMerge }
  }, [yearRange, seasons, franchises, champions, isAllTime, selectedTeam])

  // Get all teams that appear in the selected year range
  const allTeams = useMemo(() => {
    if (!history) return []
    const teamSet = new Set<string>()
    allGames.forEach((game) => {
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
    Object.values(seasons).forEach((seasonData) => {
      seasonData.games.forEach((game) => {
        teamSet.add(game.homeTeam)
        teamSet.add(game.awayTeam)
      })
    })

    if (isAllTime) {
      return dedupeByFranchise(teamSet, franchises)
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
    const franchiseCodes =
      isCurrentFranchise && isAllTime
        ? getAllFranchiseAbbrs(selectedTeam, franchises)
        : [selectedTeam]

    Object.keys(seasons).forEach((seasonKey) => {
      const yearNum = parseInt(seasonKey.split('-')[0]) || parseInt(seasonKey)
      const games = seasons[seasonKey].games
      const teamPlayedThisYear = games.some(
        (game) => franchiseCodes.includes(game.homeTeam) || franchiseCodes.includes(game.awayTeam)
      )
      if (teamPlayedThisYear) {
        teamYears.add(yearNum)
      }
    })

    return Array.from(teamYears).sort((a, b) => a - b)
  }, [selectedTeam, seasons, availableYears, franchises, isAllTime])

  // Update selected team to historical code when year changes
  useEffect(() => {
    // Only update if:
    // 1. A team is selected
    // 2. Not in All Time mode (specific year selected)
    // 3. It's a single year selection
    if (selectedTeam && !isAllTime && yearRange[0] === yearRange[1]) {
      const year = yearRange[0]
      const correctTeamCode = getTeamCodeForYear(selectedTeam, year, franchises)

      // Only update if the team code actually needs to change
      if (correctTeamCode !== selectedTeam) {
        isHistoricalTeamUpdate.current = true
        setSelectedTeam(correctTeamCode)
      }
    }
  }, [yearRange, selectedTeam, isAllTime, franchises])

  // Adjust year range when team is selected
  useEffect(() => {
    // Skip year range adjustment if this team change was due to historical year selection
    if (isHistoricalTeamUpdate.current) {
      isHistoricalTeamUpdate.current = false
      return
    }

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
          setYearRange([Math.max(yearRange[0], teamMin), Math.min(yearRange[1], teamMax)])
        }
      }
    } else if (!selectedTeam && isAllTime) {
      setYearRange([minYear, maxYear])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, availableYearsForTeam, isAllTime, minYear, maxYear])

  if (!history) {
    // Check if this is the NHL 2004-05 lockout season
    const isNHL200405Lockout = league === 'nhl' && yearRange[0] === 2004 && yearRange[1] === 2004

    // Find previous and next years (logically, not just from available data)
    const currentYear = yearRange[0]
    // For missing data, show the immediately adjacent years, not the closest available data
    const previousYear = currentYear - 1 >= minYear ? currentYear - 1 : null
    const nextYear = currentYear + 1 <= maxYear ? currentYear + 1 : null

    return (
      <div className="text-center py-20">
        <div className="scoreboard-panel p-8 max-w-md mx-auto relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

          <h1
            className="text-3xl font-mono tracking-wider led-text mb-4"
            style={{ color: 'hsl(var(--led-amber))' }}
          >
            {isNHL200405Lockout ? 'Season Cancelled' : 'Data Not Yet Available'}
          </h1>

          {isNHL200405Lockout ? (
            <>
              <p className="text-sm text-muted-foreground font-body mb-2">
                The entire 2004-05 NHL season was cancelled due to a labor dispute.
              </p>
              <p className="text-xs text-muted-foreground font-body mb-6">
                This was the first time since 1919 that the Stanley Cup was not awarded.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground font-body mb-6">
              The{' '}
              {league === 'wnba'
                ? yearRange[0]
                : `${yearRange[0]}-${String((yearRange[0] + 1) % 100).padStart(2, '0')}`}{' '}
              season data is still being added to the tracker.
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-center">
            {previousYear && (
              <button
                onClick={() => {
                  setYearRange([previousYear, previousYear])
                  setIsAllTime(false)
                }}
                className="px-4 py-2 text-sm font-mono uppercase tracking-wider text-foreground hover:text-amber-500 border border-border hover:border-amber-500 bg-card transition-all"
              >
                ←{' '}
                {league === 'wnba'
                  ? previousYear
                  : `${previousYear}-${String((previousYear + 1) % 100).padStart(2, '0')}`}
              </button>
            )}
            {nextYear && (
              <button
                onClick={() => {
                  setYearRange([nextYear, nextYear])
                  setIsAllTime(false)
                }}
                className="px-4 py-2 text-sm font-mono uppercase tracking-wider text-foreground hover:text-amber-500 border border-border hover:border-amber-500 bg-card transition-all"
              >
                {league === 'wnba'
                  ? nextYear
                  : `${nextYear}-${String((nextYear + 1) % 100).padStart(2, '0')}`}{' '}
                →
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground font-body mt-6">
            Or select a different season from the filters above
          </p>
        </div>
      </div>
    )
  }

  const currentHolderStats = history.summary.teams.find(
    (t) => t.team === history.summary.currentHolder
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
          <Link
            href="/nhl"
            className={`px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider border transition-all ${
              league === 'nhl'
                ? 'text-amber-500 border-amber-500 bg-amber-500/10'
                : 'text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground bg-card'
            }`}
          >
            NHL
          </Link>
          <Link
            href="/pwhl"
            className={`px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider border transition-all ${
              league === 'pwhl'
                ? 'text-amber-500 border-amber-500 bg-amber-500/10'
                : 'text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground bg-card'
            }`}
          >
            PWHL
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
      <header
        data-card="header"
        className="scoreboard-panel panel-rivets p-4 sm:p-6 md:p-8 text-center space-y-2 sm:space-y-4 relative overflow-hidden"
      >
        <div className="led-bar-top" />

        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] uppercase led-text accent-line"
          style={{ color: 'hsl(var(--led-red))' }}
        >
          {league.toUpperCase()} BELT TRACKER
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-border" />
          <span
            className="text-xl sm:text-3xl md:text-4xl font-mono tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase led-text"
            style={{ color: 'hsl(var(--led-amber))' }}
          >
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
            maxYear={
              selectedTeam
                ? availableYearsForTeam[availableYearsForTeam.length - 1] || maxYear
                : maxYear
            }
            value={yearRange}
            onChange={setYearRange}
            isAllTime={isAllTime}
            onAllTimeChange={setIsAllTime}
            league={league}
            availableYears={selectedTeam ? availableYearsForTeam : undefined}
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
        <div
          className={
            context === 'THIS_YEAR' || context === 'OFF_SEASON'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'
              : ''
          }
        >
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
        <Last5BeltChanges league={league} history={history} franchises={franchises} />
      )}

      {/* Season Champions - show in All Time view only */}
      {context !== 'TEAM' && isAllTime && (
        <SeasonChampions
          league={league}
          seasons={seasons}
          franchises={franchises}
          champions={champions}
          yearRange={yearRange}
        />
      )}

      {/* Team Belt Card - show on TEAM context */}
      {context === 'TEAM' &&
        selectedTeam &&
        (() => {
          const teamStats = history.summary.teams.find((t) => t.team === selectedTeam)
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
      <div className={context === 'TEAM' ? 'space-y-6' : ''}>
        {context === 'TEAM' && (
          <BeltCalendar
            history={history}
            franchises={franchises}
            selectedTeam={selectedTeam}
            allGames={allGames}
            league={league}
          />
        )}
        <BarChartView
          teams={history.summary.teams}
          franchises={franchises}
          allGames={allGames}
          selectedTeam={selectedTeam}
          league={league}
          isAllTime={mergedByFranchise}
        />
      </div>

      {/* Footer */}
      <footer
        data-card="footer"
        className="scoreboard-panel p-4 sm:p-6 md:p-8 text-center relative overflow-hidden"
      >
        <div className="led-bar-top" />
        <div className="relative z-10">
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">
            Data updates nightly ~3:30 AM Pacific (winter) / 4:30 AM (summer)
          </p>
          <p className="text-[0.65rem] font-mono text-muted-foreground tracking-wider mb-2">
            {league.toUpperCase()}{' '}
            {isAllTime
              ? 'ALL-TIME'
              : yearRange[0] === yearRange[1]
                ? league === 'nba' || league === 'nhl' || league === 'pwhl'
                  ? `${yearRange[0]}-${String((yearRange[0] + 1) % 100).padStart(2, '0')}`
                  : yearRange[0]
                : league === 'nba' || league === 'nhl' || league === 'pwhl'
                  ? `${yearRange[0]}-${String((yearRange[1] + 1) % 100).padStart(2, '0')}`
                  : `${yearRange[0]}-${yearRange[1]}`}
          </p>
          <p className="text-[0.65rem] font-mono text-muted-foreground tracking-wider">
            Created by Avid Squid LLC •{' '}
            <a
              href="https://buymeacoffee.com/bmortimer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 underline decoration-1 underline-offset-2 transition-colors"
            >
              DONATE
            </a>{' '}
            •{' '}
            <a
              href="https://forms.gle/LPBtZDxih1HQT53E9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 underline decoration-1 underline-offset-2 transition-colors"
            >
              FEEDBACK
            </a>
          </p>
        </div>
        <div className="led-bar-bottom" />

        {/* Corner rivets for retro hardware look */}
        <CornerRivets />
      </footer>

      {/* Buy Me a Coffee */}
      <BuyMeCoffee />
    </div>
  )
}
