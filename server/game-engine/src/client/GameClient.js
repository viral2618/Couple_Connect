const io = require('socket.io-client');

class GameClient {
  constructor(serverUrl = 'http://localhost:3000') {
    this.socket = io(serverUrl);
    this.playerId = null;
    this.roomId = null;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to game server');
    });

    this.socket.on('room_created', (data) => {
      console.log('Room created:', data);
      this.roomId = data.roomId;
    });

    this.socket.on('room_joined', (data) => {
      console.log('Joined room:', data);
      this.playerId = data.playerId;
      this.roomId = data.roomId;
    });

    this.socket.on('player_joined', (data) => {
      console.log('Player joined:', data);
    });

    this.socket.on('game_started', (data) => {
      console.log('Game started:', data);
    });

    this.socket.on('game_state_update', (data) => {
      console.log('Game state updated:', data);
    });

    this.socket.on('game_ended', (data) => {
      console.log('Game ended:', data);
    });

    this.socket.on('error', (error) => {
      console.error('Error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  // Create a new room
  createRoom(gameType = 'dummy', playerName = 'Player1') {
    this.socket.emit('create_room', {
      gameType,
      playerName
    });
  }

  // Join existing room
  joinRoom(roomCode, playerName = 'Player2') {
    this.socket.emit('join_room', {
      roomCode,
      playerName
    });
  }

  // Send game event
  sendGameEvent(eventType, data = {}) {
    this.socket.emit('game_event', {
      type: eventType,
      ...data
    });
  }

  // Make a move (example for dummy game)
  makeMove(move) {
    this.sendGameEvent('player_move', {
      playerId: this.playerId,
      move
    });
  }

  // Start the game
  startGame() {
    this.sendGameEvent('start_game');
  }

  // Leave room
  leaveRoom() {
    this.socket.emit('leave_room');
  }

  // Disconnect
  disconnect() {
    this.socket.disconnect();
  }
}

module.exports = GameClient;