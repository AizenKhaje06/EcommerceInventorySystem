-- ============================================================================
-- SIMPLE CHAT SYSTEM DELETION (No DO blocks)
-- ============================================================================
-- This script will delete all chat tables and related objects
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL CHAT TABLES (CASCADE removes dependencies)
-- ============================================================================

DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- ============================================================================
-- STEP 2: DROP CHAT-RELATED FUNCTIONS AND TRIGGERS
-- ============================================================================

DROP FUNCTION IF EXISTS prevent_duplicate_direct_conversations() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- ============================================================================
-- STEP 3: REMOVE FROM REALTIME PUBLICATION (Optional - skip if errors)
-- ============================================================================
-- Note: Comment out these lines if they error (tables may not be in publication)
-- Uncomment one at a time if needed:

-- ALTER PUBLICATION supabase_realtime DROP TABLE messages;
-- ALTER PUBLICATION supabase_realtime DROP TABLE conversation_members;
-- ALTER PUBLICATION supabase_realtime DROP TABLE message_read_receipts;
-- ALTER PUBLICATION supabase_realtime DROP TABLE conversations;

-- ============================================================================
-- STEP 4: VERIFICATION
-- ============================================================================

-- Check if all tables are deleted
SELECT 
  'CHAT TABLES' as component,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ ALL DELETED'
    ELSE '❌ SOME REMAIN: ' || string_agg(table_name, ', ')
  END as status
FROM information_schema.tables
WHERE table_name IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')
  AND table_schema = 'public';

-- Check if functions are deleted
SELECT 
  'CHAT FUNCTIONS' as component,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ ALL DELETED'
    ELSE '❌ SOME REMAIN: ' || string_agg(routine_name, ', ')
  END as status
FROM information_schema.routines
WHERE routine_name IN ('prevent_duplicate_direct_conversations', 'update_conversation_timestamp')
  AND routine_schema = 'public';

-- Summary
SELECT 
  '🗑️ DELETION COMPLETE' as status,
  'All chat tables and functions removed' as message,
  'Storage bucket needs manual deletion' as note;
