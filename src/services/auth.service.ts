import api from './api';
import { supabase } from '../lib/supabase';
import { User } from '../types/user';

export const authService = {
    // Login with Supabase
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.session) throw new Error('No session created');

        const token = data.session.access_token;
        localStorage.setItem('token', token);

        // Fetch User Profile from MongoDB (via Backend)
        const res = await api.get('/auth/me');
        return { token, user: res.data };
    },

    // Register with Supabase + MongoDB Sync
    register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
        if (!supabase) throw new Error('Supabase not configured');

        // 1. Create Auth User in Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }, // Metadata for Supabase
            },
        });

        if (error) throw error;
        if (!data.user) throw new Error('User creation failed');

        // 2. Sync with MongoDB Backend
        // We send the Supabase ID to link them
        const res = await api.post('/auth/sync', {
            name,
            email,
            supabaseId: data.user.id,
        });

        const token = data.session?.access_token;
        if (token) {
            localStorage.setItem('token', token);
        }

        return { token: token || '', user: res.data };
    },

    // Load User
    loadUser: async (): Promise<User> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const token = session.access_token;
        localStorage.setItem('token', token); // Refresh token in LS

        const res = await api.get('/auth/me');
        return res.data;
    },

    // Logout
    logout: async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('token');
    }
};
