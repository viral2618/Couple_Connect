# ✅ Couple Connect - Monorepo with Separate Game Backend

## 🎉 What's Been Set Up

Your Couple Connect app now has a **professional monorepo structure** with a **separate game backend server** for optimal performance!

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MONOREPO                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Port 3000)          Backend (Port 4000)      │
│  ├── Next.js                   ├── Express              │
│  ├── React UI                  ├── Socket.IO            │
│  ├── Game Components           ├── Game Rooms           │
│  └── Socket Client ────────────┼──> Game Logic          │
│                                 └── Real-time Sync       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔧 What Changed

### 1. Environment Configuration

**apps/web/.env** - Frontend connects to backend
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000  ← Points to API server
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**apps/api/.env** - Backend runs on separate port
```env
PORT=4000  ← Changed from 3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 2. Socket Service Updated

**apps/web/src/games/services/socketService.ts**
```typescript
// Now connects to separate backend server
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
this.socket = io(socketUrl, { ... });
```

### 3. API Server CORS

**apps/api/src/server.js**
```javascript
// Configured to accept connections from frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
```

## 🚀 How to Run

### Quick Start (Recommended)

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start both servers
npm run dev
```

This starts:
- ✅ Frontend on http://localhost:3000
- ✅ Backend on http://localhost:4000

### Individual Servers

```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend
npm run dev:web
```

## ✅ Verification Steps

### 1. Check Backend Health
```bash
curl http://localhost:4000/health
```
Expected: `{"status":"OK","timestamp":"..."}`

### 2. Check Frontend
Open: http://localhost:3000

### 3. Test Game Connection
1. Go to Games page
2. Open browser console (F12)
3. Look for:
   ```
   🔌 Connecting to game server: http://localhost:4000
   ✅ Game socket connected: xyz123
   ```

### 4. Test Game Room
1. Click "Create Room"
2. Get room code (e.g., "ABC123")
3. Open another browser window
4. Join with the code
5. Both players should see each other instantly!

## 📁 File Structure

```
couple-connect/
├── apps/
│   ├── web/                    ← Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── games/         ← Game UI
│   │   │   │   ├── services/
│   │   │   │   │   └── socketService.ts  ← Updated!
│   │   │   │   └── hooks/
│   │   │   │       └── useSocket.ts
│   │   │   └── ...
│   │   └── .env               ← Updated!
│   │
│   └── api/                    ← Backend (Port 4000)
│       ├── src/
│       │   └── server.js      ← Updated!
│       └── .env               ← Updated!
│
└── packages/
    └── database/              ← Shared Prisma
```

## 🎯 Key Benefits

### ✅ Better Performance
- Dedicated server for real-time game features
- No blocking of Next.js server
- Faster response times

### ✅ Scalability
- Scale frontend and backend independently
- Deploy to different servers if needed
- Easy to add load balancing

### ✅ Clean Architecture
- Clear separation: UI vs Logic
- Easier to maintain and debug
- Professional structure

### ✅ Production Ready
- Can deploy to separate servers
- Easy to configure for different environments
- CORS properly configured

## 🌐 Production Deployment

### Update Environment Variables

**Frontend (apps/web/.env.production)**
```env
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Backend (apps/api/.env.production)**
```env
PORT=4000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

### Deployment Options

#### Option 1: Same Server
```
Server (Your VPS/Cloud)
├── Frontend: Port 3000
├── Backend: Port 4000
└── Nginx: Routes traffic
```

#### Option 2: Separate Servers
```
Server 1 (Frontend)
└── yourdomain.com → Port 3000

Server 2 (Backend)
└── api.yourdomain.com → Port 4000
```

## 🔥 Common Commands

```bash
# Development
npm run dev              # Run both servers
npm run dev:web          # Run only frontend
npm run dev:api          # Run only backend

# Build
npm run build            # Build everything
npm run build:web        # Build frontend
npm run build:api        # Build backend

# Production
npm run start:web        # Start frontend
npm run start:api        # Start backend

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB
npm run db:migrate       # Run migrations
```

## 🐛 Troubleshooting

### "Cannot connect to game server"
```bash
# Check if backend is running
curl http://localhost:4000/health

# Restart backend
npm run dev:api
```

### "CORS Error"
- Check `ALLOWED_ORIGINS` in `apps/api/.env`
- Make sure it includes `http://localhost:3000`
- Restart backend server

### "Port already in use"
```bash
# Kill process on port 4000
npx kill-port 4000

# Or change port in apps/api/.env
PORT=5000
```

### Game not syncing between players
- Check browser console for socket connection
- Verify both players are in the same room
- Check backend logs for errors

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)** - Detailed game setup
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture diagrams
- **[MONOREPO_SETUP.md](MONOREPO_SETUP.md)** - Monorepo structure
- **[README.md](README.md)** - Production deployment

## 🎮 Game Features Working

✅ **Room Management**
- Create rooms with unique codes
- Join rooms by code
- Real-time player sync

✅ **Game Selection**
- Multiple game types
- Synchronized game state
- Turn-based gameplay

✅ **Real-time Updates**
- Instant score updates
- Live player actions
- Automatic reconnection

✅ **Chat & Video**
- Real-time messaging
- Video calling support
- All on same backend

## 🔐 Security

✅ CORS configured properly
✅ Environment variables for secrets
✅ Separate development/production configs
✅ Input validation on backend
✅ Rate limiting ready to add

## 📊 Performance

✅ Dedicated backend for real-time features
✅ WebSocket for instant communication
✅ Efficient room management
✅ Automatic cleanup on disconnect
✅ Ready for horizontal scaling

## 🎉 You're All Set!

Your Couple Connect app now has:
- ✅ Professional monorepo structure
- ✅ Separate game backend server
- ✅ Real-time synchronization
- ✅ Production-ready architecture
- ✅ Easy to scale and deploy

### Next Steps

1. **Test it out:**
   ```bash
   npm run dev
   ```

2. **Create a game room** and test with two browser windows

3. **Deploy to production** when ready

4. **Scale as needed** - frontend and backend independently

---

**Need help?** Check the documentation files or the troubleshooting section above!

**Ready to code?** Run `npm run dev` and start building! 🚀
