// Dark Desire - Real-time interactive game for couples
class DarkDesire {
  constructor(room, eventEmitter) {
    this.room = room;
    this.eventEmitter = eventEmitter;
    this.gameState = {
      gameStarted: false,
      currentRound: 0,
      players: {
        host: { desires: [], reactions: [], intimacyLevel: 0 },
        guest: { desires: [], reactions: [], intimacyLevel: 0 }
      },
      sharedMoments: [],
      connectionScore: 0
    };
  }

  onGameInit() {
    console.log(`Dark Desire initialized for room ${this.room.id}`);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.eventEmitter.on('share_desire', (data) => {
      this.handleShareDesire(data);
    });

    this.eventEmitter.on('react_to_desire', (data) => {
      this.handleReaction(data);
    });

    this.eventEmitter.on('send_touch', (data) => {
      this.handleVirtualTouch(data);
    });

    this.eventEmitter.on('start_game', () => {
      this.startGame();
    });
  }

  handleShareDesire(data) {
    if (!this.gameState.gameStarted) return;

    const { playerId, desire, intensity } = data;
    const playerRole = this.getPlayerRole(playerId);
    
    if (!playerRole) return;

    const desireData = {
      id: Date.now(),
      text: desire,
      intensity: intensity || 1,
      timestamp: new Date(),
      reactions: []
    };

    this.gameState.players[playerRole].desires.push(desireData);
    this.gameState.players[playerRole].intimacyLevel += intensity;

    // Broadcast to partner only
    const partnerId = playerRole === 'host' ? this.room.guest?.id : this.room.host?.id;
    if (partnerId) {
      this.eventEmitter.to(this.getSocketId(partnerId)).emit('desire_received', {
        from: playerId,
        desire: desireData,
        intimacyLevel: this.gameState.players[playerRole].intimacyLevel
      });
    }

    this.updateConnectionScore();
  }

  handleReaction(data) {
    if (!this.gameState.gameStarted) return;

    const { playerId, desireId, reaction, emotionalResponse } = data;
    const playerRole = this.getPlayerRole(playerId);
    const partnerRole = playerRole === 'host' ? 'guest' : 'host';
    
    if (!playerRole) return;

    const reactionData = {
      playerId,
      reaction,
      emotionalResponse,
      timestamp: new Date()
    };

    // Find the desire and add reaction
    const desire = this.gameState.players[partnerRole].desires.find(d => d.id === desireId);
    if (desire) {
      desire.reactions.push(reactionData);
      this.gameState.players[playerRole].reactions.push(reactionData);

      // Create shared moment if reaction is positive
      if (reaction === 'love' || reaction === 'excited') {
        this.createSharedMoment(desire, reactionData);
      }

      // Broadcast reaction to both players
      this.eventEmitter.to(this.room.id).emit('reaction_shared', {
        desireId,
        reaction: reactionData,
        connectionScore: this.gameState.connectionScore
      });
    }

    this.updateConnectionScore();
  }

  handleVirtualTouch(data) {
    if (!this.gameState.gameStarted) return;

    const { playerId, touchType, position, intensity } = data;
    const partnerId = this.getPartnerId(playerId);
    
    if (!partnerId) return;

    // Send real-time touch to partner
    this.eventEmitter.to(this.getSocketId(partnerId)).emit('touch_received', {
      from: playerId,
      touchType,
      position,
      intensity,
      timestamp: new Date()
    });

    // Increase intimacy
    const playerRole = this.getPlayerRole(playerId);
    if (playerRole) {
      this.gameState.players[playerRole].intimacyLevel += intensity * 0.5;
    }
  }

  createSharedMoment(desire, reaction) {
    const moment = {
      id: Date.now(),
      desire: desire.text,
      reaction: reaction.reaction,
      timestamp: new Date(),
      intimacyBonus: 10
    };

    this.gameState.sharedMoments.push(moment);
    this.gameState.connectionScore += moment.intimacyBonus;

    this.eventEmitter.to(this.room.id).emit('shared_moment_created', {
      moment,
      connectionScore: this.gameState.connectionScore
    });
  }

  startGame() {
    if (!this.room.host || !this.room.guest) {
      this.eventEmitter.emit('game_error', { message: 'Need both partners to start' });
      return;
    }

    this.gameState.gameStarted = true;
    this.gameState.currentRound = 1;

    this.eventEmitter.to(this.room.id).emit('dark_desire_started', {
      roomId: this.room.id,
      gameState: this.gameState,
      message: 'Welcome to Dark Desire. Share your deepest desires and connect intimately.'
    });
  }

  getPlayerRole(playerId) {
    if (this.room.host?.id === playerId) return 'host';
    if (this.room.guest?.id === playerId) return 'guest';
    return null;
  }

  getPartnerId(playerId) {
    if (this.room.host?.id === playerId) return this.room.guest?.id;
    if (this.room.guest?.id === playerId) return this.room.host?.id;
    return null;
  }

  getSocketId(playerId) {
    if (this.room.host?.id === playerId) return this.room.host.socketId;
    if (this.room.guest?.id === playerId) return this.room.guest.socketId;
    return null;
  }

  updateConnectionScore() {
    const hostIntimacy = this.gameState.players.host.intimacyLevel;
    const guestIntimacy = this.gameState.players.guest.intimacyLevel;
    const sharedMoments = this.gameState.sharedMoments.length;
    
    this.gameState.connectionScore = Math.floor(
      (hostIntimacy + guestIntimacy) * 0.5 + (sharedMoments * 15)
    );

    this.eventEmitter.to(this.room.id).emit('connection_updated', {
      connectionScore: this.gameState.connectionScore,
      intimacyLevels: {
        host: hostIntimacy,
        guest: guestIntimacy
      }
    });
  }

  getGameState() {
    return this.gameState;
  }

  onPlayerJoin(player) {
    console.log(`Player ${player.id} joined Dark Desire`);
  }

  onPlayerDisconnect(player) {
    console.log(`Player ${player.id} disconnected from Dark Desire`);
  }

  onGameStart() {
    this.startGame();
  }

  onGameEnd(reason) {
    this.gameState.gameStarted = false;
    console.log(`Dark Desire ended: ${reason}`);
  }

  onGameUpdate(gameEvent) {
    const { type, playerId, data } = gameEvent;
    
    switch (type) {
      case 'share_desire':
        this.handleShareDesire({ playerId, ...data });
        break;
      case 'react_to_desire':
        this.handleReaction({ playerId, ...data });
        break;
      case 'send_touch':
        this.handleVirtualTouch({ playerId, ...data });
        break;
    }
  }
}

const DarkDesirePlugin = {
  name: 'dark-desire',
  displayName: 'Dark Desire',
  description: 'An intimate real-time game for couples to share desires and connect deeply',
  minPlayers: 2,
  maxPlayers: 2,
  gameClass: DarkDesire
};

module.exports = { DarkDesire, DarkDesirePlugin };