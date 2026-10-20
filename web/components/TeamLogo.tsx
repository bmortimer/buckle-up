import type { FranchiseInfo, League } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import Image from 'next/image'
import { memo } from 'react'
import logoManifest from '@/lib/logoManifest.json'

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

// WNBA SVG teams that need white background in dark mode
const WNBA_SVG_WHITE_BG = new Set([
  'TOR', // Toronto Tempo has dark colors
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

// PWHL PNG teams that need white background in dark mode
const PWHL_PNG_WHITE_BG = new Set([
  'SEA',
  'VAN', // Dark colored logos that need white background
])

// Logos that need a white circle behind them so they read on dark backgrounds.
// NBA and WNBA PNGs are all legacy/dark artwork, so every one gets it.
const WHITE_BG: Record<League, Set<string>> = {
  wnba: WNBA_SVG_WHITE_BG,
  nba: new Set(),
  nhl: NHL_PNG_WHITE_BG,
  pwhl: PWHL_PNG_WHITE_BG,
}
const WHITE_BG_ALL_PNG = new Set<League>(['nba', 'wnba'])

// White logos that need a team-colored circle in light mode (none currently;
// TOR/TBL switched to ESPN PNGs that handle this themselves)
const COLORED_BG: Record<League, Set<string>> = {
  wnba: new Set(),
  nba: new Set(),
  nhl: new Set(),
  pwhl: new Set(),
}

// PWHL artwork is edge-to-edge, so give large sizes some breathing room
const PAD_LARGE_LOGOS = new Set<League>(['pwhl'])

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

  const logoFormat = (logoManifest as Record<string, Record<string, 'svg' | 'png'>>)[league]?.[
    teamCode
  ]
  const hasLogo = logoFormat !== undefined
  const needsWhiteBg =
    WHITE_BG[league].has(teamCode) || (logoFormat === 'png' && WHITE_BG_ALL_PNG.has(league))
  const needsColoredBg = COLORED_BG[league].has(teamCode)
  const fileExtension = logoFormat

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
          className={`object-contain ${needsWhiteBg ? 'relative z-10 p-0.5' : ''} ${PAD_LARGE_LOGOS.has(league) && (size === 'lg' || size === 'xl') ? 'p-2' : ''}`}
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
