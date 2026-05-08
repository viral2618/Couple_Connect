'use client';

import { motion } from 'framer-motion';
import { Card, getCardColor, getCardIcon } from './cards';

interface CardDisplayProps {
  card: Card;
  onComplete: () => void;
  playerName: string;
}

const CardDisplay = ({ card, onComplete, playerName }: CardDisplayProps) => {
  const cardColor = getCardColor(card.type);
  const cardIcon = getCardIcon(card.type);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Card flip animation */}
      <motion.div
        className="relative max-w-md w-full"
        initial={{ rotateY: 90, scale: 0.5 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Glow effect */}
        <div className={`absolute -inset-4 bg-gradient-to-r ${cardColor} opacity-50 blur-2xl rounded-3xl`} />
        
        {/* Card */}
        <div className={`relative bg-gradient-to-br ${cardColor} rounded-3xl shadow-2xl overflow-hidden border-8 border-white/20`}>
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />

          {/* Card Header */}
          <div className="relative p-6 text-center border-b-4 border-white/20">
            <motion.div 
              className="text-8xl mb-3"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {cardIcon}
            </motion.div>
            <h2 className="text-white font-black text-3xl mb-2 drop-shadow-lg">
              {card.type === 'chance' ? 'CHANCE CARD' : 'DARE CARD'}
            </h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(card.spiceLevel)].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  🌶️
                </motion.span>
              ))}
            </div>
          </div>

          {/* Card Content */}
          <div className="relative p-8">
            <h3 className="text-white font-black text-4xl mb-4 text-center">
              {card.title}
            </h3>
            
            <div className="bg-black/30 rounded-2xl p-6 mb-6 border-2 border-white/20">
              <p className="text-white text-xl text-center leading-relaxed font-semibold">
                {card.description}
              </p>
            </div>

            {/* Player Info */}
            <div className="text-center mb-6">
              <p className="text-white/80 text-lg font-semibold">
                👉 {playerName}'s Card
              </p>
            </div>

            {/* Action Button */}
            <motion.button
              onClick={onComplete}
              className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black text-2xl shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  '0 10px 40px rgba(255,255,255,0.3)',
                  '0 10px 60px rgba(255,255,255,0.5)',
                  '0 10px 40px rgba(255,255,255,0.3)',
                ]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ✅ Got It!
            </motion.button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-16 h-16 border-4 border-white/20 rounded-full" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-4 border-white/20 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CardDisplay;
