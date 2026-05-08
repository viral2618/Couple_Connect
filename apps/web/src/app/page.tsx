'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) {
          router.replace('/home')
        } else {
          setAuthChecked(true)
        }
      })
      .catch(() => setAuthChecked(true))
  }, [])

  const startTrial = async () => {
    try {
      const fingerprint = await import('@/lib/fingerprint').then(m => m.generateFingerprint())
      const response = await fetch('/api/trial/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint })
      })
      const data = await response.json()
      if (data.trialExhausted) {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Trial check error:', error)
    }
    sessionStorage.setItem('freshTrialStart', 'true')
    router.push('/home')
  }

  const features = [
    {
      icon: '💬',
      title: 'Real-time Chat',
      desc: 'Instant messages with read receipts and typing indicators',
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
    },
    {
      icon: '📹',
      title: 'HD Video Calls',
      desc: 'Crystal clear video calls with end-to-end encryption',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      premium: true,
    },
    {
      icon: '🎮',
      title: 'Couple Games',
      desc: 'Fun and intimate games designed to strengthen your bond',
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50',
      link: '/couples-game',
    },
    {
      icon: '📸',
      title: 'Photo Sharing',
      desc: 'Share precious moments with secure private albums',
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
    },
    {
      icon: '💝',
      title: 'Love Notes',
      desc: 'Send sweet surprise messages and schedule future deliveries',
      gradient: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50',
    },
    {
      icon: '📅',
      title: 'Shared Calendar',
      desc: 'Plan dates, anniversaries, and special moments together',
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Happy Couples' },
    { value: '99.9%', label: 'Uptime' },
    { value: '180+', label: 'Countries' },
    { value: '4.9★', label: 'Rating' },
  ]

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 40%, #f0f4ff 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-lg animate-pulse">
            💕
          </div>
          <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 40%, #f0f4ff 100%)' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-pink-100/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-sm shadow-sm">
              💕
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Couple Connect</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Sign In
            </button>
            <button
              onClick={startTrial}
              className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-pink-200"
            >
              Try Free ✨
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-pink-200 text-pink-600 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
            No credit card required · 14-day free trial
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Stay close,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500">
              no matter the distance
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Chat, video call, play games, and share moments with your partner —
            all in one private space built for couples.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={startTrial}
              className="group relative bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-base shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5"
            >
              Try Free for 14 Days
              <span className="ml-2">→</span>
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all text-base shadow-sm hover:-translate-y-0.5"
            >
              Sign In / Sign Up
            </button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-gray-100">🔒 End-to-End Encrypted</span>
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-gray-100">⚡ Instant Setup</span>
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-gray-100">💕 10,000+ Happy Couples</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Everything you need to stay connected
            </h2>
            <p className="text-gray-500 text-lg">Built for couples who want more than just messaging</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                onClick={() => feature.link && router.push(feature.link)}
                className={`group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden ${
                  feature.link ? 'cursor-pointer' : ''
                }`}
              >
                {/* subtle gradient accent top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl`} />

                {feature.premium && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </div>
                )}

                <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>

                {feature.link && (
                  <div className={`mt-4 text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient} flex items-center gap-1`}>
                    Explore <span>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Get started in seconds</h2>
            <p className="text-gray-500 text-lg">No downloads, no setup — just connect</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create your space', desc: 'Sign up in under a minute with just your email', icon: '✉️' },
              { step: '02', title: 'Invite your partner', desc: 'Send a private invite link to your significant other', icon: '💌' },
              { step: '03', title: 'Start connecting', desc: 'Chat, call, play games and share moments instantly', icon: '🚀' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold text-pink-400 mb-2 tracking-widest">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-violet-600 rounded-3xl p-12 sm:p-16 text-center text-white overflow-hidden">
          {/* decorative blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="text-4xl mb-4">💕</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Ready to connect hearts?</h2>
            <p className="text-pink-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Join thousands of couples who've found their perfect connection.
              Try all features free — no strings attached.
            </p>
            <button
              onClick={startTrial}
              className="bg-white text-pink-600 font-bold px-10 py-4 rounded-2xl hover:bg-pink-50 transition-colors text-base shadow-xl hover:-translate-y-0.5 transition-transform"
            >
              Start Your Love Journey ✨
            </button>
            <p className="mt-5 text-pink-200 text-sm">Instant access · No downloads · Works on all devices</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100/60 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
          Made with 💕 for long-distance couples worldwide
        </div>
      </footer>
    </div>
  )
}
