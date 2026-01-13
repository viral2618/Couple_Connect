// Love Addiction - The Most Addictive Couples Game
// Features: Progressive difficulty, rewards system, daily challenges, streaks, achievements

class LoveAddictionGame {
  constructor() {
    this.name = 'Love Addiction'
    this.description = 'The most addictive couples game that deepens your connection'
    this.version = '1.0.0'
    this.maxPlayers = 2
    this.minPlayers = 2
    
    // Game progression system
    this.levels = {
      1: { name: 'New Lovers', pointsRequired: 0, unlocks: ['basic-questions', 'sweet-dares'] },
      2: { name: 'Growing Close', pointsRequired: 100, unlocks: ['intimate-questions', 'romantic-dares'] },
      3: { name: 'Deep Connection', pointsRequired: 300, unlocks: ['fantasy-sharing', 'desire-decoder'] },
      4: { name: 'Soul Mates', pointsRequired: 600, unlocks: ['secret-confessions', 'passion-challenges'] },
      5: { name: 'Eternal Bond', pointsRequired: 1000, unlocks: ['ultimate-intimacy', 'love-mastery'] }
    }
    
    // Addiction mechanics
    this.streakBonuses = {
      3: { multiplier: 1.2, reward: 'First Spark ✨' },
      7: { multiplier: 1.5, reward: 'Week of Love 💕' },
      14: { multiplier: 2.0, reward: 'Two Week Flame 🔥' },
      30: { multiplier: 3.0, reward: 'Monthly Devotion 💖' },
      100: { multiplier: 5.0, reward: 'Century of Love 👑' }
    }
    
    // Daily challenges for addiction
    this.dailyChallenges = [
      { id: 'morning-love', name: 'Morning Affection', points: 50, description: 'Share what you love about your partner' },
      { id: 'midday-surprise', name: 'Midday Surprise', points: 75, description: 'Send an unexpected loving message' },
      { id: 'evening-intimacy', name: 'Evening Connection', points: 100, description: 'Share your deepest thought of the day' },
      { id: 'night-passion', name: 'Night Desires', points: 125, description: 'Express your romantic wishes' }
    ]
    
    this.achievements = [
      { id: 'first-game', name: 'First Connection', description: 'Play your first game together', points: 25 },
      { id: 'week-streak', name: 'Weekly Lovers', description: 'Play for 7 days straight', points: 100 },
      { id: 'perfect-match', name: 'Perfect Match', description: 'Answer identically 5 times', points: 150 },
      { id: 'deep-dive', name: 'Deep Diver', description: 'Unlock level 3', points: 200 },
      { id: 'soul-connection', name: 'Soul Connection', description: 'Reach 1000 total points', points: 500 }
    ]
  }
  
  // Initialize game state
  initializeGame(players) {
    return {
      players: players.map(p => ({
        ...p,
        level: 1,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        dailyProgress: {},
        lastPlayed: null
      })),
      currentLevel: 1,
      gameMode: 'progressive', // progressive, daily-challenge, quick-play
      currentRound: 1,
      maxRounds: 5,
      roundData: {},
      gameState: 'menu',
      unlockedContent: ['basic-questions', 'sweet-dares'],
      totalGamesPlayed: 0,
      relationshipScore: 0
    }
  }
  
  // Get questions based on level and unlocked content
  getQuestions(level, unlockedContent) {
    const allQuestions = {
      'basic-questions': [
        "What's your favorite memory of us together?",
        "What made you fall in love with me?",
        "What's your dream date with me?",
        "What's one thing you love about my personality?",
        "How do you feel when we're apart?"
      ],
      'intimate-questions': [
        "What's your deepest fantasy about us?",
        "When do you feel most connected to me?",
        "What's something intimate you've never told me?",
        "How do you want me to show you love?",
        "What's your favorite way I touch you?"
      ],
      'fantasy-sharing': [
        "Describe your wildest romantic dream about us...",
        "What's a secret desire you have about our relationship?",
        "If we could do anything together, what would it be?",
        "What's your most passionate fantasy involving me?",
        "How do you imagine our perfect intimate evening?"
      ],
      'secret-confessions': [
        "What's something you've been wanting to confess to me?",
        "What's your biggest turn-on about me that I don't know?",
        "What's a secret you've kept about how you feel about me?",
        "What's something naughty you think about when we're apart?",
        "What's your most private thought about our future together?"
      ],
      'ultimate-intimacy': [
        "What would you whisper in my ear right now if we were alone?",
        "Describe exactly how you want me to make love to you...",
        "What's your ultimate fantasy that we haven't explored?",
        "How do you want me to seduce you tonight?",
        "What's the most passionate thing you want to do with me?"
      ]
    }
    
    let availableQuestions = []
    unlockedContent.forEach(category => {
      if (allQuestions[category]) {
        availableQuestions = [...availableQuestions, ...allQuestions[category]]
      }
    })
    
    return availableQuestions
  }
  
  // Get dares based on level
  getDares(level, unlockedContent) {
    const allDares = {
      'sweet-dares': [
        "Send me a voice message saying 'I love you' in the sweetest way",
        "Tell me three things you adore about me",
        "Send me a cute selfie with a love message",
        "Describe how you want to cuddle with me right now",
        "Share your favorite photo of us and why you love it"
      ],
      'romantic-dares': [
        "Send me a flirty message that would make me blush",
        "Describe what you're wearing and how you want me to react",
        "Tell me exactly where you want me to kiss you",
        "Send me a photo that shows how much you miss me",
        "Whisper something romantic you want to do tonight"
      ],
      'desire-decoder': [
        "Describe your perfect romantic evening in detail",
        "Tell me your biggest turn-on about me",
        "Share a fantasy you've had about us this week",
        "Describe how you want me to surprise you",
        "Tell me something that instantly makes you think of me"
      ],
      'passion-challenges': [
        "Send me a message that would make me want to rush home to you",
        "Describe exactly how you want me to touch you",
        "Tell me your naughtiest thought about me today",
        "Share what you want to do to me when we're alone",
        "Describe your ideal way for us to be intimate"
      ],
      'love-mastery': [
        "Create a personalized love poem for me right now",
        "Plan our perfect romantic getaway in detail",
        "Tell me your deepest emotional and physical desires",
        "Share your vision of our future intimate life together",
        "Express your love in the most creative way possible"
      ]
    }
    
    let availableDares = []
    unlockedContent.forEach(category => {
      if (allDares[category]) {
        availableDares = [...availableDares, ...allDares[category]]
      }
    })
    
    return availableDares
  }
  
  // Calculate points with bonuses
  calculatePoints(basePoints, streak, achievements) {
    let multiplier = 1
    
    // Streak bonus
    Object.keys(this.streakBonuses).forEach(streakDays => {
      if (streak >= parseInt(streakDays)) {
        multiplier = Math.max(multiplier, this.streakBonuses[streakDays].multiplier)
      }
    })
    
    // Achievement bonus
    const achievementBonus = achievements.length * 0.1
    multiplier += achievementBonus
    
    return Math.floor(basePoints * multiplier)
  }
  
  // Check for new achievements
  checkAchievements(playerData, gameData) {
    const newAchievements = []
    
    this.achievements.forEach(achievement => {
      if (!playerData.achievements.includes(achievement.id)) {
        let earned = false
        
        switch (achievement.id) {
          case 'first-game':
            earned = gameData.totalGamesPlayed >= 1
            break
          case 'week-streak':
            earned = playerData.currentStreak >= 7
            break
          case 'perfect-match':
            // This would be checked during gameplay
            break
          case 'deep-dive':
            earned = playerData.level >= 3
            break
          case 'soul-connection':
            earned = playerData.totalPoints >= 1000
            break
        }
        
        if (earned) {
          newAchievements.push(achievement)
          playerData.achievements.push(achievement.id)
          playerData.totalPoints += achievement.points
        }
      }
    })
    
    return newAchievements
  }
  
  // Generate daily challenge
  getDailyChallenge() {
    const today = new Date().toDateString()
    const challengeIndex = new Date().getDate() % this.dailyChallenges.length
    return {
      ...this.dailyChallenges[challengeIndex],
      date: today,
      completed: false
    }
  }
  
  // Check if player should level up
  checkLevelUp(playerData) {
    const currentLevel = playerData.level
    const nextLevel = currentLevel + 1
    
    if (this.levels[nextLevel] && playerData.totalPoints >= this.levels[nextLevel].pointsRequired) {
      playerData.level = nextLevel
      return {
        leveledUp: true,
        newLevel: nextLevel,
        unlockedContent: this.levels[nextLevel].unlocks
      }
    }
    
    return { leveledUp: false }
  }
  
  // Calculate relationship compatibility score
  calculateRelationshipScore(allAnswers) {
    if (!allAnswers || allAnswers.length === 0) {
      return 75 // Default score
    }
    
    // Simple compatibility algorithm based on answer similarity and engagement
    let totalScore = 0
    let answeredRounds = 0
    
    allAnswers.forEach(roundAnswers => {
      if (Object.keys(roundAnswers).length === 2) {
        answeredRounds++
        const answers = Object.values(roundAnswers)
        
        // Score based on answer length (engagement)
        const avgLength = answers.reduce((sum, ans) => sum + ans.answer.length, 0) / answers.length
        const engagementScore = Math.min(100, avgLength * 2) // Max 100 for engagement
        
        // Score based on response time (quicker responses show enthusiasm)
        const avgTime = answers.reduce((sum, ans) => sum + (ans.timeSpent || 60000), 0) / answers.length
        const speedScore = Math.max(0, 100 - (avgTime / 1000)) // Better score for faster responses
        
        const roundScore = (engagementScore + speedScore) / 2
        totalScore += roundScore
      }
    })
    
    return answeredRounds > 0 ? Math.floor(totalScore / answeredRounds) : 75
  }
}

module.exports = LoveAddictionGame