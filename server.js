const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

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
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Simple room management
const rooms = new Map()

function generateRoomCode() {
  let code
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  } while (rooms.has(code))
  return code
}

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
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Import couples game handlers
  const { setupCouplesGameHandlers } = require('./src/lib/couplesGameHandlers-fixed')
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Setup couples game handlers for this socket
    setupCouplesGameHandlers(io, socket, rooms)

    // Video call room management with security
    const videoRooms = new Map()
    
    // Secure video room joining with validation
    socket.on('join-video-room', ({ roomId, userId }) => {
      try {
        console.log(`[VIDEO] Join request - Room: ${roomId}, User: ${userId}, Socket: ${socket.id}`)
        
        // Skip validation for test users - allow any test-user-* to join test rooms
        if (userId.startsWith('test-user-') && roomId.includes('test-user-')) {
          console.log(`[VIDEO] Test user access granted - Room: ${roomId}, User: ${userId}`)
        } else {
          // Normal validation for real users
          if (!roomId || typeof roomId !== 'string' || !roomId.includes('-')) {
            socket.emit('video-error', { message: 'Invalid room ID format' })
            return
          }
          
          if (!userId || typeof userId !== 'string') {
            socket.emit('video-error', { message: 'Invalid user ID' })
            return
          }
        }
        
        socket.join(roomId)
        
        // Initialize room if it doesn't exist
        if (!videoRooms.has(roomId)) {
          videoRooms.set(roomId, {
            users: new Set(),
            createdAt: Date.now(),
            maxUsers: 2
          })
          console.log(`[VIDEO] Created new room: ${roomId}`)
        }
        
        const room = videoRooms.get(roomId)
        
        // Check if user is already in the room
        if (room.users.has(userId)) {
          console.log(`[VIDEO] User ${userId} already in room ${roomId}`)
          return
        }
        
        // Check room capacity
        if (room.users.size >= room.maxUsers) {
          console.log(`[VIDEO] Room ${roomId} is full`)
          socket.emit('video-error', { message: 'Room is full' })
          return
        }
        
        room.users.add(userId)
        
        console.log(`[VIDEO] User ${userId} joined video room: ${roomId} (${room.users.size}/${room.maxUsers} users)`)
        
        // Notify other users in the room that this user joined
        socket.to(roomId).emit('user-joined-video', { userId })
        
      } catch (error) {
        console.error('[VIDEO] Error joining video room:', error)
        socket.emit('video-error', { message: 'Failed to join video room' })
      }
    })

    // Secure video signaling with validation
    socket.on('video-signal', ({ signal, roomId, userId }) => {
      try {
        console.log(`[VIDEO] Signal from ${userId} in room ${roomId}:`, signal.type || 'candidate')
        
        // Validate inputs
        if (!signal || !roomId || !userId) {
          console.log('[VIDEO] Invalid signal data')
          socket.emit('video-error', { message: 'Invalid signal data' })
          return
        }
        
        // Skip validation for test users
        if (userId.startsWith('test-user-') && roomId.includes('test-user-')) {
          // Allow test users to signal without validation
          console.log(`[VIDEO] Test user signal allowed - ${userId} in ${roomId}`)
        } else {
          // Normal validation for real users would go here
          // Add any additional validation for real users if needed
        }
        
        // Validate signal structure (basic WebRTC signal validation)
        if (typeof signal !== 'object' || (!signal.type && !signal.candidate)) {
          console.log('[VIDEO] Invalid signal format:', signal)
          socket.emit('video-error', { message: 'Invalid signal format' })
          return
        }
        
        console.log(`[VIDEO] Broadcasting signal from ${userId} to room ${roomId}`)
        socket.to(roomId).emit('video-signal', { signal, userId })
        
      } catch (error) {
        console.error('[VIDEO] Error handling video signal:', error)
        socket.emit('video-error', { message: 'Failed to process signal' })
      }
    })

    // Secure video room leaving
    socket.on('leave-video-room', ({ roomId, userId }) => {
      try {
        if (!roomId || !userId) return
        
        console.log(`[VIDEO] User ${userId} leaving video room ${roomId}`)
        socket.to(roomId).emit('user-left-video', { userId })
        socket.leave(roomId)
        
        // Clean up room data
        const room = videoRooms.get(roomId)
        if (room) {
          room.users.delete(userId)
          console.log(`[VIDEO] Room ${roomId} now has ${room.users.size} users`)
          if (room.users.size === 0) {
            videoRooms.delete(roomId)
            console.log(`[VIDEO] Deleted empty room ${roomId}`)
          }
        }
        
      } catch (error) {
        console.error('[VIDEO] Error leaving video room:', error)
      }
    })

    // Regular chat room management
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`User joined chat room: ${roomId}`)
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

    // Legacy video call signaling (keeping for backward compatibility)
    socket.on('signal', ({ signal, roomId, userId }) => {
      console.log(`Legacy signal from ${userId} in room ${roomId}`)
      socket.to(roomId).emit('signal', { signal, userId })
    })

    socket.on('leave-room', ({ roomId, userId }) => {
      console.log(`User ${userId} leaving chat room ${roomId}`)
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

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})