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
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-purple-100 text-purple-800';
      case 'Advanced': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{game.icon}</span>
            <h2 className="text-2xl font-bold text-gray-800">{game.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags and Info */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntimacyColor(game.intimacyLevel)}`}>
              {game.intimacyLevel} Intimacy
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(game.difficulty)}`}>
              {game.difficulty}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {game.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">{game.description}</p>

          {/* Game Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium">{game.duration}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Players</div>
              <div className="font-medium">{game.players} players</div>
            </div>
          </div>

          {/* Objective */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Objective</h3>
            <p className="text-gray-600">{game.objective}</p>
          </div>

          {/* Materials */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">What You Need</h3>
            <ul className="list-disc list-inside text-gray-600">
              {game.materials.map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How to Play</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              {game.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Benefits</h3>
            <ul className="list-disc list-inside text-gray-600">
              {game.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          {/* Variations */}
          {game.variations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Variations</h3>
              <ul className="list-disc list-inside text-gray-600">
                {game.variations.map((variation, index) => (
                  <li key={index}>{variation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors font-medium">
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetailModal;