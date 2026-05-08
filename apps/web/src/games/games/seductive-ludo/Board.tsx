'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types/gameTypes';
import { useState } from 'react';

interface BoardProps {
  players: Player[];
  playerPositions: Record<string, number>;
  currentTurn: string | null;
}

const Board = ({ players, playerPositions, currentTurn }: BoardProps) => {
  const [hoveredSpace, setHoveredSpace] = useState<number | null>(null);
  const TOTAL_STEPS = 28;

  // Enhanced board spaces with descriptions
  const boardSpaces = [
    { id: 0, name: 'START', type: 'start', color: 'from-emerald-400 to-emerald-600', icon: '🏁', desc: 'Begin Your Journey' },
    { id: 1, name: 'Soft Kiss', type: 'task', color: 'from-pink-400 to-pink-600', icon: '💋', desc: 'Kiss your partner gently' },
    { id: 2, name: 'Touch', type: 'task', color: 'from-purple-400 to-purple-600', icon: '👐', desc: 'Sensual touch' },
    { id: 3, name: 'Chance', type: 'chance', color: 'from-orange-400 to-orange-600', icon: '🎴', desc: 'Draw a chance card' },
    { id: 4, name: 'Whisper', type: 'task', color: 'from-blue-400 to-blue-600', icon: '💬', desc: 'Whisper something naughty' },
    { id: 5, name: 'Eye Lock', type: 'task', color: 'from-indigo-400 to-indigo-600', icon: '👀', desc: 'Intense eye contact' },
    { id: 6, name: 'Dare', type: 'dare', color: 'from-red-400 to-red-600', icon: '🔥', desc: 'Complete a dare' },
    
    { id: 7, name: 'Tease', type: 'task', color: 'from-fuchsia-400 to-fuchsia-600', icon: '😏', desc: 'Tease your partner' },
    { id: 8, name: 'Massage', type: 'task', color: 'from-violet-400 to-violet-600', icon: '💆', desc: 'Sensual massage' },
    { id: 9, name: 'Chance', type: 'chance', color: 'from-orange-400 to-orange-600', icon: '🎴', desc: 'Draw a chance card' },
    { id: 10, name: 'Dance', type: 'task', color: 'from-rose-400 to-rose-600', icon: '💃', desc: 'Slow dance together' },
    { id: 11, name: 'Bite', type: 'task', color: 'from-pink-500 to-pink-700', icon: '😈', desc: 'Gentle bite' },
    { id: 12, name: 'Strip', type: 'task', color: 'from-red-500 to-red-700', icon: '👗', desc: 'Remove one item' },
    { id: 13, name: 'Punishment', type: 'punishment', color: 'from-gray-600 to-gray-800', icon: '⛓️', desc: 'Penalty zone!' },
    
    { id: 14, name: 'Spank', type: 'task', color: 'from-red-400 to-red-600', icon: '🍑', desc: 'Playful spank' },
    { id: 15, name: 'Lick', type: 'task', color: 'from-pink-400 to-pink-600', icon: '👅', desc: 'Lick their neck' },
    { id: 16, name: 'Dare', type: 'dare', color: 'from-red-400 to-red-600', icon: '🔥', desc: 'Complete a dare' },
    { id: 17, name: 'Grind', type: 'task', color: 'from-purple-500 to-purple-700', icon: '🔥', desc: 'Grind on partner' },
    { id: 18, name: 'Moan', type: 'task', color: 'from-pink-500 to-pink-700', icon: '😩', desc: 'Make them moan' },
    { id: 19, name: 'Chance', type: 'chance', color: 'from-orange-400 to-orange-600', icon: '🎴', desc: 'Draw a chance card' },
    { id: 20, name: 'Seduce', type: 'task', color: 'from-fuchsia-500 to-fuchsia-700', icon: '💋', desc: 'Seduce your partner' },
    
    { id: 21, name: 'Roleplay', type: 'task', color: 'from-violet-400 to-violet-600', icon: '🎭', desc: 'Act out a fantasy' },
    { id: 22, name: 'Fantasy', type: 'task', color: 'from-purple-400 to-purple-600', icon: '💭', desc: 'Share a fantasy' },
    { id: 23, name: 'Dare', type: 'dare', color: 'from-red-400 to-red-600', icon: '🔥', desc: 'Complete a dare' },
    { id: 24, name: 'Undress', type: 'task', color: 'from-pink-500 to-pink-700', icon: '👙', desc: 'Slowly undress' },
    { id: 25, name: 'Makeout', type: 'task', color: 'from-red-500 to-red-700', icon: '💏', desc: 'Passionate makeout' },
    { id: 26, name: 'Chance', type: 'chance', color: 'from-orange-400 to-orange-600', icon: '🎴', desc: 'Draw a chance card' },
    { id: 27, name: 'FINISH', type: 'finish', color: 'from-yellow-400 to-yellow-600', icon: '🏆', desc: 'Winner!' },
  ];

  const getPlayerColor = (playerId: string): string => {
    const index = players.findIndex(p => p.id === playerId);
    return index === 0 ? '#ec4899' : '#3b82f6';
  };

  const getPlayerEmoji = (playerId: string): string => {
    const index = players.findIndex(p => p.id === playerId);
    return index === 0 ? '💖' : '💙';
  };

  const renderSpace = (space: typeof boardSpaces[0]) => {
    const playersOnSpace = Object.entries(playerPositions).filter(
      ([_, position]) => position === space.id
    );
    const isHovered = hoveredSpace === space.id;
    const isCorner = ['start', 'finish', 'punishment'].includes(space.type) || space.id === 6;

    return (
      <motion.div
        key={space.id}
        className={`relative bg-gradient-to-br ${space.color} rounded-xl border-4 border-gray-900 flex flex-col items-center justify-center p-2 shadow-2xl overflow-hidden cursor-pointer`}
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: space.id * 0.015, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        onHoverStart={() => setHoveredSpace(space.id)}
        onHoverEnd={() => setHoveredSpace(null)}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
        
        {/* Glow effect for special spaces */}
        {['start', 'finish', 'punishment', 'dare'].includes(space.type) && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* Space Icon */}
        <motion.div 
          className="text-4xl mb-1 drop-shadow-lg"
          animate={playersOnSpace.length > 0 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {space.icon}
        </motion.div>
        
        {/* Space Name */}
        <div className="text-white font-black text-xs text-center leading-tight drop-shadow-lg">
          {space.name}
        </div>
        
        {/* Space Number */}
        <div className="absolute top-1 right-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {space.id}
        </div>

        {/* Tooltip on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap z-50 border-2 border-pink-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {space.desc}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r-2 border-b-2 border-pink-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Pieces */}
        {playersOnSpace.length > 0 && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {playersOnSpace.map(([playerId]) => (
              <motion.div
                key={playerId}
                initial={{ scale: 0, y: -50, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  y: 0,
                  rotate: 0
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl border-4 border-white ${
                    currentTurn === playerId ? 'ring-4 ring-yellow-400' : ''
                  }`}
                  style={{ 
                    backgroundColor: getPlayerColor(playerId),
                    boxShadow: currentTurn === playerId 
                      ? '0 0 30px rgba(255, 215, 0, 0.8), 0 10px 30px rgba(0,0,0,0.5)' 
                      : '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  animate={
                    currentTurn === playerId
                      ? { 
                          y: [-4, 4, -4],
                          rotate: [-5, 5, -5]
                        }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {getPlayerEmoji(playerId)}
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Game Title with particles effect */}
      <div className="text-center mb-6 relative">
        {/* Floating hearts background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              initial={{ y: 100, x: Math.random() * 100 + '%' }}
              animate={{ 
                y: -100, 
                x: Math.random() * 100 + '%',
                rotate: 360 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10 + i * 2,
                delay: i * 2 
              }}
            >
              💕
            </motion.div>
          ))}
        </div>

        <motion.h1 
          className="text-6xl md:text-8xl font-black mb-3 relative z-10"
          style={{
            background: 'linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(255, 0, 128, 0.6))'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            backgroundPosition: { repeat: Infinity, duration: 5 },
            scale: { repeat: Infinity, duration: 2 }
          }}
        >
          🔥 Seductive Business 🔥
        </motion.h1>
        <motion.p 
          className="text-black text-2xl md:text-3xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Roll • Land • Seduce • Win!
        </motion.p>
      </div>

      {/* Premium Board Container */}
      <div className="relative">
        {/* Glow effect around board */}
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl opacity-20 blur-2xl" />
        
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/50 rounded-3xl p-6 shadow-2xl border-8 border-pink-500 backdrop-blur-sm">
          <div className="grid grid-cols-7 grid-rows-7 gap-2 aspect-square">
            {/* Bottom Row */}
            {boardSpaces.slice(0, 7).map((space, idx) => (
              <div key={space.id} style={{ gridColumn: idx + 1, gridRow: 7 }}>
                {renderSpace(space)}
              </div>
            ))}
            
            {/* Right Column */}
            {boardSpaces.slice(7, 14).map((space, idx) => (
              <div key={space.id} style={{ gridColumn: 7, gridRow: 6 - idx }}>
                {renderSpace(space)}
              </div>
            ))}
            
            {/* Top Row */}
            {boardSpaces.slice(14, 21).map((space, idx) => (
              <div key={space.id} style={{ gridColumn: 6 - idx, gridRow: 1 }}>
                {renderSpace(space)}
              </div>
            ))}
            
            {/* Left Column */}
            {boardSpaces.slice(21, 28).map((space, idx) => (
              <div key={space.id} style={{ gridColumn: 1, gridRow: idx + 2 }}>
                {renderSpace(space)}
              </div>
            ))}

            {/* Premium Center Area */}
            <div className="col-start-2 col-span-5 row-start-2 row-span-5 relative">
              {/* Animated gradient background */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-pink-600/40 via-purple-600/40 to-blue-600/40 rounded-3xl blur-xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
              />
              
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border-4 border-pink-500/50 shadow-2xl h-full flex flex-col items-center justify-center p-6">
                <motion.div 
                  className="text-8xl mb-4"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  🎲
                </motion.div>
                
                <h2 className="text-white font-black text-4xl mb-2 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  SEDUCTIVE
                </h2>
                <h3 className="text-white font-black text-3xl mb-6 text-center">
                  BUSINESS
                </h3>
                
                {/* Enhanced Legend */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {[
                    { icon: '💋', label: 'Task', color: 'from-pink-500 to-pink-600' },
                    { icon: '🎴', label: 'Chance', color: 'from-orange-500 to-orange-600' },
                    { icon: '🔥', label: 'Dare', color: 'from-red-500 to-red-600' },
                    { icon: '⛓️', label: 'Punish', color: 'from-gray-600 to-gray-700' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className={`flex items-center gap-2 bg-gradient-to-r ${item.color} px-3 py-2 rounded-xl shadow-lg`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-white font-black text-sm">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Player Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, idx) => {
              const position = playerPositions[player.id] || 0;
              const isActive = currentTurn === player.id;
              const space = boardSpaces[position];
              const progress = (position / 27) * 100;
              
              return (
                <motion.div
                  key={player.id}
                  className={`relative overflow-hidden rounded-2xl border-4 ${
                    isActive 
                      ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-yellow-300' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                  } shadow-2xl`}
                  initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isActive ? [1, 1.02, 1] : 1
                  }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    x: { duration: 0.5 },
                    scale: { repeat: Infinity, duration: 1.5 }
                  }}
                >
                  {/* Shine effect */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    />
                  )}

                  <div className="relative p-5">
                    <div className="flex items-center gap-4">
                      {/* Player Avatar */}
                      <motion.div
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-white ${
                          isActive ? 'ring-8 ring-white/50' : ''
                        }`}
                        style={{ backgroundColor: getPlayerColor(player.id) }}
                        animate={isActive ? { 
                          rotate: [0, -5, 5, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {getPlayerEmoji(player.id)}
                      </motion.div>
                      
                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-2xl font-black ${isActive ? 'text-gray-900' : 'text-white'}`}>
                            {player.name}
                          </h3>
                          {isActive && (
                            <motion.span 
                              className="text-3xl"
                              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                            >
                              👈
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Current Space */}
                        <div className={`flex items-center gap-2 mb-3 ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                          <span className="text-2xl">{space.icon}</span>
                          <span className="font-bold text-lg">{space.name}</span>
                          <span className="text-sm opacity-75">({position}/27)</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-4 bg-gray-900/50 rounded-full overflow-hidden border-2 border-gray-900">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-black drop-shadow-lg">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Game Rules */}
      <motion.div 
        className="mt-8 bg-gradient-to-br from-gray-900 to-purple-900/50 rounded-2xl p-6 border-4 border-purple-500 shadow-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-white font-black text-2xl mb-4 flex items-center gap-3">
          <span className="text-4xl">📋</span> How to Play
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎲', title: 'Roll Dice', desc: 'Roll to move' },
            { icon: '💋', title: 'Do Task', desc: 'Complete challenge' },
            { icon: '⏭️', title: 'Skip = -2', desc: 'Penalty for skip' },
            { icon: '🏆', title: 'Reach 27', desc: 'First to finish!' },
          ].map((rule, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl text-center border-2 border-gray-700 hover:border-pink-500 transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <div className="text-4xl mb-2">{rule.icon}</div>
              <p className="text-white font-black text-sm mb-1">{rule.title}</p>
              <p className="text-gray-400 text-xs">{rule.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Board;
