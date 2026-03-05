'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CouplesGame from '../../components/CouplesGame'

export default function GamesPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [showGame, setShowGame] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || Math.random().toString(36).substring(2, 15)
    const storedUserName = localStorage.getItem('userName') || ''
    
    localStorage.setItem('userId', storedUserId)
    setUserId(storedUserId)
    setUserName(storedUserName)
    
    if (storedUserName) {
      setShowGame(true)
    }
  }, [])

  const handleNameSubmit = async () => {
    if (userName.trim()) {
      setIsLoading(true)
      localStorage.setItem('userName', userName.trim())
      
      // Add a small delay for better UX
      setTimeout(() => {
        setShowGame(true)
        setIsLoading(false)
      }, 800)
    }
  }

  const gameCategories = [
    {
      title: "Getting to Know Each Other",
      description: "Perfect for new couples",
      icon: "💕",
      color: "from-pink-400 to-rose-400"
    },
    {
      title: "Intimate Questions",
      description: "Deepen your connection",
      icon: "🔥",
      color: "from-red-400 to-pink-400"
    },
    {
      title: "Fun Challenges",
      description: "Playful activities together",
      icon: "🎯",
      color: "from-purple-400 to-indigo-400"
    },
    {
      title: "Future Dreams",
      description: "Plan your life together",
      icon: "✨",
      color: "from-blue-400 to-cyan-400"
    }
  ]

  if (!showGame) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-love-50 via-pink-50 to-purple-50">
          <div className="absolute inset-0 bg-pattern-hearts opacity-30" />
          
          {/* Floating game icons */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float text-love-300/40"
              style={{
                left: `${(i * 12 + 5) % 95}%`,
                top: `${(i * 18 + 10) % 85}%`,
                animationDelay: `${(i * 0.6) % 4}s`,
                animationDuration: `${3 + (i % 4)}s`,
                fontSize: `${0.8 + (i % 3) * 0.3}rem`
              }}
            >
              {['🎮', '💕', '🎯', '🔥', '✨', '💖', '🌟', '💘'][i % 8]}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="card-glass backdrop-blur-xl border border-white/30 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-8 text-center overflow-hidden">
              <div className="absolute inset-0 bg-pattern-dots opacity-20" />
              
              {/* Floating icons in header */}
              <div className="absolute top-4 left-4 text-2xl text-white/30 animate-float">🎮</div>
              <div className="absolute top-6 right-6 text-xl text-white/30 animate-float" style={{ animationDelay: '1s' }}>💕</div>
              <div className="absolute bottom-4 left-6 text-lg text-white/30 animate-float" style={{ animationDelay: '2s' }}>✨</div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="relative z-10"
              >
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-2xl">
                  <span className="text-4xl animate-bounce">🎮</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Couple's Games!</h1>
                <p className="text-white/90 text-sm sm:text-base">Strengthen your bond through fun activities</p>
              </motion.div>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Welcome to Love Games</h2>
                <p className="text-gray-600 text-sm sm:text-base">Enter your name to start playing together</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-4 pl-12 glass backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-transparent text-base transition-all duration-300 hover:bg-white/90"
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleNameSubmit()}
                      disabled={isLoading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                      👤
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNameSubmit}
                  disabled={!userName.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Getting Ready...
                      </>
                    ) : (
                      <>
                        🚀 Start Playing
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </motion.div>

              {/* Game Categories Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-gray-200/50"
              >
                <p className="text-center text-sm text-gray-600 mb-4 font-semibold">Game Categories:</p>
                <div className="grid grid-cols-2 gap-3">
                  {gameCategories.map((category, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-white/90 transition-all duration-200 border border-gray-200/50"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-sm shadow-sm`}>
                          {category.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-800 truncate">{category.title}</p>
                          <p className="text-xs text-gray-600 truncate">{category.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Back to Home */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 text-center"
              >
                <button
                  onClick={() => router.push('/home')}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 hover:underline"
                >
                  ← Back to Home
                </button>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.p 
            className="text-center text-gray-600 text-sm mt-6 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            💕 Bringing couples closer through play
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="absolute inset-0 bg-pattern-hearts opacity-20" />
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/home')}
                className="text-love-600 hover:text-love-700 p-2 hover:bg-love-50 rounded-xl transition-all duration-200"
                title="Back to Home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-love">
                  <span className="text-xl sm:text-2xl animate-bounce">🎮</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">
                    Couple Games
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Play together, grow together</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>Playing as:</span>
                <span className="font-semibold text-love-600">{userName}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('userName')
                  setShowGame(false)
                  setUserName('')
                }}
                className="glass-love text-love-600 hover:text-love-700 px-4 py-2 rounded-full font-medium text-sm border border-love-300 hover:border-love-400 transition-all duration-300"
              >
                Change Name
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <div className="relative z-10">
        <CouplesGame userId={userId} userName={userName} />
      </div>
    </div>
  )
}