'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTrialStatus } from '@/hooks/useTrialTimer'
import { TrialModal } from '@/components/TrialModal'
import { TrialBanner } from '@/components/TrialBanner'
import Logo from '@/components/Logo'
import UserAvatar from '@/components/UserAvatar'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { user: authUser, loading } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { isOnTrial, isExpired: isTrialExpired, daysRemaining } = useTrialStatus()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isPremium = authUser?.isPremium || authUser?.trial?.isActive || false

  if (loading) {
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

  const quickActions = [
    {
      title: 'Start Chatting',
      desc: 'Connect with your partner instantly',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: '/chat', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', color: 'text-violet-600', premium: false
    },
    {
      title: 'Video Call',
      desc: 'See each other face to face',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      ),
      href: '/video-call', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', color: 'text-blue-600', premium: true
    },
    {
      title: 'Play Games',
      desc: 'Intimate games for couples',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      href: '/games', gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', color: 'text-pink-600', premium: false
    },
    {
      title: 'Share Photos',
      desc: 'Create beautiful memories together',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/photos', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', color: 'text-amber-600', premium: false
    },
  ]

  const dropdownItems = [
    {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      text: 'Edit Profile', href: '/profile'
    },
    {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      text: 'Settings', href: '/settings'
    },
    {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      text: 'Partner Info', href: '/partner'
    },
    {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      text: 'Notifications', href: '/notifications'
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 40%, #f0f4ff 100%)' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-pink-100/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size={36} />

          <div className="flex items-center gap-3">
            {authUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <UserAvatar name={authUser.name} avatar={authUser.avatar} size={28} />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">{authUser.name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                      <UserAvatar name={authUser.name} avatar={authUser.avatar} size={36} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{authUser.name}</p>
                        <p className="text-xs text-gray-500">{authUser.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      {dropdownItems.map((item, i) => (
                        <a
                          key={i}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-400">{item.icon}</span>
                          <span>{item.text}</span>
                        </a>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-pink-200"
              >
                Sign Up Now
              </button>
            )}
          </div>
        </div>
      </nav>

      {(isOnTrial || isTrialExpired) && (
        <TrialBanner daysRemaining={daysRemaining} onUpgrade={() => setShowUpgradeModal(true)} />
      )}

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-pink-200 text-pink-600 text-xs font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
            Building connections that last forever
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-4">
            Welcome to your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500">
              love hub{authUser ? `, ${authUser.name}` : ''}
            </span>
          </h2>
          <p className="text-gray-500 text-lg">
            Stay connected with your partner, no matter the distance.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 text-center">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickActions.map((action, i) => (
              <div
                key={i}
                onClick={() => router.push(action.href)}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl`} />
                {action.premium && !isPremium && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </div>
                )}
                <div className={`w-12 h-12 ${action.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{action.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{action.desc}</p>
                <div className={`text-xs font-semibold ${action.color} flex items-center gap-1`}>
                  {action.premium && !isPremium ? 'Upgrade to unlock' : 'Open'} <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-violet-600 rounded-3xl p-10 sm:p-14 text-center text-white overflow-hidden">
          <div className="absolute -top-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="24" r="9" stroke="white" strokeWidth="2.6" fill="none" strokeOpacity="0.8" />
                <circle cx="30" cy="24" r="9" stroke="white" strokeWidth="2.6" fill="none" strokeOpacity="0.8" />
                <path d="M24 28.5c-.3-.25-5-3.6-5-6.3a3 3 0 015-2.24A3 3 0 0129 22.2c0 2.7-4.7 6.05-5 6.3z" fill="white" />
              </svg>
            </div>
            <p className="text-2xl font-extrabold mb-2 tracking-tight">Distance means nothing</p>
            <p className="text-pink-100 text-lg">when someone means everything</p>
            {!authUser && (
              <button
                onClick={() => router.push('/login')}
                className="mt-8 bg-white text-pink-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-pink-50 transition-colors text-sm shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100/60 py-8 mt-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
          Made with care for long-distance couples worldwide
        </div>
      </footer>

      <TrialModal isOpen={isTrialExpired || showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  )
}
