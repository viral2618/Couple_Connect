const crypto = require('crypto');

// Simple UUID v4 generator to avoid ES module issues
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.roomCodes = new Map(); // roomCode -> roomId
    this.playerRooms = new Map(); // playerId -> roomId
  }

  // Generate unique 6-character room code
  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.roomCodes.has(code));
    return code;
  }

  // Create new room (Host only)
  createRoom(hostId, hostSocketId, gameType) {
    const roomId = uuidv4();
    const roomCode = this.generateRoomCode();
    
    const host = {
      id: hostId,
      socketId: hostSocketId,
      role: 'host',
      connected: true,
      joinedAt: new Date()
    };

    const room = {
      id: roomId,
      code: roomCode,
      state: 'waiting',
      host: host,
      guest: null,
      gameType: gameType,
      createdAt: new Date(),
      gameData: {}
    };

    this.rooms.set(roomId, room);
    this.roomCodes.set(roomCode, roomId);
    this.playerRooms.set(hostId, roomId);

    return { room, roomCode };
  }

  // Join room using code (Guest only)
  joinRoom(guestId, guestSocketId, roomCode) {
    const roomId = this.roomCodes.get(roomCode);
    if (!roomId) {
      throw new Error('Room not found');
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.state !== 'waiting') {
      throw new Error('Room is not accepting players');
    }

    if (room.guest) {
      throw new Error('Room is full');
    }

    const guest = {
      id: guestId,
      socketId: guestSocketId,
      role: 'guest',
      connected: true,
      joinedAt: new Date()
    };

    room.guest = guest;
    room.state = 'ready';
    this.playerRooms.set(guestId, roomId);

    return room;
  }

  // Get room by ID
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Get room by player ID
  getRoomByPlayer(playerId) {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  // Update room state
  updateRoomState(roomId, newState) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.state = newState;
      return room;
    }
    return null;
  }

  // Handle player disconnect
  handlePlayerDisconnect(playerId) {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Mark player as disconnected
    if (room.host && room.host.id === playerId) {
      room.host.connected = false;
    }
    if (room.guest && room.guest.id === playerId) {
      room.guest.connected = false;
    }

    // If game hasn't started, remove disconnected player
    if (room.state === 'waiting' || room.state === 'ready') {
      if (room.host && room.host.id === playerId) {
        this.deleteRoom(roomId);
        return { room: null, action: 'room_deleted' };
      }
      if (room.guest && room.guest.id === playerId) {
        room.guest = null;
        room.state = 'waiting';
        return { room, action: 'guest_left' };
      }
    }

    return { room, action: 'player_disconnected' };
  }

  // Delete room and cleanup
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Cleanup mappings
    this.roomCodes.delete(room.code);
    if (room.host) this.playerRooms.delete(room.host.id);
    if (room.guest) this.playerRooms.delete(room.guest.id);
    this.rooms.delete(roomId);

    return true;
  }

  // Remove player from all rooms
  removePlayerFromAllRooms(playerId) {
    const roomId = this.playerRooms.get(playerId);
    if (roomId) {
      this.handlePlayerDisconnect(playerId);
    }
  }

  // Get all active rooms (for debugging)
  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

module.exports = RoomManager;