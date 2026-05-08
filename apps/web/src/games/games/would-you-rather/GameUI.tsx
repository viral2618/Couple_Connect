'use client';

import { useState, useEffect } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';
import { socketService } from '@/games/services/socketService';

interface WouldYouRatherProps {
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

export default function WouldYouRather({ room, playerId }: WouldYouRatherProps) {
  const [category, setCategory] = useState<QuestionCategory>('seductive');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [myChoice, setMyChoice] = useState<number | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    socketService.on('game:question-received', (question: Question) => {
      setCurrentQuestion(question);
      setMyChoice(null);
      setPartnerChoice(null);
    });
    socketService.on('game:answer-received', ({ playerId: answerId, answer }: { playerId: string; answer: number }) => {
      if (answerId !== playerId) setPartnerChoice(answer);
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

  const handleRequestQuestion = () => socketService.requestQuestion(room.code, category);
  const handleChoice = (choice: number) => {
    setMyChoice(choice);
    socketService.submitAnswer(room.code, playerId, choice);
  };
  const handleNextRound = () => socketService.nextRound(room.code);
  const handleVoteWinner = (winnerId: string) => {
    socketService.getSocket()?.emit('game:vote-winner', { code: room.code, winnerId, voterId: playerId });
  };

  const activeCat = CATEGORIES.find(c => c.value === category)!;
  const partner = room.players.find(p => p.id !== playerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] flex flex-col items-center justify-start p-4 pt-6">

      {/* Header */}
      <div className="w-full max-w-lg mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-pink-500/40 rounded-2xl px-5 py-2 mb-3">
          <span className="text-2xl">💕</span>
          <h1 className="text-xl font-bold text-white tracking-wide">Would You Rather</h1>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-150
                ${category === cat.value
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-md`
                  : 'bg-white/10 text-pink-200 border-white/20 hover:bg-white/20 hover:text-white'
                }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* Lobby — no question yet */}
        {!currentQuestion && (
          <div className="space-y-4">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
              <p className="text-white/70 text-sm">Pick a vibe above, then get your question</p>
            </div>
            <button
              onClick={handleRequestQuestion}
              className={`w-full bg-gradient-to-r ${activeCat.color} text-white py-4 rounded-2xl font-semibold text-base shadow-lg`}
            >
              🎲 Get Question
            </button>
          </div>
        )}

        {/* Question — choosing phase */}
        {currentQuestion && myChoice === null && (
          <div className="space-y-3">
            <div className="relative bg-white/10 border border-pink-500/40 rounded-2xl p-6 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${activeCat.color} opacity-5 rounded-2xl`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{activeCat.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-300">
                    {activeCat.label}
                  </span>
                </div>
                <p className="text-white text-lg font-medium leading-relaxed mb-5">{currentQuestion.text}</p>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(index)}
                      className={`w-full bg-white/10 hover:bg-gradient-to-r hover:${activeCat.color} border border-white/20 hover:border-transparent text-white py-4 px-5 rounded-xl text-sm font-semibold text-left transition-all duration-150`}
                    >
                      <span className="text-white/60 mr-2">{index === 0 ? 'A' : 'B'}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Answer reveal */}
        {myChoice !== null && (
          <div className="space-y-3">
            {/* Question recap */}
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs mb-1">Question</p>
              <p className="text-white/80 text-sm">{currentQuestion?.text}</p>
            </div>

            {/* My choice */}
            <div className="bg-white/10 border border-pink-500/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${activeCat.color} flex items-center justify-center text-xs font-bold text-white`}>
                  {room.players.find(p => p.id === playerId)?.name?.[0]?.toUpperCase() || 'Y'}
                </div>
                <span className="text-pink-300 text-sm font-semibold">Your Choice</span>
              </div>
              <p className="text-white text-sm">{currentQuestion?.options?.[myChoice]}</p>
            </div>

            {/* Partner choice */}
            {partnerChoice !== null ? (
              <div className="bg-white/10 border border-purple-500/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    {partner?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <span className="text-purple-300 text-sm font-semibold">{partner?.name}'s Choice</span>
                </div>
                <p className="text-white text-sm">{currentQuestion?.options?.[partnerChoice]}</p>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <p className="text-white/70 text-sm">Waiting for partner's choice...</p>
              </div>
            )}

            {/* Match */}
            {partnerChoice !== null && myChoice === partnerChoice && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
                <p className="text-green-400 text-sm font-semibold">🎉 You both chose the same! Perfect match!</p>
              </div>
            )}

            {/* Vote + Next */}
            {partnerChoice !== null && (
              <>
                <div className="bg-white/10 border border-yellow-500/30 rounded-2xl p-4">
                  <p className="text-yellow-300 text-xs uppercase tracking-widest text-center mb-3">Best Answer?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {room.players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleVoteWinner(player.id)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleNextRound}
                  className={`w-full bg-gradient-to-r ${activeCat.color} text-white py-4 rounded-2xl font-semibold text-base shadow-lg`}
                >
                  Next Question →
                </button>
              </>
            )}
          </div>
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
