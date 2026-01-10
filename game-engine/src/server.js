const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const RoomManager = require('./core/RoomManager');
const GameRegistry = require('./core/GameRegistry');
const EventManager = require('./core/EventManager');
const { DarkDesirePlugin } = require('./games/DarkDesire');

class GameServer {
  constructor(port = 3001) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize core components
    this.roomManager = new RoomManager();
    this.gameRegistry = new GameRegistry();
    this.eventManager = new EventManager(this.io, this.roomManager, this.gameRegistry);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.registerGames();
  }

  setupMiddleware() {
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Get available games
    this.app.get('/api/games', (req, res) => {
      const games = this.gameRegistry.getAvailableGames();
      res.json({ games });
    });

    // Get room info
    this.app.get('/api/room/:roomId', (req, res) => {
      const room = this.roomManager.getRoom(req.params.roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.json({ room: room.getPublicInfo() });
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle room creation
      socket.on('create_room', (data) => {
        try {
          const { playerName, gameType } = data;
          const playerId = playerName || socket.id;
          const { room, roomCode } = this.roomManager.createRoom(playerId, socket.id, gameType);
          
          socket.join(room.id);
          socket.emit('room_created', { roomId: room.id, roomCode, room });
          
          console.log(`Room created: ${roomCode} by ${playerId}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Handle room joining
      socket.on('join_room', (data) => {
        try {
          const { roomId, playerName } = data;
          const playerId = playerName || socket.id;
          
          // Find room by ID or code
          let room = this.roomManager.getRoom(roomId);
          if (!room) {
            // Try to find by room code
            room = this.roomManager.joinRoom(playerId, socket.id, roomId);
          } else {
            // Join by room ID (convert to code-based join)
            if (!room.guest && room.host.id !== playerId) {
              room.guest = {
                id: playerId,
                socketId: socket.id,
                role: 'guest',
                connected: true,
                joinedAt: new Date()
              };
              room.state = 'ready';
              this.roomManager.playerRooms.set(playerId, room.id);
            }
          }
          
          socket.join(room.id);
          socket.emit('room_joined', { roomId: room.id, room });
          
          // Notify both players
          this.io.to(room.id).emit('player_joined', { room });
          
          // Start game when both players ready
          if (room.state === 'ready' && room.host && room.guest) {
            this.startGame(room);
          }
          
          console.log(`Player ${playerId} joined room ${room.code}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Handle game events
      socket.on('game_event', (data) => {
        try {
          const { type, data: eventData } = data;
          
          // Find player's room
          const rooms = this.roomManager.getAllRooms();
          let playerRoom = null;
          let playerId = null;
          
          for (const room of rooms) {
            if (room.host && room.host.socketId === socket.id) {
              playerRoom = room;
              playerId = room.host.id;
              break;
            }
            if (room.guest && room.guest.socketId === socket.id) {
              playerRoom = room;
              playerId = room.guest.id;
              break;
            }
          }
          
          if (!playerRoom) {
            socket.emit('error', { message: 'Player not in any room' });
            return;
          }

          const gameInstance = this.gameRegistry.getGameInstance(playerRoom.id);
          if (!gameInstance) {
            socket.emit('error', { message: 'Game not found' });
            return;
          }

          const gameEvent = {
            type: type,
            playerId: playerId,
            data: eventData,
            timestamp: new Date()
          };

          gameInstance.onGameUpdate(gameEvent);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.handlePlayerDisconnect(socket.id);
      });
    });
  }

  registerGames() {
    // Register built-in games
    this.gameRegistry.registerGame(DarkDesirePlugin);
    
    console.log('Games registered:', this.gameRegistry.getAvailableGames());
  }

  startGame(room) {
    try {
      // Update room state
      this.roomManager.updateRoomState(room.id, 'in-game');
      
      // Create game instance
      const gameInstance = this.gameRegistry.createGameInstance(room, this.io);
      
      // Notify players about joining
      if (room.host) gameInstance.onPlayerJoin(room.host);
      if (room.guest) gameInstance.onPlayerJoin(room.guest);
      
      // Start the game
      gameInstance.onGameStart();
      
      console.log(`Game started in room ${room.code}`);
    } catch (error) {
      console.error('Error starting game:', error);
      this.io.to(room.id).emit('error', { message: 'Failed to start game' });
    }
  }

  handlePlayerDisconnect(socketId) {
    // Find player by socket ID
    const rooms = this.roomManager.getAllRooms();
    let disconnectedPlayer = null;
    let affectedRoom = null;

    for (const room of rooms) {
      if (room.host && room.host.socketId === socketId) {
        disconnectedPlayer = room.host;
        affectedRoom = room;
        break;
      }
      if (room.guest && room.guest.socketId === socketId) {
        disconnectedPlayer = room.guest;
        affectedRoom = room;
        break;
      }
    }

    if (!disconnectedPlayer || !affectedRoom) return;

    const result = this.roomManager.handlePlayerDisconnect(disconnectedPlayer.id);
    if (!result) return;

    const gameInstance = this.gameRegistry.getGameInstance(affectedRoom.id);
    if (gameInstance) {
      gameInstance.onPlayerDisconnect(disconnectedPlayer);
    }

    // Handle different disconnect scenarios
    switch (result.action) {
      case 'room_deleted':
        this.io.to(affectedRoom.id).emit('room_closed', { reason: 'Host disconnected' });
        if (gameInstance) {
          this.gameRegistry.removeGameInstance(affectedRoom.id);
        }
        break;
      
      case 'guest_left':
        this.io.to(affectedRoom.id).emit('player_left', { 
          player: disconnectedPlayer,
          room: result.room 
        });
        break;
      
      case 'player_disconnected':
        this.io.to(affectedRoom.id).emit('player_disconnected', { 
          player: disconnectedPlayer 
        });
        break;
    }

    console.log(`Player disconnected: ${disconnectedPlayer.id}, Action: ${result.action}`);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Game server running on port ${this.port}`);
      console.log(`Available games: ${this.gameRegistry.getAvailableGames().join(', ')}`);
    });
  }

  stop() {
    this.server.close();
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new GameServer();
  server.start();
}

module.exports = GameServer;