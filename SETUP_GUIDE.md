# 🚀 LearnHub Setup Guide

This guide explains how to set up and run LearnHub on a new computer with Supabase integration.

---

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **A Supabase Account** - [Sign up free](https://supabase.com/)

---

## 🔧 Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/peer-to-peer-learning-platform.git
cd peer-to-peer-learning-platform/LearnHub
```

---

## 🗄️ Step 2: Set Up Supabase Project

### 2.1 Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** `LearnHub` (or any name you prefer)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose the closest to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for the project to be ready

### 2.2 Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long JWT token starting with `eyJ...`)

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create the Environment File

In the `LearnHub` folder, create a new file called `.env.local`:

```bash
# On Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# On Mac/Linux
touch .env.local
```

### 3.2 Add Your Supabase Credentials

Open `.env.local` and add:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here
```

> ⚠️ **Replace** the placeholder values with your actual Supabase project URL and anon key!

---

## 🗃️ Step 4: Set Up the Database

### 4.1 Run the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open the file `database-schema.sql` from the project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)

You should see a success message:
```
✅ LearnHub database schema created successfully!
Tables created: profiles, connections, code_sessions, questions, answers, resources, study_groups, posts, activities
```

### 4.2 (Optional) Run Additional Migrations

If you need admin features, also run these SQL files in order:
1. `migration-admin-setup.sql`
2. `migration-posts-table.sql`
3. `migration-resources-table.sql`
4. `migration-group-messages.sql`

---

## 📦 Step 5: Install Dependencies

```bash
npm install
```

This will install all required packages (may take 2-3 minutes).

---

## 🚀 Step 6: Run the Application

```bash
npm run dev
```

The app will start at: **http://localhost:5173** (or similar port)

---

## ✅ Verify Everything Works

1. Open the app in your browser
2. Click **"Get Started"** or **"Sign Up"**
3. Create a new account with email/password
4. You should be able to:
   - Create posts in the Feed
   - Upload resources
   - Create/join study groups
   - Use the Q&A forum

---

## 🔐 (Optional) Enable GitHub OAuth Login

### 5.1 Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `LearnHub`
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Click **"Register application"**
5. Copy the **Client ID** and generate a **Client Secret**

### 5.2 Configure in Supabase

1. Go to **Authentication** → **Providers**
2. Find **GitHub** and enable it
3. Paste your Client ID and Client Secret
4. Save

---

## 🛠️ Troubleshooting

### "Supabase environment variables not found"
- Make sure `.env.local` file exists in the `LearnHub` folder
- Check that variables start with `VITE_`
- Restart the dev server after creating/modifying `.env.local`

### "Invalid API key"
- Double-check you copied the **anon public** key (not the service_role key)
- Ensure there are no extra spaces in the key

### "Table does not exist"
- Run the `database-schema.sql` script in Supabase SQL Editor
- Make sure the script ran without errors

### "User already registered"
- The email is already in use
- Use a different email or reset the password

---

## 📁 Project Structure

```
LearnHub/
├── .env.local              # Your environment variables (create this!)
├── .env.local.example      # Example file (reference only)
├── database-schema.sql     # Supabase database schema
├── src/
│   ├── lib/
│   │   └── supabase.ts     # Supabase client configuration
│   ├── services/           # API services
│   ├── pages/              # App pages
│   └── components/         # UI components
└── package.json
```

---

## 🌐 Deploy to Production

### Deploy Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Update Supabase Auth Settings

For production, update in Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to **Site URL**
3. Add redirect URLs as needed

---

## 📞 Need Help?

- Check the [Supabase Docs](https://supabase.com/docs)
- Review [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- Open an issue on GitHub

---

*Happy Learning! 🎓*
