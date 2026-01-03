'use client'

import { useState, useEffect } from 'react'

interface RateLimitProps {
  attempts: number
  maxAttempts: number
  lockoutTime: number // in seconds
  onReset: () => void
}

export default function RateLimit({ attempts, maxAttempts, lockoutTime, onReset }: RateLimitProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (attempts >= maxAttempts) {
      setIsLocked(true)
      setTimeLeft(lockoutTime)
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsLocked(false)
            onReset()
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [attempts, maxAttempts, lockoutTime, onReset])

  if (!isLocked) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-500 text-lg">🔒</span>
        <h3 className="font-semibold text-red-700">Account Temporarily Locked</h3>
      </div>
      <p className="text-red-600 text-sm mb-2">
        Too many failed attempts. Please wait before trying again.
      </p>
      <div className="text-red-700 font-mono text-lg">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  )
}