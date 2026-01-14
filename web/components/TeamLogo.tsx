import type { FranchiseInfo } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import Image from 'next/image'

interface TeamLogoProps {
  teamCode: string
  franchises: FranchiseInfo[]
  league?: 'nba' | 'wnba'
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
  'ATL', 'CHI', 'CON', 'DAL', 'GSV', 'IND',
  'LAS', 'LVA', 'MIN', 'NYL', 'PHO', 'SEA', 'WAS',
  // Historical teams (SVG)
  'CHA', 'MIA', 'ORL', 'POR', 'UTA',
  // Historical teams (PNG)
  'DET', 'SAS', 'TUL', 'CLE', 'HOU', 'SAC'
])

// WNBA teams using PNG instead of SVG
const WNBA_PNG_TEAMS = new Set([
  'DET', 'SAS', 'TUL', 'CLE', 'HOU', 'SAC'
])

// NBA teams - all 30 current teams have SVG logos
const NBA_TEAMS_WITH_LOGOS = new Set([
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET',
  'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN',
  'NOP', 'NYK', 'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS',
  'TOR', 'UTA', 'WAS',
  // Historical teams
  'SEA', 'NJN', 'VAN', 'NOH', 'CHH', 'WSB', 'NOJ', 'KCK', 'SDC', 'BUF', 'NYN'
])

export default function TeamLogo({ teamCode, franchises, league = 'wnba', size = 'md', className = '' }: TeamLogoProps) {
  const color = getTeamColor(teamCode, franchises)
  const franchise = franchises.find(f => f.teamAbbr === teamCode)
  const displayName = franchise?.displayName || teamCode

  const teamsWithLogos = league === 'nba' ? NBA_TEAMS_WITH_LOGOS : WNBA_TEAMS_WITH_LOGOS
  const pngTeams = league === 'nba' ? new Set<string>() : WNBA_PNG_TEAMS // NBA has all SVGs

  const hasLogo = teamsWithLogos.has(teamCode)
  const isPng = pngTeams.has(teamCode)
  const fileExtension = isPng ? 'png' : 'svg'

  // If logo exists, render the image
  if (hasLogo) {
    return (
      <div className={`${sizeMap[size]} relative ${className}`}>
        <Image
          src={`/logos/${league}/${teamCode}.${fileExtension}`}
          alt={`${displayName} logo`}
          fill
          className="object-contain"
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
      <span className="text-white drop-shadow-sm" aria-hidden="true" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
        {teamCode}
      </span>
    </div>
  )
}
