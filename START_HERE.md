# 🎮 Couple Connect - Monorepo

A Next.js application for couples with real-time chat, video calling, and multiplayer games.

## ✨ What's New?

Your app now has a **separate game backend server** for better performance and scalability!

```
Frontend (Port 3000) ←→ Backend (Port 4000)
     ↓                         ↓
  Next.js                 Express + Socket.IO
  React UI                Game Logic & Sync
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Start both servers
npm run dev
```

**That's it!** Open http://localhost:3000

## ✅ Verify Setup

```bash
# Run automated tests
npm run test:setup
```

## 📚 Documentation

### 👋 New Here?
- **[GETTING_STARTED.md](GETTING_STARTED.md)** ⭐ - Start here! Visual guide with 3 simple steps

### 🔧 Setup & Configuration
- **[QUICKSTART.md](QUICKSTART.md)** - Quick commands to get running
- **[GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md)** - Complete backend configuration
- **[MONOREPO_SETUP.md](MONOREPO_SETUP.md)** - Monorepo structure explained

### 🏗️ Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual diagrams and system design

### ✅ Testing
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Complete testing checklist

### 🌐 Production
- **[README.md](README.md)** - Production deployment guide (in root)

### 📖 All Documentation
- **[DOCS_INDEX.md](DOCS_INDEX.md)** - Complete documentation index

## 🎯 Key Features

✅ **Real-time Chat** - Instant messaging between couples
✅ **Video Calling** - Face-to-face communication
✅ **Multiplayer Games** - Fun games to play together
✅ **Room System** - Create and join game rooms
✅ **Score Tracking** - Keep track of game scores
✅ **Responsive Design** - Works on all devices

## 🔧 Common Commands

```bash
# Development
npm run dev              # Run both servers
npm run dev:web          # Run only frontend (port 3000)
npm run dev:api          # Run only backend (port 4000)

# Testing
npm run test:setup       # Verify configuration

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

## 🏗️ Project Structure

```
couple-connect/
├── apps/
│   ├── web/              ← Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/     ← Next.js pages
│   │   │   ├── games/   ← Game UI & logic
│   │   │   └── ...
│   │   └── .env         ← Frontend config
│   │
│   └── api/              ← Backend (Port 4000)
│       ├── src/
│       │   └── server.js ← Game server
│       └── .env         ← Backend config
│
├── packages/
│   ├── database/        ← Shared Prisma
│   ├── shared/          ← Shared types
│   └── ui/              ← Shared components
│
└── Documentation files...
```

## 🌐 Ports

| Service  | Development | Production |
|----------|-------------|------------|
| Frontend | 3000        | 80/443     |
| Backend  | 4000        | 80/443     |

## 🔑 Environment Variables

### Frontend (apps/web/.env)
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
DATABASE_URL=your-mongodb-url
```

### Backend (apps/api/.env)
```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=your-mongodb-url
```

## 🐛 Troubleshooting

### Backend not connecting?
```bash
# Check if backend is running
curl http://localhost:4000/health

# Start backend
npm run dev:api
```

### CORS error?
- Check `ALLOWED_ORIGINS` in `apps/api/.env`
- Should include: `http://localhost:3000`
- Restart backend

### Port already in use?
```bash
# Kill processes
npx kill-port 3000 4000

# Restart
npm run dev
```

**More help:** See [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md) troubleshooting section

## 🎮 Testing the Game System

1. **Start servers:** `npm run dev`
2. **Open browser:** http://localhost:3000
3. **Go to Games page**
4. **Create a room** → Get code (e.g., "ABC123")
5. **Open another window** → Join with code
6. **Both players see each other!** ✅

## 📊 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Express, Socket.IO, Node.js
- **Database:** MongoDB (Prisma ORM)
- **Real-time:** Socket.IO (WebSocket)
- **Video:** MediaSoup
- **Deployment:** Docker, Nginx

## 🎯 Benefits of This Setup

✅ **Better Performance** - Dedicated server for real-time features
✅ **Scalability** - Scale frontend and backend independently
✅ **Clean Architecture** - Clear separation of concerns
✅ **Production Ready** - Can deploy to different servers
✅ **Easy Debugging** - Separate logs for each service

## 🚀 Next Steps

1. **Run the app:** `npm run dev`
2. **Test it:** `npm run test:setup`
3. **Read docs:** Start with [GETTING_STARTED.md](GETTING_STARTED.md)
4. **Build features:** Develop your app
5. **Deploy:** Follow [README.md](README.md) production guide

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🔐 Security

✅ CORS configured
✅ Environment variables for secrets
✅ JWT authentication
✅ Session management
✅ Input validation
✅ Rate limiting ready

## 📝 License

Private - All rights reserved

---

## 🎉 You're All Set!

Your Couple Connect app is ready with:
- ✅ Professional monorepo structure
- ✅ Separate game backend (Port 4000)
- ✅ Real-time synchronization
- ✅ Production-ready architecture
- ✅ Comprehensive documentation

**Start coding:** `npm run dev` 🚀

**Need help?** Check [DOCS_INDEX.md](DOCS_INDEX.md) for all documentation!
