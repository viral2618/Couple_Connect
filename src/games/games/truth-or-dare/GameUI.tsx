'use client';

import { useState, useEffect } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';

interface TruthOrDareProps {
  room: Room;
  playerId: string;
}

export default function TruthOrDare({ room, playerId }: TruthOrDareProps) {
  const [category, setCategory] = useState<QuestionCategory>('seductive');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [completed, setCompleted] = useState(false);
  const [partnerCompleted, setPartnerCompleted] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [myCompleteTime, setMyCompleteTime] = useState<number | null>(null);
  const [partnerCompleteTime, setPartnerCompleteTime] = useState<number | null>(null);
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
    if (!autoStarted && !currentQuestion) {
      setAutoStarted(true);
      handleRequestQuestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myCompleteTime !== null && partnerCompleteTime !== null) {
      const myTime = myCompleteTime - questionStartTime;
      const partnerTime = partnerCompleteTime - questionStartTime;
      const fastestPlayer = myTime < partnerTime ? playerId : room.players.find(p => p.id !== playerId)?.id;
      setWinner(fastestPlayer || null);
      
      if (fastestPlayer) {
        setScores(prev => ({
          ...prev,
          [fastestPlayer]: (prev[fastestPlayer] || 0) + 10
        }));
      }
    }
  }, [myCompleteTime, partnerCompleteTime, questionStartTime, playerId, room.players]);

  const handleRequestQuestion = async () => {
    try {
      const response = await fetch('/api/games/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'truth-or-dare',
          category,
          playerNames: room.players.map(p => p.name)
        })
      });
      
      const question = await response.json();
      setCurrentQuestion({
        id: Date.now().toString(),
        text: question.question,
        category: question.category,
        type: question.type || 'truth'
      });
      setQuestionStartTime(Date.now());
      setCompleted(false);
      setPartnerCompleted(false);
      setMyCompleteTime(null);
      setPartnerCompleteTime(null);
      setWinner(null);
    } catch (error) {
      console.error('Failed to get question:', error);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    setMyCompleteTime(Date.now());
    
    setTimeout(() => {
      setPartnerCompleted(true);
      setPartnerCompleteTime(Date.now());
    }, 2000);
  };

  const handleNextRound = () => {
    handleRequestQuestion();
    setCompleted(false);
    setPartnerCompleted(false);
    setMyCompleteTime(null);
    setPartnerCompleteTime(null);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full shadow-xl border border-pink-500/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">🔥 Truth or Dare</h2>
          <p className="text-pink-200">Seductive challenges await</p>
          <div className="mt-3 text-sm text-gray-300">
            Room: {room.code} | Round: {room.gameState.currentRound}/{room.gameState.totalRounds}
          </div>
        </div>

        {!currentQuestion && (
          <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30 text-center">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🎲</div>
              <p className="text-white text-lg">Loading your challenge...</p>
            </div>
          </div>
        )}

        {currentQuestion && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-500/30">
              <div className="text-center mb-4">
                <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {currentQuestion.type === 'truth' ? 'TRUTH' : 'DARE'}
                </span>
              </div>
              <p className="text-white text-xl font-semibold text-center">
                {currentQuestion.text}
              </p>
            </div>

            {!completed && (
              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition"
              >
                ✅ I Completed It!
              </button>
            )}

            {completed && !partnerCompleted && (
              <div className="bg-blue-500/10 text-white px-4 py-3 rounded-xl text-center border border-blue-500/30">
                Waiting for partner to complete...
              </div>
            )}

            {completed && partnerCompleted && (
              <>
                {winner && (
                  <div className="bg-yellow-500/10 text-yellow-300 px-4 py-3 rounded-xl text-center border border-yellow-500/30 font-semibold">
                    🏆 {room.players.find(p => p.id === winner)?.name} completed first!
                  </div>
                )}

                <button
                  onClick={handleNextRound}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition"
                >
                  🎯 Next Challenge
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
