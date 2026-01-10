class GameEngine {
  constructor() {
    this.games = new Map()
    this.gameTypes = new Map()
    this.registerGameTypes()
  }

  registerGameTypes() {
    this.gameTypes.set('love-questions', require('./games/LoveQuestions'))
  }

  createGame(roomId, gameType, players) {
    const GameClass = this.gameTypes.get(gameType)
    if (!GameClass) throw new Error('Unknown game type')
    
    const game = new GameClass(roomId, players)
    this.games.set(roomId, game)
    return game
  }

  getGame(roomId) {
    return this.games.get(roomId)
  }

  removeGame(roomId) {
    this.games.delete(roomId)
  }
}

module.exports = GameEngine