'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import PasswordStrength from '@/components/PasswordStrength'
import Toast from '@/components/Toast'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info', isVisible: false })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin'
      const body = isSignUp 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.requiresVerification && data.email) {
          setToast({ message: 'Please verify your email first', type: 'info', isVisible: true })
          setLoading(false)
          router.push(`/verify?email=${encodeURIComponent(data.email)}`)
          return
        }
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      if (isSignUp) {
        setToast({ message: 'Account created! Please verify your email.', type: 'success', isVisible: true })
        setLoading(false)
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setToast({ message: 'Sign in successful! Redirecting...', type: 'success', isVisible: true })
      setLoading(false)
      router.push('/home')
    } catch (err) {
      console.error('Frontend error:', err)
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-love-100 via-pink-100 to-purple-100">
        <div className="absolute inset-0 bg-pattern-hearts opacity-30" />
        
        {/* Floating elements */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-love-300/40"
            style={{
              left: `${(i * 15 + 10) % 90}%`,
              top: `${(i * 20 + 15) % 80}%`,
              animationDelay: `${(i * 0.8) % 4}s`,
              animationDuration: `${4 + (i % 3)}s`,
              fontSize: `${1 + (i % 2) * 0.3}rem`
            }}
          >
            {['💕', '💖', '💗', '💘', '💙', '💜', '🌸', '✨'][i % 8]}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card-glass backdrop-blur-xl border border-white/30 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-love-500 via-pink-500 to-purple-500 p-8 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-pattern-dots opacity-20" />
            
            {/* Floating hearts in header */}
            <div className="absolute top-4 left-4 text-2xl text-white/30 animate-float">💕</div>
            <div className="absolute top-6 right-6 text-xl text-white/30 animate-float" style={{ animationDelay: '1s' }}>✨</div>
            <div className="absolute bottom-4 left-6 text-lg text-white/30 animate-float" style={{ animationDelay: '2s' }}>💖</div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative z-10"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-3xl animate-heartbeat">💕</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Couple Connect</h2>
              <p className="text-white/90 text-sm">Stay connected, no matter the distance</p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm">
            {/* Toggle Buttons */}
            <div className="flex mb-6 bg-gray-100/80 rounded-full p-1 backdrop-blur-sm">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
                  !isSignUp
                    ? 'bg-gradient-to-r from-love-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
                  isSignUp
                    ? 'bg-gradient-to-r from-love-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-12 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-love-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80"
                      placeholder="Enter your full name"
                      required={isSignUp}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      👤
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-love-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    📧
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-love-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔒
                  </div>
                </div>
                {isSignUp && <PasswordStrength password={formData.password} />}
              </div>

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-12 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-love-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80"
                      placeholder="Confirm your password"
                      required={isSignUp}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔐
                    </div>
                  </div>
                </motion.div>
              )}

              {!isSignUp && (
                <div className="text-right">
                  <a 
                    href="/forgot-password" 
                    className="text-sm text-love-600 hover:text-love-700 font-medium transition-colors duration-200 hover:underline"
                  >
                    Forgot Password? 🤔
                  </a>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full btn-love text-lg py-4 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Please wait...
                    </>
                  ) : (
                    <>
                      {isSignUp ? '🚀 Create Account' : '💕 Sign In'}
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-love-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </form>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <p className="text-center text-sm text-gray-600 mb-4 font-medium">What you'll get:</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { icon: '💬', text: 'Real-time Chat' },
                  { icon: '📹', text: 'HD Video Calls' },
                  { icon: '🎮', text: 'Couple Games' },
                  { icon: '🔒', text: 'Fully Encrypted' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200"
                  >
                    <span className="text-base">{feature.icon}</span>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.p 
          className="text-center text-gray-600 text-sm mt-6 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Made with 💕 for long-distance couples worldwide
        </motion.p>
      </motion.div>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}