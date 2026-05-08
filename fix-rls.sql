-- ============================================
-- QUICK FIX - Disable RLS and Grant Permissions
-- Copy and paste this in Supabase SQL Editor
-- ============================================

-- Disable Row Level Security
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Grant full access to everyone (for testing)
GRANT ALL ON public.messages TO anon;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.messages TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Test insert
INSERT INTO public.messages (content, sender_id, receiver_id, room_id, sender_name)
VALUES ('Test message - RLS disabled', 'test1', 'test2', 'test-room', 'Test User')
RETURNING *;

-- Success message
SELECT '✅ RLS disabled and permissions granted!' as status;
