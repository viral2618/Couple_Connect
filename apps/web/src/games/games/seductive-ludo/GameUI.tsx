'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { Room, Player } from '../../types/gameTypes';
import Board from './Board';
import Dice from './Dice';
import TaskCard from './TaskCard';
import { Task, getTaskByStep } from './tasks';

interface SeductiveLudoProps {
  room: Room;
  playerId: string;
}

const SeductiveLudo = ({ room, playerId }: SeductiveLudoProps) => {
  const { socket } = useSocket();
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [playerPositions, setPlayerPositions] = useState<Record<string, number>>({});
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const WINNING_POSITION = 20;
  const currentPlayer = room.players.find(p => p.id === playerId)!;
  const isMyTurn = currentTurn === playerId;

  // Initialize game
  useEffect(() => {
    if (room.players.length === 2 && !gameStarted) {
      const initialPositions: Record<string, number> = {};
      room.players.forEach(player => {
        initialPositions[player.id] = 0;
      });
      setPlayerPositions(initialPositions);
      setCurrentTurn(room.players[0].id);
      setGameStarted(true);

      // Emit game start
      socket?.emit('ludo:game-start', {
        roomCode: room.code,
        positions: initialPositions,
        firstTurn: room.players[0].id
      });
    }
  }, [room.players, gameStarted, socket, room.code]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('ludo:dice-rolled', (data: { playerId: string; value: number }) => {
      setDiceValue(data.value);
    });

    socket.on('ludo:player-moved', (data: { playerId: string; newPosition: number; task: Task }) => {
      setPlayerPositions(prev => ({
        ...prev,
        [data.playerId]: data.newPosition
      }));
      setCurrentTask(data.task);
    });

    socket.on('ludo:task-completed', (data: { playerId: string; nextTurn: string }) => {
      setCurrentTask(null);
      setCurrentTurn(data.nextTurn);
    });

    socket.on('ludo:task-skipped', (data: { playerId: string; nextTurn: string; penalty: number }) => {
      setCurrentTask(null);
      setPlayerPositions(prev => ({
        ...prev,
        [data.playerId]: Math.max(0, prev[data.playerId] - data.penalty)
      }));
      setCurrentTurn(data.nextTurn);
    });

    socket.on('ludo:game-won', (data: { winner: Player }) => {
      setWinner(data.winner);
    });

    socket.on('ludo:turn-changed', (data: { nextTurn: string }) => {
      setCurrentTurn(data.nextTurn);
    });

    return () => {
      socket.off('ludo:dice-rolled');
      socket.off('ludo:player-moved');
      socket.off('ludo:task-completed');
      socket.off('ludo:task-skipped');
      socket.off('ludo:game-won');
      socket.off('ludo:turn-changed');
    };
  }, [socket]);

  // Roll dice
  const handleRollDice = () => {
    if (!isMyTurn || isRolling || currentTask) return;

    setIsRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      setDiceValue(value);
      setIsRolling(false);

      // Emit dice roll
      socket?.emit('ludo:roll-dice', {
        roomCode: room.code,
        playerId: playerId,
        value
      });

      // Move player
      setTimeout(() => {
        movePlayer(value);
      }, 500);
    }, 600);
  };

  // Move player
  const movePlayer = (steps: number) => {
    const currentPosition = playerPositions[playerId] || 0;
    let newPosition = currentPosition + steps;

    // Check if won
    if (newPosition >= WINNING_POSITION) {
      newPosition = WINNING_POSITION;
      
      // Animate to final position first
      setPlayerPositions(prev => ({
        ...prev,
        [playerId]: newPosition
      }));
      
      // Then show winner after animation
      setTimeout(() => {
        socket?.emit('ludo:win-game', {
          roomCode: room.code,
          winner: currentPlayer
        });
        setWinner(currentPlayer);
      }, 1000);
      return;
    }

    // Animate movement step by step
    let currentStep = currentPosition;
    const moveInterval = setInterval(() => {
      currentStep++;
      setPlayerPositions(prev => ({
        ...prev,
        [playerId]: currentStep
      }));

      if (currentStep >= newPosition) {
        clearInterval(moveInterval);
        
        // Get task for new position after movement completes
        setTimeout(() => {
          const task = getTaskByStep(newPosition);
          setCurrentTask(task);
          
          // Emit move
          socket?.emit('ludo:move-player', {
            roomCode: room.code,
            playerId: playerId,
            newPosition,
            task
          });
        }, 300);
      }
    }, 300); // 300ms per step
  };

  // Complete task
  const handleCompleteTask = () => {
    if (!currentTask) return;

    const nextPlayerIndex = (room.players.findIndex(p => p.id === playerId) + 1) % room.players.length;
    const nextTurn = room.players[nextPlayerIndex].id;

    socket?.emit('ludo:complete-task', {
      roomCode: room.code,
      playerId: playerId,
      nextTurn
    });

    setCurrentTask(null);
    setCurrentTurn(nextTurn);
  };

  // Skip task (with penalty)
  const handleSkipTask = () => {
    if (!currentTask) return;

    const penalty = 2; // Move back 2 steps
    const nextPlayerIndex = (room.players.findIndex(p => p.id === playerId) + 1) % room.players.length;
    const nextTurn = room.players[nextPlayerIndex].id;

    socket?.emit('ludo:skip-task', {
      roomCode: room.code,
      playerId: playerId,
      penalty,
      nextTurn
    });

    setCurrentTask(null);
    const newPosition = Math.max(0, (playerPositions[playerId] || 0) - penalty);
    setPlayerPositions(prev => ({
      ...prev,
      [playerId]: newPosition
    }));
    setCurrentTurn(nextTurn);
  };

  // Waiting for second player
  if (room.players.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-4">Waiting for Partner...</h2>
          <p className="text-white text-lg mb-6">Share this room code with your partner:</p>
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <p className="text-4xl font-bold text-pink-400 tracking-wider">{room.code}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  // Winner screen
  if (winner) {
    const isWinner = winner.id === playerId;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center"
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {isWinner ? '🏆' : '💔'}
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {isWinner ? 'You Won!' : `${winner.name} Won!`}
          </h2>
          <p className="text-xl text-white mb-8">
            {isWinner 
              ? '🔥 Time to claim your prize from your partner! 😏'
              : '💕 Better luck next time! Give your partner their reward! 😘'
            }
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Play Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 py-2 sm:py-4 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Board with Dice Overlay */}
        <div className="relative">
          {/* Dice Section - Floating on Board */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
            <div className="bg-gray-900/95 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-pink-500 shadow-2xl backdrop-blur-sm">
              <h3 className="text-white font-bold text-sm sm:text-base mb-2 text-center">🎲 Roll</h3>
              
              <div className="flex flex-col items-center gap-2">
                <Dice
                  value={diceValue}
                  isRolling={isRolling}
                  onRoll={handleRollDice}
                  disabled={!isMyTurn || !!currentTask}
                />

                {/* Turn Indicator */}
                <div
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-white text-center text-xs ${
                    isMyTurn ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  {isMyTurn ? '🎯 You' : '⏳ Wait'}
                </div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <Board
            players={room.players}
            playerPositions={playerPositions}
            currentTurn={currentTurn}
          />
        </div>

        {/* Task Card Modal */}
        <AnimatePresence>
          {currentTask && isMyTurn && (
            <TaskCard
              task={currentTask}
              onComplete={handleCompleteTask}
              onSkip={handleSkipTask}
              playerName={currentPlayer.name}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SeductiveLudo;
