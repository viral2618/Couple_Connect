# 🎮 Getting Started - Visual Guide

## 🚀 3 Simple Steps to Run Your App

### Step 1: Install & Setup (One Time Only)

```bash
# 1. Install all dependencies
npm install

# 2. Generate database client
npm run db:generate
```

**What this does:**
- ✅ Installs all packages for frontend and backend
- ✅ Sets up Prisma database client
- ✅ Prepares everything for development

---

### Step 2: Start the Servers

```bash
# Start both frontend and backend together
npm run dev
```

**You should see:**
```
> Server ready on http://localhost:4000
> Game server integrated on same port
> Ready on http://localhost:3000
```

**What's running:**
- ✅ Backend API on **http://localhost:4000**
- ✅ Frontend App on **http://localhost:3000**

---

### Step 3: Test It!

#### Option A: Quick Test (Automated)
```bash
npm run test:setup
```

**Expected output:**
```
🔍 Couple Connect - Backend Verification

📡 Test 1: Checking Backend Server (Port 4000)...
✅ Backend server is running!

📡 Test 2: Checking Frontend Server (Port 3000)...
✅ Frontend server is running!

📡 Test 3: Checking Environment Configuration...
✅ Frontend .env file exists
✅ Backend .env file exists

🎉 All checks passed! Your setup is ready!
```

#### Option B: Manual Test

1. **Open your browser:** http://localhost:3000

2. **Go to Games page**

3. **Open browser console** (Press F12)

4. **Look for these messages:**
   ```
   🔌 Connecting to game server: http://localhost:4000
   ✅ Game socket connected: xyz123
   ```

5. **Create a room:**
   - Click "Create Room"
   - You'll get a code like "ABC123"

6. **Join from another window:**
   - Open a new browser window
   - Go to http://localhost:3000/games
   - Click "Join Room"
   - Enter the code
   - Both players should see each other!

---

## 🎯 Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│                  YOUR BROWSER                            │
│              http://localhost:3000                       │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │         Couple Connect App                 │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │        │
│  │  │  Home    │  │  Chat    │  │  Games   │ │        │
│  │  └──────────┘  └──────────┘  └──────────┘ │        │
│  └────────────────────────────────────────────┘        │
│                       │                                  │
│                       │ Socket.IO                        │
│                       ▼                                  │
└─────────────────────────────────────────────────────────┘
                        │
                        │ WebSocket
                        │ http://localhost:4000
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Port 4000)                  │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │         Game Engine                        │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │        │
│  │  │  Rooms   │  │  Players │  │  Scores  │ │        │
│  │  └──────────┘  └──────────┘  └──────────┘ │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎮 Game Flow Example

### Creating and Joining a Room

```
Player 1 (You)                          Player 2 (Friend)
─────────────────────────────────────────────────────────

1. Open http://localhost:3000
   Go to Games page
   Click "Create Room"
   
   ✅ Room created: ABC123
   
   [Waiting for player...]
                                        2. Open http://localhost:3000
                                           Go to Games page
                                           Click "Join Room"
                                           Enter: ABC123
                                           
                                           ✅ Joined room!

3. See Player 2 join!                  4. See Player 1 (host)!

   [Both players ready]                   [Both players ready]

5. Select a game                       6. Game appears automatically
   (e.g., Truth or Dare)
   
   ✅ Game started!                       ✅ Game started!

7. Play together in real-time! 🎉
```

---

## 📁 Project Structure (Simplified)

```
couple-connect/
│
├── apps/
│   ├── web/              ← Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/     ← Your pages
│   │   │   └── games/   ← Game UI
│   │   └── .env         ← Config
│   │
│   └── api/              ← Backend (Port 4000)
│       ├── src/
│       │   └── server.js ← Game logic
│       └── .env         ← Config
│
└── package.json          ← Run commands here
```

---

## 🔧 Common Commands

```bash
# Start everything
npm run dev

# Start only frontend
npm run dev:web

# Start only backend
npm run dev:api

# Test setup
npm run test:setup

# Build for production
npm run build
```

---

## ❓ Troubleshooting

### "Cannot connect to game server"

**Problem:** Backend not running

**Solution:**
```bash
# Check if backend is running
curl http://localhost:4000/health

# If not, start it
npm run dev:api
```

---

### "Port already in use"

**Problem:** Port 3000 or 4000 is busy

**Solution:**
```bash
# Kill process on port 4000
npx kill-port 4000

# Kill process on port 3000
npx kill-port 3000

# Then restart
npm run dev
```

---

### "CORS Error"

**Problem:** Backend not allowing frontend

**Solution:**
1. Check `apps/api/.env`
2. Make sure it has:
   ```
   ALLOWED_ORIGINS=http://localhost:3000
   ```
3. Restart backend: `npm run dev:api`

---

### "Socket not connecting"

**Problem:** Wrong socket URL

**Solution:**
1. Check `apps/web/.env`
2. Make sure it has:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
   ```
3. Restart frontend: `npm run dev:web`

---

## ✅ Success Checklist

Before you start developing, make sure:

- [ ] Both servers are running (3000 and 4000)
- [ ] No errors in terminal
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:4000/health
- [ ] Browser console shows socket connected
- [ ] Can create and join game rooms
- [ ] Both players see each other in room

**All checked?** You're ready to code! 🚀

---

## 📚 More Help

- **Quick start:** [QUICKSTART.md](QUICKSTART.md)
- **Detailed setup:** [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Full checklist:** [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)
- **What changed:** [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)

---

## 🎉 That's It!

You now have:
- ✅ Frontend running on port 3000
- ✅ Backend running on port 4000
- ✅ Real-time game synchronization
- ✅ Professional architecture

**Start coding and have fun!** 🎊
