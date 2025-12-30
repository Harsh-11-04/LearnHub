import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not found. Using mock mode.');
    console.warn('To enable Supabase:');
    console.warn('1. Create a .env.local file');
    console.warn('2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.warn('3. Restart the dev server');
}

// Create Supabase client (will be null if env vars missing)
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Check if Supabase is configured
export const isSupabaseConfigured = !!supabase;

// ============================================
// TypeScript Types
// ============================================

export type Profile = {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    year?: number;
    college?: string;
    tech_stack?: string[];
    interests?: string[];
    github_profile?: string;
    linkedin_profile?: string;
    contributions: number;
    streak: number;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
};

export type Connection = {
    id: string;
    from_user: string;
    to_user: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
};

export type CodeSession = {
    id: string;
    session_id: string;
    host_id: string;
    language: string;
    code?: string;
    is_active: boolean;
    created_at: string;
    last_activity: string;
};

export type Question = {
    id: string;
    author_id: string;
    title: string;
    content: string;
    tags?: string[];
    views: number;
    is_resolved: boolean;
    created_at: string;
    updated_at: string;
};

export type Answer = {
    id: string;
    question_id: string;
    author_id: string;
    content: string;
    is_accepted: boolean;
    created_at: string;
    updated_at: string;
};

export type Resource = {
    id: string;
    author_id: string;
    title: string;
    description?: string;
    url?: string;
    file_url?: string;
    subject: string;
    tags?: string[];
    created_at: string;
};

export type StudyGroup = {
    id: string;
    created_by: string;
    name: string;
    subject: string;
    description?: string;
    created_at: string;
};

export type Post = {
    id: string;
    author_id: string;
    content: string;
    image_url?: string;
    created_at: string;
};

export type Activity = {
    id: string;
    user_id: string;
    activity_type: string;
    activity_date: string;
    count: number;
    created_at: string;
};
