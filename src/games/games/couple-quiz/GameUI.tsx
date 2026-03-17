'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';
import { aiQuestionService } from '@/games/services/aiQuestionService';

interface CoupleQuizProps {
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

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    handleRequestQuestion();
  }, []);

  const handleRequestQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const question = aiQuestionService.getInstantQuestion('couple-quiz', category);
      setCurrentQuestion({ id: Date.now().toString(), text: question.question, options: question.options, category: question.category, type: 'quiz' });
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
    setTimeout(() => {
      const randomAnswer = Math.floor(Math.random() * (currentQuestion?.options?.length || 4));
      setPartnerAnswer(randomAnswer);
      setPartnerAnswerTime(Date.now());
    }, 1000);
  }, [currentQuestion]);

  const handleNextRound = useCallback(() => {
    handleRequestQuestion();
    setMyAnswer(null);
    setPartnerAnswer(null);
    setMyAnswerTime(null);
    setPartnerAnswerTime(null);
    setWinner(null);
  }, [handleRequestQuestion]);

  useEffect(() => {
    if (myAnswer !== null && partnerAnswer !== null && myAnswerTime !== null && partnerAnswerTime !== null) {
      const myTime = myAnswerTime - questionStartTime;
      const partnerTime = partnerAnswerTime - questionStartTime;
      if (myAnswer === partnerAnswer) {
        const fastestPlayer = myTime < partnerTime ? playerId : partner?.id;
        setWinner(fastestPlayer || null);
        setScores(prev => {
          const newScores = { ...prev };
          if (fastestPlayer) newScores[fastestPlayer] = (newScores[fastestPlayer] || 0) + 10;
          return newScores;
        });
      }
    }
  }, [myAnswer, partnerAnswer, myAnswerTime, partnerAnswerTime, questionStartTime, playerId, partner]);

  useEffect(() => {
    if (gameStarted) aiQuestionService.preloadQuestions('couple-quiz', category, 3);
  }, [gameStarted, category]);

  const activeCat = CATEGORIES.find(c => c.value === category)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] flex flex-col items-center justify-start p-4 pt-6">

      {/* Header */}
      <div className="w-full max-w-lg mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-pink-500/40 rounded-2xl px-5 py-2 mb-3">
          <span className="text-2xl">❤️</span>
          <h1 className="text-xl font-bold text-white tracking-wide">Couple Quiz</h1>
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
              disabled={gameStarted ? false : !isOwner}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-150
                ${category === cat.value
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-md`
                  : 'bg-white/10 text-pink-200 border-white/20 hover:bg-white/20 hover:text-white'
                } ${!isOwner && !gameStarted ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        {!isOwner && !gameStarted && (
          <p className="text-center text-white/60 text-xs mt-2">Waiting for host to select category...</p>
        )}
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* Pre-game start */}
        {!gameStarted && isOwner && (
          <button
            onClick={handleStartGame}
            className={`w-full bg-gradient-to-r ${activeCat.color} text-white py-4 rounded-2xl font-semibold text-base shadow-lg`}
          >
            🎲 Start Game
          </button>
        )}

        {/* Loading */}
        {gameStarted && loading && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
            <p className="text-white/70 text-sm">Loading question...</p>
          </div>
        )}

        {/* Question */}
        {gameStarted && !loading && currentQuestion && myAnswer === null && (
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
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-pink-500/60 text-white py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-150"
                    >
                      <span className={`w-6 h-6 rounded-full bg-gradient-to-r ${activeCat.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Answer reveal */}
        {myAnswer !== null && (
          <div className="space-y-3">
            {/* Question recap */}
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs mb-1">Question</p>
              <p className="text-white/80 text-sm">{currentQuestion?.text}</p>
            </div>

            {/* My answer */}
            <div className="bg-white/10 border border-pink-500/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${activeCat.color} flex items-center justify-center text-xs font-bold text-white`}>
                  {room.players.find(p => p.id === playerId)?.name?.[0]?.toUpperCase() || 'Y'}
                </div>
                <span className="text-pink-300 text-sm font-semibold">Your Answer</span>
              </div>
              <p className="text-white text-sm">{currentQuestion?.options?.[myAnswer]}</p>
            </div>

            {/* Partner answer */}
            {partnerAnswer !== null ? (
              <div className="bg-white/10 border border-purple-500/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    {partner?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <span className="text-purple-300 text-sm font-semibold">{partner?.name}'s Answer</span>
                </div>
                <p className="text-white text-sm">{currentQuestion?.options?.[partnerAnswer]}</p>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <p className="text-white/70 text-sm">Waiting for {partner?.name}'s answer...</p>
              </div>
            )}

            {/* Match result */}
            {partnerAnswer !== null && myAnswer === partnerAnswer && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
                <p className="text-green-400 text-sm font-semibold">🎉 Perfect Match! You both answered the same!</p>
                {winner && (
                  <p className="text-yellow-300 text-xs mt-1">🏆 {room.players.find(p => p.id === winner)?.name} answered fastest!</p>
                )}
              </div>
            )}

            {/* Scores */}
            {partnerAnswer !== null && (
              <div className="bg-white/10 border border-yellow-500/30 rounded-2xl p-4">
                <p className="text-yellow-300 text-xs uppercase tracking-widest text-center mb-3">Scores</p>
                <div className="grid grid-cols-2 gap-2">
                  {room.players.map(player => (
                    <div key={player.id} className="bg-white/10 border border-white/20 rounded-xl py-3 text-center">
                      <p className="text-white/80 text-xs mb-1">{player.name}</p>
                      <p className="text-white font-bold text-lg">{scores[player.id] || 0}</p>
                      <p className="text-white/60 text-xs">pts</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {partnerAnswer !== null && (
              <button
                onClick={handleNextRound}
                className={`w-full bg-gradient-to-r ${activeCat.color} text-white py-4 rounded-2xl font-semibold text-base shadow-lg`}
              >
                Next Question →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
