'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import PasswordStrength from '@/components/PasswordStrength'
import Toast from '@/components/Toast'

export default function Home() {
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

  // Check if user is already logged in on server
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
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-rose-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">💕</h1>
              <h2 className="text-2xl font-bold text-white">Couple Connect</h2>
              <p className="text-rose-100 text-sm mt-2">Stay connected, no matter the distance</p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="flex mb-6 bg-rose-100 rounded-full p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                  !isSignUp
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                  isSignUp
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition bg-white"
                    placeholder="Enter your name"
                    required={isSignUp}
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition bg-white"
                  placeholder="Enter your password"
                  required
                />
                {isSignUp && <PasswordStrength password={formData.password} />}
              </div>

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition bg-white"
                    placeholder="Confirm your password"
                    required={isSignUp}
                  />
                </motion.div>
              )}

              {!isSignUp && (
                <div className="text-right">
                  <a href="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                    Forgot Password?
                  </a>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </motion.button>
            </form>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">What you'll get:</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💬</span>
                  <span className="text-gray-700">Real-time Chat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📹</span>
                  <span className="text-gray-700">Video Calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎮</span>
                  <span className="text-gray-700">Couple Games</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔒</span>
                  <span className="text-gray-700">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          Made with 💕 for long-distance couples
        </p>
      </motion.div>
      
      {/* Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
