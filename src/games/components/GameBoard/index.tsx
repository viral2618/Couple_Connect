'use client';

import { useState, useEffect } from 'react';
import { useSocket, useGameState } from '@/games/hooks';
import GameLobby from '@/games/components/GameLobby';
import WaitingRoom from '@/games/components/WaitingRoom';
import GameSelector from '@/games/components/GameSelector';
import IntimateConfessions from '@/games/games/intimate-confessions/GameUI';
import { GameType } from '@/games/types/gameTypes';
import { socketService } from '@/games/services/socketService';

export default function GamesPage() {
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('playerName') || '';
    }
    return '';
  });
  const [hasEnteredName, setHasEnteredName] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('playerName');
    }
    return false;
  });
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);

  // Connect socket FIRST before anything else
  useEffect(() => {
    console.log('🔌 Initializing socket connection...');
    socketService.connect();
  }, []);

  // Then initialize game state
  const { room } = useGameState(roomCode || undefined);

  // Sync selectedGameType with room.gameType when it updates
  useEffect(() => {
    if (room?.gameType) {
      console.log('🔄 Game type received from room:', room.gameType);
      setSelectedGameType(room.gameType);
      setShowGameSelector(false);
    }
  }, [room?.gameType]);

  useEffect(() => {
    if (room) {
      console.log('📊 Room state updated:', {
        code: room.code,
        players: room.players.length,
        gameType: room.gameType,
        selectedGameType: selectedGameType,
        playerNames: room.players.map(p => p.name)
      });
    }
  }, [room, selectedGameType]);

  useEffect(() => {
    return () => {
      if (roomCode) {
        socketService.leaveRoom(roomCode, playerId);
      }
    };
  }, [roomCode, playerId]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName.trim());
      setHasEnteredName(true);
    }
  };

  const handleRoomJoined = (code: string) => {
    setRoomCode(code);
  };

  const handleSelectGame = (gameType: GameType) => {
    console.log('🎯 Selecting game:', gameType, 'Room code:', roomCode);
    setSelectedGameType(gameType);
    if (roomCode) {
      socketService.selectGame(roomCode, gameType);
      setShowGameSelector(false);
    }
  };

  if (!hasEnteredName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse top-10 -left-20"></div>
          <div className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse bottom-10 -right-20 animation-delay-2000"></div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 relative z-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce-slow">
                👋
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Welcome!</h1>
            <p className="text-white/90 text-lg font-medium">Enter your name to start playing</p>
          </div>
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full bg-white/95 text-gray-900 placeholder-gray-500 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400/50 border-2 border-white/30 text-lg font-medium shadow-lg transition-all duration-300 focus:scale-105"
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white py-4 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!roomCode) {
    return (
      <GameLobby
        playerId={playerId}
        playerName={playerName}
        onRoomJoined={handleRoomJoined}
      />
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-2xl font-bold">Loading...</div>
        </div>
      </div>
    );
  }

  if (showGameSelector) {
    return <GameSelector onSelectGame={handleSelectGame} />;
  }

  // Use selectedGameType if room.gameType is not set yet
  const currentGameType = room.gameType || selectedGameType;

  console.log('🎮 Current game check:', { 
    roomGameType: room.gameType, 
    selectedGameType, 
    currentGameType,
    playersCount: room.players.length 
  });

  // Show waiting room if not enough players or no game selected
  if (room.players.length < 2 || !currentGameType) {
    console.log('⚠️ Redirecting to waiting room - Players:', room.players.length, 'GameType:', currentGameType);
    return (
      <WaitingRoom
        room={room}
        playerId={playerId}
        onSelectGame={() => setShowGameSelector(true)}
      />
    );
  }

  console.log('✅ Loading game UI:', currentGameType);

  // Game is selected and players are ready - show the game
  if (currentGameType === 'intimate-confessions') {
    return <IntimateConfessions room={room} playerId={playerId} />;
  }

  if (currentGameType === 'truth-or-dare') {
    const TruthOrDare = require('@/games/games/truth-or-dare/GameUI').default;
    return <TruthOrDare room={room} playerId={playerId} />;
  }

  if (currentGameType === 'would-you-rather') {
    const WouldYouRather = require('@/games/games/would-you-rather/GameUI').default;
    return <WouldYouRather room={room} playerId={playerId} />;
  }

  if (currentGameType === 'couple-quiz') {
    const CoupleQuiz = require('@/games/games/couple-quiz/GameUI').default;
    return <CoupleQuiz room={room} playerId={playerId} />;
  }

  if (currentGameType === 'rapid-questions') {
    const RapidQuestions = require('@/games/games/rapid-questions/GameUI').default;
    return <RapidQuestions room={room} playerId={playerId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
      <div className="text-white text-xl">Game starting...</div>
    </div>
  );
}
