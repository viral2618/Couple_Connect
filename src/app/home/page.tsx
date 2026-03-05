'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTrialTimer } from '@/hooks/useTrialTimer'
import { generateFingerprint } from '@/lib/fingerprint'
import { TrialModal } from '@/components/TrialModal'
import { TrialBanner } from '@/components/TrialBanner'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  name: string
  email: string
  partner?: {
    id: string
    name: string
    avatar?: string
  }
}

export default function HomePage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [resetTimer, setResetTimer] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const [trialExhausted, setTrialExhausted] = useState(false)
  
  const { timeRemaining, isExpired, trialExhausted: isTrialExhausted } = useTrialTimer(authUser ? null : fingerprint, resetTimer)

  useEffect(() => {
    if (!authUser) {
      const freshStart = sessionStorage.getItem('freshTrialStart')
      if (freshStart) {
        setResetTimer(true)
        sessionStorage.removeItem('freshTrialStart')
      }
      generateFingerprint().then(setFingerprint)
    }
  }, [authUser])

  useEffect(() => {
    if (!authUser && !isTrialExhausted) {
      if (isExpired) {
        setShowModal(true)
      } else if (timeRemaining <= 300 && timeRemaining > 0) {
        setShowModal(true)
      }
    }
  }, [isExpired, timeRemaining, authUser, isTrialExhausted])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const quickActions = [
    {
      title: 'Start Chatting',
      desc: 'Connect with your partner instantly',
      icon: '💬',
      gradient: 'from-blue-400 to-blue-600',
      href: '/chat',
      delay: 0.1
    },
    {
      title: 'Video Call',
      desc: 'See each other face to face',
      icon: '📹',
      gradient: 'from-green-400 to-green-600',
      href: '/video-call',
      delay: 0.2
    },
    {
      title: 'Play Games',
      desc: 'Fun couple games to play together',
      icon: '🎮',
      gradient: 'from-purple-400 to-purple-600',
      href: '/games',
      delay: 0.3
    },
    {
      title: 'Share Photos',
      desc: 'Create beautiful memories together',
      icon: '📸',
      gradient: 'from-pink-400 to-pink-600',
      href: '/photos',
      delay: 0.4
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Interactive Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-love-50 via-pink-50 to-purple-50">
        <div className="absolute inset-0 bg-pattern-hearts opacity-20" />
        
        {/* Interactive cursor glow */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-love-200/20 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 glass backdrop-blur-xl border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-love-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-love">
                <span className="text-xl sm:text-2xl animate-heartbeat">💕</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">
                  Couple Connect
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Stay connected forever</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-2 sm:space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {authUser ? (
                <>
                  <div className="hidden sm:flex items-center space-x-4">
                    <motion.a
                      href="/chat"
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 text-love-600 hover:text-love-700 font-medium transition-colors duration-200 px-3 py-2 rounded-full hover:bg-love-50"
                    >
                      💬 <span className="hidden md:inline">Chat</span>
                    </motion.a>
                    <motion.a
                      href="/games"
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 text-love-600 hover:text-love-700 font-medium transition-colors duration-200 px-3 py-2 rounded-full hover:bg-love-50"
                    >
                      🎮 <span className="hidden md:inline">Games</span>
                    </motion.a>
                  </div>
                  
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center space-x-2 glass-love px-3 py-2 rounded-full transition-all duration-200 hover:shadow-love"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-love-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {authUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:inline text-gray-700 font-medium">{authUser.name}</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>
                    
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute right-0 mt-2 w-64 card-glass backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/20">
                          <p className="font-semibold text-gray-900">{authUser.name}</p>
                          <p className="text-sm text-gray-600">{authUser.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { icon: '👤', text: 'Edit Profile', href: '/profile' },
                            { icon: '⚙️', text: 'Settings', href: '/settings' },
                            { icon: '💕', text: 'Partner Info', href: '/partner' },
                            { icon: '🔔', text: 'Notifications', href: '/notifications' }
                          ].map((item, i) => (
                            <a
                              key={i}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors duration-200"
                            >
                              <span>{item.icon}</span>
                              <span>{item.text}</span>
                            </a>
                          ))}
                          <div className="border-t border-white/20 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors duration-200"
                            >
                              <span>🚪</span>
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="btn-love px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  Sign Up Now
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {!authUser && !isTrialExhausted && <TrialBanner timeRemaining={timeRemaining} onSignUp={() => router.push('/login')} />}

      {!authUser && isTrialExhausted && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-10" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white font-bold text-xl">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Free Trial Expired</h3>
                  <p className="text-sm opacity-90">You've used your 20-minute free trial. Sign up to continue using Couple Connect.</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Sign Up Now
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="relative inline-block">
            <motion.h2 
              className="text-3xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-6 leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome to Your Love Hub{authUser ? ` ${authUser.name}!` : ''}
            </motion.h2>
            
            <div className="absolute -top-4 -right-4 text-3xl sm:text-4xl animate-bounce">
              💕
            </div>
          </div>
          
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Stay connected with your partner, no matter the distance. Experience love without limits.
          </motion.p>
          
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-love px-6 py-3 rounded-full border border-love-200">
              <span className="text-love-600 font-semibold">✨ Building connections that last forever ✨</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: action.delay + 0.6, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => router.push(action.href)}
              className="card-love p-6 sm:p-8 group cursor-pointer relative overflow-hidden hover:shadow-glow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10 text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${action.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 mx-auto`}>
                  {action.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-gray-900 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {action.desc}
                </p>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] mb-16 sm:mb-20"
        >
          <div className="relative h-64 sm:h-96 lg:h-[500px] bg-gradient-to-br from-love-400 via-pink-400 to-purple-400">
            <div className="absolute inset-0 bg-gradient-to-br from-love-500/20 to-purple-500/20"></div>
            <div className="absolute inset-0 bg-pattern-dots opacity-20" />
            
            {/* Floating hearts */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float text-white/30"
                style={{
                  left: `${(i * 17 + 10) % 90}%`,
                  top: `${(i * 23 + 15) % 80}%`,
                  animationDelay: `${(i * 0.5) % 3}s`,
                  animationDuration: `${3 + (i % 3)}s`,
                  fontSize: `${1 + (i % 2) * 0.5}rem`
                }}
              >
                {['💕', '💖', '💗', '💘', '💙', '💜'][i % 6]}
              </div>
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white relative z-10 px-4">
                <div className="flex justify-center items-center space-x-4 sm:space-x-8 mb-6 sm:mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 glass rounded-full flex items-center justify-center shadow-2xl">
                      <span className="text-4xl sm:text-6xl">👩‍❤️‍👨</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-xs sm:text-sm">💫</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 h-1 bg-white/40 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                    </div>
                    <span className="text-xl sm:text-2xl animate-bounce">💕</span>
                    <div className="w-12 sm:w-16 h-1 bg-white/40 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 glass rounded-full flex items-center justify-center shadow-2xl">
                      <span className="text-4xl sm:text-6xl">👨‍❤️‍👩</span>
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 bg-pink-300 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-xs sm:text-sm">✨</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
                  <p className="text-lg sm:text-xl font-semibold mb-2">Distance means nothing</p>
                  <p className="text-base sm:text-lg opacity-90">when someone means everything 💖</p>
                </div>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 text-2xl sm:text-4xl text-white/20">🌟</div>
            <div className="absolute top-4 right-4 text-2xl sm:text-4xl text-white/20">🌙</div>
            <div className="absolute bottom-4 left-4 text-2xl sm:text-4xl text-white/20">🌸</div>
            <div className="absolute bottom-4 right-4 text-2xl sm:text-4xl text-white/20">🦋</div>
          </div>
        </motion.div>
      </main>

      <TrialModal isOpen={showModal && !authUser} timeRemaining={timeRemaining} />
    </div>
  )
}