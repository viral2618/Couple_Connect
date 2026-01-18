// Core Types for 2-Player Game Engine

export type RoomState = 'waiting' | 'ready' | 'in-game' | 'finished';
export type PlayerRole = 'host' | 'guest';

export interface Player {
  id: string;
  socketId: string;
  role: PlayerRole;
  connected: boolean;
  joinedAt: Date;
}

export interface Room {
  id: string;
  code: string;
  state: RoomState;
  host: Player | null;
  guest: Player | null;
  gameType: string;
  createdAt: Date;
  gameData?: any;
}

export interface GameEvent {
  type: string;
  playerId: string;
  data: any;
  timestamp: Date;
}

// Base Game Interface - ALL games must implement this
export abstract class BaseGame {
  protected room: Room;
  protected eventEmitter: any;

  constructor(room: Room, eventEmitter: any) {
    this.room = room;
    this.eventEmitter = eventEmitter;
  }

  // Required lifecycle methods
  abstract onGameInit(): void;
  abstract onPlayerJoin(player: Player): void;
  abstract onGameStart(): void;
  abstract onGameUpdate(event: GameEvent): void;
  abstract onGameEnd(reason: string): void;
  abstract onPlayerDisconnect(player: Player): void;

  // Utility methods available to all games
  protected emitToRoom(event: string, data: any): void {
    this.eventEmitter.to(this.room.id).emit(event, data);
  }

  protected emitToPlayer(playerId: string, event: string, data: any): void {
    this.eventEmitter.to(playerId).emit(event, data);
  }
}

export interface GamePlugin {
  name: string;
  gameClass: typeof BaseGame;
  minPlayers: number;
  maxPlayers: number;
}