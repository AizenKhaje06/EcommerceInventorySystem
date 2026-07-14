-- ============================================================================
-- COMPLETE CHAT SYSTEM DELETION
-- ============================================================================
-- This script will:
-- 1. Drop all chat tables and data
-- 2. Drop chat-related functions and triggers
-- 3. Remove chat from realtime publication
-- 4. Clean up storage bucket for chat files
-- 5. Remove chat-related RLS policies
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL CHAT TABLES (CASCADE will drop dependent objects)
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
-- STEP 3: REMOVE FROM REALTIME PUBLICATION (if exists)
-- ============================================================================

DO $
BEGIN
  -- Remove tables from realtime publication (ignore errors if not in publication)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS messages;
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if table not in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS conversation_members;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS message_read_receipts;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS conversations;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $;

-- ============================================================================
-- STEP 4: DROP STORAGE BUCKET FOR CHAT FILES (if exists)
-- ============================================================================

-- Note: This needs to be done via Supabase Dashboard or Storage API
-- SQL cannot directly delete storage buckets
-- Manual step: Go to Storage > chat-files bucket > Delete

-- ============================================================================
-- STEP 5: VERIFICATION
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
  '🗑️ CHAT SYSTEM DELETED' as status,
  'All chat tables, functions, and triggers removed' as message,
  'Chat files in storage need manual deletion' as note;
