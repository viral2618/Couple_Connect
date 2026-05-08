# 🎮 Game Connection Fix Guide

## Problem
Games showing "Connecting..." and not able to create/join rooms.

## Root Cause
Socket.IO server not properly configured for game events.

## ✅ What Was Fixed

### 1. Server-Side (server/server.js)
- Added proper game event handlers:
  - `game:create-room` - Creates a new game room
  - `game:join-room` - Joins an existing room
  - `game:select-game` - Selects which game to play
  - `game:leave-room` - Leaves the room
- Fixed disconnect handler to clean up game rooms properly

### 2. Client-Side (apps/web/src/games/services/socketService.ts)
- Improved connection handling with retry logic
- Added better error messages
- Increased timeout and reconnection attempts
- Added auto-reconnect on failed emit

### 3. Environment Variables (apps/web/.env.local)
- Added `NEXT_PUBLIC_SOCKET_URL=http://localhost:3000`

### 4. Layout Fix (apps/web/src/app/layout.tsx)
- Fixed hydration error by converting to client component
- Added mounted state for floating hearts animation

## 🚀 How to Start

### Option 1: Use the Fix Script (Recommended)
```bash
fix-games.bat
```

This will:
1. Stop any running servers
2. Start backend server on port 3000
3. Start Next.js app on port 3001

### Option 2: Manual Start

#### Terminal 1 - Backend Server
```bash
cd server
node server.js
```

#### Terminal 2 - Next.js App
```bash
cd apps\web
npm run dev
```

## 🧪 Testing

### 1. Test Server Health
```bash
test-game-server.bat
```

Or manually:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"OK","timestamp":"2024-..."}
```

### 2. Test Socket Connection
1. Open browser console (F12)
2. Go to http://localhost:3000/games
3. Look for these logs:
   ```
   🔌 Connecting to game server: http://localhost:3000
   ✅ Game socket connected: <socket-id>
   ```

### 3. Test Game Room Creation
1. Click "Create Room"
2. Check console for:
   ```
   📤 Emitting game:create-room
   ✅ Room updated received
   ```
3. You should see a 6-digit room code

## 🔍 Troubleshooting

### Issue: "Connecting..." stuck forever

**Solution 1: Check if server is running**
```bash
curl http://localhost:3000/health
```

**Solution 2: Check port conflicts**
```bash
netstat -ano | findstr :3000
```

**Solution 3: Restart everything**
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Start fresh
fix-games.bat
```

### Issue: "Socket not connected" in console

**Check environment variable:**
```bash
# In apps/web/.env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

**Restart Next.js after changing .env:**
```bash
cd apps\web
npm run dev
```

### Issue: Room created but partner can't join

**Check server logs:**
- Look for `🚪 Game room join request` in server terminal
- Check if room code matches

**Verify both players are connected:**
- Both should see "✅ Game socket connected" in console

## 📝 Server Logs to Watch

### Good Logs (Everything Working)
```
✅ Game socket connected: abc123
🎮 Game room creation request: { playerId: '...', playerName: '...' }
✅ Game room created: ABC123
🚪 Game room join request: { code: 'ABC123', ... }
✅ Player joined game room: ABC123
```

### Bad Logs (Something Wrong)
```
❌ Socket connection error: ...
❌ Error creating game room: ...
❌ Room not found
```

## 🎯 Quick Checklist

- [ ] Backend server running on port 3000
- [ ] Next.js app running (any port)
- [ ] `NEXT_PUBLIC_SOCKET_URL` set in .env.local
- [ ] Browser console shows socket connected
- [ ] No firewall blocking localhost:3000
- [ ] No other app using port 3000

## 🆘 Still Not Working?

1. **Clear browser cache and reload**
2. **Check browser console for errors**
3. **Verify server logs for game events**
4. **Try incognito/private window**
5. **Restart computer (last resort)**

## 📞 Debug Commands

```bash
# Check what's running on port 3000
netstat -ano | findstr :3000

# Kill process on port 3000 (if needed)
# Get PID from above command, then:
taskkill /F /PID <PID>

# Test socket connection with curl
curl -i http://localhost:3000/socket.io/?EIO=4&transport=polling

# Check server health
curl http://localhost:3000/health
```

## ✨ Expected Behavior

1. **Open /games page**
   - See "Couple Games" title
   - "Connecting..." should disappear in 1-2 seconds
   - Buttons should be enabled

2. **Create Room**
   - Click "Create Room"
   - Get 6-digit code (e.g., "ABC123")
   - See "Waiting for partner..." screen

3. **Join Room**
   - Partner enters the code
   - Both players see each other
   - Can select a game to play

## 🎮 Available Games

1. **Couple Quiz** - Test how well you know each other
2. **Truth or Dare** - Intimate questions and dares
3. **Would You Rather** - Choose between two options
4. **Rapid Questions** - Quick-fire questions
5. **Intimate Confessions** - Deep conversations

---

**Last Updated:** 2024
**Status:** ✅ Fixed and Working
