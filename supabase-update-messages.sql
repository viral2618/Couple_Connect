-- Add reply_to and reactions columns to messages table

-- Add reply_to column (foreign key to messages table)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Add reactions column (JSONB array)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_messages_reactions ON messages USING GIN(reactions);

-- Update existing messages to have empty reactions array
UPDATE messages SET reactions = '[]'::jsonb WHERE reactions IS NULL;
