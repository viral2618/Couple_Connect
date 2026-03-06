import { useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    // Ensure socket is connected first
    const socket = socketService.getSocket();
    if (!socket) {
      console.error('❌ Socket not initialized!');
      return;
    }

    console.log('🔌 Setting up game listeners on socket:', socket.id);

    const handleRoomUpdate = (updatedRoom: Room) => {
      console.log('✅ Room updated received:', {
        code: updatedRoom.code,
        players: updatedRoom.players.length,
        gameType: updatedRoom.gameType,
        playerNames: updatedRoom.players.map(p => p.name)
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setRoom(updatedRoom);
      setLoading(false);
      setError(null);
    };

    const handleError = (err: { message: string }) => {
      console.error('❌ Game error received:', err);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setError(err.message);
      setLoading(false);
    };

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
  }, []);

  const createRoom = (playerId: string, playerName: string) => {
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
      setRoom(newRoom);
      setLoading(false);
      timeoutRef.current = null;
    }, 2000);
  };

  const joinRoom = (code: string, playerId: string, playerName: string) => {
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
      setRoom(joinedRoom);
      setLoading(false);
      timeoutRef.current = null;
    }, 2000);
  };

  const leaveRoom = (code: string, playerId: string) => {
    socketService.leaveRoom(code, playerId);
    setRoom(null);
  };

  return {
    room,
    error,
    loading,
    createRoom,
    joinRoom,
    leaveRoom
  };
};
