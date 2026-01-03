import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    resourceCount: number;
    followerCount: number;
    followingCount: number;
    isFollowing?: boolean;
}

// Mock data
const mockFollowing: string[] = [];

export const followService = {
    // Follow a user
    follow: async (userId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: currentUser } = await supabase.auth.getUser();
                if (!currentUser.user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: currentUser.user.id,
                        following_id: userId
                    });

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error following user:', err);
                return false;
            }
        }

        if (!mockFollowing.includes(userId)) {
            mockFollowing.push(userId);
        }
        return true;
    },

    // Unfollow a user
    unfollow: async (userId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: currentUser } = await supabase.auth.getUser();
                if (!currentUser.user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUser.user.id)
                    .eq('following_id', userId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error unfollowing user:', err);
                return false;
            }
        }

        const index = mockFollowing.indexOf(userId);
        if (index > -1) mockFollowing.splice(index, 1);
        return true;
    },

    // Check if following a user
    isFollowing: async (userId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: currentUser } = await supabase.auth.getUser();
                if (!currentUser.user) return false;

                const { data, error } = await supabase
                    .from('follows')
                    .select('id')
                    .eq('follower_id', currentUser.user.id)
                    .eq('following_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                return !!data;
            } catch (err) {
                console.error('Error checking follow status:', err);
                return false;
            }
        }

        return mockFollowing.includes(userId);
    },

    // Get followers
    getFollowers: async (userId: string): Promise<UserProfile[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('follows')
                    .select(`
                        follower:follower_id (
                            id, name, avatar_url, role
                        )
                    `)
                    .eq('following_id', userId);

                if (error) throw error;

                return (data || []).map((f: any) => {
                    const follower = f.follower;
                    return {
                        id: follower?.id || '',
                        name: follower?.name || '',
                        avatar: follower?.avatar_url,
                        role: follower?.role || 'student',
                        resourceCount: 0,
                        followerCount: 0,
                        followingCount: 0
                    };
                });
            } catch (err) {
                console.error('Error getting followers:', err);
                return [];
            }
        }

        return [];
    },

    // Get following
    getFollowing: async (userId: string): Promise<UserProfile[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('follows')
                    .select(`
                        following:following_id (
                            id, name, avatar_url, role
                        )
                    `)
                    .eq('follower_id', userId);

                if (error) throw error;

                return (data || []).map((f: any) => {
                    const following = f.following;
                    return {
                        id: following?.id || '',
                        name: following?.name || '',
                        avatar: following?.avatar_url,
                        role: following?.role || 'student',
                        resourceCount: 0,
                        followerCount: 0,
                        followingCount: 0
                    };
                });
            } catch (err) {
                console.error('Error getting following:', err);
                return [];
            }
        }

        return [];
    },

    // Get follower count
    getFollowerCount: async (userId: string): Promise<number> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { count, error } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', userId);

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting follower count:', err);
                return 0;
            }
        }

        return 0;
    },

    // Get following count
    getFollowingCount: async (userId: string): Promise<number> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { count, error } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', userId);

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting following count:', err);
                return 0;
            }
        }

        return mockFollowing.length;
    }
};
