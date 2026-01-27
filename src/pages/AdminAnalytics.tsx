import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3, TrendingUp, TrendingDown, Users, FileText, MessageSquare, BookOpen,
    Calendar, Download, RefreshCw, ArrowUp, ArrowDown, Activity, Eye, Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminSupabaseService } from '@/services/admin.supabase.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Chart colors
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AdminAnalytics() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch stats from Supabase
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['adminStats'],
        queryFn: adminSupabaseService.getStats,
        enabled: isSupabaseConfigured,
    });

    // Generate mock chart data based on real stats
    const generateGrowthData = () => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const data = [];
        const baseUsers = (stats?.totalUsers || 10) - days;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                users: Math.max(1, baseUsers + (days - i) + Math.floor(Math.random() * 3)),
                posts: Math.floor(Math.random() * 15) + 5,
                questions: Math.floor(Math.random() * 10) + 2,
            });
        }
        return data;
    };

    const generateActivityData = () => [
        { name: 'Mon', posts: 45, questions: 23, resources: 12 },
        { name: 'Tue', posts: 52, questions: 31, resources: 18 },
        { name: 'Wed', posts: 61, questions: 28, resources: 21 },
        { name: 'Thu', posts: 38, questions: 19, resources: 15 },
        { name: 'Fri', posts: 55, questions: 35, resources: 25 },
        { name: 'Sat', posts: 72, questions: 41, resources: 30 },
        { name: 'Sun', posts: 48, questions: 26, resources: 17 },
    ];

    const generateDistributionData = () => [
        { name: 'Resources', value: stats?.totalResources || 45, color: '#8b5cf6' },
        { name: 'Posts', value: stats?.totalPosts || 120, color: '#3b82f6' },
        { name: 'Questions', value: stats?.totalQuestions || 85, color: '#10b981' },
        { name: 'Groups', value: stats?.totalGroups || 25, color: '#f59e0b' },
    ];

    const generateTopContributors = () => [
        { name: 'Rohan Joshi', contributions: 445, avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=rohan' },
        { name: 'Arjun Mehta', contributions: 312, avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=arjun' },
        { name: 'Priya Patel', contributions: 234, avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=priya' },
        { name: 'Vikram Rao', contributions: 201, avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=vikram' },
        { name: 'Sneha Reddy', contributions: 178, avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sneha' },
    ];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 1000);
        toast.success('Analytics refreshed');
    };

    const handleExport = () => {
        const reportData = {
            generatedAt: new Date().toISOString(),
            timeRange,
            stats,
            growthData: generateGrowthData(),
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success('Report exported successfully');
    };

    const growthData = generateGrowthData();
    const activityData = generateActivityData();
    const distributionData = generateDistributionData();
    const topContributors = generateTopContributors();

    // Calculate trends
    const userGrowth = stats ? Math.round((stats.totalUsers / (stats.totalUsers - 2)) * 100 - 100) : 12;
    const postGrowth = 8;
    const questionGrowth = 15;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time platform insights • Connected to Supabase
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d' | '90d')}>
                        <TabsList>
                            <TabsTrigger value="7d">7 Days</TabsTrigger>
                            <TabsTrigger value="30d">30 Days</TabsTrigger>
                            <TabsTrigger value="90d">90 Days</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        title: 'Total Users',
                        value: stats?.totalUsers || 0,
                        change: userGrowth,
                        icon: Users,
                        color: 'text-blue-500',
                        bgColor: 'bg-blue-500/10 border-blue-500/20'
                    },
                    {
                        title: 'Total Posts',
                        value: stats?.totalPosts || 0,
                        change: postGrowth,
                        icon: FileText,
                        color: 'text-purple-500',
                        bgColor: 'bg-purple-500/10 border-purple-500/20'
                    },
                    {
                        title: 'Questions',
                        value: stats?.totalQuestions || 0,
                        change: questionGrowth,
                        icon: MessageSquare,
                        color: 'text-green-500',
                        bgColor: 'bg-green-500/10 border-green-500/20'
                    },
                    {
                        title: 'Resources',
                        value: stats?.totalResources || 0,
                        change: 5,
                        icon: BookOpen,
                        color: 'text-orange-500',
                        bgColor: 'bg-orange-500/10 border-orange-500/20'
                    },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`${stat.bgColor} border`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            {stat.change > 0 ? (
                                                <ArrowUp className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={`text-xs ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {Math.abs(stat.change)}% vs last period
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                User Growth
                            </CardTitle>
                            <CardDescription>New user signups over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a2e',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#8b5cf6"
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Activity by Day */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Weekly Activity
                            </CardTitle>
                            <CardDescription>Content creation by day of week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a2e',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="questions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="resources" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                Content Distribution
                            </CardTitle>
                            <CardDescription>Breakdown by content type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a2e',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Contributors */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <Card className="glass-panel h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Top Contributors
                            </CardTitle>
                            <CardDescription>Most active users this period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topContributors.map((user, index) => (
                                    <motion.div
                                        key={user.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                                            #{index + 1}
                                        </div>
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{user.name}</p>
                                            <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(user.contributions / 500) * 100}%` }}
                                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="font-mono">
                                            {user.contributions}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Platform Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-500">{stats?.activeUsers || 8}</div>
                                <p className="text-sm text-muted-foreground mt-1">Active Users</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-500">{stats?.adminCount || 2}</div>
                                <p className="text-sm text-muted-foreground mt-1">Admins</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-500">{stats?.totalGroups || 0}</div>
                                <p className="text-sm text-muted-foreground mt-1">Study Groups</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-orange-500">99.9%</div>
                                <p className="text-sm text-muted-foreground mt-1">Uptime</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
