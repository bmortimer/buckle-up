import type { FranchiseInfo } from '@/lib/types'
import { getTeamColor } from '@/lib/franchises'

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

export default function TeamLogo({ teamCode, franchises, size = 'md', className = '' }: TeamLogoProps) {
  const color = getTeamColor(teamCode, franchises)

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
