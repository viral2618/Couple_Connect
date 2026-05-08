'use client';

import { useState, useEffect } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';

interface TruthOrDareProps {
  room: Room;
  playerId: string;
}

const CATEGORIES: { value: QuestionCategory; label: string; emoji: string; color: string }[] = [
  { value: 'seductive', label: 'Seductive', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { value: 'spicy',     label: 'Spicy',     emoji: '🌶️', color: 'from-red-500 to-pink-500' },
  { value: 'romantic',  label: 'Romantic',  emoji: '💕', color: 'from-pink-400 to-rose-400' },
  { value: 'playful',   label: 'Playful',   emoji: '😏', color: 'from-purple-400 to-pink-400' },
  { value: 'deep',      label: 'Deep',      emoji: '💭', color: 'from-indigo-500 to-purple-500' },
];

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
        setScores(prev => ({ ...prev, [fastestPlayer]: (prev[fastestPlayer] || 0) + 10 }));
      }
    }
  }, [myCompleteTime, partnerCompleteTime, questionStartTime, playerId, room.players]);

  const handleRequestQuestion = async () => {
    try {
      const response = await fetch('/api/games/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: 'truth-or-dare', category, playerNames: room.players.map(p => p.name) }),
      });
      const question = await response.json();
      setCurrentQuestion({ id: Date.now().toString(), text: question.question, category: question.category, type: question.type || 'truth' });
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

  const activeCat = CATEGORIES.find(c => c.value === category)!;
  const isDare = currentQuestion?.type === 'dare';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d0a3e] to-[#1a0a2e] flex flex-col items-center justify-start p-4 pt-6">

      {/* Header */}
      <div className="w-full max-w-lg mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-orange-500/40 rounded-2xl px-5 py-2 mb-3">
          <span className="text-2xl">🔥</span>
          <h1 className="text-xl font-bold text-white tracking-wide">Truth or Dare</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-pink-300">
          <span>Room: <span className="text-pink-200 font-semibold">{room.code}</span></span>
          <span className="w-1 h-1 rounded-full bg-pink-400" />
          <span>Round <span className="text-pink-300 font-semibold">{room.gameState.currentRound}/{room.gameState.totalRounds}</span></span>
        </div>
      </div>

      {/* Category Selector */}
      <div className="w-full max-w-lg mb-5">
        <p className="text-xs text-pink-300 uppercase tracking-widest mb-2 text-center">Choose a vibe</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border
                ${category === cat.value
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white/10 text-pink-200 border-white/20 hover:bg-white/20 hover:text-white'
                }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg space-y-4">

        {/* No question yet */}
        {!currentQuestion && (
          <div className="bg-white/10 border border-orange-500/40 rounded-2xl p-10 text-center">
            <p className="text-white/70 text-sm">Loading your challenge...</p>
          </div>
        )}


        {/* Question */}
        {currentQuestion && (
          <div className="relative bg-white/10 border border-orange-500/40 rounded-2xl p-6 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${activeCat.color} opacity-5 rounded-2xl`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${isDare ? 'from-orange-500 to-red-500' : 'from-indigo-500 to-purple-500'} text-white`}>
                  {isDare ? '🎯 Dare' : '💬 Truth'}
                </span>
                <span className="text-xs font-semibold text-pink-300">
                  {activeCat.emoji} {activeCat.label}
                </span>
              </div>
              <p className="text-white text-lg font-medium leading-relaxed">{currentQuestion.text}</p>
            </div>
          </div>
        )}

        {/* Complete button */}
        {currentQuestion && !completed && (
          <button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-base hover:scale-[1.02] transition-all duration-200 shadow-lg"
          >
            ✅ I Completed It!
          </button>
        )}

        {/* Waiting */}
        {completed && !partnerCompleted && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center">
            <p className="text-white/70 text-sm">⏳ Waiting for partner to complete...</p>
          </div>
        )}

        {/* Both done */}
        {completed && partnerCompleted && (
          <>
            {winner && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-center">
                <span className="text-yellow-300 text-sm font-semibold">
                  🏆 {room.players.find(p => p.id === winner)?.name} completed first!
                </span>
              </div>
            )}
            <button
              onClick={handleNextRound}
              className={`w-full bg-gradient-to-r ${activeCat.color} text-white py-4 rounded-2xl font-semibold text-base hover:scale-[1.02] transition-all duration-200 shadow-lg`}
            >
              Next Challenge →
            </button>
          </>
        )}

        {/* Scoreboard */}
        {Object.keys(scores).length > 0 && (
          <div className="bg-white/10 border border-green-500/30 rounded-2xl p-4">
            <p className="text-green-400 text-xs uppercase tracking-widest text-center mb-3">Scoreboard</p>
            <div className="space-y-2">
              {room.players
                .slice()
                .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                .map((player, i) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs w-4">{i + 1}.</span>
                      <span className="text-white text-sm">{player.name}</span>
                    </div>
                    <span className="text-green-400 font-bold text-sm">{scores[player.id] || 0} pts</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
