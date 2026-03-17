'use client';

import { useState, useEffect, useRef } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';

interface IntimateConfessionsProps {
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
  const [isLoading, setIsLoading] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchQuestion('seductive');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myAnswerTime !== null && partnerAnswerTime !== null) {
      const myTime = myAnswerTime - questionStartTime;
      const partnerTime = partnerAnswerTime - questionStartTime;
      const fastestPlayer = myTime < partnerTime ? playerId : room.players.find(p => p.id !== playerId)?.id;
      setWinner(fastestPlayer || null);
      if (fastestPlayer) {
        setScores(prev => ({ ...prev, [fastestPlayer]: (prev[fastestPlayer] || 0) + 10 }));
      }
    }
  }, [myAnswerTime, partnerAnswerTime, questionStartTime, playerId, room.players]);

  const fetchQuestion = async (cat: QuestionCategory) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/games/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'intimate-confessions',
          category: cat,
          playerNames: room.players.map(p => p.name),
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setCurrentQuestion({ id: Date.now().toString(), text: data.question, category: data.category, type: 'confession' });
      setQuestionStartTime(Date.now());
      setShowAnswer(false);
      setAnswer('');
      setPartnerAnswer(null);
      setMyAnswerTime(null);
      setPartnerAnswerTime(null);
      setWinner(null);
    } catch {
      setCurrentQuestion({ id: Date.now().toString(), text: 'Failed to load question. Tap Next to try again.', category: cat, type: 'confession' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (cat: QuestionCategory) => {
    setCategory(cat);
    fetchQuestion(cat);
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    setMyAnswerTime(Date.now());
    setShowAnswer(true);
    const partnerResponses = [
      "I've always wanted to share this with you...",
      "My deepest desire is to make every moment with you unforgettable.",
      "I dream about the adventures we could have together.",
      "There's something I've been wanting to tell you for a long time...",
      "You make me feel things I've never felt before.",
      "Every day with you feels like a beautiful secret.",
    ];
    setTimeout(() => {
      setPartnerAnswer(partnerResponses[Math.floor(Math.random() * partnerResponses.length)]);
      setPartnerAnswerTime(Date.now());
    }, 3000);
  };

  const handleNextRound = () => {
    setRoundNumber(r => r + 1);
    fetchQuestion(category);
  };

  const handleVoteWinner = (winnerId: string) => {
    setScores(prev => ({ ...prev, [winnerId]: (prev[winnerId] || 0) + 10 }));
  };

  const activeCat = CATEGORIES.find(c => c.value === category)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d0a3e] to-[#1a0a2e] flex flex-col items-center justify-start p-4 pt-6">

      {/* Header */}
      <div className="w-full max-w-lg mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-pink-500/40 rounded-2xl px-5 py-2 mb-3">
          <span className="text-2xl">💋</span>
          <h1 className="text-xl font-bold text-white tracking-wide">Intimate Confessions</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-pink-300">
          <span>Room: <span className="text-pink-200 font-semibold">{room.code}</span></span>
          <span className="w-1 h-1 rounded-full bg-pink-400" />
          <span>Round <span className="text-pink-300 font-semibold">{roundNumber}</span></span>
        </div>
      </div>

      {/* Category Selector */}
      <div className="w-full max-w-lg mb-5">
        <p className="text-xs text-pink-300 uppercase tracking-widest mb-2 text-center">Choose a vibe</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
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
      <div className="w-full max-w-lg">

        {/* Loading */}
        {isLoading && (
          <div className="bg-white/10 border border-pink-500/40 rounded-2xl p-10 text-center">
            <p className="text-white/70 text-sm">Loading question...</p>
          </div>
        )}

        {/* Question Phase */}
        {!isLoading && currentQuestion && !showAnswer && (
          <div className="space-y-4">
            {/* Question Card */}
            <div className="relative bg-white/10 border border-pink-500/40 rounded-2xl p-6 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${activeCat.color} opacity-5 rounded-2xl`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{activeCat.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-300">
                    {activeCat.label}
                  </span>
                </div>
                <p className="text-white text-lg font-medium leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>
            </div>

            {/* Answer Input */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <label className="text-xs text-pink-300 uppercase tracking-widest mb-2 block">Your Confession</label>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Be honest, be bold, be you..."
                rows={4}
                className="w-full bg-transparent text-white placeholder-white/40 text-sm focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-xs text-white/50">{answer.length} chars</span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${answer.trim()
                      ? `bg-gradient-to-r ${activeCat.color} text-white shadow-lg hover:scale-105`
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                >
                  💌 Submit
                </button>
              </div>
            </div>

            {/* Skip */}
            <button
              onClick={handleNextRound}
              className="w-full text-xs text-white/50 hover:text-white/80 transition py-1"
            >
              Skip this question →
            </button>
          </div>
        )}

        {/* Answer Reveal Phase */}
        {!isLoading && showAnswer && (
          <div className="space-y-4">
            {/* Question recap */}
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs mb-1">Question</p>
              <p className="text-white/80 text-sm">{currentQuestion?.text}</p>
            </div>

            {/* Your answer */}
            <div className="bg-white/10 border border-pink-500/40 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">
                  {room.players.find(p => p.id === playerId)?.name?.[0]?.toUpperCase() || 'Y'}
                </div>
                <span className="text-pink-300 text-sm font-semibold">Your Confession</span>
              </div>
              <p className="text-white text-sm leading-relaxed">{answer}</p>
            </div>

            {/* Partner answer */}
            {partnerAnswer ? (
              <div className="bg-white/10 border border-purple-500/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    {room.players.find(p => p.id !== playerId)?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <span className="text-purple-300 text-sm font-semibold">
                    {room.players.find(p => p.id !== playerId)?.name || 'Partner'}'s Confession
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">{partnerAnswer}</p>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center">
                <p className="text-white/70 text-sm">⏳ Waiting for partner's confession...</p>
              </div>
            )}

            {/* Winner banner */}
            {winner && partnerAnswer && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-center">
                <span className="text-yellow-300 text-sm font-semibold">
                  🏆 {room.players.find(p => p.id === winner)?.name} answered first!
                </span>
              </div>
            )}

            {/* Vote + Next */}
            {partnerAnswer && (
              <>
                <div className="bg-white/10 border border-yellow-500/30 rounded-2xl p-4">
                  <p className="text-yellow-300 text-xs uppercase tracking-widest text-center mb-3">Vote for best confession</p>
                  <div className="grid grid-cols-2 gap-3">
                    {room.players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleVoteWinner(player.id)}
                        className="bg-white/10 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 border border-white/20 hover:border-transparent text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextRound}
                  className={`w-full bg-gradient-to-r ${activeCat.color} text-white py-4 rounded-2xl font-semibold text-base hover:scale-[1.02] transition-all duration-200 shadow-lg`}
                >
                  Next Question →
                </button>
              </>
            )}
          </div>
        )}

        {/* Scoreboard */}
        {Object.keys(scores).length > 0 && (
          <div className="mt-5 bg-white/10 border border-green-500/30 rounded-2xl p-4">
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
