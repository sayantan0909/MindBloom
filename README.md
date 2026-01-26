This is a NextJS starter .

To get started, take a look at src/app/page.tsx.
P2P Support System Implementation
Phase 1: Database & Backend Setup
 Create Supabase database schema
 peer_support_chats table with RLS policies
 peer_support_messages table with RLS policies
 Indexes for performance
 Create database type definitions for TypeScript
 Set up Supabase Realtime channel configuration
Phase 2: API Routes
 Create peer matching API route (/api/peer-support/match)
 Check for existing active chats
 Match with waiting peers in same room
 Create new waiting chat if no match
 Return match status
 Create AI chat API route (/api/peer-support/ai-chat)
 Integrate with existing Gemini API
 Room-specific context prompts
 Conversational, peer-like responses
 Error handling with fallback messages
Phase 3: Frontend Components
 Create main P2P page (
/app/dashboard/peer-support/page.tsx
)
 Home view with introduction
 Room selection view (5 support rooms)
 Matching view with loading state
 AI chat view (fallback when no peers)
 Live peer chat view (real P2P)
 Implement state management for views
 Add real-time message subscription
 Implement message sending (both AI and peer modes)
Phase 4: Real-Time Features
 Set up Supabase Realtime subscriptions
 Listen for new messages in chat
 Listen for peer joining (background matching)
 Implement peer status updates
 Add typing indicators
 Session timer for live chats
Phase 5: UX Enhancements
 AI-first responder logic (<300ms activation)
 Background peer matching while AI chat active
 Peer-available notification with consent
 Smooth transitions between AI and peer modes
 Anonymous identity handling
 Session end confirmation
Phase 6: Testing & Verification
 Test AI fallback when no peers available
 Test real-time P2P chat across two accounts
 Verify room-based matching
 Test message persistence
 Verify RLS policies work correctly

 P2P Support System Walkthrough
I have successfully implemented the Peer-to-Peer (P2P) support system with an AI-first responder. This system ensures students always have someone to talk to, whether it's an AI assistant or a real fellow student.

Changes Made
1. Database Schema
Created 
peer_support_schema.sql
 with tables for peer_support_chats and peer_support_messages.
Implemented Row Level Security (RLS) for privacy and anonymity.
Enabled Realtime tracking for instant message delivery.
2. API Routes
Matching API: 
/api/peer-support/match
 handles room-based peer connecting.
AI Chat API: 
/api/peer-support/ai-chat
 provides empathetic fallback using Gemini AI.
3. Frontend Integration
Main Page: A beautiful, glassmorphism-style chat interface at 
/dashboard/peer-support
.
Dashboard Shortcut: Added a "Peer Support" card to the main 
dashboard page
.
Smooth UX: Integrated transitions from matching to AI support or live peer chat.
How to Verify
Final Features Implemented
AI-First Support: Instant connection to Gemini AI if peers are busy.
Persistent AI Logs: AI conversations are saved to the DB, allowing peers to read the history when they join.
Support Dashboard: A "Support Others" view where students can see waiting help requests and jump in.
Real-time Matching: Room-based matching with background search while in AI mode.
Polished UI: Glassmorphism, animations, and dark mode support.
Typing Indicators: Real-time feedback for both AI and peer chats.
Verification Steps
Run Migrations: Ensure 
peer_support_schema.sql
 and 
peer_support_schema_update.sql
 are applied in Supabase.
Access Page: Go to /dashboard/peer-support.
Test AI Flow: Select a room, wait for AI to join, and start chatting.
Test Peer Flow: Open the page in another browser/account, see your request in "Support Others", and click "Join & Listen".
Verify Logs: Confirm the peer can see the messages previously sent to/by the AI.
Verify Ending: End the session and confirm matching is cleared.
Note: The system is completely anonymous; users only see "Peer Listener" or "AI Assistant," never real names.

Homepage Color Refresh - Implementation Plan
Goal Description
Refactor the color scheme of the homepage (
src/app/page.tsx
) to align with the "calm forest light clearing at sunrise" aesthetic of the hero.mp4 background video. This involves switching from purple/strong accents to deep muted greens, olive-indigos, and warm golden tones.

Constraint Checklist & Confidence Score:

Analyze current code? Yes.
Plan changes? Yes.
Strict Constraints?
❌ Do NOT change layout? Yes.
❌ Do NOT change spacing/sizing? Yes.
❌ Do NOT change text/font? Yes.
❌ Do NOT change animations? Yes.
❌ Do NOT touch other pages? Yes (Changes isolated to 
page.tsx
).
✅ ONLY adjust colors? Yes. Confidence Score: 5/5
User Review Required
IMPORTANT

This plan modifies only 
src/app/page.tsx
. The "Header" mentioned in the request is implemented directly inside 
page.tsx
, so 
layout.tsx
 will remain untouched to preserve other pages. Global styles in 
globals.css
 are also untouched.

Proposed Changes
Application Layer (src/app/)
[MODIFY] 
page.tsx
Main Container: Change bg-[#603da1] to bg-[#111A14] (Deep Forest Green fallback).
Navigation (Header):
Change bg-black/20 to bg-[#131C16]/80 (Deep Olive-Black transparent).
Change border-white/10 to border-[#2F3E30]/50 (Subtle Moss Border).
Update "Get Started" button gradient from from-purple-600 to-blue-600 to from-[#556B2F] to-[#2E8B57] (Olive to Sea Green).
Hero Section:
Update GradientText colors from ['#5227FF', '#FF9FFC', '#B19EEF'] to ['#C1E1C1', '#F9E4B7', '#D4AF37'] (Tea Green, Champagne, Gold).
Update "Sign In" button gradient to match header button: from-[#556B2F] to-[#2E8B57].
Features Section:
Update Card backgrounds from bg-white/5 to bg-[#1A2F21]/40 (Glassy Green).
Update Icon colors:
Brain: text-purple-400 -> text-[#8FBC8F] (Dark Sea Green).
Users: text-pink-400 -> text-[#DEB887] (Burlywood/Tan).
Shield: text-blue-400 -> text-[#66CDAA] (Medium Aquamarine).
CTA Section:
Update Card border/bg: border-purple-500/30 -> border-[#D4AF37]/30 (Gold), from-purple-900/20 -> from-[#2F3E30]/20 (Dark Green).
Update Button gradient: from-[#556B2F] to-[#2E8B57].
Verification Plan
Manual Verification
Run the app: npm run dev (already running).
Check Homepage:
Verify Header background is deep muted green/olive.
Verify "Get Started" and Hero buttons are green-to-teal/olive.
Verify Hero headline has green/gold gradient.
Verify Feature cards have greenish tint and earth-tone icons.
Verify CTA section matches the theme.
Crucial: Ensure layout remains exactly the same (padding, margins unchanged).