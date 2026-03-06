'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';
import { aiQuestionService } from '@/games/services/aiQuestionService';

interface CoupleQuizProps {
  room: Room;
  playerId: string;
}

export default function CoupleQuiz({ room, playerId }: CoupleQuizProps) {
  const [category, setCategory] = useState<QuestionCategory>('romantic');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<number | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [myAnswerTime, setMyAnswerTime] = useState<number | null>(null);
  const [partnerAnswerTime, setPartnerAnswerTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isOwner = useMemo(() => room.players[0]?.id === playerId, [room.players, playerId]);
  const partner = useMemo(() => room.players.find(p => p.id !== playerId), [room.players, playerId]);

  const categories: { value: QuestionCategory; label: string; emoji: string }[] = [
    { value: 'seductive', label: 'Seductive', emoji: '🔥' },
    { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
    { value: 'romantic', label: 'Romantic', emoji: '💕' },
    { value: 'playful', label: 'Playful', emoji: '😏' },
    { value: 'deep', label: 'Deep', emoji: '💭' }
  ];

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    handleRequestQuestion();
  }, []);

  const handleRequestQuestion = useCallback(async () => {
    setLoading(true);
    try {
      // Use instant question generation instead of API call
      const question = aiQuestionService.getInstantQuestion('couple-quiz', category);
      
      setCurrentQuestion({
        id: Date.now().toString(),
        text: question.question,
        options: question.options,
        category: question.category,
        type: 'quiz'
      });
      setQuestionStartTime(Date.now());
      setMyAnswer(null);
      setPartnerAnswer(null);
      setMyAnswerTime(null);
      setPartnerAnswerTime(null);
      setWinner(null);
    } catch (error) {
      console.error('Failed to get question:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const handleAnswer = useCallback((answerIndex: number) => {
    setMyAnswer(answerIndex);
    setMyAnswerTime(Date.now());
    
    // Simulate partner answer faster
    setTimeout(() => {
      const randomAnswer = Math.floor(Math.random() * (currentQuestion?.options?.length || 4));
      setPartnerAnswer(randomAnswer);
      setPartnerAnswerTime(Date.now());
    }, 1000); // Reduced from 2000ms
  }, [currentQuestion]);

  const handleNextRound = useCallback(() => {
    handleRequestQuestion();
    setMyAnswer(null);
    setPartnerAnswer(null);
    setMyAnswerTime(null);
    setPartnerAnswerTime(null);
    setWinner(null);
  }, [handleRequestQuestion]);

  // Optimized winner calculation
  useEffect(() => {
    if (myAnswer !== null && partnerAnswer !== null && myAnswerTime !== null && partnerAnswerTime !== null) {
      const myTime = myAnswerTime - questionStartTime;
      const partnerTime = partnerAnswerTime - questionStartTime;
      
      if (myAnswer === partnerAnswer) {
        const fastestPlayer = myTime < partnerTime ? playerId : partner?.id;
        setWinner(fastestPlayer || null);
        
        setScores(prev => {
          const newScores = { ...prev };
          if (fastestPlayer) {
            newScores[fastestPlayer] = (newScores[fastestPlayer] || 0) + 10;
          }
          return newScores;
        });
      }
    }
  }, [myAnswer, partnerAnswer, myAnswerTime, partnerAnswerTime, questionStartTime, playerId, partner]);

  // Preload questions for better performance
  useEffect(() => {
    if (gameStarted) {
      aiQuestionService.preloadQuestions('couple-quiz', category, 3);
    }
  }, [gameStarted, category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">❤️ Couple Quiz</h2>
          <p className="text-pink-200">How well do you know each other?</p>
          <div className="mt-3 text-sm text-gray-300">
            Room: {room.code} | Round: {room.gameState.currentRound}/{room.gameState.totalRounds}
          </div>
        </div>

        {!gameStarted && (
          <>
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 text-center">Choose Category</h3>
              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    disabled={!isOwner}
                    className={`p-3 rounded-xl font-semibold transition ${
                      category === cat.value
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-xs">{cat.label}</div>
                  </button>
                ))}
              </div>
              {!isOwner && (
                <p className="text-center text-gray-400 text-sm mt-3">Waiting for host to select category...</p>
              )}
            </div>

            {isOwner && (
              <button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition"
              >
                🎲 Start Game
              </button>
            )}
          </>
        )}

        {gameStarted && loading && (
          <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30 text-center">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">⚡</div>
              <p className="text-white text-lg">Generating question...</p>
            </div>
          </div>
        )}

        {gameStarted && !loading && !currentQuestion && (
          <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30 text-center">
            <div className="text-4xl mb-4">🎲</div>
            <p className="text-white text-lg">Ready for your question!</p>
          </div>
        )}

        {gameStarted && !loading && currentQuestion && myAnswer === null && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <p className="text-white text-xl font-semibold text-center mb-6">
                {currentQuestion.text}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="bg-gray-700 hover:bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold transition text-left"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {myAnswer !== null && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <h3 className="text-pink-400 font-semibold mb-3">Your Answer:</h3>
              <p className="text-white">{currentQuestion?.options?.[myAnswer]}</p>
            </div>

            {partnerAnswer !== null && (
              <>
                <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-purple-400 font-semibold mb-3">{partner?.name}'s Answer:</h3>
                  <p className="text-white">{currentQuestion?.options?.[partnerAnswer]}</p>
                </div>

                {myAnswer === partnerAnswer && (
                  <div className="bg-green-500/10 text-green-400 px-4 py-3 rounded-xl text-center border border-green-500/30 font-semibold">
                    🎉 Perfect Match! You both answered the same!
                    {winner && (
                      <div className="mt-2 text-yellow-300">
                        🏆 {room.players.find(p => p.id === winner)?.name} answered fastest!
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-800 rounded-xl p-4 border border-yellow-500/30">
                  <h3 className="text-yellow-400 font-semibold mb-3 text-center">Scores Updated!</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {room.players.map((player) => (
                      <div
                        key={player.id}
                        className="bg-gray-700 text-white py-3 rounded-lg font-semibold text-center"
                      >
                        {player.name}: {scores[player.id] || 0} pts
                      </div>
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

            {partnerAnswer === null && (
              <div className="bg-blue-500/10 text-white px-4 py-3 rounded-xl text-center border border-blue-500/30">
                Waiting for {partner?.name}'s answer...
              </div>
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
