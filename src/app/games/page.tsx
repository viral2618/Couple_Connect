'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { coupleGames, gameCategories, intimacyLevels, CoupleGame } from '@/data/coupleGames'

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedIntimacy, setSelectedIntimacy] = useState<string>('All')
  const [selectedGame, setSelectedGame] = useState<CoupleGame | null>(null)

  const filteredGames = coupleGames.filter(game => {
    const categoryMatch = selectedCategory === 'All' || game.category === selectedCategory
    const intimacyMatch = selectedIntimacy === 'All' || game.intimacyLevel === selectedIntimacy
    return categoryMatch && intimacyMatch
  })

  const getIntimacyColor = (level: string) => {
    switch (level) {
      case 'Light': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Deep': return 'bg-rose-100 text-rose-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Icebreaker': return '🧊'
      case 'Romantic': return '💕'
      case 'Fun & Silly': return '🎭'
      case 'Deep Connection': return '💫'
      case 'Challenges': return '🎯'
      case 'Long-Distance': return '🌍'
      case 'Party Games': return '🎉'
      case 'Dark Romance': return '🖤'
      default: return '🎮'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💕 Couple Games</h1>
          <p className="text-lg text-gray-600">Strengthen your bond through fun and meaningful activities</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {gameCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-rose-100'
                  }`}
                >
                  {getCategoryIcon(category)} {category}
                </button>
              ))}
            </div>
          </div>

          {/* Intimacy Level Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Intimacy Level</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedIntimacy('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedIntimacy === 'All'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-rose-100'
                }`}
              >
                All Levels
              </button>
              {intimacyLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedIntimacy(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedIntimacy === level
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-rose-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedGame(game)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{getCategoryIcon(game.category)}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIntimacyColor(game.intimacyLevel)}`}>
                  {game.intimacyLevel}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{game.objective}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>⏱️ {game.timeRequired}</span>
                <span>😊 {game.mood.split(' & ')[0]}</span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-1">
                {game.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-rose-50 text-rose-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`/games/play/${game.id}`, '_blank')
                }}
                className="mt-4 w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg font-medium transition-all"
              >
                🎮 Play Game
              </button>
            </motion.div>
          ))}
        </div>

        {/* Game Detail Modal */}
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{getCategoryIcon(selectedGame.category)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedGame.name}</h2>
                      <span className="text-sm text-gray-500">{selectedGame.category}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntimacyColor(selectedGame.intimacyLevel)}`}>
                    {selectedGame.intimacyLevel} Intimacy
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Objective</h3>
                  <p className="text-gray-600">{selectedGame.objective}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Play</h3>
                  <ol className="space-y-2">
                    {selectedGame.howToPlay.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="bg-rose-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-rose-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Time Required</h4>
                    <p className="text-gray-600">⏱️ {selectedGame.timeRequired}</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Mood</h4>
                    <p className="text-gray-600">😊 {selectedGame.mood}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGame.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`/games/play/${selectedGame.id}`, '_blank')}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    🎮 Play Now
                  </button>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No games found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more games</p>
          </div>
        )}
      </div>
    </div>
  )
}