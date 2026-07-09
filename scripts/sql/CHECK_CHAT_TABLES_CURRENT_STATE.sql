-- ============================================================================
-- CHECK CURRENT STATE OF CHAT TABLES
-- ============================================================================
-- This checks if tables exist and what their schema looks like

-- Check if tables exist and their schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('conversations', 'conversation_members', 'messages', 'message_read_receipts')
ORDER BY table_name, ordinal_position;

-- Check if there are any rows in the tables (to know if we can safely drop)
DO $
DECLARE
  conv_count INTEGER;
  members_count INTEGER;
  messages_count INTEGER;
  receipts_count INTEGER;
BEGIN
  -- Check if tables exist first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    SELECT COUNT(*) INTO conv_count FROM conversations;
    RAISE NOTICE 'conversations: % rows', conv_count;
  ELSE
    RAISE NOTICE 'conversations: TABLE DOES NOT EXIST';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_members') THEN
    SELECT COUNT(*) INTO members_count FROM conversation_members;
    RAISE NOTICE 'conversation_members: % rows', members_count;
  ELSE
    RAISE NOTICE 'conversation_members: TABLE DOES NOT EXIST';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    SELECT COUNT(*) INTO messages_count FROM messages;
    RAISE NOTICE 'messages: % rows', messages_count;
  ELSE
    RAISE NOTICE 'messages: TABLE DOES NOT EXIST';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_read_receipts') THEN
    SELECT COUNT(*) INTO receipts_count FROM message_read_receipts;
    RAISE NOTICE 'message_read_receipts: % rows', receipts_count;
  ELSE
    RAISE NOTICE 'message_read_receipts: TABLE DOES NOT EXIST';
  END IF;
END;
$;
