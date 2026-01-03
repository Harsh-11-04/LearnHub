import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Notification {
    id: string;
    userId: string;
    type: 'new_follower' | 'new_comment' | 'new_resource' | 'resource_downloaded' | 'mention' | 'badge_earned';
    title: string;
    message?: string;
    data: Record<string, any>;
    read: boolean;
    createdAt: string;
}

// Local storage for mock mode
const mockNotifications: Notification[] = [
    {
        id: '1',
        userId: 'mock-user',
        type: 'new_follower',
        title: 'New Follower',
        message: 'Alice started following you',
        data: { follower_id: 'alice-id' },
        read: false,
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        userId: 'mock-user',
        type: 'new_comment',
        title: 'New Comment',
        message: 'Bob commented on your resource "React Tips"',
        data: { resource_id: 'resource-1' },
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
    }
];

export const notificationService = {
    // Get all notifications for current user
    getAll: async (): Promise<Notification[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) return [];

                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', userData.user.id)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;

                return (data || []).map(n => ({
                    id: n.id,
                    userId: n.user_id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    data: n.data || {},
                    read: n.read,
                    createdAt: n.created_at
                }));
            } catch (err) {
                console.error('Error fetching notifications:', err);
                return [];
            }
        }

        return mockNotifications;
    },

    // Get unread count
    getUnreadCount: async (): Promise<number> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) return 0;

                const { count, error } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userData.user.id)
                    .eq('read', false);

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting unread count:', err);
                return 0;
            }
        }

        return mockNotifications.filter(n => !n.read).length;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('id', notificationId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error marking notification as read:', err);
                return false;
            }
        }

        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification) notification.read = true;
        return true;
    },

    // Mark all as read
    markAllAsRead: async (): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) return false;

                const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('user_id', userData.user.id)
                    .eq('read', false);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error marking all as read:', err);
                return false;
            }
        }

        mockNotifications.forEach(n => n.read = true);
        return true;
    },

    // Delete notification
    delete: async (notificationId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase
                    .from('notifications')
                    .delete()
                    .eq('id', notificationId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error deleting notification:', err);
                return false;
            }
        }

        const index = mockNotifications.findIndex(n => n.id === notificationId);
        if (index > -1) mockNotifications.splice(index, 1);
        return true;
    },

    // Clear all notifications
    clearAll: async (): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) return false;

                const { error } = await supabase
                    .from('notifications')
                    .delete()
                    .eq('user_id', userData.user.id);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error clearing notifications:', err);
                return false;
            }
        }

        mockNotifications.length = 0;
        return true;
    }
};
