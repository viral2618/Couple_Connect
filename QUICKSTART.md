# 🚀 Quick Start - Couple Connect Monorepo

## ✅ What's Changed?

Your game backend now runs on a **separate server** for better performance and scalability!

```
Frontend (Port 3000) ←→ Backend API (Port 4000)
     ↓                         ↓
  Next.js                 Express + Socket.IO
  React UI                Game Logic & Sync
```

## 📦 Installation

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run db:generate
```

## 🎮 Running Development

### Option 1: Run Both Servers Together (Recommended)

```bash
npm run dev
```

This starts:
- ✅ Web App on `http://localhost:3000`
- ✅ API Server on `http://localhost:4000`

### Option 2: Run Separately

```bash
# Terminal 1 - API Server
npm run dev:api
# Runs on http://localhost:4000

# Terminal 2 - Web App
npm run dev:web
# Runs on http://localhost:3000
```

## ✅ Verify It's Working

### 1. Check API Server
Open: http://localhost:4000/health

Should see:
```json
{"status":"OK","timestamp":"2024-..."}
```

### 2. Check Web App
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
2. Console should show:
   ```
   📤 Emitting create_room
   ✅ Room created: ABC123
   ```
3. Open another browser window
4. Join the room with the code
5. Both players should see each other!

## 🏗️ Build for Production

```bash
# Build everything
npm run build

# Or build individually
npm run build:web
npm run build:api
```

## 🚀 Start Production

```bash
# Start API server
npm run start:api

# Start web app (in another terminal)
npm run start:web
```

## 🔧 Environment Variables

### Web App (apps/web/.env)
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### API Server (apps/api/.env)
```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🌐 Production Deployment

### Update Environment Variables

**Web App:**
```env
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**API Server:**
```env
PORT=4000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Deploy Options

#### Option 1: Same Server
- Web on port 3000
- API on port 4000
- Use Nginx to route traffic

#### Option 2: Separate Servers
- Web on Server 1
- API on Server 2
- Update CORS and URLs accordingly

## 🐛 Troubleshooting

### "Cannot connect to game server"
```bash
# Check if API server is running
curl http://localhost:4000/health

# Restart API server
npm run dev:api
```

### "CORS Error"
- Check `ALLOWED_ORIGINS` in `apps/api/.env`
- Make sure it includes your web app URL
- Restart API server

### "Port already in use"
```bash
# Kill process on port 4000
npx kill-port 4000

# Or change port in apps/api/.env
PORT=5000
```

## 📁 Project Structure

```
couple-connect/
├── apps/
│   ├── web/              ← Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/      ← Pages
│   │   │   ├── games/    ← Game UI
│   │   │   └── ...
│   │   └── .env          ← NEXT_PUBLIC_SOCKET_URL
│   │
│   └── api/              ← Backend (Port 4000)
│       ├── src/
│       │   └── server.js ← Game Logic
│       └── .env          ← PORT, ALLOWED_ORIGINS
│
└── packages/
    └── database/         ← Shared Prisma
```

## 🎯 Key Benefits

✅ **Better Performance** - Dedicated server for real-time features
✅ **Easy Scaling** - Scale frontend and backend independently
✅ **Clear Separation** - Frontend UI vs Backend logic
✅ **Production Ready** - Can deploy to different servers
✅ **Better Debugging** - Separate logs for each service

## 📚 More Info

- Full setup guide: [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)
- Monorepo structure: [MONOREPO_SETUP.md](MONOREPO_SETUP.md)
- Production deployment: [README.md](README.md)

## 🎉 You're Ready!

Run `npm run dev` and start building! 🚀

Your game system now works perfectly with a separate backend server!
