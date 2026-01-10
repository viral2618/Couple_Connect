'use client'

import { useState, useEffect } from 'react'
import CouplesGame from '../../components/CouplesGame'

export default function GamesPage() {
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [showGame, setShowGame] = useState(false)

  useEffect(() => {
    // Generate a simple user ID if not provided
    const storedUserId = localStorage.getItem('userId') || Math.random().toString(36).substring(2, 15)
    const storedUserName = localStorage.getItem('userName') || ''
    
    localStorage.setItem('userId', storedUserId)
    setUserId(storedUserId)
    setUserName(storedUserName)
    
    if (storedUserName) {
      setShowGame(true)
    }
  }, [])

  const handleNameSubmit = () => {
    if (userName.trim()) {
      localStorage.setItem('userName', userName.trim())
      setShowGame(true)
    }
  }

  if (!showGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💕</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Couple's Games!</h1>
            <p className="text-gray-600">Enter your name to get started</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
            />
            <button
              onClick={handleNameSubmit}
              disabled={!userName.trim()}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Start Playing
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <CouplesGame userId={userId} userName={userName} />
    </div>
  )
}