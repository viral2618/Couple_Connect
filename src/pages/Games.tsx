import React, { useState, useMemo } from 'react';
import { coupleGames, CoupleGame } from '../data/coupleGames';
import GameCard from '../components/GameCard';
import GameFilter from '../components/GameFilter';
import GameDetailModal from '../components/GameDetailModal';

const Games: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIntimacy, setSelectedIntimacy] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<CoupleGame | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter games based on selected criteria
  const filteredGames = useMemo(() => {
    return coupleGames.filter(game => {
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      const matchesIntimacy = selectedIntimacy === 'All' || game.intimacyLevel === selectedIntimacy;
      const matchesSearch = searchTerm === '' || 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesIntimacy && matchesSearch;
    });
  }, [selectedCategory, selectedIntimacy, searchTerm]);

  const handleGameSelect = (game: CoupleGame) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Couple Games 💕
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fun and meaningful games to strengthen your connection, create memories, 
            and deepen your bond with your partner.
          </p>
        </div>

        {/* Filter Component */}
        <GameFilter
          selectedCategory={selectedCategory}
          selectedIntimacy={selectedIntimacy}
          searchTerm={searchTerm}
          onCategoryChange={setSelectedCategory}
          onIntimacyChange={setSelectedIntimacy}
          onSearchChange={setSearchTerm}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredGames.length} of {coupleGames.length} games
          </p>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onGameSelect={handleGameSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No games found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find the perfect game for you.
            </p>
          </div>
        )}

        {/* Game Detail Modal */}
        <GameDetailModal
          game={selectedGame}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default Games;