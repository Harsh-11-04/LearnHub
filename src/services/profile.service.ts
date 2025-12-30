import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar: string;
    bio?: string;
    year?: number;
    college?: string;
    techStack: string[];
    interests: string[];
    githubProfile?: string;
    linkedinProfile?: string;
    contributions: number;
    streak: number;
    role: 'user' | 'admin';
    createdAt: string;
}

// Mock profile
let mockProfile: UserProfile = {
    id: 'mock-user-1',
    email: 'user@example.com',
    name: 'Harsh Pawar',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Harsh',
    bio: 'Full-stack developer passionate about React and Node.js',
    year: 3,
    college: 'LPU, Punjab',
    techStack: ['React', 'TypeScript', 'Node.js'],
    interests: ['Web Dev', 'Open Source'],
    githubProfile: 'harshpawar',
    linkedinProfile: 'harsh-pawar',
    contributions: 42,
    streak: 7,
    role: 'user',
    createdAt: new Date().toISOString()
};

export const profileService = {
    // Get current user profile
    getProfile: async (): Promise<UserProfile | null> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userData.user.id)
                        .single();

                    if (error) throw error;

                    if (data) {
                        return {
                            id: data.id,
                            email: data.email,
                            name: data.name,
                            avatar: data.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user',
                            bio: data.bio,
                            year: data.year,
                            college: data.college,
                            techStack: data.tech_stack || [],
                            interests: data.interests || [],
                            githubProfile: data.github_profile,
                            linkedinProfile: data.linkedin_profile,
                            contributions: data.contributions || 0,
                            streak: data.streak || 0,
                            role: data.role || 'user',
                            createdAt: data.created_at
                        };
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        }
        return mockProfile;
    },

    // Update profile
    updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .update({
                            name: updates.name,
                            bio: updates.bio,
                            avatar_url: updates.avatar,
                            year: updates.year,
                            college: updates.college,
                            tech_stack: updates.techStack,
                            interests: updates.interests,
                            github_profile: updates.githubProfile,
                            linkedin_profile: updates.linkedinProfile
                        })
                        .eq('id', userData.user.id)
                        .select()
                        .single();

                    if (error) throw error;

                    return {
                        id: data.id,
                        email: data.email,
                        name: data.name,
                        avatar: data.avatar_url,
                        bio: data.bio,
                        year: data.year,
                        college: data.college,
                        techStack: data.tech_stack || [],
                        interests: data.interests || [],
                        githubProfile: data.github_profile,
                        linkedinProfile: data.linkedin_profile,
                        contributions: data.contributions || 0,
                        streak: data.streak || 0,
                        role: data.role || 'user',
                        createdAt: data.created_at
                    };
                }
            } catch (err) {
                console.error('Error updating profile:', err);
            }
        }

        // Mock mode
        mockProfile = { ...mockProfile, ...updates };
        return mockProfile;
    },

    // Create profile for new user
    createProfile: async (userId: string, email: string, name: string): Promise<UserProfile> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email,
                        name,
                        avatar_url: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${name}`
                    })
                    .select()
                    .single();

                if (error) throw error;

                return {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    avatar: data.avatar_url,
                    bio: data.bio,
                    year: data.year,
                    college: data.college,
                    techStack: data.tech_stack || [],
                    interests: data.interests || [],
                    githubProfile: data.github_profile,
                    linkedinProfile: data.linkedin_profile,
                    contributions: 0,
                    streak: 0,
                    role: 'user',
                    createdAt: data.created_at
                };
            } catch (err) {
                console.error('Error creating profile:', err);
            }
        }

        // Mock mode
        const newProfile: UserProfile = {
            id: userId,
            email,
            name,
            avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${name}`,
            techStack: [],
            interests: [],
            contributions: 0,
            streak: 0,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        mockProfile = newProfile;
        return newProfile;
    },

    // Get activity stats for dashboard
    getStats: async (): Promise<{ contributions: number; streak: number; connections: number; resources: number }> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const [profileRes, connectionsRes, resourcesRes] = await Promise.all([
                        supabase.from('profiles').select('contributions, streak').eq('id', userData.user.id).single(),
                        supabase.from('connections').select('id').eq('status', 'accepted').or(`from_user.eq.${userData.user.id},to_user.eq.${userData.user.id}`),
                        supabase.from('resources').select('id').eq('author_id', userData.user.id)
                    ]);

                    return {
                        contributions: profileRes.data?.contributions || 0,
                        streak: profileRes.data?.streak || 0,
                        connections: connectionsRes.data?.length || 0,
                        resources: resourcesRes.data?.length || 0
                    };
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        }

        return {
            contributions: 42,
            streak: 7,
            connections: 5,
            resources: 3
        };
    }
};
