'use client';

import { useState, useEffect } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';
import { socketService } from '@/games/services/socketService';

interface IntimateConfessionsProps {
  room: Room;
  playerId: string;
}

export default function IntimateConfessions({ room, playerId }: IntimateConfessionsProps) {
  const [category, setCategory] = useState<QuestionCategory>('seductive');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [myAnswerTime, setMyAnswerTime] = useState<number | null>(null);
  const [partnerAnswerTime, setPartnerAnswerTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  const categories: { value: QuestionCategory; label: string; emoji: string }[] = [
    { value: 'seductive', label: 'Seductive', emoji: '🔥' },
    { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
    { value: 'romantic', label: 'Romantic', emoji: '💕' },
    { value: 'playful', label: 'Playful', emoji: '😏' },
    { value: 'deep', label: 'Deep', emoji: '💭' }
  ];

  useEffect(() => {
    console.log('🎮 Intimate Confessions Game Loaded');
    console.log('👥 Players:', room.players.map(p => p.name));
    console.log('🎯 Current Category:', category);
    
    // Auto-load first question when game starts
    if (!autoStarted && !currentQuestion) {
      console.log('🚀 Auto-loading first question...');
      setAutoStarted(true);
      handleRequestQuestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Determine winner based on who answered first
    if (myAnswerTime !== null && partnerAnswerTime !== null) {
      const myTime = myAnswerTime - questionStartTime;
      const partnerTime = partnerAnswerTime - questionStartTime;
      const fastestPlayer = myTime < partnerTime ? playerId : room.players.find(p => p.id !== playerId)?.id;
      setWinner(fastestPlayer || null);
      
      if (fastestPlayer) {
        setScores(prev => ({
          ...prev,
          [fastestPlayer]: (prev[fastestPlayer] || 0) + 10
        }));
      }
    }
  }, [myAnswerTime, partnerAnswerTime, questionStartTime, playerId, room.players]);

  const handleRequestQuestion = async () => {
    console.log('🎯 Requesting question for category:', category);
    try {
      const response = await fetch('/api/games/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'intimate-confessions',
          category,
          playerNames: room.players.map(p => p.name)
        })
      });
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText);
        throw new Error('Failed to fetch question');
      }
      
      const question = await response.json();
      console.log('✅ Question received:', question);
      
      setCurrentQuestion({
        id: Date.now().toString(),
        text: question.question,
        category: question.category,
        type: 'confession'
      });
      setQuestionStartTime(Date.now());
      setShowAnswer(false);
      setAnswer('');
      setPartnerAnswer(null);
      setMyAnswerTime(null);
      setPartnerAnswerTime(null);
      setWinner(null);
    } catch (error) {
      console.error('❌ Failed to get question:', error);
      alert('Failed to load question. Please try again.');
    }
  };

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      console.log('📝 Submitting answer:', answer);
      setMyAnswerTime(Date.now());
      setShowAnswer(true);
      
      // Simulate partner answer after 3 seconds
      setTimeout(() => {
        const partnerResponses = [
          "I've always wanted to try something new and exciting with you...",
          "My deepest desire is to make every moment with you unforgettable.",
          "I dream about the adventures we could have together.",
          "There's something I've been wanting to tell you for a long time..."
        ];
        const randomResponse = partnerResponses[Math.floor(Math.random() * partnerResponses.length)];
        console.log('💬 Partner answer simulated:', randomResponse);
        setPartnerAnswer(randomResponse);
        setPartnerAnswerTime(Date.now());
      }, 3000);
    }
  };

  const handleNextRound = () => {
    console.log('🔄 Moving to next round');
    handleRequestQuestion();
    setShowAnswer(false);
    setAnswer('');
    setPartnerAnswer(null);
    setMyAnswerTime(null);
    setPartnerAnswerTime(null);
    setWinner(null);
  };

  const handleVoteWinner = (winnerId: string) => {
    console.log('🏆 Voted for winner:', winnerId);
    setScores(prev => ({
      ...prev,
      [winnerId]: (prev[winnerId] || 0) + 10
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">💋 Intimate Confessions</h2>
          <p className="text-pink-200">Share your deepest desires</p>
          <div className="mt-3 text-sm text-gray-300">
            Room: {room.code} | Round: {room.gameState.currentRound}/{room.gameState.totalRounds}
          </div>
        </div>

        {!currentQuestion && (
          <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30 text-center">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🎲</div>
              <p className="text-white text-lg">Loading your question...</p>
            </div>
          </div>
        )}

        {currentQuestion && !showAnswer && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <div className="text-center mb-4">
                <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {currentQuestion.category.toUpperCase()}
                </span>
              </div>
              <p className="text-white text-xl font-semibold text-center">
                {currentQuestion.text}
              </p>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your confession..."
              rows={4}
              className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none border border-gray-700"
            />

            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              💌 Submit Confession
            </button>
          </div>
        )}

        {showAnswer && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <h3 className="text-pink-400 font-semibold mb-3">Your Confession:</h3>
              <p className="text-white">{answer}</p>
            </div>

            {partnerAnswer && (
              <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-purple-400 font-semibold mb-3">Partner's Confession:</h3>
                <p className="text-white">{partnerAnswer}</p>
              </div>
            )}

            {winner && partnerAnswer && (
              <div className="bg-yellow-500/10 text-yellow-300 px-4 py-3 rounded-xl text-center border border-yellow-500/30 font-semibold">
                🏆 {room.players.find(p => p.id === winner)?.name} answered first!
              </div>
            )}

            {!partnerAnswer && (
              <div className="bg-blue-500/10 text-white px-4 py-3 rounded-xl text-center border border-blue-500/30">
                Waiting for partner's confession...
              </div>
            )}

            {partnerAnswer && (
              <>
                <div className="bg-gray-800 rounded-xl p-4 border border-yellow-500/30">
                  <h3 className="text-yellow-400 font-semibold mb-3 text-center">Vote for Best Answer</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {room.players.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleVoteWinner(player.id)}
                        className="bg-gray-700 hover:bg-pink-500 text-white py-3 rounded-lg font-semibold transition"
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextRound}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition"
                >
                  🎯 Next Question
                </button>
              </>
            )}
          </div>
        )}

        {Object.keys(scores).length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-green-500/30">
            <h3 className="text-green-400 font-semibold mb-2 text-center">Scores</h3>
            <div className="space-y-2">
              {room.players.map((player) => (
                <div key={player.id} className="flex justify-between text-white">
                  <span>{player.name}</span>
                  <span className="font-bold">{scores[player.id] || 0} points</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
