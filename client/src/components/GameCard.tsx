import React from 'react';
import { CoupleGame } from '../data/coupleGames';

interface GameCardProps {
  game: CoupleGame;
  onGameSelect: (game: CoupleGame) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onGameSelect }) => {
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
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-200 hover:border-pink-300"
      onClick={() => onGameSelect(game)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{game.icon}</div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntimacyColor(game.intimacyLevel)}`}>
            {game.intimacyLevel}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{game.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>⏱️ {game.duration}</span>
        <span>👥 {game.players} players</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {game.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            #{tag}
          </span>
        ))}
        {game.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            +{game.tags.length - 3} more
          </span>
        )}
      </div>
      
      <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors duration-300 font-medium">
        Play Now
      </button>
    </div>
  );
};

export default GameCard;