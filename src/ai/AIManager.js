const SeductiveQuestionAI = require('./SeductiveQuestionAI')

class AIManager {
  constructor() {
    this.questionAI = new SeductiveQuestionAI()
    this.playerProfiles = new Map()
    this.roomAnalytics = new Map()
  }

  // Initialize AI for a room
  initializeRoom(roomId, players) {
    this.roomAnalytics.set(roomId, {
      intimacyLevel: 1,
      mood: 'neutral',
      responsePatterns: {},
      gameHistory: [],
      startTime: Date.now()
    })

    players.forEach(player => {
      if (!this.playerProfiles.has(player.id)) {
        this.playerProfiles.set(player.id, {
          preferences: {},
          intimacyComfort: 1,
          responseStyle: 'balanced',
          learningData: []
        })
      }
    })
  }

  // Generate AI-enhanced questions for any game type
  generateEnhancedQuestion(roomId, gameType) {
    const analytics = this.roomAnalytics.get(roomId)
    if (!analytics) return null

    switch (gameType) {
      case 'truths':
        return this.generateTruthsQuestion(analytics)
      case 'wouldyou':
        return this.generateWouldYouQuestion(analytics)
      case 'quickfire':
        return this.generateQuickFireQuestion(analytics)
      case 'seductive':
        return this.questionAI.generateQuestion(analytics.intimacyLevel, analytics.mood)
      default:
        return null
    }
  }

  // Analyze player responses and update profiles
  analyzeResponse(roomId, playerId, response, responseTime) {
    const analytics = this.roomAnalytics.get(roomId)
    const profile = this.playerProfiles.get(playerId)
    
    if (!analytics || !profile) return

    // Analyze response patterns
    const analysis = {
      length: response.length,
      sentiment: this.analyzeSentiment(response),
      responseTime,
      timestamp: Date.now()
    }

    profile.learningData.push(analysis)
    analytics.responsePatterns[playerId] = analysis

    // Update mood and intimacy based on responses
    this.updateRoomMood(roomId, analysis)
    this.updateIntimacyLevel(roomId, analysis)
  }

  // Generate enhanced truths questions
  generateTruthsQuestion(analytics) {
    const baseQuestions = [
      {
        statements: [
          "I've had a secret crush on someone for over a year",
          "I once wrote a love letter but never sent it",
          "I've never been on a blind date"
        ],
        lie: 1
      },
      {
        statements: [
          "I can remember my first kiss perfectly",
          "I've practiced kissing in the mirror",
          "I've never had butterflies from a text message"
        ],
        lie: 2
      }
    ]

    const question = baseQuestions[Math.floor(Math.random() * baseQuestions.length)]
    
    // Enhance based on intimacy level
    if (analytics.intimacyLevel > 2) {
      question.statements = this.enhanceStatementsForIntimacy(question.statements)
    }

    return question
  }

  // Generate enhanced would you rather questions
  generateWouldYouQuestion(analytics) {
    const questions = [
      {
        text: "In a relationship, would you rather...",
        options: [
          "Always know what your partner is thinking",
          "Have your partner always know what you're thinking"
        ]
      },
      {
        text: "For a romantic evening, would you rather...",
        options: [
          "Cook dinner together at home",
          "Have a surprise picnic under the stars"
        ]
      }
    ]

    if (analytics.intimacyLevel > 3) {
      questions.push({
        text: "In an intimate moment, would you rather...",
        options: [
          "Express feelings through words",
          "Express feelings through touch"
        ]
      })
    }

    return questions[Math.floor(Math.random() * questions.length)]
  }

  // Generate enhanced quick fire questions
  generateQuickFireQuestion(analytics) {
    const baseQuestions = [
      "What's your love language?",
      "Describe your perfect date in three words",
      "What's the most romantic gesture you've experienced?"
    ]

    const intimateQuestions = [
      "What's your biggest turn-on?",
      "Describe your ideal romantic fantasy",
      "What's something that instantly makes you feel desired?"
    ]

    const questions = analytics.intimacyLevel > 2 
      ? [...baseQuestions, ...intimateQuestions]
      : baseQuestions

    return questions[Math.floor(Math.random() * questions.length)]
  }

  // Analyze sentiment of responses
  analyzeSentiment(text) {
    const positiveWords = ['love', 'amazing', 'wonderful', 'excited', 'happy', 'perfect']
    const negativeWords = ['hate', 'terrible', 'awful', 'sad', 'angry', 'disappointed']
    
    const words = text.toLowerCase().split(' ')
    let score = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1
      if (negativeWords.includes(word)) score -= 1
    })
    
    if (score > 0) return 'positive'
    if (score < 0) return 'negative'
    return 'neutral'
  }

  // Update room mood based on responses
  updateRoomMood(roomId, analysis) {
    const analytics = this.roomAnalytics.get(roomId)
    if (!analytics) return

    const sentiments = Object.values(analytics.responsePatterns).map(p => p.sentiment)
    const positiveCount = sentiments.filter(s => s === 'positive').length
    const totalCount = sentiments.length

    if (totalCount > 0) {
      const positiveRatio = positiveCount / totalCount
      if (positiveRatio > 0.7) analytics.mood = 'playful'
      else if (positiveRatio > 0.4) analytics.mood = 'romantic'
      else analytics.mood = 'cautious'
    }
  }

  // Update intimacy level based on engagement
  updateIntimacyLevel(roomId, analysis) {
    const analytics = this.roomAnalytics.get(roomId)
    if (!analytics) return

    // Increase intimacy based on engagement metrics
    const avgResponseTime = Object.values(analytics.responsePatterns)
      .reduce((sum, p) => sum + p.responseTime, 0) / Object.keys(analytics.responsePatterns).length

    const avgResponseLength = Object.values(analytics.responsePatterns)
      .reduce((sum, p) => sum + p.length, 0) / Object.keys(analytics.responsePatterns).length

    // Quick responses and longer answers indicate higher engagement
    if (avgResponseTime < 5000 && avgResponseLength > 20) {
      analytics.intimacyLevel = Math.min(5, analytics.intimacyLevel + 0.1)
    }
  }

  // Enhance statements based on intimacy level
  enhanceStatementsForIntimacy(statements) {
    return statements.map(statement => {
      // Add more personal/intimate variations
      if (statement.includes('crush')) {
        return statement.replace('crush', 'intense romantic feelings')
      }
      if (statement.includes('kiss')) {
        return statement.replace('kiss', 'passionate moment')
      }
      return statement
    })
  }

  // Get AI recommendations for game flow
  getGameRecommendations(roomId) {
    const analytics = this.roomAnalytics.get(roomId)
    if (!analytics) return null

    const recommendations = {
      suggestedGameType: this.getSuggestedGameType(analytics),
      intimacyAdjustment: analytics.intimacyLevel,
      moodBasedTips: this.getMoodBasedTips(analytics.mood)
    }

    return recommendations
  }

  // Suggest next game type based on current state
  getSuggestedGameType(analytics) {
    if (analytics.mood === 'playful' && analytics.intimacyLevel > 2) {
      return 'seductive'
    } else if (analytics.mood === 'romantic') {
      return 'quickfire'
    } else if (analytics.intimacyLevel < 2) {
      return 'wouldyou'
    }
    return 'truths'
  }

  // Get tips based on current mood
  getMoodBasedTips(mood) {
    const tips = {
      playful: "The energy is high! Perfect time for more adventurous questions.",
      romantic: "There's a sweet connection building. Focus on emotional intimacy.",
      cautious: "Take it slow and build comfort with lighter questions first.",
      neutral: "Feel free to explore different types of questions to find your rhythm."
    }
    return tips[mood] || tips.neutral
  }

  // Clean up room data
  cleanupRoom(roomId) {
    this.roomAnalytics.delete(roomId)
  }
}

module.exports = AIManager