'use client';

import { Room } from '@/games/types/gameTypes';
import { useState } from 'react';

interface WaitingRoomProps {
  room: Room;
  playerId: string;
  onSelectGame: () => void;
}

export default function WaitingRoom({ room, playerId, onSelectGame }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const isOwner = room.players[0]?.id === playerId;
  const isFull = room.players.length === 2;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              🎮
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Game Room</h2>
          <p className="text-pink-200">Share the code with your partner</p>
        </div>

        {/* Room Code Display */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 border border-pink-400/30">
            <p className="text-white/80 text-sm text-center mb-3">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-gray-800 rounded-lg px-6 py-3 border-2 border-pink-500/50">
                <p className="text-4xl font-bold text-white tracking-widest">{room.code}</p>
              </div>
              <button
                onClick={copyRoomCode}
                className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-lg transition"
                title="Copy code"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm text-center mt-3">Copied to clipboard!</p>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4 text-center">
            Players ({room.players.length}/2)
          </h3>
          <div className="space-y-3">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name[0].toUpperCase()}
                  </div>
                  <span className="text-white font-semibold">{player.name}</span>
                </div>
                {player.id === room.players[0]?.id && (
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/30">
                    Host
                  </span>
                )}
              </div>
            ))}
            
            {!isFull && (
              <div className="bg-gray-800/50 rounded-xl p-4 flex items-center gap-3 border border-dashed border-gray-600">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xl">?</span>
                </div>
                <span className="text-gray-400">Waiting for partner...</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {!isFull && (
          <div className="bg-blue-500/10 text-blue-300 px-4 py-3 rounded-xl text-center mb-6 border border-blue-500/30">
            <p className="font-semibold">Waiting for your partner to join</p>
            <p className="text-sm mt-1">Share the room code above</p>
          </div>
        )}

        {isFull && !isOwner && (
          <div className="bg-purple-500/10 text-purple-300 px-4 py-3 rounded-xl text-center mb-6 border border-purple-500/30">
            <p className="font-semibold">Waiting for host to select a game...</p>
          </div>
        )}

        {/* Select Game Button */}
        {isFull && isOwner && (
          <button
            onClick={onSelectGame}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition"
          >
            🎮 Select Game
          </button>
        )}
      </div>
    </div>
  );
}
