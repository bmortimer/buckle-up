import type { FranchiseInfo, League } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import Image from 'next/image'
import { memo } from 'react'

interface TeamLogoProps {
  teamCode: string
  franchises: FranchiseInfo[]
  league?: League
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xxs: 'w-4 h-4 text-[6px]',
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-2xl',
}

// WNBA teams with logos available (SVG or PNG)
const WNBA_TEAMS_WITH_LOGOS = new Set([
  // Current teams (SVG)
  'ATL',
  'CHI',
  'CON',
  'DAL',
  'GSV',
  'IND',
  'LAS',
  'LVA',
  'MIN',
  'NYL',
  'PHO',
  'SEA',
  'WAS',
  'TOR',
  'PDX',
  // Historical teams (SVG)
  'CHA',
  'MIA',
  'ORL',
  'POR',
  'UTA',
  // Historical teams (PNG)
  'DET',
  'SAS',
  'TUL',
  'CLE',
  'HOU',
  'SAC',
])

// WNBA teams using PNG instead of SVG
const WNBA_PNG_TEAMS = new Set(['DET', 'SAS', 'TUL', 'CLE', 'HOU', 'SAC'])

// WNBA SVG teams that need white background in dark mode
const WNBA_SVG_WHITE_BG = new Set([
  'TOR', // Toronto Tempo has dark colors
])

// NBA teams - all 30 current teams have SVG logos
const NBA_TEAMS_WITH_LOGOS = new Set([
  'ATL',
  'BOS',
  'BKN',
  'CHA',
  'CHI',
  'CLE',
  'DAL',
  'DEN',
  'DET',
  'GSW',
  'HOU',
  'IND',
  'LAC',
  'LAL',
  'MEM',
  'MIA',
  'MIL',
  'MIN',
  'NOP',
  'NYK',
  'OKC',
  'ORL',
  'PHI',
  'PHX',
  'POR',
  'SAC',
  'SAS',
  'TOR',
  'UTA',
  'WAS',
  // Old abbreviations (pre-1996) - use current team logos
  'GOS',
  'PHL',
  'SAN',
  'UTH',
  // Historical teams with logos (SVG)
  'SEA',
  'VAN',
  'BUF',
  // Historical teams with logos (PNG)
  'CHH',
  'WSB',
  'NJN',
  'NOH',
  'NOJ',
  'SDC',
  'KCK',
  'NYN',
  'NOK',
])

// NBA teams that use PNG (need white background in dark mode)
const NBA_PNG_TEAMS = new Set(['CHH', 'WSB', 'NJN', 'NOH', 'NOJ', 'SDC', 'KCK', 'NYN', 'NOK'])

// NHL teams with logos available
const NHL_TEAMS_WITH_LOGOS = new Set([
  // Current teams (PNG from ESPN - square 500x500)
  'ANA',
  'BOS',
  'BUF',
  'CAR',
  'CBJ',
  'CGY',
  'CHI',
  'COL',
  'DAL',
  'DET',
  'EDM',
  'FLA',
  'LAK',
  'MIN',
  'MTL',
  'NJD',
  'NSH',
  'NYI',
  'NYR',
  'OTT',
  'PHI',
  'PIT',
  'SEA',
  'SJS',
  'STL',
  'TBL',
  'TOR',
  'UTA',
  'VAN',
  'VEG',
  'WPG',
  'WSH',
  // Historical teams available from ESPN (PNG)
  'ARI',
  'ATL',
  'PHX',
  // Historical teams with SVG
  'CBH',
  'WIN',
  // Historical teams with PNG (legacy)
  'AFM',
  'ATF',
  'CLE',
  'CLR',
  'HAR',
  'HFD',
  'KCS',
  'MDA',
  'MNS',
  'OAK',
  'QUE',
  'WPG1',
])

// NHL teams that use PNG
const NHL_PNG_TEAMS = new Set([
  // Current teams (ESPN square logos)
  'ANA',
  'BOS',
  'BUF',
  'CAR',
  'CBJ',
  'CGY',
  'CHI',
  'COL',
  'DAL',
  'DET',
  'EDM',
  'FLA',
  'LAK',
  'MIN',
  'MTL',
  'NJD',
  'NSH',
  'NYI',
  'NYR',
  'OTT',
  'PHI',
  'PIT',
  'SEA',
  'SJS',
  'STL',
  'TBL',
  'TOR',
  'UTA',
  'VAN',
  'VEG',
  'WPG',
  'WSH',
  // Historical teams (ESPN)
  'ARI',
  'ATL',
  'PHX',
  // Historical teams (legacy PNGs)
  'AFM',
  'ATF',
  'CLE',
  'CLR',
  'HFD',
  'HAR',
  'KCS',
  'MDA',
  'MNS',
  'OAK',
  'QUE',
  'WPG1',
])

// NHL PNG teams that need white background in dark mode
const NHL_PNG_WHITE_BG = new Set([
  // ESPN logos with dark colors that don't show on dark backgrounds
  'TBL',
  'TOR',
  'WSH',
  // Legacy PNGs with artifacts
  'AFM',
  'ATF',
  'CLE',
  'CLR',
  'HFD',
  'HAR',
  'KCS',
  'MDA',
  'MNS',
  'OAK',
  'QUE',
  'WPG1',
])

// NHL SVG teams with white logos that need colored background in light mode
// Note: TOR/TBL now use ESPN PNGs which handle this properly
const NHL_SVG_COLORED_BG = new Set<string>([])

// PWHL teams with logos available (all PNG from SportsLogos.Net)
const PWHL_TEAMS_WITH_LOGOS = new Set([
  // Inaugural teams (2024-25)
  'BOS',
  'MIN',
  'MTL',
  'NYS',
  'OTT',
  'TOR',
  // Expansion teams (2025-26)
  'SEA',
  'VAN',
])

// PWHL teams using PNG
const PWHL_PNG_TEAMS = new Set(['BOS', 'MIN', 'MTL', 'NYS', 'OTT', 'TOR', 'SEA', 'VAN'])

// PWHL PNG teams that need white background in dark mode
const PWHL_PNG_WHITE_BG = new Set([
  'SEA',
  'VAN', // Dark colored logos that need white background
])

const TeamLogo = memo(function TeamLogo({
  teamCode,
  franchises,
  league = 'wnba',
  size = 'md',
  className = '',
}: TeamLogoProps) {
  const color = getTeamColor(teamCode, franchises)
  const franchise = franchises.find((f) => f.teamAbbr === teamCode)
  const displayName = franchise?.displayName || teamCode

  const teamsWithLogos =
    league === 'nba'
      ? NBA_TEAMS_WITH_LOGOS
      : league === 'nhl'
        ? NHL_TEAMS_WITH_LOGOS
        : league === 'pwhl'
          ? PWHL_TEAMS_WITH_LOGOS
          : WNBA_TEAMS_WITH_LOGOS
  const pngTeams =
    league === 'nba'
      ? NBA_PNG_TEAMS
      : league === 'nhl'
        ? NHL_PNG_TEAMS
        : league === 'pwhl'
          ? PWHL_PNG_TEAMS
          : WNBA_PNG_TEAMS
  const svgWhiteBg = league === 'wnba' ? WNBA_SVG_WHITE_BG : new Set<string>()
  const svgColoredBg = league === 'nhl' ? NHL_SVG_COLORED_BG : new Set<string>()
  const pngWhiteBg =
    league === 'nba'
      ? NBA_PNG_TEAMS
      : league === 'nhl'
        ? NHL_PNG_WHITE_BG
        : league === 'pwhl'
          ? PWHL_PNG_WHITE_BG
          : WNBA_PNG_TEAMS

  const hasLogo = teamsWithLogos.has(teamCode)
  const isPng = pngTeams.has(teamCode)
  const needsWhiteBg = pngWhiteBg.has(teamCode) || svgWhiteBg.has(teamCode)
  const needsColoredBg = svgColoredBg.has(teamCode)
  const fileExtension = isPng ? 'png' : 'svg'

  // If logo exists, render the image
  if (hasLogo) {
    // Teams with white logos need colored background in light mode
    if (needsColoredBg) {
      return (
        <div
          className={`${sizeMap[size]} relative rounded-full overflow-hidden ${className}`}
          style={{ backgroundColor: color }}
        >
          <Image
            src={`/logos/${league}/${teamCode}.${fileExtension}`}
            alt={`${displayName} logo`}
            fill
            className="object-contain p-1"
            unoptimized
          />
        </div>
      )
    }

    return (
      <div
        className={`${sizeMap[size]} relative ${needsWhiteBg ? 'rounded-full overflow-hidden' : ''} ${className}`}
      >
        {/* Add white background circle for logos that need it in dark mode */}
        {needsWhiteBg && <div className="absolute inset-0 bg-white dark:bg-white" />}
        <Image
          src={`/logos/${league}/${teamCode}.${fileExtension}`}
          alt={`${displayName} logo`}
          fill
          className={`object-contain ${needsWhiteBg ? 'relative z-10 p-0.5' : ''} ${league === 'pwhl' && (size === 'lg' || size === 'xl') ? 'p-2' : ''}`}
          unoptimized // SVGs and small PNGs don't need optimization
        />
      </div>
    )
  }

  // Fallback to colored circle with team code
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold ring-2 ring-offset-2 ring-offset-background ${className}`}
      style={{
        backgroundColor: color,
        ['--tw-ring-color' as any]: color,
      }}
      role="img"
      aria-label={`${displayName} logo`}
    >
      <span
        className="text-white drop-shadow-sm"
        aria-hidden="true"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        {teamCode}
      </span>
    </div>
  )
})

export default TeamLogo
