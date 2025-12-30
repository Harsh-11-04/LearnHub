import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface PeerProfile {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    college?: string;
    year?: number;
    techStack: string[];
    interests: string[];
    githubProfile?: string;
    linkedinProfile?: string;
    matchScore?: number;
}

export interface Connection {
    id: string;
    fromUser: string;
    toUser: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

// Mock data
const mockPeers: PeerProfile[] = [
    {
        id: 'mock-peer-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice',
        bio: 'Full-stack developer passionate about React and Node.js',
        college: 'MIT',
        year: 3,
        techStack: ['React', 'Node.js', 'TypeScript'],
        interests: ['Web Dev', 'AI/ML'],
        matchScore: 85
    },
    {
        id: 'mock-peer-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob',
        bio: 'Machine learning enthusiast and Python developer',
        college: 'Stanford',
        year: 4,
        techStack: ['Python', 'TensorFlow', 'PyTorch'],
        interests: ['AI/ML', 'Data Science'],
        matchScore: 72
    }
];

let mockConnections: Connection[] = [];

export const peersService = {
    // Get all peers for matching
    getPeers: async (): Promise<PeerProfile[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', userData.user?.id || '') // Exclude current user
                    .limit(50);

                if (error) throw error;

                return (data || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    avatar: p.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user',
                    bio: p.bio,
                    college: p.college,
                    year: p.year,
                    techStack: p.tech_stack || [],
                    interests: p.interests || [],
                    githubProfile: p.github_profile,
                    linkedinProfile: p.linkedin_profile,
                    matchScore: Math.floor(Math.random() * 30) + 70 // Random for now
                }));
            } catch (err) {
                console.error('Error fetching peers:', err);
            }
        }
        return [...mockPeers];
    },

    // Get user's connections
    getConnections: async (): Promise<Connection[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data, error } = await supabase
                        .from('connections')
                        .select('*')
                        .or(`from_user.eq.${userData.user.id},to_user.eq.${userData.user.id}`);

                    if (error) throw error;

                    return (data || []).map(c => ({
                        id: c.id,
                        fromUser: c.from_user,
                        toUser: c.to_user,
                        status: c.status,
                        createdAt: c.created_at
                    }));
                }
            } catch (err) {
                console.error('Error fetching connections:', err);
            }
        }
        return [...mockConnections];
    },

    // Send connection request
    sendRequest: async (toUserId: string): Promise<Connection> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data, error } = await supabase
                        .from('connections')
                        .insert({
                            from_user: userData.user.id,
                            to_user: toUserId,
                            status: 'pending'
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    return {
                        id: data.id,
                        fromUser: data.from_user,
                        toUser: data.to_user,
                        status: data.status,
                        createdAt: data.created_at
                    };
                }
            } catch (err) {
                console.error('Error sending request:', err);
            }
        }

        // Mock
        const newConnection: Connection = {
            id: `mock-${Date.now()}`,
            fromUser: 'mock-user-1',
            toUser: toUserId,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        mockConnections.push(newConnection);
        return newConnection;
    },

    // Accept/reject connection request
    updateRequest: async (connectionId: string, status: 'accepted' | 'rejected'): Promise<void> => {
        if (isSupabaseConfigured && supabase && !connectionId.startsWith('mock-')) {
            try {
                await supabase
                    .from('connections')
                    .update({ status })
                    .eq('id', connectionId);
                return;
            } catch (err) {
                console.error('Error updating request:', err);
            }
        }

        // Mock
        const conn = mockConnections.find(c => c.id === connectionId);
        if (conn) conn.status = status;
    },

    // Get accepted friends
    getFriends: async (): Promise<PeerProfile[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    // Get accepted connections
                    const { data: connections } = await supabase
                        .from('connections')
                        .select('from_user, to_user')
                        .eq('status', 'accepted')
                        .or(`from_user.eq.${userData.user.id},to_user.eq.${userData.user.id}`);

                    if (connections && connections.length > 0) {
                        // Get friend IDs
                        const friendIds = connections.map(c =>
                            c.from_user === userData.user?.id ? c.to_user : c.from_user
                        );

                        // Fetch friend profiles
                        const { data: profiles } = await supabase
                            .from('profiles')
                            .select('*')
                            .in('id', friendIds);

                        return (profiles || []).map(p => ({
                            id: p.id,
                            name: p.name,
                            email: p.email,
                            avatar: p.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user',
                            bio: p.bio,
                            college: p.college,
                            year: p.year,
                            techStack: p.tech_stack || [],
                            interests: p.interests || []
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching friends:', err);
            }
        }

        // Mock - return peers with accepted connections
        return mockPeers.filter(p =>
            mockConnections.some(c =>
                c.status === 'accepted' && (c.toUser === p.id || c.fromUser === p.id)
            )
        );
    }
};
