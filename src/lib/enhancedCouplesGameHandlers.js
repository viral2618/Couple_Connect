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

  // Helper function to find room by socket ID
  function findRoomBySocket(socketId) {
    for (const [code, roomData] of rooms.entries()) {
      if (roomData.players && roomData.players.some(p => p.socketId === socketId)) {
        return { room: roomData, roomId: code }
      }
    }
    return { room: null, roomId: null }
  }

  const gameQuestions = {
    'love-questions': [
      "What's the most seductive thing I could whisper in your ear that would make you lose all control?",
      "Describe in vivid detail how you want me to touch you when we're finally alone...",
      "What's your most forbidden fantasy about us that makes your heart race just thinking about it?",
      "If you could have me do anything to drive you wild with desire right now, what would it be?",
      "What part of my body do you fantasize about most when you're missing me?",
      "Tell me about the moment you wanted me so intensely you could barely breathe...",
      "What's the naughtiest thought you've had about me that you're dying to confess?",
      "Describe your perfect scenario for seducing me completely...",
      "What would you do if I appeared at your door wearing only your favorite perfume?",
      "What's the most intense way you want me to show you how much I crave you?",
      "Tell me the secret thing about me that turns you on more than anything else...",
      "What do you imagine doing to me in your wildest, most passionate dreams?",
      "Describe how you'd seduce me if you had me all to yourself for an entire night...",
      "What's your deepest desire about us that you've never dared to voice?",
      "Tell me what you think about when you see me that makes you want me desperately..."
    ],
    'intimate-dares': [
      "Take a photo with your most seductive bedroom eyes and caption it 'You're all I think about...' 😏🔥",
      "Send a picture of your lips with a kiss mark and write 'This kiss belongs to you' 💋❤️",
      "Capture yourself in your most alluring pose wearing something that makes you feel irresistible 🔥📸",
      "Take a selfie with tousled hair like you just woke up from dreaming about me 😴💭",
      "Send a photo of you biting your lip with the caption 'Wishing you were here to kiss me...' 😘🤤",
      "Capture a picture showing your neck/collarbone with the text 'Kiss me here...' 💋💕",
      "Take a photo of your hands with the message 'Imagine these touching you...' 👋🔥",
      "Send a mirror selfie with your most confident, seductive expression 🪞💪",
      "Capture yourself in dim lighting with the caption 'Thinking of you in the dark...' 🌙💭",
      "Take a photo of your silhouette with 'You make me feel beautiful' 🌅✨",
      "Send a picture of you winking with 'This is just for you, baby' 😉💕",
      "Capture yourself blowing a kiss with 'Sending you all my love' 😘💋",
      "Take a selfie showing your favorite feature with 'What do you love most about me?' ✨😍",
      "Send a photo in cozy clothes with 'Wish you were cuddling me right now' 🤗🛌",
      "Capture a playful pose with 'Come play with me...' 🎭😈",
      "Take a picture of your eyes with 'These eyes are only for you' 👀❤️",
      "Send a photo of you stretching with 'Good morning, gorgeous' 🌅😊",
      "Capture yourself with wet hair like you just got out of the shower 🚿💦",
      "Take a selfie with the caption 'Feeling sexy and thinking of you' 😏🔥",
      "Send a picture of you in your favorite lingerie or underwear 👙😈"
    ],
    'truth-or-dare': [
      "What's the most intense moment of pure desire you've felt for me that left you breathless?",
      "When do you feel most sexually attracted to me and what exactly triggers that overwhelming need?",
      "What's your biggest secret turn-on about me that I probably don't even realize drives you wild?",
      "Describe the exact moment you knew you were completely addicted to me, body and soul...",
      "What do I do that makes you want me so desperately you can barely think straight?",
      "Tell me about a time you wanted to rip my clothes off but had to control yourself...",
      "What's your most vivid sexual fantasy about us that you replay over and over?",
      "When did you first realize you were falling for me and what made you feel that way?",
      "What part of foreplay with me do you crave most when we're apart?",
      "Describe the most romantic thing I could do that would make you melt completely...",
      "What's something I wear that makes you want to undress me immediately?",
      "Tell me about your most intense dream about us that you woke up wanting more...",
      "What do you love most about the way I kiss you that no one else has ever done?",
      "When do you feel most emotionally and physically connected to me?",
      "What's your secret wish for something new you want to try with me in bed?"
    ]
  }

  function startRoundTimer(roomId) {
    const room = rooms.get(roomId)
    if (!room || !room.gameData) return
    
    // Clear existing timer if any
    if (room.gameData.timer) {
      clearTimeout(room.gameData.timer)
    }
    
    room.gameData.timer = setTimeout(async () => {
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
      
      setTimeout(async () => {
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
          
          // Get next unique question
          const questions = gameQuestions[room.currentGame] || gameQuestions['love-questions']
          const usedQuestions = room.gameData.usedQuestions || []
          const availableQuestions = questions.filter(q => !usedQuestions.includes(q))
          const nextQuestion = availableQuestions.length > 0 
            ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
            : questions[Math.floor(Math.random() * questions.length)]
          
          if (!room.gameData.usedQuestions) room.gameData.usedQuestions = []
          room.gameData.usedQuestions.push(nextQuestion)
          
          room.gameData.question = nextQuestion
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

  socket.on('start-couples-game', async (data) => {
    console.log('Game start request:', data)
    const { roomId, gameType } = data
    
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      const found = findRoomBySocket(socket.id)
      room = found.room
      actualRoomId = found.roomId
      if (actualRoomId) console.log('Found room by socket ID:', actualRoomId)
    }
    
    if (!room) {
      console.log('Room not found:', roomId)
      socket.emit('error', 'Room not found')
      return
    }
    
    console.log('Room found with', room.players.length, 'players')
    
    if (room.players.length < 2) {
      console.log('Not enough players:', room.players.length)
      socket.emit('error', 'Need 2 players to start')
      return
    }
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player || player.id !== room.hostId) {
      console.log('Not host. Player:', player?.id, 'HostId:', room.hostId)
      socket.emit('error', 'Only the host can start the game')
      return
    }
    
    // Calculate intimacy level based on game progression
    const intimacyLevel = Math.min(8, 3 + Math.floor(Math.random() * 3))
    
    // Get random question from static array
    const questions = gameQuestions[gameType] || gameQuestions['love-questions']
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    
    console.log('Starting game:', gameType, 'Question:', randomQuestion)
    
    room.currentGame = gameType
    room.gameState = 'playing'
    room.scores = {}
    room.players.forEach(p => { room.scores[p.id] = 0 })
    room.gameData = {
      question: randomQuestion,
      answers: {},
      currentRound: 1,
      maxRounds: 3,
      timer: null,
      roundStartTime: Date.now(),
      allPhotos: {},
      usedQuestions: [randomQuestion]
    }
    
    const gameStartedData = {
      roomId: actualRoomId,
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
    
    console.log('Emitting game-started to room:', actualRoomId)
    console.log('Game data:', gameData)
    
    io.to(actualRoomId).emit('game-started', gameStartedData)
    io.to(actualRoomId).emit('game-data', gameData)
    
    console.log('Game started successfully for room:', actualRoomId)
    
    startRoundTimer(actualRoomId)
  })

  // Seductive Secrets game handlers
  socket.on('start-seductive-secrets', async (data) => {
    console.log('Seductive Secrets start request:', data)
    const { roomId, gameMode, mood } = data
    
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      const found = findRoomBySocket(socket.id)
      room = found.room
      actualRoomId = found.roomId
      if (actualRoomId) console.log('Found room by socket ID:', actualRoomId)
    }
    
    if (!room) {
      console.log('Room not found:', roomId)
      socket.emit('error', 'Room not found')
      return
    }')
      return
    }
    
    if (room.players.length < 2) {
      console.log('Not enough players:', room.players.length)
      socket.emit('error', 'Need 2 players to start')
      return
    }
    
    const intimacyLevel = Math.min(8, 2 + Math.floor(Math.random() * 2))
    
    // Get random secret from static content
    const secretTypes = ['confession', 'fantasy', 'desire', 'memory', 'dare']
    const randomCategory = secretTypes[Math.floor(Math.random() * secretTypes.length)]
    const levelContent = seductiveSecretsContent[`level${intimacyLevel}`]
    let randomSecret = 'Loading secret...'
    
    if (levelContent && levelContent[randomCategory]) {
      const secrets = levelContent[randomCategory]
      randomSecret = secrets[Math.floor(Math.random() * secrets.length)]
    }
    
    room.currentGame = 'seductive-secrets'
    room.gameState = 'playing'
    room.gameData = {
      currentSecret: randomSecret,
      secretType: randomCategory,
      intimacyLevel: intimacyLevel,
      round: 1,
      maxRounds: 8,
      mood: mood || 'passionate',
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
      roomId: actualRoomId,
      gameType: 'seductive-secrets',
      currentSecret: randomSecret,
      secretType: randomCategory,
      intimacyLevel: intimacyLevel,
      round: 1,
      maxRounds: 8,
      mood: mood || 'passionate',
      players: room.gameData.players
    }
    
    console.log('Emitting seductive-secrets-started with data:', gameStartData)
    
    io.to(actualRoomId).emit('seductive-secrets-started', gameStartData)
    io.to(actualRoomId).emit('game-started', { ...gameStartData, gameState: 'playing' })
    io.to(actualRoomId).emit('game-data', gameStartData)
    
    console.log('Seductive Secrets game started for room:', actualRoomId)
  })

  socket.on('submit-seductive-secrets-response', async (data) => {
    console.log('Seductive Secrets response submitted:', data)
    const { roomId, response, timeSpent, intimacyLevel, secretType } = data
    
    // Find room
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      const found = findRoomBySocket(socket.id)
      room = found.room
      actualRoomId = found.roomId
      if (actualRoomId) console.log('Found room by socket ID:', actualRoomId)
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
    
    // Initialize game data objects
    if (!room.gameData.responses) room.gameData.responses = {}
    if (!room.gameData.players) room.gameData.players = []
    
    room.gameData.responses[player.id] = {
      response,
      timeSpent,
      intimacyLevel,
      secretType,
      timestamp: Date.now()
    }
    
    // Update player stats with enhanced scoring
    const playerData = room.gameData.players.find(p => p.id === player.id)
    if (playerData) {
      const basePoints = Math.max(15, 60 - Math.floor(timeSpent / 1000))
      const intimacyBonus = intimacyLevel * 5
      const totalPoints = basePoints + intimacyBonus
      
      playerData.totalPoints = (playerData.totalPoints || 0) + totalPoints
      playerData.intimacyRating = Math.min(100, (playerData.intimacyRating || 0) + intimacyLevel)
    }
    
    io.to(actualRoomId).emit('answer-submitted', {
      playerId: player.id,
      playerName: player.name,
      totalResponses: Object.keys(room.gameData.responses).length,
      requiredResponses: room.players.length
    })
    
    // Check if all players responded
    if (Object.keys(room.gameData.responses).length === room.players.length) {
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
      
      setTimeout(async () => {
        const currentRoom = rooms.get(actualRoomId)
        if (!currentRoom || !currentRoom.gameData) return
        
        if (currentRoom.gameData.round >= currentRoom.gameData.maxRounds) {
          io.to(actualRoomId).emit('seductive-secrets-ended', {
            players: currentRoom.gameData.players,
            seductionScore: 85,
            finalStats: {
              totalSecrets: currentRoom.gameData.round,
              maxIntimacy: currentRoom.gameData.intimacyLevel
            }
          })
        } else {
          currentRoom.gameData.round++
          
          // Generate next secret from static content
          const newLevel = Math.min(8, Math.floor(currentRoom.gameData.round / 2) + 2)
          currentRoom.gameData.intimacyLevel = newLevel
          
          const secretTypes = ['confession', 'fantasy', 'desire', 'memory', 'dare']
          const randomCategory = secretTypes[Math.floor(Math.random() * secretTypes.length)]
          const levelContent = seductiveSecretsContent[`level${newLevel}`]
          let nextSecret = 'Loading next secret...'
          
          if (levelContent && levelContent[randomCategory]) {
            const secrets = levelContent[randomCategory]
            nextSecret = secrets[Math.floor(Math.random() * secrets.length)]
          }
          
          if (nextSecret) {
            currentRoom.gameData.currentSecret = nextSecret
            currentRoom.gameData.secretType = randomCategory
            currentRoom.gameData.responses = {}
            
            io.to(actualRoomId).emit('seductive-secrets-next-round', {
              currentSecret: nextSecret,
              secretType: randomCategory,
              intimacyLevel: newLevel,
              round: currentRoom.gameData.round,
              players: currentRoom.gameData.players,
              mood: currentRoom.gameData.mood
            })
          } else {
            // Fallback to static content as last resort
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
        }
      }, 3000)
    }
  })

  socket.on('skip-seductive-secrets-challenge', (data) => {
    const { roomId } = data
    
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      const found = findRoomBySocket(socket.id)
      room = found.room
      actualRoomId = found.roomId
    }
    
    if (!room || !room.gameData || !room.players) return
    
    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) return
    
    if (!room.gameData.responses) room.gameData.responses = {}
    
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

  socket.on('submit-answer', async (data) => {
    console.log('Answer submitted:', data)
    const { roomId, answer, hasPhoto, submissionTime } = data
    
    let room = null
    let actualRoomId = roomId
    
    if (roomId) {
      room = rooms.get(roomId)
    } else {
      const found = findRoomBySocket(socket.id)
      room = found.room
      actualRoomId = found.roomId
      if (actualRoomId) console.log('Found room by socket ID:', actualRoomId)
    }
    
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
    
    if (room.gameData.answers && room.gameData.answers[player.id]) {
      console.log('Player already submitted answer:', player.id)
      socket.emit('error', 'You have already submitted your answer')
      return
    }
    
    if (!room.gameData.answers) room.gameData.answers = {}
    if (!room.gameData.roundStartTime) room.gameData.roundStartTime = Date.now()
    if (!room.scores) room.scores = {}
    if (!room.gameData.allPhotos) room.gameData.allPhotos = {}
    
    // Enhanced points calculation
    const timeElapsed = Date.now() - room.gameData.roundStartTime
    const speedBonus = Math.max(0, 40 - Math.floor(timeElapsed / 1000)) // Up to 40 points for speed
    const photoPoints = hasPhoto ? 60 : 0 // 60 points for photo
    const completionPoints = 25 // 25 points for completing
    const seductionBonus = Math.floor(Math.random() * 15) + 5 // Random seduction bonus 5-20
    const totalPoints = photoPoints + speedBonus + completionPoints + seductionBonus
    
    // Store answer with enhanced points
    room.gameData.answers[player.id] = { 
      text: answer, 
      hasPhoto, 
      playerName: player.name,
      points: totalPoints,
      speedBonus,
      photoPoints,
      completionPoints,
      seductionBonus
    }
    
    // Store photo for final gallery
    if (hasPhoto) {
      if (!room.gameData.allPhotos[player.id]) room.gameData.allPhotos[player.id] = []
      room.gameData.allPhotos[player.id].push({
        photo: answer,
        round: room.gameData.currentRound,
        question: room.gameData.question,
        points: totalPoints
      })
    }
    
    // Update total score
    room.scores[player.id] = (room.scores[player.id] || 0) + totalPoints
    
    console.log('Answer stored for player:', player.id, 'Points earned:', totalPoints)
    
    const messages = hasPhoto ? [
      `Stunning photo! +${totalPoints} points! 📸🔥`,
      `Absolutely seductive! +${totalPoints} points! 😍💕`,
      `You're irresistible! +${totalPoints} points! 🔥❤️`
    ] : [
      `Perfect answer! +${totalPoints} points! 💕`,
      `So seductive! +${totalPoints} points! 😘`,
      `Amazing response! +${totalPoints} points! ✨`
    ]
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    socket.emit('answer-confirmed', {
      playerId: player.id,
      points: totalPoints,
      message: randomMessage
    })
    
    io.to(actualRoomId).emit('answer-submitted', {
      playerId: player.id,
      playerName: player.name,
      hasPhoto,
      points: totalPoints,
      totalAnswers: Object.keys(room.gameData.answers).length,
      requiredAnswers: room.players.length,
      message: hasPhoto ? `${player.name} shared something seductive! +${totalPoints}pts 🔥📸` : `${player.name} gave a perfect answer! +${totalPoints}pts 💕`
    })
    
    const totalAnswers = Object.keys(room.gameData.answers).length
    const requiredAnswers = room.players.length
    
    console.log(`Answers received: ${totalAnswers}/${requiredAnswers}`)
    
    if (totalAnswers === requiredAnswers) {
      if (room.gameData.timer) {
        clearTimeout(room.gameData.timer)
        room.gameData.timer = null
      }
      
      const roundResultData = {
        answers: { ...room.gameData.answers },
        scores: { ...room.scores },
        round: room.gameData.currentRound,
        question: room.gameData.question,
        message: "Round complete! The chemistry is electric! 💖🔥",
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        showResults: true
      }
      
      io.to(actualRoomId).emit('round-result', roundResultData)
      
      setTimeout(async () => {
        const currentRoom = rooms.get(actualRoomId)
        if (!currentRoom || !currentRoom.gameData) return
        
        if (currentRoom.gameData.currentRound >= currentRoom.gameData.maxRounds) {
          console.log('Game finished - calculating winner')
          currentRoom.gameState = 'finished'
          
          // Determine winner
          const playerScores = currentRoom.players.map(p => ({
            id: p.id,
            name: p.name,
            score: currentRoom.scores[p.id] || 0,
            photos: currentRoom.gameData.allPhotos[p.id] || []
          }))
          
          playerScores.sort((a, b) => b.score - a.score)
          const winner = playerScores[0]
          const isTie = playerScores.length > 1 && playerScores[0].score === playerScores[1].score
          
          const finishedRoomData = {
            id: currentRoom.id,
            gameState: currentRoom.gameState,
            scores: { ...currentRoom.scores },
            players: currentRoom.players.map(p => ({ id: p.id, name: p.name })),
            winner: isTie ? null : winner,
            isTie,
            playerScores,
            allPhotos: currentRoom.gameData.allPhotos,
            gameType: currentRoom.currentGame
          }
          
          io.to(actualRoomId).emit('game-finished', finishedRoomData)
        } else {
          console.log('Starting next round with static questions')
          currentRoom.gameData.currentRound++
          
          // Get next unique question
          const questions = gameQuestions[currentRoom.currentGame] || gameQuestions['love-questions']
          const usedQuestions = currentRoom.gameData.usedQuestions || []
          const availableQuestions = questions.filter(q => !usedQuestions.includes(q))
          const nextQuestion = availableQuestions.length > 0 
            ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
            : questions[Math.floor(Math.random() * questions.length)]
          
          if (!currentRoom.gameData.usedQuestions) currentRoom.gameData.usedQuestions = []
          currentRoom.gameData.usedQuestions.push(nextQuestion)
          
          currentRoom.gameData.question = nextQuestion
          currentRoom.gameData.answers = {}
          currentRoom.gameData.roundStartTime = Date.now()
          
          const newRoundData = {
            round: currentRoom.gameData.currentRound,
            question: currentRoom.gameData.question,
            maxRounds: currentRoom.gameData.maxRounds,
            gameType: currentRoom.currentGame,
            gameState: 'playing',
            answers: {},
            showResults: false,
            scores: { ...currentRoom.scores },
            message: `Round ${currentRoom.gameData.currentRound} - The heat is rising! 🔥💕`
          }
          
          io.to(actualRoomId).emit('new-round', newRoundData)
          startRoundTimer(actualRoomId)
        }
      }, 5000)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    for (const [roomCode, room] of rooms.entries()) {
      if (room.host && room.host.socketId === socket.id) {
        cleanupRoomData(room)
        rooms.delete(roomCode)
        io.to(roomCode).emit('room_closed', { reason: 'Host disconnected' })
      } else if (room.guest && room.guest.socketId === socket.id) {
        room.guest = null
        room.players = room.players.filter(p => p.socketId !== socket.id)
        
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