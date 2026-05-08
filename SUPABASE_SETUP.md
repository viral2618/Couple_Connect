# 🚀 Supabase Realtime Chat Setup

## Why Supabase?

✅ **Persistent Messages** - All messages saved in PostgreSQL  
✅ **Realtime Updates** - Instant message delivery  
✅ **Offline Support** - Messages sync when back online  
✅ **Typing Indicators** - Built-in presence system  
✅ **Read Receipts** - Automatic message status  
✅ **Scalable** - No server management needed  
✅ **Free Tier** - 500MB database, 2GB bandwidth  

## 📋 Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (free)
4. Create new project
   - Name: `couple-connect`
   - Database Password: (save this!)
   - Region: Choose closest to you
5. Wait 2-3 minutes for setup

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Add to Environment Variables

Update `apps/web/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Run Database Migration

Go to Supabase Dashboard → SQL Editor → New Query

Run this SQL:

```sql
-- Enable Realtime for Message table
ALTER TABLE "Message" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";

-- Create Typing Status table
CREATE TABLE IF NOT EXISTS "TypingStatus" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "TypingStatus" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "TypingStatus";

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_sender ON "Message"(senderId);
CREATE INDEX IF NOT EXISTS idx_message_receiver ON "Message"(receiverId);
CREATE INDEX IF NOT EXISTS idx_message_created ON "Message"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_typing_room ON "TypingStatus"(room_id);
```

### 5. Configure Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TypingStatus" ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own messages
CREATE POLICY "Users can read own messages" ON "Message"
  FOR SELECT
  USING (
    auth.uid()::text = senderId OR 
    auth.uid()::text = receiverId
  );

-- Allow users to insert messages
CREATE POLICY "Users can insert messages" ON "Message"
  FOR INSERT
  WITH CHECK (auth.uid()::text = senderId);

-- Allow users to update their sent messages
CREATE POLICY "Users can update own messages" ON "Message"
  FOR UPDATE
  USING (auth.uid()::text = senderId);

-- Typing status policies
CREATE POLICY "Users can manage typing status" ON "TypingStatus"
  FOR ALL
  USING (auth.uid()::text = user_id);
```

## 🎯 Usage in Your App

### Option 1: Use New Supabase Chat Component

```tsx
import SupabaseChat from '@/components/SupabaseChat'

<SupabaseChat
  roomId="user1-user2"
  userId="user1"
  userName="John"
  partnerId="user2"
  partnerName="Jane"
/>
```

### Option 2: Use Hook Directly

```tsx
import { useSupabaseChat } from '@/hooks/useSupabaseChat'

const { messages, sendMessage, loadMessages } = useSupabaseChat(roomId, userId)
```

## 🔄 Migration from Socket.IO

**Current Setup:**
- Socket.IO for real-time chat ✅ (Keep for games/video)
- Messages in MongoDB ✅

**New Setup (Parallel):**
- Supabase for chat messages ✅ (NEW)
- Socket.IO for games/video ✅ (Keep existing)
- MongoDB for user data ✅ (Keep existing)

**Both systems work together!** No breaking changes.

## 📊 Features Comparison

| Feature | Socket.IO | Supabase |
|---------|-----------|----------|
| Real-time | ✅ | ✅ |
| Persistence | ❌ | ✅ |
| Message History | Manual | ✅ Auto |
| Offline Support | ❌ | ✅ |
| Typing Indicators | Manual | ✅ Built-in |
| Read Receipts | Manual | ✅ Easy |
| Scaling | Hard | ✅ Easy |
| Cost | Server needed | 🆓 Free tier |

## 🧪 Testing

1. Start your app: `npm run dev`
2. Open two browser windows
3. Login as different users
4. Send messages
5. Check Supabase Dashboard → Table Editor → Message

## 🐛 Troubleshooting

### Messages not appearing?

1. Check Supabase Dashboard → Database → Realtime
2. Ensure `Message` table is in publication
3. Check browser console for errors

### Connection issues?

1. Verify `.env` variables are correct
2. Check Supabase project is not paused
3. Ensure API keys are valid

### RLS blocking queries?

1. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
   ```
2. Check policies match your auth setup

## 🎉 Benefits You Get

1. **No Server Management** - Supabase handles everything
2. **Automatic Backups** - Built-in
3. **Message History** - Free forever
4. **Offline Sync** - Automatic
5. **Real-time** - Sub-100ms latency
6. **Scalable** - Handles millions of messages
7. **Free Tier** - Perfect for starting

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [React Integration](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

## 🔐 Security Notes

- Never commit `.env` files
- Use RLS policies in production
- Rotate keys if exposed
- Enable 2FA on Supabase account

---

**Made with ❤️ for Couple Connect**
