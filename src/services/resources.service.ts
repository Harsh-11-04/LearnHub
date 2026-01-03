import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ResourceItem {
    id: string;
    title: string;
    description?: string;
    subject: string;
    type: string;
    link?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    user: string;
    downloads: number;
    average_rating: number;
    createdAt: string;
}

// Mock data for demo mode
const mockResources: ResourceItem[] = [];

export const resourcesService = {
    getAll: async (): Promise<ResourceItem[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('resources')
                    .select(`
                        *,
                        profiles:author_id (name)
                    `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Supabase error:', error);
                    return mockResources;
                }

                return (data || []).map(r => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    subject: r.subject,
                    type: r.type || 'notes',
                    link: r.url,
                    fileUrl: r.file_url,
                    fileName: r.file_name,
                    fileSize: r.file_size,
                    fileType: r.file_type,
                    user: r.profiles?.name || 'Unknown',
                    downloads: r.downloads || 0,
                    average_rating: r.average_rating || 0,
                    createdAt: r.created_at
                }));
            } catch (err) {
                console.error('Error fetching resources:', err);
                return mockResources;
            }
        }

        // Mock mode
        return mockResources;
    },

    uploadFile: async (
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        fileType: string;
    }> => {
        if (isSupabaseConfigured && supabase) {
            try {
                // Generate unique filename to prevent collisions
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(7);
                const fileExt = file.name.split('.').pop();
                const uniqueFileName = `${timestamp}-${randomStr}.${fileExt}`;
                const filePath = `resources/${uniqueFileName}`;

                // Simulate initial progress
                if (onProgress) onProgress(10);

                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                    .from('resources')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error('Supabase Storage error:', error);
                    throw new Error(`Upload failed: ${error.message}`);
                }

                if (onProgress) onProgress(80);

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('resources')
                    .getPublicUrl(filePath);

                if (onProgress) onProgress(100);

                return {
                    fileUrl: urlData.publicUrl,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type
                };
            } catch (err: any) {
                console.error('Upload error:', err);
                // Fall back to mock mode on error
                console.warn('Falling back to mock mode for file upload');
            }
        }

        // Mock mode fallback - Use blob URLs for demo
        await new Promise(r => setTimeout(r, 300));
        for (let i = 0; i <= 100; i += 20) {
            if (onProgress) onProgress(i);
            await new Promise(r => setTimeout(r, 100));
        }

        const blobUrl = URL.createObjectURL(file);

        return {
            fileUrl: blobUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };
    },

    create: async (data: Partial<ResourceItem>): Promise<ResourceItem> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                // Check if user is authenticated
                if (userData.user?.id) {
                    // Verify profile exists
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', userData.user.id)
                        .single();

                    // Only use Supabase if profile exists
                    if (profile) {
                        const { data: resource, error } = await supabase
                            .from('resources')
                            .insert({
                                author_id: userData.user.id,
                                title: data.title,
                                description: data.description,
                                subject: data.subject,
                                type: data.type || 'notes',
                                url: data.link,
                                file_url: data.fileUrl,
                                file_name: data.fileName,
                                file_size: data.fileSize,
                                file_type: data.fileType
                            })
                            .select()
                            .single();

                        if (error) throw error;

                        return {
                            id: resource.id,
                            title: resource.title,
                            description: resource.description,
                            subject: resource.subject,
                            type: resource.type,
                            link: resource.url,
                            fileUrl: resource.file_url,
                            fileName: resource.file_name,
                            fileSize: resource.file_size,
                            fileType: resource.file_type,
                            user: 'Me',
                            downloads: 0,
                            average_rating: 0,
                            createdAt: resource.created_at
                        };
                    } else {
                        console.warn('User has no profile, using mock mode');
                    }
                }
            } catch (err) {
                console.error('Error creating resource:', err);
            }
        }

        // Mock mode - store locally
        const newResource: ResourceItem = {
            id: `mock-${Date.now()}`,
            title: data.title || '',
            description: data.description,
            subject: data.subject || '',
            type: data.type || 'notes',
            link: data.link,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            user: 'Me',
            downloads: 0,
            average_rating: 0,
            createdAt: new Date().toISOString()
        };

        mockResources.unshift(newResource);
        return newResource;
    },

    download: async (id: string): Promise<{ fileUrl: string; fileName: string; downloads: number }> => {
        if (isSupabaseConfigured && supabase && !id.startsWith('mock-')) {
            try {
                const { data: resource, error } = await supabase
                    .from('resources')
                    .select('file_url, file_name, downloads')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                await supabase
                    .from('resources')
                    .update({ downloads: (resource.downloads || 0) + 1 })
                    .eq('id', id);

                return {
                    fileUrl: resource.file_url,
                    fileName: resource.file_name,
                    downloads: (resource.downloads || 0) + 1
                };
            } catch (err) {
                console.error('Download error:', err);
            }
        }

        // Mock mode
        const resource = mockResources.find(r => r.id === id);
        if (resource) {
            resource.downloads += 1;
            return {
                fileUrl: resource.fileUrl || '',
                fileName: resource.fileName || '',
                downloads: resource.downloads
            };
        }
        throw new Error('Resource not found');
    },

    triggerDownload: async (id: string) => {
        const data = await resourcesService.download(id);
        if (data.fileUrl) {
            const link = document.createElement('a');
            link.href = data.fileUrl;
            link.download = data.fileName || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        return data;
    },

    rate: async (id: string, rating: number): Promise<void> => {
        if (isSupabaseConfigured && supabase && !id.startsWith('mock-')) {
            try {
                await supabase
                    .from('resources')
                    .update({ average_rating: rating })
                    .eq('id', id);
                return;
            } catch (err) {
                console.error('Rating error:', err);
            }
        }

        // Mock mode
        const resource = mockResources.find(r => r.id === id);
        if (resource) {
            resource.average_rating = rating;
        }
    },

    checkDuplicate: async (title: string, subject: string): Promise<ResourceItem | null> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data, error } = await supabase
                        .from('resources')
                        .select(`
                            *,
                            profiles:author_id (name)
                        `)
                        .ilike('title', title)
                        .eq('subject', subject)
                        .eq('author_id', userData.user.id)
                        .limit(1)
                        .single();

                    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                        console.error('Duplicate check error:', error);
                        return null;
                    }

                    if (data) {
                        return {
                            id: data.id,
                            title: data.title,
                            description: data.description,
                            subject: data.subject,
                            type: data.type,
                            link: data.url,
                            fileUrl: data.file_url,
                            fileName: data.file_name,
                            fileSize: data.file_size,
                            fileType: data.file_type,
                            user: data.profiles?.name || 'Unknown',
                            downloads: data.downloads || 0,
                            average_rating: data.average_rating || 0,
                            createdAt: data.created_at
                        };
                    }
                }
            } catch (err) {
                console.error('Error checking duplicates:', err);
            }
        }

        // Mock mode - check local resources
        const duplicate = mockResources.find(r =>
            r.title.toLowerCase() === title.toLowerCase() &&
            r.subject === subject
        );

        return duplicate || null;
    },

    getShareUrl: (resource: ResourceItem): string => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/resources?shared=${resource.id}`;
    },

    copyShareLink: async (resource: ResourceItem): Promise<void> => {
        const shareUrl = resourcesService.getShareUrl(resource);
        await navigator.clipboard.writeText(shareUrl);
    }
};
