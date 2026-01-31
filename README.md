# 🌱 MindBloom

MindBloom is a mental health support web application designed for students, combining **AI-powered assistance**, **anonymous peer-to-peer support**, and **mindfulness resources** in a calm, safe, and privacy-focused environment.

The platform ensures that users are **never alone** — when peers are unavailable, an empathetic AI steps in instantly.

---

## ✨ Key Features

### 🤝 Peer-to-Peer Support
- Anonymous, real-time peer conversations
- Room-based matching system
- Seamless transition from AI chat to live peer support
- Persistent chat history when a peer joins

### 🤖 AI-First Responder
- Instant AI support when peers are unavailable
- Empathetic, conversational responses
- AI chat history shared with peers upon joining
- Graceful fallback handling

### 🔒 Privacy & Safety
- Fully anonymous identities (“Peer Listener”, “AI Assistant”)
- Row Level Security (RLS) enforced at the database level
- No personal identifiers exposed

### 🌿 Mindfulness & Resources
- Mindful Maze: a therapeutic, non-competitive mindfulness experience
- Breathing guidance and ambient sound support
- Curated mental health resources

### 🎨 User Experience
- Calm, nature-inspired design
- Glassmorphism UI with dark mode
- Smooth animations using Framer Motion
- Fully responsive layout

---

## 🧠 Tech Stack

**Frontend**
- Next.js (App Router)
- React
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Emoji Picker (peer chat only)

**Backend**
- Supabase (PostgreSQL, Auth, Realtime)
- Row Level Security (RLS)

**AI**
- Gemini API

---

## ▶️ Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm

### Installation
```bash
npm install

### Optional Features

Some experimental or optional features require additional dependencies.

#### MediaPipe (Experimental)
Used for future vision-based mindfulness features.

```bash
npm install @mediapipe/tasks-vision
