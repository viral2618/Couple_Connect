'use client';

import { useState } from 'react';

interface DiceProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

const Dice = ({ value, isRolling, onRoll, disabled }: DiceProps) => {
  const getDiceDots = (num: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };
    return dotPositions[num] || [];
  };

  const dotClasses: Record<string, string> = {
    'top-left': 'top-1.5 sm:top-2 left-1.5 sm:left-2',
    'top-right': 'top-1.5 sm:top-2 right-1.5 sm:right-2',
    'middle-left': 'top-1/2 left-1.5 sm:left-2 -translate-y-1/2',
    'middle-right': 'top-1/2 right-1.5 sm:right-2 -translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-1.5 sm:bottom-2 left-1.5 sm:left-2',
    'bottom-right': 'bottom-1.5 sm:bottom-2 right-1.5 sm:right-2',
  };

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div
        className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg sm:rounded-xl shadow-lg cursor-pointer transition-transform ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
        } ${isRolling ? 'animate-spin' : ''}`}
        onClick={!disabled ? onRoll : undefined}
        style={{ animationDuration: isRolling ? '0.5s' : '0s' }}
      >
        {!isRolling && getDiceDots(value).map((position, index) => (
          <div
            key={index}
            className={`absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full ${dotClasses[position]}`}
          />
        ))}
        
        {isRolling && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-black text-red-500">
            ?
          </div>
        )}
      </div>

      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${
          disabled || isRolling
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 active:scale-95'
        }`}
      >
        {isRolling ? '🎲 Rolling...' : '🎲 Roll'}
      </button>
    </div>
  );
};

export default Dice;
