-- ============================================================================
-- Migration 063: Fix Chat System Foreign Key Constraints
-- ============================================================================
-- ISSUE: Foreign keys referencing users.username may be invalid
-- SOLUTION: Explicitly define constraints with proper syntax
-- ============================================================================

-- Step 1: Ensure users.username has proper UNIQUE constraint
DO $$
BEGIN
  -- Add UNIQUE constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_username_key' 
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- Ensure username is NOT NULL
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Step 2: Drop existing chat tables
-- WARNING: This will delete all existing chat data
DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Step 3: Recreate conversations table with explicit FK constraint
CREATE TABLE conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Explicit foreign key constraint
  CONSTRAINT fk_conversations_created_by 
    FOREIGN KEY (created_by) 
    REFERENCES users(username) 
    ON DELETE CASCADE
);

-- Step 4: Recreate conversation_members table
CREATE TABLE conversation_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Explicit foreign key constraints
  CONSTRAINT fk_conversation_members_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_conversation_members_user
    FOREIGN KEY (user_id)
    REFERENCES users(username)
    ON DELETE CASCADE,
    
  -- Unique constraint
  CONSTRAINT uq_conversation_user UNIQUE(conversation_id, user_id)
);

-- Step 5: Recreate messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  edited_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Explicit foreign key constraints
  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id)
    REFERENCES users(username)
    ON DELETE CASCADE
);

-- Step 6: Recreate message_read_receipts table
CREATE TABLE message_read_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Explicit foreign key constraints
  CONSTRAINT fk_read_receipts_message
    FOREIGN KEY (message_id)
    REFERENCES messages(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_read_receipts_user
    FOREIGN KEY (user_id)
    REFERENCES users(username)
    ON DELETE CASCADE,
    
  -- Unique constraint
  CONSTRAINT uq_message_user_read UNIQUE(message_id, user_id)
);

-- Step 7: Recreate indexes for performance
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

-- Step 8: Recreate trigger to update conversation timestamp
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

-- Step 9: Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;

-- Step 10: Disable RLS (security handled at API layer)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts DISABLE ROW LEVEL SECURITY;

-- Step 11: Add documentation comments
COMMENT ON TABLE conversations IS 'Chat conversations (direct and group). RLS disabled - security enforced in API layer via header-based auth.';
COMMENT ON TABLE conversation_members IS 'Conversation membership tracking. RLS disabled - security in API layer.';
COMMENT ON TABLE messages IS 'Chat messages. RLS disabled - security in API layer.';
COMMENT ON TABLE message_read_receipts IS 'Message read tracking for unread counts. RLS disabled - security in API layer.';

COMMENT ON COLUMN conversations.type IS 'Conversation type: direct (1-on-1) or group (multiple users)';
COMMENT ON COLUMN conversations.created_by IS 'Username of user who created the conversation';
COMMENT ON COLUMN conversation_members.user_id IS 'Username of conversation member';
COMMENT ON COLUMN messages.sender_id IS 'Username of message sender';

-- Step 12: Verify constraints were created successfully
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conrelid IN (
    'conversations'::regclass,
    'conversation_members'::regclass,
    'messages'::regclass,
    'message_read_receipts'::regclass
  )
  AND contype = 'f'; -- Foreign key constraints
  
  RAISE NOTICE 'Created % foreign key constraints', constraint_count;
  
  IF constraint_count < 6 THEN
    RAISE WARNING 'Expected at least 6 foreign key constraints, only found %', constraint_count;
  END IF;
END $$;

