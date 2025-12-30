import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Question {
    id: string;
    title: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    tags: string[];
    views: number;
    upvotes: number;
    answersCount: number;
    isResolved: boolean;
    createdAt: string;
}

export interface Answer {
    id: string;
    questionId: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    upvotes: number;
    isAccepted: boolean;
    createdAt: string;
}

// Mock data
let mockQuestions: Question[] = [
    {
        id: 'mock-1',
        title: 'How to use React Context effectively?',
        content: 'I am trying to understand when to use Context vs Redux for state management.',
        author: {
            id: 'mock-user-1',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=John'
        },
        tags: ['React', 'State Management'],
        views: 42,
        upvotes: 5,
        answersCount: 2,
        isResolved: false,
        createdAt: new Date().toISOString()
    }
];

let mockAnswers: Answer[] = [];

export const qnaService = {
    getQuestions: async (): Promise<Question[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select(`
                        *,
                        profiles:author_id (id, name, avatar_url),
                        answers (id),
                        question_upvotes (user_id)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return (data || []).map(q => ({
                    id: q.id,
                    title: q.title,
                    content: q.content,
                    author: {
                        id: q.profiles?.id || q.author_id,
                        name: q.profiles?.name || 'Unknown',
                        avatar: q.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user'
                    },
                    tags: q.tags || [],
                    views: q.views || 0,
                    upvotes: (q.question_upvotes || []).length,
                    answersCount: (q.answers || []).length,
                    isResolved: q.is_resolved,
                    createdAt: q.created_at
                }));
            } catch (err) {
                console.error('Error fetching questions:', err);
            }
        }
        return [...mockQuestions];
    },

    createQuestion: async (data: { title: string; content: string; tags: string[] }): Promise<Question> => {
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
                        const { data: question, error } = await supabase
                            .from('questions')
                            .insert({
                                author_id: userData.user.id,
                                title: data.title,
                                content: data.content,
                                tags: data.tags
                            })
                            .select()
                            .single();

                        if (error) throw error;

                        return {
                            id: question.id,
                            title: question.title,
                            content: question.content,
                            author: {
                                id: profile.id,
                                name: profile.name,
                                avatar: profile.avatar_url
                            },
                            tags: question.tags || [],
                            views: 0,
                            upvotes: 0,
                            answersCount: 0,
                            isResolved: false,
                            createdAt: question.created_at
                        };
                    }
                }
            } catch (err) {
                console.error('Error creating question:', err);
            }
        }

        // Mock mode
        const newQuestion: Question = {
            id: `mock-${Date.now()}`,
            title: data.title,
            content: data.content,
            author: {
                id: 'mock-user-1',
                name: 'You',
                avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me'
            },
            tags: data.tags,
            views: 0,
            upvotes: 0,
            answersCount: 0,
            isResolved: false,
            createdAt: new Date().toISOString()
        };
        mockQuestions = [newQuestion, ...mockQuestions];
        return newQuestion;
    },

    getAnswers: async (questionId: string): Promise<Answer[]> => {
        if (isSupabaseConfigured && supabase && !questionId.startsWith('mock-')) {
            try {
                const { data, error } = await supabase
                    .from('answers')
                    .select(`
                        *,
                        profiles:author_id (id, name, avatar_url),
                        answer_upvotes (user_id)
                    `)
                    .eq('question_id', questionId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                return (data || []).map(a => ({
                    id: a.id,
                    questionId: a.question_id,
                    content: a.content,
                    author: {
                        id: a.profiles?.id || a.author_id,
                        name: a.profiles?.name || 'Unknown',
                        avatar: a.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=user'
                    },
                    upvotes: (a.answer_upvotes || []).length,
                    isAccepted: a.is_accepted,
                    createdAt: a.created_at
                }));
            } catch (err) {
                console.error('Error fetching answers:', err);
            }
        }
        return mockAnswers.filter(a => a.questionId === questionId);
    },

    addAnswer: async (questionId: string, content: string): Promise<Answer> => {
        if (isSupabaseConfigured && supabase && !questionId.startsWith('mock-')) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData.user?.id) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, name, avatar_url')
                        .eq('id', userData.user.id)
                        .single();

                    if (profile) {
                        const { data: answer, error } = await supabase
                            .from('answers')
                            .insert({
                                question_id: questionId,
                                author_id: userData.user.id,
                                content
                            })
                            .select()
                            .single();

                        if (error) throw error;

                        return {
                            id: answer.id,
                            questionId: answer.question_id,
                            content: answer.content,
                            author: {
                                id: profile.id,
                                name: profile.name,
                                avatar: profile.avatar_url
                            },
                            upvotes: 0,
                            isAccepted: false,
                            createdAt: answer.created_at
                        };
                    }
                }
            } catch (err) {
                console.error('Error adding answer:', err);
            }
        }

        // Mock mode
        const newAnswer: Answer = {
            id: `mock-${Date.now()}`,
            questionId,
            content,
            author: {
                id: 'mock-user-1',
                name: 'You',
                avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me'
            },
            upvotes: 0,
            isAccepted: false,
            createdAt: new Date().toISOString()
        };
        mockAnswers.push(newAnswer);

        // Update question answer count
        const q = mockQuestions.find(q => q.id === questionId);
        if (q) q.answersCount++;

        return newAnswer;
    },

    upvoteQuestion: async (questionId: string): Promise<number> => {
        if (isSupabaseConfigured && supabase && !questionId.startsWith('mock-')) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (userData.user?.id) {
                    const { data: existing } = await supabase
                        .from('question_upvotes')
                        .select('*')
                        .eq('question_id', questionId)
                        .eq('user_id', userData.user.id)
                        .single();

                    if (existing) {
                        await supabase
                            .from('question_upvotes')
                            .delete()
                            .eq('question_id', questionId)
                            .eq('user_id', userData.user.id);
                    } else {
                        await supabase
                            .from('question_upvotes')
                            .insert({ question_id: questionId, user_id: userData.user.id });
                    }

                    const { data: upvotes } = await supabase
                        .from('question_upvotes')
                        .select('user_id')
                        .eq('question_id', questionId);

                    return (upvotes || []).length;
                }
            } catch (err) {
                console.error('Error upvoting:', err);
            }
        }

        // Mock
        const q = mockQuestions.find(q => q.id === questionId);
        if (q) {
            q.upvotes++;
            return q.upvotes;
        }
        return 0;
    }
};
