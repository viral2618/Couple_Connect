// Enhanced AI Manager for Seductive Questions
// Integrates with existing game structure and provides advanced AI capabilities

import SeductiveQuestionAI from './SeductiveQuestionAI.js';
import { seductiveSecretsContent } from '../games/SeductiveSecrets/seductiveSecretsContent.js';

class EnhancedSeductiveAI {
  constructor() {
    this.baseAI = new SeductiveQuestionAI();
    this.moodAnalyzer = new MoodAnalyzer();
    this.adaptiveEngine = new AdaptiveEngine();
    this.questionDatabase = this.buildEnhancedDatabase();
  }

  // Build enhanced question database combining static and AI-generated content
  buildEnhancedDatabase() {
    const database = {
      static: seductiveSecretsContent,
      aiGenerated: {},
      hybrid: {}
    };

    // Pre-generate AI questions for each level
    for (let level = 1; level <= 8; level++) {
      database.aiGenerated[`level${level}`] = {
        confessions: [],
        fantasies: [],
        desires: []
      };
    }

    return database;
  }

  // Main method to get next question with AI enhancement
  getNextQuestion(context = {}) {
    const {
      currentLevel = 1,
      category = 'random',
      mood = 'neutral',
      previousResponses = [],
      userPreferences = {}
    } = context;

    // Analyze context and mood
    const moodScore = this.moodAnalyzer.analyzeMood(mood, previousResponses);
    const adaptedLevel = this.adaptiveEngine.adjustLevel(currentLevel, moodScore, userPreferences);

    // Decide between static and AI-generated question
    const useAI = this.shouldUseAI(adaptedLevel, category, previousResponses);

    if (useAI) {
      return this.generateAIQuestion(adaptedLevel, category, moodScore);
    } else {
      return this.getStaticQuestion(adaptedLevel, category);
    }
  }

  // Determine when to use AI vs static questions
  shouldUseAI(level, category, previousResponses) {
    // Use AI more frequently at higher levels
    const aiProbability = Math.min(0.3 + (level * 0.1), 0.8);
    
    // Increase AI usage if user has been engaged
    const engagementBonus = previousResponses.length > 5 ? 0.2 : 0;
    
    return Math.random() < (aiProbability + engagementBonus);
  }

  // Generate AI-powered question
  generateAIQuestion(level, category, moodScore) {
    this.baseAI.intimacyLevel = level;
    
    // Adjust AI parameters based on mood
    const contextualModifiers = this.getMoodBasedModifiers(moodScore);
    
    const question = this.baseAI.generateQuestion(category, contextualModifiers);
    
    return {
      id: `ai_${Date.now()}`,
      question,
      category,
      level,
      source: 'ai',
      moodAdjusted: true,
      timestamp: Date.now()
    };
  }

  // Get static question from existing content
  getStaticQuestion(level, category) {
    const levelKey = `level${Math.min(level, 8)}`;
    const levelContent = this.questionDatabase.static[levelKey];
    
    if (!levelContent) return null;

    const categories = category === 'random' ? 
      ['confessions', 'fantasies', 'desires'] : [category + 's'];
    
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const questions = levelContent[selectedCategory];
    
    if (!questions || questions.length === 0) return null;

    const question = questions[Math.floor(Math.random() * questions.length)];
    
    return {
      id: `static_${Date.now()}`,
      question,
      category: selectedCategory.slice(0, -1), // Remove 's'
      level,
      source: 'static',
      timestamp: Date.now()
    };
  }

  // Get mood-based modifiers for AI generation
  getMoodBasedModifiers(moodScore) {
    const modifiers = {};
    
    if (moodScore > 0.7) {
      // High mood - more adventurous
      modifiers.intensity = 'high';
      modifiers.adventurous = true;
    } else if (moodScore < 0.3) {
      // Low mood - more gentle
      modifiers.intensity = 'gentle';
      modifiers.romantic = true;
    } else {
      // Neutral mood - balanced
      modifiers.intensity = 'medium';
      modifiers.balanced = true;
    }
    
    return modifiers;
  }

  // Generate a series of progressive questions
  generateQuestionSeries(startLevel = 1, count = 10) {
    const series = [];
    let currentLevel = startLevel;
    
    for (let i = 0; i < count; i++) {
      const context = {
        currentLevel,
        category: 'random',
        mood: 'neutral',
        previousResponses: series
      };
      
      const question = this.getNextQuestion(context);
      if (question) {
        series.push(question);
        
        // Gradually increase level
        if (i % 3 === 2) {
          currentLevel = Math.min(currentLevel + 1, 8);
        }
      }
    }
    
    return series;
  }

  // Learn from user interactions
  learnFromInteraction(questionId, response, rating, mood) {
    this.baseAI.learnFromResponse(questionId, response, rating);
    this.moodAnalyzer.recordMoodResponse(mood, rating);
    this.adaptiveEngine.updatePreferences(questionId, rating);
  }

  // Get AI insights and recommendations
  getAIInsights() {
    return {
      recommendations: this.baseAI.getPersonalizedRecommendations(),
      moodPatterns: this.moodAnalyzer.getMoodPatterns(),
      adaptiveInsights: this.adaptiveEngine.getInsights(),
      engagement: this.baseAI.calculateEngagement()
    };
  }
}

// Mood Analysis Component
class MoodAnalyzer {
  constructor() {
    this.moodHistory = [];
    this.moodKeywords = {
      excited: ['excited', 'thrilled', 'amazing', 'incredible', 'fantastic'],
      romantic: ['romantic', 'sweet', 'loving', 'tender', 'gentle'],
      passionate: ['passionate', 'intense', 'wild', 'crazy', 'burning'],
      playful: ['playful', 'fun', 'silly', 'teasing', 'naughty'],
      intimate: ['intimate', 'close', 'connected', 'deep', 'personal']
    };
  }

  analyzeMood(mood, responses) {
    // Analyze text responses for mood indicators
    let moodScore = 0.5; // Neutral baseline
    
    if (typeof mood === 'string') {
      moodScore = this.getMoodScore(mood);
    }
    
    // Analyze recent responses
    const recentResponses = responses.slice(-3);
    recentResponses.forEach(response => {
      if (response.text) {
        moodScore += this.analyzeTextMood(response.text) * 0.1;
      }
    });
    
    return Math.max(0, Math.min(1, moodScore));
  }

  getMoodScore(mood) {
    const moodScores = {
      'excited': 0.8,
      'romantic': 0.6,
      'passionate': 0.9,
      'playful': 0.7,
      'intimate': 0.8,
      'neutral': 0.5,
      'shy': 0.3,
      'nervous': 0.2
    };
    
    return moodScores[mood.toLowerCase()] || 0.5;
  }

  analyzeTextMood(text) {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    Object.keys(this.moodKeywords).forEach(mood => {
      this.moodKeywords[mood].forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += this.getMoodScore(mood);
        }
      });
    });
    
    return Math.min(score, 1);
  }

  recordMoodResponse(mood, rating) {
    this.moodHistory.push({
      mood,
      rating,
      timestamp: Date.now()
    });
  }

  getMoodPatterns() {
    const patterns = {};
    this.moodHistory.forEach(entry => {
      if (!patterns[entry.mood]) {
        patterns[entry.mood] = { total: 0, count: 0 };
      }
      patterns[entry.mood].total += entry.rating;
      patterns[entry.mood].count += 1;
    });
    
    Object.keys(patterns).forEach(mood => {
      patterns[mood].average = patterns[mood].total / patterns[mood].count;
    });
    
    return patterns;
  }
}

// Adaptive Learning Engine
class AdaptiveEngine {
  constructor() {
    this.userPreferences = {};
    this.questionPerformance = {};
    this.levelAdjustments = {};
  }

  adjustLevel(currentLevel, moodScore, preferences) {
    let adjustedLevel = currentLevel;
    
    // Adjust based on mood
    if (moodScore > 0.8) {
      adjustedLevel += 1;
    } else if (moodScore < 0.3) {
      adjustedLevel -= 1;
    }
    
    // Apply user preferences
    if (preferences.preferHighIntensity) {
      adjustedLevel += 1;
    }
    
    return Math.max(1, Math.min(8, adjustedLevel));
  }

  updatePreferences(questionId, rating) {
    if (!this.questionPerformance[questionId]) {
      this.questionPerformance[questionId] = [];
    }
    this.questionPerformance[questionId].push(rating);
  }

  getInsights() {
    const insights = {
      bestPerformingQuestions: [],
      recommendedAdjustments: [],
      learningProgress: this.calculateLearningProgress()
    };
    
    // Analyze question performance
    Object.keys(this.questionPerformance).forEach(questionId => {
      const ratings = this.questionPerformance[questionId];
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      
      if (avgRating >= 4) {
        insights.bestPerformingQuestions.push({
          questionId,
          avgRating,
          responseCount: ratings.length
        });
      }
    });
    
    return insights;
  }

  calculateLearningProgress() {
    const totalQuestions = Object.keys(this.questionPerformance).length;
    const highRatedQuestions = Object.values(this.questionPerformance)
      .filter(ratings => ratings.reduce((sum, r) => sum + r, 0) / ratings.length >= 4).length;
    
    return totalQuestions > 0 ? (highRatedQuestions / totalQuestions) * 100 : 0;
  }
}

export default EnhancedSeductiveAI;