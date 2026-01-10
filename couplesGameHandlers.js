const couplesRooms = new Map()
const roomTimeouts = new Map()
const playerLocks = new Map()

const truthsQuestions = [
  {
    statements: [
      "I once ate a whole pizza by myself",
      "I can speak three languages fluently", 
      "I've never broken a bone"
    ],
    lie: 1
  }
]

const wouldYouRatherQuestions = [
  {
    text: "Would you rather...",
    options: [
      "Have the ability to fly but only 3 feet off the ground",
      "Have the ability to turn invisible but only when nobody is looking"
    ]
  },
  {
    text: "Would you rather...",
    options: [
      "Always have to sing instead of speak",
      "Always have to dance everywhere you go"
    ]
  },
  {
    text: "Would you rather...",
    options: [
      "Live in a world without music",
      "Live in a world without movies"
    ]
  }
]

const quickFireQuestions = [
  "What's your favorite childhood memory?",
  "If you could have dinner with anyone, who would it be?",
  "What's your biggest fear?",
  "What's your dream vacation destination?",
  "What's the best advice you've ever received?"
]

function handleCouplesGame(io) {
  io.on('connection', (socket) => {
    
    socket.on('create-couples-room', ({ roomId, playerId, playerName }) => {
      try {
        if (!roomId || !playerId || !playerName) {
          socket.emit('error', 'Missing required fields')
          return
        }
        
        if (couplesRooms.has(roomId)) {
          socket.emit('error', 'Room already exists')
          return
        }
        
        const room = {
          id: roomId,
          players: [{
            id: playerId,
            name: playerName,
            socketId: socket.id
          }],
          gameState: 'waiting',
          currentGame: 'menu',
          currentRound: 0,
          maxRounds: 3,
          scores: { [playerId]: 0 },
          hostId: playerId,
          gameData: null,
          lastActivity: Date.now()
        }
        
        couplesRooms.set(roomId, room)
        socket.join(roomId)
        socket.emit('room-created', room)
        console.log('Room created:', roomId)
      } catch (error) {
        socket.emit('error', 'Failed to create room')
      }
    })

    socket.on('join-couples-room', ({ roomId, playerId, playerName }) => {
      try {
        if (!roomId || !playerId || !playerName) {
          socket.emit('error', 'Missing required fields')
          return
        }
        
        const room = couplesRooms.get(roomId)
        
        if (!room) {
          socket.emit('error', 'Room not found')
          return
        }
        
        if (room.players.length >= 2) {
          socket.emit('error', 'Room is full')
          return
        }
        
        if (room.players.some(p => p.id === playerId)) {
          socket.emit('error', 'Player already in room')
          return
        }
        
        room.players.push({
          id: playerId,
          name: playerName,
          socketId: socket.id
        })
        room.scores[playerId] = 0
        room.lastActivity = Date.now()
        
        socket.join(roomId)
        socket.emit('room-joined', room)
        io.to(roomId).emit('room-update', room)
      } catch (error) {
        socket.emit('error', 'Failed to join room')
      }
    })

    socket.on('start-couples-game', ({ roomId, gameType, rounds }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.players.length < 2 || room.gameState === 'playing') {
          socket.emit('error', 'Cannot start game')
          return
        }
        
        const player = room.players.find(p => p.socketId === socket.id)
        if (!player || player.id !== room.hostId) {
          socket.emit('error', 'Only host can start game')
          return
        }
        
        room.gameState = 'playing'
        room.currentGame = gameType
        room.maxRounds = rounds || 3
        room.currentRound = 1
        room.lastActivity = Date.now()
        
        console.log('Starting game:', gameType, 'for room:', roomId)
        startGameRound(io, room)
      } catch (error) {
        console.error('Start game error:', error)
        socket.emit('error', 'Failed to start game')
      }
    })

    socket.on('submit-truths', ({ roomId, statements, lieIndex }) => {
      try {
        const lockKey = `${roomId}-truths`
        if (playerLocks.has(lockKey)) return
        playerLocks.set(lockKey, true)
        
        const room = couplesRooms.get(roomId)
        if (!room || room.gameState !== 'playing' || room.currentGame !== 'truths') {
          playerLocks.delete(lockKey)
          return
        }
        
        if (!statements || !Array.isArray(statements) || statements.length !== 3 || lieIndex == null) {
          socket.emit('error', 'Invalid submission')
          playerLocks.delete(lockKey)
          return
        }
        
        if (!room.gameData) room.gameData = {}
        room.gameData.statements = statements
        room.gameData.lieIndex = lieIndex
        room.gameData.phase = 'guess'
        room.lastActivity = Date.now()
        
        const opponent = room.players.find(p => p.socketId !== socket.id)
        if (opponent) {
          io.to(opponent.socketId).emit('game-data', {
            phase: 'guess',
            opponentStatements: statements
          })
        }
        
        setTimeout(() => playerLocks.delete(lockKey), 1000)
      } catch (error) {
        socket.emit('error', 'Failed to submit truths')
      }
    })

    socket.on('make-truth-guess', ({ roomId, guess }) => {
      try {
        const lockKey = `${roomId}-guess`
        if (playerLocks.has(lockKey)) return
        playerLocks.set(lockKey, true)
        
        const room = couplesRooms.get(roomId)
        if (!room || !room.gameData || room.gameData.phase !== 'guess') {
          playerLocks.delete(lockKey)
          return
        }
        
        const isCorrect = guess === room.gameData.lieIndex
        const guesser = room.players.find(p => p.socketId === socket.id)
        
        if (isCorrect && guesser) {
          room.scores[guesser.id] += 1
        }
        
        room.lastActivity = Date.now()
        
        io.to(roomId).emit('round-result', {
          correct: isCorrect,
          lieIndex: room.gameData.lieIndex,
          scores: room.scores
        })
        
        setTimeout(() => {
          if (couplesRooms.has(roomId)) {
            if (room.currentRound < room.maxRounds) {
              room.currentRound++
              startGameRound(io, room)
            } else {
              endGame(io, room)
            }
          }
          playerLocks.delete(lockKey)
        }, 3000)
      } catch (error) {
        socket.emit('error', 'Failed to process guess')
      }
    })

    socket.on('make-choice', ({ roomId, choice }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.gameState !== 'playing' || room.currentGame !== 'wouldyou') return
        
        if (!room.gameData.choices) room.gameData.choices = {}
        const player = room.players.find(p => p.socketId === socket.id)
        if (player && !room.gameData.choices[player.id]) {
          room.gameData.choices[player.id] = choice
          room.lastActivity = Date.now()
        }
        
        if (Object.keys(room.gameData.choices).length === 2) {
          io.to(roomId).emit('round-result', {
            choices: room.gameData.choices,
            scores: room.scores
          })
          
          setTimeout(() => {
            if (couplesRooms.has(roomId)) {
              if (room.currentRound < room.maxRounds) {
                room.currentRound++
                startGameRound(io, room)
              } else {
                endGame(io, room)
              }
            }
          }, 3000)
        }
      } catch (error) {
        socket.emit('error', 'Failed to process choice')
      }
    })

    socket.on('submit-answer', ({ roomId, answer }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.gameState !== 'playing' || room.currentGame !== 'quickfire') return
        
        if (!room.gameData.answers) room.gameData.answers = {}
        const player = room.players.find(p => p.socketId === socket.id)
        if (player && !room.gameData.answers[player.id]) {
          room.gameData.answers[player.id] = answer
          room.lastActivity = Date.now()
        }
        
        if (Object.keys(room.gameData.answers).length === 2) {
          io.to(roomId).emit('round-result', {
            answers: room.gameData.answers,
            scores: room.scores
          })
          
          setTimeout(() => {
            if (couplesRooms.has(roomId)) {
              if (room.currentRound < room.maxRounds) {
                room.currentRound++
                startGameRound(io, room)
              } else {
                endGame(io, room)
              }
            }
          }, 3000)
        }
      } catch (error) {
        socket.emit('error', 'Failed to submit answer')
      }
    })

    socket.on('disconnect', () => {
      try {
        for (const [roomId, room] of couplesRooms.entries()) {
          const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1)
            if (room.players.length === 0) {
              cleanupRoom(roomId)
            } else {
              room.lastActivity = Date.now()
              io.to(roomId).emit('room-update', room)
            }
            break
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    })
  })
}

function startGameRound(io, room) {
  room.gameData = { phase: 'playing' }
  
  if (room.currentGame === 'truths') {
    room.gameData.phase = 'input'
    io.to(room.id).emit('game-data', {
      phase: 'input',
      round: room.currentRound
    })
  } else if (room.currentGame === 'wouldyou') {
    const question = wouldYouRatherQuestions[Math.floor(Math.random() * wouldYouRatherQuestions.length)]
    room.gameData.question = question
    room.gameData.choices = {}
    
    io.to(room.id).emit('game-data', {
      question,
      round: room.currentRound
    })
  } else if (room.currentGame === 'quickfire') {
    const question = quickFireQuestions[Math.floor(Math.random() * quickFireQuestions.length)]
    room.gameData.question = question
    room.gameData.answers = {}
    
    io.to(room.id).emit('game-data', {
      question,
      round: room.currentRound
    })
  }
  
  io.to(room.id).emit('game-started', room)
}

function endGame(io, room) {
  room.gameState = 'finished'
  room.lastActivity = Date.now()
  io.to(room.id).emit('game-finished', room)
  setTimeout(() => cleanupRoom(room.id), 300000)
}

function cleanupRoom(roomId) {
  couplesRooms.delete(roomId)
  if (roomTimeouts.has(roomId)) {
    clearTimeout(roomTimeouts.get(roomId))
    roomTimeouts.delete(roomId)
  }
}

function scheduleRoomCleanup(roomId) {
  const timeout = setTimeout(() => {
    const room = couplesRooms.get(roomId)
    if (room && Date.now() - room.lastActivity > 1800000) {
      cleanupRoom(roomId)
    }
  }, 1800000)
  roomTimeouts.set(roomId, timeout)
}

module.exports = { handleCouplesGame }