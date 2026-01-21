export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    profile_picture: string | null
                    language_preference: string
                    date_of_birth: string | null
                    gender: string | null
                    phone: string | null
                    college_name: string | null
                    department: string | null
                    year_of_study: number | null
                    created_at: string
                    last_login: string | null
                    is_active: boolean
                }
                Insert: {
                    id: string
                    email: string
                    name?: string | null
                    profile_picture?: string | null
                    language_preference?: string
                    date_of_birth?: string | null
                    gender?: string | null
                    phone?: string | null
                    college_name?: string | null
                    department?: string | null
                    year_of_study?: number | null
                    created_at?: string
                    last_login?: string | null
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    profile_picture?: string | null
                    language_preference?: string
                    date_of_birth?: string | null
                    gender?: string | null
                    phone?: string | null
                    college_name?: string | null
                    department?: string | null
                    year_of_study?: number | null
                    created_at?: string
                    last_login?: string | null
                    is_active?: boolean
                }
            }
            expression_sessions: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    duration: number
                    stress_score: number
                    emotions_distribution: Json
                    dominant_emotion: string
                    notes: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    duration: number
                    stress_score: number
                    emotions_distribution: Json
                    dominant_emotion: string
                    notes?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    duration?: number
                    stress_score?: number
                    emotions_distribution?: Json
                    dominant_emotion?: string
                    notes?: string | null
                }
            }
            voice_sessions: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    audio_url: string | null
                    transcript: string | null
                    analysis_data: Json
                    stress_score: number
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    audio_url?: string | null
                    transcript?: string | null
                    analysis_data?: Json
                    stress_score?: number
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    audio_url?: string | null
                    transcript?: string | null
                    analysis_data?: Json
                    stress_score?: number
                }
            }
            counselors: {
                Row: {
                    id: string
                    user_id: string
                    specialization: string[]
                    bio: string | null
                    languages: string[]
                    rating: number
                    availability_status: string // 'available', 'busy', 'offline'
                }
                Insert: {
                    id?: string
                    user_id: string
                    specialization?: string[]
                    bio?: string | null
                    languages?: string[]
                    rating?: number
                    availability_status?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    specialization?: string[]
                    bio?: string | null
                    languages?: string[]
                    rating?: number
                    availability_status?: string
                }
            }
            counselor_availability: {
                Row: {
                    id: string
                    counselor_id: string
                    day_of_week: number // 0-6
                    start_time: string // 'HH:MM'
                    end_time: string // 'HH:MM'
                }
                Insert: {
                    id?: string
                    counselor_id: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                }
                Update: {
                    id?: string
                    counselor_id?: string
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    user_id: string
                    counselor_id: string
                    scheduled_at: string
                    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    meeting_link: string | null
                    user_notes: string | null
                    counselor_notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    counselor_id: string
                    scheduled_at: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    meeting_link?: string | null
                    user_notes?: string | null
                    counselor_notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    counselor_id?: string
                    scheduled_at?: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    meeting_link?: string | null
                    user_notes?: string | null
                    counselor_notes?: string | null
                    created_at?: string
                }
            }
            forum_posts: {
                Row: {
                    id: string
                    user_id: string | null // Nullable for complete anonymity if desired, or handled via display
                    category: string
                    title: string
                    content: string
                    is_anonymous: boolean
                    upvotes: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    category: string
                    title: string
                    content: string
                    is_anonymous?: boolean
                    upvotes?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    category?: string
                    title?: string
                    content?: string
                    is_anonymous?: boolean
                    upvotes?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            forum_responses: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string | null
                    content: string
                    is_anonymous: boolean
                    upvotes: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id?: string | null
                    content: string
                    is_anonymous?: boolean
                    upvotes?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string | null
                    content?: string
                    is_anonymous?: boolean
                    upvotes?: number
                    created_at?: string
                }
            }
            peer_chats: {
                Row: {
                    id: string
                    initiator_id: string
                    recipient_id: string | null // Nullable until matched
                    status: 'active' | 'ended' | 'waiting'
                    created_at: string
                    ended_at: string | null
                }
                Insert: {
                    id?: string
                    initiator_id: string
                    recipient_id?: string | null
                    status?: 'active' | 'ended' | 'waiting'
                    created_at?: string
                    ended_at?: string | null
                }
                Update: {
                    id?: string
                    initiator_id?: string
                    recipient_id?: string | null
                    status?: 'active' | 'ended' | 'waiting'
                    created_at?: string
                    ended_at?: string | null
                }
            }
            peer_messages: {
                Row: {
                    id: string
                    chat_id: string
                    sender_id: string
                    content: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    chat_id: string
                    sender_id: string
                    content: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    chat_id?: string
                    sender_id?: string
                    content?: string
                    is_read?: boolean
                    created_at?: string
                }
            }
            peer_support_chats: {
                Row: {
                    id: string
                    initiator_id: string
                    recipient_id: string | null
                    room_id: string
                    status: 'active' | 'ended' | 'waiting'
                    first_message: string | null
                    created_at: string
                    ended_at: string | null
                }
                Insert: {
                    id?: string
                    initiator_id: string
                    recipient_id?: string | null
                    room_id: string
                    status?: 'active' | 'ended' | 'waiting'
                    first_message?: string | null
                    created_at?: string
                    ended_at?: string | null
                }
                Update: {
                    id?: string
                    initiator_id?: string
                    recipient_id?: string | null
                    room_id?: string
                    status?: 'active' | 'ended' | 'waiting'
                    first_message?: string | null
                    created_at?: string
                    ended_at?: string | null
                }
            }
            peer_support_messages: {
                Row: {
                    id: string
                    chat_id: string
                    sender_id: string | null
                    sender_type: 'user' | 'ai' | 'system'
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    chat_id: string
                    sender_id?: string | null
                    sender_type?: 'user' | 'ai' | 'system'
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    chat_id?: string
                    sender_id?: string | null
                    sender_type?: 'user' | 'ai' | 'system'
                    content?: string
                    created_at?: string
                }
            }

            chatbot_conversations: {
                Row: {
                    id: string
                    user_id: string
                    title: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            chatbot_messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender: 'user' | 'bot'
                    content: string
                    sentiment_score: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender: 'user' | 'bot'
                    content: string
                    sentiment_score?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender?: 'user' | 'bot'
                    content?: string
                    sentiment_score?: number | null
                    created_at?: string
                }
            }
            video_resources: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    url: string
                    thumbnail_url: string | null
                    category: string
                    duration: number | null // in seconds
                    language: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    url: string
                    thumbnail_url?: string | null
                    category: string
                    duration?: number | null
                    language?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    url?: string
                    thumbnail_url?: string | null
                    category?: string
                    duration?: number | null
                    language?: string
                    created_at?: string
                }
            }
            audio_resources: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    url: string
                    thumbnail_url: string | null
                    category: string
                    duration: number | null
                    language: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    url: string
                    thumbnail_url?: string | null
                    category: string
                    duration?: number | null
                    language?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    url?: string
                    thumbnail_url?: string | null
                    category?: string
                    duration?: number | null
                    language?: string
                    created_at?: string
                }
            }
            user_video_interactions: {
                Row: {
                    id: string
                    user_id: string
                    video_id: string
                    watched_at: string
                    progress: number // percentage 0-100 or seconds
                    completed: boolean
                    liked: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    video_id: string
                    watched_at?: string
                    progress?: number
                    completed?: boolean
                    liked?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    video_id?: string
                    watched_at?: string
                    progress?: number
                    completed?: boolean
                    liked?: boolean
                }
            }
            user_audio_interactions: {
                Row: {
                    id: string
                    user_id: string
                    audio_id: string
                    listened_at: string
                    progress: number
                    completed: boolean
                    liked: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    audio_id: string
                    listened_at?: string
                    progress?: number
                    completed?: boolean
                    liked?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    audio_id?: string
                    listened_at?: string
                    progress?: number
                    completed?: boolean
                    liked?: boolean
                }
            }
            game_sessions: {
                Row: {
                    id: string
                    user_id: string
                    game_type: string
                    score: number
                    duration: number
                    mood_rating_before: number | null
                    mood_rating_after: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    game_type: string
                    score?: number
                    duration?: number
                    mood_rating_before?: number | null
                    mood_rating_after?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    game_type?: string
                    score?: number
                    duration?: number
                    mood_rating_before?: number | null
                    mood_rating_after?: number | null
                    created_at?: string
                }
            }
            screening_tests: {
                Row: {
                    id: string
                    user_id: string
                    test_type: 'PHQ9' | 'GAD7' | 'PSS' | 'PSQI' | 'ACADEMIC_STRESS' | 'SOCIAL_CONNECTEDNESS'
                    test_date: string
                    responses: Json
                    total_score: number
                    severity_level: string
                    recommendations: string[]
                    flagged_for_intervention: boolean
                    notes: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    test_type: 'PHQ9' | 'GAD7' | 'PSS' | 'PSQI' | 'ACADEMIC_STRESS' | 'SOCIAL_CONNECTEDNESS'
                    test_date?: string
                    responses: Json
                    total_score: number
                    severity_level: string
                    recommendations?: string[]
                    flagged_for_intervention?: boolean
                    notes?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    test_type?: 'PHQ9' | 'GAD7' | 'PSS' | 'PSQI' | 'ACADEMIC_STRESS' | 'SOCIAL_CONNECTEDNESS'
                    test_date?: string
                    responses?: Json
                    total_score?: number
                    severity_level?: string
                    recommendations?: string[]
                    flagged_for_intervention?: boolean
                    notes?: string | null
                }
            }
            admins: {
                Row: {
                    id: string
                    user_id: string
                    role: 'super_admin' | 'moderator'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    role?: 'super_admin' | 'moderator'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    role?: 'super_admin' | 'moderator'
                    created_at?: string
                }
            }
            intervention_logs: {
                Row: {
                    id: string
                    user_id: string
                    admin_id: string
                    intervention_type: string
                    description: string | null
                    outcome: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    admin_id: string
                    intervention_type: string
                    description?: string | null
                    outcome?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    admin_id?: string
                    intervention_type?: string
                    description?: string | null
                    outcome?: string | null
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: 'appointment' | 'forum_response' | 'system' | 'wellness_tip'
                    title: string
                    message: string
                    link: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'appointment' | 'forum_response' | 'system' | 'wellness_tip'
                    title: string
                    message: string
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'appointment' | 'forum_response' | 'system' | 'wellness_tip'
                    title?: string
                    message?: string
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
            }
            translations: {
                Row: {
                    id: string
                    key: string
                    language_code: string
                    value: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    language_code: string
                    value: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    language_code?: string
                    value?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
