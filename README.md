# 🎓 LearnHub — Peer-to-Peer Learning & Resource Sharing Platform

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

> A peer-to-peer learning platform where students share resources, collaborate in study groups, and support each other academically. 📚

---

## 📘 Project Overview
**LearnHub** is a full-stack peer-to-peer learning platform with Supabase backend integration. It enables collaborative learning through resource sharing, real-time notifications, gamification, and community features.

---

## ✨ Features

### 📚 Core Features
- Resource upload with file validation & Supabase Storage
- Subject-based categorization and search
- 1–5 star rating system
- Bookmarks/Favorites
- Comments & Discussions
- Content Reporting

### 👥 Social Features
- Follow users
- Real-time notifications
- Activity feed

### 🏆 Gamification
- Achievement badges
- Points & Levels
- Leaderboard

### 🛡️ Admin Portal
- User management
- Content moderation
- Analytics dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (Auth, Database, Storage) |
| State | React Hooks, Context API |
| Testing | Vitest, React Testing Library |
| CI/CD | GitHub Actions |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Harsh-11-04/LearnHub.git
cd LearnHub

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your Supabase credentials to .env

# Run database migration (in Supabase SQL Editor)
# Open migration-all-features.sql and run it

# Start dev server
npm run dev
```

---

## 📦 Environment Variables

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📁 Project Structure
```
src/
 ├── components/     # Reusable UI components
 ├── pages/          # Application pages
 ├── services/       # API services (Supabase)
 ├── contexts/       # Global state/context
 ├── lib/            # Utilities and helpers
 └── types/          # TypeScript types
```

---

## 🧪 Testing

```bash
npm test        # Run tests
npm run build   # Production build
```

---

## 👤 Author
**Harsh Pawar**  
Peer-to-Peer Learning Platform

---

*Made with ❤️ for collaborative learning*
