import type { FranchiseInfo } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'
import Image from 'next/image'

interface TeamLogoProps {
  teamCode: string
  franchises: FranchiseInfo[]
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

// Teams with logos available (SVG or PNG)
const TEAMS_WITH_LOGOS = new Set([
  // Current teams (SVG)
  'ATL', 'CHI', 'CON', 'DAL', 'GSV', 'IND',
  'LAS', 'LVA', 'MIN', 'NYL', 'PHO', 'SEA', 'WAS',
  // Historical teams (SVG)
  'CHA', 'MIA', 'ORL', 'POR', 'UTA',
  // Historical teams (PNG)
  'DET', 'SAS', 'TUL', 'CLE', 'HOU', 'SAC'
])

// Teams using PNG instead of SVG
const PNG_TEAMS = new Set([
  'DET', 'SAS', 'TUL', 'CLE', 'HOU', 'SAC'
])

export default function TeamLogo({ teamCode, franchises, size = 'md', className = '' }: TeamLogoProps) {
  const color = getTeamColor(teamCode, franchises)
  const hasLogo = TEAMS_WITH_LOGOS.has(teamCode)
  const isPng = PNG_TEAMS.has(teamCode)
  const fileExtension = isPng ? 'png' : 'svg'

  // If logo exists, render the image
  if (hasLogo) {
    return (
      <div
        className={`${sizeMap[size]} relative ${className}`}
        aria-label={`${teamCode} team logo`}
      >
        <Image
          src={`/logos/wnba/${teamCode}.${fileExtension}`}
          alt={`${teamCode} logo`}
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
      aria-label={`${teamCode} team logo`}
    >
      <span className="text-white drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
        {teamCode}
      </span>
    </div>
  )
}
