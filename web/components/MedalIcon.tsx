interface MedalIconProps {
  rank: 1 | 2 | 3
  size?: 'sm' | 'md'
}

export default function MedalIcon({ rank, size = 'sm' }: MedalIconProps) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  const colors = {
    1: { fill: '#FFD700', shadow: 'rgba(255, 215, 0, 0.6)' },
    2: { fill: '#C0C0C0', shadow: 'rgba(192, 192, 192, 0.6)' },
    3: { fill: '#CD7F32', shadow: 'rgba(205, 127, 50, 0.6)' },
  }

  const { fill, shadow } = colors[rank]

  return (
    <div className={`${sizeClass} relative`} style={{ filter: `drop-shadow(0 2px 4px ${shadow})` }}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ribbon */}
        <path d="M8 2L10 8L12 2L14 8L16 2V10L12 12L8 10V2Z" fill={fill} opacity="0.7" />

        {/* Medal circle */}
        <circle cx="12" cy="16" r="6" fill={fill} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />

        {/* Inner circle */}
        <circle cx="12" cy="16" r="4.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

        {/* Rank number */}
        <text
          x="12"
          y="18"
          textAnchor="middle"
          fill="rgba(0,0,0,0.7)"
          fontSize="6"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {rank}
        </text>

        {/* Shine effect */}
        <circle cx="10" cy="14" r="1.5" fill="white" opacity="0.4" />
      </svg>
    </div>
  )
}
