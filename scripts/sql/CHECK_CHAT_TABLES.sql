-- ============================================================================
-- QUICK CHECK: Do chat tables exist?
-- ============================================================================
-- Run this to quickly see if setup was successful

SELECT 
  table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables t 
    WHERE t.table_name = tables.table_name
  )
  THEN '✅ EXISTS' 
  ELSE '❌ MISSING' 
  END as status
FROM (
  VALUES 
    ('conversations'),
    ('conversation_members'),
    ('messages'),
    ('message_read_receipts')
) AS tables(table_name);
