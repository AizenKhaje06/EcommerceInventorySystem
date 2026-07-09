-- ============================================================================
-- VERIFY CHAT SYSTEM TABLES
-- ============================================================================
-- Run this after migration to verify everything was created correctly

-- Check if all tables exist
SELECT 
  'conversations' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'conversation_members',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_members')
    THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'messages',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')
    THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 'message_read_receipts',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_read_receipts')
    THEN '✅ EXISTS' ELSE '❌ MISSING' END;

-- Check if indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  '✅' as status
FROM pg_indexes
WHERE tablename IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')
ORDER BY tablename, indexname;

-- Check if RLS is enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ENABLED' ELSE '❌ RLS DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')
ORDER BY tablename;

-- Check if triggers were created
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_statement,
  '✅' as status
FROM information_schema.triggers
WHERE event_object_table IN ('conversations', 'messages', 'conversation_members')
ORDER BY event_object_table, trigger_name;

-- Check if realtime is enabled
SELECT 
  schemaname,
  tablename,
  '✅ REALTIME ENABLED' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')
ORDER BY tablename;

-- Summary with action guidance
SELECT 
  'CHAT SYSTEM SETUP' as component,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_name IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')) = 4
    THEN '✅ ALL TABLES CREATED'
    ELSE '❌ MISSING TABLES - Run: scripts/sql/FIX_CHAT_SYSTEM_COMPLETE.sql'
  END as status,
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_name IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')) = 4
    THEN 'System is ready to use'
    ELSE 'See: RUN_THIS_TO_FIX_CHAT.md for instructions'
  END as next_step;
