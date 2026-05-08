import { io, Socket } from 'socket.io-client';
import { Room, GameType, QuestionCategory } from '../types/gameTypes';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  connect(): Socket {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('⏳ Connection already in progress');
      return this.socket!;
    }

    this.isConnecting = true;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    console.log('🔌 Connecting to game server:', socketUrl);
    
    this.socket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
      forceNew: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Game socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Game socket disconnected:', reason);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      this.isConnecting = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('⚠️ Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Room events with timeout handling
  createRoom(playerId: string, playerName: string): void {
    console.log('📤 Emitting game:create-room', { playerId, playerName });
    if (this.socket?.connected) {
      this.socket.emit('game:create-room', { playerId, playerName });
    } else {
      console.warn('⚠️ Socket not connected, attempting to reconnect...');
      this.connect();
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit('game:create-room', { playerId, playerName });
        }
      }, 1000);
    }
  }

  joinRoom(code: string, playerId: string, playerName: string): void {
    console.log('📤 Emitting game:join-room', { code, playerId, playerName });
    if (this.socket?.connected) {
      this.socket.emit('game:join-room', { code, playerId, playerName });
    } else {
      console.warn('⚠️ Socket not connected, attempting to reconnect...');
      this.connect();
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit('game:join-room', { code, playerId, playerName });
        }
      }, 1000);
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
