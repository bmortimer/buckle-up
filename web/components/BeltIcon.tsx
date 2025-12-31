interface BeltIconProps {
  teamColor?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

export default function BeltIcon({ teamColor = '#D4AF37', size = 'lg', className = '' }: BeltIconProps) {
  return (
    <div className={`${sizeMap[size]} ${className} relative`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* Belt strap */}
        <path
          d="M20 80 L60 80 L60 120 L20 120 Z"
          fill="#2C2C2C"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        <path
          d="M140 80 L180 80 L180 120 L140 120 Z"
          fill="#2C2C2C"
          stroke="#1a1a1a"
          strokeWidth="2"
        />

        {/* Main belt plate */}
        <ellipse
          cx="100"
          cy="100"
          rx="45"
          ry="40"
          fill="url(#beltGradient)"
          stroke="#8B7355"
          strokeWidth="3"
        />

        {/* Center team color accent */}
        <ellipse
          cx="100"
          cy="100"
          rx="30"
          ry="25"
          fill={teamColor}
          opacity="0.9"
        />

        {/* Inner detail ring */}
        <ellipse
          cx="100"
          cy="100"
          rx="20"
          ry="17"
          fill="none"
          stroke="url(#shineGradient)"
          strokeWidth="2"
        />

        {/* Studs/rivets */}
        <circle cx="100" cy="75" r="3" fill="#FFD700" />
        <circle cx="125" cy="100" r="3" fill="#FFD700" />
        <circle cx="100" cy="125" r="3" fill="#FFD700" />
        <circle cx="75" cy="100" r="3" fill="#FFD700" />

        {/* Gradients for metallic effect */}
        <defs>
          <linearGradient id="beltGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
          <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Shine effect overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-full"
        style={{
          animation: 'shine 3s ease-in-out infinite',
        }}
      />

      <style jsx>{`
        @keyframes shine {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
