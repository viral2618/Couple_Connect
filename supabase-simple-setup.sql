-- ============================================
-- Supabase Chat Setup - Simple Version
-- Copy and paste this in Supabase SQL Editor
-- ============================================

-- Drop table if exists (for fresh start)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    sender_name TEXT,
    sender_avatar TEXT,
    seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_room_id ON public.messages(room_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Disable RLS for now (easier testing)
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated users
GRANT ALL ON public.messages TO anon;
GRANT ALL ON public.messages TO authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Success message
SELECT 'Messages table created successfully! ✅' as status;
