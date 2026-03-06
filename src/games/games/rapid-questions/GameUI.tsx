'use client';

import { useState, useEffect } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';
import { socketService } from '@/games/services/socketService';

interface RapidQuestionsProps {
  room: Room;
  playerId: string;
}

export default function RapidQuestions({ room, playerId }: RapidQuestionsProps) {
  const [category, setCategory] = useState<QuestionCategory>('playful');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  const categories: { value: QuestionCategory; label: string; emoji: string }[] = [
    { value: 'seductive', label: 'Seductive', emoji: '🔥' },
    { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
    { value: 'romantic', label: 'Romantic', emoji: '💕' },
    { value: 'playful', label: 'Playful', emoji: '😏' },
    { value: 'deep', label: 'Deep', emoji: '💭' }
  ];

  useEffect(() => {
    socketService.on('game:question-received', (question: Question) => {
      setCurrentQuestion(question);
      setShowAnswer(false);
      setAnswer('');
      setPartnerAnswer(null);
    });

    socketService.on('game:answer-received', ({ playerId: answerId, answer: playerAnswer }: { playerId: string; answer: string }) => {
      if (answerId !== playerId) {
        setPartnerAnswer(playerAnswer);
      }
    });

    socketService.on('game:scores-updated', (newScores: Record<string, number>) => {
      setScores(newScores);
    });

    return () => {
      socketService.off('game:question-received');
      socketService.off('game:answer-received');
      socketService.off('game:scores-updated');
    };
  }, [playerId]);

  const handleRequestQuestion = () => {
    socketService.requestQuestion(room.code, category);
  };

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      socketService.submitAnswer(room.code, playerId, answer);
      setShowAnswer(true);
    }
  };

  const handleNextRound = () => {
    socketService.nextRound(room.code);
  };

  const handleVoteWinner = (winnerId: string) => {
    socketService.getSocket()?.emit('game:vote-winner', { code: room.code, winnerId, voterId: playerId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">⚡ Rapid Fire</h2>
          <p className="text-pink-200">Quick answers, no thinking!</p>
          <div className="mt-3 text-sm text-gray-300">
            Room: {room.code} | Round: {room.gameState.currentRound}/{room.gameState.totalRounds}
          </div>
        </div>

        {!currentQuestion && (
          <>
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 text-center">Choose Category</h3>
              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl font-semibold transition ${
                      category === cat.value
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-xs">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRequestQuestion}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition"
            >
              ⚡ Get Question
            </button>
          </>
        )}

        {currentQuestion && !showAnswer && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <p className="text-white text-2xl font-bold text-center">
                {currentQuestion.text}
              </p>
            </div>

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Quick answer..."
              className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-700 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
            />

            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              ⚡ Submit Answer
            </button>
          </div>
        )}

        {showAnswer && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <h3 className="text-pink-400 font-semibold mb-3">Your Answer:</h3>
              <p className="text-white text-lg">{answer}</p>
            </div>

            {partnerAnswer && (
              <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-purple-400 font-semibold mb-3">Partner's Answer:</h3>
                <p className="text-white text-lg">{partnerAnswer}</p>
              </div>
            )}

            {!partnerAnswer && (
              <div className="bg-blue-500/10 text-white px-4 py-3 rounded-xl text-center border border-blue-500/30">
                Waiting for partner's answer...
              </div>
            )}

            {partnerAnswer && (
              <>
                <div className="bg-gray-800 rounded-xl p-4 border border-yellow-500/30">
                  <h3 className="text-yellow-400 font-semibold mb-3 text-center">Best Answer?</h3>
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
                  ⚡ Next Question
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
