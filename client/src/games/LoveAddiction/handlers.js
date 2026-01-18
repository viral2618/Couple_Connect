const LoveAddictionGame = require('./index.js')

function setupLoveAddictionHandlers(io, socket, rooms) {
  const gameInstance = new LoveAddictionGame()
  
  // Helper function to save player progress (in real app, this would save to database)
  function savePlayerProgress(playerId, playerData) {
    // In production, save to database
    console.log(`Saving progress for ${playerId}:`, playerData)
  }
  
  // Helper function to load player progress
  function loadPlayerProgress(playerId) {
    // In production, load from database
    return {
      level: 1,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      dailyProgress: {},
      lastPlayed: null
    }
  }
  
  // Start Love Addiction game
  socket.on('start-love-addiction', (data) => {
    console.log('Love Addiction game start request:', data)
    const { roomId, gameMode = 'progressive' } = data
    const room = rooms.get(roomId)
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' })
      return
    }
    
    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need 2 players to start Love Addiction' })
      return
    }
    
    // Simple Love Addiction questions
    const loveQuestions = [
      "What's your favorite memory of us together?",
      "How do you feel when we're apart?",
      "What made you fall in love with me?",
      "Describe how you want to cuddle with me right now",
      "What's your dream date with me?",
      "What's one thing you love about my personality?",
      "What's your deepest fantasy about us?",
      "When do you feel most connected to me?",
      "What's something intimate you've never told me?",
      "How do you want me to show you love?"
    ]
    
    const randomChallenge = loveQuestions[Math.floor(Math.random() * loveQuestions.length)]
    
    // Set up simple game data like other games
    room.currentGame = 'love-addiction'
    room.gameState = 'playing'
    room.gameData = {
      currentChallenge: randomChallenge,
      challengeType: 'question',
      answers: {},
      currentRound: 1,
      maxRounds: 5,
      timer: null,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        level: 1,
        totalPoints: 0,
        currentStreak: 0,
        achievements: []
      }))
    }
    
    const gameStartData = {
      gameType: 'love-addiction',
      gameMode: gameMode,
      currentChallenge: randomChallenge,
      challengeType: 'question',
      round: 1,
      maxRounds: 5,
      players: room.gameData.players,
      unlockedContent: ['basic-questions', 'sweet-dares'],
      dailyChallenge: {
        id: 'evening-intimacy',
        name: 'Evening Connection',
        points: 100,
        description: 'Share your deepest thought of the day',
        date: new Date().toDateString(),
        completed: false
      }
    }
    
    console.log('Love Addiction game started successfully')
    io.to(roomId).emit('love-addiction-started', gameStartData)
    
    // Start timer
    startLoveAddictionTimer(roomId, 180000)
  })
  
  // Submit answer for Love Addiction
  socket.on('submit-love-addiction-answer', (data) => {
    console.log('Love Addiction answer submitted:', data)
    const { roomId, answer, timeSpent } = data
    const room = rooms.get(roomId)
    
    if (!room || !room.gameData || room.currentGame !== 'love-addiction') {
      console.log('Invalid room or game state')
      return
    }
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) {
      console.log('Player not found in room')
      return
    }
    
    const gameData = room.gameData
    gameData.answers[player.id] = {
      answer: answer,
      timeSpent: timeSpent,
      timestamp: Date.now()
    }
    
    // Simple points calculation
    const basePoints = Math.max(10, Math.floor(50 - (timeSpent / 180000) * 30))
    const playerData = gameData.players.find(p => p.id === player.id)
    playerData.totalPoints += basePoints
    
    console.log('Answer stored successfully for player:', player.id)
    
    // Emit answer submitted
    io.to(roomId).emit('love-addiction-answer-submitted', {
      playerId: player.id,
      playerName: player.name,
      pointsEarned: basePoints,
      totalAnswers: Object.keys(gameData.answers).length,
      requiredAnswers: room.players.length
    })
    
    // Check if all players answered
    if (Object.keys(gameData.answers).length === room.players.length) {
      clearTimeout(room.gameData.timer)
      processLoveAddictionRound(roomId, room)
    }
  })
  
  // Timer function
  function startLoveAddictionTimer(roomId, duration) {
    const room = rooms.get(roomId)
    if (!room || !room.gameData) return
    
    if (room.gameData.timer) {
      clearTimeout(room.gameData.timer)
    }
    
    room.gameData.timer = setTimeout(() => {
      const currentRoom = rooms.get(roomId)
      if (!currentRoom || !currentRoom.gameData) return
      
      // Auto-submit empty answers for players who didn't respond
      currentRoom.players.forEach(player => {
        if (!currentRoom.gameData.answers[player.id]) {
          currentRoom.gameData.answers[player.id] = {
            answer: "Time's up! No response given.",
            timeSpent: duration,
            timestamp: Date.now(),
            timedOut: true
          }
        }
      })
      
      processLoveAddictionRound(roomId, currentRoom)
    }, duration)
  }
  
  // Process round results
  function processLoveAddictionRound(roomId, room) {
    const gameData = room.gameData
    
    // Send round results
    const roundResults = {
      answers: gameData.answers,
      challenge: gameData.currentChallenge,
      challengeType: gameData.challengeType,
      round: gameData.currentRound,
      players: gameData.players,
      updates: []
    }
    
    io.to(roomId).emit('love-addiction-round-result', roundResults)
    
    // Continue to next round or end game
    setTimeout(() => {
      if (gameData.currentRound >= gameData.maxRounds) {
        endLoveAddictionGame(roomId, room)
      } else {
        startNextLoveAddictionRound(roomId, room)
      }
    }, 5000)
  }
  
  // Start next round
  function startNextLoveAddictionRound(roomId, room) {
    const gameData = room.gameData
    gameData.currentRound += 1
    
    const loveQuestions = [
      "What's your favorite memory of us together?",
      "How do you feel when we're apart?",
      "What made you fall in love with me?",
      "Describe how you want to cuddle with me right now",
      "What's your dream date with me?",
      "What's one thing you love about my personality?",
      "What's your deepest fantasy about us?",
      "When do you feel most connected to me?",
      "What's something intimate you've never told me?",
      "How do you want me to show you love?"
    ]
    
    const currentChallenge = loveQuestions[Math.floor(Math.random() * loveQuestions.length)]
    
    gameData.currentChallenge = currentChallenge
    gameData.challengeType = 'question'
    gameData.answers = {}
    
    const nextRoundData = {
      round: gameData.currentRound,
      maxRounds: gameData.maxRounds,
      currentChallenge: currentChallenge,
      challengeType: 'question',
      players: gameData.players
    }
    
    io.to(roomId).emit('love-addiction-next-round', nextRoundData)
    startLoveAddictionTimer(roomId, 180000)
  }
  
  // End game
  function endLoveAddictionGame(roomId, room) {
    const gameData = room.gameData
    
    const sortedPlayers = gameData.players.sort((a, b) => b.totalPoints - a.totalPoints)
    const winner = sortedPlayers[0]
    
    const finalResults = {
      winner: winner,
      players: sortedPlayers,
      relationshipScore: 85,
      totalRounds: gameData.currentRound,
      gameMode: gameData.gameMode || 'progressive'
    }
    
    // Reset room state
    room.currentGame = null
    room.gameState = 'waiting'
    room.gameData = null
    
    io.to(roomId).emit('love-addiction-ended', finalResults)
  }
}

module.exports = { setupLoveAddictionHandlers }