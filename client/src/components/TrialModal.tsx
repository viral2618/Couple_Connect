'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface TrialModalProps {
  isOpen: boolean
  timeRemaining: number
}

export function TrialModal({ isOpen, timeRemaining }: TrialModalProps) {
  const router = useRouter()
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const isExpired = timeRemaining === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={isExpired ? undefined : () => {}}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-50"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{isExpired ? '⏰' : '⚠️'}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {isExpired ? 'Trial Expired' : 'Trial Ending Soon'}
              </h2>
              
              {!isExpired && (
                <div className="text-5xl font-bold text-rose-500 mb-4">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
              )}

              <p className="text-gray-600 mb-6 text-lg">
                {isExpired
                  ? 'Your 20-minute trial has ended. Sign up to continue enjoying all features!'
                  : `Only ${minutes} minute${minutes !== 1 ? 's' : ''} left! Sign up now to keep your connection alive.`}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
                >
                  {isExpired ? 'Sign Up to Continue' : 'Sign Up Now'}
                </button>
                {!isExpired && (
                  <button
                    onClick={() => {}}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all"
                  >
                    Continue Trial
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
