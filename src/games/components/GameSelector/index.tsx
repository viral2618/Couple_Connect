'use client';

import { GameType } from '@/games/types/gameTypes';

interface GameSelectorProps {
  onSelectGame: (gameType: GameType) => void;
}

const games = [
  {
    type: 'intimate-confessions' as GameType,
    title: 'Intimate Confessions',
    description: 'Share your deepest desires and secrets',
    icon: '💋',
    color: 'from-red-500 to-pink-500'
  },
  {
    type: 'truth-or-dare' as GameType,
    title: 'Truth or Dare',
    description: 'Classic game with a seductive twist',
    icon: '🔥',
    color: 'from-orange-500 to-red-500'
  },
  {
    type: 'would-you-rather' as GameType,
    title: 'Would You Rather',
    description: 'Choose between intimate scenarios',
    icon: '💕',
    color: 'from-pink-500 to-purple-500'
  },
  {
    type: 'couple-quiz' as GameType,
    title: 'Couple Quiz',
    description: 'How well do you know each other?',
    icon: '❤️',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    type: 'rapid-questions' as GameType,
    title: 'Rapid Fire',
    description: 'Quick intimate questions',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500'
  }
];

export default function GameSelector({ onSelectGame }: GameSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Choose Your Game</h2>
          <p className="text-pink-200 text-lg">Select a game to play together</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <button
              key={game.type}
              onClick={() => onSelectGame(game.type)}
              className="bg-gray-800 hover:bg-gray-750 p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-700 hover:border-pink-500/50 group"
            >
              <div className="flex flex-col h-full">
                <div className="text-5xl mb-4">{game.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-sm flex-grow">{game.description}</p>
                <div className="mt-4 flex items-center text-pink-400 text-sm font-semibold">
                  <span>Play Now</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
