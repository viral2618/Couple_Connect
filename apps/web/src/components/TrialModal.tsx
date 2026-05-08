'use client'

interface TrialModalProps {
  isOpen: boolean
  onClose?: () => void
}

export function TrialModal({ isOpen, onClose }: TrialModalProps) {
  if (!isOpen) return null

  const plans = [
    {
      name: 'Monthly',
      price: '$9.99',
      period: '/mo',
      highlight: false,
    },
    {
      name: 'Yearly',
      price: '$4.99',
      period: '/mo',
      badge: 'Best Value',
      sub: 'billed $59.99/yr',
      highlight: true,
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-violet-600 px-8 pt-8 pb-10 text-center relative">
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl">💎</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <h2 className="text-2xl font-extrabold text-white mb-1">Upgrade to Premium</h2>
          <p className="text-pink-100 text-sm">Keep your connection alive — no limits, forever.</p>
        </div>

        <div className="px-8 pt-10 pb-8">
          {/* Features */}
          <ul className="space-y-2 mb-7">
            {['Unlimited messaging', 'HD video calls', 'All couple games', 'Photo sharing & memories', 'Priority support'].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Plans */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.name}
                className={`relative rounded-2xl border-2 p-4 text-center transition-all hover:scale-[1.02] active:scale-[0.98]
                  ${plan.highlight
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <p className={`text-xs font-semibold mb-1 ${plan.highlight ? 'text-violet-600' : 'text-gray-500'}`}>{plan.name}</p>
                <p className={`text-2xl font-extrabold ${plan.highlight ? 'text-violet-700' : 'text-gray-800'}`}>
                  {plan.price}<span className="text-sm font-medium">{plan.period}</span>
                </p>
                {plan.sub && <p className="text-[10px] text-gray-400 mt-0.5">{plan.sub}</p>}
              </button>
            ))}
          </div>

          <button className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-pink-200 active:scale-[0.98]">
            Start Premium Today
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Cancel anytime · Secure payment</p>
        </div>
      </div>
    </div>
  )
}
