'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Choice = 'rock' | 'paper' | 'scissors' | null

export default function RockPaperScissors() {
  const [player1Choice, setPlayer1Choice] = useState<Choice>(null)
  const [player2Choice, setPlayer2Choice] = useState<Choice>(null)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [result, setResult] = useState<string>('')
  const [showResult, setShowResult] = useState(false)

  const choices = [
    { name: 'rock', emoji: '🪨', label: 'Rock' },
    { name: 'paper', emoji: '📄', label: 'Paper' },
    { name: 'scissors', emoji: '✂️', label: 'Scissors' }
  ]

  const getWinner = (p1: Choice, p2: Choice) => {
    if (!p1 || !p2) return ''
    if (p1 === p2) return 'tie'
    if (
      (p1 === 'rock' && p2 === 'scissors') ||
      (p1 === 'paper' && p2 === 'rock') ||
      (p1 === 'scissors' && p2 === 'paper')
    ) return 'player1'
    return 'player2'
  }

  const playRound = () => {
    if (!player1Choice || !player2Choice) return

    const winner = getWinner(player1Choice, player2Choice)
    
    if (winner === 'player1') {
      setPlayer1Score(prev => prev + 1)
      setResult('Player 1 Wins!')
    } else if (winner === 'player2') {
      setPlayer2Score(prev => prev + 1)
      setResult('Player 2 Wins!')
    } else {
      setResult("It's a Tie!")
    }

    setShowResult(true)
    setTimeout(() => {
      setShowResult(false)
      setPlayer1Choice(null)
      setPlayer2Choice(null)
      setResult('')
    }, 2000)
  }

  const resetGame = () => {
    setPlayer1Choice(null)
    setPlayer2Choice(null)
    setPlayer1Score(0)
    setPlayer2Score(0)
    setResult('')
    setShowResult(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🪨📄✂️</div>
        <h2 className="text-3xl font-bold text-gray-800">Rock Paper Scissors</h2>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{player1Score}</div>
            <div className="text-sm text-gray-600">Player 1</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{player2Score}</div>
            <div className="text-sm text-gray-600">Player 2</div>
          </div>
        </div>
      </div>

      {showResult && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center p-6 bg-yellow-100 rounded-xl"
        >
          <div className="text-2xl font-bold text-gray-800">{result}</div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <div className="text-4xl">{choices.find(c => c.name === player1Choice)?.emoji}</div>
              <div className="text-sm">Player 1</div>
            </div>
            <div className="text-2xl">VS</div>
            <div className="text-center">
              <div className="text-4xl">{choices.find(c => c.name === player2Choice)?.emoji}</div>
              <div className="text-sm">Player 2</div>
            </div>
          </div>
        </motion.div>
      )}

      {!showResult && (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-blue-600">Player 1</h3>
            <div className="grid grid-cols-1 gap-3">
              {choices.map((choice) => (
                <button
                  key={choice.name}
                  onClick={() => setPlayer1Choice(choice.name as Choice)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    player1Choice === choice.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{choice.emoji}</div>
                  <div className="font-medium">{choice.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-red-600">Player 2</h3>
            <div className="grid grid-cols-1 gap-3">
              {choices.map((choice) => (
                <button
                  key={choice.name}
                  onClick={() => setPlayer2Choice(choice.name as Choice)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    player2Choice === choice.name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{choice.emoji}</div>
                  <div className="font-medium">{choice.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!showResult && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={playRound}
            disabled={!player1Choice || !player2Choice}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all"
          >
            Play Round
          </button>
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  )
}