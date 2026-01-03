import React from 'react';
import { CoupleGame } from '../data/coupleGames';

interface GameDetailModalProps {
  game: CoupleGame | null;
  isOpen: boolean;
  onClose: () => void;
}

const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, isOpen, onClose }) => {
  if (!isOpen || !game) return null;

  const getIntimacyColor = (level: string) => {
    switch (level) {
      case 'Light': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Deep': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Icebreaker': 'bg-blue-500',
      'Romantic': 'bg-pink-500',
      'Fun & Silly': 'bg-orange-500',
      'Deep Connection': 'bg-purple-500',
      'Challenges': 'bg-red-500',
      'Long-Distance': 'bg-indigo-500',
      'Party Games': 'bg-yellow-500',
      'Dark Romance': 'bg-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{game.name}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getCategoryColor(game.category)}`}>
                  {game.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntimacyColor(game.intimacyLevel)}`}>
                  {game.intimacyLevel}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Game Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-600">Duration:</span>
              <p className="text-gray-800">⏱️ {game.timeRequired}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Players:</span>
              <p className="text-gray-800">👥 {game.numberOfPlayers} players</p>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-600">Mood:</span>
              <p className="text-gray-800">✨ {game.mood}</p>
            </div>
          </div>

          {/* Objective */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🎯 Objective</h3>
            <p className="text-gray-700 leading-relaxed">{game.objective}</p>
          </div>

          {/* How to Play */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 How to Play</h3>
            <ol className="space-y-2">
              {game.howToPlay.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🏷️ Tags</h3>
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Let's Play! 💕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailModal;