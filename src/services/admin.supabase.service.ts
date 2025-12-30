import { supabase, isSupabaseConfigured, Profile } from '@/lib/supabase';

export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    adminCount: number;
    totalPosts: number;
    totalQuestions: number;
    totalResources: number;
    totalGroups: number;
}

export interface AdminUser extends Profile {
    status: 'active' | 'banned';
    posts_count?: number;
    resources_count?: number;
}

export interface UserListResponse {
    users: AdminUser[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
}

// Helper to convert Profile to AdminUser
const toAdminUser = (profile: Profile): AdminUser => ({
    ...profile,
    status: (profile as any).status || 'active'
});

export const adminSupabaseService = {
    // Get Dashboard Stats
    getStats: async (): Promise<AdminStats> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        // Get user counts
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { count: adminCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin');

        const { count: bannedUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'banned');

        // Get content counts
        const { count: totalPosts } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        const { count: totalQuestions } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });

        const { count: totalResources } = await supabase
            .from('resources')
            .select('*', { count: 'exact', head: true });

        const { count: totalGroups } = await supabase
            .from('study_groups')
            .select('*', { count: 'exact', head: true });

        return {
            totalUsers: totalUsers || 0,
            activeUsers: (totalUsers || 0) - (bannedUsers || 0),
            bannedUsers: bannedUsers || 0,
            adminCount: adminCount || 0,
            totalPosts: totalPosts || 0,
            totalQuestions: totalQuestions || 0,
            totalResources: totalResources || 0,
            totalGroups: totalGroups || 0
        };
    },

    // Get Users with Pagination & Filter
    getUsers: async (
        page = 1,
        search = '',
        role: 'all' | 'user' | 'admin' = 'all',
        status: 'all' | 'active' | 'banned' = 'all',
        limit = 10
    ): Promise<UserListResponse> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        // Apply filters
        if (role !== 'all') {
            query = query.eq('role', role);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply pagination and ordering
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) throw error;

        const totalUsers = count || 0;
        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users: (data || []).map(toAdminUser),
            totalPages,
            currentPage: page,
            totalUsers
        };
    },

    // Get single user details
    getUser: async (userId: string): Promise<AdminUser | null> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data ? toAdminUser(data) : null;
    },

    // Update User Role
    updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;
    },

    // Ban/Unban User
    updateUserStatus: async (userId: string, status: 'active' | 'banned'): Promise<void> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('profiles')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;
    },

    // Delete User (admin only)
    deleteUser: async (userId: string): Promise<void> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        // Note: This only deletes from profiles table
        // The auth.users record would need admin API to delete
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;
    },

    // Get user activity summary
    getUserActivity: async (userId: string) => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const [posts, questions, resources] = await Promise.all([
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
            supabase.from('questions').select('*', { count: 'exact', head: true }).eq('author_id', userId),
            supabase.from('resources').select('*', { count: 'exact', head: true }).eq('author_id', userId)
        ]);

        return {
            postsCount: posts.count || 0,
            questionsCount: questions.count || 0,
            resourcesCount: resources.count || 0
        };
    },

    // Get recent signups
    getRecentSignups: async (days = 7): Promise<AdminUser[]> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return (data || []).map(toAdminUser);
    },

    // Search users
    searchUsers: async (query: string): Promise<AdminUser[]> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(20);

        if (error) throw error;
        return (data || []).map(toAdminUser);
    },

    // ============================================
    // Batch Operations for Multi-User Management
    // ============================================

    // Batch update user status (ban/unban multiple users)
    batchUpdateStatus: async (userIds: string[], status: 'active' | 'banned'): Promise<void> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('profiles')
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', userIds);

        if (error) throw error;
    },

    // Batch update user roles (promote/demote multiple users)
    batchUpdateRole: async (userIds: string[], role: 'user' | 'admin'): Promise<void> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .in('id', userIds);

        if (error) throw error;
    },

    // Batch delete users
    batchDeleteUsers: async (userIds: string[]): Promise<void> => {
        if (!supabase || !isSupabaseConfigured) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (error) throw error;
    }
};

