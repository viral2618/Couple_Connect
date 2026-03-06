const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
// const { initializeWorkers, setupMediasoupHandlers } = require('./mediasoup-server')

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

// Video room management
const videoRooms = new Map()

// Game room management
const gameRooms = new Map()

// Add process handlers for graceful shutdown
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

app.prepare().then(async () => {
  // Initialize MediaSoup workers
  const mediasoupAvailable = false
  console.log('⚠ MediaSoup disabled - using simple WebRTC instead')
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
              "https://coupleconnect-production-67d9.up.railway.app",
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

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // MediaSoup handlers disabled

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

    // Game system handlers
    socket.on('game:create-room', ({ playerId, playerName }) => {
      console.log('🎲 Creating game room for:', playerName, playerId);
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room = {
        code,
        players: [{ id: playerId, name: playerName, score: 0 }],
        gameType: null,
        gameState: {
          currentRound: 1,
          totalRounds: 10,
          currentQuestion: null,
          answers: {},
          scores: {}
        },
        createdAt: Date.now()
      };
      gameRooms.set(code, room);
      socket.join(`game:${code}`);
      console.log('✅ Game room created, emitting update:', code);
      socket.emit('game:room-updated', room);
    });

    socket.on('game:join-room', ({ code, playerId, playerName }) => {
      console.log('🚪 Joining game room:', code, playerName, playerId);
      const room = gameRooms.get(code);
      if (!room) {
        console.log('❌ Room not found:', code);
        socket.emit('game:error', { message: 'Room not found' });
        return;
      }
      if (room.players.length >= 2) {
        console.log('❌ Room is full:', code);
        socket.emit('game:error', { message: 'Room is full' });
        return;
      }
      room.players.push({ id: playerId, name: playerName, score: 0 });
      socket.join(`game:${code}`);
      console.log('✅ Player joined, emitting update to room:', code);
      
      // Emit to all clients in room including the one who just joined
      setTimeout(() => {
        io.to(`game:${code}`).emit('game:room-updated', room);
        console.log('📤 Room update sent to all players in', code);
      }, 100);
    });

    socket.on('game:select-game', ({ code, gameType }) => {
      console.log('🎯 Game selection received:', gameType, 'for room:', code);
      const room = gameRooms.get(code);
      if (!room) {
        console.log('❌ Room not found for game selection:', code);
        socket.emit('game:error', { message: 'Room not found' });
        return;
      }
      room.gameType = gameType;
      room.gameState.status = 'playing';
      room.gameState.currentRound = 1;
      
      console.log('✅ Broadcasting game selection to room:', code, 'Players:', room.players.length);
      io.to(`game:${code}`).emit('game:room-updated', room);
      console.log(`🎮 Game ${gameType} selected for room ${code}`);
    });

    socket.on('game:request-question', async ({ code, category }) => {
      const room = gameRooms.get(code);
      if (!room) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/games/question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameType: room.gameType,
            category,
            playerNames: room.players.map(p => p.name)
          })
        });
        const question = await response.json();
        question.id = `q_${Date.now()}`;
        room.gameState.currentQuestion = question;
        io.to(`game:${code}`).emit('game:question-received', question);
      } catch (error) {
        console.error('Failed to generate question:', error);
      }
    });

    socket.on('game:submit-answer', ({ code, playerId, answer }) => {
      const room = gameRooms.get(code);
      if (!room) return;
      room.gameState.answers[playerId] = answer;
      io.to(`game:${code}`).emit('game:answer-received', { playerId, answer });
    });

    socket.on('game:next-round', ({ code }) => {
      const room = gameRooms.get(code);
      if (!room) return;
      room.gameState.currentRound++;
      room.gameState.currentQuestion = null;
      room.gameState.answers = {};
      io.to(`game:${code}`).emit('game:room-updated', room);
    });

    socket.on('game:vote-winner', async ({ code, winnerId, voterId }) => {
      const room = gameRooms.get(code);
      if (!room) return;
      
      // Update scores
      room.gameState.scores[winnerId] = (room.gameState.scores[winnerId] || 0) + 1;
      
      // Save to database
      try {
        await prisma.gameSession.upsert({
          where: { roomCode: code },
          update: {
            scores: room.gameState.scores,
            currentRound: room.gameState.currentRound
          },
          create: {
            roomCode: code,
            gameType: room.gameType,
            players: room.players.map(p => p.name),
            scores: room.gameState.scores,
            currentRound: room.gameState.currentRound
          }
        });
      } catch (error) {
        console.error('Failed to save game session:', error);
      }
      
      io.to(`game:${code}`).emit('game:scores-updated', room.gameState.scores);
      console.log(`Winner voted in room ${code}: ${winnerId}`);
    });

    socket.on('game:leave-room', ({ code, playerId }) => {
      const room = gameRooms.get(code);
      if (!room) return;
      room.players = room.players.filter(p => p.id !== playerId);
      if (room.players.length === 0) {
        gameRooms.delete(code);
      } else {
        io.to(`game:${code}`).emit('game:room-updated', room);
      }
      socket.leave(`game:${code}`);
    });

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

    // WebRTC signaling handlers
    socket.on('offer', ({ roomId, offer }) => {
      console.log(`[WebRTC] Relaying offer in room ${roomId}`)
      socket.to(roomId).emit('offer', { offer, userId: socket.id })
    })

    socket.on('answer', ({ roomId, answer }) => {
      console.log(`[WebRTC] Relaying answer in room ${roomId}`)
      socket.to(roomId).emit('answer', { answer })
    })

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      console.log(`[WebRTC] Relaying ICE candidate in room ${roomId}`)
      socket.to(roomId).emit('ice-candidate', { candidate })
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