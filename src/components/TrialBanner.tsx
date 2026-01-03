'use client'

interface TrialBannerProps {
  timeRemaining: number
  onSignUp: () => void
}

export function TrialBanner({ timeRemaining, onSignUp }: TrialBannerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      </div>
      
      <div className="relative px-4 py-6 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Icon and urgency indicator */}
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white/20 rounded-full p-3 mr-3 animate-bounce">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="bg-red-500 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide animate-pulse">
              Limited Time
            </div>
          </div>
          
          {/* Main message */}
          <h3 className="text-xl font-bold mb-2">
            Your Free Trial Expires Soon!
          </h3>
          
          {/* Timer display */}
          <div className="bg-black/30 rounded-lg px-4 py-3 mb-4 inline-block">
            <div className="text-3xl font-mono font-bold tracking-wider">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm opacity-80">minutes remaining</div>
          </div>
          
          {/* Call to action */}
          <p className="text-sm opacity-90 mb-4">
            Don't lose access to your couple's journey. Sign up now to continue!
          </p>
          
          <button
            onClick={onSignUp}
            className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            🚀 Get Full Access Now
          </button>
        </div>
      </div>
      
      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500" />
    </div>
  )
}
