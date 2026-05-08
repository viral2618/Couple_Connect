# 🎮 Interactive 2-Player Games System

A real-time, AI-powered multiplayer games system for couples with seductive and intimate gameplay.

## 📁 Architecture

```
src/games/
├── components/          # React components
│   ├── GameLobby/      # Room creation & joining
│   ├── WaitingRoom/    # Pre-game lobby
│   ├── GameSelector/   # Game selection UI
│   └── GameBoard/      # Main game orchestrator
├── games/              # Individual game implementations
│   └── intimate-confessions/
│       └── GameUI.tsx
├── hooks/              # Custom React hooks
│   └── useSocket.ts    # Socket & game state management
├── services/           # Business logic
│   ├── socketService.ts      # WebSocket communication
│   ├── roomService.ts        # Room management
│   └── aiQuestionService.ts  # AI question generation
├── store/              # State management (future)
└── types/              # TypeScript definitions
    └── gameTypes.ts
```

## 🎯 Features

### ✅ Implemented
- **Room-based multiplayer** (2 players max)
- **Real-time synchronization** via Socket.IO
- **AI-powered question generation** with seductive content
- **5 Question categories**: Seductive, Spicy, Romantic, Playful, Deep
- **Intimate Confessions game** - Share desires and secrets
- **Responsive UI** with gradient animations
- **Room codes** for easy joining
- **Player roles** (Owner/Guest)
- **Error handling** & reconnection support

### 🎮 Games Available
1. **Intimate Confessions** 💋 - Share deepest desires (IMPLEMENTED)
2. Truth or Dare 🔥 - Classic with seductive twist
3. Would You Rather 💕 - Choose between intimate scenarios
4. Couple Quiz ❤️ - Test your knowledge
5. Rapid Fire ⚡ - Quick intimate questions

## 🚀 Quick Start

### 1. Access the Games
Navigate to: `http://localhost:3000/games`

### 2. Enter Your Name
Both players enter their names

### 3. Create or Join Room
- **Player 1**: Click "Create Room" → Share 6-digit code
- **Player 2**: Click "Join Room" → Enter code

### 4. Select Game
Room owner selects a game from the list

### 5. Play!
Answer questions, share confessions, and connect

## 🔧 Technical Implementation

### Socket Events

**Client → Server:**
```javascript
game:create-room        // Create new game room
game:join-room          // Join existing room
game:select-game        // Choose game type
game:request-question   // Get AI question
game:submit-answer      // Submit player answer
game:next-round         // Move to next question
game:leave-room         // Exit room
```

**Server → Client:**
```javascript
game:room-updated       // Room state changed
game:question-received  // New question available
game:answer-received    // Player submitted answer
game:error             // Error occurred
```

### AI Question Generation

The system uses OpenAI GPT-3.5 to generate dynamic, seductive questions:

```typescript
// Example request
{
  gameType: 'intimate-confessions',
  category: 'seductive',
  playerNames: ['Alex', 'Jordan'],
  previousQuestions: [...]
}

// Example response
{
  question: "What's your biggest turn-on that you've never told your partner?",
  category: 'seductive',
  type: 'confession'
}
```

**Fallback System**: If AI is unavailable, uses curated seductive questions.

### Room Management

- Rooms auto-cleanup after 2 hours of inactivity
- Max 2 players per room
- Owner controls game selection
- Automatic owner transfer if owner leaves

## 🎨 UI/UX Flow

```
Enter Name → Lobby → Create/Join Room → Waiting Room 
→ Game Selection → Gameplay → Results → Next Round
```

## 📝 Adding New Games

Create a new game in 3 steps:

### 1. Create Game Folder
```
src/games/games/your-game/
├── GameUI.tsx      # React component
├── GameLogic.ts    # Game rules
└── types.ts        # Game-specific types
```

### 2. Add to GameSelector
```typescript
// src/games/components/GameSelector/index.tsx
{
  type: 'your-game',
  title: 'Your Game',
  description: 'Description',
  icon: '🎯',
  color: 'from-blue-500 to-cyan-500'
}
```

### 3. Add to GameBoard Router
```typescript
// src/games/components/GameBoard/index.tsx
if (room.gameType === 'your-game') {
  return <YourGame room={room} playerId={playerId} />;
}
```

## 🔐 Environment Variables

Add to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎭 Question Categories

### Seductive 🔥
Highly intimate, creates physical desire and sexual tension

### Spicy 🌶️
Flirtatious and bold, explores fantasies

### Romantic 💕
Sweet and loving, builds emotional connection

### Playful 😏
Teasing and fun, lighthearted intimacy

### Deep 💭
Emotionally vulnerable, explores needs and fears

## 🛠️ Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.IO
- **AI**: OpenAI GPT-3.5 Turbo
- **Real-time**: WebSockets

## 📊 Performance

- Real-time latency: <100ms
- AI question generation: 1-3 seconds
- Fallback questions: Instant
- Room capacity: 2 players (optimized for couples)

## 🐛 Troubleshooting

### Socket not connecting
- Check server is running: `npm run dev`
- Verify port 3000 is available
- Check browser console for errors

### AI questions not generating
- Verify `OPENAI_API_KEY` in `.env.local`
- System will use fallback questions automatically

### Room not found
- Room codes expire after 2 hours
- Create a new room

## 🚀 Future Enhancements

- [ ] Implement remaining 4 games
- [ ] Add scoring system
- [ ] Game history & statistics
- [ ] Custom question creation
- [ ] Voice messages
- [ ] Photo sharing in confessions
- [ ] Timed challenges
- [ ] Achievement system
- [ ] Private game modes

## 📞 Support

For issues or questions about the games system, check:
1. Browser console for errors
2. Server logs for socket events
3. Network tab for API calls

## 🎉 Have Fun!

This system is designed to bring couples closer through playful, intimate, and seductive gameplay. Enjoy exploring each other's desires! 💕
