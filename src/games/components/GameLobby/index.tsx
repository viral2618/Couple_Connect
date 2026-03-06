'use client';

import { useState, useEffect } from 'react';
import { useSocket, useGameState } from '@/games/hooks';

interface GameLobbyProps {
  playerId: string;
  playerName: string;
  onRoomJoined: (roomCode: string) => void;
}

export default function GameLobby({ playerId, playerName, onRoomJoined }: GameLobbyProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [mounted, setMounted] = useState(false);
  const { connected } = useSocket();
  const { room, error, loading, createRoom, joinRoom } = useGameState();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateRoom = () => {
    createRoom(playerId, playerName);
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 6) {
      joinRoom(joinCode.toUpperCase(), playerId, playerName);
    }
  };

  useEffect(() => {
    if (room) {
      onRoomJoined(room.code);
    }
  }, [room, onRoomJoined]);

  if (room) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🎮
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Couple Games</h1>
          <p className="text-pink-200">Play intimate games together</p>
          {!connected && (
            <div className="mt-4 bg-red-500/20 text-white px-4 py-2 rounded-lg border border-red-500/30">
              Connecting...
            </div>
          )}
        </div>

        {mode === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              disabled={!connected}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              🎲 Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!connected}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              🚪 Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/30">
              <p className="text-white text-center">You'll get a 6-digit code to share</p>
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={loading || !connected}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? '⏳ Creating...' : '🎲 Create Game Room'}
            </button>
            <button
              onClick={() => setMode('menu')}
              className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
            >
              ← Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
              <p className="text-white text-center">Enter your partner's code</p>
            </div>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full bg-gray-800 text-white placeholder-gray-500 px-6 py-4 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-700"
            />
            <button
              onClick={handleJoinRoom}
              disabled={joinCode.length !== 6 || loading || !connected}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? '⏳ Joining...' : '🚪 Join Game'}
            </button>
            <button
              onClick={() => setMode('menu')}
              className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
            >
              ← Back
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/20 text-white px-4 py-3 rounded-xl text-center border border-red-500/30">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
