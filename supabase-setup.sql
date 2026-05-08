-- Supabase SQL Setup for Couple Connect
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  reactions JSONB DEFAULT '[]'::jsonb,
  "replyTo" TEXT,
  "seenAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_sender ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS idx_message_receiver ON "Message"("receiverId");
CREATE INDEX IF NOT EXISTS idx_message_created ON "Message"("createdAt" DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own messages
CREATE POLICY "Users can read their own messages" ON "Message"
  FOR SELECT
  USING (
    auth.uid()::text = "senderId" OR 
    auth.uid()::text = "receiverId"
  );

-- Create policy to allow users to insert messages
CREATE POLICY "Users can insert messages" ON "Message"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "senderId");

-- Create policy to allow users to update their sent messages
CREATE POLICY "Users can update their messages" ON "Message"
  FOR UPDATE
  USING (auth.uid()::text = "senderId");

-- Enable Realtime for Message table
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";

-- Create User table (optional - if you want to store users in Supabase too)
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  "partnerId" TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "isPremium" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for User table
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_partner ON "User"("partnerId");

-- Enable RLS for User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read their own data" ON "User"
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own data" ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Enable Realtime for User table
ALTER PUBLICATION supabase_realtime ADD TABLE "User";

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for User table
CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Supabase tables created successfully!' AS status;
