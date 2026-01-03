import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Report {
    id: string;
    reporterId: string;
    resourceId?: string;
    commentId?: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
}

export const REPORT_REASONS = [
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'malware', label: 'Contains malware or virus' },
    { value: 'other', label: 'Other' }
];

// Local storage for mock mode
const mockReports: Report[] = [];

export const reportService = {
    // Report a resource
    reportResource: async (resourceId: string, reason: string, description?: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('reports')
                    .insert({
                        reporter_id: userData.user.id,
                        resource_id: resourceId,
                        reason,
                        description
                    });

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error reporting resource:', err);
                return false;
            }
        }

        // Mock mode
        mockReports.push({
            id: `mock-${Date.now()}`,
            reporterId: 'mock-user',
            resourceId,
            reason,
            description,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        return true;
    },

    // Report a comment
    reportComment: async (commentId: string, reason: string, description?: string): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('reports')
                    .insert({
                        reporter_id: userData.user.id,
                        comment_id: commentId,
                        reason,
                        description
                    });

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error reporting comment:', err);
                return false;
            }
        }

        // Mock mode
        mockReports.push({
            id: `mock-${Date.now()}`,
            reporterId: 'mock-user',
            commentId,
            reason,
            description,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        return true;
    },

    // Get pending reports (admin only)
    getPendingReports: async (): Promise<Report[]> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return (data || []).map(r => ({
                    id: r.id,
                    reporterId: r.reporter_id,
                    resourceId: r.resource_id,
                    commentId: r.comment_id,
                    reason: r.reason,
                    description: r.description,
                    status: r.status,
                    createdAt: r.created_at
                }));
            } catch (err) {
                console.error('Error fetching reports:', err);
                return [];
            }
        }

        return mockReports.filter(r => r.status === 'pending');
    },

    // Update report status (admin only)
    updateStatus: async (reportId: string, status: Report['status']): Promise<boolean> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: userData } = await supabase.auth.getUser();

                const { error } = await supabase
                    .from('reports')
                    .update({
                        status,
                        reviewed_by: userData.user?.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', reportId);

                if (error) throw error;
                return true;
            } catch (err) {
                console.error('Error updating report:', err);
                return false;
            }
        }

        // Mock mode
        const report = mockReports.find(r => r.id === reportId);
        if (report) {
            report.status = status;
        }
        return true;
    },

    // Get report count (for admin badge)
    getPendingCount: async (): Promise<number> => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { count, error } = await supabase
                    .from('reports')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting report count:', err);
                return 0;
            }
        }

        return mockReports.filter(r => r.status === 'pending').length;
    }
};
