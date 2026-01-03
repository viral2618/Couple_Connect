'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()

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

  const startTrial = async () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-800 mb-4">💕 Couple Connect</h1>
          <p className="text-2xl text-gray-600 mb-8">Stay connected, no matter the distance</p>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTrial}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg"
            >
              Try Free for 20 Minutes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="bg-white hover:bg-gray-50 text-rose-500 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg border-2 border-rose-500"
            >
              Sign In / Sign Up
            </motion.button>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            { icon: '💬', title: 'Real-time Chat', desc: 'Send messages instantly' },
            { icon: '📹', title: 'Video Calls', desc: 'Face-to-face conversations' },
            { icon: '🎮', title: 'Couple Games', desc: 'Play fun games together', link: '/games' },
            { icon: '📸', title: 'Photo Sharing', desc: 'Share your moments' },
            { icon: '💝', title: 'Love Notes', desc: 'Send sweet messages' },
            { icon: '🗓️', title: 'Shared Calendar', desc: 'Plan dates together' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${
                feature.link ? 'cursor-pointer' : ''
              }`}
              onClick={() => feature.link && router.push(feature.link)}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-rose-500 rounded-2xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-xl mb-6">Try all features free for 20 minutes, no credit card required!</p>
          <button
            onClick={startTrial}
            className="bg-white text-rose-500 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Start Free Trial Now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
