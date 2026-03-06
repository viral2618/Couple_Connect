export type GameType = 'truth-or-dare' | 'couple-quiz' | 'would-you-rather' | 'rapid-questions' | 'intimate-confessions';

export type QuestionCategory = 'romantic' | 'spicy' | 'deep' | 'playful' | 'seductive';

export interface Player {
  id: string;
  name: string;
  socketId: string;
  isOwner: boolean;
  score: number;
  avatar?: string;
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  gameType: GameType | null;
  gameState: GameState;
  createdAt: number;
  maxPlayers: 2;
}

export interface GameState {
  status: 'waiting' | 'selecting' | 'playing' | 'finished';
  currentQuestion: Question | null;
  currentRound: number;
  totalRounds: number;
  scores: Record<string, number>;
  currentTurn: string | null;
  answers: Record<string, any>;
}

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  options?: string[];
  correctAnswer?: string;
  type: 'truth' | 'dare' | 'quiz' | 'choice' | 'rapid' | 'confession';
}

export interface AIQuestionRequest {
  gameType: GameType;
  category: QuestionCategory;
  playerNames: string[];
  previousQuestions?: string[];
}

export interface AIQuestionResponse {
  question: string;
  options?: string[];
  correctAnswer?: string | null;
  category: QuestionCategory;
  type: Question['type'];
}
