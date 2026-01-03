-- Gamification Features
-- Run this in your Supabase SQL editor

-----------------------------------------------------------
-- Badges/Achievements System
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL, -- Icon name or emoji
    category TEXT CHECK (category IN ('contribution', 'social', 'learning', 'special')),
    requirement_type TEXT NOT NULL, -- e.g., 'uploads', 'downloads', 'comments', 'followers'
    requirement_value INTEGER NOT NULL, -- Number needed to earn
    points INTEGER DEFAULT 10, -- Points awarded
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Anyone can view badges
CREATE POLICY "Anyone can view badges"
ON badges FOR SELECT TO authenticated USING (true);

-- Anyone can view user badges
CREATE POLICY "Anyone can view user_badges"
ON user_badges FOR SELECT TO authenticated USING (true);

-- System can award badges
CREATE POLICY "System can award badges"
ON user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-----------------------------------------------------------
-- Points System (add to profiles)
-----------------------------------------------------------

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Level calculation function
CREATE OR REPLACE FUNCTION calculate_level(user_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Simple logarithmic level calculation
    -- Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
    RETURN GREATEST(1, FLOOR(SQRT(user_points / 100)) + 1);
END;
$$ LANGUAGE plpgsql;

-----------------------------------------------------------
-- Seed Default Badges
-----------------------------------------------------------

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, points) VALUES
    ('First Upload', 'Upload your first resource', '📤', 'contribution', 'uploads', 1, 10),
    ('Resource Master', 'Upload 10 resources', '🎯', 'contribution', 'uploads', 10, 50),
    ('Content Creator', 'Upload 25 resources', '🏆', 'contribution', 'uploads', 25, 100),
    ('Helpful Hand', 'Get 50 downloads on your resources', '🤝', 'contribution', 'downloads_received', 50, 50),
    ('Popular Creator', 'Get 500 downloads on your resources', '⭐', 'contribution', 'downloads_received', 500, 200),
    ('Commentator', 'Leave 10 comments', '💬', 'social', 'comments', 10, 25),
    ('Active Participant', 'Leave 50 comments', '🗣️', 'social', 'comments', 50, 75),
    ('Social Butterfly', 'Get 10 followers', '🦋', 'social', 'followers', 10, 50),
    ('Influencer', 'Get 50 followers', '👑', 'social', 'followers', 50, 150),
    ('Bookworm', 'Bookmark 20 resources', '📚', 'learning', 'bookmarks', 20, 30),
    ('Early Adopter', 'Joined during beta', '🚀', 'special', 'special', 1, 100),
    ('Perfect Rating', 'Get a 5-star rating', '✨', 'contribution', 'perfect_rating', 1, 50)
ON CONFLICT DO NOTHING;

-----------------------------------------------------------
-- Leaderboard View
-----------------------------------------------------------

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.points,
    p.level,
    RANK() OVER (ORDER BY p.points DESC) as rank,
    COUNT(DISTINCT r.id) as resource_count,
    COALESCE(SUM(r.downloads), 0) as total_downloads,
    (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = p.id) as badge_count
FROM profiles p
LEFT JOIN resources r ON r.author_id = p.id
GROUP BY p.id, p.name, p.avatar_url, p.points, p.level
ORDER BY p.points DESC;

-----------------------------------------------------------
-- Function to check and award badges
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE (badge_name TEXT, badge_icon TEXT) AS $$
DECLARE
    badge_record RECORD;
    user_uploads INTEGER;
    user_downloads_received INTEGER;
    user_comments INTEGER;
    user_followers INTEGER;
    user_bookmarks INTEGER;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO user_uploads FROM resources WHERE author_id = p_user_id;
    SELECT COALESCE(SUM(downloads), 0) INTO user_downloads_received FROM resources WHERE author_id = p_user_id;
    SELECT COUNT(*) INTO user_comments FROM comments WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO user_followers FROM follows WHERE following_id = p_user_id;
    SELECT COUNT(*) INTO user_bookmarks FROM bookmarks WHERE user_id = p_user_id;
    
    -- Check each badge
    FOR badge_record IN 
        SELECT b.* FROM badges b
        WHERE b.id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
    LOOP
        IF (
            (badge_record.requirement_type = 'uploads' AND user_uploads >= badge_record.requirement_value) OR
            (badge_record.requirement_type = 'downloads_received' AND user_downloads_received >= badge_record.requirement_value) OR
            (badge_record.requirement_type = 'comments' AND user_comments >= badge_record.requirement_value) OR
            (badge_record.requirement_type = 'followers' AND user_followers >= badge_record.requirement_value) OR
            (badge_record.requirement_type = 'bookmarks' AND user_bookmarks >= badge_record.requirement_value)
        ) THEN
            -- Award badge
            INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
            
            -- Award points
            UPDATE profiles SET 
                points = points + badge_record.points,
                level = calculate_level(points + badge_record.points)
            WHERE id = p_user_id;
            
            -- Create notification
            PERFORM create_notification(
                p_user_id,
                'badge_earned',
                'Badge Earned!',
                'You earned the "' || badge_record.name || '" badge!',
                jsonb_build_object('badge_id', badge_record.id, 'badge_name', badge_record.name)
            );
            
            badge_name := badge_record.name;
            badge_icon := badge_record.icon;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------------------------------------
-- Auto-check badges on actions
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_check_badges()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'resources' THEN
        PERFORM check_and_award_badges(NEW.author_id);
    ELSIF TG_TABLE_NAME = 'comments' THEN
        PERFORM check_and_award_badges(NEW.user_id);
    ELSIF TG_TABLE_NAME = 'bookmarks' THEN
        PERFORM check_and_award_badges(NEW.user_id);
    ELSIF TG_TABLE_NAME = 'follows' THEN
        PERFORM check_and_award_badges(NEW.following_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_badges_on_resource
AFTER INSERT ON resources
FOR EACH ROW EXECUTE FUNCTION trigger_check_badges();

CREATE TRIGGER check_badges_on_comment
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION trigger_check_badges();

CREATE TRIGGER check_badges_on_bookmark
AFTER INSERT ON bookmarks
FOR EACH ROW EXECUTE FUNCTION trigger_check_badges();

CREATE TRIGGER check_badges_on_follow
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION trigger_check_badges();
