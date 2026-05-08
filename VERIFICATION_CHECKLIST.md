# ✅ Verification Checklist - Game Backend Setup

Use this checklist to verify your monorepo with separate game backend is working correctly.

## 📋 Pre-Flight Checks

- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] MongoDB connection string ready
- [ ] All dependencies installed (`npm install`)
- [ ] Prisma client generated (`npm run db:generate`)

## 🔧 Configuration Checks

### Frontend Configuration (apps/web/.env)
- [ ] `NEXT_PUBLIC_SOCKET_URL=http://localhost:4000` is set
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:4000` is set
- [ ] `DATABASE_URL` is configured
- [ ] All other required env vars are set

### Backend Configuration (apps/api/.env)
- [ ] `PORT=4000` is set
- [ ] `ALLOWED_ORIGINS` includes `http://localhost:3000`
- [ ] `DATABASE_URL` is configured
- [ ] `JWT_SECRET` is set
- [ ] `SESSION_SECRET` is set

## 🚀 Server Startup Checks

### Backend Server (Port 4000)
```bash
npm run dev:api
```

- [ ] Server starts without errors
- [ ] Console shows: `> Server ready on http://localhost:4000`
- [ ] Console shows: `> Game server integrated on same port`
- [ ] Health check works: `curl http://localhost:4000/health`
- [ ] Returns: `{"status":"OK","timestamp":"..."}`

### Frontend Server (Port 3000)
```bash
npm run dev:web
```

- [ ] Server starts without errors
- [ ] Console shows: `> Ready on http://localhost:3000`
- [ ] No compilation errors
- [ ] Can access http://localhost:3000

### Both Servers Together
```bash
npm run dev
```

- [ ] Both servers start
- [ ] Backend on port 4000
- [ ] Frontend on port 3000
- [ ] No port conflicts

## 🎮 Game Connection Checks

### Browser Console (http://localhost:3000)
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Navigate to Games page
- [ ] Look for: `🔌 Connecting to game server: http://localhost:4000`
- [ ] Should see: `✅ Game socket connected: <socket-id>`
- [ ] No connection errors

### Network Tab
- [ ] Open DevTools → Network → WS (WebSocket)
- [ ] Should see connection to `localhost:4000`
- [ ] Status: `101 Switching Protocols`
- [ ] Connection stays open (green indicator)

## 🎲 Game Room Functionality

### Create Room (Player 1)
- [ ] Click "Create Room" button
- [ ] Console shows: `📤 Emitting create_room`
- [ ] Console shows: `✅ Room created: <CODE>`
- [ ] Room code is displayed (e.g., "ABC123")
- [ ] Player name is shown
- [ ] "Waiting for player..." message appears

### Backend Logs (Terminal)
- [ ] Shows: `User connected: <socket-id>`
- [ ] Shows: `Create room request: { playerName: '...' }`
- [ ] Shows: `Room created: <CODE> by <NAME>`

### Join Room (Player 2)
Open a new browser window/tab:
- [ ] Navigate to http://localhost:3000/games
- [ ] Click "Join Room"
- [ ] Enter the room code from Player 1
- [ ] Console shows: `📤 Emitting join_room`
- [ ] Console shows: `✅ Room joined: <CODE>`
- [ ] Both players see each other

### Backend Logs
- [ ] Shows: `User connected: <socket-id>`
- [ ] Shows: `Join room request: { roomCode: '...', playerName: '...' }`
- [ ] Shows: `Player <NAME> joined room: <CODE>`

### Room Synchronization
- [ ] Player 1 sees Player 2 join
- [ ] Player 2 sees Player 1 as host
- [ ] Both see correct player count (2/2)
- [ ] Room status updates in real-time

## 🎯 Game Selection & Play

### Select Game
- [ ] Player 1 (host) selects a game
- [ ] Console shows: `🎯 Selecting game: <GAME_TYPE>`
- [ ] Both players see the game selection
- [ ] Game UI loads for both players

### Game Synchronization
- [ ] Questions/prompts appear for both players
- [ ] Answers sync between players
- [ ] Scores update in real-time
- [ ] Turn changes sync correctly

### Backend Logs
- [ ] Shows game selection events
- [ ] Shows answer submissions
- [ ] Shows score updates
- [ ] No errors in processing

## 🔄 Reconnection & Error Handling

### Disconnect Test
- [ ] Stop backend server (Ctrl+C)
- [ ] Frontend shows disconnection
- [ ] Restart backend server
- [ ] Frontend reconnects automatically
- [ ] Console shows: `✅ Game socket connected`

### Network Tab
- [ ] WebSocket shows reconnection attempts
- [ ] Successfully reconnects after server restart

## 🌐 CORS & Security

### CORS Headers
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:4000/health
```

- [ ] Returns CORS headers
- [ ] No CORS errors in browser console
- [ ] Requests from frontend succeed

## 📊 Performance Checks

### Response Times
- [ ] Health check responds < 100ms
- [ ] Socket connection establishes < 1s
- [ ] Room creation < 500ms
- [ ] Room join < 500ms
- [ ] Game events sync < 100ms

### Memory & CPU
- [ ] Backend memory usage stable
- [ ] Frontend memory usage stable
- [ ] No memory leaks after multiple games
- [ ] CPU usage reasonable

## 🐛 Error Scenarios

### Invalid Room Code
- [ ] Try joining with invalid code
- [ ] Shows error message
- [ ] Doesn't crash
- [ ] Can try again

### Full Room
- [ ] Try joining a full room (2/2 players)
- [ ] Shows "Room is full" error
- [ ] Handles gracefully

### Player Disconnect
- [ ] Player leaves room
- [ ] Other player sees disconnect
- [ ] Room updates correctly
- [ ] Can continue or restart

## 📱 Multi-Device Testing

### Two Different Browsers
- [ ] Chrome + Firefox
- [ ] Both can connect
- [ ] Game syncs correctly

### Two Different Devices
- [ ] Desktop + Mobile
- [ ] Both can connect
- [ ] Game syncs correctly
- [ ] Responsive UI works

## 🏗️ Production Readiness

### Environment Variables
- [ ] Production .env files created
- [ ] Secrets are different from development
- [ ] URLs point to production domains
- [ ] No hardcoded values

### Build Process
```bash
npm run build
```
- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] No build errors
- [ ] Optimized for production

### Start Production
```bash
npm run start:api
npm run start:web
```
- [ ] Both start in production mode
- [ ] No development warnings
- [ ] Performance is good

## 📝 Documentation

- [ ] README.md is up to date
- [ ] QUICKSTART.md is clear
- [ ] GAME_BACKEND_SETUP.md is complete
- [ ] ARCHITECTURE.md shows correct structure
- [ ] All env vars documented

## ✅ Final Verification

### Complete Game Flow
1. [ ] Start both servers
2. [ ] Player 1 creates room
3. [ ] Player 2 joins room
4. [ ] Select a game
5. [ ] Play complete game
6. [ ] Scores update correctly
7. [ ] Game completes successfully
8. [ ] Can start new game

### Console Logs Clean
- [ ] No errors in frontend console
- [ ] No errors in backend console
- [ ] Only expected log messages
- [ ] No warnings (except dev warnings)

### All Features Working
- [ ] Room creation ✅
- [ ] Room joining ✅
- [ ] Game selection ✅
- [ ] Game play ✅
- [ ] Score tracking ✅
- [ ] Real-time sync ✅
- [ ] Reconnection ✅
- [ ] Error handling ✅

## 🎉 Success Criteria

If all items above are checked, your setup is complete and working! 🚀

### What You Have Now:
✅ Professional monorepo structure
✅ Separate game backend server
✅ Real-time synchronization working
✅ Production-ready architecture
✅ Scalable and maintainable code

### Ready for:
✅ Development
✅ Testing
✅ Production deployment
✅ Scaling

---

**All checks passed?** Congratulations! Your Couple Connect app with separate game backend is ready! 🎊

**Some checks failed?** See [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md) troubleshooting section.
