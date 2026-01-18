class GameRegistry {
  constructor() {
    this.games = new Map(); // gameType -> GamePlugin
    this.activeGames = new Map(); // roomId -> GameInstance
  }

  // Register a new game plugin
  registerGame(gamePlugin) {
    if (!gamePlugin.name || !gamePlugin.gameClass) {
      throw new Error('Invalid game plugin: missing name or gameClass');
    }

    if (this.games.has(gamePlugin.name)) {
      throw new Error(`Game '${gamePlugin.name}' already registered`);
    }

    this.games.set(gamePlugin.name, gamePlugin);
    console.log(`Game registered: ${gamePlugin.name}`);
  }

  // Get available games
  getAvailableGames() {
    return Array.from(this.games.keys());
  }

  // Create game instance for room
  createGameInstance(room, eventEmitter) {
    const gamePlugin = this.games.get(room.gameType);
    if (!gamePlugin) {
      throw new Error(`Game type '${room.gameType}' not found`);
    }

    const gameInstance = new gamePlugin.gameClass(room, eventEmitter);
    this.activeGames.set(room.id, gameInstance);

    // Initialize the game
    gameInstance.onGameInit();

    return gameInstance;
  }

  // Get active game instance
  getGameInstance(roomId) {
    return this.activeGames.get(roomId);
  }

  // Remove game instance
  removeGameInstance(roomId) {
    const gameInstance = this.activeGames.get(roomId);
    if (gameInstance) {
      this.activeGames.delete(roomId);
      return gameInstance;
    }
    return null;
  }

  // Get all active games
  getActiveGames() {
    return Array.from(this.activeGames.keys());
  }
}

module.exports = GameRegistry;