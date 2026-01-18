const { aiEnhancedHandlers, integrationHelpers } = require('./ai/aiIntegration')
const LoveAddictionGame = require('./games/LoveAddiction/index.js')

const couplesRooms = new Map()
const roomTimeouts = new Map()
const playerLocks = new Map()
const responseStartTimes = new Map()
const loveAddictionInstance = new LoveAddictionGame()

// Enhanced game handlers with AI integration
function handleEnhancedCouplesGame(io) {
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
          lastActivity: Date.now(),
          aiEnabled: true
        }
        
        couplesRooms.set(roomId, room)
        socket.join(roomId)
        
        // Initialize AI for the room
        aiEnhancedHandlers.initializeAIForRoom(room)
        
        socket.emit('room-created', room)
        console.log('Enhanced room created:', roomId)
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
        
        // Re-initialize AI with both players
        aiEnhancedHandlers.initializeAIForRoom(room)
        
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

        // Get AI recommendations before starting
        const aiResult = aiEnhancedHandlers.enhanceGameStart(room, gameType)
        
        if (aiResult.suggestion) {
          socket.emit('ai-suggestion', {
            recommended: aiResult.suggestion.recommended,
            reason: aiResult.suggestion.reason,
            original: gameType
          })
          return
        }
        
        room.gameState = 'playing'
        room.currentGame = gameType
        room.maxRounds = rounds || 3
        room.currentRound = 1
        room.lastActivity = Date.now()
        
        console.log('Starting enhanced game:', gameType, 'for room:', roomId)
        startEnhancedGameRound(io, room)
      } catch (error) {
        console.error('Start game error:', error)
        socket.emit('error', 'Failed to start game')
      }
    })

    // Love Addiction game handler
    socket.on('start-love-addiction', ({ roomId, gameMode, rounds }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.players.length < 2) {
          socket.emit('error', 'Cannot start Love Addiction')
          return
        }

        room.gameState = 'playing'
        room.currentGame = 'love-addiction'
        room.maxRounds = rounds || 5
        room.currentRound = 1
        room.gameMode = gameMode || 'progressive'
        room.lastActivity = Date.now()
        
        // Initialize Love Addiction specific data
        if (!room.loveAddictionData) {
          room.loveAddictionData = loveAddictionInstance.initializeGame(room.players)
        }

        startEnhancedGameRound(io, room)
      } catch (error) {
        socket.emit('error', 'Failed to start Love Addiction')
      }
    })

    // Seductive Secrets game handler
    socket.on('start-seductive-secrets', ({ roomId, gameMode, mood, rounds }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.players.length < 2) {
          socket.emit('error', 'Cannot start Seductive Secrets')
          return
        }

        room.gameState = 'playing'
        room.currentGame = 'seductive-secrets'
        room.maxRounds = rounds || 8
        room.currentRound = 1
        room.gameMode = gameMode || 'progressive'
        room.mood = mood || 'playful'
        room.lastActivity = Date.now()

        startEnhancedGameRound(io, room)
      } catch (error) {
        socket.emit('error', 'Failed to start Seductive Secrets')
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

        // AI analysis of response
        const player = room.players.find(p => p.socketId === socket.id)
        if (player) {
          const responseText = integrationHelpers.extractResponseText('truths', { statements })
          const responseTime = integrationHelpers.calculateResponseTime(responseStartTimes.get(`${roomId}-${player.id}`) || Date.now())
          aiEnhancedHandlers.processPlayerResponse(roomId, player.id, responseText, responseTime)
        }
        
        if (!room.gameData) room.gameData = {}
        room.gameData.statements = statements
        room.gameData.lieIndex = lieIndex
        room.gameData.phase = 'guess'
        room.lastActivity = Date.now()
        
        const opponent = room.players.find(p => p.socketId !== socket.id)
        if (opponent) {
          responseStartTimes.set(`${roomId}-${opponent.id}`, Date.now())
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

    // Love Addiction response handler
    socket.on('submit-love-addiction-response', ({ roomId, response, questionType }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.currentGame !== 'love-addiction') return

        const player = room.players.find(p => p.socketId === socket.id)
        if (!player) return

        const responseTime = integrationHelpers.calculateResponseTime(responseStartTimes.get(`${roomId}-${player.id}`) || Date.now())
        aiEnhancedHandlers.processPlayerResponse(roomId, player.id, response, responseTime)

        if (!room.gameData.responses) room.gameData.responses = {}
        room.gameData.responses[player.id] = { response, questionType, timeSpent: responseTime }
        room.lastActivity = Date.now()

        // Process Love Addiction scoring
        const playerData = room.loveAddictionData.players.find(p => p.id === player.id)
        if (playerData) {
          const basePoints = response.length > 50 ? 25 : 15
          const points = loveAddictionInstance.calculatePoints(basePoints, playerData.currentStreak, playerData.achievements)
          playerData.totalPoints += points
          room.scores[player.id] = playerData.totalPoints
        }

        const partner = room.players.find(p => p.id !== player.id)
        if (partner) {
          io.to(partner.socketId).emit('partner-response', { response, playerName: player.name })
        }

        if (Object.keys(room.gameData.responses).length === 2) {
          setTimeout(() => {
            if (room.currentRound < room.maxRounds) {
              room.currentRound++
              startEnhancedGameRound(io, room)
            } else {
              endEnhancedGame(io, room)
            }
          }, 3000)
        }
      } catch (error) {
        socket.emit('error', 'Failed to submit Love Addiction response')
      }
    })

    // Seductive Secrets response handler
    socket.on('submit-seductive-secrets-response', ({ roomId, response, timeSpent, intimacyLevel, secretType }) => {
      try {
        const room = couplesRooms.get(roomId)
        if (!room || room.currentGame !== 'seductive-secrets') return

        const player = room.players.find(p => p.socketId === socket.id)
        if (!player) return

        aiEnhancedHandlers.processPlayerResponse(roomId, player.id, response, timeSpent)

        if (!room.gameData.responses) room.gameData.responses = {}
        room.gameData.responses[player.id] = { response, timeSpent, intimacyLevel, secretType }
        room.lastActivity = Date.now()

        // Calculate seductive points
        const basePoints = Math.min(50, response.length) + (intimacyLevel * 10)
        const timeBonus = timeSpent < 60000 ? 20 : 0
        const totalPoints = basePoints + timeBonus
        room.scores[player.id] = (room.scores[player.id] || 0) + totalPoints

        const partner = room.players.find(p => p.id !== player.id)
        if (partner) {
          io.to(partner.socketId).emit('partner-response', { response, playerName: player.name })
        }

        if (Object.keys(room.gameData.responses).length === 2) {
          setTimeout(() => {
            if (room.currentRound < room.maxRounds) {
              room.currentRound++
              startEnhancedGameRound(io, room)
            } else {
              endEnhancedGame(io, room)
            }
          }, 5000)
        }
      } catch (error) {
        socket.emit('error', 'Failed to submit Seductive Secrets response')
      }
    })

    socket.on('get-ai-recommendations', ({ roomId }) => {
      try {
        const recommendations = aiEnhancedHandlers.getAIRecommendations(roomId)
        const formatted = integrationHelpers.formatRecommendations(recommendations)
        socket.emit('ai-recommendations', formatted)
      } catch (error) {
        socket.emit('error', 'Failed to get AI recommendations')
      }
    })

    socket.on('disconnect', () => {
      // Clean up AI data when players disconnect
      for (const [roomId, room] of couplesRooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1)
          if (room.players.length === 0) {
            aiEnhancedHandlers.cleanupAI(roomId)
            couplesRooms.delete(roomId)
          }
        }
      }
    })
  })
}

function startEnhancedGameRound(io, room) {
  room.gameData = { responses: {}, choices: {}, answers: {} }
  
  let gameData = null
  
  // Try to get AI-enhanced question first
  if (room.aiEnabled) {
    gameData = aiEnhancedHandlers.getAIQuestion(room.id, room.currentGame)
  }
  
  // Fallback to default questions if AI doesn't provide one
  if (!gameData) {
    gameData = getDefaultQuestion(room.currentGame, room)
  }
  
  // Emit specific events for different game types
  if (room.currentGame === 'love-addiction') {
    io.to(room.id).emit('love-addiction-started', {
      round: room.currentRound,
      maxRounds: room.maxRounds,
      gameData,
      players: room.loveAddictionData?.players || room.players
    })
    return
  }
  
  if (room.currentGame === 'seductive-secrets') {
    io.to(room.id).emit('seductive-secrets-started', {
      round: room.currentRound,
      maxRounds: room.maxRounds,
      currentSecret: gameData.currentSecret,
      secretType: gameData.secretType,
      intimacyLevel: gameData.intimacyLevel,
      mood: room.mood,
      players: room.players
    })
    return
  }

  // Set response start times for AI analysis
  room.players.forEach(player => {
    responseStartTimes.set(`${room.id}-${player.id}`, Date.now())
  })
  
  io.to(room.id).emit('round-start', {
    round: room.currentRound,
    maxRounds: room.maxRounds,
    gameType: room.currentGame,
    gameData
  })
}

function getDefaultQuestion(gameType, room) {
  const defaults = {
    truths: {
      statements: [
        "I once ate a whole pizza by myself",
        "I can speak three languages fluently", 
        "I've never broken a bone"
      ],
      lie: 1
    },
    wouldyou: {
      text: "Would you rather...",
      options: [
        "Have the ability to fly but only 3 feet off the ground",
        "Have the ability to turn invisible but only when nobody is looking"
      ]
    },
    quickfire: "What's your favorite childhood memory?",
    'love-addiction': {
      question: loveAddictionInstance.getQuestions(1, ['basic-questions'])[0] || "What made you fall in love with me?",
      questionType: 'basic-questions',
      level: 1
    },
    'seductive-secrets': {
      currentSecret: "What's something that instantly makes you feel desired?",
      secretType: 'confession',
      intimacyLevel: 1,
      mood: room?.mood || 'playful'
    }
  }
  
  return defaults[gameType]
}

function endEnhancedGame(io, room) {
  const winner = Object.entries(room.scores).reduce((a, b) => a[1] > b[1] ? a : b)
  const recommendations = aiEnhancedHandlers.getAIRecommendations(room.id)
  
  room.gameState = 'finished'
  room.lastActivity = Date.now()
  
  // Game-specific end events
  if (room.currentGame === 'love-addiction') {
    const relationshipScore = loveAddictionInstance.calculateRelationshipScore(room.gameData?.allAnswers || [])
    io.to(room.id).emit('love-addiction-ended', {
      winner: winner[0],
      scores: room.scores,
      relationshipScore,
      players: room.loveAddictionData?.players || room.players,
      aiRecommendations: integrationHelpers.formatRecommendations(recommendations)
    })
  } else if (room.currentGame === 'seductive-secrets') {
    const seductionScore = Math.floor(Math.random() * 30) + 70 // 70-100%
    io.to(room.id).emit('seductive-secrets-ended', {
      winner: winner[0],
      scores: room.scores,
      seductionScore,
      players: room.players,
      aiRecommendations: integrationHelpers.formatRecommendations(recommendations)
    })
  } else {
    io.to(room.id).emit('game-end', {
      winner: winner[0],
      scores: room.scores,
      aiRecommendations: integrationHelpers.formatRecommendations(recommendations)
    })
  }
}

module.exports = { handleEnhancedCouplesGame }