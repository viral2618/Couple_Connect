'use client';

import { useState, useEffect } from 'react';
import { Room, QuestionCategory, Question } from '@/games/types/gameTypes';
import { socketService } from '@/games/services/socketService';

interface IntimateConfessionsProps {
  room: Room;
  playerId: string;
}

type GamePhase = 'waiting' | 'category-select' | 'answering' | 'results';

export default function IntimateConfessions({ room, playerId }: IntimateConfessionsProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [category, setCategory] = useState<QuestionCategory>('romantic');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState('');
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundNumber, setRoundNumber] = useState(1);
  const [isHost, setIsHost] = useState(false);
  const [mySubmitTime, setMySubmitTime] = useState<number | null>(null);
  const [partnerSubmitTime, setPartnerSubmitTime] = useState<number | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [answerQuality, setAnswerQuality] = useState<{ playerId: string; score: number }[]>([]);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);
  const MAX_ROUNDS = 5;

  const categories: { value: QuestionCategory; label: string; emoji: string; desc: string }[] = [
    { value: 'romantic', label: 'Romantic', emoji: '💕', desc: 'Sweet & loving questions' },
    { value: 'playful', label: 'Playful', emoji: '😏', desc: 'Fun & flirty questions' },
    { value: 'seductive', label: 'Seductive', emoji: '🔥', desc: 'Hot & steamy questions' },
    { value: 'deep', label: 'Deep', emoji: '💭', desc: 'Meaningful & intimate' }
  ];

  const playerName = room.players.find(p => p.id === playerId)?.name || 'You';
  const partnerName = room.players.find(p => p.id !== playerId)?.name || 'Partner';

  useEffect(() => {
    const socket = socketService.connect();
    const hostPlayer = room.players[0];
    const amHost = hostPlayer?.id === playerId;
    setIsHost(amHost);
    
    if (amHost && gamePhase === 'waiting') {
      setGamePhase('category-select');
    }

    socketService.on('game:question-received', (question: any) => {
      if (!usedQuestions.has(question.question)) {
        setUsedQuestions(prev => new Set([...Array.from(prev), question.question]));
        setCurrentQuestion({
          id: question.id || Date.now().toString(),
          text: question.question,
          category: question.category,
          type: 'confession'
        });
        setGamePhase('answering');
        setMyAnswer('');
        setPartnerAnswer(null);
        setMySubmitTime(null);
        setPartnerSubmitTime(null);
        setRoundWinner(null);
        setAnswerQuality([]);
      } else {
        // Request new question if duplicate
        if (isHost) {
          socketService.requestQuestion(room.code, category);
        }
      }
    });

    socketService.on('game:round-update', ({ roundNumber: newRound, gameEnded: ended }: { roundNumber: number; gameEnded: boolean }) => {
      console.log('📥 Round update received:', { newRound, ended });
      setRoundNumber(newRound);
      if (ended) {
        setGameEnded(true);
        setGamePhase('results');
      } else {
        setGamePhase('category-select');
      }
    });

    socketService.on('game:scores-update', ({ scores: newScores }: { scores: Record<string, number> }) => {
      console.log('📥 Scores update received:', newScores);
      setScores(newScores);
    });

    socketService.on('game:answer-received', ({ playerId: answerPlayerId, answer }: { playerId: string; answer: any }) => {
      console.log('📥 Answer received:', { answerPlayerId, answer });
      if (answerPlayerId !== playerId) {
        const answerData = typeof answer === 'object' ? answer.answer : answer;
        const submitTime = typeof answer === 'object' ? answer.submitTime : Date.now();
        setPartnerAnswer(answerData);
        setPartnerSubmitTime(submitTime);
        
        if (myAnswer && mySubmitTime) {
          calculateRoundResults(myAnswer, answerData, mySubmitTime, submitTime);
        }
        
        // Also check if partner should trigger game end
        if (roundNumber >= MAX_ROUNDS && myAnswer && mySubmitTime) {
          setTimeout(() => {
            setGameEnded(true);
          }, 3000);
        }
      }
    });

    return () => {
      socketService.off('game:question-received');
      socketService.off('game:round-update');
      socketService.off('game:scores-update');
      socketService.off('game:answer-received');
    };
  }, [room, playerId, myAnswer, mySubmitTime]);

  const calculateRoundResults = (answer1: string, answer2: string, time1: number, time2: number) => {
    const qualityScore1 = calculateAnswerQuality(answer1);
    const qualityScore2 = calculateAnswerQuality(answer2);
    
    const speedBonus = 5;
    const firstSubmitter = time1 < time2 ? playerId : room.players.find(p => p.id !== playerId)?.id;
    
    let player1Score = qualityScore1;
    let player2Score = qualityScore2;
    
    if (firstSubmitter === playerId) {
      player1Score += speedBonus;
    } else {
      player2Score += speedBonus;
    }
    
    const winner = player1Score > player2Score ? playerId : room.players.find(p => p.id !== playerId)?.id;
    setRoundWinner(winner || null);
    
    const newScores = { ...scores };
    newScores[playerId] = (newScores[playerId] || 0) + player1Score;
    const partnerId = room.players.find(p => p.id !== playerId)?.id;
    if (partnerId) {
      newScores[partnerId] = (newScores[partnerId] || 0) + player2Score;
    }
    setScores(newScores);
    
    // Emit scores update to partner
    socketService.getSocket()?.emit('game:scores-update', { 
      code: room.code, 
      scores: newScores 
    });
    
    setAnswerQuality([
      { playerId, score: player1Score },
      { playerId: partnerId || '', score: player2Score }
    ]);
    
    setGamePhase('results');
    
    // Check if game should end after this round
    if (roundNumber >= MAX_ROUNDS) {
      setTimeout(() => {
        setGameEnded(true);
        // Both players emit game end to ensure sync
        socketService.getSocket()?.emit('game:round-update', {
          code: room.code,
          roundNumber: roundNumber,
          gameEnded: true
        });
      }, 3000); // Show round results for 3 seconds then show winner page
    }
  };

  const calculateAnswerQuality = (answer: string): number => {
    let score = 0;
    
    if (answer.length >= 10) score += 5;
    if (answer.length >= 50) score += 5;
    if (answer.length >= 100) score += 5;
    
    const emotionalWords = ['love', 'feel', 'want', 'desire', 'dream', 'wish', 'heart', 'soul', 'passion', 'intimate', 'close', 'together', 'forever', 'always', 'never', 'beautiful', 'amazing', 'incredible'];
    const foundWords = emotionalWords.filter(word => answer.toLowerCase().includes(word));
    score += Math.min(foundWords.length * 2, 10);
    
    const words = answer.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (uniqueWords.size > words.length * 0.8) score += 5;
    
    return Math.min(score, 25);
  };

  const handleStartGame = () => {
    if (isHost) {
      socketService.requestQuestion(room.code, category);
    }
  };

  const handleSubmitAnswer = () => {
    if (myAnswer.trim()) {
      console.log('📤 Submitting answer:', myAnswer.trim(), 'Room:', room.code);
      const submitTime = Date.now();
      setMySubmitTime(submitTime);
      socketService.submitAnswer(room.code, playerId, { answer: myAnswer.trim(), submitTime });
      
      if (partnerAnswer && partnerSubmitTime) {
        calculateRoundResults(myAnswer.trim(), partnerAnswer, submitTime, partnerSubmitTime);
      }
    }
  };

  const handleNextRound = () => {
    if (isHost) {
      if (roundNumber >= MAX_ROUNDS) {
        setGameEnded(true);
        setGamePhase('results');
        // Emit game end to partner
        socketService.getSocket()?.emit('game:round-update', {
          code: room.code,
          roundNumber: roundNumber,
          gameEnded: true
        });
      } else {
        const newRound = roundNumber + 1;
        setRoundNumber(newRound);
        setGamePhase('category-select');
        // Emit round update to partner
        socketService.getSocket()?.emit('game:round-update', {
          code: room.code,
          roundNumber: newRound,
          gameEnded: false
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-purple-200">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💋 Intimate Confessions</h1>
          <p className="text-purple-600 text-base mb-3 font-medium">Quality & Speed Matter</p>
          <div className="flex justify-between text-sm text-gray-700 bg-purple-50 rounded-lg px-4 py-2">
            <span className="font-semibold">Room: {room.code}</span>
            <span className="font-semibold">Round: {roundNumber}/{MAX_ROUNDS}</span>
            <span className="font-semibold">{playerName} vs {partnerName}</span>
          </div>
        </div>

        {Object.keys(scores).length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
            <div className="flex justify-between text-base font-bold">
              <span className="text-green-600">{playerName}: {scores[playerId] || 0}</span>
              <span className="text-purple-600">{partnerName}: {scores[room.players.find(p => p.id !== playerId)?.id || ''] || 0}</span>
            </div>
          </div>
        )}

        {gamePhase === 'waiting' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-gray-800 text-lg mb-2 font-semibold">Waiting for host...</h3>
            <p className="text-gray-600 text-sm">The host will start the game</p>
          </div>
        )}

        {gamePhase === 'category-select' && isHost && (
          <div className="space-y-4">
            <h3 className="text-gray-800 text-lg font-semibold text-center mb-4">Choose a category:</h3>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    category === cat.value
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <div className="font-semibold">{cat.label}</div>
                      <div className="text-sm opacity-75">{cat.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              🎯 Start Round {roundNumber}
            </button>
          </div>
        )}

        {gamePhase === 'answering' && currentQuestion && (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="text-center mb-3">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {currentQuestion.category?.toUpperCase() || 'QUESTION'}
                </span>
              </div>
              <p className="text-gray-800 text-center font-medium">
                {currentQuestion.text}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="text-purple-600 text-base font-semibold mb-3 block">Your confession:</label>
              <textarea
                value={myAnswer}
                onChange={(e) => setMyAnswer(e.target.value)}
                placeholder="Be detailed, honest, and creative for more points..."
                rows={4}
                className="w-full bg-white text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-base border border-gray-300"
              />
              <div className="text-sm text-gray-600 mt-2 font-medium">
                {myAnswer.length} characters • Quality + Speed = Points
              </div>
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={!myAnswer.trim() || mySubmitTime !== null}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {mySubmitTime ? '✅ Submitted' : '⚡ Submit Answer'}
            </button>

            {partnerAnswer && (
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                <p className="text-blue-600 text-sm font-medium">✅ {partnerName} has answered</p>
              </div>
            )}
          </div>
        )}

        {gamePhase === 'results' && !gameEnded && (
          <div className="space-y-4">
            <h3 className="text-gray-800 text-xl font-bold text-center">Round Results</h3>
            
            {roundWinner && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
                <h4 className="text-yellow-600 font-bold text-lg mb-2">🏆 Round Winner</h4>
                <p className="text-gray-800 font-bold text-lg">
                  {room.players.find(p => p.id === roundWinner)?.name}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-pink-600 font-bold text-base">{playerName}:</h4>
                  <span className="text-pink-600 text-base font-bold">
                    {answerQuality.find(a => a.playerId === playerId)?.score || 0} pts
                  </span>
                </div>
                <p className="text-gray-700 text-base">{myAnswer}</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-purple-600 font-bold text-base">{partnerName}:</h4>
                  <span className="text-purple-600 text-base font-bold">
                    {answerQuality.find(a => a.playerId !== playerId)?.score || 0} pts
                  </span>
                </div>
                <p className="text-gray-700 text-base">{partnerAnswer}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-gray-600 text-sm text-center font-medium">
                Points: Length + Keywords + Creativity + Speed Bonus (5pts)
              </p>
            </div>

            {isHost && (
              <button
                onClick={handleNextRound}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
              >
                🎯 Next Round ({roundNumber + 1}/{MAX_ROUNDS})
              </button>
            )}
          </div>
        )}

        {gamePhase === 'results' && gameEnded && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h2>
              <p className="text-purple-600 text-lg font-medium">Final Results</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">🎉 Winner</h3>
              <div className="text-center">
                {(() => {
                  const myTotalScore = scores[playerId] || 0;
                  const partnerTotalScore = scores[room.players.find(p => p.id !== playerId)?.id || ''] || 0;
                  const winner = myTotalScore > partnerTotalScore ? playerName : 
                                myTotalScore < partnerTotalScore ? partnerName : 'Tie';
                  
                  if (winner === 'Tie') {
                    return (
                      <div>
                        <p className="text-3xl font-bold text-purple-600 mb-2">It's a Tie! 🤝</p>
                        <p className="text-gray-600">Both players scored {myTotalScore} points</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div>
                      <p className="text-4xl font-bold text-yellow-600 mb-2">{winner}</p>
                      <p className="text-gray-600 text-lg">
                        {winner === playerName ? myTotalScore : partnerTotalScore} points
                      </p>
                    </div>
                  );
                })()} 
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Final Scores</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-bold text-green-700">{playerName}</span>
                  <span className="font-bold text-green-700 text-xl">{scores[playerId] || 0} pts</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="font-bold text-purple-700">{partnerName}</span>
                  <span className="font-bold text-purple-700 text-xl">{scores[room.players.find(p => p.id !== playerId)?.id || ''] || 0} pts</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="text-lg font-bold text-blue-700 mb-3 text-center">Game Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{MAX_ROUNDS}</p>
                  <p className="text-blue-600 text-sm">Rounds Played</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{Object.keys(usedQuestions).length}</p>
                  <p className="text-blue-600 text-sm">Questions Asked</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-gray-600 font-medium">Thanks for playing Intimate Confessions! 💕</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                🎮 Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}