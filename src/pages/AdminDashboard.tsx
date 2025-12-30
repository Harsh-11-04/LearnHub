import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    FileText,
    MessageSquare,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    BarChart3,
    Shield,
    Settings,
    Activity,
    FolderOpen,
    BookOpen,
    UserPlus,
    Ban,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminSupabaseService } from '@/services/admin.supabase.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: adminSupabaseService.getStats,
        enabled: isSupabaseConfigured,
    });

    const { data: recentUsers } = useQuery({
        queryKey: ['recentSignups'],
        queryFn: () => adminSupabaseService.getRecentSignups(7),
        enabled: isSupabaseConfigured,
    });

    const recentActivity = [
        { id: 1, type: 'user', action: 'New user registered', user: 'Alice Chen', time: '5 min ago' },
        { id: 2, type: 'report', action: 'Content reported', user: 'Bob Kumar', time: '12 min ago' },
        { id: 3, type: 'post', action: 'New post created', user: 'Charlie Lee', time: '23 min ago' },
        { id: 4, type: 'question', action: 'Question answered', user: 'Diana Smith', time: '1 hour ago' },
    ];

    const quickActions = [
        { label: 'Manage Users', icon: Users, path: '/admin/users', color: 'text-blue-500' },
        { label: 'Content Moderation', icon: Shield, path: '/admin/moderation', color: 'text-orange-500' },
        { label: 'Analytics', icon: BarChart3, path: '/admin/analytics', color: 'text-green-500' },
        { label: 'User Work Tracking', icon: Activity, path: '/admin/user-work', color: 'text-purple-500' },
        { label: 'Content Management', icon: FolderOpen, path: '/admin/content', color: 'text-pink-500' },
        { label: 'Settings', icon: Settings, path: '/settings', color: 'text-gray-500' },
    ];

    if (isLoading) {
        return (
            <div className="p-8 space-y-6 container max-w-7xl mx-auto">
                <Skeleton className="h-10 w-1/3 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    // Default to mock/0 if undefined
    const displayStats = stats || {
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        adminCount: 0,
        totalPosts: 0,
        totalQuestions: 0,
        totalResources: 0,
        totalGroups: 0
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            <Shield className="h-8 w-8 text-primary" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Platform overview and management
                        </p>
                    </div>
                    <Badge variant="outline" className="text-sm border-primary/20 text-primary bg-primary/5">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin Access
                    </Badge>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="card-premium border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{displayStats.totalUsers.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Registered users
                                    </p>
                                </div>
                                <Users className="h-12 w-12 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="card-premium border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{displayStats.activeUsers.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recently active
                                    </p>
                                </div>
                                <TrendingUp className="h-12 w-12 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="card-premium border-purple-500/20 bg-purple-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{displayStats.totalPosts.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Community posts
                                    </p>
                                </div>
                                <FileText className="h-12 w-12 text-purple-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="card-premium border-orange-500/20 bg-orange-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{displayStats.totalQuestions.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Q&A contributions
                                    </p>
                                </div>
                                <MessageSquare className="h-12 w-12 text-orange-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="card-premium border-red-500/20 bg-red-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{displayStats.bannedUsers}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Currently banned
                                    </p>
                                </div>
                                <Ban className="h-12 w-12 text-red-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="card-premium border-cyan-500/20 bg-cyan-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Resources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{displayStats.totalResources}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Shared materials
                                    </p>
                                </div>
                                <BookOpen className="h-12 w-12 text-cyan-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full h-24 flex flex-col gap-2 hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(action.path)}
                                >
                                    <action.icon className={`h-8 w-8 ${action.color}`} />
                                    <span className="text-sm font-medium">{action.label}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform events (Mock Stream)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-background border border-border/50">
                                        {activity.type === 'user' && <Users className="h-4 w-4 text-blue-500" />}
                                        {activity.type === 'report' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                        {activity.type === 'post' && <FileText className="h-4 w-4 text-purple-500" />}
                                        {activity.type === 'question' && <MessageSquare className="h-4 w-4 text-orange-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {activity.time}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
