# 🎮 Game Backend Configuration - Monorepo Setup

## ✅ Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MONOREPO STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  apps/web (Port 3000)          apps/api (Port 4000)        │
│  ├── Next.js Frontend          ├── Express Server          │
│  ├── React Components          ├── Socket.IO Server        │
│  ├── Game UI                   ├── Game Room Logic         │
│  └── Socket Client ────────────┼──> Game Events            │
│                                 └── Real-time Sync          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Steps

### 1. Update API Server Port

**File:** `apps/api/.env`

```env
# Change port to avoid conflict with Next.js
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect"

# JWT & Session
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SESSION_SECRET="your-super-secret-session-key-change-this-too"

# CORS - Allow web app to connect
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

### 2. Update Web App Environment

**File:** `apps/web/.env`

```env
# Keep existing settings...

# Game Backend Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000

# For production
# NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Update Socket Service

**File:** `apps/web/src/games/services/socketService.ts`

Update the `connect()` method:

```typescript
connect(): Socket {
  if (this.socket?.connected) {
    console.log('✅ Socket already connected');
    return this.socket;
  }

  // Get socket URL from environment
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
  
  console.log('🔌 Connecting to game server:', socketUrl);
  this.socket = io(socketUrl, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: this.maxReconnectAttempts,
    reconnectionDelay: 500,
    timeout: 5000
  });

  // ... rest of the code
}
```

### 4. Update API Server CORS

**File:** `apps/api/src/server.js`

Update CORS configuration:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});
```

## 🚀 Running the Monorepo

### Development Mode

```bash
# Terminal 1 - Run API Server
cd apps/api
npm run dev
# Server runs on http://localhost:4000

# Terminal 2 - Run Web App
cd apps/web
npm run dev
# App runs on http://localhost:3000
```

### Or use root scripts:

```bash
# Run both simultaneously
npm run dev

# Or individually
npm run dev:api   # Port 4000
npm run dev:web   # Port 3000
```

## ✅ Verification Checklist

### 1. Check API Server
```bash
curl http://localhost:4000/health
# Should return: {"status":"OK","timestamp":"..."}
```

### 2. Check Socket Connection
Open browser console on `http://localhost:3000`:
```
✅ Game socket connected: <socket-id>
```

### 3. Test Game Room Creation
- Go to Games page
- Click "Create Room"
- Check console for:
  ```
  🔌 Connecting to game server: http://localhost:4000
  ✅ Game socket connected: xyz123
  📤 Emitting create_room
  ✅ Room created: ABC123
  ```

## 🌐 Production Deployment

### Option 1: Same Server, Different Ports

**Nginx Configuration:**
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4000;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Production Environment:**
```env
# apps/web/.env.production
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# apps/api/.env.production
PORT=4000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Option 2: Separate Servers

**Web Server (Server 1):**
```env
NEXT_PUBLIC_SOCKET_URL=https://game-api.yourdomain.com
NEXT_PUBLIC_API_URL=https://game-api.yourdomain.com
```

**API Server (Server 2):**
```env
PORT=4000
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🔥 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Check `ALLOWED_ORIGINS` in `apps/api/.env`
- Ensure web app URL is included
- Restart API server

### Issue 2: Socket Connection Failed
```
❌ Socket connection error: timeout
```

**Solution:**
- Verify API server is running: `curl http://localhost:4000/health`
- Check `NEXT_PUBLIC_SOCKET_URL` in web app
- Check firewall/port settings

### Issue 3: Game Events Not Syncing
```
⚠️ Socket not connected, room will be created locally
```

**Solution:**
- Open browser DevTools → Network → WS tab
- Look for socket.io connection
- Check console for connection status
- Verify socket URL is correct

## 📊 Testing the Setup

### 1. Start Both Servers
```bash
# Terminal 1
cd apps/api && npm run dev

# Terminal 2  
cd apps/web && npm run dev
```

### 2. Open Two Browser Windows
- Window 1: `http://localhost:3000` (Player 1)
- Window 2: `http://localhost:3000` (Player 2)

### 3. Test Game Flow
1. Player 1: Create Room → Get room code
2. Player 2: Join Room → Enter code
3. Both players should see each other
4. Select a game → Both should sync
5. Play game → Scores should sync

### 4. Check Console Logs

**API Server Console:**
```
> Server ready on http://localhost:4000
> Game server integrated on same port
User connected: xyz123
Create room request: { playerName: 'Player1' }
Room created: ABC123 by Player1
Join room request: { roomCode: 'ABC123', playerName: 'Player2' }
Player Player2 joined room: ABC123
```

**Browser Console:**
```
🔌 Connecting to game server: http://localhost:4000
✅ Game socket connected: xyz123
📤 Emitting create_room
✅ Room updated received: { code: 'ABC123', players: 2 }
```

## 🎯 Benefits of This Setup

✅ **Separation of Concerns**
- Frontend handles UI/UX
- Backend handles game logic & real-time sync

✅ **Independent Scaling**
- Scale web and API servers separately
- Deploy independently

✅ **Better Performance**
- API server dedicated to real-time operations
- No blocking of Next.js server

✅ **Easier Debugging**
- Clear separation of logs
- Isolated error tracking

✅ **Production Ready**
- Can deploy to different servers
- Easy to add load balancing

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start development (both servers)
npm run dev

# Or start individually
npm run dev:api  # Port 4000
npm run dev:web  # Port 3000

# Build for production
npm run build

# Start production
npm run start:api
npm run start:web
```

## 📝 Summary

Your game system now works perfectly with:
- ✅ Separate backend server (Port 4000)
- ✅ Frontend connects to backend via Socket.IO
- ✅ Real-time game synchronization
- ✅ Room management on backend
- ✅ Production-ready architecture
- ✅ Easy to scale and deploy

The monorepo structure keeps everything organized while allowing independent deployment! 🎉
