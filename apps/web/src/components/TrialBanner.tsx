'use client'

interface TrialBannerProps {
  daysRemaining: number
  onUpgrade: () => void
}

export function TrialBanner({ daysRemaining, onUpgrade }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 3

  return (
    <div className={`relative overflow-hidden ${isUrgent ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400' : 'bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500'}`}>
      {/* shimmer */}
      <div className="absolute inset-0 bg-shimmer animate-shimmer opacity-30" />

      <div className="relative max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0">{isUrgent ? '⚡' : '✨'}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">
              {daysRemaining === 0
                ? 'Your free trial has ended'
                : daysRemaining === 1
                ? 'Last day of your free trial!'
                : `${daysRemaining} days left in your free trial`}
            </span>
            <span className="hidden sm:inline text-white/70 text-xs">
              — Upgrade to keep all features unlocked
            </span>
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md
            ${isUrgent
              ? 'bg-white text-rose-600 hover:bg-rose-50'
              : 'bg-white text-violet-700 hover:bg-violet-50'
            }`}
        >
          Upgrade Now →
        </button>
      </div>
    </div>
  )
}
