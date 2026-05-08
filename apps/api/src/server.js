const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const path = require('path')

require('dotenv').config()

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

const app = express()
const server = createServer(app)

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://your-app.vercel.app',
  'https://coupleconnect-production-67d9.up.railway.app'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('railway.app')) {
      callback(null, true)
    } else {
      console.warn('⚠️ Blocked by CORS:', origin)
      callback(null, true)
    }
  },
  credentials: true
}))

app.use(express.json())

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('railway.app')) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
})

const rooms = new Map()

function generateRoomCode() {
  let code
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  } while (rooms.has(code))
  return code
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

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

  socket.on('signal', ({ signal, roomId, userId }) => {
    console.log(`Signal from ${userId} in room ${roomId}`)
    socket.to(roomId).emit('signal', { signal, userId })
  })

  socket.on('leave-room', ({ roomId, userId }) => {
    console.log(`User ${userId} leaving room ${roomId}`)
    socket.to(roomId).emit('user-left', { userId })
    socket.leave(roomId)
  })

  socket.on('user-typing', ({ roomId, userId, userName, isTyping }) => {
    console.log(`User ${userName} typing in ${roomId}:`, isTyping)
    socket.to(roomId).emit('user-typing', { userId, userName, isTyping })
  })

  socket.on('create_room', (data) => {
    try {
      console.log('Create room request:', data)
      const roomCode = generateRoomCode()
      const playerName = data.playerName || `Player_${socket.id.substring(0, 6)}`
      
      const room = {
        id: roomCode,
        code: roomCode,
        host: { id: playerName, socketId: socket.id },
        guest: null,
        players: [{ id: playerName, name: playerName, socketId: socket.id }],
        gameState: 'waiting',
        hostId: playerName,
        currentGame: 'menu',
        currentRound: 0,
        maxRounds: 3,
        scores: { [playerName]: 0 }
      }
      
      rooms.set(roomCode, room)
      socket.join(roomCode)
      
      socket.emit('room_created', {
        roomId: roomCode,
        roomCode: roomCode,
        room: {
          id: room.id,
          code: room.code,
          host: { id: room.host.id },
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          gameState: room.gameState,
          currentGame: room.currentGame,
          scores: { ...room.scores }
        }
      })
      console.log('✅ Room created:', roomCode, 'by', playerName)
    } catch (error) {
      console.error('Error creating room:', error)
      socket.emit('error', { message: error.message })
    }
  })

  socket.on('join_room', (data) => {
    try {
      console.log('Join room request:', data)
      const room = rooms.get(data.roomCode)
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }
      if (room.guest) {
        socket.emit('error', { message: 'Room is full' })
        return
      }
      
      const playerName = data.playerName || `Player_${socket.id.substring(0, 6)}`
      room.guest = { id: playerName, socketId: socket.id }
      room.players.push({ id: playerName, name: playerName, socketId: socket.id })
      room.scores[playerName] = 0
      socket.join(data.roomCode)
      
      socket.emit('room_joined', {
        roomId: data.roomCode,
        roomCode: data.roomCode,
        room: {
          id: room.id,
          code: room.code,
          host: { id: room.host.id },
          guest: room.guest ? { id: room.guest.id } : null,
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          gameState: room.gameState,
          currentGame: room.currentGame,
          scores: { ...room.scores }
        }
      })
      
      io.to(data.roomCode).emit('room-update', {
        id: room.id,
        code: room.code,
        host: { id: room.host.id },
        guest: room.guest ? { id: room.guest.id } : null,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        gameState: room.gameState,
        currentGame: room.currentGame,
        scores: { ...room.scores }
      })
      console.log('✅ Player', playerName, 'joined room:', data.roomCode)
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: error.message })
    }
  })

  socket.on('game:create-room', (data) => {
    try {
      const roomCode = generateRoomCode()
      const room = {
        id: roomCode,
        code: roomCode,
        players: [{
          id: data.playerId,
          name: data.playerName,
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
          scores: { [data.playerId]: 0 },
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
      socket.emit('game:error', { message: error.message })
    }
  })

  socket.on('game:join-room', (data) => {
    try {
      const room = rooms.get(data.code)
      if (!room) return socket.emit('game:error', { message: 'Room not found' })
      if (room.players.length >= room.maxPlayers) return socket.emit('game:error', { message: 'Room is full' })

      room.players.push({
        id: data.playerId,
        name: data.playerName,
        socketId: socket.id,
        score: 0,
        isOwner: false
      })
      room.gameState.scores[data.playerId] = 0
      socket.join(data.code)
      io.to(data.code).emit('game:room-updated', room)
      console.log('✅ Player joined game room:', data.code)
    } catch (error) {
      socket.emit('game:error', { message: error.message })
    }
  })

  socket.on('game:select-game', (data) => {
    try {
      const room = rooms.get(data.code)
      if (!room) return socket.emit('game:error', { message: 'Room not found' })
      room.gameType = data.gameType
      room.gameState.status = 'playing'
      room.gameState.currentRound = 1
      io.to(data.code).emit('game:room-updated', room)
    } catch (error) {
      socket.emit('game:error', { message: error.message })
    }
  })

  socket.on('game:leave-room', (data) => {
    const room = rooms.get(data.code)
    if (room) {
      room.players = room.players.filter(p => p.id !== data.playerId)
      if (room.players.length === 0) {
        rooms.delete(data.code)
      } else {
        if (!room.players.some(p => p.isOwner)) room.players[0].isOwner = true
        io.to(data.code).emit('game:room-updated', room)
      }
    }
    socket.leave(data.code)
  })

  // Seductive Ludo Events 🎲🔥
  socket.on('ludo:game-start', (data) => {
    try {
      const room = rooms.get(data.roomCode)
      if (!room) return
      room.gameState.playerPositions = data.positions
      room.gameState.currentTurn = data.firstTurn
      io.to(data.roomCode).emit('ludo:game-started', {
        positions: data.positions,
        firstTurn: data.firstTurn
      })
      console.log('🎮 Ludo game started in room:', data.roomCode)
    } catch (error) {
      console.error('Ludo start error:', error)
    }
  })

  socket.on('ludo:roll-dice', (data) => {
    try {
      io.to(data.roomCode).emit('ludo:dice-rolled', {
        playerId: data.playerId,
        value: data.value
      })
      console.log('🎲 Dice rolled:', data.value, 'by', data.playerId)
    } catch (error) {
      console.error('Dice roll error:', error)
    }
  })

  socket.on('ludo:move-player', (data) => {
    try {
      const room = rooms.get(data.roomCode)
      if (!room) return
      if (!room.gameState.playerPositions) room.gameState.playerPositions = {}
      room.gameState.playerPositions[data.playerId] = data.newPosition
      room.gameState.currentTask = data.task
      io.to(data.roomCode).emit('ludo:player-moved', {
        playerId: data.playerId,
        newPosition: data.newPosition,
        task: data.task
      })
      console.log('🚶 Player moved to:', data.newPosition)
    } catch (error) {
      console.error('Move player error:', error)
    }
  })

  socket.on('ludo:complete-task', (data) => {
    try {
      const room = rooms.get(data.roomCode)
      if (!room) return
      room.gameState.currentTask = null
      room.gameState.currentTurn = data.nextTurn
      room.gameState.taskCompleted = true
      io.to(data.roomCode).emit('ludo:task-completed', {
        playerId: data.playerId,
        nextTurn: data.nextTurn
      })
      console.log('✅ Task completed by:', data.playerId)
    } catch (error) {
      console.error('Complete task error:', error)
    }
  })

  socket.on('ludo:skip-task', (data) => {
    try {
      const room = rooms.get(data.roomCode)
      if (!room) return
      room.gameState.currentTask = null
      room.gameState.currentTurn = data.nextTurn
      room.gameState.taskCompleted = false
      io.to(data.roomCode).emit('ludo:task-skipped', {
        playerId: data.playerId,
        nextTurn: data.nextTurn,
        penalty: data.penalty
      })
      console.log('⏭️ Task skipped by:', data.playerId, 'penalty:', data.penalty)
    } catch (error) {
      console.error('Skip task error:', error)
    }
  })

  socket.on('ludo:win-game', (data) => {
    try {
      const room = rooms.get(data.roomCode)
      if (!room) return
      room.gameState.status = 'finished'
      io.to(data.roomCode).emit('ludo:game-won', {
        winner: data.winner
      })
      console.log('🏆 Game won by:', data.winner.name)
    } catch (error) {
      console.error('Win game error:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
    for (const [roomCode, room] of rooms.entries()) {
      if (room.players) {
        const idx = room.players.findIndex(p => p.socketId === socket.id)
        if (idx !== -1) {
          room.players.splice(idx, 1)
          if (room.players.length === 0) {
            rooms.delete(roomCode)
          } else {
            if (!room.players.some(p => p.isOwner)) room.players[0].isOwner = true
            io.to(roomCode).emit('game:room-updated', room)
          }
          continue
        }
      }
      if (room.host && room.host.socketId === socket.id) {
        rooms.delete(roomCode)
        io.to(roomCode).emit('room_closed', { reason: 'Host disconnected' })
      } else if (room.guest && room.guest.socketId === socket.id) {
        room.guest = null
        room.players = room.players?.filter(p => p.socketId !== socket.id) || []
        io.to(roomCode).emit('room-update', {
          id: room.id, code: room.code,
          host: { id: room.host.id }, guest: null,
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          gameState: room.gameState, currentGame: room.currentGame, scores: { ...room.scores }
        })
      }
    }
  })
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...')
  prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up...')
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
    console.log(`> Socket.IO ready for game connections`)
  })
