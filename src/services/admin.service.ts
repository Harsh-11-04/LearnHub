import api from './api';
import { User } from '../types/user';

export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalQuestions: number;
    pendingReports: number;
    resolvedToday: number;
}

export interface UserListResponse {
    users: User[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
}

export const adminService = {
    // Get Dashboard Stats
    getStats: async (): Promise<AdminStats> => {
        const res = await api.get('/admin/stats');
        return res.data;
    },

    // Get Users with Pagination & Filter
    getUsers: async (page = 1, search = '', role = 'all', status = 'all'): Promise<UserListResponse> => {
        const res = await api.get('/admin/users', {
            params: { page, search, role, status }
        });
        return res.data;
    },

    // Promote/Demote User
    updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
        await api.put(`/admin/users/${userId}/role`, { role });
    },

    // Ban/Unban User
    banUser: async (userId: string, status: 'active' | 'banned'): Promise<void> => {
        await api.put(`/admin/users/${userId}/ban`, { status });
    },

    // Get Reports
    getReports: async (status = 'all'): Promise<any[]> => {
        const res = await api.get('/admin/reports', { params: { status } });
        return res.data;
    },

    // Update Report Status
    updateReportStatus: async (reportId: string, status: 'resolved' | 'dismissed'): Promise<void> => {
        await api.put(`/admin/reports/${reportId}`, { status });
    }
};
