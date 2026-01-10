class EventManager {
  constructor(io, roomManager, gameRegistry) {
    this.io = io;
    this.roomManager = roomManager;
    this.gameRegistry = gameRegistry;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Host creates room
      socket.on('create_room', (data) => {
        try {
          const { playerId, gameType } = data;
          const { room, roomCode } = this.roomManager.createRoom(playerId, socket.id, gameType);
          
          socket.join(room.id);
          socket.emit('room_created', { roomCode, room });
          
          console.log(`Room created: ${roomCode} by ${playerId}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Guest joins room
      socket.on('join_room', (data) => {
        try {
          const { playerId, roomCode } = data;
          const room = this.roomManager.joinRoom(playerId, socket.id, roomCode);
          
          socket.join(room.id);
          
          // Notify both players
          this.io.to(room.id).emit('player_joined', { room });
          
          // Start game when both players ready
          if (room.state === 'ready') {
            this.startGame(room);
          }
          
          console.log(`Player ${playerId} joined room ${roomCode}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Game events
      socket.on('game_event', (data) => {
        try {
          const { playerId, eventType, eventData } = data;
          const room = this.roomManager.getRoomByPlayer(playerId);
          
          if (!room) {
            socket.emit('error', { message: 'Player not in any room' });
            return;
          }

          const gameInstance = this.gameRegistry.getGameInstance(room.id);
          if (!gameInstance) {
            socket.emit('error', { message: 'Game not found' });
            return;
          }

          const gameEvent = {
            type: eventType,
            playerId: playerId,
            data: eventData,
            timestamp: new Date()
          };

          gameInstance.onGameUpdate(gameEvent);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket.id);
      });
    });
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
      
      // Notify players game started
      this.io.to(room.id).emit('game_started', { room });
      
      console.log(`Game started in room ${room.code}`);
    } catch (error) {
      console.error('Error starting game:', error);
      this.io.to(room.id).emit('error', { message: 'Failed to start game' });
    }
  }

  endGame(roomId, reason = 'completed') {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    const gameInstance = this.gameRegistry.getGameInstance(roomId);
    if (gameInstance) {
      gameInstance.onGameEnd(reason);
      this.gameRegistry.removeGameInstance(roomId);
    }

    this.roomManager.updateRoomState(roomId, 'finished');
    this.io.to(roomId).emit('game_ended', { reason });

    // Cleanup room after delay
    setTimeout(() => {
      this.roomManager.deleteRoom(roomId);
    }, 30000); // 30 seconds
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
}

module.exports = EventManager;