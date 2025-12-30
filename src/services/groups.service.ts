import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface StudyGroup {
    id: string;
    name: string;
    subject: string;
    description?: string;
    createdBy: string;
    members: string[];
    memberCount: number;
    createdAt: string;
}

// Mock data for demo mode
let mockGroups: StudyGroup[] = [
    {
        id: 'mock-1',
        name: 'React Developers',
        subject: 'Computer Science',
        description: 'Learn and build React projects together',
        createdBy: 'mock-user-1',
        members: ['mock-user-1', 'mock-user-2'],
        memberCount: 2,
        createdAt: new Date().toISOString()
    },
    {
        id: 'mock-2',
        name: 'Physics Study Group',
        subject: 'Physics',
        description: 'Prepare for physics exams together',
        createdBy: 'mock-user-2',
        members: ['mock-user-2'],
        memberCount: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }
];

export const groupsService = {
    getAll: async (): Promise<StudyGroup[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('study_groups')
                    .select(`
                        *,
                        profiles:created_by (name),
                        group_members (user_id)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return (data || []).map(group => ({
                    id: group.id,
                    name: group.name,
                    subject: group.subject,
                    description: group.description,
                    createdBy: group.profiles?.name || 'Unknown',
                    members: (group.group_members || []).map((m: any) => m.user_id),
                    memberCount: (group.group_members || []).length,
                    createdAt: group.created_at
                }));
            } catch (err) {
                console.error('Error fetching groups:', err);
            }
        }
        return [...mockGroups];
    },

    create: async (data: { name: string; subject: string; description?: string }): Promise<StudyGroup> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, name')
                        .eq('id', userData.user.id)
                        .single();

                    if (profile) {
                        // Create group
                        const { data: group, error } = await supabase
                            .from('study_groups')
                            .insert({
                                created_by: userData.user.id,
                                name: data.name,
                                subject: data.subject,
                                description: data.description
                            })
                            .select()
                            .single();

                        if (error) throw error;

                        // Auto-join as creator
                        await supabase
                            .from('group_members')
                            .insert({ group_id: group.id, user_id: userData.user.id });

                        return {
                            id: group.id,
                            name: group.name,
                            subject: group.subject,
                            description: group.description,
                            createdBy: profile.name,
                            members: [userData.user.id],
                            memberCount: 1,
                            createdAt: group.created_at
                        };
                    }
                }
            } catch (err) {
                console.error('Error creating group:', err);
            }
        }

        // Mock mode
        const newGroup: StudyGroup = {
            id: `mock-${Date.now()}`,
            name: data.name,
            subject: data.subject,
            description: data.description,
            createdBy: 'You',
            members: ['mock-user-1'],
            memberCount: 1,
            createdAt: new Date().toISOString()
        };
        mockGroups = [newGroup, ...mockGroups];
        return newGroup;
    },

    join: async (groupId: string): Promise<{ members: string[]; joined: boolean }> => {
        if (isSupabaseConfigured && supabase && !groupId.startsWith('mock-')) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    // Check if already a member
                    const { data: existing } = await supabase
                        .from('group_members')
                        .select('*')
                        .eq('group_id', groupId)
                        .eq('user_id', userData.user.id)
                        .single();

                    if (existing) {
                        // Leave group
                        await supabase
                            .from('group_members')
                            .delete()
                            .eq('group_id', groupId)
                            .eq('user_id', userData.user.id);
                    } else {
                        // Join group
                        await supabase
                            .from('group_members')
                            .insert({ group_id: groupId, user_id: userData.user.id });
                    }

                    // Get updated members
                    const { data: members } = await supabase
                        .from('group_members')
                        .select('user_id')
                        .eq('group_id', groupId);

                    return {
                        members: (members || []).map(m => m.user_id),
                        joined: !existing
                    };
                }
            } catch (err) {
                console.error('Error joining group:', err);
            }
        }

        // Mock mode
        const group = mockGroups.find(g => g.id === groupId);
        if (group) {
            const userId = 'mock-user-1';
            const isMember = group.members.includes(userId);
            if (isMember) {
                group.members = group.members.filter(id => id !== userId);
            } else {
                group.members.push(userId);
            }
            group.memberCount = group.members.length;
            return { members: group.members, joined: !isMember };
        }
        return { members: [], joined: false };
    }
};
