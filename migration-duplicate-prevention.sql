-- Add duplicate prevention constraints to resources table
-- Run this in your Supabase SQL editor

-- 1. Add file_hash column for duplicate file detection
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- 2. Create index for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_resources_title_subject 
ON resources(title, subject);

-- 3. Add unique constraint to prevent exact duplicates
-- Note: This will prevent exact matches of title + subject + author
-- Comment out if you want users to upload same resource multiple times
-- ALTER TABLE resources 
-- ADD CONSTRAINT unique_resource_per_user 
-- UNIQUE (title, subject, author_id);

-- 4. Create function to check for similar resources
CREATE OR REPLACE FUNCTION check_duplicate_resource(
  p_title TEXT,
  p_subject TEXT,
  p_author_id UUID
) RETURNS TABLE (
  id UUID,
  title TEXT,
  subject TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.title, r.subject, r.created_at
  FROM resources r
  WHERE 
    LOWER(r.title) = LOWER(p_title)
    AND r.subject = p_subject
    AND r.author_id = p_author_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 5. Add trigger to generate file hash (if you want automatic hash generation)
-- This requires pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMENT ON COLUMN resources.file_hash IS 'SHA256 hash of uploaded file for duplicate detection';
