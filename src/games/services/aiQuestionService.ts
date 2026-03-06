import { AIQuestionRequest, AIQuestionResponse, GameType, QuestionCategory } from '../types/gameTypes';

const SEDUCTIVE_PROMPTS = {
  'truth-or-dare': {
    romantic: 'Generate a romantic truth or dare question for couples that builds intimacy',
    spicy: 'Generate a spicy, flirtatious truth or dare that creates sexual tension',
    seductive: 'Generate a highly seductive truth or dare that encourages physical closeness and desire',
    playful: 'Generate a playful, teasing truth or dare for couples',
    deep: 'Generate a deep, emotionally intimate truth question'
  },
  'intimate-confessions': {
    romantic: 'Generate a romantic confession prompt about desires and feelings',
    spicy: 'Generate a spicy confession about secret fantasies or attractions',
    seductive: 'Generate a highly seductive confession about physical desires and turn-ons',
    playful: 'Generate a playful confession about crushes or attractions',
    deep: 'Generate a deep confession about emotional and physical needs'
  },
  'would-you-rather': {
    romantic: 'Generate a romantic would-you-rather about date scenarios',
    spicy: 'Generate a spicy would-you-rather about intimate scenarios',
    seductive: 'Generate a seductive would-you-rather about physical preferences and desires',
    playful: 'Generate a playful would-you-rather about relationship scenarios',
    deep: 'Generate a deep would-you-rather about emotional intimacy'
  },
  'couple-quiz': {
    romantic: 'Generate a romantic quiz question about partner preferences',
    spicy: 'Generate a spicy quiz about intimate knowledge of partner',
    seductive: 'Generate a seductive quiz about physical attraction and desires',
    playful: 'Generate a playful quiz about relationship quirks',
    deep: 'Generate a deep quiz about emotional connection'
  },
  'rapid-questions': {
    romantic: 'Generate a quick romantic question',
    spicy: 'Generate a quick spicy question about attraction',
    seductive: 'Generate a quick seductive question about physical desires',
    playful: 'Generate a quick playful question',
    deep: 'Generate a quick deep question about feelings'
  }
};

export class AIQuestionService {
  private cache = new Map<string, AIQuestionResponse>();
  private fallbackPool = new Map<string, AIQuestionResponse[]>();

  constructor() {
    this.initializeFallbackPool();
  }

  async generateQuestion(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    const { gameType, category } = request;
    const cacheKey = `${gameType}-${category}`;
    
    // Return cached question if available
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      this.cache.delete(cacheKey);
      return cached;
    }

    // Get from fallback pool immediately for speed
    return this.getRandomFallback(gameType, category);
  }

  private initializeFallbackPool() {
    const gameTypes: GameType[] = ['intimate-confessions', 'truth-or-dare', 'would-you-rather', 'couple-quiz', 'rapid-questions'];
    const categories: QuestionCategory[] = ['seductive', 'spicy', 'romantic', 'playful', 'deep'];
    
    gameTypes.forEach(gameType => {
      categories.forEach(category => {
        const key = `${gameType}-${category}`;
        this.fallbackPool.set(key, this.generateFallbackPool(gameType, category));
      });
    });
  }

  private generateFallbackPool(gameType: GameType, category: QuestionCategory): AIQuestionResponse[] {
    const pool: AIQuestionResponse[] = [];
    const baseQuestion = this.getFallbackQuestion(gameType, category);
    
    // Generate 10 variations for each category
    for (let i = 0; i < 10; i++) {
      pool.push({
        ...baseQuestion,
        question: this.getVariation(baseQuestion.question, i)
      });
    }
    return pool;
  }

  private getVariation(baseQuestion: string, index: number): string {
    const variations = [
      baseQuestion,
      baseQuestion.replace('What', 'Tell me what'),
      baseQuestion.replace('your', 'your partner\'s'),
      baseQuestion.replace('you', 'your partner'),
      baseQuestion + ' Be honest!',
      baseQuestion + ' Don\'t hold back!',
      baseQuestion.replace('?', ' right now?'),
      baseQuestion.replace('What\'s', 'Describe'),
      baseQuestion + ' Share everything!',
      baseQuestion.replace('your', 'the')
    ];
    return variations[index] || baseQuestion;
  }

  private getRandomFallback(gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    const key = `${gameType}-${category}`;
    const pool = this.fallbackPool.get(key) || [];
    return pool[Math.floor(Math.random() * pool.length)] || this.getFallbackQuestion(gameType, category);
  }

  private getDefaultType(gameType: GameType): AIQuestionResponse['type'] {
    const typeMap: Record<GameType, AIQuestionResponse['type']> = {
      'truth-or-dare': 'truth',
      'intimate-confessions': 'confession',
      'would-you-rather': 'choice',
      'couple-quiz': 'quiz',
      'rapid-questions': 'rapid'
    };
    return typeMap[gameType];
  }

  private getFallbackQuestion(gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    const fallbacks: Record<GameType, Record<QuestionCategory, AIQuestionResponse>> = {
      'intimate-confessions': {
        seductive: {
          question: "What's your biggest turn-on that you've never told your partner?",
          category: 'seductive',
          type: 'confession',
          correctAnswer: null
        },
        spicy: {
          question: "Describe your ideal intimate moment with your partner in detail",
          category: 'spicy',
          type: 'confession',
          correctAnswer: null
        },
        romantic: {
          question: "What romantic gesture makes you feel most loved?",
          category: 'romantic',
          type: 'confession',
          correctAnswer: null
        },
        playful: {
          question: "What's the most embarrassing thing you find attractive?",
          category: 'playful',
          type: 'confession',
          correctAnswer: null
        },
        deep: {
          question: "What emotional need do you wish your partner understood better?",
          category: 'deep',
          type: 'confession',
          correctAnswer: null
        }
      },
      'truth-or-dare': {
        seductive: {
          question: "Kiss your partner's neck for 10 seconds while maintaining eye contact",
          category: 'seductive',
          type: 'dare',
          correctAnswer: null
        },
        spicy: {
          question: "Truth: What's your secret fantasy involving your partner?",
          category: 'spicy',
          type: 'truth',
          correctAnswer: null
        },
        romantic: {
          question: "Tell your partner the exact moment you knew you were falling for them",
          category: 'romantic',
          type: 'truth',
          correctAnswer: null
        },
        playful: {
          question: "Dare: Give your partner a sensual massage for 2 minutes",
          category: 'playful',
          type: 'dare',
          correctAnswer: null
        },
        deep: {
          question: "What's your deepest fear about our relationship?",
          category: 'deep',
          type: 'truth',
          correctAnswer: null
        }
      },
      'would-you-rather': {
        seductive: {
          question: "Would you rather: Have a passionate night under the stars OR a steamy morning in bed?",
          options: ["Passionate night under stars", "Steamy morning in bed"],
          category: 'seductive',
          type: 'choice',
          correctAnswer: null
        },
        spicy: {
          question: "Would you rather: Be teased all day OR get everything at once?",
          options: ["Teased all day", "Everything at once"],
          category: 'spicy',
          type: 'choice',
          correctAnswer: null
        },
        romantic: {
          question: "Would you rather: A surprise romantic getaway OR a planned dream vacation?",
          options: ["Surprise romantic getaway", "Planned dream vacation"],
          category: 'romantic',
          type: 'choice',
          correctAnswer: null
        },
        playful: {
          question: "Would you rather: Flirt via texts all day OR have one long intimate conversation?",
          options: ["Flirt via texts", "One long conversation"],
          category: 'playful',
          type: 'choice',
          correctAnswer: null
        },
        deep: {
          question: "Would you rather: Know all your partner's thoughts OR have them know all yours?",
          options: ["Know their thoughts", "They know mine"],
          category: 'deep',
          type: 'choice',
          correctAnswer: null
        }
      },
      'couple-quiz': {
        seductive: {
          question: "What part of your body does your partner find most attractive?",
          options: ["Eyes", "Lips", "Neck", "Other"],
          category: 'seductive',
          type: 'quiz',
          correctAnswer: null
        },
        spicy: {
          question: "What's your partner's favorite way to be touched?",
          options: ["Gentle caress", "Firm grip", "Light tickle", "Passionate hold"],
          category: 'spicy',
          type: 'quiz',
          correctAnswer: null
        },
        romantic: {
          question: "What's your partner's ideal date night?",
          options: ["Candlelit dinner", "Movie night", "Adventure", "Stay home"],
          category: 'romantic',
          type: 'quiz',
          correctAnswer: null
        },
        playful: {
          question: "What makes your partner blush the most?",
          options: ["Compliments", "Teasing", "Public affection", "Surprises"],
          category: 'playful',
          type: 'quiz',
          correctAnswer: null
        },
        deep: {
          question: "What does your partner value most in your relationship?",
          options: ["Trust", "Communication", "Intimacy", "Support"],
          category: 'deep',
          type: 'quiz',
          correctAnswer: null
        }
      },
      'rapid-questions': {
        seductive: {
          question: "Favorite place to be kissed?",
          category: 'seductive',
          type: 'rapid',
          correctAnswer: null
        },
        spicy: {
          question: "Biggest turn-on?",
          category: 'spicy',
          type: 'rapid',
          correctAnswer: null
        },
        romantic: {
          question: "Perfect romantic gesture?",
          category: 'romantic',
          type: 'rapid',
          correctAnswer: null
        },
        playful: {
          question: "Cutest thing about your partner?",
          category: 'playful',
          type: 'rapid',
          correctAnswer: null
        },
        deep: {
          question: "What makes you feel most loved?",
          category: 'deep',
          type: 'rapid',
          correctAnswer: null
        }
      }
    };

    return fallbacks[gameType]?.[category] || fallbacks['intimate-confessions']['romantic'];
  }

  // Preload questions for better performance
  preloadQuestions(gameType: GameType, category: QuestionCategory, count: number = 5) {
    const cacheKey = `${gameType}-${category}`;
    for (let i = 0; i < count; i++) {
      const question = this.getRandomFallback(gameType, category);
      this.cache.set(`${cacheKey}-${i}`, question);
    }
  }

  // Get instant question without any delay
  getInstantQuestion(gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    return this.getRandomFallback(gameType, category);
  }
}

export const aiQuestionService = new AIQuestionService();
