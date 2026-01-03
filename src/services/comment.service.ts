import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Comment {
    id: string;
    resourceId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
    replies?: Comment[];
}

// Local storage for mock mode
const mockComments: Comment[] = [];

export const commentService = {
    // Get comments for a resource
    getByResource: async (resourceId: string): Promise<Comment[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('comments')
                    .select(`
                        *,
                        profiles:user_id (name, avatar_url)
                    `)
                    .eq('resource_id', resourceId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                // Build nested structure
                const comments: Comment[] = (data || []).map(c => ({
                    id: c.id,
                    resourceId: c.resource_id,
                    userId: c.user_id,
                    userName: c.profiles?.name || 'Unknown',
                    userAvatar: c.profiles?.avatar_url,
                    content: c.content,
                    parentId: c.parent_id,
                    createdAt: c.created_at,
                    updatedAt: c.updated_at
                }));

                // Build tree structure
                const rootComments = comments.filter(c => !c.parentId);
                rootComments.forEach(comment => {
                    comment.replies = comments.filter(c => c.parentId === comment.id);
                });

                return rootComments;
            } catch (err) {
                console.error('Error fetching comments:', err);
                return [];
            }
        }

        // Mock mode
        return mockComments.filter(c => c.resourceId === resourceId && !c.parentId);
    },

    // Add comment
    add: async (resourceId: string, content: string, parentId?: string): Promise<Comment | null> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) throw new Error('Not authenticated');

                const { data, error } = await supabase
                    .from('comments')
                    .insert({
                        resource_id: resourceId,
                        user_id: userData.user.id,
                        content,
                        parent_id: parentId
                    })
                    .select(`
                        *,
                        profiles:user_id (name, avatar_url)
                    `)
                    .single();

                if (error) throw error;

                return {
                    id: data.id,
                    resourceId: data.resource_id,
                    userId: data.user_id,
                    userName: data.profiles?.name || 'Unknown',
                    userAvatar: data.profiles?.avatar_url,
                    content: data.content,
                    parentId: data.parent_id,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at
                };
            } catch (err) {
                console.error('Error adding comment:', err);
                return null;
            }
        }

        // Mock mode
        const newComment: Comment = {
            id: `mock-${Date.now()}`,
            resourceId,
            userId: 'mock-user',
            userName: 'You',
            content,
            parentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockComments.push(newComment);
        return newComment;
    },

    // Update comment
    update: async (commentId: string, content: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase
                    .from('comments')
                    .update({ content, updated_at: new Date().toISOString() })
                    .eq('id', commentId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error updating comment:', err);
                return false;
            }
        }

        // Mock mode
        const comment = mockComments.find(c => c.id === commentId);
        if (comment) {
            comment.content = content;
            comment.updatedAt = new Date().toISOString();
        }
        return true;
    },

    // Delete comment
    delete: async (commentId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase
                    .from('comments')
                    .delete()
                    .eq('id', commentId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error deleting comment:', err);
                return false;
            }
        }

        // Mock mode
        const index = mockComments.findIndex(c => c.id === commentId);
        if (index > -1) {
            mockComments.splice(index, 1);
        }
        return true;
    },

    // Get comment count for a resource
    getCount: async (resourceId: string): Promise<number> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { count, error } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('resource_id', resourceId);

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting comment count:', err);
                return 0;
            }
        }

        return mockComments.filter(c => c.resourceId === resourceId).length;
    }
};
