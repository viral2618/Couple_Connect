'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function NumberGuessing() {
  const [targetNumber, setTargetNumber] = useState<number>(0)
  const [guess, setGuess] = useState<string>('')
  const [attempts, setAttempts] = useState<number>(0)
  const [maxAttempts] = useState<number>(7)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [hint, setHint] = useState<string>('')
  const [guessHistory, setGuessHistory] = useState<{guess: number, hint: string}[]>([])

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const newNumber = Math.floor(Math.random() * 100) + 1
    setTargetNumber(newNumber)
    setGuess('')
    setAttempts(0)
    setGameStatus('playing')
    setHint('I\'m thinking of a number between 1 and 100!')
    setGuessHistory([])
  }

  const makeGuess = () => {
    const guessNum = parseInt(guess)
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      setHint('Please enter a valid number between 1 and 100!')
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    let newHint = ''
    if (guessNum === targetNumber) {
      setGameStatus('won')
      newHint = `🎉 Congratulations! You guessed it in ${newAttempts} attempts!`
    } else if (newAttempts >= maxAttempts) {
      setGameStatus('lost')
      newHint = `😔 Game over! The number was ${targetNumber}`
    } else {
      const difference = Math.abs(guessNum - targetNumber)
      if (difference <= 5) {
        newHint = guessNum < targetNumber ? '🔥 Very close! Go higher!' : '🔥 Very close! Go lower!'
      } else if (difference <= 15) {
        newHint = guessNum < targetNumber ? '🌡️ Getting warm! Go higher!' : '🌡️ Getting warm! Go lower!'
      } else {
        newHint = guessNum < targetNumber ? '❄️ Too low! Go much higher!' : '❄️ Too high! Go much lower!'
      }
    }

    setHint(newHint)
    setGuessHistory(prev => [...prev, { guess: guessNum, hint: newHint }])
    setGuess('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameStatus === 'playing') {
      makeGuess()
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-gray-800">Number Guessing Game</h2>
        <p className="text-gray-600 mt-2">Guess the number between 1 and 100!</p>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-center">
        <div className="text-lg font-medium text-blue-800">{hint}</div>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">
          Attempts: {attempts} / {maxAttempts}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(attempts / maxAttempts) * 100}%` }}
          ></div>
        </div>
      </div>

      {gameStatus === 'playing' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={makeGuess}
              disabled={!guess.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all"
            >
              Guess
            </button>
          </div>
        </div>
      )}

      {gameStatus !== 'playing' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <div className={`text-6xl ${gameStatus === 'won' ? 'text-green-500' : 'text-red-500'}`}>
            {gameStatus === 'won' ? '🎉' : '😔'}
          </div>
          <button
            onClick={startNewGame}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
          >
            Play Again
          </button>
        </motion.div>
      )}

      {guessHistory.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Guess History:</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {guessHistory.map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">#{index + 1}: {entry.guess}</span>
                <span className="text-sm text-gray-600">{entry.hint.replace(/[🎉😔🔥🌡️❄️]/g, '').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}