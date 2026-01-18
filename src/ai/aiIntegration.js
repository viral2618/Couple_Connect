const AIManager = require('./AIManager')

// Create global AI manager instance
const aiManager = new AIManager()

// Enhanced game handlers with AI integration
const aiEnhancedHandlers = {
  
  // Initialize AI when room is created
  initializeAIForRoom(room) {
    aiManager.initializeRoom(room.id, room.players)
    console.log(`AI initialized for room: ${room.id}`)
  },

  // Get AI-enhanced question for current game
  getAIQuestion(roomId, gameType) {
    const question = aiManager.generateEnhancedQuestion(roomId, gameType)
    if (question) {
      console.log(`AI generated ${gameType} question for room: ${roomId}`)
      return question
    }
    return null
  },

  // Get Love Addiction question with AI enhancement
  getLoveAddictionQuestion(roomId, level, unlockedContent) {
    const question = aiManager.generateEnhancedQuestion(roomId, 'love-addiction')
    return question || null
  },

  // Get Seductive Secrets with AI enhancement
  getSeductiveSecret(roomId, intimacyLevel, mood) {
    const secret = aiManager.generateEnhancedQuestion(roomId, 'seductive-secrets')
    return secret || null
  },

  // Process player response with AI analysis
  processPlayerResponse(roomId, playerId, response, responseTime = 3000) {
    if (typeof response === 'string' && response.length > 0) {
      aiManager.analyzeResponse(roomId, playerId, response, responseTime)
      console.log(`AI analyzed response from player ${playerId} in room ${roomId}`)
    }
  },

  // Get AI recommendations for game progression
  getAIRecommendations(roomId) {
    return aiManager.getGameRecommendations(roomId)
  },

  // Enhanced start game with AI suggestions
  enhanceGameStart(room, gameType) {
    const recommendations = aiManager.getGameRecommendations(room.id)
    
    if (recommendations && recommendations.suggestedGameType !== gameType) {
      return {
        proceed: true,
        suggestion: {
          recommended: recommendations.suggestedGameType,
          reason: recommendations.moodBasedTips
        }
      }
    }
    
    return { proceed: true }
  },

  // Clean up AI data when room ends
  cleanupAI(roomId) {
    aiManager.cleanupRoom(roomId)
    console.log(`AI data cleaned up for room: ${roomId}`)
  },

  // Get seductive questions (new game type)
  getSeductiveQuestion(roomId) {
    return aiManager.generateEnhancedQuestion(roomId, 'seductive')
  }
}

// Helper functions for integration
const integrationHelpers = {
  
  // Extract response text from various game types
  extractResponseText(gameType, data) {
    switch (gameType) {
      case 'truths':
        return data.statements ? data.statements.join(' ') : ''
      case 'quickfire':
        return data.answer || ''
      case 'wouldyou':
        return data.choice || ''
      case 'seductive':
        return data.response || ''
      case 'love-addiction':
        return data.response || ''
      case 'seductive-secrets':
        return data.response || ''
      default:
        return ''
    }
  },

  // Calculate response time
  calculateResponseTime(startTime) {
    return Date.now() - startTime
  },

  // Format AI recommendations for client
  formatRecommendations(recommendations) {
    if (!recommendations) return null
    
    return {
      suggestedGame: recommendations.suggestedGameType,
      intimacyLevel: recommendations.intimacyAdjustment,
      tip: recommendations.moodBasedTips
    }
  }
}

module.exports = {
  aiManager,
  aiEnhancedHandlers,
  integrationHelpers
}