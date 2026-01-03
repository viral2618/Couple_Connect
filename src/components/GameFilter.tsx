import React from 'react';
import { gameCategories, intimacyLevels } from '../data/coupleGames';

interface GameFilterProps {
  selectedCategory: string;
  selectedIntimacy: string;
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onIntimacyChange: (intimacy: string) => void;
  onSearchChange: (search: string) => void;
}

const GameFilter: React.FC<GameFilterProps> = ({
  selectedCategory,
  selectedIntimacy,
  searchTerm,
  onCategoryChange,
  onIntimacyChange,
  onSearchChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Find Your Perfect Game</h2>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {gameCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Intimacy Level Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Intimacy Level</label>
        <div className="flex gap-2">
          <button
            onClick={() => onIntimacyChange('All')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedIntimacy === 'All'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Levels
          </button>
          {intimacyLevels.map((level) => (
            <button
              key={level}
              onClick={() => onIntimacyChange(level)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedIntimacy === level
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameFilter;