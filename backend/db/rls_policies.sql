-- =====================================================
-- STEP 1: ENABLE RLS ON USER-SPECIFIC TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expression_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audio_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_resources ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: USERS POLICIES
-- =====================================================

CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
WITH CHECK (id = auth.uid());

-- =====================================================
-- STEP 3: USER DATA ACCESS (Direct ID match)
-- =====================================================

-- Screening Tests
CREATE POLICY "User screening access"
ON screening_tests
FOR ALL
USING (user_id = auth.uid());

-- Expression Sessions
CREATE POLICY "User expression access"
ON expression_sessions
FOR ALL
USING (user_id = auth.uid());

-- Voice Sessions
CREATE POLICY "User voice access"
ON voice_sessions
FOR ALL
USING (user_id = auth.uid());

-- Game Sessions
CREATE POLICY "User game access"
ON game_sessions
FOR ALL
USING (user_id = auth.uid());

-- Chatbot Conversations
CREATE POLICY "User chatbot conversation access"
ON chatbot_conversations
FOR ALL
USING (user_id = auth.uid());

-- Chatbot Messages (Linked via conversation)
CREATE POLICY "User chatbot message access"
ON chatbot_messages
FOR ALL
USING (
  conversation_id IN (
    SELECT id FROM chatbot_conversations
    WHERE user_id = auth.uid()
  )
);

-- User Video Interactions
CREATE POLICY "User video interaction access"
ON user_video_interactions
FOR ALL
USING (user_id = auth.uid());

-- User Audio Interactions
CREATE POLICY "User audio interaction access"
ON user_audio_interactions
FOR ALL
USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "User notification access"
ON notifications
FOR ALL
USING (user_id = auth.uid());

-- =====================================================
-- STEP 4: APPOINTMENTS
-- =====================================================

CREATE POLICY "User appointment access"
ON appointments
FOR SELECT
USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: FORUM POSTS
-- =====================================================

CREATE POLICY "Read approved forum posts"
ON forum_posts
FOR SELECT
USING (is_approved = TRUE AND is_deleted = FALSE);

CREATE POLICY "Create forum posts"
ON forum_posts
FOR INSERT
WITH CHECK (true);

-- =====================================================
-- STEP 6: FORUM RESPONSES
-- =====================================================

CREATE POLICY "Read forum responses"
ON forum_responses
FOR SELECT
USING (is_deleted = FALSE);

CREATE POLICY "Create forum responses"
ON forum_responses
FOR INSERT
WITH CHECK (true);

-- =====================================================
-- STEP 7: PUBLIC RESOURCES
-- =====================================================

CREATE POLICY "Public read translations"
ON translations
FOR SELECT
USING (true);

CREATE POLICY "Public read videos"
ON video_resources
FOR SELECT
USING (is_approved = TRUE);

CREATE POLICY "Public read audio"
ON audio_resources
FOR SELECT
USING (true);
