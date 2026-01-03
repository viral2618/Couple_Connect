import React from 'react';
import { CoupleGame } from '../data/coupleGames';

interface GameCardProps {
  game: CoupleGame;
  onGameSelect: (game: CoupleGame) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onGameSelect }) => {
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
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onGameSelect(game)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{game.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntimacyColor(game.intimacyLevel)}`}>
          {game.intimacyLevel}
        </span>
      </div>
      
      <div className="flex items-center mb-3">
        <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getCategoryColor(game.category)}`}>
          {game.category}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{game.objective}</p>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>⏱️ {game.timeRequired}</span>
        <span>👥 {game.numberOfPlayers} players</span>
      </div>

      <div className="mt-3">
        <span className="text-sm font-medium text-gray-700">Mood: </span>
        <span className="text-sm text-gray-600">{game.mood}</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {game.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
        {game.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{game.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};

export default GameCard;