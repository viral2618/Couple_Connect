import { AIQuestionRequest, AIQuestionResponse, GameType, QuestionCategory } from '../types/gameTypes';

const SEDUCTIVE_PROMPTS = {
  'intimate-confessions': {
    seductive: 'Create a highly seductive confession prompt about physical desires',
    spicy: 'Create a spicy confession about secret fantasies',
    romantic: 'Create a romantic confession about feelings',
    playful: 'Create a playful confession about attractions',
    deep: 'Create a deep confession about emotional needs'
  }
};

export class FreeAIService {
  private baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

  async generateQuestion(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    const { gameType, category, playerNames } = request;

    const prompt = this.buildPrompt(gameType, category, playerNames);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer gsk_free_api_key'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 100
        })
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      const text = data.choices[0]?.message?.content || '';

      return {
        question: text.trim(),
        category,
        type: 'confession',
        correctAnswer: null
      };
    } catch {
      return this.getFallback(gameType, category);
    }
  }

  private buildPrompt(gameType: GameType, category: QuestionCategory, playerNames: string[]): string {
    const base = (SEDUCTIVE_PROMPTS as any)[gameType]?.[category] || 'Create an intimate question';
    return `${base} for ${playerNames.join(' and ')}. Return only the question, no extra text.`;
  }

  private getFallback(gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    const fallbacks = {
      seductive: "What's the most seductive thing your partner could do right now?",
      spicy: "Describe your biggest fantasy involving your partner",
      romantic: "What makes you feel most loved by your partner?",
      playful: "What's your partner's cutest habit?",
      deep: "What emotional need do you wish was better understood?"
    };

    return {
      question: fallbacks[category],
      category,
      type: 'confession',
      correctAnswer: null
    };
  }
}

export const freeAIService = new FreeAIService();
