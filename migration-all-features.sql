-- ============================================
-- LearnHub Complete Database Migration
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: Core Features (Bookmarks, Comments, Reports)
-- ============================================

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add bookmarks" ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON bookmarks(resource_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================
-- SECTION 2: Social Features (Follows, Notifications)
-- ============================================

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows" ON follows FOR SELECT TO authenticated USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can follow" ON follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_follower', 'new_comment', 'new_resource', 'resource_downloaded', 'mention', 'badge_earned')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Helper function to create notification
CREATE OR REPLACE FUNCTION create_notification(p_user_id UUID, p_type TEXT, p_title TEXT, p_message TEXT DEFAULT NULL, p_data JSONB DEFAULT '{}')
RETURNS UUID AS $$
DECLARE notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 3: Tags System
-- ============================================

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

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view resource_tags" ON resource_tags FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON resource_tags(resource_id);

-- ============================================
-- SECTION 4: Gamification (Badges, Points, Leaderboard)
-- ============================================

-- Add points and level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    category TEXT CHECK (category IN ('contribution', 'social', 'learning', 'special')),
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view user_badges" ON user_badges FOR SELECT TO authenticated USING (true);

-- Seed default badges
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, points) VALUES
    ('First Upload', 'Upload your first resource', '📤', 'contribution', 'uploads', 1, 10),
    ('Resource Master', 'Upload 10 resources', '🎯', 'contribution', 'uploads', 10, 50),
    ('Helpful Hand', 'Get 50 downloads', '🤝', 'contribution', 'downloads_received', 50, 50),
    ('Commentator', 'Leave 10 comments', '💬', 'social', 'comments', 10, 25),
    ('Social Butterfly', 'Get 10 followers', '🦋', 'social', 'followers', 10, 50),
    ('Bookworm', 'Bookmark 20 resources', '📚', 'learning', 'bookmarks', 20, 30),
    ('Early Adopter', 'Joined during beta', '🚀', 'special', 'special', 1, 100)
ON CONFLICT DO NOTHING;

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    p.id, p.name, p.avatar_url, p.points, p.level,
    RANK() OVER (ORDER BY p.points DESC) as rank,
    COUNT(DISTINCT r.id) as resource_count,
    COALESCE(SUM(r.downloads), 0) as total_downloads,
    (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = p.id) as badge_count
FROM profiles p
LEFT JOIN resources r ON r.author_id = p.id
GROUP BY p.id, p.name, p.avatar_url, p.points, p.level
ORDER BY p.points DESC;

-- ============================================
-- DONE! Your database is now set up.
-- ============================================
