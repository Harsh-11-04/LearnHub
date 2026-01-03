-- Social & Community Features
-- Run this in your Supabase SQL editor

-----------------------------------------------------------
-- Follow System
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Can't follow yourself
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can see their own follows
CREATE POLICY "Users can view follows"
ON follows FOR SELECT
TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Users can follow others
CREATE POLICY "Users can follow"
ON follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON follows FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-----------------------------------------------------------
-- Notifications System
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_follower', 'new_comment', 'new_resource', 'resource_downloaded', 'mention', 'badge_earned')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}', -- Store extra data like resource_id, user_id, etc.
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-----------------------------------------------------------
-- Activity Feed
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('upload', 'comment', 'bookmark', 'follow', 'download')),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Public activities are visible
CREATE POLICY "Anyone can view activities"
ON activities FOR SELECT
TO authenticated
USING (true);

-- System can create activities
CREATE POLICY "Users can create own activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Index for feed queries
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-----------------------------------------------------------
-- Helper function to create notification
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT DEFAULT NULL,
    p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------------------------------------
-- Trigger: Notify on new follower
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
    follower_name TEXT;
BEGIN
    SELECT name INTO follower_name FROM profiles WHERE id = NEW.follower_id;
    
    PERFORM create_notification(
        NEW.following_id,
        'new_follower',
        'New Follower',
        follower_name || ' started following you',
        jsonb_build_object('follower_id', NEW.follower_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_follower
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

-----------------------------------------------------------
-- Trigger: Notify on new comment
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    commenter_name TEXT;
    resource_author UUID;
    resource_title TEXT;
BEGIN
    SELECT name INTO commenter_name FROM profiles WHERE id = NEW.user_id;
    SELECT author_id, title INTO resource_author, resource_title 
    FROM resources WHERE id = NEW.resource_id;
    
    -- Don't notify if commenting on own resource
    IF resource_author != NEW.user_id THEN
        PERFORM create_notification(
            resource_author,
            'new_comment',
            'New Comment',
            commenter_name || ' commented on "' || resource_title || '"',
            jsonb_build_object('resource_id', NEW.resource_id, 'comment_id', NEW.id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_comment
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_new_comment();
