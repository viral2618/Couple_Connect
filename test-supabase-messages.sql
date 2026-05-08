-- Test if messages table is working
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'messages'
) as table_exists;

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='messages';

-- Check if realtime is enabled
SELECT schemaname, tablename, 
       CASE WHEN tablename = ANY(
         SELECT tablename FROM pg_publication_tables 
         WHERE pubname = 'supabase_realtime'
       ) THEN 'ENABLED' ELSE 'DISABLED' END as realtime_status
FROM pg_tables 
WHERE tablename = 'messages';

-- Try inserting a test message
INSERT INTO public.messages (content, sender_id, receiver_id, room_id, sender_name)
VALUES ('Test message', 'test-user-1', 'test-user-2', 'test-room', 'Test User')
RETURNING *;

-- Check if message was inserted
SELECT * FROM public.messages ORDER BY created_at DESC LIMIT 5;
