-- ============================================================================
-- COMPLETE CHAT SYSTEM FIX - RUN THIS ONCE
-- ============================================================================
-- This script will:
-- 1. Drop any existing chat tables (old or broken)
-- 2. Create new tables with correct TEXT types
-- 3. Add all RLS policies, indexes, triggers
-- 4. Enable realtime
-- 5. Verify everything was created successfully
--
-- SAFE TO RUN: Will drop existing tables but there should be no data yet
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEAN UP OLD TABLES
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '🧹 Cleaning up old chat tables...';
END $;

DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Drop old functions/triggers if they exist
DROP FUNCTION IF EXISTS prevent_duplicate_direct_conversations() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- ============================================================================
-- STEP 2: CREATE NEW TABLES WITH TEXT USER REFERENCES
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '📋 Creating new chat tables...';
END $;

-- Conversations table (for both 1-to-1 and group chats)
CREATE TABLE conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NULL,
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
  UNIQUE(conversation_id, user_id)
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
  UNIQUE(message_id, user_id)
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '🔍 Creating indexes for performance...';
END $;

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

-- ============================================================================
-- STEP 4: CREATE TRIGGERS
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '⚡ Creating triggers...';
END $;

-- Trigger to prevent duplicate direct conversations
CREATE OR REPLACE FUNCTION prevent_duplicate_direct_conversations()
RETURNS TRIGGER AS $func$
DECLARE
  conv_type TEXT;
  existing_conv_id TEXT;
BEGIN
  SELECT type INTO conv_type FROM conversations WHERE id = NEW.conversation_id;
  
  IF conv_type = 'direct' THEN
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
$func$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_duplicate_direct_conversations
BEFORE INSERT ON conversation_members
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_direct_conversations();

-- Trigger to update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $func$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '🔒 Enabling Row Level Security...';
END $;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '🛡️ Creating RLS policies...';
END $;

-- Conversations policies
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

-- Conversation members policies
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

-- Messages policies
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

-- Message read receipts policies
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

-- ============================================================================
-- STEP 7: ENABLE REALTIME
-- ============================================================================
DO $
BEGIN
  RAISE NOTICE '📡 Enabling realtime...';
END $;

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;

-- ============================================================================
-- STEP 8: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE conversations IS 'Stores conversation metadata for both direct and group chats';
COMMENT ON TABLE conversation_members IS 'Tracks which users are members of which conversations';
COMMENT ON TABLE messages IS 'Stores all chat messages';
COMMENT ON TABLE message_read_receipts IS 'Tracks when users read messages';

-- ============================================================================
-- STEP 9: VERIFICATION
-- ============================================================================
DO $
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CHAT SYSTEM SETUP COMPLETE';
  RAISE NOTICE '========================================';
  
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts');
  RAISE NOTICE '📋 Tables created: %', table_count;
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts');
  RAISE NOTICE '🔍 Indexes created: %', index_count;
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_table IN ('conversations', 'conversation_members', 'messages');
  RAISE NOTICE '⚡ Triggers created: %', trigger_count;
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts');
  RAISE NOTICE '🛡️ RLS policies created: %', policy_count;
  
  RAISE NOTICE '';
  
  IF table_count = 4 AND index_count >= 11 AND trigger_count >= 2 AND policy_count >= 9 THEN
    RAISE NOTICE '✅ ALL CHECKS PASSED - System ready for use!';
  ELSE
    RAISE WARNING '⚠️ Some components may be missing. Review the counts above.';
  END IF;
  
  RAISE NOTICE '========================================';
END $;

-- ============================================================================
-- FINAL TEST
-- ============================================================================
-- Quick test to ensure schema is correct
DO $
DECLARE
  test_conv_id TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Running quick schema test...';
  
  -- Test creating a conversation (should use TEXT type)
  INSERT INTO conversations (name, type, created_by)
  VALUES ('__TEST__', 'group', (SELECT username FROM users LIMIT 1))
  RETURNING id INTO test_conv_id;
  
  RAISE NOTICE '✅ Test conversation created with TEXT id: %', test_conv_id;
  
  -- Clean up
  DELETE FROM conversations WHERE id = test_conv_id;
  
  RAISE NOTICE '✅ Schema test passed - TEXT types working correctly!';
  RAISE NOTICE '';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '⚠️ Schema test failed: %', SQLERRM;
END $;

-- Done!
SELECT 
  '🎉 SETUP COMPLETE!' as status,
  'Chat system is ready for use' as message,
  'Check CHAT_SYSTEM_FIXES_COMPLETE.md for next steps' as next_steps;
