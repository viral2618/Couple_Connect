'use client'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export default function Logo({ size = 36, showText = true, className = '' }: LogoProps) {
  const id = 'lg'
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* ── Icon Mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main rose→violet gradient */}
          <linearGradient id={`${id}g1`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="55%" stopColor="#e879a0" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Lighter fill gradient for inner shapes */}
          <linearGradient id={`${id}g2`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#d8b4fe" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`${id}glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft shadow */}
          <filter id={`${id}shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.25" />
          </filter>

          {/* Clip for the icon boundary */}
          <clipPath id={`${id}clip`}>
            <rect x="0" y="0" width="56" height="56" rx="14" />
          </clipPath>
        </defs>

        {/* ── Background pill with gradient ── */}
        <rect x="0" y="0" width="56" height="56" rx="14" fill={`url(#${id}g1)`} />

        {/* Subtle inner highlight top */}
        <rect x="0" y="0" width="56" height="28" rx="14" fill="white" fillOpacity="0.08" />

        {/* ── Two overlapping hearts forming a "connected" mark ── */}
        {/* Left heart (slightly smaller, white semi-transparent) */}
        <g filter={`url(#${id}shadow)`} clipPath={`url(#${id}clip)`}>
          {/* Left person / teardrop arc */}
          <path
            d="M20 34 C20 34 11 28.5 11 22a7 7 0 0114 0c0 2.5-1.2 4.8-3 6.4L20 34z"
            fill="white"
            fillOpacity="0.28"
          />
          {/* Right person / teardrop arc */}
          <path
            d="M36 34 C36 34 45 28.5 45 22a7 7 0 00-14 0c0 2.5 1.2 4.8 3 6.4L36 34z"
            fill="white"
            fillOpacity="0.28"
          />

          {/* Central heart — the "connection" */}
          <path
            d="M28 38
               C27.6 37.7 16 30.2 16 23.5
               a8 8 0 0112-6.93
               A8 8 0 0140 23.5
               C40 30.2 28.4 37.7 28 38z"
            fill="white"
            filter={`url(#${id}glow)`}
          />

          {/* Tiny inner heart shine */}
          <path
            d="M28 26.5 C27.85 26.38 24 23.9 24 21.8a3 3 0 016 0C30 23.9 28.15 26.38 28 26.5z"
            fill={`url(#${id}g1)`}
            fillOpacity="0.55"
          />
        </g>

        {/* Bottom shine line */}
        <rect x="10" y="48" width="36" height="3" rx="1.5" fill="white" fillOpacity="0.12" />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 1 }}>
          {/* "Couple" — bold, gradient */}
          <span
            style={{
              fontWeight: 800,
              fontSize: size * 0.46,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
            }}
          >
            Couple
          </span>
          {/* "Connect" — light, spaced */}
          <span
            style={{
              fontWeight: 600,
              fontSize: size * 0.27,
              letterSpacing: '0.18em',
              color: '#c084fc',
              textTransform: 'uppercase' as const,
              lineHeight: 1.2,
              paddingLeft: 1,
            }}
          >
            Connect
          </span>
        </div>
      )}
    </div>
  )
}
