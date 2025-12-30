-- ============================================
-- LearnHub Database Schema for Supabase
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This will create all tables and security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user',
  bio TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  college TEXT,
  tech_stack TEXT[],
  interests TEXT[],
  github_profile TEXT,
  linkedin_profile TEXT,
  contributions INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- CONNECTIONS TABLE (PeerMatch)
-- ============================================
CREATE TABLE connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user, to_user)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Users can update their connection requests"
  ON connections FOR UPDATE
  USING (auth.uid() = to_user);

-- ============================================
-- CODE SESSIONS TABLE (CodeSpace)
-- ============================================
CREATE TABLE code_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE session_participants (
  session_id UUID REFERENCES code_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

ALTER TABLE code_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sessions"
  ON code_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create sessions"
  ON code_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host and participants can update sessions"
  ON code_sessions FOR UPDATE
  USING (
    auth.uid() = host_id OR 
    EXISTS (
      SELECT 1 FROM session_participants 
      WHERE session_id = code_sessions.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view session participants"
  ON session_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join sessions"
  ON session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- QUESTIONS TABLE (Q&A)
-- ============================================
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE question_upvotes (
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (question_id, user_id)
);

CREATE TABLE answer_upvotes (
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (answer_id, user_id)
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their questions"
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create answers"
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can view upvotes"
  ON question_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can upvote questions"
  ON question_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view answer upvotes"
  ON answer_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can upvote answers"
  ON answer_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RESOURCES TABLE (with file upload support)
-- ============================================
CREATE TABLE resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  type TEXT DEFAULT 'notes',
  subject TEXT NOT NULL,
  tags TEXT[],
  downloads INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resource_ratings (
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (resource_id, user_id)
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their resources"
  ON resources FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can view ratings"
  ON resource_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can rate resources"
  ON resource_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STUDY GROUPS TABLE
-- ============================================
CREATE TABLE study_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view groups"
  ON study_groups FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON study_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POSTS TABLE (Feed)
-- ============================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE post_likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can view likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ACTIVITIES TABLE (Dashboard)
-- ============================================
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date, activity_type)
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET & POLICIES
-- ============================================
-- Create resources storage bucket (run separately if bucket already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for file uploads
CREATE POLICY "Allow authenticated uploads to resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Allow public reads from resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for questions
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for answers
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ LearnHub database schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, connections, code_sessions, questions, answers, resources, study_groups, posts, activities';
    RAISE NOTICE 'Storage bucket: resources (with upload/download policies)';
    RAISE NOTICE 'All RLS policies enabled and configured';
END $$;
