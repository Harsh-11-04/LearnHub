-- ============================================
-- Migration: Add file upload support to existing tables
-- ============================================
-- Run this if you already have the tables created
-- and just need to add the new file upload columns

-- Add new columns to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'notes',
ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Storage policies for file uploads (run if policies don't exist)

-- Allow authenticated users to upload files to resources bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow authenticated uploads to resources'
    ) THEN
        CREATE POLICY "Allow authenticated uploads to resources"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'resources');
    END IF;
END $$;

-- Allow public to read/download files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow public reads from resources'
    ) THEN
        CREATE POLICY "Allow public reads from resources"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'resources');
    END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Added columns: file_name, file_size, file_type, type, downloads, average_rating';
    RAISE NOTICE 'Storage policies configured for resources bucket';
END $$;
