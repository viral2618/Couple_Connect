'use client'

interface TrialBannerProps {
  timeRemaining: number
  onSignUp: () => void
}

export function TrialBanner({ timeRemaining, onSignUp }: TrialBannerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50" />
      
      <div className="relative px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left side - Timer and message */}
          <div className="flex items-center space-x-6">
            {/* Professional timer display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div className="text-lg font-mono font-semibold tracking-wide">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-xs opacity-80 text-center">Trial Time</div>
            </div>
            
            {/* Message */}
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Free Trial Active
              </h3>
              <p className="text-sm opacity-90">
                Enjoying Couple Connect? Upgrade to continue your journey together.
              </p>
            </div>
          </div>
          
          {/* Right side - CTA */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">Unlimited Access</div>
              <div className="text-xs opacity-80">All features • No limits</div>
            </div>
            <button
              onClick={onSignUp}
              className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
            >
              <span>Upgrade Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  )
}
