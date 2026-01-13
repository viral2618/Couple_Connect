'use client'

import { useState, useEffect } from 'react'

interface QuestionGameProps {
  gameRoom: any
  gameData: any
  socket: any
  userId: string
}

export default function QuestionGame({ gameRoom, gameData, socket, userId }: QuestionGameProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [roundResults, setRoundResults] = useState<any>(null)

  useEffect(() => {
    if (gameData?.showResults) {
      setShowResults(true)
      setRoundResults(gameData)
    } else {
      setShowResults(false)
      setSubmitted(false)
      setAnswer('')
      setRoundResults(null)
    }
  }, [gameData])

  const submitAnswer = () => {
    if (answer.trim()) {
      socket.emit('submit-answer', {
        roomId: gameRoom.id,
        answer: answer.trim()
      })
      setSubmitted(true)
    }
  }

  if (showResults && roundResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <div className="max-w-md mx-auto pt-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💖 Round Results</h2>
            <p className="text-gray-600">Round {roundResults.round}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <p className="text-lg text-gray-800 text-center mb-4 font-medium">{roundResults.question}</p>
            
            <div className="space-y-4">
              {Object.entries(roundResults.answers || {}).map(([playerId, answer]) => {
                const player = gameRoom.players.find((p: any) => p.id === playerId)
                return (
                  <div key={playerId} className="bg-pink-50 rounded-lg p-4">
                    <p className="font-semibold text-pink-800 mb-2">
                      {player?.name} {playerId === userId && '(You)'}
                    </p>
                    <p className="text-gray-700">{String(answer)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">💕 {roundResults.message}</p>
            {roundResults.round < gameRoom.maxRounds && (
              <p className="text-sm text-gray-500 mt-2">Next round starting soon...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto pt-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">💝 Love Questions</h2>
          <p className="text-gray-600">Round {gameData?.round || 1}/{gameData?.maxRounds || 3}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <p className="text-lg text-gray-800 text-center leading-relaxed">{gameData?.question}</p>
        </div>

        {!submitted ? (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none"
              rows={4}
            />
            <button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Share Answer
            </button>
          </div>
        ) : (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-green-700 font-medium">Answer shared! Waiting for your partner...</p>
          </div>
        )}
      </div>
    </div>
  )
}