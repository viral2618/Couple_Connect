import { io, Socket } from 'socket.io-client';
import { Room, GameType, QuestionCategory } from '../types/gameTypes';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Socket {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to socket server...');
    this.socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Game socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Game socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  // Room events
  createRoom(playerId: string, playerName: string): void {
    console.log('📤 Emitting game:create-room', { playerId, playerName });
    this.socket?.emit('game:create-room', { playerId, playerName });
  }

  joinRoom(code: string, playerId: string, playerName: string): void {
    console.log('📤 Emitting game:join-room', { code, playerId, playerName });
    this.socket?.emit('game:join-room', { code, playerId, playerName });
  }

  leaveRoom(code: string, playerId: string): void {
    this.socket?.emit('game:leave-room', { code, playerId });
  }

  // Game events
  selectGame(code: string, gameType: GameType): void {
    this.socket?.emit('game:select-game', { code, gameType });
  }

  requestQuestion(code: string, category: QuestionCategory): void {
    this.socket?.emit('game:request-question', { code, category });
  }

  submitAnswer(code: string, playerId: string, answer: any): void {
    this.socket?.emit('game:submit-answer', { code, playerId, answer });
  }

  nextRound(code: string): void {
    this.socket?.emit('game:next-round', { code });
  }

  restartGame(code: string): void {
    this.socket?.emit('game:restart', { code });
  }

  // Listeners
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    this.socket?.on(event, callback as any);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.socket?.off(event, callback as any);
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
