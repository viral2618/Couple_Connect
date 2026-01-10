class BaseGame {
  constructor(roomId, players) {
    this.roomId = roomId
    this.players = players
    this.currentRound = 1
    this.maxRounds = 3
    this.scores = {}
    this.gameData = {}
    this.state = 'waiting'
    
    players.forEach(player => {
      this.scores[player.id] = 0
    })
  }

  start() {
    this.state = 'playing'
    this.generateContent()
    return this.getGameState()
  }

  generateContent() {
    // Override in subclasses
  }

  processAction(playerId, action, data) {
    // Override in subclasses
    return this.getGameState()
  }

  nextRound() {
    if (this.currentRound >= this.maxRounds) {
      this.state = 'finished'
    } else {
      this.currentRound++
      this.generateContent()
    }
    return this.getGameState()
  }

  getGameState() {
    return {
      roomId: this.roomId,
      players: this.players,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      scores: this.scores,
      gameData: this.gameData,
      state: this.state
    }
  }
}

module.exports = BaseGame