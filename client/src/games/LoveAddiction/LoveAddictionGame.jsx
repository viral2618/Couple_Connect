import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LoveAddictionGame = ({ socket, roomId, players, onGameEnd, initialGameData, gameRoom }) => {
  const [gameState, setGameState] = useState(initialGameData ? 'playing' : 'waiting')
  const [currentChallenge, setCurrentChallenge] = useState(initialGameData?.currentChallenge || '')
  const [challengeType, setChallengeType] = useState(initialGameData?.challengeType || 'question')
  const [round, setRound] = useState(initialGameData?.round || 1)
  const [maxRounds, setMaxRounds] = useState(initialGameData?.maxRounds || 10)
  const [timeLeft, setTimeLeft] = useState(180)
  const [answer, setAnswer] = useState('')
  const [playerStats, setPlayerStats] = useState(initialGameData?.players || [])
  const [achievements, setAchievements] = useState([])
  const [showAchievement, setShowAchievement] = useState(null)
  const [relationshipScore, setRelationshipScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [dailyChallenge, setDailyChallenge] = useState(initialGameData?.dailyChallenge || null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [particles, setParticles] = useState([])
  
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // Initialize game with initial data if provided
    if (initialGameData && (initialGameData.currentChallenge || initialGameData.gameType === 'love-addiction')) {
      console.log('Initializing Love Addiction with data:', initialGameData)
      setGameState('playing')
      setCurrentChallenge(initialGameData.currentChallenge || 'Loading challenge...')
      setChallengeType(initialGameData.challengeType || 'question')
      setRound(initialGameData.round || 1)
      setMaxRounds(initialGameData.maxRounds || 5)
      setPlayerStats(initialGameData.players || [])
      setDailyChallenge(initialGameData.dailyChallenge)
      setTimeLeft(180)
      startTimeRef.current = Date.now()
      startTimer()
    }
  }, [initialGameData])

  useEffect(() => {
    if (!socket) return

    socket.on('love-addiction-started', (data) => {
      setGameState('playing')
      setCurrentChallenge(data.currentChallenge)
      setChallengeType(data.challengeType)
      setRound(data.round)
      setMaxRounds(data.maxRounds)
      setPlayerStats(data.players)
      setDailyChallenge(data.dailyChallenge)
      setTimeLeft(180)
      startTimeRef.current = Date.now()
      startTimer()
    })

    socket.on('love-addiction-next-round', (data) => {
      setCurrentChallenge(data.currentChallenge)
      setChallengeType(data.challengeType)
      setRound(data.round)
      setPlayerStats(data.players)
      setAnswer('')
      setTimeLeft(180)
      startTimeRef.current = Date.now()
      startTimer()
    })

    socket.on('love-addiction-round-result', (data) => {
      setPlayerStats(data.players)
      
      // Handle achievements
      data.updates.forEach(update => {
        if (update.newAchievements.length > 0) {
          update.newAchievements.forEach(achievement => {
            setShowAchievement(achievement)
            setTimeout(() => setShowAchievement(null), 3000)
          })
        }
        
        if (update.levelUp.leveledUp) {
          setLevel(update.levelUp.newLevel)
          setShowLevelUp(true)
          setTimeout(() => setShowLevelUp(false), 4000)
          createParticles()
        }
      })
    })

    socket.on('love-addiction-ended', (data) => {
      setGameState('ended')
      setRelationshipScore(data.relationshipScore)
      clearInterval(timerRef.current)
    })

    socket.on('love-addiction-answer-submitted', (data) => {
      // Visual feedback for answer submission
      createParticles()
    })

    return () => {
      socket.off('love-addiction-started')
      socket.off('love-addiction-next-round')
      socket.off('love-addiction-round-result')
      socket.off('love-addiction-ended')
      socket.off('love-addiction-answer-submitted')
      clearInterval(timerRef.current)
    }
  }, [socket])

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, 180 - elapsed)
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        clearInterval(timerRef.current)
        if (answer.trim()) {
          submitAnswer()
        }
      }
    }, 1000)
  }

  const createParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      color: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d96ff'][Math.floor(Math.random() * 4)]
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 2000)
  }

  const submitAnswer = () => {
    if (!answer.trim()) return
    
    const timeSpent = Date.now() - startTimeRef.current
    console.log('Submitting answer with roomId:', roomId, 'gameRoom:', gameRoom)
    socket.emit('submit-love-addiction-answer', {
      roomId: roomId,
      answer: answer.trim(),
      timeSpent
    })
    
    clearInterval(timerRef.current)
  }

  const skipChallenge = () => {
    console.log('Skipping challenge with roomId:', roomId)
    socket.emit('skip-love-addiction-challenge', { roomId: roomId })
    clearInterval(timerRef.current)
  }

  const startGame = () => {
    console.log('Starting Love Addiction with roomId:', roomId, 'gameRoom:', gameRoom)
    socket.emit('start-love-addiction', { roomId: roomId, gameMode: 'progressive' })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft > 120) return 'text-green-400'
    if (timeLeft > 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-4xl">❤️</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
            Love Addiction
          </h1>
          
          <p className="text-white/80 mb-6 text-lg">
            The most addictive couples game ever created! 💕
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <span className="text-xl">🏆</span>
              <span>Progressive Levels & Achievements</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <span className="text-xl">🔥</span>
              <span>Daily Streaks & Rewards</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <span className="text-xl">⚡</span>
              <span>Unlock Intimate Content</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg"
          >
            Start Love Addiction 🔥
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (gameState === 'ended') {
    const winner = playerStats.reduce((prev, current) => 
      (prev.totalPoints > current.totalPoints) ? prev : current
    )
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-2xl w-full border border-white/20"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
          >
            <span className="text-5xl">👑</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Game Complete!</h1>
          
          <div className="bg-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">🏆 Winner: {winner.name}</h2>
            <div className="text-6xl font-bold text-white mb-2">{winner.totalPoints}</div>
            <div className="text-white/70">Total Points</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-pink-400">{relationshipScore}%</div>
              <div className="text-white/70">Relationship Score</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{round}</div>
              <div className="text-white/70">Rounds Played</div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onGameEnd()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Play Again 💕
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Floating Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0, x: particle.x, y: particle.y }}
            animate={{ opacity: 0, scale: 1, y: particle.y - 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed w-4 h-4 rounded-full pointer-events-none z-50"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span className="font-bold">Achievement Unlocked: {showAchievement.name}!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Popup */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-3xl text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-4xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You reached Level {level}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-full p-3">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Love Addiction</h1>
                <p className="text-white/70">Round {round} of {maxRounds}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center space-x-1 text-white/70">
                <span className="text-lg">⏰</span>
                <span>Time Left</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(round / maxRounds) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {playerStats.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ x: index === 0 ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{player.name}</h3>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">🔥</span>
                  <span className="text-orange-400 font-bold">{player.currentStreak}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-pink-400">{player.totalPoints}</div>
              <div className="text-white/70 text-sm">Level {player.level}</div>
            </motion.div>
          ))}
        </div>

        {/* Challenge Card */}
        <motion.div
          key={currentChallenge}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-full ${challengeType === 'question' ? 'bg-blue-500' : 'bg-red-500'}`}>
              {challengeType === 'question' ? '❓' : '🔥'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white capitalize">{challengeType}</h2>
              <p className="text-white/70">Answer honestly and intimately</p>
            </div>
          </div>
          
          <div className="text-white text-lg leading-relaxed mb-6 p-4 bg-white/5 rounded-xl">
            {currentChallenge}
          </div>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={4}
          />
        </motion.div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer 💕
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={skipChallenge}
            className="bg-white/10 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Skip
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default LoveAddictionGame