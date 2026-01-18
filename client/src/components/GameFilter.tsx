import React from 'react';
import { categories, intimacyLevels } from '../data/coupleGames';

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Games
          </label>
          <input
            type="text"
            placeholder="Search by name, objective, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Intimacy Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intimacy Level
          </label>
          <select
            value={selectedIntimacy}
            onChange={(e) => onIntimacyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {intimacyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategory !== 'All' || selectedIntimacy !== 'All' || searchTerm !== '') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onCategoryChange('All');
              onIntimacyChange('All');
              onSearchChange('');
            }}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default GameFilter;