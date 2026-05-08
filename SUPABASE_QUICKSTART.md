# 🚀 Supabase Integration - Quick Start

## ✅ What's Been Added (WITHOUT Breaking Existing Code)

### New Files Created:
```
packages/shared/src/supabase.ts          ← Supabase client
apps/web/src/hooks/useSupabaseChat.ts    ← Chat hook
apps/web/src/hooks/useSupabaseTyping.ts  ← Typing indicators
apps/web/src/components/SupabaseChat.tsx ← New chat component
SUPABASE_SETUP.md                        ← Full setup guide
.env.example                             ← Environment template
```

### Existing Code: UNTOUCHED ✅
- Socket.IO server still works
- Existing Chat component unchanged
- Games still use Socket.IO
- Video calling unchanged
- All MongoDB operations unchanged

## 🎯 How to Use

### Step 1: Get Supabase Credentials (5 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create new project: `couple-connect`
3. Copy from Settings → API:
   - Project URL
   - anon public key

### Step 2: Add to .env

Update `apps/web/.env`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 3: Run SQL Migration

In Supabase Dashboard → SQL Editor, run:
```sql
ALTER TABLE "Message" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
```

### Step 4: Use in Your App

**Option A: Use New Component**
```tsx
import SupabaseChat from '@/components/SupabaseChat'

<SupabaseChat
  roomId="user1-user2"
  userId={currentUser.id}
  userName={currentUser.name}
  partnerId={partner.id}
  partnerName={partner.name}
/>
```

**Option B: Use Hook**
```tsx
import { useSupabaseChat } from '@/hooks/useSupabaseChat'

const { messages, sendMessage } = useSupabaseChat(roomId, userId)
```

## 🔥 Benefits

| Feature | Before (Socket.IO) | After (Supabase) |
|---------|-------------------|------------------|
| Messages persist | ❌ Lost on refresh | ✅ Saved forever |
| Message history | ❌ Manual | ✅ Automatic |
| Offline support | ❌ No | ✅ Yes |
| Typing indicators | ⚠️ Complex | ✅ Built-in |
| Read receipts | ⚠️ Manual | ✅ Easy |
| Deployment | ⚠️ Need server | ✅ Serverless |
| Scaling | ⚠️ Hard | ✅ Automatic |

## 🎮 What Still Uses Socket.IO?

✅ **Games** - Real-time game state  
✅ **Video Calls** - WebRTC signaling  
✅ **Live presence** - Who's online now  

## 💡 Recommended Setup

**For Chat:** Use Supabase (persistent, scalable)  
**For Games:** Keep Socket.IO (real-time state)  
**For Video:** Keep Socket.IO (WebRTC signaling)  

## 📚 Full Documentation

See `SUPABASE_SETUP.md` for:
- Complete setup guide
- SQL migrations
- Security policies
- Troubleshooting
- Advanced features

## 🚀 Run Your App

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start development
npm run dev
```

App runs on: http://localhost:3000

## 🎉 That's It!

You now have:
- ✅ Persistent chat with Supabase
- ✅ Real-time games with Socket.IO
- ✅ Video calls with Socket.IO
- ✅ Best of both worlds!

No breaking changes. Everything still works! 🔥
