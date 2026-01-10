'use client'

import { useState } from 'react'

interface DareGameProps {
  gameRoom: any
  gameData: any
  socket: any
  userId: string
}

export default function DareGame({ gameRoom, gameData, socket, userId }: DareGameProps) {
  const [completed, setCompleted] = useState(false)

  const markCompleted = () => {
    socket.emit('complete-dare', {
      roomId: gameRoom.id,
      completed: true
    })
    setCompleted(true)
  }

  const getGameTitle = () => {
    switch (gameData.type) {
      case 'dare': return '🌹 Romantic Dares'
      case 'seduction': return '😈 Seduction Challenge'
      default: return '💕 Couple Dares'
    }
  }

  const getGradient = () => {
    switch (gameData.type) {
      case 'dare': return 'from-rose-100 to-pink-100'
      case 'seduction': return 'from-purple-100 to-indigo-100'
      default: return 'from-pink-100 to-purple-100'
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradient()} p-4`}>
      <div className="max-w-md mx-auto pt-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{getGameTitle()}</h2>
          <p className="text-gray-600">Round {gameRoom.currentRound}/{gameRoom.maxRounds}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">💕</div>
            <p className="text-lg text-gray-800 leading-relaxed">{gameData.dare}</p>
          </div>
        </div>

        {!completed ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
              <p className="text-pink-700 text-sm text-center mb-3">
                Complete this dare together, then mark it as done!
              </p>
            </div>
            <button
              onClick={markCompleted}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              ✅ We Did It!
            </button>
          </div>
        ) : (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-green-700 font-medium">Great job! Waiting for your partner...</p>
          </div>
        )}
      </div>
    </div>
  )
}