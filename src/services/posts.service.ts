import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    content: string;
    imageUrl?: string;
    likes: string[];
    tags: string[];
    createdAt: string;
}

// Mock data for demo mode
let mockPosts: Post[] = [
    {
        id: 'mock-1',
        author: {
            id: 'mock-user-1',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=John'
        },
        content: 'Just started learning Framer Motion! Its amazing for React animations. 🚀',
        likes: [],
        tags: ['React', 'Animation'],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'mock-2',
        author: {
            id: 'mock-user-2',
            name: 'Jane Smith',
            avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Jane'
        },
        content: 'Looking for study partners for the MERN stack course. DM me! 💻',
        likes: ['mock-user-1'],
        tags: ['MERN', 'Study Group'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
];

export const postsService = {
    getAll: async (): Promise<Post[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles:author_id (id, name, avatar_url),
                        post_likes (user_id)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return (data || []).map(post => ({
                    id: post.id,
                    author: {
                        id: post.profiles?.id || post.author_id,
                        name: post.profiles?.name || 'Unknown',
                        avatar: post.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user'
                    },
                    content: post.content,
                    imageUrl: post.image_url,
                    likes: (post.post_likes || []).map((like: any) => like.user_id),
                    tags: post.tags || [],
                    createdAt: post.created_at
                }));
            } catch (err) {
                console.error('Error fetching posts:', err);
            }
        }
        return [...mockPosts];
    },

    create: async (content: string, tags: string[], imageUrl?: string): Promise<Post> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, name, avatar_url')
                        .eq('id', userData.user.id)
                        .single();

                    if (profile) {
                        const { data: post, error } = await supabase
                            .from('posts')
                            .insert({
                                author_id: userData.user.id,
                                content,
                                image_url: imageUrl,
                                tags
                            })
                            .select()
                            .single();

                        if (error) throw error;

                        return {
                            id: post.id,
                            author: {
                                id: profile.id,
                                name: profile.name,
                                avatar: profile.avatar_url
                            },
                            content: post.content,
                            imageUrl: post.image_url,
                            likes: [],
                            tags: post.tags || [],
                            createdAt: post.created_at
                        };
                    }
                }
            } catch (err) {
                console.error('Error creating post:', err);
            }
        }

        // Mock mode
        const newPost: Post = {
            id: `mock-${Date.now()}`,
            author: {
                id: 'mock-user-1',
                name: 'You',
                avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me'
            },
            content,
            imageUrl,
            likes: [],
            tags,
            createdAt: new Date().toISOString(),
        };
        mockPosts = [newPost, ...mockPosts];
        return newPost;
    },

    like: async (postId: string): Promise<{ likes: string[]; liked: boolean }> => {
        if (isSupabaseConfigured && supabase && !postId.startsWith('mock-')) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    // Check if already liked
                    const { data: existing } = await supabase
                        .from('post_likes')
                        .select('*')
                        .eq('post_id', postId)
                        .eq('user_id', userData.user.id)
                        .single();

                    if (existing) {
                        // Unlike
                        await supabase
                            .from('post_likes')
                            .delete()
                            .eq('post_id', postId)
                            .eq('user_id', userData.user.id);
                    } else {
                        // Like
                        await supabase
                            .from('post_likes')
                            .insert({ post_id: postId, user_id: userData.user.id });
                    }

                    // Get updated likes
                    const { data: likes } = await supabase
                        .from('post_likes')
                        .select('user_id')
                        .eq('post_id', postId);

                    return {
                        likes: (likes || []).map(l => l.user_id),
                        liked: !existing
                    };
                }
            } catch (err) {
                console.error('Error liking post:', err);
            }
        }

        // Mock mode
        const post = mockPosts.find(p => p.id === postId);
        if (post) {
            const userId = 'mock-user-1';
            const liked = post.likes.includes(userId);
            if (liked) {
                post.likes = post.likes.filter(id => id !== userId);
            } else {
                post.likes.push(userId);
            }
            return { likes: post.likes, liked: !liked };
        }
        return { likes: [], liked: false };
    },

    // Real-time subscription
    subscribe: (callback: (posts: Post[]) => void) => {
        if (isSupabaseConfigured && supabase) {
            const subscription = supabase
                .channel('posts-changes')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'posts' },
                    () => {
                        // Refetch posts on any change
                        postsService.getAll().then(callback);
                    }
                )
                .subscribe();

            return () => subscription.unsubscribe();
        }
        return () => { };
    }
};
