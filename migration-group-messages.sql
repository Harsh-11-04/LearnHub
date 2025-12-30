-- =====================================================
-- GROUP MESSAGES TABLE FOR WHATSAPP-LIKE CHAT
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create group_messages table with file support
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view group messages" ON group_messages 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON group_messages 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON group_messages 
    FOR DELETE USING (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created ON group_messages(created_at DESC);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

-- =====================================================
-- STUDY GROUPS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view groups" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON study_groups 
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;

-- =====================================================
-- DONE! Group messages will now persist with file support
-- =====================================================
