import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, Profile } from '@/lib/supabase';
import { User } from '@/types/user';

interface AppContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  sidebarOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Supabase mode
      console.log('🔗 Supabase configured - using real authentication');

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          convertSupabaseUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          setLoading(true); // Wait for profile fetch
          convertSupabaseUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      console.warn('Supabase not configured. Authentication will not work.');
      setLoading(false);
    }
  }, []);

  const convertSupabaseUser = (supabaseUser: SupabaseUser) => {
    const user: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      avatar: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${supabaseUser.email || 'user'}&backgroundColor=b6e3f4`,
      techStack: [],
    };
    setUser(user);
    if (user.role && user.role === 'admin') {
      // local update not needed really as we fetch profile next
    }
  };

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile with role from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && profileData) {
        // Update user with role from profile
        setUser(prev => prev ? { ...prev, role: profileData.role || 'user' } : prev);
      }
    } catch (err) {
      console.log('Profile fetch error (may not exist yet):', err);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      // Supabase login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase not configured');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      // Supabase registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;

      if (data.session) {
        // Create profile in database
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: email,
              name: name,
              role: 'user',
              contributions: 0,
              streak: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Verify if it's a "duplicate key" error (trigger might exist?), if so ignore.
            // But for now logs are enough.
          } else {
            console.log('✅ Profile created successfully');
            // Force refresh of session/profile?
            // onAuthStateChange should handle it.
          }
        }

        console.log('✅ User registered and auto-confirmed');
      } else {
        console.log('📧 Please check your email to confirm your account');
        throw new Error('Please check your email to confirm your account before logging in.');
      }
    } else {
      throw new Error('Supabase not configured');
    }
  };

  const loginWithGithub = async () => {
    if (isSupabaseConfigured && supabase) {
      // Supabase GitHub OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase not configured');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      // Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    // We're using MongoDB for user data, not Supabase profiles
    // Just update local state for now
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const value = {
    user,
    profile,
    session,
    loading,
    sidebarOpen,
    login,
    register,
    loginWithGithub,
    logout,
    toggleSidebar,
    isAuthenticated: !!user,
    setUser,
    updateProfile,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};