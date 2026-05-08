const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const path = require('path')



const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: ['query', 'info', 'warn', 'error'],
})

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => {
    console.error('Database connection failed:', error)
    process.exit(1)
  })

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 4000

// Create Express app
const app = express()
const server = createServer(app)

// Setup CORS
const allowedOrigins = dev 
  ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
  : [
      process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com",
      'https://coupleconnect-production-35ae.up.railway.app'
    ]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true
}))

app.use(express.json())

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      callback(null, true)
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Simple room management for chat/video
const rooms = new Map()

function generateRoomCode() {
  let code
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  } while (rooms.has(code))
  return code
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Unified room management for both chat and video calls
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`User joined room: ${roomId}`)
    socket.to(roomId).emit('user-joined', { userId: socket.id })
  })

  socket.on('send-message', (message) => {
    const roomId = message.roomId
    if (!roomId) {
      console.error('No roomId in message:', message)
      return
    }
    console.log('Broadcasting message to room:', roomId)
    io.to(roomId).emit('receive-message', message)
  })

  // Video call signaling (using same rooms)
  socket.on('signal', ({ signal, roomId, userId }) => {
    console.log(`Signal from ${userId} in room ${roomId}`)
    socket.to(roomId).emit('signal', { signal, userId })
  })

  socket.on('leave-room', ({ roomId, userId }) => {
    console.log(`User ${userId} leaving room ${roomId}`)
    socket.to(roomId).emit('user-left', { userId })
    socket.leave(roomId)
  })

  // Game room creation
  socket.on('game:create-room', (data) => {
    try {
      console.log('🎮 Game room creation request:', data)
      const roomCode = generateRoomCode()
      const playerId = data.playerId
      const playerName = data.playerName
      
      const room = {
        id: roomCode,
        code: roomCode,
        players: [{
          id: playerId,
          name: playerName,
          socketId: socket.id,
          score: 0,
          isOwner: true
        }],
        gameType: null,
        gameState: {
          status: 'waiting',
          currentRound: 1,
          totalRounds: 10,
          currentQuestion: null,
          answers: {},
          scores: {},
          currentTurn: null
        },
        createdAt: Date.now(),
        maxPlayers: 2
      }
      
      rooms.set(roomCode, room)
      socket.join(roomCode)
      
      socket.emit('game:room-updated', room)
      console.log('✅ Game room created:', roomCode)
    } catch (error) {
      console.error('❌ Error creating game room:', error)
      socket.emit('game:error', { message: error.message })
    }
  })

  // Game room joining
  socket.on('game:join-room', (data) => {
    try {
      console.log('🚪 Game room join request:', data)
      const room = rooms.get(data.code)
      
      if (!room) {
        socket.emit('game:error', { message: 'Room not found' })
        return
      }
      
      if (room.players.length >= room.maxPlayers) {
        socket.emit('game:error', { message: 'Room is full' })
        return
      }
      
      room.players.push({
        id: data.playerId,
        name: data.playerName,
        socketId: socket.id,
        score: 0,
        isOwner: false
      })
      
      socket.join(data.code)
      io.to(data.code).emit('game:room-updated', room)
      console.log('✅ Player joined game room:', data.code)
    } catch (error) {
      console.error('❌ Error joining game room:', error)
      socket.emit('game:error', { message: error.message })
    }
  })

  // Game selection
  socket.on('game:select-game', (data) => {
    try {
      console.log('🎯 Game selection:', data)
      const room = rooms.get(data.code)
      
      if (!room) {
        socket.emit('game:error', { message: 'Room not found' })
        return
      }
      
      room.gameType = data.gameType
      room.gameState.status = 'playing'
      
      io.to(data.code).emit('game:room-updated', room)
      console.log('✅ Game selected:', data.gameType)
    } catch (error) {
      console.error('❌ Error selecting game:', error)
      socket.emit('game:error', { message: error.message })
    }
  })

  // Leave game room
  socket.on('game:leave-room', (data) => {
    try {
      const room = rooms.get(data.code)
      if (room) {
        room.players = room.players.filter(p => p.id !== data.playerId)
        if (room.players.length === 0) {
          rooms.delete(data.code)
        } else {
          io.to(data.code).emit('game:room-updated', room)
        }
      }
      socket.leave(data.code)
    } catch (error) {
      console.error('❌ Error leaving game room:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Clean up game rooms
    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players?.findIndex(p => p.socketId === socket.id)
      
      if (playerIndex !== undefined && playerIndex !== -1) {
        const player = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        
        if (room.players.length === 0) {
          // Delete empty room
          rooms.delete(roomCode)
          console.log('🗑️ Empty game room deleted:', roomCode)
        } else {
          // Notify remaining players
          io.to(roomCode).emit('game:room-updated', room)
          console.log('🚪 Player left game room:', roomCode)
        }
      }
      
      // Legacy room cleanup
      if (room.host && room.host.socketId === socket.id) {
        if (room.gameData && room.gameData.timer) {
          clearTimeout(room.gameData.timer)
        }
        rooms.delete(roomCode)
        io.to(roomCode).emit('room_closed', { reason: 'Host disconnected' })
      } else if (room.guest && room.guest.socketId === socket.id) {
        room.guest = null
        if (room.players) {
          room.players = room.players.filter(p => p.socketId !== socket.id)
        }
        
        const roomUpdateData = {
          id: room.id,
          code: room.code,
          host: room.host ? { id: room.host.id } : null,
          guest: null,
          players: room.players ? room.players.map(p => ({ id: p.id, name: p.name })) : [],
          gameState: room.gameState,
          currentGame: room.currentGame,
          scores: room.scores || {}
        }
        
        io.to(roomCode).emit('room-update', roomUpdateData)
      }
    }
  })
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...')
  for (const [roomCode, room] of rooms.entries()) {
    if (room.gameData && room.gameData.timer) {
      clearTimeout(room.gameData.timer)
    }
  }
  prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up...')
  for (const [roomCode, room] of rooms.entries()) {
    if (room.gameData && room.gameData.timer) {
      clearTimeout(room.gameData.timer)
    }
  }
  prisma.$disconnect()
  process.exit(0)
})

server
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`)
    console.log(`> Game server integrated on same port`)
  })
