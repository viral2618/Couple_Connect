'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import GameRenderer from './games/GameRenderer'

interface Player {
  id: string
  name: string
  socketId: string
}

interface GameRoom {
  id: string
  players: Player[]
  gameState: 'waiting' | 'playing' | 'finished'
  currentGame: 'menu' | 'truths' | 'wouldyou' | 'quickfire' | 'love-addiction' | 'seductive-secrets' | 'love-questions' | 'intimate-dares' | 'truth-or-dare'
  currentRound: number
  maxRounds: number
  scores: Record<string, number>
  hostId: string
  gameData?: any
  winner?: any
  isTie?: boolean
  playerScores?: any[]
  allPhotos?: any
}

interface CouplesGameProps {
  userId: string
  userName: string
}

export default function CouplesGame({ userId, userName }: CouplesGameProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomId, setRoomId] = useState('')
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null)
  const [gamePhase, setGamePhase] = useState<'setup' | 'waiting' | 'menu' | 'playing' | 'finished'>('setup')
  const [isHost, setIsHost] = useState(false)
  const [currentGameData, setCurrentGameData] = useState<any>(null)

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      : 'http://localhost:3000'
    
    console.log('[SOCKET] Connecting to:', socketUrl)
    console.log('[SOCKET] Environment:', process.env.NODE_ENV)
    console.log('[SOCKET] NEXT_PUBLIC_SOCKET_URL:', process.env.NEXT_PUBLIC_SOCKET_URL)
    console.log('[SOCKET] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    
    const newSocket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true
    })
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('[SOCKET] ✅ Connected to game server')
      console.log('[SOCKET] Socket ID:', newSocket.id)
      console.log('[SOCKET] Transport:', newSocket.io.engine.transport.name)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('[SOCKET] ❌ Disconnected from game server. Reason:', reason)
    })
    
    newSocket.on('connect_error', (error) => {
      console.error('[SOCKET] ❌ Connection error:', error.message)
      console.error('[SOCKET] Error details:', error)
    })

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[SOCKET] 🔄 Reconnection attempt ${attemptNumber}`)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`[SOCKET] ✅ Reconnected after ${attemptNumber} attempts`)
    })

    newSocket.on('room_created', (data) => {
      console.log('Room created:', data)
      setRoomId(data.roomCode)
      setGameRoom(data.room)
      setGamePhase('waiting')
      setIsHost(true)
    })

    newSocket.on('room_joined', (data) => {
      console.log('=== ROOM_JOINED EVENT ===', data)
      setRoomId(data.room.code || data.roomCode)
      setGameRoom(data.room)
      // Check if both players are already in the room
      if (data.room.players && data.room.players.length >= 2) {
        console.log('Both players present, going to menu')
        setGamePhase('menu')
      } else {
        setGamePhase('waiting')
      }
      setIsHost(false)
    })

    newSocket.on('room-update', (room: GameRoom) => {
      console.log('=== ROOM-UPDATE EVENT ===', room)
      console.log('Players count:', room.players?.length)
      console.log('Game state:', room.gameState)
      setGameRoom(room)
      if (room.players && room.players.length >= 2 && room.gameState === 'waiting') {
        console.log('Both players joined! Moving to menu phase')
        setGamePhase('menu')
      }
    })

    newSocket.on('game-started', (data) => {
      console.log('=== GAME-STARTED EVENT ===', data)
      setGameRoom(prev => {
        if (!prev) return null
        const updated: GameRoom = { 
          ...prev, 
          gameState: 'playing', 
          currentGame: data.gameType 
        }
        if (data.roomId && !updated.id) {
          updated.id = data.roomId
        }
        console.log('Updated gameRoom:', updated)
        return updated
      })
      
      console.log('Setting gamePhase to playing')
      setGamePhase('playing')
      
      if (data.question) {
        console.log('Setting currentGameData with question:', data.question)
        setCurrentGameData({
          question: data.question,
          round: data.currentRound || 1,
          maxRounds: 3,
          gameType: data.gameType || 'love-questions'
        })
      }
    })

    newSocket.on('game-data', (gameData) => {
      console.log('=== GAME-DATA EVENT ===', gameData)
      setCurrentGameData(gameData)
      // Ensure we're in playing phase when we get game data
      if (gameData.question) {
        console.log('Setting gamePhase to playing from game-data')
        setGamePhase('playing')
      }
    })

    newSocket.on('answer-submitted', (data) => {
      console.log('Answer submitted by player:', data)
      // Show notification that partner responded
    })

    newSocket.on('round-result', (data) => {
      console.log('Round result:', data)
      // Show answers from both players
      setCurrentGameData((prev: any) => ({ ...prev, ...data, showResults: true }))
    })

    newSocket.on('new-round', (data) => {
      console.log('=== NEW ROUND EVENT RECEIVED ===', data)
      console.log('Current gamePhase before update:', gamePhase)
      console.log('Current gameData before update:', currentGameData)
      setCurrentGameData({
        ...data,
        showResults: false
      })
      setGamePhase('playing')
      console.log('Updated to playing phase with new data')
    })

    newSocket.on('game-finished', (data) => {
      console.log('Game finished:', data)
      setGameRoom(prev => ({
        ...prev,
        ...data,
        gameState: 'finished'
      }))
      setGamePhase('finished')
    })

    newSocket.on('love-addiction-started', (gameStartData) => {
      console.log('Love Addiction game started:', gameStartData)
      setGameRoom(prev => {
        if (!prev) return null
        return {
          ...prev,
          gameState: 'playing',
          currentGame: 'love-addiction',
          id: gameStartData.roomId || prev.id
        }
      })
      setGamePhase('playing')
      setCurrentGameData({
        ...gameStartData,
        gameType: 'love-addiction'
      })
    })

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error)
      alert(typeof error === 'string' ? error : error.message || 'An error occurred')
      setGamePhase('setup')
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const createRoom = () => {
    console.log('[CREATE_ROOM] Button clicked')
    console.log('[CREATE_ROOM] userName:', userName)
    console.log('[CREATE_ROOM] Socket connected:', socket?.connected)
    console.log('[CREATE_ROOM] Socket ID:', socket?.id)
    
    if (socket && socket.connected) {
      socket.emit('create_room', {
        playerName: userName,
        gameType: 'couples'
      })
      console.log('[CREATE_ROOM] Event emitted successfully')
    } else {
      console.error('[CREATE_ROOM] Socket not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a Room Code')
      return
    }
    
    console.log('[JOIN_ROOM] Button clicked')
    console.log('[JOIN_ROOM] Room code:', roomId.trim())
    console.log('[JOIN_ROOM] userName:', userName)
    console.log('[JOIN_ROOM] Socket connected:', socket?.connected)
    console.log('[JOIN_ROOM] Socket ID:', socket?.id)
    
    if (socket && socket.connected) {
      socket.emit('join_room', {
        roomCode: roomId.trim(),
        playerName: userName
      })
      console.log('[JOIN_ROOM] Event emitted successfully')
    } else {
      console.error('[JOIN_ROOM] Socket not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  const startGame = (gameType: string) => {
    if (socket && gameRoom && isHost) {
      if (gameType === 'love-addiction') {
        socket.emit('start-love-addiction', {
          roomId: gameRoom.id,
          gameMode: 'progressive'
        })
      } else if (gameType === 'seductive-secrets') {
        socket.emit('start-seductive-secrets', {
          roomId: gameRoom.id,
          gameMode: 'progressive',
          mood: 'playful'
        })
      } else {
        socket.emit('start-couples-game', {
          roomId: gameRoom.id,
          gameType,
          rounds: 3
        })
      }
    }
  }

  if (gamePhase === 'setup') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4"
      >
        <div className="max-w-md mx-auto pt-20">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">💕</div>
            <h1 className="text-4xl font-bold text-gray-800">Couple's Challenge</h1>
            <p className="text-gray-600">Fun games to play with your partner!</p>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold text-pink-800 mb-3">👑 Host a Game</h3>
                <button
                  onClick={createRoom}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Create Room
                </button>
              </div>
              
              <div className="text-center text-gray-500">OR</div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold text-purple-800 mb-3">🚪 Join a Game</h3>
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-mono mb-3"
                />
                <button
                  onClick={joinRoom}
                  disabled={!roomId.trim()}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Join Room
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Connection Status:</p>
                <p className="text-sm font-mono">
                  {socket?.connected ? '✅ Connected' : '❌ Disconnected'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Username: {userName}</p>
                <p className="text-xs text-gray-500">Socket ID: {socket?.id || 'Not connected'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (gamePhase === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4"
      >
        <div className="max-w-md mx-auto pt-20">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isHost ? 'Waiting for Partner' : 'Joined Room'}
            </h2>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-gray-600 mb-2">
                Room Code: <span className="font-mono bg-gray-100 px-3 py-1 rounded text-lg font-bold">{roomId}</span>
              </p>
              {isHost ? (
                <p className="text-pink-600 font-medium">👑 Share this code with your partner!</p>
              ) : (
                <p className="text-purple-600 font-medium">🚪 Waiting for host to start...</p>
              )}
            </div>
            
            {gameRoom && (
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-green-800 mb-2">Players:</h3>
                {gameRoom.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 text-green-700">
                    <span className="text-green-500">✓</span>
                    {player.name} 
                    {player.id === userId && ' (You)'}
                    {player.id === gameRoom.hostId && ' 👑'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (gamePhase === 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 p-4"
      >
        <div className="w-full max-w-7xl mx-auto pt-8 px-4">
          <div className="text-center space-y-8">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Intimate Games</h2>
            <p className="text-gray-600">Spice up your relationship with these exciting games!</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {isHost ? (
                <>
                  {/* Compact Vertical Game Cards */}
                  <motion.button
                    onClick={() => startGame('love-questions')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        💝
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Deep Love Questions</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Discover each other's hearts and dreams</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => startGame('intimate-dares')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        🌹
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Romantic Dares</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Sweet and loving challenges to bring you closer</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-rose-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => startGame('truth-or-dare')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        🔥
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Intimate Truth or Dare</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Explore your desires and deepen connection</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => startGame('love-questions')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-red-400 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        💋
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Fantasy Sharing</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Share your secret desires and fantasies</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => startGame('love-addiction')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        💕
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Love Addiction</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">The most addictive couples game with levels & achievements</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => startGame('seductive-secrets')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        💋
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Seductive Secrets</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Progressive intimacy with 8 levels of seduction</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Guest View - Disabled Vertical Cards */}
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-60">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-xl mx-auto">
                        💝
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-500 mb-2">Deep Love Questions</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Discover each other's hearts</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-60">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-xl mx-auto">
                        🌹
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-500 mb-2">Romantic Dares</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Sweet loving challenges</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-60">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-xl mx-auto">
                        💕
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-500 mb-2">Love Addiction</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Addictive couples game</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isHost && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                <p className="text-pink-700 text-sm font-medium text-center">
                  ⏳ Waiting for {gameRoom?.players.find(p => p.id === gameRoom.hostId)?.name} to choose a game...
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (gamePhase === 'playing') {
    console.log('=== RENDERING PLAYING PHASE ===')
    console.log('gameRoom:', gameRoom)
    console.log('currentGameData:', currentGameData)
    console.log('Has question:', !!currentGameData?.question)
    console.log('Has currentChallenge:', !!currentGameData?.currentChallenge)
    
    if (!gameRoom) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 flex items-center justify-center">
          <div className="text-center bg-white rounded-xl p-8 shadow-xl">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-800 font-semibold mb-2">Waiting for game room...</p>
            <p className="text-sm text-gray-500 mt-2">Room: No</p>
            <p className="text-sm text-gray-500">Data: {currentGameData ? 'Yes' : 'No'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    
    if (!currentGameData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 flex items-center justify-center">
          <div className="text-center bg-white rounded-xl p-8 shadow-xl">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-800 font-semibold mb-2">Loading game data...</p>
            <p className="text-sm text-gray-500">Room ID: {gameRoom.id}</p>
            <p className="text-sm text-gray-500">Players: {gameRoom.players?.length || 0}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    
    if (!currentGameData.question && !currentGameData.currentChallenge && !currentGameData.currentSecret) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 flex items-center justify-center">
          <div className="text-center bg-white rounded-xl p-8 shadow-xl">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-800 font-semibold mb-2">Waiting for question...</p>
            <p className="text-sm text-gray-500">Game Type: {currentGameData.gameType}</p>
            <p className="text-sm text-gray-500">Round: {currentGameData.round}</p>
            <div className="mt-4 text-xs text-left bg-gray-100 p-3 rounded max-w-md">
              <p className="font-mono">Debug Info:</p>
              <pre className="text-xs overflow-auto">{JSON.stringify(currentGameData, null, 2)}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <GameRenderer 
        gameRoom={gameRoom}
        currentGameData={currentGameData}
        socket={socket}
        userId={userId}
        userName={userName}
      />
    )
  }

  if (gamePhase === 'finished') {
    const winner = gameRoom?.winner
    const isTie = gameRoom?.isTie
    const playerScores = gameRoom?.playerScores || []
    const allPhotos = gameRoom?.allPhotos || {}
    const isWinner = winner?.id === userId

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4"
      >
        <div className="max-w-4xl mx-auto pt-10">
          <div className="text-center space-y-6">
            {/* Winner Announcement */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="text-6xl mb-4">{isTie ? '🤝' : '🏆'}</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                {isTie ? "It's a Tie!" : `${winner?.name} Wins!`}
              </h2>
              {!isTie && isWinner && (
                <p className="text-xl text-pink-600 font-semibold">🎉 Congratulations!</p>
              )}
            </motion.div>
            
            {/* Final Scores */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Final Scores</h3>
              <div className="space-y-3">
                {playerScores.map((player: any, index: number) => (
                  <motion.div
                    key={player.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`flex justify-between items-center p-4 rounded-xl ${
                      !isTie && index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🎯'}</span>
                      <div>
                        <span className="font-bold text-gray-800 text-lg">
                          {player.name} {player.id === userId && '(You)'}
                        </span>
                      </div>
                    </div>
                    <span className="text-3xl font-bold text-pink-500">
                      {player.score}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            {Object.keys(allPhotos).length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-xl"
              >
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">📸 Photo Gallery</h3>
                <div className="space-y-6">
                  {playerScores.map((player: any) => {
                    const photos = allPhotos[player.id] || []
                    if (photos.length === 0) return null
                    
                    return (
                      <div key={player.id} className="space-y-3">
                        <h4 className="font-semibold text-pink-700 text-lg">{player.name}'s Dares</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {photos.map((photoData: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6 + idx * 0.1 }}
                              className="relative group"
                            >
                              <img
                                src={photoData.photo}
                                alt={`Round ${photoData.round}`}
                                className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 text-white text-center p-2">
                                  <p className="text-xs font-semibold">Round {photoData.round}</p>
                                  <p className="text-xs mt-1">+{photoData.points} pts</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Play Again Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => {
                setGamePhase('menu')
                setCurrentGameData(null)
              }}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-4 rounded-xl font-semibold transition-all shadow-lg text-lg"
            >
              🔄 Play Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}



