const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const { initializeWorkers, setupMediasoupHandlers } = require('./mediasoup-server')

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
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

const app = next({ dev })
const handle = app.getRequestHandler()

// Global room management for all features
const rooms = new Map()
const videoRooms = new Map()

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

app.prepare().then(async () => {
  // Initialize MediaSoup workers
  let mediasoupAvailable = false
  try {
    await initializeWorkers()
    mediasoupAvailable = true
    console.log('✓ MediaSoup workers initialized successfully')
  } catch (error) {
    console.error('✗ Failed to initialize MediaSoup workers:', error.message)
    console.log('⚠ Video calling will not be available. App will continue without it.')
  }
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
        ? function(origin, callback) {
            // Allow requests with no origin (mobile apps, etc.)
            if (!origin) return callback(null, true)
            
            const allowedOrigins = [
              process.env.NEXT_PUBLIC_APP_URL,
              "https://coupleconnect-production-35ae.up.railway.app",
              /https:\/\/.*\.up\.railway\.app$/,
              "https://couple-connect.vercel.app",
              /https:\/\/.*\.vercel\.app$/
            ]
            
            const isAllowed = allowedOrigins.some(allowed => {
              if (typeof allowed === 'string') {
                return allowed === origin
              } else if (allowed instanceof RegExp) {
                return allowed.test(origin)
              }
              return false
            })
            
            console.log(`CORS check - Origin: ${origin}, Allowed: ${isAllowed}`)
            callback(null, isAllowed)
          }
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["*"]
    },
    path: '/socket.io/',
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowEIO3: true,
    maxHttpBufferSize: 1e8,
    connectTimeout: 45000
  })

  // Import couples game handlers
  const { setupCouplesGameHandlers } = require('./src/lib/couplesGameHandlers-fixed')
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Setup MediaSoup handlers for video calling (only if available)
    if (mediasoupAvailable) {
      setupMediasoupHandlers(io, socket)
    }

    // Setup couples game handlers for this socket
    setupCouplesGameHandlers(io, socket, rooms)

    // Enhanced video calling system for 2-way calls only
    socket.on('join-video-room', ({ roomId, userId }) => {
      if (!roomId || !userId) {
        console.error('Invalid room or user ID:', { roomId, userId })
        socket.emit('video-error', { message: 'Invalid room or user ID' })
        return
      }
      
      console.log(`User ${userId} attempting to join video room: ${roomId}`)
      
      if (!videoRooms.has(roomId)) {
        videoRooms.set(roomId, { 
          users: new Map(), 
          createdAt: Date.now(), 
          maxUsers: 2,
          isActive: false
        })
        console.log(`Created new video room: ${roomId}`)
      }
      
      const room = videoRooms.get(roomId)
      
      // Check if room is full (only 2 users allowed)
      if (room.users.size >= room.maxUsers && !room.users.has(userId)) {
        console.log(`Room ${roomId} is full, rejecting user ${userId}`)
        socket.emit('video-error', { message: 'Video call is full. Only 2 people can join.' })
        return
      }
      
      // Remove user from any existing rooms first
      for (const [existingRoomId, existingRoom] of videoRooms.entries()) {
        if (existingRoom.users.has(userId) && existingRoomId !== roomId) {
          existingRoom.users.delete(userId)
          socket.leave(existingRoomId)
          socket.to(existingRoomId).emit('user-left-video', { userId, totalUsers: existingRoom.users.size })
          console.log(`Removed user ${userId} from existing room ${existingRoomId}`)
        }
      }
      
      // Add user to room
      room.users.set(userId, { 
        socketId: socket.id, 
        joinedAt: Date.now(),
        lastPing: Date.now()
      })
      socket.join(roomId)
      
      // Notify existing users about new user
      socket.to(roomId).emit('user-joined-video', { userId, totalUsers: room.users.size })
      
      // Send current room state to joining user
      const otherUsers = Array.from(room.users.keys()).filter(id => id !== userId)
      socket.emit('video-room-joined', { 
        roomId, 
        userId, 
        totalUsers: room.users.size,
        otherUsers
      })
      
      console.log(`User ${userId} joined video room: ${roomId}. Total users: ${room.users.size}, Other users: ${otherUsers.join(', ')}`)
    })

    socket.on('video-signal', ({ signal, roomId, userId, targetUserId }) => {
      if (!signal || !roomId || !userId) {
        console.error('Invalid signal data:', { signal: !!signal, roomId, userId })
        socket.emit('video-error', { message: 'Invalid signal data' })
        return
      }
      
      const room = videoRooms.get(roomId)
      if (!room || !room.users.has(userId)) {
        console.error(`User ${userId} not in video room ${roomId}`, { roomExists: !!room, userInRoom: room?.users.has(userId) })
        socket.emit('video-error', { message: 'User not in video room' })
        return
      }
      
      console.log(`Relaying ${signal.type || 'candidate'} signal from ${userId} in room ${roomId}`)
      
      // Update user's last activity
      const user = room.users.get(userId)
      if (user) {
        user.lastPing = Date.now()
      }
      
      // Send signal to specific user or broadcast to room
      if (targetUserId) {
        const targetUser = room.users.get(targetUserId)
        if (targetUser) {
          console.log(`Sending signal to specific user ${targetUserId} at socket ${targetUser.socketId}`)
          io.to(targetUser.socketId).emit('video-signal', { signal, userId, roomId })
        } else {
          console.error(`Target user ${targetUserId} not found in room ${roomId}`)
        }
      } else {
        console.log(`Broadcasting signal to room ${roomId} from ${userId}`)
        socket.to(roomId).emit('video-signal', { signal, userId, roomId })
      }
    })

    socket.on('leave-video-room', ({ roomId, userId }) => {
      if (!roomId || !userId) return
      
      console.log(`User ${userId} leaving video room: ${roomId}`)
      
      const room = videoRooms.get(roomId)
      if (room && room.users.has(userId)) {
        room.users.delete(userId)
        socket.leave(roomId)
        
        // Notify other users
        socket.to(roomId).emit('user-left-video', { userId, totalUsers: room.users.size })
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          videoRooms.delete(roomId)
          console.log(`Video room ${roomId} deleted - no users remaining`)
        }
      }
    })

    // Handle video call initiation
    socket.on('initiate-video-call', ({ roomId, userId, targetUserId }) => {
      const room = videoRooms.get(roomId)
      if (room && room.users.has(targetUserId)) {
        const targetUser = room.users.get(targetUserId)
        io.to(targetUser.socketId).emit('incoming-video-call', { 
          roomId, 
          callerId: userId,
          callerSocketId: socket.id
        })
      }
    })

    // Handle video call response
    socket.on('video-call-response', ({ roomId, callerId, accepted, userId }) => {
      const room = videoRooms.get(roomId)
      if (room && room.users.has(callerId)) {
        const callerUser = room.users.get(callerId)
        io.to(callerUser.socketId).emit('video-call-answered', { 
          accepted, 
          answeredBy: userId,
          roomId 
        })
        
        if (accepted) {
          room.isActive = true
          // Notify both users that call is starting
          io.to(roomId).emit('video-call-started', { roomId, participants: [callerId, userId] })
        }
      }
    })

    // Chat room management
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      socket.to(roomId).emit('user-joined', { userId: socket.id })
    })

    socket.on('send-message', (message) => {
      if (!message.roomId) return
      io.to(message.roomId).emit('receive-message', message)
    })

    socket.on('message-reaction', (data) => {
      if (!data.roomId) return
      socket.to(data.roomId).emit('message-reaction', { messageId: data.messageId, reactions: data.reactions })
    })

    // Universal signaling for video calls
    socket.on('signal', ({ signal, roomId, userId }) => {
      socket.to(roomId).emit('signal', { signal, userId })
    })

    socket.on('leave-room', ({ roomId, userId }) => {
      socket.to(roomId).emit('user-left', { userId })
      socket.leave(roomId)
    })

    // Handle disconnection cleanup
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      
      // Clean up video rooms
      for (const [roomId, room] of videoRooms.entries()) {
        for (const [userId, userData] of room.users.entries()) {
          if (userData.socketId === socket.id) {
            room.users.delete(userId)
            socket.to(roomId).emit('user-left-video', { userId, totalUsers: room.users.size })
            console.log(`Cleaned up user ${userId} from video room ${roomId} on disconnect`)
            
            if (room.users.size === 0) {
              videoRooms.delete(roomId)
              console.log(`Video room ${roomId} deleted on disconnect`)
            }
            break
          }
        }
      }
      
      // Clean up game rooms
      for (const [roomCode, room] of rooms.entries()) {
        if (room.host && room.host.socketId === socket.id) {
          // Host disconnected, notify guests and clean up
          socket.to(roomCode).emit('host_disconnected')
          if (room.gameData && room.gameData.timer) {
            clearTimeout(room.gameData.timer)
          }
          rooms.delete(roomCode)
          console.log(`Room ${roomCode} deleted - host disconnected`)
        } else if (room.guest && room.guest.socketId === socket.id) {
          // Guest disconnected
          room.guest = null
          room.players = room.players.filter(p => p.socketId !== socket.id)
          socket.to(roomCode).emit('guest_disconnected')
          console.log(`Guest left room ${roomCode}`)
        }
      }
    })

    // Handle room creation
    socket.on('create_room', (data) => {
      try {
        console.log('[CREATE_ROOM] Request received:', data)
        console.log('[CREATE_ROOM] Socket ID:', socket.id)
        console.log('[CREATE_ROOM] Socket connected:', socket.connected)
        
        const roomCode = generateRoomCode()
        const playerName = data.playerName || `Player_${socket.id.substring(0, 6)}`
        
        // Ensure socket joins the room FIRST
        socket.join(roomCode)
        console.log(`[CREATE_ROOM] Socket ${socket.id} created and joined room ${roomCode}`)
        
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
        console.log(`[CREATE_ROOM] Room stored in memory. Total rooms: ${rooms.size}`)
        
        const roomData = {
          id: room.id,
          code: room.code,
          host: { id: room.host.id },
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          gameState: room.gameState,
          currentGame: room.currentGame,
          scores: { ...room.scores }
        }
        
        socket.emit('room_created', {
          roomId: roomCode,
          roomCode: roomCode,
          room: roomData
        })
        console.log(`[CREATE_ROOM] Emitted room_created event to socket ${socket.id}`)
        
        // Confirm the host is connected
        socket.emit('players-connected', {
          totalPlayers: room.players.length,
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          canStartGame: false // Need 2 players
        })
        
        console.log(`[CREATE_ROOM] SUCCESS - Room ${roomCode} created by ${playerName}`)
      } catch (error) {
        console.error('[CREATE_ROOM] ERROR:', error)
        socket.emit('error', { message: error.message })
      }
    })

    // Handle room joining
    socket.on('join_room', (data) => {
      try {
        console.log('[JOIN_ROOM] Request received:', data)
        console.log('[JOIN_ROOM] Socket ID:', socket.id)
        console.log('[JOIN_ROOM] Available rooms:', Array.from(rooms.keys()))
        
        const room = rooms.get(data.roomCode)
        if (!room) {
          console.log('[JOIN_ROOM] Room not found:', data.roomCode)
          socket.emit('error', { message: 'Room not found' })
          return
        }
        
        if (room.guest) {
          console.log('[JOIN_ROOM] Room is full:', data.roomCode)
          socket.emit('error', { message: 'Room is full' })
          return
        }
        
        const playerName = data.playerName || `Player_${socket.id.substring(0, 6)}`
        
        // Ensure socket joins the room FIRST
        socket.join(data.roomCode)
        console.log(`[JOIN_ROOM] Socket ${socket.id} joined room ${data.roomCode}`)
        
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
        
        const roomData = {
          id: room.id,
          code: room.code,
          host: { id: room.host.id },
          guest: room.guest ? { id: room.guest.id } : null,
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          gameState: room.gameState,
          currentGame: room.currentGame,
          scores: { ...room.scores }
        }
        
        // Send confirmation to the joining player
        socket.emit('room_joined', {
          roomId: data.roomCode,
          roomCode: data.roomCode,
          room: roomData
        })
        console.log(`[JOIN_ROOM] Emitted room_joined to socket ${socket.id}`)
        
        // Notify all players in the room about the update
        io.to(data.roomCode).emit('room-update', roomData)
        console.log(`[JOIN_ROOM] Emitted room-update to room ${data.roomCode}`)
        
        // Send a specific event to confirm both players are connected
        io.to(data.roomCode).emit('players-connected', {
          totalPlayers: room.players.length,
          players: room.players.map(p => ({ id: p.id, name: p.name })),
          canStartGame: room.players.length >= 2
        })
        
        console.log(`[JOIN_ROOM] SUCCESS - Player ${playerName} joined room ${data.roomCode}. Total players: ${room.players.length}`)
      } catch (error) {
        console.error('[JOIN_ROOM] ERROR:', error)
        socket.emit('error', { message: error.message })
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