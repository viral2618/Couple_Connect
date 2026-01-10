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
const hostname = 'localhost'
const port = 3000

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

  // Import couples game handlers
  const { setupCouplesGameHandlers } = require('./src/lib/couplesGameHandlers')
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Setup couples game handlers for this socket
    setupCouplesGameHandlers(io, socket, rooms)

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
        
        socket.emit('room_created', {
          roomId: roomCode,
          roomCode: roomCode,
          room: room
        })
        
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
        
        socket.emit('room_joined', {
          roomId: data.roomCode,
          roomCode: data.roomCode,
          room: room
        })
        
        io.to(data.roomCode).emit('room-update', room)
        
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
        if (room.host.socketId === socket.id) {
          rooms.delete(roomCode)
          io.to(roomCode).emit('room_closed', { reason: 'Host disconnected' })
        } else if (room.guest && room.guest.socketId === socket.id) {
          room.guest = null
          room.players = room.players.filter(p => p.socketId !== socket.id)
          io.to(roomCode).emit('room-update', room)
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