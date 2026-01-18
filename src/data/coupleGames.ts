export interface CoupleGame {
  id: string;
  name: string;
  category: string;
  intimacyLevel: string;
  objective: string;
  description: string;
  tags: string[];
  duration: string;
  players: number;
  difficulty: string;
  materials: string[];
  instructions: string[];
  variations: string[];
  benefits: string[];
  icon: string;
}

export const coupleGames: CoupleGame[] = [
  {
    id: 'love-addiction',
    name: 'Love Addiction',
    category: 'Intimate Questions',
    intimacyLevel: 'High',
    objective: 'Deepen emotional and physical connection through progressive intimate questions',
    description: 'The most addictive couples game that deepens your connection through progressive levels of intimacy',
    tags: ['intimate', 'questions', 'progressive', 'addiction', 'connection'],
    duration: '30-60 minutes',
    players: 2,
    difficulty: 'Medium',
    materials: ['Phone/Device', 'Private space'],
    instructions: [
      'Start with basic questions and progress to more intimate ones',
      'Answer honestly and openly',
      'Take turns asking and answering',
      'Build streaks by playing daily',
      'Unlock new content as you progress'
    ],
    variations: [
      'Daily Challenge Mode',
      'Quick Play (5 questions)',
      'Progressive Mode (unlock levels)',
      'Streak Challenge'
    ],
    benefits: [
      'Deeper emotional connection',
      'Better communication',
      'Increased intimacy',
      'Daily bonding ritual',
      'Progressive relationship growth'
    ],
    icon: '💕'
  },
  {
    id: 'truth-or-dare',
    name: 'Truth or Dare',
    category: 'Classic Games',
    intimacyLevel: 'Medium',
    objective: 'Build trust and excitement through truth questions and romantic dares',
    description: 'Classic game with a romantic twist - choose truth for deep questions or dare for fun challenges',
    tags: ['truth', 'dare', 'classic', 'fun', 'romantic'],
    duration: '20-45 minutes',
    players: 2,
    difficulty: 'Easy',
    materials: ['None required'],
    instructions: [
      'Take turns choosing Truth or Dare',
      'Answer truthfully or complete the dare',
      'Keep it fun and respectful',
      'Build up intensity gradually'
    ],
    variations: [
      'Only Truths',
      'Only Dares',
      'Romantic Focus',
      'Playful Focus'
    ],
    benefits: [
      'Builds trust',
      'Creates fun memories',
      'Encourages openness',
      'Adds excitement'
    ],
    icon: '🎯'
  },
  {
    id: 'seductive-secrets',
    name: 'Seductive Secrets',
    category: 'Intimate Questions',
    intimacyLevel: 'High',
    objective: 'Unlock deepest desires and fantasies through progressive intimacy levels',
    description: 'Progressive intimacy system with 8 levels - from flirty to forbidden. Share confessions, fantasies, and desires',
    tags: ['seductive', 'secrets', 'progressive', 'intimate', 'fantasies'],
    duration: '30-60 minutes',
    players: 2,
    difficulty: 'Medium',
    materials: ['Phone/Device', 'Private space'],
    instructions: [
      'Choose your mood (playful, romantic, passionate, wild)',
      'Progress through 8 intimacy levels',
      'Share confessions, fantasies, and desires',
      'Be honest and seductive in your responses',
      'Unlock new content as you advance'
    ],
    variations: [
      'Playful Mode',
      'Romantic Mode', 
      'Passionate Mode',
      'Wild Mode'
    ],
    benefits: [
      'Deepens intimate connection',
      'Explores fantasies safely',
      'Progressive intimacy building',
      'Unlocks hidden desires',
      'Creates seductive atmosphere'
    ],
    icon: '💋'
  }
];

export const categories = ['All', 'Intimate Questions', 'Classic Games', 'Fantasy Sharing', 'Communication', 'Physical Connection', 'Nostalgia'];
export const intimacyLevels = ['All', 'Low', 'Medium', 'High'];