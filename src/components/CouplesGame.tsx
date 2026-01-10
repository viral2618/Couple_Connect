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
  currentGame: 'menu' | 'truths' | 'wouldyou' | 'quickfire'
  currentRound: number
  maxRounds: number
  scores: Record<string, number>
  hostId: string
  gameData?: any
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
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to game server with ID:', newSocket.id)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from game server')
    })

    newSocket.on('room_created', (data) => {
      console.log('Room created:', data)
      setRoomId(data.roomCode)
      setGameRoom(data.room)
      setGamePhase('waiting')
      setIsHost(true)
    })

    newSocket.on('room_joined', (data) => {
      console.log('Room joined:', data)
      setRoomId(data.room.code || data.roomCode)
      setGameRoom(data.room)
      setGamePhase('waiting')
      setIsHost(false)
    })

    newSocket.on('room-update', (room: GameRoom) => {
      console.log('Room updated:', room)
      setGameRoom(room)
      if (room.players.length >= 2 && room.gameState === 'waiting') {
        setGamePhase('menu')
      }
    })

    newSocket.on('game-started', (data) => {
      console.log('Game started:', data)
      setGameRoom(data.room || data)
      setGamePhase('playing')
      // Set initial game data from game-started event
      if (data.question) {
        setCurrentGameData({
          question: data.question,
          round: data.currentRound || 1,
          maxRounds: 3,
          gameType: data.gameType || 'love-questions'
        })
      }
    })

    newSocket.on('game-data', (gameData) => {
      console.log('Game data received:', gameData)
      setCurrentGameData(gameData)
      // Ensure we're in playing phase when we get game data
      if (gameData.question) {
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
      setCurrentGameData(prev => ({ ...prev, ...data, showResults: true }))
    })

    newSocket.on('new-round', (data) => {
      console.log('New round started:', data)
      setCurrentGameData({
        ...data,
        showResults: false
      })
      setGamePhase('playing')
    })

    newSocket.on('game-finished', (room) => {
      console.log('Game finished:', room)
      setGameRoom(room)
      setGamePhase('finished')
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
    console.log('Creating room with userName:', userName)
    
    if (socket && socket.connected) {
      socket.emit('create_room', {
        playerName: userName,
        gameType: 'couples'
      })
      console.log('Emitted create_room event')
    } else {
      console.error('Socket not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a Room Code')
      return
    }
    
    console.log('Joining room with code:', roomId.trim(), 'userName:', userName)
    
    if (socket && socket.connected) {
      socket.emit('join_room', {
        roomCode: roomId.trim(),
        playerName: userName
      })
      console.log('Emitted join_room event')
    } else {
      console.error('Socket not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  const startGame = (gameType: string) => {
    if (socket && gameRoom && isHost) {
      socket.emit('start-couples-game', {
        roomId: gameRoom.id,
        gameType,
        rounds: 3
      })
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
                    onClick={() => startGame('desire-decoder')}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        🔐
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Desire Decoder</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Decode scrambled fantasies with yes/no questions</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-xl mx-auto shadow-md">
                        😈
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Seduction Challenge</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">Playful and sensual dares to ignite spark</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors mx-auto">
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    console.log('Rendering game with data:', currentGameData)
    
    if (!currentGameData || !currentGameData.question) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading game...</p>
            <p className="text-sm text-gray-500 mt-2">Game Data: {JSON.stringify(currentGameData)}</p>
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
    const winner = gameRoom?.players.reduce((prev, current) => 
      (gameRoom.scores[prev.id] || 0) > (gameRoom.scores[current.id] || 0) ? prev : current
    )
    const isWinner = winner?.id === userId
    const isTie = gameRoom?.players.every(p => gameRoom.scores[p.id] === gameRoom.scores[winner?.id || ''])

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4"
      >
        <div className="max-w-md mx-auto pt-20">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800">Game Complete!</h2>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Final Scores</h3>
              <div className="space-y-3">
                {gameRoom?.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      !isTie && player.id === winner?.id 
                        ? 'bg-yellow-100 border-2 border-yellow-400' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-gray-800">
                      {!isTie && player.id === winner?.id && '👑 '}
                      {player.name} {player.id === userId && '(You)'}
                    </span>
                    <span className="text-2xl font-bold text-pink-500">
                      {gameRoom.scores[player.id] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isTie ? (
              <p className="text-lg text-gray-600">🤝 It's a tie! You're both winners!</p>
            ) : isWinner ? (
              <p className="text-lg text-gray-600">🎉 Congratulations! You won!</p>
            ) : (
              <p className="text-lg text-gray-600">😊 Good game! {winner?.name} wins!</p>
            )}

            <button
              onClick={() => {
                setGamePhase('menu')
                setCurrentGameData(null)
              }}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}



