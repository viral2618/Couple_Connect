import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

interface Player {
  id: string
  name: string
  socketId: string
}

interface Room {
  id: string
  code: string
  host: { id: string; socketId: string }
  guest: { id: string; socketId: string } | null
  players: Player[]
  gameState: string
  hostId: string
  currentGame: string
  currentRound: number
  maxRounds: number
  scores: Record<string, number>
}

interface VideoRoom {
  users: Map<string, { socketId: string; joinedAt: number }>
  createdAt: number
  maxUsers: number
  isActive: boolean
}

const rooms = new Map<string, Room>()
const videoRooms = new Map<string, VideoRoom>()

function generateRoomCode() {
  let code
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  } while (rooms.has(code))
  return code
}

export async function GET(req: NextRequest) {
  if (!(global as any).io) {
    const httpServer = new NetServer()
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Video room handlers
      socket.on('join-video-room', ({ roomId, userId }) => {
        if (!roomId || !userId) {
          socket.emit('video-error', { message: 'Invalid room or user ID' })
          return
        }
        
        if (!videoRooms.has(roomId)) {
          videoRooms.set(roomId, { 
            users: new Map(), 
            createdAt: Date.now(), 
            maxUsers: 2,
            isActive: false
          })
        }
        
        const room = videoRooms.get(roomId)!
        
        if (room.users.size >= room.maxUsers && !room.users.has(userId)) {
          socket.emit('video-error', { message: 'Video call is full. Only 2 people can join.' })
          return
        }
        
        room.users.set(userId, { socketId: socket.id, joinedAt: Date.now() })
        socket.join(roomId)
        
        socket.to(roomId).emit('user-joined-video', { userId, totalUsers: room.users.size })
        socket.emit('video-room-joined', { 
          roomId, 
          userId, 
          totalUsers: room.users.size,
          otherUsers: Array.from(room.users.keys()).filter(id => id !== userId)
        })
      })

      // Game room handlers
      socket.on('game:create-room', ({ playerId, playerName }) => {
        console.log('🎲 Creating game room for:', playerName, 'Socket:', socket.id)
        try {
          const roomCode = generateRoomCode()
          
          const gameRoom = {
            code: roomCode,
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
          }
          
          rooms.set(roomCode, gameRoom as any)
          socket.join(roomCode)
          
          console.log('✅ Game room created:', roomCode, 'Socket joined room')
          socket.emit('game:room-updated', gameRoom)
        } catch (error) {
          console.error('❌ Failed to create game room:', error)
          socket.emit('game:error', { message: 'Failed to create room' })
        }
      })

      socket.on('game:join-room', ({ code, playerId, playerName }) => {
        console.log('🚪 Joining game room:', code, playerName, 'Socket:', socket.id)
        try {
          const gameRoom = rooms.get(code) as any
          if (!gameRoom) {
            console.error('❌ Room not found:', code)
            socket.emit('game:error', { message: 'Room not found' })
            return
          }
          
          if (gameRoom.players.length >= 2) {
            console.error('❌ Room full:', code)
            socket.emit('game:error', { message: 'Room is full' })
            return
          }
          
          gameRoom.players.push({ id: playerId, name: playerName, score: 0 })
          socket.join(code)
          
          console.log('✅ Player joined. Total:', gameRoom.players.length, 'Broadcasting update...')
          io.to(code).emit('game:room-updated', gameRoom)
        } catch (error) {
          console.error('❌ Failed to join game room:', error)
          socket.emit('game:error', { message: 'Failed to join room' })
        }
      })

      socket.on('game:select-game', ({ code, gameType }) => {
        console.log('🎮 Game selected:', gameType, 'for room:', code, 'by socket:', socket.id)
        const gameRoom = rooms.get(code) as any
        if (gameRoom) {
          gameRoom.gameType = gameType
          console.log('✅ Broadcasting to room:', code, 'Players:', gameRoom.players.length)
          console.log('📡 Room sockets:', io.sockets.adapter.rooms.get(code))
          io.to(code).emit('game:room-updated', gameRoom)
          console.log('✅ Broadcast complete. GameType:', gameType)
        } else {
          console.error('❌ Room not found:', code)
        }
      })

      // Room creation
      socket.on('create_room', (data) => {
        try {
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
              players: room.players.map((p: Player) => ({ id: p.id, name: p.name })),
              gameState: room.gameState,
              currentGame: room.currentGame,
              scores: { ...room.scores }
            }
          })
        } catch (error) {
          socket.emit('error', { message: 'Failed to create room' })
        }
      })

      // Room joining
      socket.on('join_room', (data) => {
        try {
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
              players: room.players.map((p: Player) => ({ id: p.id, name: p.name })),
              gameState: room.gameState,
              currentGame: room.currentGame,
              scores: { ...room.scores }
            }
          })
        } catch (error) {
          socket.emit('error', { message: 'Failed to join room' })
        }
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    ;(global as any).io = io
  }

  return new Response('Socket.IO server initialized', { status: 200 })
}