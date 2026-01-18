// Server-side handlers for Seductive Secrets Game
import { seductiveSecretsContent, dailyChallenges, streakRewards, levelRequirements } from './seductiveSecretsContent.js';

// Game state management
export class SeductiveSecretsHandler {
  constructor() {
    this.gameStates = new Map(); // coupleId -> gameState
  }

  // Initialize or get game state for a couple
  getGameState(coupleId) {
    if (!this.gameStates.has(coupleId)) {
      this.gameStates.set(coupleId, {
        currentLevel: 1,
        streak: 0,
        lastPlayedDate: null,
        completedChallenges: [],
        unlockedLevels: [1],
        achievements: [],
        totalQuestionsAnswered: 0,
        favoriteCategories: { confessions: 0, fantasies: 0, desires: 0 },
        partnerResponses: [],
        dailyChallengeCompleted: false
      });
    }
    return this.gameStates.get(coupleId);
  }

  // Get random question from current level
  getRandomQuestion(coupleId, category = null) {
    const gameState = this.getGameState(coupleId);
    const level = gameState.currentLevel;
    const levelKey = `level${level}`;
    
    if (!seductiveSecretsContent[levelKey]) {
      throw new Error('Invalid level');
    }

    const levelContent = seductiveSecretsContent[levelKey];
    
    // If no category specified, randomly choose one
    if (!category) {
      const categories = Object.keys(levelContent);
      category = categories[Math.floor(Math.random() * categories.length)];
    }

    if (!levelContent[category]) {
      throw new Error('Invalid category');
    }

    const questions = levelContent[category];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return {
      question: randomQuestion,
      category,
      level,
      levelTitle: levelRequirements[level].title
    };
  }

  // Submit answer and update game state
  submitAnswer(coupleId, playerId, questionId, answer) {
    const gameState = this.getGameState(coupleId);
    const today = new Date().toDateString();

    // Check if this is a new day
    if (gameState.lastPlayedDate !== today) {
      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (gameState.lastPlayedDate === yesterday.toDateString()) {
        gameState.streak += 1;
      } else if (gameState.lastPlayedDate !== null) {
        gameState.streak = 1; // Reset streak if gap in playing
      } else {
        gameState.streak = 1; // First time playing
      }

      gameState.lastPlayedDate = today;
      gameState.dailyChallengeCompleted = false;
    }

    // Record the response
    gameState.partnerResponses.push({
      playerId,
      questionId,
      answer,
      timestamp: new Date(),
      level: gameState.currentLevel
    });

    gameState.totalQuestionsAnswered += 1;

    // Update favorite categories
    const question = this.getQuestionById(questionId);
    if (question && question.category) {
      gameState.favoriteCategories[question.category] += 1;
    }

    // Check for level progression
    this.checkLevelProgression(coupleId);

    // Check for new achievements
    this.checkAchievements(coupleId);

    return {
      success: true,
      newStreak: gameState.streak,
      currentLevel: gameState.currentLevel,
      newAchievements: this.getNewAchievements(coupleId)
    };
  }

  // Get daily challenge
  getDailyChallenge(coupleId) {
    const gameState = this.getGameState(coupleId);
    const levelCategories = ['flirty', 'playful', 'romantic', 'passionate', 'intimate', 'seductive', 'wild', 'forbidden'];
    const categoryIndex = Math.min(gameState.currentLevel - 1, levelCategories.length - 1);
    const category = levelCategories[categoryIndex];
    
    const challenges = dailyChallenges[category];
    const todayIndex = new Date().getDate() % challenges.length;
    
    return {
      challenge: challenges[todayIndex],
      category,
      completed: gameState.dailyChallengeCompleted,
      streak: gameState.streak
    };
  }

  // Complete daily challenge
  completeDailyChallenge(coupleId) {
    const gameState = this.getGameState(coupleId);
    
    if (!gameState.dailyChallengeCompleted) {
      gameState.dailyChallengeCompleted = true;
      gameState.completedChallenges.push({
        date: new Date().toDateString(),
        challenge: this.getDailyChallenge(coupleId).challenge
      });

      // Bonus streak progress for completing daily challenge
      if (Math.random() < 0.3) { // 30% chance of bonus
        gameState.streak += 1;
      }

      return { success: true, bonusAwarded: true };
    }

    return { success: false, message: "Challenge already completed today" };
  }

  // Check if couple can progress to next level
  checkLevelProgression(coupleId) {
    const gameState = this.getGameState(coupleId);
    const nextLevel = gameState.currentLevel + 1;
    
    if (levelRequirements[nextLevel] && 
        gameState.streak >= levelRequirements[nextLevel].minStreak &&
        !gameState.unlockedLevels.includes(nextLevel)) {
      
      gameState.unlockedLevels.push(nextLevel);
      gameState.currentLevel = nextLevel;
      
      return {
        leveledUp: true,
        newLevel: nextLevel,
        levelTitle: levelRequirements[nextLevel].title
      };
    }
    
    return { leveledUp: false };
  }

  // Check for new achievements
  checkAchievements(coupleId) {
    const gameState = this.getGameState(coupleId);
    const newAchievements = [];

    // Check streak achievements
    Object.keys(streakRewards).forEach(streakTarget => {
      const reward = streakRewards[streakTarget];
      if (gameState.streak >= parseInt(streakTarget) && 
          !gameState.achievements.some(a => a.title === reward.title)) {
        
        gameState.achievements.push({
          ...reward,
          unlockedAt: new Date(),
          type: 'streak'
        });
        newAchievements.push(reward);
      }
    });

    // Check question count achievements
    const questionMilestones = [10, 25, 50, 100, 250, 500];
    questionMilestones.forEach(milestone => {
      if (gameState.totalQuestionsAnswered >= milestone &&
          !gameState.achievements.some(a => a.title === `Question Master ${milestone}`)) {
        
        const achievement = {
          title: `Question Master ${milestone}`,
          description: `Answered ${milestone} questions!`,
          badge: "🎯",
          unlockedAt: new Date(),
          type: 'questions'
        };
        
        gameState.achievements.push(achievement);
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  // Get new achievements since last check
  getNewAchievements(coupleId) {
    const gameState = this.getGameState(coupleId);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return gameState.achievements.filter(achievement => 
      new Date(achievement.unlockedAt) > fiveMinutesAgo
    );
  }

  // Get game statistics
  getGameStats(coupleId) {
    const gameState = this.getGameState(coupleId);
    
    return {
      currentLevel: gameState.currentLevel,
      levelTitle: levelRequirements[gameState.currentLevel].title,
      streak: gameState.streak,
      totalQuestionsAnswered: gameState.totalQuestionsAnswered,
      achievements: gameState.achievements,
      unlockedLevels: gameState.unlockedLevels,
      favoriteCategories: gameState.favoriteCategories,
      completedChallenges: gameState.completedChallenges.length,
      nextLevelRequirement: levelRequirements[gameState.currentLevel + 1]?.minStreak || null
    };
  }

  // Get leaderboard data (for couples who opt-in)
  getLeaderboard() {
    const leaderboard = [];
    
    this.gameStates.forEach((gameState, coupleId) => {
      leaderboard.push({
        coupleId: coupleId.substring(0, 8) + '...', // Anonymized
        streak: gameState.streak,
        level: gameState.currentLevel,
        questionsAnswered: gameState.totalQuestionsAnswered,
        achievements: gameState.achievements.length
      });
    });

    return leaderboard
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 10); // Top 10
  }

  // Helper method to get question by ID (you'd implement this based on your ID system)
  getQuestionById(questionId) {
    // This would need to be implemented based on how you generate question IDs
    // For now, returning a mock structure
    return {
      category: 'confessions', // This would be determined from the actual question
      level: 1
    };
  }

  // Reset game state (for testing or user request)
  resetGameState(coupleId) {
    this.gameStates.delete(coupleId);
    return { success: true, message: "Game state reset successfully" };
  }

  // Get progress towards next level
  getProgressToNextLevel(coupleId) {
    const gameState = this.getGameState(coupleId);
    const nextLevel = gameState.currentLevel + 1;
    const nextLevelReq = levelRequirements[nextLevel];
    
    if (!nextLevelReq) {
      return { maxLevel: true, progress: 100 };
    }

    const progress = Math.min((gameState.streak / nextLevelReq.minStreak) * 100, 100);
    
    return {
      currentStreak: gameState.streak,
      requiredStreak: nextLevelReq.minStreak,
      progress: Math.round(progress),
      nextLevelTitle: nextLevelReq.title,
      daysRemaining: Math.max(0, nextLevelReq.minStreak - gameState.streak)
    };
  }
}

// Export singleton instance
export const seductiveSecretsHandler = new SeductiveSecretsHandler();