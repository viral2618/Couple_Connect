import { io, Socket } from 'socket.io-client';
import { Room, GameType, QuestionCategory } from '../types/gameTypes';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

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
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 500, // Reduced from 1000ms
      timeout: 5000 // Reduced timeout
    });

    this.socket.on('connect', () => {
      console.log('✅ Game socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Game socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('⚠️ Max reconnection attempts reached, switching to offline mode');
      }
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  // Room events with timeout handling
  createRoom(playerId: string, playerName: string): void {
    console.log('📤 Emitting game:create-room', { playerId, playerName });
    if (this.socket?.connected) {
      this.socket.emit('game:create-room', { playerId, playerName });
    } else {
      console.warn('⚠️ Socket not connected, room will be created locally');
    }
  }

  joinRoom(code: string, playerId: string, playerName: string): void {
    console.log('📤 Emitting game:join-room', { code, playerId, playerName });
    if (this.socket?.connected) {
      this.socket.emit('game:join-room', { code, playerId, playerName });
    } else {
      console.warn('⚠️ Socket not connected, joining local room');
    }
  }

  leaveRoom(code: string, playerId: string): void {
    this.socket?.emit('game:leave-room', { code, playerId });
  }

  // Game events
  selectGame(code: string, gameType: GameType): void {
    console.log('🎯 Selecting game:', gameType, 'for room:', code);
    if (this.socket?.connected) {
      this.socket.emit('game:select-game', { code, gameType });
    } else {
      console.warn('⚠️ Socket not connected, game selection may not sync');
    }
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

  // Optimized listeners with debouncing
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const callbacks = this.listeners.get(event)!;
    
    // Prevent duplicate listeners
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      this.socket?.on(event, callback as any);
    }
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
