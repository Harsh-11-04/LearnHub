import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'contribution' | 'social' | 'learning' | 'special';
    points: number;
    earnedAt?: string;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    avatar?: string;
    points: number;
    level: number;
    rank: number;
    resourceCount: number;
    totalDownloads: number;
    badgeCount: number;
}

export interface UserStats {
    points: number;
    level: number;
    rank: number;
    badges: Badge[];
    resourceCount: number;
    totalDownloads: number;
}

// Mock data
const mockBadges: Badge[] = [
    { id: '1', name: 'First Upload', description: 'Upload your first resource', icon: '📤', category: 'contribution', points: 10 },
    { id: '2', name: 'Helpful Hand', description: 'Get 50 downloads', icon: '🤝', category: 'contribution', points: 50 },
    { id: '3', name: 'Social Butterfly', description: 'Get 10 followers', icon: '🦋', category: 'social', points: 50 }
];

const mockLeaderboard: LeaderboardEntry[] = [
    { id: '1', name: 'Alice Chen', points: 1250, level: 5, rank: 1, resourceCount: 25, totalDownloads: 580, badgeCount: 8 },
    { id: '2', name: 'Bob Kumar', points: 980, level: 4, rank: 2, resourceCount: 18, totalDownloads: 420, badgeCount: 6 },
    { id: '3', name: 'Charlie Lee', points: 750, level: 3, rank: 3, resourceCount: 12, totalDownloads: 280, badgeCount: 5 },
    { id: '4', name: 'Diana Smith', points: 520, level: 3, rank: 4, resourceCount: 8, totalDownloads: 150, badgeCount: 4 },
    { id: '5', name: 'Eve Johnson', points: 340, level: 2, rank: 5, resourceCount: 5, totalDownloads: 90, badgeCount: 3 }
];

export const gamificationService = {
    // Get all badges
    getAllBadges: async (): Promise<Badge[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('badges')
                    .select('*')
                    .order('points', { ascending: false });

                if (error) throw error;

                return (data || []).map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    icon: b.icon,
                    category: b.category,
                    points: b.points
                }));
            } catch (err) {
                console.error('Error fetching badges:', err);
                return mockBadges;
            }
        }

        return mockBadges;
    },

    // Get user's badges
    getUserBadges: async (userId: string): Promise<Badge[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('user_badges')
                    .select(`
                        earned_at,
                        badges (*)
                    `)
                    .eq('user_id', userId);

                if (error) throw error;

                return (data || []).map((ub: any) => {
                    const badge = ub.badges;
                    return {
                        id: badge?.id || '',
                        name: badge?.name || '',
                        description: badge?.description || '',
                        icon: badge?.icon || '',
                        category: badge?.category || 'contribution',
                        points: badge?.points || 0,
                        earnedAt: ub.earned_at
                    };
                });
            } catch (err) {
                console.error('Error fetching user badges:', err);
                return mockBadges.slice(0, 2);
            }
        }

        return mockBadges.slice(0, 2);
    },

    // Get leaderboard
    getLeaderboard: async (limit: number = 10): Promise<LeaderboardEntry[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('leaderboard')
                    .select('*')
                    .limit(limit);

                if (error) throw error;

                return (data || []).map(l => ({
                    id: l.id,
                    name: l.name,
                    avatar: l.avatar_url,
                    points: l.points,
                    level: l.level,
                    rank: l.rank,
                    resourceCount: l.resource_count,
                    totalDownloads: l.total_downloads,
                    badgeCount: l.badge_count
                }));
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                return mockLeaderboard;
            }
        }

        return mockLeaderboard.slice(0, limit);
    },

    // Get user stats
    getUserStats: async (userId: string): Promise<UserStats | null> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('leaderboard')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) throw error;

                const badges = await gamificationService.getUserBadges(userId);

                return {
                    points: data.points,
                    level: data.level,
                    rank: data.rank,
                    badges,
                    resourceCount: data.resource_count,
                    totalDownloads: data.total_downloads
                };
            } catch (err) {
                console.error('Error fetching user stats:', err);
                return null;
            }
        }

        return {
            points: 150,
            level: 2,
            rank: 10,
            badges: mockBadges.slice(0, 2),
            resourceCount: 3,
            totalDownloads: 45
        };
    },

    // Check and award badges manually
    checkBadges: async (userId: string): Promise<Badge[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .rpc('check_and_award_badges', { p_user_id: userId });

                if (error) throw error;

                return (data || []).map((b: any) => ({
                    id: '',
                    name: b.badge_name,
                    icon: b.badge_icon,
                    description: '',
                    category: 'contribution' as const,
                    points: 0
                }));
            } catch (err) {
                console.error('Error checking badges:', err);
                return [];
            }
        }

        return [];
    },

    // Calculate level from points
    calculateLevel: (points: number): number => {
        return Math.max(1, Math.floor(Math.sqrt(points / 100)) + 1);
    },

    // Get points needed for next level
    getPointsForNextLevel: (currentLevel: number): number => {
        return Math.pow(currentLevel, 2) * 100;
    }
};
