import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Bookmark {
    id: string;
    userId: string;
    resourceId: string;
    createdAt: string;
}

// Local storage for mock mode
const mockBookmarks: Bookmark[] = [];

export const bookmarkService = {
    // Get all bookmarks for current user
    getMyBookmarks: async (): Promise<string[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) return [];

                const { data, error } = await supabase
                    .from('bookmarks')
                    .select('resource_id')
                    .eq('user_id', userData.user.id);

                if (error) throw error;
                return (data || []).map(b => b.resource_id);
            } catch (err) {
                console.error('Error fetching bookmarks:', err);
                return [];
            }
        }

        // Mock mode
        return mockBookmarks.map(b => b.resourceId);
    },

    // Add bookmark
    add: async (resourceId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('bookmarks')
                    .insert({
                        user_id: userData.user.id,
                        resource_id: resourceId
                    });

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error adding bookmark:', err);
                return false;
            }
        }

        // Mock mode
        mockBookmarks.push({
            id: `mock-${Date.now()}`,
            userId: 'mock-user',
            resourceId,
            createdAt: new Date().toISOString()
        });
        return true;
    },

    // Remove bookmark
    remove: async (resourceId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', userData.user.id)
                    .eq('resource_id', resourceId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error removing bookmark:', err);
                return false;
            }
        }

        // Mock mode
        const index = mockBookmarks.findIndex(b => b.resourceId === resourceId);
        if (index > -1) {
            mockBookmarks.splice(index, 1);
        }
        return true;
    },

    // Toggle bookmark
    toggle: async (resourceId: string, isBookmarked: boolean): Promise<boolean> => {
        if (isBookmarked) {
            return bookmarkService.remove(resourceId);
        } else {
            return bookmarkService.add(resourceId);
        }
    },

    // Check if resource is bookmarked
    isBookmarked: async (resourceId: string): Promise<boolean> => {
        const bookmarks = await bookmarkService.getMyBookmarks();
        return bookmarks.includes(resourceId);
    }
};
