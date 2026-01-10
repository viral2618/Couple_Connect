# Real-Time Multiplayer Game Engine

A Socket.IO-based game engine for 2-player real-time multiplayer games with room management, event handling, and plugin architecture.

## Features

- **Real-time Communication**: Socket.IO for bidirectional communication
- **Room Management**: Create/join rooms with unique codes
- **Plugin Architecture**: Easy game integration system
- **Event-Driven**: Comprehensive event handling
- **Auto-Reconnection**: Built-in connection recovery
- **TypeScript Support**: Full type definitions included

## Quick Start

### Installation

```bash
npm install
```

### Start Server

```bash
npm start
```

Server runs on `http://localhost:3001`

### API Endpoints

- `GET /health` - Health check
- `GET /api/games` - List available games
- `GET /api/room/:roomId` - Get room information

### Socket Events

#### Client → Server
- `create_room` - Create new game room
- `join_room` - Join existing room
- `leave_room` - Leave current room
- `game_event` - Send game-specific events

#### Server → Client
- `room_created` - Room creation confirmation
- `room_joined` - Room join confirmation
- `player_joined` - New player notification
- `game_started` - Game start notification
- `game_state_update` - Game state changes
- `game_ended` - Game completion

## Usage Example

```javascript
const GameClient = require('./src/client/GameClient');

const client = new GameClient();

// Create room
client.createRoom('dummy', 'Player1');

// Join room (use room code from room_created event)
client.joinRoom('ABCD', 'Player2');

// Start game
client.startGame();

// Make moves
client.makeMove({ x: 1, y: 1 });
```

## Architecture

- **RoomManager**: Handles room lifecycle and player management
- **GameRegistry**: Manages game plugins and instances
- **EventManager**: Coordinates Socket.IO events and game communication
- **Game Plugins**: Modular game implementations

## Adding New Games

1. Create game class extending base game interface
2. Implement required methods: `onGameInit()`, event handlers
3. Create plugin configuration object
4. Register with GameRegistry

Example:
```javascript
const MyGamePlugin = {
  name: 'mygame',
  displayName: 'My Game',
  minPlayers: 2,
  maxPlayers: 2,
  gameClass: MyGameClass
};

gameRegistry.registerGame(MyGamePlugin);
```

## Development

- `npm run dev` - Development mode with auto-restart
- `npm test` - Run tests
- `npm run lint` - Code linting

## File Structure

```
src/
├── core/
│   ├── RoomManager.js      # Room management
│   ├── GameRegistry.js     # Game plugin system
│   └── EventManager.js     # Event coordination
├── games/
│   └── DummyGame.js        # Example game implementation
├── client/
│   └── GameClient.js       # Client SDK
├── types/
│   └── index.ts            # TypeScript definitions
└── server.js               # Main server entry point
```