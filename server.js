const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: ['query', 'info', 'warn', 'error'],
})

// Test database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => {
    console.error('Database connection failed:', error)
    process.exit(1)
  })
// Database retry utility
async function retryDatabaseOperation(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined room ${userId}`)
    })

    // Game room events
    socket.on('join-game-room', async (data) => {
      const { roomId, playerId, playerName } = data
      
      try {
        let gameRoom = await retryDatabaseOperation(() => 
          prisma.gameRoom.findUnique({ where: { roomId } })
        )
        
        if (!gameRoom) {
          socket.emit('error', 'Room not found')
          return
        }
        
        // Check if player already exists in room
        const playerExists = gameRoom.players.find(p => p.id === playerId)
        
        if (playerExists) {
          // Update socket ID for existing player (reconnection)
          const updatedPlayers = gameRoom.players.map(p => 
            p.id === playerId ? { ...p, socketId: socket.id } : p
          )
          
          gameRoom = await retryDatabaseOperation(() => 
            prisma.gameRoom.update({
              where: { roomId },
              data: { players: updatedPlayers }
            })
          )
        } else if (gameRoom.players.length < 2) {
          // Add new player to room
          const newPlayer = { id: playerId, name: playerName, socketId: socket.id }
          const updatedPlayers = [...gameRoom.players, newPlayer]
          
          const scores = { ...gameRoom.scores }
          scores[playerId] = 0
          
          gameRoom = await retryDatabaseOperation(() => 
            prisma.gameRoom.update({
              where: { roomId },
              data: {
                players: updatedPlayers,
                scores
              }
            })
          )
        } else {
          socket.emit('error', 'Room is full')
          return
        }
        
        socket.join(roomId)
        console.log(`Player ${playerName} joined room ${roomId}`)
        
        // Emit room update to all players in room
        io.to(roomId).emit('room-update', {
          players: gameRoom.players,
          gameState: gameRoom.gameState,
          currentRound: gameRoom.currentRound,
          statements: gameRoom.statements,
          scores: gameRoom.scores,
          hostId: gameRoom.hostId
        })
        
      } catch (error) {
        console.error('Error joining game room:', error)
        socket.emit('error', 'Database connection failed. Please try again.')
      }
    })

    socket.on('create-game-room', async (data) => {
      const { roomId, playerId, playerName } = data
      
      try {
        // Check if room already exists
        const existingRoom = await prisma.gameRoom.findUnique({
          where: { roomId }
        })
        
        if (existingRoom) {
          socket.emit('error', 'Room ID already exists')
          return
        }
        
        const gameRoom = await prisma.gameRoom.create({
          data: {
            roomId,
            hostId: playerId,
            players: [{ id: playerId, name: playerName, socketId: socket.id }],
            scores: { [playerId]: 0 }
          }
        })
        
        socket.join(roomId)
        
        socket.emit('room-created', {
          players: gameRoom.players,
          gameState: gameRoom.gameState,
          currentRound: gameRoom.currentRound,
          statements: gameRoom.statements,
          scores: gameRoom.scores,
          hostId: gameRoom.hostId
        })
      } catch (error) {
        console.error('Error creating game room:', error)
        socket.emit('error', 'Failed to create room')
      }
    })

    socket.on('start-game', async (roomId) => {
      try {
        const gameRoom = await prisma.gameRoom.findUnique({
          where: { roomId }
        })
        
        if (!gameRoom) {
          socket.emit('error', 'Room not found')
          return
        }
        
        if (gameRoom.players.length !== 2) {
          socket.emit('error', 'Need 2 players to start')
          return
        }
        
        const updatedRoom = await prisma.gameRoom.update({
          where: { roomId },
          data: { gameState: 'playing' }
        })
        
        io.to(roomId).emit('game-start', {
          players: updatedRoom.players,
          gameState: updatedRoom.gameState,
          currentRound: updatedRoom.currentRound,
          statements: updatedRoom.statements,
          scores: updatedRoom.scores,
          hostId: updatedRoom.hostId
        })
        
        // Start 1-minute timer for input phase
        setTimeout(() => {
          io.to(roomId).emit('timer-expired', { phase: 'input' })
        }, 60000) // 1 minute
        
      } catch (error) {
        console.error('Error starting game:', error)
        socket.emit('error', 'Failed to start game')
      }
    })

    socket.on('submit-statements', async (data) => {
      const { roomId, playerId, statements, lieIndex } = data
      
      try {
        const gameRoom = await prisma.gameRoom.findUnique({
          where: { roomId }
        })
        
        if (gameRoom) {
          const currentStatements = gameRoom.statements
          currentStatements[playerId] = { statements, lieIndex }
          
          await prisma.gameRoom.update({
            where: { roomId },
            data: { statements: currentStatements }
          })
          
          io.to(roomId).emit('statements-submitted', { 
            playerId, 
            ready: Object.keys(currentStatements).length === 2 
          })
          
          if (Object.keys(currentStatements).length === 2) {
            await prisma.gameRoom.update({
              where: { roomId },
              data: { gameState: 'guessing' }
            })
            
            const updatedRoom = await prisma.gameRoom.findUnique({
              where: { roomId }
            })
            
            // Start 2-minute timer for guessing phase
            setTimeout(() => {
              io.to(roomId).emit('timer-expired', { phase: 'guess' })
            }, 120000) // 2 minutes
            
            io.to(roomId).emit('guessing-phase', {
              players: updatedRoom.players,
              gameState: updatedRoom.gameState,
              currentRound: updatedRoom.currentRound,
              statements: updatedRoom.statements,
              scores: updatedRoom.scores,
              hostId: updatedRoom.hostId
            })
          }
        }
      } catch (error) {
        console.error('Error submitting statements:', error)
      }
    })

    socket.on('make-guess', async (data) => {
      const { roomId, playerId, guessIndex, targetPlayerId } = data
      
      try {
        const gameRoom = await prisma.gameRoom.findUnique({
          where: { roomId }
        })
        
        if (gameRoom) {
          // Store the guess in the game room
          const guesses = gameRoom.guesses || {}
          guesses[playerId] = { guessIndex, targetPlayerId }
          
          await prisma.gameRoom.update({
            where: { roomId },
            data: { guesses }
          })
          
          
          // Check if both players have made their guesses
          const bothPlayersGuessed = Object.keys(guesses).length === gameRoom.players.length
          
          io.to(roomId).emit('player-guessed', {
            playerId,
            bothPlayersGuessed
          })
          
          if (bothPlayersGuessed) {
            
            // Process results for both players
            const results = {}
            const scores = { ...gameRoom.scores }
            
            for (const [guesserPlayerId, guessData] of Object.entries(guesses)) {
              const targetStatements = gameRoom.statements[guessData.targetPlayerId]
              const isCorrect = targetStatements.lieIndex === guessData.guessIndex
              
              if (isCorrect) {
                scores[guesserPlayerId] += 1
              }
              
              results[guesserPlayerId] = {
                guessIndex: guessData.guessIndex,
                isCorrect,
                lieIndex: targetStatements.lieIndex
              }
            }
            
            await prisma.gameRoom.update({
              where: { roomId },
              data: { scores, guesses: {} }
            })
            
            io.to(roomId).emit('guess-result', {
              results,
              scores
            })
            
            // Check if round is complete
            setTimeout(async () => {
              const currentRoom = await prisma.gameRoom.findUnique({
                where: { roomId }
              })
              
              if (currentRoom.currentRound < 3) {
                const updatedRoom = await prisma.gameRoom.update({
                  where: { roomId },
                  data: {
                    currentRound: currentRoom.currentRound + 1,
                    statements: {},
                    gameState: 'playing'
                  }
                })
                
                io.to(roomId).emit('next-round', {
                  players: updatedRoom.players,
                  gameState: updatedRoom.gameState,
                  currentRound: updatedRoom.currentRound,
                  statements: updatedRoom.statements,
                  scores: updatedRoom.scores,
                  hostId: updatedRoom.hostId
                })
              } else {
                await prisma.gameRoom.update({
                  where: { roomId },
                  data: { gameState: 'finished' }
                })
                
                io.to(roomId).emit('game-finished', { 
                  scores: scores, 
                  players: currentRoom.players 
                })
              }
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Error making guess:', error)
      }
    })

    socket.on('restart-game', async (roomId) => {
      try {
        const gameRoom = await prisma.gameRoom.findUnique({
          where: { roomId }
        })
        
        if (gameRoom) {
          const resetScores = {}
          gameRoom.players.forEach(player => {
            resetScores[player.id] = 0
          })
          
          const updatedRoom = await prisma.gameRoom.update({
            where: { roomId },
            data: {
              gameState: 'playing',
              currentRound: 1,
              statements: {},
              scores: resetScores
            }
          })
          
          io.to(roomId).emit('game-restart', {
            players: updatedRoom.players,
            gameState: updatedRoom.gameState,
            currentRound: updatedRoom.currentRound,
            statements: updatedRoom.statements,
            scores: updatedRoom.scores,
            hostId: updatedRoom.hostId
          })
        }
      } catch (error) {
        console.error('Error restarting game:', error)
      }
    })

    socket.on('send-message', (data) => {
      
      // Send to receiver's room
      io.to(data.receiverId).emit('receive-message', data)
      
      // Send to sender's room (so they see their own message)
      io.to(data.senderId).emit('receive-message', data)
      
    })

    socket.on('typing', (data) => {
      io.to(data.receiverId).emit('typing')
    })

    socket.on('stop-typing', (data) => {
      io.to(data.receiverId).emit('stop-typing')
    })

    socket.on('disconnect', async () => {
      
      try {
        // Find and update game rooms where this socket was a player
        const gameRooms = await prisma.gameRoom.findMany({
          where: { isActive: true }
        })
        
        for (const room of gameRooms) {
          const updatedPlayers = room.players.filter(p => p.socketId !== socket.id)
          
          if (updatedPlayers.length !== room.players.length) {
            if (updatedPlayers.length === 0) {
              // Delete room from database when empty
              await prisma.gameRoom.delete({
                where: { id: room.id }
              })
              console.log(`Room ${room.roomId} deleted - no players remaining`)
            } else {
              await prisma.gameRoom.update({
                where: { id: room.id },
                data: { players: updatedPlayers }
              })
              
              io.to(room.roomId).emit('player-disconnected', {
                players: updatedPlayers,
                gameState: room.gameState,
                currentRound: room.currentRound,
                statements: room.statements,
                scores: room.scores,
                hostId: room.hostId
              })
            }
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    })
  })

  // Cleanup old rooms every 30 minutes
  setInterval(async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      const deletedRooms = await prisma.gameRoom.deleteMany({
        where: {
          OR: [
            { isActive: false },
            { updatedAt: { lt: thirtyMinutesAgo } }
          ]
        }
      })
      if (deletedRooms.count > 0) {
        console.log(`Cleaned up ${deletedRooms.count} old game rooms`)
      }
    } catch (error) {
      console.error('Error cleaning up rooms:', error)
    }
  }, 30 * 60 * 1000) // Run every 30 minutes

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})