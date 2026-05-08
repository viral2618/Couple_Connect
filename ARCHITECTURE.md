# 🏗️ Couple Connect - Architecture Diagram

## Development Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR COMPUTER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐         ┌─────────────────────────┐   │
│  │   Frontend (Port 3000)  │         │  Backend (Port 4000)    │   │
│  │  ─────────────────────  │         │  ──────────────────────  │   │
│  │                         │         │                         │   │
│  │  📱 Next.js App         │         │  🚀 Express Server      │   │
│  │  ├── Pages              │         │  ├── REST API           │   │
│  │  ├── Components         │         │  ├── Socket.IO          │   │
│  │  ├── Game UI            │◄────────┤  ├── Game Rooms         │   │
│  │  └── Socket Client      │  HTTP   │  ├── Real-time Sync     │   │
│  │                         │  WS     │  └── Game Logic         │   │
│  │  http://localhost:3000  │         │  http://localhost:4000  │   │
│  └─────────────────────────┘         └─────────────────────────┘   │
│              │                                    │                  │
│              │                                    │                  │
│              └────────────────┬───────────────────┘                  │
│                               │                                      │
│                               ▼                                      │
│                    ┌─────────────────────┐                          │
│                    │   MongoDB Atlas     │                          │
│                    │   (Cloud Database)  │                          │
│                    └─────────────────────┘                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Communication Flow

```
┌──────────────┐                                    ┌──────────────┐
│   Player 1   │                                    │   Player 2   │
│   Browser    │                                    │   Browser    │
└──────┬───────┘                                    └──────┬───────┘
       │                                                   │
       │ HTTP/WS                                    HTTP/WS│
       │                                                   │
       ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Game UI   │  │   Chat     │  │   Video    │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │               │               │                         │
│        └───────────────┴───────────────┘                         │
│                        │                                         │
│                Socket.IO Client                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ WebSocket Connection
                         │ (http://localhost:4000)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Port 4000)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Socket.IO Server                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ Game Rooms │  │   Chat     │  │   Video    │         │  │
│  │  │  Manager   │  │  Messages  │  │ Signaling  │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Game Engine                            │  │
│  │  ├── Room Creation & Joining                             │  │
│  │  ├── Player Management                                    │  │
│  │  ├── Game State Synchronization                          │  │
│  │  ├── Score Tracking                                       │  │
│  │  └── Real-time Events                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  MongoDB Atlas  │
                  │  ├── Users      │
                  │  ├── Messages   │
                  │  └── Game Data  │
                  └─────────────────┘
```

## Game Room Flow

```
Player 1 (Host)                Backend                Player 2 (Guest)
─────────────────────────────────────────────────────────────────────

1. Create Room
   │
   ├──create_room──────────►  Generate Room Code
   │                          Store Room Data
   │                          roomCode: "ABC123"
   │◄─────room_created────────┤
   │
   │                          [Waiting for Player 2...]
   │                                                    │
   │                                                    2. Join Room
   │                                                    │
   │                          ◄──join_room──────────────┤
   │                          Add Player to Room        │
   │                          Update Room State         │
   │◄─────room-update─────────┤                        │
   │                          ├──────room_joined───────►│
   │                                                    │
3. Select Game                                         │
   │                                                    │
   ├──select-game──────────► Update Game Type          │
   │                          Broadcast to All          │
   │◄─────room-update─────────┤                        │
   │                          ├──────room-update───────►│
   │                                                    │
4. Play Game                                           │
   │                                                    │
   ├──submit-answer─────────► Process Answer           │
   │                          Update Scores             │
   │◄─────room-update─────────┤                        │
   │                          ├──────room-update───────►│
   │                                                    │
   │                          ◄──submit-answer──────────┤
   │                          Process Answer            │
   │                          Update Scores             │
   │◄─────room-update─────────┤                        │
   │                          ├──────room-update───────►│
   │                                                    │
5. Game Complete                                       │
   │                                                    │
   │◄─────game-complete───────┤                        │
   │                          ├──────game-complete─────►│
   │                          Show Final Scores         │
```

## Production Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Nginx / CDN    │
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │  Frontend Server    │   │  Backend Server     │
    │  yourdomain.com     │   │  api.yourdomain.com │
    │  ─────────────────  │   │  ──────────────────  │
    │                     │   │                     │
    │  Next.js (Port 80)  │   │  Express (Port 80)  │
    │  Static Assets      │   │  Socket.IO          │
    │  SSR Pages          │   │  Game Engine        │
    └─────────────────────┘   └──────────┬──────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   MongoDB Atlas     │
                              │   (Managed DB)      │
                              └─────────────────────┘
```

## Monorepo Structure

```
couple-connect/
│
├── apps/
│   ├── web/                    ← Frontend Application
│   │   ├── src/
│   │   │   ├── app/           ← Next.js Pages & API Routes
│   │   │   ├── components/    ← React Components
│   │   │   ├── games/         ← Game UI & Logic
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/     ← useSocket, useGameState
│   │   │   │   ├── services/  ← socketService
│   │   │   │   └── types/
│   │   │   └── lib/
│   │   ├── public/
│   │   ├── .env               ← NEXT_PUBLIC_SOCKET_URL
│   │   └── package.json
│   │
│   └── api/                    ← Backend Application
│       ├── src/
│       │   └── server.js      ← Express + Socket.IO
│       │                       ├── Room Management
│       │                       ├── Game Logic
│       │                       └── Real-time Sync
│       ├── .env               ← PORT, ALLOWED_ORIGINS
│       └── package.json
│
├── packages/
│   ├── database/              ← Shared Database
│   │   ├── schema.prisma
│   │   └── package.json
│   │
│   ├── shared/                ← Shared Types
│   │   └── src/
│   │       └── types.ts
│   │
│   └── ui/                    ← Shared Components
│       └── src/
│
├── package.json               ← Root Workspace Config
├── QUICKSTART.md             ← This guide!
├── GAME_BACKEND_SETUP.md     ← Detailed setup
└── MONOREPO_SETUP.md         ← Monorepo info
```

## Key Features

### ✅ Real-time Synchronization
- Socket.IO for instant updates
- Room-based communication
- Automatic reconnection

### ✅ Scalable Architecture
- Frontend and backend can scale independently
- Stateless backend (rooms in memory)
- Can add Redis for persistence

### ✅ Production Ready
- CORS configured
- Environment-based configuration
- Health check endpoints
- Error handling

### ✅ Developer Friendly
- Hot reload on both servers
- Clear separation of concerns
- TypeScript support
- Shared packages

## Port Configuration

| Service  | Development | Production |
|----------|-------------|------------|
| Frontend | 3000        | 80/443     |
| Backend  | 4000        | 80/443     |
| MongoDB  | Cloud       | Cloud      |

## Environment Variables Summary

### Frontend (.env)
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (.env)
```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=mongodb+srv://...
```

## 🎯 Benefits

1. **Separation of Concerns**
   - UI logic in frontend
   - Game logic in backend

2. **Better Performance**
   - Dedicated server for real-time features
   - No blocking of Next.js server

3. **Easy Deployment**
   - Deploy frontend and backend separately
   - Scale independently

4. **Better Debugging**
   - Clear logs for each service
   - Isolated error tracking

5. **Production Ready**
   - Can use different servers
   - Easy to add load balancing
   - CDN for static assets

---

**Ready to start?** Run `npm run dev` and both servers will start! 🚀
