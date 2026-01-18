function setupCouplesGameHandlers(io, socket, rooms) {
  // Import Love Addiction handlers
  const { setupLoveAddictionHandlers } = require('../games/LoveAddiction/handlers.js')
  
  // Setup Love Addiction handlers
  setupLoveAddictionHandlers(io, socket, rooms)
  
  // Import Seductive Secrets content
  const { seductiveSecretsContent } = require('../games/SeductiveSecrets/seductiveSecretsContent.js')
  
  // Helper function to clean up room data and prevent memory leaks
  function cleanupRoomData(room) {
    if (room && room.gameData && room.gameData.timer) {
      clearTimeout(room.gameData.timer)
      room.gameData.timer = null
    }
  }

  const gameQuestions = {
    'love-questions': [
      "Tell me about the moment you knew you loved me...",
      "What's your deepest fantasy about us?",
      "Describe how you want me to touch you right now...",
      "What's the naughtiest thought you've had about me today?",
      "If we were alone right now, what would you whisper in my ear?",
      "What part of my body drives you crazy?",
      "Tell me your most romantic dream about us...",
      "What would you do if I was lying next to you right now?",
      "Describe the perfect intimate evening with me...",
      "What's something you've always wanted to try with me?"
    ],
    'intimate-dares': [
      "Send me a voice message saying something seductive",
      "Describe what you're wearing in detail",
      "Tell me what you want me to do to you",
      "Send a photo of your lips",
      "Whisper something naughty you want to do",
      "Describe your ideal romantic night with me",
      "Tell me where you want me to kiss you",
      "Send me a flirty selfie",
      "Describe how you're feeling right now",
      "Tell me your biggest turn-on about me"
    ],
    'truth-or-dare': [
      "What's your wildest fantasy involving me?",
      "When did you last think about kissing me?",
      "What's the most romantic thing you want to do with me?",
      "Describe your perfect date night with me",
      "What's something intimate you've never told me?",
      "How do you imagine our future together?",
      "What's your favorite thing about my personality?",
      "Tell me about a dream you had about us",
      "What makes you feel most connected to me?",
      "Describe the moment you fell for me"
    ]
  }

  function startRoundTimer(roomId) {
    const room = rooms.get(roomId)
    if (!room || !room.gameData) return
    
    // Clear existing timer if any
    if (room.gameData.timer) {
      clearTimeout(room.gameData.timer)
    }
    
    room.gameData.timer = setTimeout(() => {
      const currentRoom = rooms.get(roomId)
      if (!currentRoom || !currentRoom.gameData) return
      
      console.log('Timer expired for room:', roomId)
      
      // Create clean data object without circular references
      const resultData = {
        answers: { ...currentRoom.gameData.answers },
        scores: { ...currentRoom.scores },
        round: currentRoom.gameData.currentRound,
        question: currentRoom.gameData.question,
        timedOut: true
      }
      
      io.to(roomId).emit('round-result', resultData)
      
      setTimeout(() => {
        const room = rooms.get(roomId)
        if (!room || !room.gameData) return
        
        if (room.gameData.currentRound >= room.gameData.maxRounds) {
          room.gameState = 'finished'
          
          // Create clean room data for emission
          const finishedRoomData = {
            id: room.id,
            gameState: room.gameState,
            scores: { ...room.scores },
            players: room.players.map(p => ({ id: p.id, name: p.name }))
          }
          
          io.to(roomId).emit('game-finished', finishedRoomData)
        } else {
          room.gameData.currentRound++
          const questions = gameQuestions[room.currentGame] || gameQuestions['love-questions']
          room.gameData.question = questions[Math.floor(Math.random() * questions.length)]
          room.gameData.answers = {}
          
          const newRoundData = {
            round: room.gameData.currentRound,
            question: room.gameData.question,
            maxRounds: room.gameData.maxRounds,
            gameType: room.currentGame,
            gameState: 'playing',
            answers: {},
            timedOut: true
          }
          
          io.to(roomId).emit('new-round', newRoundData)
          startRoundTimer(roomId)
        }
      }, 3000)
    }, 120000) // 2 minutes
  }

  socket.on('start-couples-game', (data) => {
    console.log('Game start request:', data)
    const { roomId, gameType } = data
    const room = rooms.get(roomId)
    
    if (!room) {
      console.log('Room not found:', roomId)
      socket.emit('error', 'Room not found')
      return
    }
    
    if (room.players.length < 2) {
      console.log('Not enough players:', room.players.length)
      socket.emit('error', 'Need 2 players to start')
      return
    }
    
    // Check if player is host
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player || player.id !== room.hostId) {
      socket.emit('error', 'Only the host can start the game')
      return
    }
    
    const questions = gameQuestions[gameType] || gameQuestions['love-questions']
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    
    room.currentGame = gameType
    room.gameState = 'playing'
    room.gameData = {
      question: randomQuestion,
      answers: {},
      currentRound: 1,
      maxRounds: 3,
      timer: null
    }
    
    console.log('Sending game data:', {
      question: randomQuestion,
      round: room.gameData.currentRound,
      roomId: roomId
    })
    
    // Create clean data objects for emission
    const gameStartedData = {
      roomId: roomId,
      gameState: 'playing',
      currentRound: 1,
      question: randomQuestion,
      gameType: gameType
    }
    
    const gameData = {
      question: randomQuestion,
      round: room.gameData.currentRound,
      maxRounds: room.gameData.maxRounds,
      answers: {},
      gameType: gameType,
      showResults: false
    }
    
    io.to(roomId).emit('game-started', gameStartedData)
    io.to(roomId).emit('game-data', gameData)
    
    startRoundTimer(roomId)
  })

  // Seductive Secrets game handlers
  socket.on('start-seductive-secrets', (data) => {
    console.log('Seductive Secrets start request:', data)
    const { roomId, gameMode, mood } = data
    const room = rooms.get(roomId)
    
    if (!room) {
      console.log('Room not found:', roomId)
      socket.emit('error', 'Room not found')
      return
    }
    
    if (room.players.length < 2) {
      console.log('Not enough players:', room.players.length)
      socket.emit('error', 'Need 2 players to start')
      return
    }
    
    // Get random secret from level 1
    const level1Content = seductiveSecretsContent.level1
    const categories = Object.keys(level1Content)
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const secrets = level1Content[randomCategory]
    const randomSecret = secrets[Math.floor(Math.random() * secrets.length)]
    
    room.currentGame = 'seductive-secrets'
    room.gameState = 'playing'
    room.gameData = {
      currentSecret: randomSecret,
      secretType: randomCategory,
      intimacyLevel: 1,
      round: 1,
      maxRounds: 8,
      mood: mood || 'playful',
      responses: {},
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        totalPoints: 0,
        currentStreak: 0,
        level: 1,
        intimacyRating: 0,
        unlockedContent: 0
      })),
      timer: null
    }
    
    const gameStartData = {
      roomId: roomId,
      gameType: 'seductive-secrets',
      currentSecret: randomSecret,
      secretType: randomCategory,
      intimacyLevel: 1,
      round: 1,
      maxRounds: 8,
      mood: mood || 'playful',
      players: room.gameData.players
    }
    
    io.to(roomId).emit('seductive-secrets-started', gameStartData)
    io.to(roomId).emit('game-started', { ...gameStartData, gameState: 'playing' })
    io.to(roomId).emit('game-data', gameStartData)
    
    console.log('Seductive Secrets game started for room:', roomId)
  })

  socket.on('submit-seductive-secrets-response', (data) => {
    console.log('Seductive Secrets response submitted:', data)
    const { roomId, response, timeSpent, intimacyLevel, secretType } = data
    
    // Find room by roomId or socket ID
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      for (const [code, roomData] of rooms.entries()) {
        if (roomData.players && roomData.players.some(p => p.socketId === socket.id)) {
          room = roomData
          actualRoomId = code
          console.log('Found room by socket ID:', code)
          break
        }
      }
    }
    
    if (!room || !room.gameData || !room.players) {
      console.log('Room or gameData not found. RoomId:', roomId, 'ActualRoomId:', actualRoomId)
      socket.emit('error', 'Room not found or game not active')
      return
    }
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) {
      console.log('Player not found in room')
      return
    }
    
    // Initialize game data objects if they don't exist
    if (!room.gameData.responses) room.gameData.responses = {}
    if (!room.gameData.players) room.gameData.players = []
    
    room.gameData.responses[player.id] = {
      response,
      timeSpent,
      intimacyLevel,
      secretType,
      timestamp: Date.now()
    }
    
    // Update player stats safely
    const playerData = room.gameData.players.find(p => p.id === player.id)
    if (playerData) {
      playerData.totalPoints = (playerData.totalPoints || 0) + Math.max(10, 50 - Math.floor(timeSpent / 1000))
      playerData.intimacyRating = Math.min(100, (playerData.intimacyRating || 0) + 5)
    }
    
    io.to(actualRoomId).emit('answer-submitted', {
      playerId: player.id,
      playerName: player.name,
      totalResponses: Object.keys(room.gameData.responses).length,
      requiredResponses: room.players.length
    })
    
    // Check if all players have responded
    if (Object.keys(room.gameData.responses).length === room.players.length) {
      // Show round results
      io.to(actualRoomId).emit('seductive-secrets-round-result', {
        responses: room.gameData.responses,
        players: room.gameData.players,
        updates: room.gameData.players.map(p => ({
          playerId: p.id,
          newAchievements: [],
          levelUp: { leveledUp: false },
          streakBonus: false,
          currentStreak: p.currentStreak || 0
        }))
      })
      
      // Start next round after delay
      setTimeout(() => {
        const currentRoom = rooms.get(actualRoomId)
        if (!currentRoom || !currentRoom.gameData) return
        
        if (currentRoom.gameData.round >= currentRoom.gameData.maxRounds) {
          // Game finished
          io.to(actualRoomId).emit('seductive-secrets-ended', {
            players: currentRoom.gameData.players,
            seductionScore: 85,
            finalStats: {
              totalSecrets: currentRoom.gameData.round,
              maxIntimacy: currentRoom.gameData.intimacyLevel
            }
          })
        } else {
          // Next round
          currentRoom.gameData.round++
          const newLevel = Math.min(8, Math.floor(currentRoom.gameData.round / 2) + 1)
          currentRoom.gameData.intimacyLevel = newLevel
          
          const levelContent = seductiveSecretsContent[`level${newLevel}`]
          if (levelContent) {
            const categories = Object.keys(levelContent)
            const randomCategory = categories[Math.floor(Math.random() * categories.length)]
            const secrets = levelContent[randomCategory]
            const randomSecret = secrets[Math.floor(Math.random() * secrets.length)]
            
            currentRoom.gameData.currentSecret = randomSecret
            currentRoom.gameData.secretType = randomCategory
            currentRoom.gameData.responses = {}
            
            io.to(actualRoomId).emit('seductive-secrets-next-round', {
              currentSecret: randomSecret,
              secretType: randomCategory,
              intimacyLevel: newLevel,
              round: currentRoom.gameData.round,
              players: currentRoom.gameData.players,
              mood: currentRoom.gameData.mood
            })
          }
        }
      }, 3000)
    }
  })

  socket.on('skip-seductive-secrets-challenge', (data) => {
    const { roomId } = data
    
    // Find room by roomId or socket ID
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      for (const [code, roomData] of rooms.entries()) {
        if (roomData.players && roomData.players.some(p => p.socketId === socket.id)) {
          room = roomData
          actualRoomId = code
          break
        }
      }
    }
    
    if (!room || !room.gameData || !room.players) return
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) return
    
    // Initialize responses object if it doesn't exist
    if (!room.gameData.responses) room.gameData.responses = {}
    
    // Mark as skipped
    room.gameData.responses[player.id] = {
      response: '[SKIPPED]',
      skipped: true,
      timestamp: Date.now()
    }
    
    io.to(actualRoomId).emit('answer-submitted', {
      playerId: player.id,
      playerName: player.name,
      skipped: true,
      totalResponses: Object.keys(room.gameData.responses).length,
      requiredResponses: room.players.length
    })
  })

  socket.on('submit-answer', (data) => {
    console.log('Answer submitted:', data)
    const { roomId, answer } = data
    const room = rooms.get(roomId)
    
    if (!room || !room.gameData) {
      console.log('Room or gameData not found:', roomId)
      socket.emit('error', 'Room not found or game not active')
      return
    }
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) {
      console.log('Player not found in room')
      socket.emit('error', 'Player not found in room')
      return
    }
    
    // Check if player already submitted
    if (room.gameData.answers && room.gameData.answers[player.id]) {
      console.log('Player already submitted answer:', player.id)
      socket.emit('error', 'You have already submitted your answer')
      return
    }
    
    // Initialize answers object if it doesn't exist
    if (!room.gameData.answers) {
      room.gameData.answers = {}
    }
    
    // Store the answer
    room.gameData.answers[player.id] = answer
    console.log('Answer stored for player:', player.id, 'Answer:', answer)
    
    // Confirm submission to the submitting player
    socket.emit('answer-confirmed', {
      playerId: player.id,
      message: 'Your response has been submitted successfully! 💕'
    })
    
    // Notify all players about the submission
    const answerSubmittedData = {
      playerId: player.id,
      playerName: player.name,
      totalAnswers: Object.keys(room.gameData.answers).length,
      requiredAnswers: room.players.length,
      message: `${player.name} has responded... 💕`
    }
    
    io.to(roomId).emit('answer-submitted', answerSubmittedData)
    
    // Check if all players have submitted
    const totalAnswers = Object.keys(room.gameData.answers).length
    const requiredAnswers = room.players.length
    
    console.log(`Answers received: ${totalAnswers}/${requiredAnswers}`)
    
    if (totalAnswers === requiredAnswers) {
      // Clear timer if exists
      if (room.gameData.timer) {
        clearTimeout(room.gameData.timer)
        room.gameData.timer = null
      }
      
      console.log('All answers received, showing results with answers:', room.gameData.answers)
      
      // Create clean data object without circular references
      const roundResultData = {
        answers: { ...room.gameData.answers },
        scores: { ...room.scores },
        round: room.gameData.currentRound,
        question: room.gameData.question,
        message: "Time to share your hearts... 💖",
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        showResults: true
      }
      
      io.to(roomId).emit('round-result', roundResultData)
      
      // Start next round or end game after delay
      setTimeout(() => {
        const currentRoom = rooms.get(roomId)
        if (!currentRoom || !currentRoom.gameData) return
        
        if (currentRoom.gameData.currentRound >= currentRoom.gameData.maxRounds) {
          console.log('Game finished')
          currentRoom.gameState = 'finished'
          
          // Create clean room data for emission
          const finishedRoomData = {
            id: currentRoom.id,
            gameState: currentRoom.gameState,
            scores: { ...currentRoom.scores },
            players: currentRoom.players.map(p => ({ id: p.id, name: p.name }))
          }
          
          io.to(roomId).emit('game-finished', finishedRoomData)
        } else {
          console.log('Starting next round')
          currentRoom.gameData.currentRound++
          const questions = gameQuestions[currentRoom.currentGame] || gameQuestions['love-questions']
          currentRoom.gameData.question = questions[Math.floor(Math.random() * questions.length)]
          currentRoom.gameData.answers = {} // Reset answers for new round
          
          console.log('Sending new round data:', {
            round: currentRoom.gameData.currentRound,
            question: currentRoom.gameData.question
          })
          
          const newRoundData = {
            round: currentRoom.gameData.currentRound,
            question: currentRoom.gameData.question,
            maxRounds: currentRoom.gameData.maxRounds,
            gameType: currentRoom.currentGame,
            gameState: 'playing',
            answers: {},
            showResults: false,
            message: `Round ${currentRoom.gameData.currentRound} - Get ready for the next question! 💕`
          }
          
          io.to(roomId).emit('new-round', newRoundData)
          
          startRoundTimer(roomId)
        }
      }, 5000) // Increased delay to 5 seconds to give players time to read answers
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    // Clean up rooms and timers when players disconnect
    for (const [roomCode, room] of rooms.entries()) {
      if (room.host && room.host.socketId === socket.id) {
        cleanupRoomData(room)
        rooms.delete(roomCode)
        io.to(roomCode).emit('room_closed', { reason: 'Host disconnected' })
      } else if (room.guest && room.guest.socketId === socket.id) {
        room.guest = null
        room.players = room.players.filter(p => p.socketId !== socket.id)
        
        // Create clean room update data
        const roomUpdateData = {
          id: room.id,
          code: room.code,
          host: { id: room.host.id },
          guest: null,
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          gameState: room.gameState,
          currentGame: room.currentGame,
          scores: { ...room.scores }
        }
        
        io.to(roomCode).emit('room-update', roomUpdateData)
      }
    }
  })
}

module.exports = { setupCouplesGameHandlers }