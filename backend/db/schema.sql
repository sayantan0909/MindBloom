-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Linked to auth.users.id
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_picture TEXT,
  language_preference TEXT DEFAULT 'en',
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  college_name TEXT,
  department TEXT,
  year_of_study INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- 2. SCREENING TESTS
-- =====================================================
CREATE TABLE screening_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('PHQ9', 'GAD7', 'PSS', 'PSQI', 'ACADEMIC_STRESS', 'SOCIAL_CONNECTEDNESS')),
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responses JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  severity_level TEXT NOT NULL,
  recommendations TEXT[],
  flagged_for_intervention BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE INDEX idx_screening_user_id ON screening_tests(user_id);
CREATE INDEX idx_screening_test_date ON screening_tests(test_date DESC);

-- =====================================================
-- 3. EXPRESSION ANALYSIS SESSIONS
-- =====================================================
CREATE TABLE expression_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  dominant_emotion TEXT,
  emotion_distribution JSONB, -- {happy: 0.3, sad: 0.2, ...}
  stress_indicator FLOAT CHECK (stress_indicator >= 0 AND stress_indicator <= 100),
  recommendation TEXT
);

CREATE INDEX idx_expression_user_id ON expression_sessions(user_id);

-- =====================================================
-- 4. VOICE ANALYSIS SESSIONS
-- =====================================================
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avg_pitch_hz FLOAT,
  speech_rate_wpm INTEGER,
  pause_frequency FLOAT,
  stress_score FLOAT CHECK (stress_score >= 0 AND stress_score <= 100),
  transcript TEXT,
  sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  recommendation TEXT
);

CREATE INDEX idx_voice_user_id ON voice_sessions(user_id);

-- =====================================================
-- 5. COUNSELORS
-- =====================================================
CREATE TABLE counselors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specializations TEXT[] DEFAULT '{}',
  languages_spoken TEXT[] DEFAULT '{}',
  bio TEXT,
  profile_picture TEXT,
  session_types TEXT[] DEFAULT '{}', -- ['online', 'in-person']
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. COUNSELOR AVAILABILITY
-- =====================================================
CREATE TABLE counselor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counselor_id UUID REFERENCES counselors(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 45,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_availability_counselor ON counselor_availability(counselor_id);

-- =====================================================
-- 7. APPOINTMENTS
-- =====================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  counselor_id UUID REFERENCES counselors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT CHECK (session_type IN ('online', 'in-person')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled')),
  user_notes TEXT,
  counselor_notes TEXT,
  meeting_link TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_counselor ON appointments(counselor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- =====================================================
-- 8. VIDEO RESOURCES
-- =====================================================
CREATE TABLE video_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT, -- 'stress_management', 'motivation', 'success_stories'
  language TEXT DEFAULT 'en',
  duration_minutes INTEGER,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_category ON video_resources(category);
CREATE INDEX idx_videos_language ON video_resources(language);

-- =====================================================
-- 9. AUDIO RESOURCES
-- =====================================================
CREATE TABLE audio_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('nature', 'meditation', 'breathing', 'sleep', 'music')),
  duration_minutes INTEGER,
  language TEXT DEFAULT 'en',
  plays_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_category ON audio_resources(category);

-- =====================================================
-- 10. USER MEDIA INTERACTIONS
-- =====================================================
CREATE TABLE user_video_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_resources(id) ON DELETE CASCADE,
  liked BOOLEAN DEFAULT FALSE,
  saved BOOLEAN DEFAULT FALSE,
  watch_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE TABLE user_audio_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  audio_id UUID REFERENCES audio_resources(id) ON DELETE CASCADE,
  plays_count INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, audio_id)
);

-- =====================================================
-- 11. GAME SESSIONS
-- =====================================================
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL, -- 'breathing', 'memory_match', 'gratitude_tree'
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  score INTEGER DEFAULT 0,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_games_user_id ON game_sessions(user_id);

-- =====================================================
-- 12. FORUM POSTS (Peer Support)
-- =====================================================
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_user_id UUID NOT NULL, -- Hash of user_id for anonymity
  category TEXT NOT NULL, -- 'academic_stress', 'relationships', 'anxiety', 'depression', 'general'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT FALSE,
  flagged_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  responses_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_forum_category ON forum_posts(category);
CREATE INDEX idx_forum_created ON forum_posts(created_at DESC);

-- =====================================================
-- 13. FORUM RESPONSES
-- =====================================================
CREATE TABLE forum_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  anonymous_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes_count INTEGER DEFAULT 0,
  is_helpful BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_responses_post ON forum_responses(post_id);

-- =====================================================
-- 14. PEER CHATS
-- =====================================================
CREATE TABLE peer_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_anonymous_id UUID NOT NULL,
  user2_anonymous_id UUID NOT NULL,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 15. PEER MESSAGES
-- =====================================================
CREATE TABLE peer_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES peer_chats(id) ON DELETE CASCADE,
  sender_anonymous_id UUID NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_chat ON peer_messages(chat_id);

-- =====================================================
-- 16. CHATBOT CONVERSATIONS
-- =====================================================
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  crisis_detected BOOLEAN DEFAULT FALSE,
  sentiment_trend TEXT, -- 'improving', 'declining', 'stable'
  avg_sentiment FLOAT
);

CREATE INDEX idx_chatbot_user ON chatbot_conversations(user_id);

-- =====================================================
-- 17. CHATBOT MESSAGES
-- =====================================================
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1)
);

CREATE INDEX idx_chatbot_messages_conv ON chatbot_messages(conversation_id);

-- =====================================================
-- 18. ADMINS
-- =====================================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'counselor_admin', 'content_admin', 'moderator')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 19. INTERVENTION LOGS
-- =====================================================
CREATE TABLE intervention_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admins(id),
  intervention_type TEXT, -- 'crisis_call', 'counselor_referral', 'emergency_contact'
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 20. NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT, -- 'appointment', 'forum_response', 'system', 'wellness_tip'
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- =====================================================
-- 21. TRANSLATIONS (for multi-language support)
-- =====================================================
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_key TEXT NOT NULL,
  language_code TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  category TEXT, -- 'ui', 'screening_test', 'resource'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(translation_key, language_code)
);

CREATE INDEX idx_translations_key ON translations(translation_key);

-- =====================================================
-- 22. SYSTEM SETTINGS
-- =====================================================
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('crisis_helplines', '{"india": [{"name": "COOJ", "number": "9152987821"}]}', 'Emergency helpline numbers'),
('appointment_slot_duration', '45', 'Default appointment duration in minutes'),
('max_peer_chat_duration_hours', '2', 'Maximum peer chat session duration');
