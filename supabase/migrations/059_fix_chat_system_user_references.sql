-- ============================================================================
-- Fix Chat System: Change UUID to TEXT for user references
-- ============================================================================
-- This migration fixes the type mismatch between the chat system and users table
-- Original migration used UUID, but users.id is TEXT (username)

-- Step 1: Drop existing tables (if they exist and have no data)
-- WARNING: This will delete existing chat data
DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Step 2: Recreate tables with TEXT user references

-- Conversations table (for both 1-to-1 and group chats)
CREATE TABLE conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NULL, -- NULL for direct messages, set for group chats
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
  created_by TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Conversation members table
CREATE TABLE conversation_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id) -- Prevent duplicate memberships
);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  edited_at TIMESTAMP WITH TIME ZONE NULL
);

-- Message read receipts table
CREATE TABLE message_read_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id) -- Each user can only read a message once
);

-- Create indexes for better query performance
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_archived ON conversations(is_archived);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX idx_conversation_members_conversation ON conversation_members(conversation_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_message_read_receipts_user ON message_read_receipts(user_id);
CREATE INDEX idx_message_read_receipts_message ON message_read_receipts(message_id);

-- Add unique constraint to prevent duplicate direct conversations
-- Note: We handle duplicate prevention at the application level
-- A simple unique constraint on (conversation_id, user_id) already exists above

-- Add a trigger function to prevent duplicate direct message conversations
CREATE OR REPLACE FUNCTION prevent_duplicate_direct_conversations()
RETURNS TRIGGER AS $$
DECLARE
  conv_type TEXT;
  existing_conv_id TEXT;
BEGIN
  -- Get the conversation type
  SELECT type INTO conv_type FROM conversations WHERE id = NEW.conversation_id;
  
  -- Only check for direct conversations
  IF conv_type = 'direct' THEN
    -- Check if user already has a direct conversation with any other member
    SELECT DISTINCT cm1.conversation_id INTO existing_conv_id
    FROM conversation_members cm1
    JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
    JOIN conversations c ON c.id = cm1.conversation_id
    WHERE c.type = 'direct'
      AND cm1.user_id = NEW.user_id
      AND cm2.user_id != NEW.user_id
      AND cm1.conversation_id != NEW.conversation_id;
    
    IF existing_conv_id IS NOT NULL THEN
      RAISE EXCEPTION 'User already has a direct conversation'
        USING HINT = 'conversation_id: ' || existing_conv_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_duplicate_direct_conversations
BEFORE INSERT ON conversation_members
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_direct_conversations();

-- Add trigger to update conversations.updated_at on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Enable realtime for messages and conversation_members
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;

-- Add Row Level Security (RLS) policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they are part of"
ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_members.conversation_id = conversations.id
    AND conversation_members.user_id = current_user
  )
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (created_by = current_user);

-- RLS Policies for conversation_members
CREATE POLICY "Users can view members of their conversations"
ON conversation_members FOR SELECT
USING (
  user_id = current_user OR
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = conversation_members.conversation_id
    AND cm.user_id = current_user
  )
);

CREATE POLICY "Users can add members to conversations they created"
ON conversation_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_members.conversation_id
    AND conversations.created_by = current_user
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_members.conversation_id = messages.conversation_id
    AND conversation_members.user_id = current_user
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON messages FOR INSERT
WITH CHECK (
  sender_id = current_user AND
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_members.conversation_id = messages.conversation_id
    AND conversation_members.user_id = current_user
  )
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (sender_id = current_user)
WITH CHECK (sender_id = current_user);

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts for their conversations"
ON message_read_receipts FOR SELECT
USING (
  user_id = current_user OR
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
    WHERE m.id = message_read_receipts.message_id
    AND cm.user_id = current_user
  )
);

CREATE POLICY "Users can mark messages as read"
ON message_read_receipts FOR INSERT
WITH CHECK (user_id = current_user);

-- Comments for documentation
COMMENT ON TABLE conversations IS 'Stores conversation metadata for both direct and group chats';
COMMENT ON TABLE conversation_members IS 'Tracks which users are members of which conversations';
COMMENT ON TABLE messages IS 'Stores all chat messages';
COMMENT ON TABLE message_read_receipts IS 'Tracks when users read messages';

COMMENT ON COLUMN conversations.type IS 'Type of conversation: direct (1-to-1) or group (multiple users)';
COMMENT ON COLUMN conversations.is_archived IS 'Whether the conversation is archived';
COMMENT ON COLUMN messages.edited_at IS 'Timestamp of last edit (NULL if never edited)';
