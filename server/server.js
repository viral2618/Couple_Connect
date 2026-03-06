const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const path = require('path')

// Import game server
const GameServer = require('./game-engine/src/server')

// Try to import mediasoup handlers (optional)
let setupMediasoupHandlers = null
let initializeWorkers = null
try {
  const mediasoup = require('../mediasoup-server')
  setupMediasoupHandlers = mediasoup.setupMediasoupHandlers
  initializeWorkers = mediasoup.initializeWorkers
  console.log('[Server] MediaSoup module loaded')
} catch (err) {
  console.log('[Server] MediaSoup not available, video calling disabled')
}

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
const port = process.env.PORT || 3000

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
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS check - Origin:', origin, 'Allowed:', false)
      callback(null, true) // Allow all in production for now
    }
  },
  credentials: true
}))

app.use(express.json())

// Serve client build files in production
if (!dev) {
  app.use(express.static(path.join(__dirname, '../client/.next/static')))
  app.use(express.static(path.join(__dirname, '../client/public')))
  
  // Handle client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return next()
    }
    // Serve the client app
    res.sendFile(path.join(__dirname, '../client/.next/server/pages/index.html'))
  })
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        console.log('CORS check - Origin:', origin, 'Allowed: true')
        callback(null, true)
      } else {
        console.log('CORS check - Origin:', origin, 'Allowed: true (permissive)')
        callback(null, true)
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Simple room management for chat/video
const rooms = new Map()
const videoRooms = new Map()

// Initialize MediaSoup workers if available
if (initializeWorkers) {
  initializeWorkers().catch(err => {
    console.error('[Server] Failed to initialize MediaSoup:', err)
    console.log('[Server] Video calling will not be available')
  })
}

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

// Import couples game handlers
const { setupCouplesGameHandlers } = require('../client/src/lib/couplesGameHandlers')

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Setup couples game handlers for this socket
  setupCouplesGameHandlers(io, socket, rooms)

  // Setup mediasoup handlers for video calling if available
  if (setupMediasoupHandlers) {
    setupMediasoupHandlers(io, socket)
  }

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

  // Video call room management
  socket.on('join-video-room', ({ roomId, userId }) => {
    console.log(`User ${userId} attempting to join video room: ${roomId}`)
    
    if (!videoRooms.has(roomId)) {
      videoRooms.set(roomId, new Set())
      console.log(`Created new video room: ${roomId}`)
    }
    
    const room = videoRooms.get(roomId)
    const otherUsers = Array.from(room).filter(id => id !== userId)
    
    room.add(userId)
    socket.join(roomId)
    
    console.log(`User ${userId} joined video room: ${roomId}. Total users: ${room.size}, Other users: ${otherUsers.join(', ')}`)
    socket.emit('video-room-joined', { roomId, otherUsers })
    socket.to(roomId).emit('user-joined-video', { userId })
  })

  socket.on('leave-video-room', ({ roomId, userId }) => {
    console.log(`User ${userId} leaving video room ${roomId}`)
    const room = videoRooms.get(roomId)
    if (room) {
      room.delete(userId)
      if (room.size === 0) {
        videoRooms.delete(roomId)
        console.log(`Video room ${roomId} deleted`)
      }
    }
    socket.to(roomId).emit('user-left-video', { userId })
    socket.leave(roomId)
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

  // Handle room creation
  socket.on('create_room', (data) => {
    try {
      console.log('Create room request:', data)
      
      const roomCode = generateRoomCode()
      const playerName = data.playerName || `Player_${socket.id.substring(0, 6)}`
      
      const room = {
        id: roomCode,
        code: roomCode,
        host: {
          id: playerName,
          socketId: socket.id
        },
        guest: null,
        players: [{
          id: playerName,
          name: playerName,
          socketId: socket.id
        }],
        gameState: 'waiting',
        hostId: playerName,
        currentGame: 'menu',
        currentRound: 0,
        maxRounds: 3,
        scores: { [playerName]: 0 }
      }
      
      rooms.set(roomCode, room)
      socket.join(roomCode)
      
      // Create clean room data for emission
      const roomCreatedData = {
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
      }
      
      socket.emit('room_created', roomCreatedData)
      
      console.log('Room created:', roomCode, 'by', playerName)
    } catch (error) {
      console.error('Error creating room:', error)
      socket.emit('error', { message: error.message })
    }
  })

  // Handle room joining
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
      
      room.guest = {
        id: playerName,
        socketId: socket.id
      }
      
      room.players.push({
        id: playerName,
        name: playerName,
        socketId: socket.id
      })
      
      room.scores[playerName] = 0
      
      socket.join(data.roomCode)
      
      // Create clean room data for emission
      const roomJoinedData = {
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
      }
      
      socket.emit('room_joined', roomJoinedData)
      
      // Create clean room update data
      const roomUpdateData = {
        id: room.id,
        code: room.code,
        host: { id: room.host.id },
        guest: room.guest ? { id: room.guest.id } : null,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        gameState: room.gameState,
        currentGame: room.currentGame,
        scores: { ...room.scores }
      }
      
      io.to(data.roomCode).emit('room-update', roomUpdateData)
      
      console.log('Player', playerName, 'joined room:', data.roomCode)
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: error.message })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Clean up video rooms
    for (const [roomId, room] of videoRooms.entries()) {
      for (const userId of room) {
        // Find if this socket was in this room (we need to track socket-to-user mapping)
        room.delete(userId)
        socket.to(roomId).emit('user-left-video', { userId })
        console.log(`Cleaned up user ${userId} from video room ${roomId} on disconnect`)
      }
      if (room.size === 0) {
        videoRooms.delete(roomId)
        console.log(`Video room ${roomId} deleted on disconnect`)
      }
    }
    
    // Clean up rooms when players disconnect
    for (const [roomCode, room] of rooms.entries()) {
      if (room.host && room.host.socketId === socket.id) {
        // Clean up any timers if they exist
        if (room.gameData && room.gameData.timer) {
          clearTimeout(room.gameData.timer)
        }
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
})

// Add process handlers for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...')
  // Clean up all room timers
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
  // Clean up all room timers
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