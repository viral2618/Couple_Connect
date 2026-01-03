'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { coupleGames, CoupleGame } from '@/data/coupleGames'
import { useAuth } from '@/contexts/AuthContext'
import TwoTruthsOneLie from '@/components/games/TwoTruthsOneLie'
import RealTimeTwoTruthsOneLie from '@/components/games/RealTimeTwoTruthsOneLie'
import QuestionJar from '@/components/games/QuestionJar'
import RockPaperScissors from '@/components/games/RockPaperScissors'
import NumberGuessing from '@/components/games/NumberGuessing'

export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const gameId = params?.gameId as string
  
  const [game, setGame] = useState<CoupleGame | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [isRealTimeMode, setIsRealTimeMode] = useState(false)

  useEffect(() => {
    const foundGame = coupleGames.find(g => g.id === gameId)
    if (foundGame) {
      setGame(foundGame)
    }
  }, [gameId])

  // Interactive games that have their own components
  const getInteractiveGameComponent = () => {
    switch (gameId) {
      case 'two-truths-one-lie':
        return isRealTimeMode && user ? (
          <RealTimeTwoTruthsOneLie userId={user.id} userName={user.name} />
        ) : (
          <TwoTruthsOneLie />
        )
      case 'question-jar':
        return <QuestionJar />
      case 'rock-paper-scissors':
        return <RockPaperScissors />
      case 'number-guessing':
        return <NumberGuessing />
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Icebreaker': return '🧊'
      case 'Romantic': return '💕'
      case 'Fun & Silly': return '🎭'
      case 'Deep Connection': return '💫'
      case 'Challenges': return '🎯'
      case 'Long-Distance': return '🌍'
      case 'Party Games': return '🎉'
      case 'Dark Romance': return '🖤'
      case 'Test Games': return '🎮'
      default: return '🎮'
    }
  }

  const isInteractiveGame = ['two-truths-one-lie', 'question-jar', 'rock-paper-scissors', 'number-guessing'].includes(gameId)

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Game Not Found</h1>
          <button
            onClick={() => router.push('/games')}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Games
          </button>
        </div>
      </div>
    )
  }

  // For interactive games, show the component directly after game info
  if (isInteractiveGame && gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(game.category)}</span>
                <h1 className="text-2xl font-bold text-gray-800">{game.name}</h1>
              </div>
              <button
                onClick={() => router.push('/games')}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            {getInteractiveGameComponent()}
          </div>
        </div>
      </div>
    )
  }

  const getIntimacyColor = (level: string) => {
    switch (level) {
      case 'Light': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Deep': return 'bg-rose-100 text-rose-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const startGame = (realTime = false) => {
    setIsRealTimeMode(realTime)
    setGameStarted(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < game.howToPlay.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setGameCompleted(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setCurrentStep(0)
    setIsRealTimeMode(false)
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{getCategoryIcon(game.category)}</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{game.name}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getIntimacyColor(game.intimacyLevel)}`}>
                {game.intimacyLevel} Intimacy
              </span>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Objective</h2>
                <p className="text-gray-600 text-lg">{game.objective}</p>
                {gameId === 'two-truths-one-lie' && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">🌐 New: Real-Time Multiplayer!</h3>
                    <p className="text-blue-700 text-sm">
                      Perfect for long-distance couples! Play together in real-time using room codes. 
                      Both players can be on different devices and locations.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-rose-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">⏱️</div>
                  <h3 className="font-semibold text-gray-800">Time</h3>
                  <p className="text-gray-600">{game.timeRequired}</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">😊</div>
                  <h3 className="font-semibold text-gray-800">Mood</h3>
                  <p className="text-gray-600">{game.mood.split(' & ')[0]}</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-semibold text-gray-800">Players</h3>
                  <p className="text-gray-600">{game.numberOfPlayers} People</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Game Steps Preview</h3>
                <div className="space-y-2">
                  {game.howToPlay.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="bg-rose-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {gameId === 'two-truths-one-lie' ? (
                <div className="flex-1 space-y-3">
                  <button
                    onClick={() => startGame(true)}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    🌐 Play Real-Time (2 Players)
                  </button>
                  <button
                    onClick={() => startGame(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    👥 Play Locally (Same Device)
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startGame()}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl font-semibold text-lg transition-all"
                >
                  🚀 Start Playing
                </button>
              )}
              <button
                onClick={() => router.push('/games')}
                className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md w-full"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Game Complete!</h1>
          <p className="text-gray-600 mb-6">
            Great job playing {game.name}! Hope you both had fun and learned something new about each other.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={() => router.push('/games')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
            >
              Choose Another Game
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getCategoryIcon(game.category)}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{game.name}</h1>
                <p className="text-gray-500">Step {currentStep + 1} of {game.howToPlay.length}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/games')}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / game.howToPlay.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="bg-rose-50 rounded-2xl p-8 mb-6">
              <div className="text-4xl mb-4">
                {currentStep === 0 ? '🎯' : currentStep === game.howToPlay.length - 1 ? '🏁' : '▶️'}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step {currentStep + 1}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {game.howToPlay[currentStep]}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ← Previous
            </button>
            
            <button
              onClick={nextStep}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              {currentStep === game.howToPlay.length - 1 ? '🎉 Finish Game' : 'Next Step →'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}