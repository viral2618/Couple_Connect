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

    socket.on('gameStateUpdate', (data: any) => {
      setGameState(data)
      setPhase(data.phase || 'waiting')
      setCurrentChallenge(data.currentChallenge || 0)
      setIsMyTurn(data.currentPlayer === userId)
      if (data.confessions) {
        setPartnerConfession(data.confessions[Object.keys(data.confessions).find(id => id !== userId) || ''] || '')
      }
    })

    socket.on('partnerJoined', (data: any) => {
      setPartnerReady(true)
      setPartnerName(data.partnerName)
    })

    socket.on('partnerLeft', () => {
      setPartnerReady(false)
    })

    return () => {
      socket.off('gameStateUpdate')
      socket.off('partnerJoined')
      socket.off('partnerLeft')
    }
  }, [socket, userId])

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
          </motion.div>
          
          {partnerReady && (
            <motion.button
              onClick={() => emitGameAction('startGame')}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-xl"
              whileHover={{ scale: 1.05 }}
            >
              🔥 Start Our Journey Together
            </motion.button>
          )}
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

          <div className="space-y-4">
            <textarea
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              placeholder="Pour your heart out here..."
              className="w-full px-4 py-3 bg-black/50 border border-pink-400/50 rounded-xl focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/70 resize-none"
              rows={4}
            />
            <motion.button
              onClick={() => {
                setIntimacyScore(prev => prev + 20)
                setPhase('mirror')
              }}
              disabled={!confession.trim()}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:bg-gray-600 text-white py-4 rounded-xl font-bold text-lg"
              whileHover={{ scale: 1.02 }}
            >
              💕 Share My Truth
            </motion.button>
          </div>
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
            onClick={() => {
              setIntimacyScore(prev => prev + 25)
              setPhase('touch')
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg"
            whileHover={{ scale: 1.02 }}
          >
            ✨ Souls Connected
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
            <p className="text-pink-200">Feel the electricity between you...</p>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-red-500/50 mb-6"
            animate={{ 
              boxShadow: [
                '0 0 30px rgba(239,68,68,0.4)', 
                '0 0 60px rgba(236,72,153,0.8)', 
                '0 0 30px rgba(239,68,68,0.4)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-white text-xl font-medium leading-relaxed">
                {touchChallenges[currentChallenge % touchChallenges.length]}
              </p>
              <div className="bg-red-900/50 rounded-lg p-4 mt-4">
                <p className="text-pink-200 text-sm mb-2">Intimacy Level: {intimacyScore}%</p>
                <div className="w-full bg-red-800 rounded-full h-3">
                  <motion.div 
                    className="bg-gradient-to-r from-pink-500 to-red-400 h-3 rounded-full"
                    animate={{ width: `${intimacyScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => {
              setIntimacyScore(prev => prev + 30)
              setPhase('whisper')
            }}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg"
            whileHover={{ scale: 1.02 }}
          >
            🔥 Electric Connection
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (phase === 'whisper') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-red-900 p-4"
      >
        <div className="max-w-md mx-auto pt-10">
          <motion.div 
            className="text-center mb-6"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-6xl mb-4">👂💋</div>
            <h2 className="text-3xl font-bold text-white mb-2">Level 4: Whispered Secrets</h2>
            <p className="text-pink-200">Share your deepest desires...</p>
          </motion.div>

          <motion.div 
            className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/70 mb-6"
            animate={{ 
              background: [
                'rgba(0,0,0,0.5)', 
                'rgba(139,69,19,0.3)', 
                'rgba(0,0,0,0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-center space-y-4">
              <div className="text-5xl mb-3">🌙</div>
              <p className="text-white text-lg font-medium mb-4">
                Whisper in your partner's ear:
              </p>
              <div className="bg-purple-900/60 rounded-lg p-4">
                <p className="text-pink-200 text-xl italic leading-relaxed">
                  "I've been thinking about you all day... I want to tell you exactly what I've been imagining..."
                </p>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => {
              setIntimacyScore(100)
              setPhase('climax')
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg"
            whileHover={{ scale: 1.02 }}
          >
            💫 Secrets Shared
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-black via-red-900 to-purple-900 p-4"
    >
      <div className="max-w-md mx-auto pt-8">
        <motion.div 
          className="text-center mb-6"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 360],
            y: [0, -20, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="text-8xl mb-4">💥🔥💫</div>
          <h2 className="text-4xl font-bold text-white mb-2">Level 5: Ultimate Union</h2>
          <p className="text-pink-200 text-lg">Your souls are now connected...</p>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-red-900/80 to-purple-900/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-pink-400/70 mb-6"
          animate={{ 
            boxShadow: [
              '0 0 50px rgba(236,72,153,0.6)', 
              '0 0 100px rgba(239,68,68,0.9)', 
              '0 0 50px rgba(236,72,153,0.6)'
            ],
            borderColor: [
              'rgba(236,72,153,0.7)', 
              'rgba(239,68,68,1)', 
              'rgba(236,72,153,0.7)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🖤💕🖤</div>
            <h3 className="text-2xl font-bold text-white mb-4">Intimacy Level: {intimacyScore}%</h3>
            
            <div className="space-y-4">
              <motion.button 
                className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-800 hover:to-pink-800 text-white py-4 rounded-xl font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                onClick={() => setPhase('intro')}
              >
                🔥 Complete Union
              </motion.button>
              
              <motion.button 
                className="w-full bg-gradient-to-r from-purple-700 to-red-700 hover:from-purple-800 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                onClick={() => setPhase('intro')}
              >
                💫 Transcend Together
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}