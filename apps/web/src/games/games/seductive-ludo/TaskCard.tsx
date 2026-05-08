'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task, getTaskEmoji, getSpiceLevelColor } from './tasks';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onSkip: () => void;
  playerName: string;
}

const TaskCard = ({ task, onComplete, onSkip, playerName }: TaskCardProps) => {
  const [timeLeft, setTimeLeft] = useState(task.duration);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const progress = (timeLeft / task.duration) * 100;
  const emoji = getTaskEmoji(task.category);
  const spiceColor = getSpiceLevelColor(task.spiceLevel);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative max-w-md w-full bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Spice Level Indicator */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black/30">
          <motion.div
            className="h-full"
            style={{ backgroundColor: spiceColor }}
            initial={{ width: 0 }}
            animate={{ width: `${(task.spiceLevel / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="text-6xl mb-3"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {emoji}
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">{task.title}</h3>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="px-3 py-1 bg-white/20 rounded-full text-white capitalize">
                {task.category}
              </span>
              <span className="px-3 py-1 rounded-full text-white" style={{ backgroundColor: spiceColor }}>
                🌶️ {task.spiceLevel}/5
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <p className="text-white text-center text-lg leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Player Turn */}
          <div className="text-center mb-4">
            <p className="text-pink-300 font-semibold">
              👉 {playerName}'s turn to perform this task
            </p>
          </div>

          {/* Timer */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm">Time Remaining</span>
              <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                ⏱️ {timeLeft}s
              </span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onSkip}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ⏭️ Skip
            </motion.button>
            <motion.button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                isCompleting
                  ? 'bg-green-600'
                  : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
              } text-white shadow-lg`}
              whileHover={!isCompleting ? { scale: 1.02 } : {}}
              whileTap={!isCompleting ? { scale: 0.98 } : {}}
            >
              {isCompleting ? '✅ Completed!' : '✅ Complete Task'}
            </motion.button>
          </div>

          {/* Warning for time up */}
          {timeLeft === 0 && (
            <motion.div
              className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-300 font-semibold">⏰ Time's up! Complete or skip the task</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskCard;
