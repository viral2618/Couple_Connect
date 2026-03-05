'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) {
          router.push('/home')
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
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
      desc: 'Send messages instantly with read receipts and typing indicators',
      gradient: 'from-blue-400 to-blue-600'
    },
    { 
      icon: '📹', 
      title: 'HD Video Calls', 
      desc: 'Crystal clear video calls with end-to-end encryption',
      gradient: 'from-green-400 to-green-600'
    },
    { 
      icon: '🎮', 
      title: 'Couple Games', 
      desc: 'Play fun and intimate games together to strengthen your bond',
      gradient: 'from-purple-400 to-purple-600',
      link: '/couples-game'
    },
    { 
      icon: '📸', 
      title: 'Photo Sharing', 
      desc: 'Share your precious moments with secure photo albums',
      gradient: 'from-pink-400 to-pink-600'
    },
    { 
      icon: '💝', 
      title: 'Love Notes', 
      desc: 'Send sweet surprise messages and schedule future deliveries',
      gradient: 'from-red-400 to-red-600'
    },
    { 
      icon: '📅', 
      title: 'Shared Calendar', 
      desc: 'Plan dates, anniversaries, and special moments together',
      gradient: 'from-indigo-400 to-indigo-600'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-love-50 via-pink-50 to-purple-50">
        <div className="absolute inset-0 bg-pattern-hearts opacity-20" />
        
        {/* Interactive cursor glow */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-love-200/30 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="relative inline-block">
            <motion.h1 
              className="text-4xl sm:text-6xl lg:text-7xl font-bold gradient-text mb-6 leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              💕 Couple Connect
            </motion.h1>
            
            {/* Floating hearts around title */}
            <div className="absolute -top-4 -left-4 text-2xl sm:text-3xl animate-bounce">
              💖
            </div>
            <div className="absolute -top-2 -right-6 text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
              ✨
            </div>
            <div className="absolute -bottom-2 left-8 text-lg sm:text-xl animate-bounce" style={{ animationDelay: '1s' }}>
              💘
            </div>
          </div>
          
          <motion.p 
            className="text-xl sm:text-2xl lg:text-3xl text-gray-700 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Stay connected with your 💕 <span className="gradient-text-love font-semibold">soulmate</span>, no matter the distance
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(236, 72, 153, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={startTrial}
              className="btn-love text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                🎆 Try Free for 20 Minutes
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-love-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="glass-love text-love-600 hover:text-love-700 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-semibold text-lg sm:text-xl border-2 border-love-300 hover:border-love-400 transition-all duration-300"
            >
              🚀 Sign In / Sign Up
            </motion.button>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm sm:text-base text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              🔒 <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              ✨ <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              💕 <span>10,000+ Happy Couples</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.6, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`card-love p-6 sm:p-8 group cursor-pointer relative overflow-hidden ${
                feature.link ? 'hover:shadow-glow-lg' : ''
              }`}
              onClick={() => feature.link && router.push(feature.link)}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 group-hover:text-gray-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.desc}
                </p>
              </div>
              
              {/* Hover indicator */}
              {feature.link && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] p-8 sm:p-16 text-center"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-love-500 via-pink-500 to-purple-500 animate-gradient" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" />
          
          {/* Floating elements */}
          <div className="absolute top-8 left-8 text-4xl sm:text-6xl text-white/20 animate-float">
            💕
          </div>
          <div className="absolute top-12 right-12 text-3xl sm:text-5xl text-white/20 animate-float" style={{ animationDelay: '1s' }}>
            ✨
          </div>
          <div className="absolute bottom-8 left-16 text-2xl sm:text-4xl text-white/20 animate-float" style={{ animationDelay: '2s' }}>
            💘
          </div>
          <div className="absolute bottom-12 right-8 text-3xl sm:text-5xl text-white/20 animate-float" style={{ animationDelay: '0.5s' }}>
            🌸
          </div>
          
          <div className="relative z-10 text-white">
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              Ready to Connect Hearts? 💕
            </motion.h2>
            
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              Join thousands of couples who've found their perfect connection. 
              <br className="hidden sm:block" />
              Try all features free for 20 minutes - no strings attached!
            </motion.p>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={startTrial}
              className="bg-white text-love-600 hover:text-love-700 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                🚀 Start Your Love Journey Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-love-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
            
            <motion.div 
              className="mt-6 sm:mt-8 text-sm sm:text-base opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              ✨ Instant access • No downloads required • Works on all devices
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}