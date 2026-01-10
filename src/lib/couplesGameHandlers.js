function setupCouplesGameHandlers(io, socket, rooms) {
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
    
    room.gameData.timer = setTimeout(() => {
      const currentRoom = rooms.get(roomId)
      if (!currentRoom || !currentRoom.gameData) return
      
      console.log('Timer expired for room:', roomId)
      io.to(roomId).emit('round-result', {
        answers: currentRoom.gameData.answers,
        scores: currentRoom.scores,
        round: currentRoom.gameData.currentRound,
        question: currentRoom.gameData.question,
        timedOut: true
      })
      
      setTimeout(() => {
        const room = rooms.get(roomId)
        if (!room || !room.gameData) return
        
        if (room.gameData.currentRound >= room.gameData.maxRounds) {
          room.gameState = 'finished'
          io.to(roomId).emit('game-finished', room)
        } else {
          room.gameData.currentRound++
          const questions = gameQuestions[room.currentGame] || gameQuestions['love-questions']
          room.gameData.question = questions[Math.floor(Math.random() * questions.length)]
          room.gameData.answers = {}
          
          io.to(roomId).emit('new-round', {
            round: room.gameData.currentRound,
            question: room.gameData.question,
            maxRounds: room.gameData.maxRounds,
            gameType: room.currentGame,
            gameState: 'playing',
            answers: {},
            timedOut: true
          })
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
    
    io.to(roomId).emit('game-started', {
      roomId: roomId,
      gameState: 'playing',
      currentRound: 1,
      question: randomQuestion
    })
    
    io.to(roomId).emit('game-data', {
      question: randomQuestion,
      round: room.gameData.currentRound,
      maxRounds: room.gameData.maxRounds,
      answers: {},
      gameType: gameType
    })
    
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
    
    io.to(roomId).emit('answer-submitted', {
      playerId: player.id,
      playerName: player.name,
      totalAnswers: Object.keys(room.gameData.answers).length,
      requiredAnswers: room.players.length,
      message: `${player.name} has responded... 💕`
    })
    
    if (Object.keys(room.gameData.answers).length === room.players.length) {
      if (room.gameData.timer) {
        clearTimeout(room.gameData.timer)
        room.gameData.timer = null
      }
      
      console.log('All answers received, showing results with answers:', room.gameData.answers)
      
      io.to(roomId).emit('round-result', {
        answers: room.gameData.answers,
        scores: room.scores,
        round: room.gameData.currentRound,
        question: room.gameData.question,
        message: "Time to share your hearts... 💖",
        players: room.players
      })
      
      setTimeout(() => {
        const currentRoom = rooms.get(roomId)
        if (!currentRoom || !currentRoom.gameData) return
        
        if (currentRoom.gameData.currentRound >= currentRoom.gameData.maxRounds) {
          console.log('Game finished')
          currentRoom.gameState = 'finished'
          io.to(roomId).emit('game-finished', currentRoom)
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
          
          io.to(roomId).emit('new-round', {
            round: currentRoom.gameData.currentRound,
            question: currentRoom.gameData.question,
            maxRounds: currentRoom.gameData.maxRounds,
            gameType: currentRoom.currentGame,
            gameState: 'playing',
            answers: {},
            message: `Round ${currentRoom.gameData.currentRound} - Get ready for the next question! 💕`
          })
          
          startRoundTimer(roomId)
        }
      }, 3000)
    }
  })
}

module.exports = { setupCouplesGameHandlers }