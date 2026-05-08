import { lazy, Suspense } from 'react';
import { GameType, Room } from '@/games/types/gameTypes';

// Lazy load game components for better performance
const SeductiveLudo = lazy(() => import('@/games/games/seductive-ludo/GameUI'));
const IntimateConfessions = lazy(() => import('@/games/games/intimate-confessions/GameUI'));
const TruthOrDare = lazy(() => import('@/games/games/truth-or-dare/GameUI'));
const WouldYouRather = lazy(() => import('@/games/games/would-you-rather/GameUI'));
const CoupleQuiz = lazy(() => import('@/games/games/couple-quiz/GameUI'));
const RapidQuestions = lazy(() => import('@/games/games/rapid-questions/GameUI'));

interface GameLoaderProps {
  gameType: GameType;
  room: Room;
  playerId: string;
}

const GameLoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-white text-2xl font-bold">Loading Game...</div>
    </div>
  </div>
);

export default function GameLoader({ gameType, room, playerId }: GameLoaderProps) {
  const renderGame = () => {
    const gameProps = { room, playerId };
    
    switch (gameType) {
      case 'seductive-ludo':
        return <SeductiveLudo {...gameProps} />;
      case 'intimate-confessions':
        return <IntimateConfessions {...gameProps} />;
      case 'truth-or-dare':
        return <TruthOrDare {...gameProps} />;
      case 'would-you-rather':
        return <WouldYouRather {...gameProps} />;
      case 'couple-quiz':
        return <CoupleQuiz {...gameProps} />;
      case 'rapid-questions':
        return <RapidQuestions {...gameProps} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
            <div className="text-white text-xl">Game not found</div>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={<GameLoadingSpinner />}>
      {renderGame()}
    </Suspense>
  );
}