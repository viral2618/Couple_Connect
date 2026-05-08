export interface Card {
  id: number;
  type: 'chance' | 'dare';
  title: string;
  description: string;
  effect: 'forward' | 'backward' | 'task' | 'swap' | 'skip';
  value?: number;
  spiceLevel: 1 | 2 | 3 | 4 | 5;
}

// CHANCE CARDS - Random events
export const CHANCE_CARDS: Card[] = [
  { id: 1, type: 'chance', title: 'Lucky Move', description: 'Move forward 3 spaces!', effect: 'forward', value: 3, spiceLevel: 1 },
  { id: 2, type: 'chance', title: 'Oops!', description: 'Move back 2 spaces', effect: 'backward', value: 2, spiceLevel: 1 },
  { id: 3, type: 'chance', title: 'Double Kiss', description: 'Kiss your partner twice and move forward 2', effect: 'forward', value: 2, spiceLevel: 2 },
  { id: 4, type: 'chance', title: 'Swap Positions', description: 'Swap positions with your partner!', effect: 'swap', spiceLevel: 2 },
  { id: 5, type: 'chance', title: 'Free Pass', description: 'Skip your next task without penalty', effect: 'skip', spiceLevel: 1 },
  { id: 6, type: 'chance', title: 'Bonus Round', description: 'Complete a quick task and move forward 4', effect: 'task', value: 4, spiceLevel: 3 },
  { id: 7, type: 'chance', title: 'Slow Down', description: 'Too fast! Move back 3 spaces', effect: 'backward', value: 3, spiceLevel: 1 },
  { id: 8, type: 'chance', title: 'Lucky Streak', description: 'Roll again and move double!', effect: 'forward', value: 0, spiceLevel: 2 },
  { id: 9, type: 'chance', title: 'Tease Time', description: 'Tease your partner for 30 seconds, then move forward 2', effect: 'task', value: 2, spiceLevel: 3 },
  { id: 10, type: 'chance', title: 'Jackpot!', description: 'Move forward 5 spaces!', effect: 'forward', value: 5, spiceLevel: 1 },
];

// DARE CARDS - Spicy challenges
export const DARE_CARDS: Card[] = [
  { id: 11, type: 'dare', title: 'Lap Dance', description: 'Give your partner a 30-second lap dance', effect: 'task', spiceLevel: 4 },
  { id: 12, type: 'dare', title: 'Body Shot', description: 'Take a body shot from your partner', effect: 'task', spiceLevel: 5 },
  { id: 13, type: 'dare', title: 'Strip Tease', description: 'Perform a strip tease (remove 2 items)', effect: 'task', spiceLevel: 5 },
  { id: 14, type: 'dare', title: 'Dirty Talk', description: 'Whisper your dirtiest fantasy for 1 minute', effect: 'task', spiceLevel: 4 },
  { id: 15, type: 'dare', title: 'Blindfold Kiss', description: 'Blindfold your partner and kiss them anywhere', effect: 'task', spiceLevel: 4 },
  { id: 16, type: 'dare', title: 'Ice Play', description: 'Use ice cube on your partner\'s body', effect: 'task', spiceLevel: 5 },
  { id: 17, type: 'dare', title: 'Massage Master', description: 'Give a full body massage for 2 minutes', effect: 'task', spiceLevel: 3 },
  { id: 18, type: 'dare', title: 'Seductive Dance', description: 'Dance seductively while maintaining eye contact', effect: 'task', spiceLevel: 4 },
  { id: 19, type: 'dare', title: 'Truth or Strip', description: 'Answer a personal question or remove an item', effect: 'task', spiceLevel: 4 },
  { id: 20, type: 'dare', title: 'Ultimate Tease', description: 'Tease your partner without touching for 1 minute', effect: 'task', spiceLevel: 5 },
];

// Get random card
export const getRandomCard = (type: 'chance' | 'dare'): Card => {
  const deck = type === 'chance' ? CHANCE_CARDS : DARE_CARDS;
  return deck[Math.floor(Math.random() * deck.length)];
};

// Get card color
export const getCardColor = (type: 'chance' | 'dare'): string => {
  return type === 'chance' 
    ? 'from-orange-500 to-orange-700' 
    : 'from-red-500 to-red-700';
};

// Get card icon
export const getCardIcon = (type: 'chance' | 'dare'): string => {
  return type === 'chance' ? '🎴' : '🔥';
};
