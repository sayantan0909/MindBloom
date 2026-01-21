-- =====================================================
-- PEER-TO-PEER SUPPORT SYSTEM RLS FIX (TOTAL)
-- =====================================================

-- 1. Enable RLS (just in case)
ALTER TABLE peer_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Allow any authenticated user to see 'waiting' chats
-- This is essential for the "Support Others" dashboard
DROP POLICY IF EXISTS "Users can view waiting chats" ON peer_support_chats;
CREATE POLICY "Users can view waiting chats"
    ON peer_support_chats FOR SELECT
    TO authenticated
    USING (status = 'waiting');

-- 3. Ensure users can see their own active/ended chats
DROP POLICY IF EXISTS "Users can view their own chats" ON peer_support_chats;
CREATE POLICY "Users can view their own chats"
    ON peer_support_chats FOR SELECT
    TO authenticated
    USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

-- 4. Allow users to join waiting chats (set recipient_id)
DROP POLICY IF EXISTS "Users can join waiting chats" ON peer_support_chats;
CREATE POLICY "Users can join waiting chats"
    ON peer_support_chats FOR UPDATE
    TO authenticated
    USING (status = 'waiting')
    WITH CHECK (auth.uid() = recipient_id AND status = 'active');

-- 5. Message Policies (Allow viewing messages if part of the chat)
DROP POLICY IF EXISTS "Users can view messages in their chats" ON peer_support_messages;
CREATE POLICY "Users can view messages in their chats"
    ON peer_support_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM peer_support_chats 
            WHERE id = chat_id 
            AND (initiator_id = auth.uid() OR recipient_id = auth.uid())
        )
    );

-- 6. Grant basic permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON peer_support_chats TO authenticated;
GRANT SELECT, INSERT ON peer_support_messages TO authenticated;

-- 7. User Profile Visibility (Fixes "no profile found" issue)
DROP POLICY IF EXISTS "Anyone can view any profile" ON users;
CREATE POLICY "Anyone can view any profile"
    ON users FOR SELECT
    TO authenticated
    USING (true);
