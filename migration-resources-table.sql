-- =====================================================
-- RESOURCES TABLE SETUP FOR LEARNHUB
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create the resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    type TEXT DEFAULT 'notes',
    url TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    downloads INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies

-- Anyone can view resources
CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

-- Authenticated users can create resources
CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own resources
CREATE POLICY "Users can update own resources" ON resources
    FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own resources
CREATE POLICY "Users can delete own resources" ON resources
    FOR DELETE USING (auth.uid() = author_id);

-- Step 4: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resources_author ON resources(author_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_created ON resources(created_at DESC);

-- Step 5: Enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE resources;

-- =====================================================
-- STORAGE BUCKET SETUP (Run this separately or via Dashboard)
-- =====================================================
-- Go to Supabase Dashboard > Storage > Create new bucket
-- Name: resources
-- Public: YES (so files can be downloaded)
-- 
-- Then create these policies via SQL:

-- CREATE POLICY "Anyone can view resource files" ON storage.objects
--     FOR SELECT USING (bucket_id = 'resources');

-- CREATE POLICY "Authenticated users can upload" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'resources' AND 
--         auth.role() = 'authenticated'
--     );

-- =====================================================
-- DONE! Resources will now persist in Supabase
-- =====================================================
