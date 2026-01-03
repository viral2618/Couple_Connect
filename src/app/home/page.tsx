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
  // Only run trial timer for non-authenticated users
  const { timeRemaining, isExpired } = useTrialTimer(authUser ? null : fingerprint)

  useEffect(() => {
    // Only generate fingerprint for non-authenticated users
    if (!authUser) {
      generateFingerprint().then(setFingerprint)
    }
  }, [authUser])

  useEffect(() => {
    // Only show trial modals for non-authenticated users
    if (!authUser) {
      if (isExpired) {
        setShowModal(true)
      } else if (timeRemaining <= 300 && timeRemaining > 0) {
        setShowModal(true)
      }
    }
  }, [isExpired, timeRemaining, authUser])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-rose-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-2 rounded-xl shadow-lg">
                <span className="text-2xl">💕</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Couple Connect
              </h1>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {authUser ? (
                <>
                  <a
                    href="/chat"
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                  >
                    💬 Chat
                  </a>
                  <a
                    href="/games"
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                  >
                    🎮 Games
                  </a>
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                    >
                      <span className="text-2xl">👤</span>
                      <span>Profile</span>
                      <span className="text-sm">▼</span>
                    </button>
                    
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-gray-900">{authUser.name}</p>
                          <p className="text-sm text-gray-500">{authUser.email}</p>
                        </div>
                        <div className="py-1">
                          <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">👤 Edit Profile</a>
                          <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Settings</a>
                          <a href="/partner" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">💕 Partner Info</a>
                          <a href="/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🔔 Notifications</a>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              🚪 Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  Sign Up Now
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {!authUser && <TrialBanner timeRemaining={timeRemaining} onSignUp={() => router.push('/login')} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="relative">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
              Welcome to Your Love Hub{authUser ? ` ${authUser.name}!` : ''}
            </h2>
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
              💕
            </div>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay connected with your partner, no matter the distance. Experience love without limits.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 px-6 py-3 rounded-full border border-rose-200 shadow-sm">
              <span className="text-rose-600 font-medium">✨ Building connections that last forever ✨</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Banner Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20 relative overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="relative h-96 md:h-[500px] bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-purple-500/20"></div>
            
            <div className="absolute inset-0 overflow-hidden">
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
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white relative z-10">
                <div className="flex justify-center items-center space-x-8 mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl">
                      <span className="text-6xl">👩❤️👨</span>
                    </div>
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-sm">💫</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1 bg-white/40 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                    </div>
                    <span className="text-2xl animate-bounce">💕</span>
                    <div className="w-16 h-1 bg-white/40 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl">
                      <span className="text-6xl">👨❤️👩</span>
                    </div>
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-300 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-sm">✨</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl max-w-md mx-auto">
                  <p className="text-xl font-medium mb-2">Distance means nothing</p>
                  <p className="text-lg opacity-90">when someone means everything 💖</p>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 text-white/20 text-4xl">🌟</div>
            <div className="absolute top-4 right-4 text-white/20 text-4xl">🌙</div>
            <div className="absolute bottom-4 left-4 text-white/20 text-4xl">🌸</div>
            <div className="absolute bottom-4 right-4 text-white/20 text-4xl">🦋</div>
          </div>
        </motion.div>

        {/* Features Showcase */}
        <div className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 p-8 border border-rose-200/50 hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    💬
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Real-time Chat</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">Send messages instantly and stay connected throughout the day</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 border border-purple-200/50 hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    📹
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Video Calls</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">Face-to-face conversations to bridge the distance</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <TrialModal isOpen={showModal && !authUser} timeRemaining={timeRemaining} />
    </div>
  )
}