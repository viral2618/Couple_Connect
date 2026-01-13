function setupCouplesGameHandlers(io, socket, rooms) {
  // Import Love Addiction handlers
  const { setupLoveAddictionHandlers } = require('../games/LoveAddiction/handlers.js')
  
  // Setup Love Addiction handlers
  setupLoveAddictionHandlers(io, socket, rooms)
  
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
      question: randomQuestion
    }
    
    const gameData = {
      question: randomQuestion,
      round: room.gameData.currentRound,
      maxRounds: room.gameData.maxRounds,
      answers: {},
      gameType: gameType
    }
    
    io.to(roomId).emit('game-started', gameStartedData)
    io.to(roomId).emit('game-data', gameData)
    
    startRoundTimer(roomId)
  })

  socket.on('submit-answer', (data) => {
    console.log('Answer submitted:', data)
    const { roomId, answer } = data
    const room = rooms.get(roomId)
    
    if (!room || !room.gameData) {
      console.log('Room or gameData not found:', roomId)
      return
    }
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) {
      console.log('Player not found in room')
      return
    }
    
    room.gameData.answers[player.id] = answer
    console.log('Answer stored for player:', player.id, 'Answer:', answer)
    
    // Create clean data object for emission
    const answerSubmittedData = {
      playerId: player.id,
      playerName: player.name,
      totalAnswers: Object.keys(room.gameData.answers).length,
      requiredAnswers: room.players.length,
      message: `${player.name} has responded... 💕`
    }
    
    io.to(roomId).emit('answer-submitted', answerSubmittedData)
    
    if (Object.keys(room.gameData.answers).length === room.players.length) {
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
        players: room.players.map(p => ({ id: p.id, name: p.name }))
      }
      
      io.to(roomId).emit('round-result', roundResultData)
      
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
          currentRoom.gameData.answers = {}
          
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
            message: `Round ${currentRoom.gameData.currentRound} - Get ready for the next question! 💕`
          }
          
          io.to(roomId).emit('new-round', newRoundData)
          
          startRoundTimer(roomId)
        }
      }, 3000)
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