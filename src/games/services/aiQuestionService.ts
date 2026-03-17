import { AIQuestionRequest, AIQuestionResponse, GameType, QuestionCategory } from '../types/gameTypes';

const QUESTION_POOLS: Record<GameType, Record<QuestionCategory, string[]>> = {
  'intimate-confessions': {
    seductive: [
      "What's your biggest turn-on that you've never told your partner?",
      "Describe the most seductive thing your partner has ever done without realizing it.",
      "What outfit or look of your partner drives you absolutely wild?",
      "What's a secret fantasy you've been too shy to bring up?",
      "Where is your favorite place to be touched that most people don't know about?",
      "What's the most attractive non-physical thing about your partner?",
      "Describe a moment when you found your partner irresistibly attractive.",
      "What's one thing you wish your partner would do more often to seduce you?",
      "What's the most daring thing you've ever wanted to do with your partner?",
      "What scent or cologne/perfume of your partner makes you weak in the knees?",
      "What's a look your partner gives you that you can't resist?",
      "Describe your ideal seductive evening with your partner from start to finish.",
      "What's something your partner does casually that you find incredibly sexy?",
      "What's the most intimate moment you've shared that you still think about?",
      "What's one physical feature of your partner you could never get enough of?",
    ],
    spicy: [
      "Describe your ideal intimate moment with your partner in detail.",
      "What's the spiciest thing on your relationship bucket list?",
      "What's a bold move you've always wanted to make but haven't yet?",
      "What's the most spontaneous intimate thing you've ever done or want to do?",
      "What's a secret desire you've been holding back from your partner?",
      "Describe a scenario that would make your heart race with your partner.",
      "What's the most adventurous place you'd want to be intimate with your partner?",
      "What's something you've always wanted to try but felt too nervous to suggest?",
      "What's the spiciest compliment you've ever wanted to give your partner?",
      "Describe a fantasy scenario involving just the two of you.",
      "What's one thing that would make your relationship even more exciting?",
      "What's the boldest thing you've ever done to get your partner's attention?",
      "What's a guilty pleasure you share only with your partner?",
      "What's the most passionate moment you've had together?",
      "What's one thing you'd do if you knew your partner would say yes to anything tonight?",
    ],
    romantic: [
      "What romantic gesture makes you feel most loved?",
      "Describe the moment you knew your partner was the one for you.",
      "What's the most romantic thing your partner has ever done for you?",
      "What song reminds you of your relationship and why?",
      "Describe your perfect romantic evening with your partner.",
      "What's a small thing your partner does that means the world to you?",
      "What's the most heartfelt thing you've ever said or want to say to your partner?",
      "What's a place that holds special romantic meaning for you both?",
      "What's the most thoughtful gift your partner has given you?",
      "Describe the first time you felt truly loved by your partner.",
      "What's a romantic tradition you'd love to start with your partner?",
      "What's the most beautiful thing about your relationship?",
      "What's a love letter you've always wanted to write to your partner?",
      "What's the most romantic dream you've had about your partner?",
      "What's one thing you want your partner to know about how much they mean to you?",
    ],
    playful: [
      "What's the most embarrassing thing you find attractive about your partner?",
      "What's a silly nickname you have for your partner that you've never shared?",
      "What's the funniest moment in your relationship that you still laugh about?",
      "What's a playful dare you'd give your partner right now?",
      "What's the most ridiculous thing you've done to impress your partner?",
      "What's a quirky habit of your partner that you secretly adore?",
      "What's the most playful prank you've pulled on your partner?",
      "What's a fun activity you'd love to try with your partner?",
      "What's the goofiest thing about your relationship that you love?",
      "What's a childhood memory you'd love to recreate with your partner?",
      "What's the most unexpected thing that made you fall harder for your partner?",
      "What's a funny inside joke only you two understand?",
      "What's the most playful text you've ever sent your partner?",
      "What's a game you'd love to play with your partner tonight?",
      "What's the silliest argument you've ever had that ended in laughter?",
    ],
    deep: [
      "What emotional need do you wish your partner understood better?",
      "What's your deepest fear about your relationship?",
      "What's something you've never told anyone but want your partner to know?",
      "What's the most vulnerable you've ever felt with your partner?",
      "What's a dream or goal you're afraid to share with your partner?",
      "What's something from your past that shaped how you love today?",
      "What's the one thing you need most from your partner emotionally?",
      "What's a moment when your partner made you feel truly understood?",
      "What's something you're still healing from that affects your relationship?",
      "What's the most important lesson your relationship has taught you?",
      "What's a boundary you have that you've never fully explained to your partner?",
      "What's something you wish you could change about how you communicate?",
      "What's a sacrifice you've made for your relationship that you've never mentioned?",
      "What's the deepest connection you've felt with your partner?",
      "What's something you're grateful for in your relationship that you rarely say out loud?",
    ],
  },
  'truth-or-dare': {
    seductive: [
      "Kiss your partner's neck for 10 seconds while maintaining eye contact.",
      "Whisper the most seductive thing you can think of into your partner's ear.",
      "Trace your partner's face with your fingertip without breaking eye contact.",
      "Give your partner a slow, meaningful kiss on the hand.",
      "Describe in detail what you find most physically attractive about your partner.",
      "Hold your partner's gaze for 60 seconds without looking away.",
      "Gently run your fingers through your partner's hair for 30 seconds.",
      "Tell your partner the most seductive dream you've had about them.",
      "Slow dance with your partner for one full minute with no music.",
      "Describe exactly what you'd do on a perfect seductive evening together.",
    ],
    spicy: [
      "Truth: What's your secret fantasy involving your partner?",
      "Truth: What's the boldest thing you've ever wanted to do with your partner?",
      "Dare: Send your partner the most flirtatious text you can write right now.",
      "Truth: What's the spiciest thing on your relationship bucket list?",
      "Dare: Give your partner a 2-minute shoulder massage.",
      "Truth: What's something you've always wanted to try but never suggested?",
      "Dare: Recreate your first kiss right now.",
      "Truth: What's the most daring place you'd want to be with your partner?",
      "Dare: Compliment your partner in the most creative way possible.",
      "Truth: What's a bold move you've been too nervous to make?",
    ],
    romantic: [
      "Tell your partner the exact moment you knew you were falling for them.",
      "Write a 3-line love poem for your partner on the spot.",
      "Tell your partner three things you love about them that you rarely say.",
      "Describe your partner using only song titles.",
      "Tell your partner what your life would look like without them.",
      "Share a memory with your partner that you treasure most.",
      "Tell your partner what you were thinking the first time you saw them.",
      "Describe your partner as if introducing them to someone who's never met them.",
      "Tell your partner one thing you admire about them every single day.",
      "Share the moment you felt most proud of your partner.",
    ],
    playful: [
      "Dare: Give your partner a sensual massage for 2 minutes.",
      "Dare: Do your best impression of your partner right now.",
      "Truth: What's the funniest thing your partner has ever done?",
      "Dare: Let your partner style your hair however they want.",
      "Truth: What's the most embarrassing thing you've done to get your partner's attention?",
      "Dare: Speak in an accent for the next 3 rounds.",
      "Truth: What's the silliest argument you've ever had?",
      "Dare: Do a dramatic reading of the last text you sent.",
      "Truth: What's a quirky habit of your partner you secretly love?",
      "Dare: Make your partner laugh in 30 seconds without touching them.",
    ],
    deep: [
      "What's your deepest fear about our relationship?",
      "What's one thing you've never told me that you think I should know?",
      "What's the hardest thing you've ever forgiven me for?",
      "What's something you need from me that you've been afraid to ask for?",
      "What's a moment in our relationship that changed you?",
      "What's something you wish we talked about more openly?",
      "What's the most important thing our relationship has taught you about yourself?",
      "What's a dream you have for our future that you've never shared?",
      "What's something you're still working through that affects us?",
      "What's the one thing you'd want me to understand about you completely?",
    ],
  },
  'would-you-rather': {
    seductive: [
      "Would you rather: Have a passionate night under the stars OR a steamy morning in bed?",
      "Would you rather: Be serenaded OR give a serenade to your partner?",
      "Would you rather: A slow dance in the rain OR a candlelit dinner for two?",
      "Would you rather: Spend a night in a luxury hotel OR a cozy cabin in the woods?",
      "Would you rather: Receive a surprise kiss OR give one unexpectedly?",
      "Would you rather: Have your partner whisper sweet nothings OR write you a love letter?",
      "Would you rather: A sunset boat ride OR a midnight rooftop date?",
      "Would you rather: Be the one who initiates OR the one who is surprised?",
      "Would you rather: A long slow kiss OR a passionate quick one?",
      "Would you rather: Spend the evening dancing OR stargazing together?",
    ],
    spicy: [
      "Would you rather: Be teased all day OR get everything at once?",
      "Would you rather: Skinny dip at midnight OR have a spontaneous road trip?",
      "Would you rather: Send a spicy text OR show up unannounced?",
      "Would you rather: Role play a scenario OR try something completely new?",
      "Would you rather: Be blindfolded for a surprise OR plan every detail yourself?",
      "Would you rather: Have a secret rendezvous OR a bold public display of affection?",
      "Would you rather: Stay up all night talking OR stay up all night doing something else?",
      "Would you rather: Be completely spontaneous OR have everything perfectly planned?",
      "Would you rather: A daring adventure together OR a cozy night in with no rules?",
      "Would you rather: Whisper your desires OR act on them without saying a word?",
    ],
    romantic: [
      "Would you rather: A surprise romantic getaway OR a planned dream vacation?",
      "Would you rather: Receive flowers every week OR one grand romantic gesture a year?",
      "Would you rather: Cook a romantic dinner together OR be taken to a fancy restaurant?",
      "Would you rather: Relive your first date OR go on the date you've always dreamed of?",
      "Would you rather: Have a partner who writes you love notes OR surprises you with gifts?",
      "Would you rather: Watch the sunrise together OR the sunset?",
      "Would you rather: A weekend getaway every month OR one epic trip a year?",
      "Would you rather: Fall in love slowly OR all at once?",
      "Would you rather: Have your partner remember every little detail about you OR always make you laugh?",
      "Would you rather: A handwritten letter OR a heartfelt voice message?",
    ],
    playful: [
      "Would you rather: Flirt via texts all day OR have one long intimate conversation?",
      "Would you rather: Win a silly argument OR let your partner win and see them happy?",
      "Would you rather: Have a pillow fight OR a tickle war?",
      "Would you rather: Karaoke night OR game night with your partner?",
      "Would you rather: Prank your partner OR be pranked by them?",
      "Would you rather: Binge a show together OR play video games all night?",
      "Would you rather: Have your partner do your makeup OR let you do theirs?",
      "Would you rather: Go on a spontaneous adventure OR have a lazy day in bed?",
      "Would you rather: Cook a meal together and fail OR order in and watch a movie?",
      "Would you rather: Have a dance-off OR a lip sync battle with your partner?",
    ],
    deep: [
      "Would you rather: Know all your partner's thoughts OR have them know all yours?",
      "Would you rather: Always be honest even if it hurts OR protect your partner from painful truths?",
      "Would you rather: Grow old together in a small town OR travel the world forever?",
      "Would you rather: Have a partner who challenges you OR one who always supports you?",
      "Would you rather: Know your relationship's future OR be surprised by it?",
      "Would you rather: Share every secret with your partner OR keep some mystery?",
      "Would you rather: Have a partner who understands you completely OR one who always surprises you?",
      "Would you rather: Build a life from scratch together OR have everything handed to you?",
      "Would you rather: Forgive easily OR take time to heal properly?",
      "Would you rather: Have deep conversations every night OR comfortable silence?",
    ],
  },
  'couple-quiz': {
    seductive: [
      "What part of your body does your partner find most attractive?",
      "What's your partner's favorite compliment to receive?",
      "What's the first thing your partner notices about someone?",
      "What's your partner's idea of the perfect seductive evening?",
      "What scent does your partner find most attractive on you?",
      "What's your partner's favorite physical feature of yours?",
      "What's the most seductive thing your partner has ever said to you?",
      "What time of day does your partner feel most romantic?",
      "What's your partner's favorite way to set the mood?",
      "What's the one thing your partner finds irresistible about you?",
    ],
    spicy: [
      "What's your partner's favorite way to be touched?",
      "What's your partner's spiciest item on their bucket list?",
      "What's the boldest thing your partner has ever done for you?",
      "What's your partner's favorite spontaneous activity?",
      "What's the most daring thing your partner has suggested?",
      "What's your partner's go-to move when they want to be adventurous?",
      "What's your partner's favorite way to surprise you?",
      "What's the spiciest compliment your partner has given you?",
      "What's your partner's favorite time for spontaneous plans?",
      "What's the most unexpected thing your partner has done to impress you?",
    ],
    romantic: [
      "What's your partner's ideal date night?",
      "What's your partner's favorite romantic movie?",
      "What's the most romantic thing your partner has ever done?",
      "What's your partner's love language?",
      "What song does your partner consider 'your song'?",
      "What's your partner's favorite way to show affection?",
      "What's your partner's dream romantic destination?",
      "What's the most thoughtful thing your partner has done for you?",
      "What's your partner's favorite romantic memory of you two?",
      "What's your partner's favorite way to spend a quiet evening together?",
    ],
    playful: [
      "What makes your partner blush the most?",
      "What's your partner's most embarrassing habit?",
      "What's your partner's go-to joke?",
      "What's your partner's favorite silly activity?",
      "What's the funniest face your partner makes?",
      "What's your partner's most ridiculous fear?",
      "What's your partner's favorite childhood game?",
      "What's the weirdest food combination your partner loves?",
      "What's your partner's most used emoji?",
      "What's your partner's guilty pleasure TV show?",
    ],
    deep: [
      "What does your partner value most in your relationship?",
      "What's your partner's biggest life dream?",
      "What's your partner's greatest fear?",
      "What's the one thing your partner can't live without?",
      "What's your partner's most important core value?",
      "What's your partner's biggest insecurity that you help them with?",
      "What's the one thing your partner is most proud of?",
      "What's your partner's idea of a perfect life?",
      "What's the most important lesson your partner has learned?",
      "What's your partner's biggest motivation in life?",
    ],
  },
  'rapid-questions': {
    seductive: [
      "Favorite place to be kissed?",
      "One word to describe your partner's best feature?",
      "Most attractive thing your partner does?",
      "Favorite time of day to be close to your partner?",
      "One thing that instantly attracts you to your partner?",
      "Best physical compliment you've received from your partner?",
      "Favorite way your partner looks at you?",
      "Most seductive memory with your partner?",
      "One thing your partner wears that you love?",
      "Favorite way to show physical affection?",
    ],
    spicy: [
      "Biggest turn-on?",
      "Most spontaneous thing you've done together?",
      "Boldest text you've ever sent your partner?",
      "Most daring place you've been together?",
      "One thing you'd do if you were feeling extra bold tonight?",
      "Spiciest compliment you've given your partner?",
      "Most adventurous plan you've made together?",
      "One thing that always creates sparks between you two?",
      "Most unexpected thing your partner has done for you?",
      "Favorite way to be spontaneous with your partner?",
    ],
    romantic: [
      "Perfect romantic gesture?",
      "Favorite romantic memory?",
      "One word that describes your relationship?",
      "Best date you've ever been on?",
      "Favorite thing your partner says to you?",
      "Most romantic place you've visited together?",
      "Favorite way your partner shows love?",
      "Best gift your partner has given you?",
      "Favorite couple activity?",
      "One thing you love most about your partner?",
    ],
    playful: [
      "Cutest thing about your partner?",
      "Funniest memory together?",
      "Your partner's most annoying but lovable habit?",
      "Best inside joke you share?",
      "Silliest thing you've done together?",
      "Your partner's funniest quirk?",
      "Most ridiculous argument you've had?",
      "Favorite game to play together?",
      "Weirdest thing you both agree on?",
      "Funniest nickname you have for each other?",
    ],
    deep: [
      "What makes you feel most loved?",
      "One thing you'd never change about your partner?",
      "Biggest lesson your relationship taught you?",
      "One word for how your partner makes you feel?",
      "Most important thing in your relationship?",
      "One thing you're grateful for about your partner today?",
      "Biggest way your partner has helped you grow?",
      "One dream you share with your partner?",
      "Most meaningful moment in your relationship?",
      "One thing you want your partner to always know?",
    ],
  },
};

export class AIQuestionService {
  private cache = new Map<string, AIQuestionResponse>();
  private fallbackPool = new Map<string, AIQuestionResponse[]>();
  private usedIndices = new Map<string, Set<number>>();

  constructor() {
    this.initializeFallbackPool();
  }

  async generateQuestion(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    const { gameType, category } = request;
    const cacheKey = `${gameType}-${category}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      this.cache.delete(cacheKey);
      return cached;
    }
    return this.getRandomFallback(gameType, category);
  }

  private initializeFallbackPool() {
    const gameTypes: GameType[] = ['intimate-confessions', 'truth-or-dare', 'would-you-rather', 'couple-quiz', 'rapid-questions'];
    const categories: QuestionCategory[] = ['seductive', 'spicy', 'romantic', 'playful', 'deep'];
    const typeMap: Record<GameType, AIQuestionResponse['type']> = {
      'truth-or-dare': 'truth',
      'intimate-confessions': 'confession',
      'would-you-rather': 'choice',
      'couple-quiz': 'quiz',
      'rapid-questions': 'rapid',
    };

    gameTypes.forEach(gameType => {
      categories.forEach(category => {
        const key = `${gameType}-${category}`;
        const questions = QUESTION_POOLS[gameType]?.[category] || [];
        const pool: AIQuestionResponse[] = questions.map(q => ({
          question: q,
          category,
          type: typeMap[gameType],
          correctAnswer: null,
        }));
        this.fallbackPool.set(key, pool);
        this.usedIndices.set(key, new Set());
      });
    });
  }

  private getRandomFallback(gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    const key = `${gameType}-${category}`;
    const pool = this.fallbackPool.get(key) || [];
    if (pool.length === 0) return { question: 'No question available', category, type: 'confession', correctAnswer: null };

    let used = this.usedIndices.get(key)!;
    // Reset when all questions have been used
    if (used.size >= pool.length) {
      used.clear();
    }

    let idx: number;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (used.has(idx));

    used.add(idx);
    return pool[idx];
  }

  private getDefaultType(gameType: GameType): AIQuestionResponse['type'] {
    const typeMap: Record<GameType, AIQuestionResponse['type']> = {
      'truth-or-dare': 'truth',
      'intimate-confessions': 'confession',
      'would-you-rather': 'choice',
      'couple-quiz': 'quiz',
      'rapid-questions': 'rapid',
    };
    return typeMap[gameType];
  }

  preloadQuestions(gameType: GameType, category: QuestionCategory, count: number = 5) {
    const cacheKey = `${gameType}-${category}`;
    for (let i = 0; i < count; i++) {
      const question = this.getRandomFallback(gameType, category);
      this.cache.set(`${cacheKey}-${i}`, question);
    }
  }

  getInstantQuestion(gameType: GameType, category: QuestionCategory): AIQuestionResponse {
    return this.getRandomFallback(gameType, category);
  }
}

export const aiQuestionService = new AIQuestionService();
