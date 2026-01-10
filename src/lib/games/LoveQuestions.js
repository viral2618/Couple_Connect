const BaseGame = require('./BaseGame')

class LoveQuestions extends BaseGame {
  constructor(roomId, players) {
    super(roomId, players)
    this.questions = [
      "What's your favorite memory of us together?",
      "What made you fall in love with me?",
      "What's your biggest dream for our future?",
      "When do you feel most loved by me?",
      "What's something you've always wanted to tell me?",
      "What's your favorite thing about our relationship?",
      "How do you want to grow old together?",
      "What's the most romantic thing I've ever done?"
    ]
  }

  generateContent() {
    const randomQuestion = this.questions[Math.floor(Math.random() * this.questions.length)]
    this.gameData = {
      question: randomQuestion,
      answers: {},
      type: 'question'
    }
  }

  processAction(playerId, action, data) {
    if (action === 'submit-answer') {
      this.gameData.answers[playerId] = data.answer
      
      if (Object.keys(this.gameData.answers).length === this.players.length) {
        this.players.forEach(player => {
          this.scores[player.id] += 1
        })
        return this.nextRound()
      }
    }
    return this.getGameState()
  }
}

module.exports = LoveQuestions