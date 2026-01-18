import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SeductiveSecretsGame = ({ socket, roomId, players, onGameEnd, initialGameData, gameRoom }) => {
  const [gameState, setGameState] = useState(initialGameData ? 'playing' : 'waiting')
  const [currentSecret, setCurrentSecret] = useState(initialGameData?.currentSecret || '')
  const [secretType, setSecretType] = useState(initialGameData?.secretType || 'confession')
  const [intimacyLevel, setIntimacyLevel] = useState(initialGameData?.intimacyLevel || 1)
  const [round, setRound] = useState(initialGameData?.round || 1)
  const [maxRounds, setMaxRounds] = useState(initialGameData?.maxRounds || 8)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes per secret
  const [response, setResponse] = useState('')
  const [playerStats, setPlayerStats] = useState(initialGameData?.players || [])
  const [achievements, setAchievements] = useState([])
  const [showAchievement, setShowAchievement] = useState(null)
  const [seductionScore, setSeductionScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [dailyChallenge, setDailyChallenge] = useState(initialGameData?.dailyChallenge || null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [particles, setParticles] = useState([])
  const [unlockedContent, setUnlockedContent] = useState([])
  const [showUnlock, setShowUnlock] = useState(null)
  const [mood, setMood] = useState('playful') // playful, romantic, passionate, wild
  
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const secretTypes = {
    confession: { icon: '💭', color: 'from-purple-500 to-pink-500', title: 'Secret Confession' },
    fantasy: { icon: '🔥', color: 'from-red-500 to-orange-500', title: 'Hidden Fantasy' },
    desire: { icon: '💋', color: 'from-pink-500 to-red-500', title: 'Secret Desire' },
    memory: { icon: '✨', color: 'from-blue-500 to-purple-500', title: 'Intimate Memory' },
    dare: { icon: '⚡', color: 'from-yellow-500 to-red-500', title: 'Seductive Dare' }
  }

  const moodSettings = {
    playful: { bg: 'from-pink-400 to-purple-400', emoji: '😏' },
    romantic: { bg: 'from-red-400 to-pink-400', emoji: '😍' },
    passionate: { bg: 'from-orange-500 to-red-500', emoji: '🔥' },
    wild: { bg: 'from-purple-600 to-red-600', emoji: '😈' }
  }

  useEffect(() => {
    if (initialGameData && (initialGameData.currentSecret || initialGameData.gameType === 'seductive-secrets')) {
      console.log('Initializing Seductive Secrets with data:', initialGameData)
      setGameState('playing')
      setCurrentSecret(initialGameData.currentSecret || 'Loading secret...')
      setSecretType(initialGameData.secretType || 'confession')
      setIntimacyLevel(initialGameData.intimacyLevel || 1)
      setRound(initialGameData.round || 1)
      setMaxRounds(initialGameData.maxRounds || 8)
      setPlayerStats(initialGameData.players || [])
      setDailyChallenge(initialGameData.dailyChallenge)
      setMood(initialGameData.mood || 'playful')
      setTimeLeft(300)
      startTimeRef.current = Date.now()
      startTimer()
    }
  }, [initialGameData])

  useEffect(() => {
    if (!socket) return

    socket.on('seductive-secrets-started', (data) => {
      setGameState('playing')
      setCurrentSecret(data.currentSecret)
      setSecretType(data.secretType)
      setIntimacyLevel(data.intimacyLevel)
      setRound(data.round)
      setMaxRounds(data.maxRounds)
      setPlayerStats(data.players)
      setDailyChallenge(data.dailyChallenge)
      setMood(data.mood)
      setTimeLeft(300)
      startTimeRef.current = Date.now()
      startTimer()
    })

    socket.on('seductive-secrets-next-round', (data) => {
      setCurrentSecret(data.currentSecret)
      setSecretType(data.secretType)
      setIntimacyLevel(data.intimacyLevel)
      setRound(data.round)
      setPlayerStats(data.players)
      setMood(data.mood)
      setResponse('')
      setTimeLeft(300)
      startTimeRef.current = Date.now()
      startTimer()
      
      // Show content unlock if new level reached
      if (data.newContentUnlocked) {
        setShowUnlock(data.newContentUnlocked)
        setTimeout(() => setShowUnlock(null), 4000)
      }
    })

    socket.on('seductive-secrets-round-result', (data) => {
      setPlayerStats(data.players)
      
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
        
        if (update.streakBonus) {
          setStreak(update.currentStreak)
          createParticles()
        }
      })
    })

    socket.on('seductive-secrets-ended', (data) => {
      setGameState('ended')
      setSeductionScore(data.seductionScore)
      clearInterval(timerRef.current)
    })

    return () => {
      socket.off('seductive-secrets-started')
      socket.off('seductive-secrets-next-round')
      socket.off('seductive-secrets-round-result')
      socket.off('seductive-secrets-ended')
      clearInterval(timerRef.current)
    }
  }, [socket])

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, 300 - elapsed)
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        clearInterval(timerRef.current)
        if (response.trim()) {
          submitResponse()
        }
      }
    }, 1000)
  }

  const createParticles = () => {
    const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d96ff', '#ff4757', '#ff6348']
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 3000)
  }

  const submitResponse = () => {
    if (!response.trim()) return
    
    const timeSpent = Date.now() - startTimeRef.current
    socket.emit('submit-seductive-secrets-response', {
      roomId: roomId,
      response: response.trim(),
      timeSpent,
      intimacyLevel,
      secretType
    })
    
    clearInterval(timerRef.current)
    createParticles()
  }

  const skipSecret = () => {
    socket.emit('skip-seductive-secrets-challenge', { roomId: roomId })
    clearInterval(timerRef.current)
  }

  const startGame = (selectedMood = 'playful') => {
    setMood(selectedMood)
    socket.emit('start-seductive-secrets', { 
      roomId: roomId, 
      gameMode: 'progressive',
      mood: selectedMood
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft > 180) return 'text-green-400'
    if (timeLeft > 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getIntimacyLevelText = (level) => {
    const levels = {
      1: 'Flirty', 2: 'Playful', 3: 'Romantic', 4: 'Passionate', 
      5: 'Intimate', 6: 'Seductive', 7: 'Wild', 8: 'Forbidden'
    }
    return levels[level] || 'Unknown'
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-4xl">💋</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
            Seductive Secrets
          </h1>
          
          <p className="text-white/80 mb-6 text-lg">
            Unlock your deepest desires and wildest fantasies! 🔥
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <span className="text-xl">🔓</span>
              <span>Progressive Intimacy Levels</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <span className="text-xl">🔥</span>
              <span>Daily Seduction Streaks</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <span className="text-xl">💎</span>
              <span>Unlock Forbidden Content</span>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <p className="text-white/80 mb-3">Choose your mood:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(moodSettings).map(([moodKey, moodData]) => (
                <motion.button
                  key={moodKey}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(moodKey)}
                  className={`bg-gradient-to-r ${moodData.bg} text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg`}
                >
                  <span className="text-xl mr-2">{moodData.emoji}</span>
                  {moodKey.charAt(0).toUpperCase() + moodKey.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
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
          
          <h1 className="text-4xl font-bold text-white mb-4">Secrets Revealed!</h1>
          
          <div className="bg-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-pink-400 mb-4">🔥 Seduction Master: {winner.name}</h2>
            <div className="text-6xl font-bold text-white mb-2">{winner.totalPoints}</div>
            <div className="text-white/70">Seduction Points</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-pink-400">{seductionScore}%</div>
              <div className="text-white/70">Seduction Score</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{round}</div>
              <div className="text-white/70">Secrets Shared</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-400">{intimacyLevel}</div>
              <div className="text-white/70">Max Intimacy</div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onGameEnd()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Share More Secrets 💋
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${moodSettings[mood].bg} p-4`}>
      {/* Floating Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0, x: particle.x, y: particle.y }}
            animate={{ opacity: 0, scale: 1, y: particle.y - 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
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
              <span className="font-bold">Achievement: {showAchievement.name}!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Unlock Popup */}
      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-3xl text-center">
              <div className="text-6xl mb-4">🔓</div>
              <h2 className="text-4xl font-bold mb-2">CONTENT UNLOCKED!</h2>
              <p className="text-xl">{showUnlock.title}</p>
              <p className="text-sm opacity-80 mt-2">{showUnlock.description}</p>
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
              <div className={`bg-gradient-to-r ${secretTypes[secretType].color} rounded-full p-3`}>
                <span className="text-2xl">{secretTypes[secretType].icon}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Seductive Secrets</h1>
                <p className="text-white/70">Round {round} of {maxRounds} • {getIntimacyLevelText(intimacyLevel)} Level</p>
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
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <motion.div 
              className="bg-gradient-to-r from-pink-500 to-red-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(round / maxRounds) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Intimacy Level Indicator */}
          <div className="flex justify-between items-center text-sm text-white/70">
            <span>Intimacy Level: {intimacyLevel}/8</span>
            <span className="flex items-center space-x-1">
              <span>🔥</span>
              <span>{getIntimacyLevelText(intimacyLevel)}</span>
            </span>
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
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-orange-400 font-bold">{player.currentStreak}</span>
                  <span className="text-lg">💎</span>
                  <span className="text-purple-400 font-bold">{player.unlockedContent || 0}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-pink-400">{player.totalPoints}</div>
              <div className="text-white/70 text-sm">Level {player.level} • {player.intimacyRating || 0}% Seductive</div>
            </motion.div>
          ))}
        </div>

        {/* Secret Card */}
        <motion.div
          key={currentSecret}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-full bg-gradient-to-r ${secretTypes[secretType].color}`}>
              {secretTypes[secretType].icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{secretTypes[secretType].title}</h2>
              <p className="text-white/70">Level {intimacyLevel} • Be honest and seductive</p>
            </div>
          </div>
          
          <div className="text-white text-lg leading-relaxed mb-6 p-6 bg-white/5 rounded-xl border-l-4 border-pink-500">
            {currentSecret}
          </div>
          
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share your deepest thoughts... be seductive 💋"
            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={4}
          />
        </motion.div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitResponse}
            disabled={!response.trim()}
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reveal Secret 💋
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={skipSecret}
            className="bg-white/10 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Skip
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default SeductiveSecretsGame