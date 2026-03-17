'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PasswordStrength from '@/components/PasswordStrength'
import Toast from '@/components/Toast'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info', isVisible: false })
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => { if (data.isLoggedIn) router.push('/home') })
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
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <span className="text-xl">💕</span>
            <span className="font-bold text-gray-900 text-lg">Couple Connect</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
        <div className="w-full max-w-md animate-fadeIn">

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isSignUp ? 'Start your love journey today' : 'Sign in to continue to your account'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setIsSignUp(false); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  !isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
                  placeholder="Enter your password"
                  required
                />
                {isSignUp && <PasswordStrength password={formData.password} />}
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
                    placeholder="Confirm your password"
                    required={isSignUp}
                  />
                </div>
              )}

              {!isSignUp && (
                <div className="text-right">
                  <a href="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Please wait...
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">What you get with Couple Connect</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '💬', text: 'Real-time Chat' },
                  { icon: '📹', text: 'HD Video Calls' },
                  { icon: '🎮', text: 'Couple Games' },
                  { icon: '🔒', text: 'Fully Encrypted' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{f.icon}</span>
                    <span className="text-xs text-gray-600 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Made with 💕 for long-distance couples worldwide
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
