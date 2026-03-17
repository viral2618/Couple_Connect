'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get('email')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!email) {
      router.push('/login')
    }
  }, [email, router])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      setSuccess('Email verified successfully! Redirecting...')
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to resend OTP')
        return
      }

      setSuccess('OTP resent successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
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
            onClick={() => router.push('/login')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to login
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
        <div className="w-full max-w-md animate-fadeIn">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-50 border border-pink-100 rounded-xl mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-gray-700">{email}</span>
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <div className="flex justify-center gap-2.5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white py-3"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium disabled:opacity-50 transition-colors"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Made with 💕 for long-distance couples worldwide
          </p>
        </div>
      </div>
    </div>
  )
}
