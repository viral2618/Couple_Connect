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
  private baseUrl: string = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

  constructor() {}

  async generateQuestion(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    const { gameType, category, playerNames, previousQuestions = [] } = request;

    const prompt = this.buildPrompt(gameType, category, playerNames, previousQuestions);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.9,
            top_p: 0.95,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      const generatedText = data[0]?.generated_text || '';

      return this.parseAIResponse(generatedText, gameType, category);
    } catch (error) {
      return this.getFallbackQuestion(gameType, category);
    }
  }

  private buildPrompt(gameType: GameType, category: QuestionCategory, playerNames: string[], previousQuestions: string[]): string {
    const names = playerNames.join(' and ');
    const basePrompt = SEDUCTIVE_PROMPTS[gameType]?.[category] || 'Generate an engaging question';
    const avoid = previousQuestions.length > 0 ? `Avoid: ${previousQuestions.slice(-3).join(', ')}` : '';
    
    return `Generate a ${category} question for ${gameType} game for ${names}. ${basePrompt}. ${avoid}\nQuestion:`;
  }

  private parseAIResponse(content: string, gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    const cleanText = content.trim().split('\n')[0].replace(/["']/g, '');
    
    if (cleanText.length < 10) {
      return this.getFallbackQuestion(gameType, category);
    }

    return {
      question: cleanText,
      options: undefined,
      correctAnswer: null,
      category,
      type: this.getDefaultType(gameType)
    };
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
}

export const aiQuestionService = new AIQuestionService();
