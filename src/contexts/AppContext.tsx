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
      // Mock mode
      console.log('⚠️ Supabase not configured - using mock authentication');
      const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          const savedUser = localStorage.getItem('mockUser');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (err) {
              console.error('Failed to parse saved user:', err);
              localStorage.removeItem('token');
              localStorage.removeItem('mockUser');
              setUser(null);
            }
          }
        }
        setLoading(false);
      };
      loadUser();
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
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: User = {
        id: "mock-" + Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${email}&backgroundColor=b6e3f4`,
        techStack: ["React", "TypeScript", "Node.js"]
      };
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
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

      // Note: We're using MongoDB for user data, not Supabase profiles table
      // The user will be created in MongoDB via the /auth/sync endpoint when they first login
      // or we can sync immediately if the session is available
      if (data.session) {
        // User is auto-confirmed (email confirmation disabled in Supabase settings)
        // Session is available immediately
        console.log('✅ User registered and auto-confirmed');
      } else {
        // Email confirmation required - user will need to check their email
        console.log('📧 Please check your email to confirm your account');
        throw new Error('Please check your email to confirm your account before logging in.');
      }
    } else {
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: User = {
        id: "mock-" + Date.now(),
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${email}&backgroundColor=b6e3f4`,
        techStack: []
      };
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
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
      // Mock GitHub login
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: User = {
        id: "github-123",
        name: "GitHub Developer",
        email: "github@learnhub.com",
        avatar: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=GitHubDev&backgroundColor=b6e3f4",
        techStack: ["React", "TypeScript", "Open Source"]
      };
      localStorage.setItem('token', 'mock-github-token');
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      // Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      // Mock logout
      localStorage.removeItem('token');
      localStorage.removeItem('mockUser');
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    // We're using MongoDB for user data, not Supabase profiles
    // Just update local state for now
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    if (!isSupabaseConfigured) {
      // Mock mode - save to localStorage
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    }
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