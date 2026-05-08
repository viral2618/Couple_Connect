export type TaskCategory = 'kiss' | 'touch' | 'talk' | 'look' | 'spicy';

export interface Task {
  id: number;
  category: TaskCategory;
  title: string;
  description: string;
  duration: number; // seconds
  spiceLevel: 1 | 2 | 3 | 4 | 5; // 1=mild, 5=very spicy
}

export const TASKS: Task[] = [
  // KISS TASKS 💋
  { id: 1, category: 'kiss', title: 'Soft Kiss', description: 'Give your partner a soft, gentle kiss on the lips', duration: 30, spiceLevel: 1 },
  { id: 2, category: 'kiss', title: 'Neck Kiss', description: 'Kiss your partner\'s neck slowly for 10 seconds', duration: 45, spiceLevel: 2 },
  { id: 3, category: 'kiss', title: 'Forehead Kiss', description: 'Give a loving forehead kiss while holding their face', duration: 30, spiceLevel: 1 },
  { id: 4, category: 'kiss', title: 'Passionate Kiss', description: 'Share a passionate 15-second kiss', duration: 60, spiceLevel: 3 },
  { id: 5, category: 'kiss', title: 'Ear Kiss', description: 'Gently kiss and nibble your partner\'s ear', duration: 45, spiceLevel: 3 },

  // TOUCH TASKS 👐
  { id: 6, category: 'touch', title: 'Hand Massage', description: 'Give your partner a sensual hand massage', duration: 60, spiceLevel: 1 },
  { id: 7, category: 'touch', title: 'Back Trace', description: 'Trace your fingers slowly down their back', duration: 45, spiceLevel: 2 },
  { id: 8, category: 'touch', title: 'Hair Play', description: 'Run your fingers through their hair gently', duration: 45, spiceLevel: 1 },
  { id: 9, category: 'touch', title: 'Thigh Touch', description: 'Gently caress your partner\'s thigh', duration: 45, spiceLevel: 3 },
  { id: 10, category: 'touch', title: 'Waist Hold', description: 'Pull them close by the waist and hold for 20 seconds', duration: 45, spiceLevel: 2 },

  // TALK TASKS 💬
  { id: 11, category: 'talk', title: 'Compliment', description: 'Tell them what you find most attractive about them', duration: 30, spiceLevel: 1 },
  { id: 12, category: 'talk', title: 'Whisper Fantasy', description: 'Whisper a secret fantasy in their ear', duration: 45, spiceLevel: 4 },
  { id: 13, category: 'talk', title: 'Dirty Talk', description: 'Say something naughty that turns you on', duration: 30, spiceLevel: 4 },
  { id: 14, category: 'talk', title: 'Love Words', description: 'Tell them why you love being intimate with them', duration: 45, spiceLevel: 2 },
  { id: 15, category: 'talk', title: 'Seductive Voice', description: 'Describe what you want to do to them in a seductive voice', duration: 60, spiceLevel: 5 },

  // LOOK TASKS 👀
  { id: 16, category: 'look', title: 'Eye Contact', description: 'Maintain intense eye contact for 30 seconds without breaking', duration: 45, spiceLevel: 2 },
  { id: 17, category: 'look', title: 'Seductive Stare', description: 'Give them your most seductive look while biting your lip', duration: 30, spiceLevel: 3 },
  { id: 18, category: 'look', title: 'Body Scan', description: 'Slowly look them up and down with desire', duration: 30, spiceLevel: 3 },
  { id: 19, category: 'look', title: 'Undress Eyes', description: 'Look at them as if you\'re undressing them with your eyes', duration: 45, spiceLevel: 4 },
  { id: 20, category: 'look', title: 'Love Gaze', description: 'Stare into their eyes while touching their face', duration: 60, spiceLevel: 2 },

  // SPICY TASKS 🔥
  { id: 21, category: 'spicy', title: 'Lap Sit', description: 'Sit on your partner\'s lap facing them for 30 seconds', duration: 60, spiceLevel: 4 },
  { id: 22, category: 'spicy', title: 'Body Kiss', description: 'Kiss any body part of your choice (except lips)', duration: 45, spiceLevel: 4 },
  { id: 23, category: 'spicy', title: 'Slow Dance', description: 'Slow dance together with bodies pressed close', duration: 60, spiceLevel: 3 },
  { id: 24, category: 'spicy', title: 'Bite Tease', description: 'Gently bite their neck or shoulder', duration: 45, spiceLevel: 4 },
  { id: 25, category: 'spicy', title: 'Remove Item', description: 'Slowly remove one piece of your partner\'s clothing', duration: 60, spiceLevel: 5 },
  { id: 26, category: 'spicy', title: 'Body Lick', description: 'Lick from their neck to their ear slowly', duration: 45, spiceLevel: 5 },
  { id: 27, category: 'spicy', title: 'Grinding', description: 'Grind against your partner for 20 seconds', duration: 60, spiceLevel: 5 },
  { id: 28, category: 'spicy', title: 'Breath Play', description: 'Breathe heavily on their neck while holding them', duration: 45, spiceLevel: 4 },
  { id: 29, category: 'spicy', title: 'Tease Touch', description: 'Touch them everywhere except where they want it most', duration: 60, spiceLevel: 5 },
  { id: 30, category: 'spicy', title: 'Make Out', description: 'Full make-out session for 30 seconds', duration: 60, spiceLevel: 5 },
];

// Get random task
export const getRandomTask = (): Task => {
  const randomIndex = Math.floor(Math.random() * TASKS.length);
  return TASKS[randomIndex];
};

// Get task by step number (specific tasks for specific steps)
export const getTaskByStep = (step: number): Task => {
  // Steps 1-5: Mild tasks
  if (step <= 5) {
    const mildTasks = TASKS.filter(t => t.spiceLevel <= 2);
    return mildTasks[Math.floor(Math.random() * mildTasks.length)];
  }
  // Steps 6-10: Medium tasks
  if (step <= 10) {
    const mediumTasks = TASKS.filter(t => t.spiceLevel === 3);
    return mediumTasks[Math.floor(Math.random() * mediumTasks.length)];
  }
  // Steps 11-15: Hot tasks
  if (step <= 15) {
    const hotTasks = TASKS.filter(t => t.spiceLevel === 4);
    return hotTasks[Math.floor(Math.random() * hotTasks.length)];
  }
  // Steps 16-20: Very spicy tasks
  const spicyTasks = TASKS.filter(t => t.spiceLevel === 5);
  return spicyTasks[Math.floor(Math.random() * spicyTasks.length)];
};

// Get task emoji
export const getTaskEmoji = (category: TaskCategory): string => {
  const emojis = {
    kiss: '💋',
    touch: '👐',
    talk: '💬',
    look: '👀',
    spicy: '🔥'
  };
  return emojis[category];
};

// Get spice level color
export const getSpiceLevelColor = (level: number): string => {
  const colors = {
    1: '#10b981', // green
    2: '#3b82f6', // blue
    3: '#f59e0b', // orange
    4: '#ef4444', // red
    5: '#dc2626'  // dark red
  };
  return colors[level as keyof typeof colors] || '#6b7280';
};
