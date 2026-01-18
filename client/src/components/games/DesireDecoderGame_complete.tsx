'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface DesireDecoderGameProps {
  gameRoom: any
  gameData: any
  socket: any
  userId: string
}

export default function DesireDecoderGame({ gameRoom, gameData, socket, userId }: DesireDecoderGameProps) {
  const [phase, setPhase] = useState<'waiting' | 'intro' | 'confession' | 'mirror' | 'touch' | 'whisper' | 'climax'>('waiting')
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [intimacyScore, setIntimacyScore] = useState(0)
  const [pulseEffect, setPulseEffect] = useState(false)
  const [confession, setConfession] = useState('')
  const [partnerConfession, setPartnerConfession] = useState('')
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [partnerReady, setPartnerReady] = useState(false)
  const [gameState, setGameState] = useState<any>({})
  const [partnerName, setPartnerName] = useState('')

  useEffect(() => {
    const pulse = setInterval(() => setPulseEffect(prev => !prev), 800)
    return () => clearInterval(pulse)
  }, [])

  useEffect(() => {
    if (!socket) return

    // Check initial game state and room data
    console.log('Game initialization:', { gameRoom, gameData, userId })
    
    if (gameRoom) {
      // Try different possible structures for players
      const players = gameRoom.players || gameRoom.users || gameRoom.members || []
      console.log('Players found:', players)
      
      if (players.length >= 2) {
        const partner = players.find((p: any) => (p.id || p.userId || p._id) !== userId)
        console.log('Partner found:', partner)
        
        if (partner) {
          setPartnerReady(true)
          setPartnerName(partner.name || partner.username || 'Partner')
        }
      }
    }
    
    if (gameData?.phase) {
      setPhase(gameData.phase)
      setCurrentChallenge(gameData.currentChallenge || 0)
      setIsMyTurn(gameData.currentPlayer === userId)
    }

    socket.on('gameStateUpdate', (data: any) => {
      console.log('Game state update:', data)
      setGameState(data)
      setPhase(data.phase || 'waiting')
      setCurrentChallenge(data.currentChallenge || 0)
      setIsMyTurn(data.currentPlayer === userId)
      
      // Check for partner in updated data
      if (data.players && data.players.length >= 2) {
        const partner = data.players.find((p: any) => (p.id || p.userId || p._id) !== userId)
        if (partner && !partnerReady) {
          setPartnerReady(true)
          setPartnerName(partner.name || partner.username || 'Partner')
        }
      }
      
      if (data.confessions) {
        setPartnerConfession(data.confessions[Object.keys(data.confessions).find(id => id !== userId) || ''] || '')
      }
    })

    socket.on('partnerJoined', (data: any) => {
      setPartnerReady(true)
      setPartnerName(data.partnerName || 'Partner')
    })

    socket.on('partnerLeft', () => {
      setPartnerReady(false)
    })

    return () => {
      socket.off('gameStateUpdate')
      socket.off('partnerJoined')
      socket.off('partnerLeft')
    }
  }, [socket, userId, gameRoom, gameData])

  const emitGameAction = (action: string, data: any = {}) => {
    socket?.emit('gameAction', {
      roomId: gameRoom.id,
      action,
      data: { ...data, userId }
    })
  }

  const confessionPrompts = [
    "What's the one thing about me that drives you absolutely wild?",
    "Describe the moment you knew you wanted me completely...",
    "What's your most forbidden fantasy involving us?",
    "Tell me exactly how you want me to touch you...",
    "What would you do if we were alone right now?"
  ]

  const mirrorChallenges = [
    "Look into each other's eyes for 60 seconds without breaking contact",
    "Breathe together - match your partner's breathing rhythm",
    "Mirror each other's movements in slow motion",
    "Touch your partner's face while they close their eyes",
    "Whisper 'I want you' while staring into their soul"
  ]

  const touchChallenges = [
    "Trace your partner's lips with your fingertip",
    "Run your hands through their hair slowly",
    "Kiss their neck while they tell you how it feels",
    "Hold their hands and describe what you want to do",
    "Touch their heart and tell them your deepest desire"
  ]

  if (phase === 'waiting') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-black via-red-900 to-purple-900 p-4"
      >
        <div className="max-w-md mx-auto pt-20">
          <motion.div 
            className="text-center mb-8"
            animate={{ scale: pulseEffect ? 1.1 : 1 }}
          >
            <div className="text-8xl mb-6">💕⏳</div>
            <h1 className="text-4xl font-bold text-white mb-4">Waiting for Partner</h1>
            <p className="text-pink-200 text-lg">
              {partnerReady ? 'Partner connected! Ready to begin?' : 'Waiting for your partner to join...'}
            </p>
            
            {/* Debug info */}
            <div className="mt-4 text-xs text-gray-400 space-y-1 bg-black/30 p-3 rounded">
              <p>Players in room: {gameRoom?.players?.length || gameRoom?.users?.length || gameRoom?.members?.length || 0}</p>
              <p>Partner ready: {partnerReady ? 'Yes' : 'No'}</p>
              <p>Game phase: {phase}</p>
              <p>Partner name: {partnerName || 'None'}</p>
              <p>User ID: {userId}</p>
              <p>Room ID: {gameRoom?.id || 'None'}</p>
              <p>Socket connected: {socket ? 'Yes' : 'No'}</p>
            </div>
          </motion.div>
          
          {partnerReady && (
            <motion.button
              onClick={() => emitGameAction('startGame')}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-xl mb-4"
              whileHover={{ scale: 1.05 }}
            >
              🔥 Start Our Journey Together
            </motion.button>
          )}
          
          {/* Manual override for testing */}
          <motion.button
            onClick={() => {
              setPartnerReady(true)
              setPartnerName('Test Partner')
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl text-sm"
          >
            🔧 Force Partner Ready (Test)
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (phase === 'intro') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-black via-red-900 to-purple-900 p-4"
      >
        <div className="max-w-md mx-auto pt-16">
          <motion.div 
            className="text-center mb-8"
            animate={{ scale: pulseEffect ? 1.1 : 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-8xl mb-6">🔥💫🖤</div>
            <h1 className="text-4xl font-bold text-white mb-4">Soul Connection</h1>
            <p className="text-pink-200 text-lg leading-relaxed">
              A journey through 5 levels of intimacy that will bind your souls together...
            </p>
          </motion.div>

          <motion.div 
            className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-red-500/50 mb-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center space-y-4">
              <div className="text-3xl">⚡</div>
              <h3 className="text-xl font-bold text-white">The 5 Levels:</h3>
              <div className="space-y-2 text-pink-200">
                <p>🗣️ Level 1: Confession</p>
                <p>👁️ Level 2: Soul Mirror</p>
                <p>🤲 Level 3: Sacred Touch</p>
                <p>👂 Level 4: Whispered Secrets</p>
                <p>💥 Level 5: Ultimate Union</p>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => emitGameAction('nextPhase', { phase: 'confession' })}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔥 Begin Our Journey
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (phase === 'confession') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black p-4"
      >
        <div className="max-w-md mx-auto pt-10">
          <motion.div 
            className="text-center mb-6"
            animate={{ scale: pulseEffect ? 1.05 : 1 }}
          >
            <div className="text-6xl mb-4">🗣️💕</div>
            <h2 className="text-3xl font-bold text-white mb-2">Level 1: Confession</h2>
            <p className="text-pink-200">{isMyTurn ? 'Your turn to confess...' : `Waiting for ${partnerName}'s confession...`}</p>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-pink-500/50 mb-6"
            animate={{ 
              boxShadow: ['0 0 20px rgba(255,20,147,0.3)', '0 0 40px rgba(255,20,147,0.7)', '0 0 20px rgba(255,20,147,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center mb-4">
              <div className="text-3xl mb-3">💫</div>
              <p className="text-white text-lg font-medium leading-relaxed">
                {confessionPrompts[currentChallenge]}
              </p>
            </div>
          </motion.div>

          {isMyTurn ? (
            <div className="space-y-4">
              <textarea
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                placeholder="Pour your heart out here..."
                className="w-full px-4 py-3 bg-black/50 border border-pink-400/50 rounded-xl focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/70 resize-none"
                rows={4}
              />
              <motion.button
                onClick={() => emitGameAction('submitConfession', { confession })}
                disabled={!confession.trim()}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:bg-gray-600 text-white py-4 rounded-xl font-bold text-lg"
                whileHover={{ scale: 1.02 }}
              >
                💕 Share My Truth
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerConfession ? (
                <div className="bg-pink-900/30 border border-pink-500/50 rounded-xl p-4">
                  <p className="text-pink-100 text-lg italic">"{partnerConfession}"</p>
                  <p className="text-pink-300 text-sm mt-2">- {partnerName}</p>
                  <motion.button
                    onClick={() => emitGameAction('reactToConfession', { reaction: 'love' })}
                    className="w-full mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
                    whileHover={{ scale: 1.02 }}
                  >
                    💖 My Heart is Yours
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⏳💕</div>
                  <p className="text-pink-200">Waiting for {partnerName} to share their truth...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (phase === 'mirror') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4"
      >
        <div className="max-w-md mx-auto pt-10">
          <motion.div 
            className="text-center mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-6xl mb-4">👁️✨</div>
            <h2 className="text-3xl font-bold text-white mb-2">Level 2: Soul Mirror</h2>
            <p className="text-pink-200">Connect beyond words...</p>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/50 mb-6"
            animate={{ 
              borderColor: ['rgba(168,85,247,0.5)', 'rgba(236,72,153,0.8)', 'rgba(168,85,247,0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl mb-3">🔮</div>
              <p className="text-white text-xl font-medium leading-relaxed">
                {mirrorChallenges[currentChallenge % mirrorChallenges.length]}
              </p>
              <div className="bg-purple-900/50 rounded-lg p-3 mt-4">
                <p className="text-pink-200 text-sm">Timer: 60 seconds</p>
                <div className="w-full bg-purple-800 rounded-full h-2 mt-2">
                  <motion.div 
                    className="bg-pink-500 h-2 rounded-full"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 60, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => emitGameAction('completeChallenge', { phase: 'mirror' })}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg"
            whileHover={{ scale: 1.02 }}
          >
            ✨ Challenge Complete
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (phase === 'touch') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 p-4"
      >
        <div className="max-w-md mx-auto pt-10">
          <motion.div 
            className="text-center mb-6"
            animate={{ 
              scale: pulseEffect ? 1.15 : 1,
              y: pulseEffect ? -5 : 0
            }}
          >
            <div className="text-6xl mb-4">🤲💫</div>
            <h2 className="text-3xl font-bold text-white mb-2">Level 3: Sacred Touch</h2>
            <p className="text-pink-200">Connect through gentle touch...</p>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-red-500/50 mb-6"
            animate={{ 
              borderColor: ['rgba(239,68,68,0.5)', 'rgba(236,72,153,0.8)', 'rgba(239,68,68,0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl mb-3">💫</div>
              <p className="text-white text-xl font-medium leading-relaxed">
                {touchChallenges[currentChallenge % touchChallenges.length]}
              </p>
              <div className="bg-red-900/50 rounded-lg p-3 mt-4">
                <p className="text-pink-200 text-sm">Take your time... feel the connection</p>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => emitGameAction('completeChallenge', { phase: 'touch' })}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg"
            whileHover={{ scale: 1.02 }}
          >
            🔥 Hearts United
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-purple-900 p-4">
      <div className="max-w-md mx-auto pt-20 text-center">
        <div className="text-6xl mb-4">💕✨</div>
        <h2 className="text-3xl font-bold text-white mb-4">Game Complete!</h2>
        <p className="text-pink-200 text-lg">Your souls are now forever connected...</p>
      </div>
    </div>
  )
}