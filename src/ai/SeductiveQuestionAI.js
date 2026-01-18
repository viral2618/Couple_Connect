// AI-Powered Seductive Question Generator
// Advanced algorithm for dynamic, contextual intimate questions

class SeductiveQuestionAI {
  constructor() {
    this.userPreferences = {};
    this.conversationHistory = [];
    this.intimacyLevel = 1;
    this.questionPatterns = this.initializePatterns();
    this.contextualModifiers = this.initializeModifiers();
  }

  // Initialize question generation patterns
  initializePatterns() {
    return {
      confession: [
        "What's the most {adjective} thing you've {action} that {context}?",
        "Tell me about a time when you felt {emotion} and {desire}.",
        "Describe your {superlative} {experience} that involves {subject}.",
        "What's your secret {feeling} about {topic}?",
        "Share your most {intensity} {memory} with me."
      ],
      fantasy: [
        "If we could {scenario}, what would {outcome}?",
        "Describe your perfect {setting} where we {activity}.",
        "What's your dream about {situation} with me?",
        "Imagine we're {location} - what happens next?",
        "Tell me your fantasy about {theme} together."
      ],
      desire: [
        "What's something you want me to {action} that {effect}?",
        "Describe how you'd like me to {behavior} when {condition}.",
        "What part of {subject} makes you {reaction}?",
        "Tell me what you {want} when {situation}.",
        "What's your desire about {experience} together?"
      ]
    };
  }

  // Initialize contextual modifiers based on intimacy levels
  initializeModifiers() {
    return {
      1: { // Flirty
        adjectives: ["charming", "flirtatious", "sweet", "romantic", "playful"],
        emotions: ["confident", "attractive", "desired", "special", "butterflies"],
        actions: ["done", "said", "felt", "experienced", "imagined"],
        contexts: ["caught someone's attention", "made you feel amazing", "created sparks", "felt magical"]
      },
      2: { // Playful
        adjectives: ["seductive", "alluring", "tempting", "captivating", "irresistible"],
        emotions: ["excited", "aroused", "passionate", "wild", "adventurous"],
        actions: ["tried", "wanted", "craved", "fantasized", "desired"],
        contexts: ["turned you on", "made you blush", "got your heart racing", "felt naughty"]
      },
      3: { // Romantic
        adjectives: ["intimate", "passionate", "sensual", "erotic", "steamy"],
        emotions: ["lustful", "yearning", "burning", "aching", "craving"],
        actions: ["experienced", "explored", "indulged", "surrendered", "embraced"],
        contexts: ["made you melt", "drove you crazy", "left you breathless", "consumed your thoughts"]
      },
      4: { // Passionate
        adjectives: ["intense", "raw", "primal", "explosive", "overwhelming"],
        emotions: ["desperate", "hungry", "wild", "insatiable", "fevered"],
        actions: ["devoured", "conquered", "dominated", "submitted", "unleashed"],
        contexts: ["made you lose control", "pushed your limits", "awakened desires", "shattered boundaries"]
      },
      5: { // Intimate
        adjectives: ["forbidden", "taboo", "kinky", "dirty", "naughty"],
        emotions: ["shameless", "wicked", "sinful", "depraved", "uninhibited"],
        actions: ["explored", "experimented", "indulged", "surrendered", "corrupted"],
        contexts: ["crossed lines", "broke rules", "fulfilled fantasies", "satisfied cravings"]
      }
    };
  }

  // Generate personalized question based on context
  generateQuestion(category = 'random', customContext = {}) {
    const level = Math.min(this.intimacyLevel, 5);
    const modifiers = this.contextualModifiers[level];
    
    // Select category
    const categories = ['confession', 'fantasy', 'desire'];
    const selectedCategory = category === 'random' ? 
      categories[Math.floor(Math.random() * categories.length)] : category;
    
    // Get pattern
    const patterns = this.questionPatterns[selectedCategory];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Generate question with AI-like contextual awareness
    return this.populatePattern(pattern, modifiers, customContext);
  }

  // Populate pattern with contextual data
  populatePattern(pattern, modifiers, customContext) {
    let question = pattern;
    
    // Replace placeholders with contextual content
    const replacements = {
      '{adjective}': this.getRandomFromArray(modifiers.adjectives),
      '{emotion}': this.getRandomFromArray(modifiers.emotions),
      '{action}': this.getRandomFromArray(modifiers.actions),
      '{context}': this.getRandomFromArray(modifiers.contexts),
      '{superlative}': this.getSuperlative(),
      '{experience}': this.getExperience(),
      '{subject}': this.getSubject(),
      '{topic}': this.getTopic(),
      '{intensity}': this.getIntensity(),
      '{memory}': this.getMemory(),
      '{scenario}': this.getScenario(),
      '{outcome}': this.getOutcome(),
      '{setting}': this.getSetting(),
      '{activity}': this.getActivity(),
      '{situation}': this.getSituation(),
      '{location}': this.getLocation(),
      '{theme}': this.getTheme(),
      '{effect}': this.getEffect(),
      '{behavior}': this.getBehavior(),
      '{condition}': this.getCondition(),
      '{reaction}': this.getReaction(),
      '{want}': this.getWant()
    };
    
    // Apply replacements
    Object.keys(replacements).forEach(key => {
      question = question.replace(new RegExp(key, 'g'), replacements[key]);
    });
    
    return question;
  }

  // Helper methods for generating contextual content
  getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getSuperlative() {
    const superlatives = ["most exciting", "hottest", "most memorable", "wildest", "most intense"];
    return this.getRandomFromArray(superlatives);
  }

  getExperience() {
    const experiences = ["moment", "encounter", "experience", "memory", "fantasy"];
    return this.getRandomFromArray(experiences);
  }

  getSubject() {
    const subjects = ["my body", "our connection", "my touch", "my voice", "my presence"];
    return this.getRandomFromArray(subjects);
  }

  getTopic() {
    const topics = ["us together", "our chemistry", "our future", "our intimacy", "our passion"];
    return this.getRandomFromArray(topics);
  }

  getIntensity() {
    const intensities = ["passionate", "steamy", "wild", "intimate", "sensual"];
    return this.getRandomFromArray(intensities);
  }

  getMemory() {
    const memories = ["experience", "moment", "encounter", "fantasy", "dream"];
    return this.getRandomFromArray(memories);
  }

  getScenario() {
    const scenarios = ["spend a whole day together", "be alone for hours", "escape to paradise", "have no limits"];
    return this.getRandomFromArray(scenarios);
  }

  getOutcome() {
    const outcomes = ["would happen", "would you want", "would we do", "would unfold"];
    return this.getRandomFromArray(outcomes);
  }

  getSetting() {
    const settings = ["romantic evening", "intimate moment", "passionate encounter", "sensual experience"];
    return this.getRandomFromArray(settings);
  }

  getActivity() {
    const activities = ["explore each other", "lose ourselves", "give in to desire", "create magic"];
    return this.getRandomFromArray(activities);
  }

  getSituation() {
    const situations = ["being completely alone", "having no interruptions", "total privacy", "unlimited time"];
    return this.getRandomFromArray(situations);
  }

  getLocation() {
    const locations = ["somewhere romantic", "in paradise", "completely alone", "in our own world"];
    return this.getRandomFromArray(locations);
  }

  getTheme() {
    const themes = ["pure passion", "wild adventure", "intimate connection", "sensual exploration"];
    return this.getRandomFromArray(themes);
  }

  getEffect() {
    const effects = ["drives you wild", "makes you melt", "turns you on", "excites you"];
    return this.getRandomFromArray(effects);
  }

  getBehavior() {
    const behaviors = ["touch you", "look at you", "whisper to you", "hold you"];
    return this.getRandomFromArray(behaviors);
  }

  getCondition() {
    const conditions = ["we're alone", "we're together", "you're ready", "the moment is right"];
    return this.getRandomFromArray(conditions);
  }

  getReaction() {
    const reactions = ["feel excited", "get butterflies", "feel desire", "want more"];
    return this.getRandomFromArray(reactions);
  }

  getWant() {
    const wants = ["crave", "desire", "need", "long for"];
    return this.getRandomFromArray(wants);
  }

  // Advanced AI features
  learnFromResponse(question, response, rating) {
    // Store successful patterns for future use
    this.conversationHistory.push({
      question,
      response,
      rating,
      timestamp: Date.now(),
      intimacyLevel: this.intimacyLevel
    });
    
    // Adjust intimacy level based on engagement
    if (rating >= 4) {
      this.intimacyLevel = Math.min(this.intimacyLevel + 0.1, 8);
    }
  }

  // Generate question series for progressive intimacy
  generateQuestionSeries(count = 5) {
    const series = [];
    const categories = ['confession', 'fantasy', 'desire'];
    
    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      series.push({
        id: `q_${Date.now()}_${i}`,
        category,
        question: this.generateQuestion(category),
        level: this.intimacyLevel,
        timestamp: Date.now()
      });
    }
    
    return series;
  }

  // Analyze conversation patterns
  getPersonalizedRecommendations() {
    const recentHistory = this.conversationHistory.slice(-10);
    const preferences = {};
    
    recentHistory.forEach(entry => {
      if (entry.rating >= 4) {
        // Track successful question types
        preferences[entry.category] = (preferences[entry.category] || 0) + 1;
      }
    });
    
    return {
      preferredCategories: Object.keys(preferences).sort((a, b) => preferences[b] - preferences[a]),
      suggestedLevel: this.intimacyLevel,
      engagement: this.calculateEngagement()
    };
  }

  calculateEngagement() {
    if (this.conversationHistory.length === 0) return 0;
    
    const recent = this.conversationHistory.slice(-5);
    const avgRating = recent.reduce((sum, entry) => sum + entry.rating, 0) / recent.length;
    
    return Math.round(avgRating * 20); // Convert to percentage
  }

  // Set user preferences for personalization
  setUserPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  // Reset AI state
  reset() {
    this.conversationHistory = [];
    this.intimacyLevel = 1;
    this.userPreferences = {};
  }
}

export default SeductiveQuestionAI;