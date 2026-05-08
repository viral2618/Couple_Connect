import { Room, Player, GameState, GameType } from '../types/gameTypes';

class RoomService {
  private rooms: Map<string, Room> = new Map();

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom(playerId: string, playerName: string, socketId: string): Room {
    const code = this.generateRoomCode();
    const room: Room = {
      id: code,
      code,
      players: [{
        id: playerId,
        name: playerName,
        socketId,
        isOwner: true,
        score: 0
      }],
      gameType: null,
      gameState: {
        status: 'waiting',
        currentQuestion: null,
        currentRound: 0,
        totalRounds: 10,
        scores: { [playerId]: 0 },
        currentTurn: null,
        answers: {}
      },
      createdAt: Date.now(),
      maxPlayers: 2
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code: string, playerId: string, playerName: string, socketId: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    if (room.players.length >= room.maxPlayers) return null;

    const player: Player = {
      id: playerId,
      name: playerName,
      socketId,
      isOwner: false,
      score: 0
    };

    room.players.push(player);
    room.gameState.scores[playerId] = 0;
    return room;
  }

  getRoom(code: string): Room | null {
    return this.rooms.get(code) || null;
  }

  updateGameType(code: string, gameType: GameType): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    room.gameType = gameType;
    room.gameState.status = 'playing';
    room.gameState.currentRound = 1;
    return room;
  }

  updateGameState(code: string, gameState: Partial<GameState>): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    room.gameState = { ...room.gameState, ...gameState };
    return room;
  }

  removePlayer(code: string, playerId: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.players.length === 0) {
      this.rooms.delete(code);
      return null;
    }

    if (room.players.length > 0 && !room.players.some(p => p.isOwner)) {
      room.players[0].isOwner = true;
    }

    return room;
  }

  deleteRoom(code: string): void {
    this.rooms.delete(code);
  }

  cleanupOldRooms(): void {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    for (const [code, room] of Array.from(this.rooms.entries())) {
      if (now - room.createdAt > maxAge) {
        this.rooms.delete(code);
      }
    }
  }
}

export const roomService = new RoomService();

// Cleanup old rooms every 30 minutes
setInterval(() => roomService.cleanupOldRooms(), 30 * 60 * 1000);
