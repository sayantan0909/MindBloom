-- =====================================================
-- PEER-TO-PEER SUPPORT SYSTEM SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor to enable P2P support

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PEER SUPPORT CHATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS peer_support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL,
    initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. PEER SUPPORT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS peer_support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES peer_support_chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE peer_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_support_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES FOR PEER_SUPPORT_CHATS
-- =====================================================

-- Users can view their own chats (as initiator or recipient)
DROP POLICY IF EXISTS "Users can view their own chats" ON peer_support_chats;
CREATE POLICY "Users can view their own chats"
    ON peer_support_chats FOR SELECT
    USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

-- Users can insert their own chats (as initiator)
DROP POLICY IF EXISTS "Users can insert their own chats" ON peer_support_chats;
CREATE POLICY "Users can insert their own chats"
    ON peer_support_chats FOR INSERT
    WITH CHECK (auth.uid() = initiator_id);

-- Users can update their own chats
DROP POLICY IF EXISTS "Users can update their own chats" ON peer_support_chats;
CREATE POLICY "Users can update their own chats"
    ON peer_support_chats FOR UPDATE
    USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

-- =====================================================
-- 5. RLS POLICIES FOR PEER_SUPPORT_MESSAGES
-- =====================================================

-- Users can view messages in their chats
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

-- Users can insert messages in their chats
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON peer_support_messages;
CREATE POLICY "Users can insert messages in their chats"
    ON peer_support_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM peer_support_chats 
            WHERE id = chat_id 
            AND (initiator_id = auth.uid() OR recipient_id = auth.uid())
        )
    );

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for finding waiting peers in a room
CREATE INDEX IF NOT EXISTS idx_peer_support_chats_room_status 
    ON peer_support_chats(room_id, status);

-- Index for finding user's active chats
CREATE INDEX IF NOT EXISTS idx_peer_support_chats_initiator_status 
    ON peer_support_chats(initiator_id, status);

-- Index for chat messages ordered by time
CREATE INDEX IF NOT EXISTS idx_peer_support_messages_chat_time 
    ON peer_support_messages(chat_id, created_at);

-- Index for checking user's messages
CREATE INDEX IF NOT EXISTS idx_peer_support_messages_sender 
    ON peer_support_messages(sender_id);

-- =====================================================
-- 7. REALTIME PUBLICATION (for live updates)
-- =====================================================

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE peer_support_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE peer_support_messages;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- You can now use the P2P support system!
-- The application will handle matching and messaging.
