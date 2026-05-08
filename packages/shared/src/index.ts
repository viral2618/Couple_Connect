// Shared types and utilities

// Supabase client
export * from './supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  partnerId?: string;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  reactions: any[];
  replyTo?: string;
  seenAt?: Date;
  createdAt: Date;
}

export interface GameRoom {
  id: string;
  roomId: string;
  gameType: string;
  hostId: string;
  players: any[];
  gameState: string;
  currentRound: number;
  scores: Record<string, number>;
  isActive: boolean;
}

export interface SocketEvents {
  'join-room': (roomId: string) => void;
  'send-message': (message: any) => void;
  'receive-message': (message: any) => void;
  'user-joined': (data: { userId: string }) => void;
  'user-left': (data: { userId: string }) => void;
}
