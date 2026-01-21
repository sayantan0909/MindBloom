-- =====================================================
-- PEER-TO-PEER SUPPORT SYSTEM SCHEMA (UPDATED)
-- =====================================================

-- 1. Modify peer_support_messages to allow AI messages
-- We make sender_id nullable to indicate AI/System messages
ALTER TABLE peer_support_messages ALTER COLUMN sender_id DROP NOT NULL;

-- Add a column to explicitly mark AI messages
ALTER TABLE peer_support_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'ai', 'system'));

-- 2. Add description/first message to peer_support_chats 
-- This helps potential peers see what the person is going through
ALTER TABLE peer_support_chats ADD COLUMN IF NOT EXISTS first_message TEXT;

-- 3. Update RLS for AI messages
-- Ensure users can still see messages where sender_id is null (AI messages)
DROP POLICY IF EXISTS "Users can view messages in their chats" ON peer_support_messages;
CREATE POLICY "Users can view messages in their chats"
    ON peer_support_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM peer_support_chats 
            WHERE id = chat_id 
            AND (initiator_id = auth.uid() OR recipient_id = auth.uid())
        )
    );

-- 4. Create a view or policy for "Support Dashboard"
-- Allow users to see 'waiting' chats from others to join as peers
DROP POLICY IF EXISTS "Users can view waiting chats" ON peer_support_chats;
CREATE POLICY "Users can view waiting chats"
    ON peer_support_chats FOR SELECT
    USING (status = 'waiting');

-- 5. Enable RLS for the new policy
ALTER TABLE peer_support_chats ENABLE ROW LEVEL SECURITY;
