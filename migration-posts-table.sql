-- =====================================================
-- POSTS TABLE SETUP FOR LEARNHUB FEED
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    likes UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view posts
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON posts 
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts 
    FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts 
    FOR DELETE USING (auth.uid() = author_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- =====================================================
-- DONE! Posts will now persist in Supabase
-- =====================================================
