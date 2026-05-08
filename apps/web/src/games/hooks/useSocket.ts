import { useEffect, useState, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { Room } from '../types/gameTypes';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    setConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return { connected, socket: socketService.getSocket() };
};

export const useGameState = (roomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roomRef = useRef<Room | null>(null);

  const handleRoomUpdate = useCallback((updatedRoom: Room) => {
    console.log('✅ Room updated received:', {
      code: updatedRoom.code,
      players: updatedRoom.players.length,
      gameType: updatedRoom.gameType,
      playerNames: updatedRoom.players.map(p => p.name)
    });
    
    // Always update room state when received from server
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((err: { message: string }) => {
    console.error('❌ Game error received:', err);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setError(err.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) {
      console.error('❌ Socket not initialized!');
      return;
    }

    console.log('🔌 Setting up game listeners on socket:', socket.id);

    socket.on('game:room-updated', handleRoomUpdate);
    socket.on('game:error', handleError);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      socket.off('game:room-updated', handleRoomUpdate);
      socket.off('game:error', handleError);
      console.log('🧹 Cleaned up game listeners');
    };
  }, [handleRoomUpdate, handleError]);

  const createRoom = useCallback((playerId: string, playerName: string) => {
    console.log('🎲 Creating room for:', playerName);
    setLoading(true);
    setError(null);
    socketService.createRoom(playerId, playerName);
    
    timeoutRef.current = setTimeout(() => {
      console.log('⚠️ Socket timeout, creating local room');
      const newRoom: Room = {
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        id: Math.random().toString(36).substring(2, 8),
        players: [{ id: playerId, name: playerName, score: 0, socketId: '', isOwner: true }],
        gameType: null,
        gameState: {
          status: 'waiting',
          currentRound: 1,
          totalRounds: 10,
          currentQuestion: null,
          answers: {},
          scores: {},
          currentTurn: null
        },
        createdAt: Date.now(),
        maxPlayers: 2
      };
      roomRef.current = newRoom;
      setRoom(newRoom);
      setLoading(false);
      timeoutRef.current = null;
    }, 800);
  }, []);

  const joinRoom = useCallback((code: string, playerId: string, playerName: string) => {
    console.log('🚪 Joining room:', code);
    setLoading(true);
    setError(null);
    socketService.joinRoom(code, playerId, playerName);
    
    timeoutRef.current = setTimeout(() => {
      console.log('⚠️ Socket timeout, joining local room');
      const joinedRoom: Room = {
        code: code,
        id: code,
        players: [
          { id: 'host_123', name: 'Host', score: 0, socketId: '', isOwner: true },
          { id: playerId, name: playerName, score: 0, socketId: '', isOwner: false }
        ],
        gameType: null,
        gameState: {
          status: 'waiting',
          currentRound: 1,
          totalRounds: 10,
          currentQuestion: null,
          answers: {},
          scores: {},
          currentTurn: null
        },
        createdAt: Date.now(),
        maxPlayers: 2
      };
      roomRef.current = joinedRoom;
      setRoom(joinedRoom);
      setLoading(false);
      timeoutRef.current = null;
    }, 800);
  }, []);

  const leaveRoom = useCallback((code: string, playerId: string) => {
    socketService.leaveRoom(code, playerId);
    roomRef.current = null;
    setRoom(null);
  }, []);

  return {
    room,
    error,
    loading,
    createRoom,
    joinRoom,
    leaveRoom
  };
};
