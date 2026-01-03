'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'

interface Player {
  id: string
  name: string
  socketId: string
}

interface GameRoom {
  players: Player[]
  gameState: 'waiting' | 'playing' | 'guessing' | 'finished'
  currentRound: number
  currentPlayer: number
  statements: Record<string, { statements: string[], lieIndex: number }>
  scores: Record<string, number>
  hostId: string
}

interface RealTimeTwoTruthsOneLieProps {
  userId: string
  userName: string
}

export default function RealTimeTwoTruthsOneLie({ userId, userName }: RealTimeTwoTruthsOneLieProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomId, setRoomId] = useState('')
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null)
  const [gamePhase, setGamePhase] = useState<'setup' | 'waiting' | 'input' | 'guess' | 'result' | 'finished'>('setup')
  const [isHost, setIsHost] = useState(false)
  const [currentStatements, setCurrentStatements] = useState<string[]>(['', '', ''])
  const [selectedLie, setSelectedLie] = useState<number | null>(null)
  const [opponentStatements, setOpponentStatements] = useState<string[]>([])
  const [guess, setGuess] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [inputTimer, setInputTimer] = useState(60) // 1 minute for input
  const [guessTimer, setGuessTimer] = useState(120) // 2 minutes for guessing
  const [timerActive, setTimerActive] = useState(false)
  const [bothPlayersGuessed, setBothPlayersGuessed] = useState(false)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected')
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    newSocket.on('error', (error) => {
      console.log('Socket error:', error)
      if (error === 'Room not found') {
        alert('Room not found! Please check the Room ID.')
        setGamePhase('setup')
      }
    })

    newSocket.on('room-created', (room: GameRoom) => {
      console.log('Room created', room)
      setGameRoom(room)
      setGamePhase('waiting')
    })

    newSocket.on('room-update', (room: GameRoom) => {
      console.log('Received room-update', room)
      setGameRoom(room)
      if (room.players.length >= 1) {
        setGamePhase('waiting')
      }
    })

    newSocket.on('game-start', (room: GameRoom) => {
      setGameRoom(room)
      setGamePhase('input')
      setInputTimer(60)
      setTimerActive(true)
    })

    newSocket.on('statements-submitted', (data) => {
      if (data.ready) {
        setGamePhase('guess')
      }
    })

    newSocket.on('guessing-phase', (room: GameRoom) => {
      setGameRoom(room)
      const opponent = room.players.find(p => p.id !== userId)
      if (opponent && room.statements[opponent.id]) {
        setOpponentStatements(room.statements[opponent.id].statements)
      }
      setGamePhase('guess')
      setGuessTimer(120)
      setTimerActive(true)
      setBothPlayersGuessed(false)
    })

    newSocket.on('guess-result', (data) => {
      // Handle results for current player
      const myResult = data.results?.[userId]
      setResultData({
        isCorrect: myResult?.isCorrect || false,
        lieIndex: myResult?.lieIndex || 0,
        scores: data.scores || {}
      })
      setShowResult(true)
      setGamePhase('result')
      setTimerActive(false)
    })

    newSocket.on('next-round', (room: GameRoom) => {
      setGameRoom(room)
      setCurrentStatements(['', '', ''])
      setSelectedLie(null)
      setOpponentStatements([])
      setGuess(null)
      setShowResult(false)
      setResultData(null)
      setGamePhase('input')
      setInputTimer(60)
      setTimerActive(true)
      setBothPlayersGuessed(false)
    })

    newSocket.on('game-finished', (data) => {
      setResultData(data)
      setGamePhase('finished')
    })

    newSocket.on('game-restart', (room: GameRoom) => {
      setGameRoom(room)
      setCurrentStatements(['', '', ''])
      setSelectedLie(null)
      setOpponentStatements([])
      setGuess(null)
      setShowResult(false)
      setResultData(null)
      setGamePhase('input')
      setInputTimer(60)
      setTimerActive(true)
      setBothPlayersGuessed(false)
    })

    newSocket.on('player-disconnected', (room: GameRoom) => {
      setGameRoom(room)
      if (room.players.length < 2) {
        setGamePhase('waiting')
      }
    })

    newSocket.on('player-guessed', (data) => {
      if (data.bothPlayersGuessed) {
        setBothPlayersGuessed(true)
        setTimerActive(false)
      }
    })

    newSocket.on('timer-expired', (data) => {
      if (data.phase === 'input') {
        // Auto-submit current statements if timer expires
        if (currentStatements.some(s => s.trim()) && selectedLie !== null) {
          submitStatements()
        }
      } else if (data.phase === 'guess') {
        // Auto-guess random if timer expires
        if (guess === null && opponentStatements.length > 0) {
          const randomGuess = Math.floor(Math.random() * opponentStatements.length)
          makeGuess(randomGuess)
        }
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [userId])

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerActive) {
      interval = setInterval(() => {
        if (gamePhase === 'input') {
          setInputTimer(prev => {
            if (prev <= 1) {
              setTimerActive(false)
              return 0
            }
            return prev - 1
          })
        } else if (gamePhase === 'guess') {
          setGuessTimer(prev => {
            if (prev <= 1) {
              setTimerActive(false)
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, gamePhase])

  const createRoom = async () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(newRoomId)
    setIsHost(true)
    
    if (socket) {
      socket.emit('create-game-room', {
        roomId: newRoomId,
        playerId: userId,
        playerName: userName
      })
    } else {
      // Fallback API call if socket is not available
      try {
        const response = await fetch('/api/game-rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            roomId: newRoomId,
            playerId: userId,
            playerName: userName
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setGameRoom({
            players: data.room.players,
            gameState: data.room.gameState,
            currentRound: data.room.currentRound,
            currentPlayer: 0,
            statements: data.room.statements,
            scores: data.room.scores,
            hostId: data.room.hostId
          })
          setGamePhase('waiting')
        }
      } catch (error) {
        console.error('Failed to create room:', error)
        alert('Failed to create room. Please try again.')
      }
    }
  }

  const joinRoom = async () => {
    console.log('Join button clicked', { socket: !!socket, roomId: roomId.trim() })
    if (!roomId.trim()) {
      alert('Please enter a Room ID')
      return
    }
    
    setIsHost(false)
    
    if (socket) {
      socket.emit('join-game-room', {
        roomId: roomId.trim(),
        playerId: userId,
        playerName: userName
      })
    } else {
      // Fallback API call if socket is not available
      try {
        const response = await fetch('/api/game-rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            roomId: roomId.trim(),
            playerId: userId,
            playerName: userName
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setGameRoom({
            players: data.room.players,
            gameState: data.room.gameState,
            currentRound: data.room.currentRound,
            currentPlayer: 0,
            statements: data.room.statements,
            scores: data.room.scores,
            hostId: data.room.hostId
          })
          setGamePhase('waiting')
        } else {
          alert(data.error || 'Room not found! Please check the Room ID.')
        }
      } catch (error) {
        console.error('Failed to join room:', error)
        alert('Failed to join room. Please try again.')
      }
    }
  }

  const startGame = () => {
    if (isHost && gameRoom && gameRoom.players.length === 2 && socket) {
      socket.emit('start-game', roomId)
    }
  }

  const submitStatements = () => {
    if (socket && gameRoom && currentStatements.every(s => s.trim()) && selectedLie !== null) {
      socket.emit('submit-statements', {
        roomId,
        playerId: userId,
        statements: currentStatements,
        lieIndex: selectedLie
      })
    }
  }

  const makeGuess = (guessIndex: number) => {
    if (socket && gameRoom && guess === null) {
      const opponent = gameRoom.players.find(p => p.id !== userId)
      if (opponent) {
        setGuess(guessIndex)
        socket.emit('make-guess', {
          roomId,
          playerId: userId,
          guessIndex,
          targetPlayerId: opponent.id
        })
      }
    }
  }

  const restartGame = () => {
    if (socket) {
      socket.emit('restart-game', roomId)
    }
  }

  const updateStatement = (index: number, value: string) => {
    const newStatements = [...currentStatements]
    newStatements[index] = value
    setCurrentStatements(newStatements)
  }

  if (gamePhase === 'setup') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl mb-4">🌐</div>
        <h2 className="text-3xl font-bold text-gray-800">Real-Time Two Truths and a Lie</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Play with your partner in real-time! Create or join a room to start playing together.
        </p>

        <div className="space-y-6 max-w-sm mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 mb-2">👑 Host a Game</h3>
            <p className="text-sm text-green-700 mb-3">Create a room and share the ID with your partner</p>
            <button
              onClick={createRoom}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              🎮 Create Room
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <h3 className="font-semibold text-rose-800 mb-2">🚪 Join a Game</h3>
            <p className="text-sm text-rose-700 mb-3">Enter the room ID your partner shared</p>
            <input
              type="text"
              placeholder="Enter Room ID (e.g., ABC123)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-center font-mono mb-3"
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">💡 How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• <strong>Host:</strong> Creates room and gets Room ID to share</li>
            <li>• <strong>Guest:</strong> Joins using the shared Room ID</li>
            <li>• Play 3 rounds of Two Truths and a Lie</li>
            <li>• Real-time synchronization</li>
            <li>• Perfect for long-distance couples!</li>
          </ul>
        </div>
      </motion.div>
    )
  }

  if (gamePhase === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isHost ? 'Waiting for Guest' : 'Joined Room'}
        </h2>
        <div className="bg-white rounded-xl p-4 shadow-lg max-w-sm mx-auto">
          <p className="text-gray-600 mb-2">
            Room ID: <span className="font-mono bg-gray-100 px-3 py-1 rounded text-lg font-bold">{roomId}</span>
          </p>
          {isHost ? (
            <p className="text-green-600 font-medium mb-3">👑 You are the Host - Share this ID with your partner!</p>
          ) : (
            <p className="text-rose-600 font-medium mb-3">🚪 You joined as Guest - Waiting for host to start...</p>
          )}
          
          {isHost && gameRoom && gameRoom.players.length >= 2 && gameRoom.gameState === 'waiting' && (
            <button
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-all"
            >
              🚀 Start Game
            </button>
          )}
        </div>
        
        {gameRoom && (
          <div className="bg-green-50 rounded-xl p-4 max-w-sm mx-auto">
            <h3 className="font-semibold text-green-800 mb-2">Players in room:</h3>
            {gameRoom.players.map((player, index) => (
              <div key={player.id} className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                {player.name} 
                {player.id === userId && ' (You)'}
                {player.id === gameRoom.hostId && ' 👑'}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  if (gamePhase === 'input') {
    const canSubmit = currentStatements.every(s => s.trim()) && selectedLie !== null

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">✍️</div>
          <h2 className="text-2xl font-bold text-gray-800">Your Turn</h2>
          <p className="text-gray-600">
            Round {gameRoom?.currentRound || 1} - Write your statements
          </p>
          <div className={`text-lg font-bold mt-2 ${
            inputTimer <= 10 ? 'text-red-500' : inputTimer <= 30 ? 'text-orange-500' : 'text-green-500'
          }`}>
            ⏰ Time remaining: {Math.floor(inputTimer / 60)}:{(inputTimer % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="bg-rose-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Write 3 statements about yourself (2 truths, 1 lie):
          </h3>
          
          <div className="space-y-4">
            {currentStatements.map((statement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Statement {index + 1}:</span>
                  <button
                    onClick={() => setSelectedLie(index)}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      selectedLie === index
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    {selectedLie === index ? 'This is the LIE' : 'Mark as lie'}
                  </button>
                </div>
                <textarea
                  value={statement}
                  onChange={(e) => updateStatement(index, e.target.value)}
                  placeholder="Write an interesting statement about yourself..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={submitStatements}
          disabled={!canSubmit}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
        >
          Submit Statements
        </button>
      </motion.div>
    )
  }

  if (gamePhase === 'guess') {
    const opponent = gameRoom?.players.find(p => p.id !== userId)

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🤔</div>
          <h2 className="text-2xl font-bold text-gray-800">Guess Time!</h2>
          <p className="text-gray-600">
            Round {gameRoom?.currentRound || 1} - Which statement is {opponent?.name}'s lie?
          </p>
          <div className={`text-lg font-bold mt-2 ${
            guessTimer <= 30 ? 'text-red-500' : guessTimer <= 60 ? 'text-orange-500' : 'text-green-500'
          }`}>
            ⏰ Time remaining: {Math.floor(guessTimer / 60)}:{(guessTimer % 60).toString().padStart(2, '0')}
          </div>
          {guess !== null && !bothPlayersGuessed && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
              <p className="text-blue-700 text-sm">
                ✅ Your guess submitted! Waiting for {opponent?.name} to make their guess...
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {opponentStatements.map((statement, index) => (
            <motion.button
              key={index}
              onClick={() => makeGuess(index)}
              disabled={showResult || guess !== null}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                guess === index
                  ? 'border-rose-500 bg-rose-50'
                  : guess !== null
                  ? 'border-gray-200 bg-gray-50 opacity-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              whileHover={!showResult && guess === null ? { scale: 1.02 } : {}}
              whileTap={!showResult && guess === null ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start gap-3">
                <span className="bg-gray-100 text-gray-600 text-sm rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  {index + 1}
                </span>
                <p className="text-gray-800">{statement}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    )
  }

  if (gamePhase === 'result') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl mb-4">
          {resultData?.isCorrect ? '🎉' : '😅'}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {resultData?.isCorrect ? 'Correct!' : 'Wrong!'}
        </h2>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-600 mb-4">
            {resultData?.isCorrect 
              ? 'Great guess! You found the lie!' 
              : `The lie was statement ${(resultData?.lieIndex || 0) + 1}`
            }
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Current Scores:</h3>
            {gameRoom?.players.map((player) => (
              <div key={player.id} className="flex justify-between items-center">
                <span>{player.name} {player.id === userId && '(You)'}</span>
                <span className="font-bold text-rose-500">
                  {resultData?.scores[player.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600">
          {gameRoom?.currentRound === 3 
            ? 'Preparing final results...' 
            : 'Starting next round...'
          }
        </p>
      </motion.div>
    )
  }

  if (gamePhase === 'finished') {
    const players = resultData?.players || []
    const scores = resultData?.scores || {}
    const winner = players.reduce((prev: Player, current: Player) => 
      (scores[prev.id] || 0) > (scores[current.id] || 0) ? prev : current
    )
    const isWinner = winner?.id === userId
    const isTie = players.every((p: Player) => scores[p.id] === scores[winner?.id])

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-gray-800">Game Complete!</h2>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Final Scores</h3>
          <div className="space-y-3">
            {players.map((player: Player) => (
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
                <span className="text-2xl font-bold text-rose-500">
                  {scores[player.id] || 0}/3
                </span>
              </div>
            ))}
          </div>
        </div>

        {isTie ? (
          <p className="text-lg text-gray-600">
            🤝 It's a tie! You both know each other equally well!
          </p>
        ) : isWinner ? (
          <p className="text-lg text-gray-600">
            🎉 Congratulations! You're the lie detection champion!
          </p>
        ) : (
          <p className="text-lg text-gray-600">
            😊 Good game! {winner?.name} wins this round!
          </p>
        )}

        <button
          onClick={restartGame}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
        >
          🔄 Play Again
        </button>
      </motion.div>
    )
  }

  return null
}