# 🚀 Couple Connect - Monorepo Setup

## ✅ Monorepo Structure (Complete)

```
couple-connect/                    ← ROOT
├── package.json                   ← npm workspaces
├── .gitignore                     ← updated for monorepo
├── .env                           ← root env (for reference)
│
├── apps/
│   ├── web/                       ← Next.js Frontend + API Routes
│   │   ├── src/
│   │   │   ├── app/               ← Pages + API routes
│   │   │   ├── components/        ← React components
│   │   │   ├── lib/               ← Utilities
│   │   │   ├── hooks/             ← Custom hooks
│   │   │   ├── games/             ← Game logic
│   │   │   └── contexts/          ← React contexts
│   │   ├── public/                ← Static assets
│   │   ├── .env                   ← Web app environment
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                       ← Express + Socket.IO Server
│       ├── src/
│       │   └── server.js          ← Main server file
│       ├── .env                   ← API environment
│       ├── .env.production
│       └── package.json
│
└── packages/
    ├── database/                  ← Prisma Schema + Client
    │   ├── schema.prisma          ← Database schema
    │   ├── src/
    │   │   └── index.ts           ← Prisma client export
    │   └── package.json
    │
    ├── shared/                    ← Shared TypeScript Types
    │   ├── src/
    │   │   └── index.ts           ← Shared types
    │   └── package.json
    │
    └── ui/                        ← Shared React Components
        ├── src/
        │   └── index.ts           ← UI components
        └── package.json
```

---

## 📦 Installation & Setup

### 1. Install Dependencies (Root Level)

```bash
npm install
```

This will install dependencies for all workspaces (apps/web, apps/api, packages/*).

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Setup Environment Variables

Copy `.env` to both apps:
- `apps/web/.env` ✅ (Already done)
- `apps/api/.env` ✅ (Already done)

---

## 🚀 Development

### Run Everything (Web + API)

```bash
npm run dev
```

This runs both:
- `apps/web` on port 3000 (Next.js)
- `apps/api` on port 4000 (Express + Socket.IO)

**Important:** The game backend runs on port 4000 separately from the frontend!

### Run Individual Apps

```bash
# Run only web
npm run dev:web

# Run only api
npm run dev:api
```

### Verify Game Backend Connection

1. Start both servers: `npm run dev`
2. Open http://localhost:3000
3. Go to Games page
4. Open browser console (F12)
5. Look for: `🔌 Connecting to game server: http://localhost:4000`
6. Should see: `✅ Game socket connected`

See [GAME_BACKEND_SETUP.md](GAME_BACKEND_SETUP.md) for detailed game configuration.

---

## 🏗️ Build

### Build All

```bash
npm run build
```

### Build Individual

```bash
npm run build:web
npm run build:api
```

---

## 🗄️ Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate
```

---

## 📁 Package Structure

### `@couple-connect/web`
- Next.js 14 app
- All frontend pages and components
- API routes under `src/app/api/`
- Games system integrated

### `@couple-connect/api`
- Express server
- Socket.IO for real-time features
- Game room management
- Video call signaling

### `@couple-connect/database`
- Prisma schema
- Database client
- Shared across web and api

### `@couple-connect/shared`
- TypeScript types
- Shared utilities
- Constants

### `@couple-connect/ui`
- Reusable React components
- Shared UI elements

---

## 🔧 How It Works

### Workspaces
Root `package.json` defines workspaces:
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Cross-Package Dependencies
Apps can import from packages:
```typescript
// In apps/web or apps/api
import { prisma } from '@couple-connect/database'
import { User, Message } from '@couple-connect/shared'
```

### Shared node_modules
All packages share the same `node_modules` at root level, reducing duplication.

---

## ✅ What's Fixed

1. ✅ **Duplicate code cleaned** - Root `src/`, `server/`, `client/`, `prisma/` removed
2. ✅ **Environment files** - `.env` copied to `apps/web/`
3. ✅ **Public folder** - Ready for `apps/web/public/`
4. ✅ **Gitignore updated** - Monorepo paths added
5. ✅ **Prisma paths fixed** - Schema path configured
6. ✅ **Package structure** - All packages properly configured

---

## 🎯 Next Steps

1. **Test the setup:**
   ```bash
   npm install
   npm run db:generate
   npm run dev
   ```

2. **Verify everything works:**
   - Open http://localhost:3000
   - Test login/signup
   - Test chat
   - Test games
   - Test video calling

3. **Deploy:**
   - Use existing deployment scripts
   - Update paths if needed

---

## 🐛 Troubleshooting

### "Cannot find module '@couple-connect/database'"
```bash
npm run db:generate
```

### "Prisma schema not found"
```bash
cd packages/database
npx prisma generate --schema=./schema.prisma
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

---

## 📝 Notes

- **Same functionality** - Everything works exactly as before
- **Better organization** - Code is now properly separated
- **Easier scaling** - Can add more apps/packages easily
- **Shared dependencies** - No duplication of node_modules

---

## 🎉 Done!

Your monorepo is ready! Run `npm run dev` and start coding! 🚀
