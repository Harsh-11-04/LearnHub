import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ChatMessage {
    id: string;
    groupId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    createdAt: string;
}

// Mock messages storage
const mockMessages: Record<string, ChatMessage[]> = {};

export const chatService = {
    // Get messages for a group
    getMessages: async (groupId: string): Promise<ChatMessage[]> => {
        if (isSupabaseConfigured && supabase && !groupId.startsWith('mock-')) {
            try {
                const { data, error } = await supabase
                    .from('group_messages')
                    .select(`
                        *,
                        profiles:sender_id (name, avatar_url)
                    `)
                    .eq('group_id', groupId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                return (data || []).map(m => ({
                    id: m.id,
                    groupId: m.group_id,
                    senderId: m.sender_id,
                    senderName: m.profiles?.name || 'Unknown',
                    senderAvatar: m.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user',
                    content: m.content,
                    createdAt: m.created_at
                }));
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        }

        // Mock mode
        return mockMessages[groupId] || [];
    },

    // Send a message
    sendMessage: async (groupId: string, content: string): Promise<ChatMessage> => {
        if (isSupabaseConfigured && supabase && !groupId.startsWith('mock-')) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('name, avatar_url')
                        .eq('id', userData.user.id)
                        .single();

                    const { data: message, error } = await supabase
                        .from('group_messages')
                        .insert({
                            group_id: groupId,
                            sender_id: userData.user.id,
                            content
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    return {
                        id: message.id,
                        groupId: message.group_id,
                        senderId: message.sender_id,
                        senderName: profile?.name || 'You',
                        senderAvatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me',
                        content: message.content,
                        createdAt: message.created_at
                    };
                }
            } catch (err) {
                console.error('Error sending message:', err);
            }
        }

        // Mock mode
        const newMessage: ChatMessage = {
            id: `mock-${Date.now()}`,
            groupId,
            senderId: 'mock-user-1',
            senderName: 'You',
            senderAvatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me',
            content,
            createdAt: new Date().toISOString()
        };

        if (!mockMessages[groupId]) {
            mockMessages[groupId] = [];
        }
        mockMessages[groupId].push(newMessage);
        return newMessage;
    },

    // Subscribe to real-time messages
    subscribeToMessages: (groupId: string, callback: (message: ChatMessage) => void) => {
        if (isSupabaseConfigured && supabase && !groupId.startsWith('mock-')) {
            const subscription = supabase
                .channel(`group-${groupId}`)
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
                    async (payload) => {
                        // Fetch sender info
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('name, avatar_url')
                            .eq('id', payload.new.sender_id)
                            .single();

                        callback({
                            id: payload.new.id,
                            groupId: payload.new.group_id,
                            senderId: payload.new.sender_id,
                            senderName: profile?.name || 'Unknown',
                            senderAvatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user',
                            content: payload.new.content,
                            createdAt: payload.new.created_at
                        });
                    }
                )
                .subscribe();

            return () => subscription.unsubscribe();
        }

        return () => { };
    }
};
