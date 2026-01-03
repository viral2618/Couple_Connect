export interface CoupleGame {
  id: string;
  name: string;
  category: string;
  objective: string;
  howToPlay: string[];
  timeRequired: string;
  numberOfPlayers: number;
  mood: string;
  intimacyLevel: 'Light' | 'Medium' | 'Deep';
  tags: string[];
}

export const coupleGames: CoupleGame[] = [
  // Icebreaker Games
  {
    id: 'two-truths-one-lie',
    name: 'Two Truths and a Lie',
    category: 'Icebreaker',
    objective: 'Learn surprising facts about each other while having fun guessing. Now with real-time multiplayer!',
    howToPlay: [
      'Each person shares three statements about themselves',
      'Two statements must be true, one must be false',
      'Partner tries to guess which statement is the lie',
      'Play locally on same device or real-time with room codes for long-distance couples'
    ],
    timeRequired: '10-15 minutes',
    numberOfPlayers: 2,
    mood: 'Playful & Curious',
    intimacyLevel: 'Light',
    tags: ['conversation', 'discovery', 'fun', 'real-time', 'multiplayer']
  },
  {
    id: 'question-jar',
    name: 'Question Jar',
    category: 'Icebreaker',
    objective: 'Break the ice with fun, random questions that spark conversation',
    howToPlay: [
      'Take turns drawing questions from a virtual jar',
      'Answer honestly and openly',
      'Ask follow-up questions to dive deeper',
      'No judgment zone - just curiosity and fun'
    ],
    timeRequired: '15-30 minutes',
    numberOfPlayers: 2,
    mood: 'Curious & Lighthearted',
    intimacyLevel: 'Light',
    tags: ['questions', 'conversation', 'discovery']
  },

  // Romantic Games
  {
    id: 'love-language-quiz',
    name: 'Love Language Discovery',
    category: 'Romantic',
    objective: 'Discover and understand each other\'s love languages for deeper connection',
    howToPlay: [
      'Each person answers questions about how they prefer to give/receive love',
      'Discuss your results together',
      'Plan ways to show love in your partner\'s preferred language',
      'Share examples of when you felt most loved'
    ],
    timeRequired: '20-30 minutes',
    numberOfPlayers: 2,
    mood: 'Intimate & Understanding',
    intimacyLevel: 'Medium',
    tags: ['love languages', 'understanding', 'connection']
  },
  {
    id: 'memory-lane',
    name: 'Memory Lane',
    category: 'Romantic',
    objective: 'Relive beautiful moments and strengthen your bond through shared memories',
    howToPlay: [
      'Take turns sharing favorite memories together',
      'Describe what made that moment special',
      'Share how it made you feel about your relationship',
      'Create a timeline of your relationship milestones'
    ],
    timeRequired: '25-40 minutes',
    numberOfPlayers: 2,
    mood: 'Nostalgic & Loving',
    intimacyLevel: 'Medium',
    tags: ['memories', 'nostalgia', 'bonding']
  },
  {
    id: 'future-dreams',
    name: 'Future Dreams',
    category: 'Romantic',
    objective: 'Share hopes and dreams for your future together',
    howToPlay: [
      'Each person shares 3 dreams for your future together',
      'Discuss what steps you can take to achieve them',
      'Create a vision board of your shared goals',
      'Plan one small step you can take this week'
    ],
    timeRequired: '30-45 minutes',
    numberOfPlayers: 2,
    mood: 'Hopeful & Inspiring',
    intimacyLevel: 'Deep',
    tags: ['future', 'goals', 'planning', 'dreams']
  },

  // Fun & Silly Games
  {
    id: 'silly-voices',
    name: 'Silly Voices Challenge',
    category: 'Fun & Silly',
    objective: 'Laugh together while trying different accents and voices',
    howToPlay: [
      'Take turns reading romantic quotes in silly voices',
      'Try different accents, cartoon voices, or celebrity impressions',
      'Rate each other\'s performances',
      'End with saying "I love you" in your favorite silly voice'
    ],
    timeRequired: '10-20 minutes',
    numberOfPlayers: 2,
    mood: 'Playful & Giggly',
    intimacyLevel: 'Light',
    tags: ['laughter', 'silly', 'voices', 'fun']
  },
  {
    id: 'dance-freeze',
    name: 'Dance Freeze',
    category: 'Fun & Silly',
    objective: 'Get moving and laughing with spontaneous dance moves',
    howToPlay: [
      'Play your favorite songs and dance together',
      'When the music stops, freeze in your position',
      'Hold the pose for 10 seconds without laughing',
      'Take silly photos of your frozen poses'
    ],
    timeRequired: '15-25 minutes',
    numberOfPlayers: 2,
    mood: 'Energetic & Joyful',
    intimacyLevel: 'Light',
    tags: ['dancing', 'music', 'movement', 'photos']
  },
  {
    id: 'compliment-battle',
    name: 'Compliment Battle',
    category: 'Fun & Silly',
    objective: 'Shower each other with compliments in a playful competition',
    howToPlay: [
      'Take turns giving each other genuine compliments',
      'Try to be more creative and specific than your partner',
      'No repeating compliments',
      'Continue until you both run out of ideas and feel amazing'
    ],
    timeRequired: '10-15 minutes',
    numberOfPlayers: 2,
    mood: 'Uplifting & Sweet',
    intimacyLevel: 'Medium',
    tags: ['compliments', 'positivity', 'appreciation']
  },

  // Deep Connection Games
  {
    id: 'soul-questions',
    name: 'Soul Questions',
    category: 'Deep Connection',
    objective: 'Explore deep thoughts and feelings to strengthen emotional intimacy',
    howToPlay: [
      'Choose from a list of meaningful, thought-provoking questions',
      'Take time to really think about your answers',
      'Listen without judgment and ask follow-up questions',
      'Share what you learned about each other'
    ],
    timeRequired: '30-60 minutes',
    numberOfPlayers: 2,
    mood: 'Reflective & Intimate',
    intimacyLevel: 'Deep',
    tags: ['deep questions', 'emotions', 'vulnerability', 'understanding']
  },
  {
    id: 'gratitude-circle',
    name: 'Gratitude Circle',
    category: 'Deep Connection',
    objective: 'Express appreciation and gratitude for each other and your relationship',
    howToPlay: [
      'Sit facing each other in a comfortable space',
      'Take turns sharing 3 things you\'re grateful for about your partner',
      'Share 3 things you\'re grateful for in your relationship',
      'End with a moment of silent appreciation'
    ],
    timeRequired: '15-25 minutes',
    numberOfPlayers: 2,
    mood: 'Grateful & Loving',
    intimacyLevel: 'Medium',
    tags: ['gratitude', 'appreciation', 'mindfulness']
  },
  {
    id: 'values-alignment',
    name: 'Values Alignment',
    category: 'Deep Connection',
    objective: 'Discover and discuss your core values and how they align',
    howToPlay: [
      'Each person lists their top 5 core values',
      'Discuss what each value means to you',
      'Find where your values align and where they differ',
      'Talk about how to honor both sets of values in your relationship'
    ],
    timeRequired: '45-60 minutes',
    numberOfPlayers: 2,
    mood: 'Thoughtful & Meaningful',
    intimacyLevel: 'Deep',
    tags: ['values', 'alignment', 'compatibility', 'understanding']
  },

  // Challenge Games
  {
    id: 'trust-fall',
    name: 'Trust Building Exercises',
    category: 'Challenges',
    objective: 'Build trust through physical and emotional exercises',
    howToPlay: [
      'Start with simple trust exercises like guided walking',
      'Progress to trust falls (safely)',
      'Share something you trust your partner with completely',
      'Discuss how trust shows up in your daily relationship'
    ],
    timeRequired: '20-30 minutes',
    numberOfPlayers: 2,
    mood: 'Trusting & Supportive',
    intimacyLevel: 'Medium',
    tags: ['trust', 'support', 'vulnerability', 'safety']
  },
  {
    id: 'communication-challenge',
    name: 'Communication Challenge',
    category: 'Challenges',
    objective: 'Improve communication skills through fun exercises',
    howToPlay: [
      'One person describes a simple drawing without saying what it is',
      'Partner tries to recreate the drawing based on description only',
      'Compare results and discuss communication styles',
      'Switch roles and try again with a different drawing'
    ],
    timeRequired: '20-30 minutes',
    numberOfPlayers: 2,
    mood: 'Focused & Collaborative',
    intimacyLevel: 'Light',
    tags: ['communication', 'teamwork', 'understanding', 'patience']
  },
  {
    id: 'relationship-goals',
    name: 'Relationship Goals Challenge',
    category: 'Challenges',
    objective: 'Set and commit to meaningful relationship goals together',
    howToPlay: [
      'Each person writes down 3 relationship goals',
      'Share and discuss each goal',
      'Choose 2 goals to work on together this month',
      'Create specific action steps and check-in dates'
    ],
    timeRequired: '30-45 minutes',
    numberOfPlayers: 2,
    mood: 'Motivated & Committed',
    intimacyLevel: 'Medium',
    tags: ['goals', 'commitment', 'growth', 'planning']
  },

  // Long-Distance Games
  {
    id: 'virtual-date-night',
    name: 'Virtual Date Night',
    category: 'Long-Distance',
    objective: 'Create a romantic date experience despite physical distance',
    howToPlay: [
      'Both partners prepare the same meal or snack',
      'Set up a romantic atmosphere with candles/music',
      'Video call and eat together',
      'Share what you love about your partner during the meal'
    ],
    timeRequired: '60-90 minutes',
    numberOfPlayers: 2,
    mood: 'Romantic & Connected',
    intimacyLevel: 'Medium',
    tags: ['virtual date', 'romance', 'connection', 'creativity']
  },
  {
    id: 'synchronized-activities',
    name: 'Synchronized Activities',
    category: 'Long-Distance',
    objective: 'Feel connected by doing the same activity at the same time',
    howToPlay: [
      'Choose an activity to do together (reading, exercising, cooking)',
      'Set a specific time to start',
      'Check in with each other during the activity',
      'Share your experience afterward'
    ],
    timeRequired: '30-60 minutes',
    numberOfPlayers: 2,
    mood: 'Connected & Synchronized',
    intimacyLevel: 'Light',
    tags: ['synchronization', 'shared experience', 'connection']
  },
  {
    id: 'photo-story',
    name: 'Photo Story Challenge',
    category: 'Long-Distance',
    objective: 'Create a story together using photos from your separate locations',
    howToPlay: [
      'Each person takes 3 photos that tell part of a story',
      'Send photos to each other without explanation',
      'Try to guess the story your partner is telling',
      'Reveal the real story and create a combined narrative'
    ],
    timeRequired: '20-30 minutes',
    numberOfPlayers: 2,
    mood: 'Creative & Playful',
    intimacyLevel: 'Light',
    tags: ['creativity', 'photos', 'storytelling', 'imagination']
  },

  // Party Games (for when with friends)
  {
    id: 'couple-trivia',
    name: 'Couple Trivia',
    category: 'Party Games',
    objective: 'Show how well you know each other in front of friends',
    howToPlay: [
      'Friends ask questions about your relationship and preferences',
      'Write down answers separately, then reveal together',
      'Get points for matching answers',
      'Celebrate your connection and learn new things'
    ],
    timeRequired: '20-30 minutes',
    numberOfPlayers: 2,
    mood: 'Fun & Competitive',
    intimacyLevel: 'Light',
    tags: ['trivia', 'knowledge', 'fun', 'social']
  },
  {
    id: 'relationship-charades',
    name: 'Relationship Charades',
    category: 'Party Games',
    objective: 'Act out relationship moments and inside jokes for others to guess',
    howToPlay: [
      'Write down memorable moments from your relationship',
      'Take turns acting them out without words',
      'Others guess what moment you\'re portraying',
      'Share the real story behind each moment'
    ],
    timeRequired: '25-35 minutes',
    numberOfPlayers: 2,
    mood: 'Entertaining & Nostalgic',
    intimacyLevel: 'Light',
    tags: ['acting', 'memories', 'entertainment', 'sharing']
  },

  // Dark Romance Games
  {
    id: 'forbidden-desires',
    name: 'Forbidden Desires',
    category: 'Dark Romance',
    objective: 'Explore secret fantasies and hidden desires in a safe space',
    howToPlay: [
      'Write down 3 secret desires on separate papers',
      'Exchange papers without revealing which is yours',
      'Guess which desire belongs to your partner',
      'Discuss what excites you about each fantasy'
    ],
    timeRequired: '30-45 minutes',
    numberOfPlayers: 2,
    mood: 'Mysterious & Seductive',
    intimacyLevel: 'Deep',
    tags: ['fantasies', 'desires', 'mystery', 'seduction']
  },
  {
    id: 'power-play',
    name: 'Power Play',
    category: 'Dark Romance',
    objective: 'Explore dominance and submission dynamics through roleplay scenarios',
    howToPlay: [
      'Take turns being the dominant and submissive partner',
      'Create scenarios where one leads and the other follows',
      'Use safe words and establish clear boundaries',
      'Switch roles and explore different power dynamics'
    ],
    timeRequired: '45-60 minutes',
    numberOfPlayers: 2,
    mood: 'Intense & Passionate',
    intimacyLevel: 'Deep',
    tags: ['dominance', 'submission', 'roleplay', 'power']
  },
  {
    id: 'seductive-storytelling',
    name: 'Seductive Storytelling',
    category: 'Dark Romance',
    objective: 'Create erotic stories together that build anticipation and desire',
    howToPlay: [
      'Start with a romantic scenario involving fictional characters',
      'Take turns adding sentences to build the story',
      'Make the story progressively more intimate and seductive',
      'End with planning to recreate elements from your story'
    ],
    timeRequired: '20-40 minutes',
    numberOfPlayers: 2,
    mood: 'Creative & Arousing',
    intimacyLevel: 'Deep',
    tags: ['storytelling', 'creativity', 'anticipation', 'fantasy']
  },
  {
    id: 'blindfold-sensations',
    name: 'Blindfold Sensations',
    category: 'Dark Romance',
    objective: 'Heighten senses and build trust through sensory exploration',
    howToPlay: [
      'One partner wears a blindfold',
      'The other uses different textures, temperatures, and touches',
      'Focus on building anticipation and surprise',
      'Switch roles and explore what drives each other wild'
    ],
    timeRequired: '30-45 minutes',
    numberOfPlayers: 2,
    mood: 'Sensual & Mysterious',
    intimacyLevel: 'Deep',
    tags: ['sensory', 'blindfold', 'trust', 'anticipation']
  },
  {
    id: 'confession-game',
    name: 'Dark Confessions',
    category: 'Dark Romance',
    objective: 'Share intimate secrets and naughty thoughts in a judgment-free zone',
    howToPlay: [
      'Take turns confessing something you\'ve never told anyone',
      'Share your most scandalous thoughts about your partner',
      'Reveal what secretly turns you on the most',
      'Promise to keep each other\'s secrets safe'
    ],
    timeRequired: '25-35 minutes',
    numberOfPlayers: 2,
    mood: 'Intimate & Vulnerable',
    intimacyLevel: 'Deep',
    tags: ['confessions', 'secrets', 'vulnerability', 'trust']
  },
  {
    id: 'seduction-challenge',
    name: 'Seduction Challenge',
    category: 'Dark Romance',
    objective: 'Compete to see who can be more seductive and alluring',
    howToPlay: [
      'Take turns trying to seduce each other with words only',
      'Use your voice, compliments, and promises',
      'No touching allowed - only verbal seduction',
      'Rate each other\'s performance and declare a winner'
    ],
    timeRequired: '15-25 minutes',
    numberOfPlayers: 2,
    mood: 'Playful & Seductive',
    intimacyLevel: 'Deep',
    tags: ['seduction', 'competition', 'verbal', 'allure']
  },
  {
    id: 'midnight-desires',
    name: 'Midnight Desires',
    category: 'Dark Romance',
    objective: 'Explore what you crave most in the darkness of night',
    howToPlay: [
      'Dim the lights and create a mysterious atmosphere',
      'Share what you desire most when the sun goes down',
      'Describe your perfect midnight encounter',
      'Plan a real midnight adventure together'
    ],
    timeRequired: '20-30 minutes',
    numberOfPlayers: 2,
    mood: 'Dark & Mysterious',
    intimacyLevel: 'Deep',
    tags: ['midnight', 'darkness', 'mystery', 'adventure']
  },
  {
    id: 'temptation-game',
    name: 'Temptation Game',
    category: 'Dark Romance',
    objective: 'Test your willpower while building incredible sexual tension',
    howToPlay: [
      'Set a timer for 10 minutes',
      'Try to tempt and tease each other without touching',
      'Use only words, looks, and body language',
      'The goal is to make your partner lose control first'
    ],
    timeRequired: '15-20 minutes',
    numberOfPlayers: 2,
    mood: 'Teasing & Intense',
    intimacyLevel: 'Deep',
    tags: ['temptation', 'teasing', 'tension', 'control']
  },
  {
    id: 'erotic-truth-dare',
    name: 'Erotic Truth or Dare',
    category: 'Dark Romance',
    objective: 'Push boundaries with intimate truths and seductive dares',
    howToPlay: [
      'Take turns choosing truth or dare',
      'Truths focus on intimate desires and experiences',
      'Dares involve seductive actions and teasing',
      'Establish boundaries beforehand and respect them'
    ],
    timeRequired: '30-60 minutes',
    numberOfPlayers: 2,
    mood: 'Adventurous & Bold',
    intimacyLevel: 'Deep',
    tags: ['truth or dare', 'boundaries', 'adventure', 'intimacy']
  },
  {
    id: 'passion-points',
    name: 'Passion Points',
    category: 'Dark Romance',
    objective: 'Discover and map each other\'s most sensitive and passionate spots',
    howToPlay: [
      'Take turns describing where you like to be touched',
      'Share what kind of touch drives you wild',
      'Create a "passion map" of each other\'s preferences',
      'Promise to use this knowledge to drive each other crazy'
    ],
    timeRequired: '25-40 minutes',
    numberOfPlayers: 2,
    mood: 'Sensual & Educational',
    intimacyLevel: 'Deep',
    tags: ['passion', 'touch', 'preferences', 'mapping']
  },

  // Test Games
  {
    id: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    category: 'Test Games',
    objective: 'Classic game of rock, paper, scissors for quick fun',
    howToPlay: [
      'Each player chooses rock, paper, or scissors',
      'Rock beats scissors, scissors beats paper, paper beats rock',
      'Play multiple rounds and keep score',
      'First to 5 wins!'
    ],
    timeRequired: '5-10 minutes',
    numberOfPlayers: 2,
    mood: 'Competitive & Fun',
    intimacyLevel: 'Light',
    tags: ['classic', 'quick', 'competitive']
  },
  {
    id: 'number-guessing',
    name: 'Number Guessing Game',
    category: 'Test Games',
    objective: 'Guess the secret number between 1 and 100',
    howToPlay: [
      'One player thinks of a number between 1 and 100',
      'The other player tries to guess it',
      'Get hints like "higher" or "lower" after each guess',
      'Try to guess in as few attempts as possible'
    ],
    timeRequired: '5-15 minutes',
    numberOfPlayers: 2,
    mood: 'Challenging & Engaging',
    intimacyLevel: 'Light',
    tags: ['logic', 'guessing', 'challenge']
  }
];

export const gameCategories = [
  'All',
  'Icebreaker',
  'Romantic',
  'Fun & Silly',
  'Deep Connection',
  'Challenges',
  'Long-Distance',
  'Party Games',
  'Dark Romance',
  'Test Games'
];

export const intimacyLevels = ['Light', 'Medium', 'Deep'];