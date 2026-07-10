-- ============================================================================
-- Fix Chat RLS Policies: Disable RLS to Prevent Infinite Recursion
-- Migration: 062_fix_chat_rls_policies.sql
-- ============================================================================
-- 
-- ISSUE: RLS policies on conversation_members reference the same table,
-- causing infinite recursion (error code 42P17).
-- 
-- SOLUTION: Disable RLS on chat tables and rely on API-layer authentication.
-- All chat API routes already implement header-based authentication 
-- (x-user-username, x-user-role) and proper authorization checks.
--
-- ============================================================================

-- Drop all existing RLS policies on chat tables
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view members of their conversations" ON conversation_members;
DROP POLICY IF EXISTS "Users can add members to conversations they created" ON conversation_members;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

DROP POLICY IF EXISTS "Users can view read receipts for their conversations" ON message_read_receipts;
DROP POLICY IF EXISTS "Users can mark messages as read" ON message_read_receipts;

-- Disable RLS on all chat tables
-- Security is handled at the API layer with header-based authentication
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts DISABLE ROW LEVEL SECURITY;

-- Add comment explaining the security model
COMMENT ON TABLE conversations IS 'Chat conversations. RLS disabled - security handled in API layer with header-based auth (x-user-username, x-user-role)';
COMMENT ON TABLE conversation_members IS 'Chat conversation membership. RLS disabled - security handled in API layer';
COMMENT ON TABLE messages IS 'Chat messages. RLS disabled - security handled in API layer';
COMMENT ON TABLE message_read_receipts IS 'Message read tracking. RLS disabled - security handled in API layer';
