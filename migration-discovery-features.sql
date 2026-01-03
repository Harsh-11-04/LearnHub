-- Discovery & Organization Features
-- Run this in your Supabase SQL editor

-----------------------------------------------------------
-- Tags System
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- Anyone can view tags
CREATE POLICY "Anyone can view tags"
ON tags FOR SELECT TO authenticated USING (true);

-- Authenticated users can create tags
CREATE POLICY "Users can create tags"
ON tags FOR INSERT TO authenticated WITH CHECK (true);

-- Anyone can view resource_tags
CREATE POLICY "Anyone can view resource_tags"
ON resource_tags FOR SELECT TO authenticated USING (true);

-- Users can add tags to their resources
CREATE POLICY "Users can add resource_tags"
ON resource_tags FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM resources 
        WHERE id = resource_id AND author_id = auth.uid()
    )
);

-- Indexes
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);
CREATE INDEX idx_resource_tags_resource ON resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag ON resource_tags(tag_id);

-----------------------------------------------------------
-- Update tag usage count trigger
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_resource_tag_change
AFTER INSERT OR DELETE ON resource_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-----------------------------------------------------------
-- Full-text search
-----------------------------------------------------------

-- Add search vector column to resources
ALTER TABLE resources ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_resources_search ON resources USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION resources_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resources_search_update
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION resources_search_vector_update();

-- Update existing records
UPDATE resources SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(subject, '')), 'C');

-----------------------------------------------------------
-- Search function
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION search_resources(
    search_query TEXT,
    subject_filter TEXT DEFAULT NULL,
    type_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    subject TEXT,
    type TEXT,
    author_id UUID,
    author_name TEXT,
    downloads INTEGER,
    average_rating NUMERIC,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.subject,
        r.type,
        r.author_id,
        p.name as author_name,
        r.downloads,
        r.average_rating,
        r.created_at,
        ts_rank(r.search_vector, websearch_to_tsquery('english', search_query)) as rank
    FROM resources r
    LEFT JOIN profiles p ON r.author_id = p.id
    WHERE 
        (search_query IS NULL OR search_query = '' OR r.search_vector @@ websearch_to_tsquery('english', search_query))
        AND (subject_filter IS NULL OR r.subject = subject_filter)
        AND (type_filter IS NULL OR r.type = type_filter)
    ORDER BY 
        CASE WHEN search_query IS NOT NULL AND search_query != '' THEN rank ELSE 0 END DESC,
        r.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-----------------------------------------------------------
-- Related resources function
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION get_related_resources(
    resource_uuid UUID,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    subject TEXT,
    author_name TEXT,
    downloads INTEGER,
    average_rating NUMERIC
) AS $$
DECLARE
    current_subject TEXT;
    current_vector tsvector;
BEGIN
    SELECT r.subject, r.search_vector INTO current_subject, current_vector
    FROM resources r WHERE r.id = resource_uuid;
    
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.subject,
        p.name as author_name,
        r.downloads,
        r.average_rating
    FROM resources r
    LEFT JOIN profiles p ON r.author_id = p.id
    WHERE r.id != resource_uuid
        AND (r.subject = current_subject OR r.search_vector @@ to_tsquery('english', current_subject))
    ORDER BY 
        CASE WHEN r.subject = current_subject THEN 1 ELSE 0 END DESC,
        r.downloads DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
