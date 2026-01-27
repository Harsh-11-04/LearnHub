import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Tag {
    id: string;
    name: string;
    slug: string;
    usageCount: number;
}

// Mock data
const mockTags: Tag[] = [
    { id: '1', name: 'React', slug: 'react', usageCount: 15 },
    { id: '2', name: 'TypeScript', slug: 'typescript', usageCount: 12 },
    { id: '3', name: 'JavaScript', slug: 'javascript', usageCount: 20 },
    { id: '4', name: 'Python', slug: 'python', usageCount: 18 },
    { id: '5', name: 'Machine Learning', slug: 'machine-learning', usageCount: 8 },
    { id: '6', name: 'Data Structures', slug: 'data-structures', usageCount: 25 },
    { id: '7', name: 'Algorithms', slug: 'algorithms', usageCount: 22 },
    { id: '8', name: 'Web Development', slug: 'web-development', usageCount: 14 }
];

export const tagService = {
    // Get all tags (sorted by usage)
    getAll: async (): Promise<Tag[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('tags')
                    .select('*')
                    .order('usage_count', { ascending: false });

                if (error) throw error;

                return (data || []).map(t => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    usageCount: t.usage_count
                }));
            } catch (err) {
                console.error('Error fetching tags:', err);
                return mockTags;
            }
        }

        return mockTags;
    },

    // Get popular tags
    getPopular: async (limit: number = 10): Promise<Tag[]> => {
        const tags = await tagService.getAll();
        return tags.slice(0, limit);
    },

    // Search tags
    search: async (query: string): Promise<Tag[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('tags')
                    .select('*')
                    .ilike('name', `%${query}%`)
                    .order('usage_count', { ascending: false })
                    .limit(10);

                if (error) throw error;

                return (data || []).map(t => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    usageCount: t.usage_count
                }));
            } catch (err) {
                console.error('Error searching tags:', err);
                return [];
            }
        }

        return mockTags.filter(t =>
            t.name.toLowerCase().includes(query.toLowerCase())
        );
    },

    // Create tag
    create: async (name: string): Promise<Tag | null> => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('tags')
                    .insert({ name, slug })
                    .select()
                    .single();

                if (error) {
                    // Tag might already exist
                    if (error.code === '23505') {
                        const existing = await tagService.search(name);
                        return existing[0] || null;
                    }
                    throw error;
                }

                return {
                    id: data.id,
                    name: data.name,
                    slug: data.slug,
                    usageCount: data.usage_count
                };
            } catch (err) {
                console.error('Error creating tag:', err);
                return null;
            }
        }

        const newTag: Tag = {
            id: `mock-${Date.now()}`,
            name,
            slug,
            usageCount: 0
        };
        mockTags.push(newTag);
        return newTag;
    },

    // Get tags for a resource
    getByResource: async (resourceId: string): Promise<Tag[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('resource_tags')
                    .select('tag_id, tags(*)')
                    .eq('resource_id', resourceId);

                if (error) throw error;

                return (data || [])
                    .filter(rt => rt.tags && !Array.isArray(rt.tags))
                    .map(rt => {
                        const tag = rt.tags as unknown as { id: string; name: string; slug: string; usage_count: number };
                        return {
                            id: tag.id,
                            name: tag.name,
                            slug: tag.slug,
                            usageCount: tag.usage_count
                        };
                    });
            } catch (err) {
                console.error('Error fetching resource tags:', err);
                return [];
            }
        }

        return mockTags.slice(0, 3);
    },

    // Add tag to resource
    addToResource: async (resourceId: string, tagId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase
                    .from('resource_tags')
                    .insert({ resource_id: resourceId, tag_id: tagId });

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error adding tag:', err);
                return false;
            }
        }

        return true;
    },

    // Remove tag from resource
    removeFromResource: async (resourceId: string, tagId: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase
                    .from('resource_tags')
                    .delete()
                    .eq('resource_id', resourceId)
                    .eq('tag_id', tagId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error removing tag:', err);
                return false;
            }
        }

        return true;
    }
};
