import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart3, TrendingUp, Users, BookOpen, Award, Activity,
    ArrowLeft, ArrowUp, ArrowDown, Calendar, Download, RefreshCw
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Real-time updating stats
    const [stats, setStats] = useState({
        totalUsers: 1247,
        activeUsers: 892,
        newUsersToday: 23,
        quizzesCompleted: 3456,
        resourcesShared: 892,
        questionsAnswered: 2341,
        avgSessionTime: 24,
        engagementRate: 78
    });

    const [chartData, setChartData] = useState([65, 72, 58, 80, 75, 90, 85, 78, 92, 88, 95, 82]);
    const [pieData, setPieData] = useState([
        { label: 'Quizzes', value: 35, color: '#6366f1' },
        { label: 'Resources', value: 28, color: '#22c55e' },
        { label: 'Q&A', value: 22, color: '#f59e0b' },
        { label: 'Groups', value: 15, color: '#ec4899' },
    ]);

    // Real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
                newUsersToday: prev.newUsersToday + (Math.random() > 0.7 ? 1 : 0),
                engagementRate: Math.min(100, Math.max(60, prev.engagementRate + (Math.random() - 0.5) * 3))
            }));

            setChartData(prev => [...prev.slice(1), Math.floor(Math.random() * 30) + 70]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        setIsRefreshing(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsRefreshing(false);
        toast.success('Data refreshed');
    };

    const exportReport = () => {
        toast.success('Report exported successfully');
    };

    // Chart Drawing
    const max = Math.max(...chartData);
    const points = chartData.map((val, i) => {
        const x = (i / (chartData.length - 1)) * 100;
        const y = 100 - (val / max) * 80;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M0,100 L0,${100 - (chartData[0] / max) * 80} ${points} 100,100 Z`;

    // Pie Chart calculation
    const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-blue-500" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Real-time platform insights</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={exportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map(range => (
                    <Button
                        key={range}
                        size="sm"
                        variant={timeRange === range ? 'default' : 'outline'}
                        onClick={() => setTimeRange(range)}
                    >
                        {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                    </Button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <Users className="h-8 w-8 text-blue-500" />
                                <Badge className="bg-green-500/20 text-green-500">
                                    <ArrowUp className="h-3 w-3 mr-1" /> +{stats.newUsersToday}
                                </Badge>
                            </div>
                            <motion.p
                                key={stats.totalUsers}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className="text-3xl font-bold mt-2"
                            >
                                {stats.totalUsers.toLocaleString()}
                            </motion.p>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <Activity className="h-8 w-8 text-green-500" />
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </div>
                            </div>
                            <motion.p
                                key={stats.activeUsers}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className="text-3xl font-bold mt-2"
                            >
                                {stats.activeUsers.toLocaleString()}
                            </motion.p>
                            <p className="text-sm text-muted-foreground">Active Now</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <Award className="h-8 w-8 text-purple-500" />
                                <Badge className="bg-purple-500/20 text-purple-500">Top Activity</Badge>
                            </div>
                            <p className="text-3xl font-bold mt-2">{stats.quizzesCompleted.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <TrendingUp className="h-8 w-8 text-orange-500" />
                                <Badge className={stats.engagementRate >= 75 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                                    {stats.engagementRate >= 75 ? 'Good' : 'Average'}
                                </Badge>
                            </div>
                            <motion.p
                                key={Math.round(stats.engagementRate)}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className="text-3xl font-bold mt-2"
                            >
                                {stats.engagementRate.toFixed(1)}%
                            </motion.p>
                            <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Line Chart */}
                <Card className="p-6">
                    <CardHeader className="p-0 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                User Activity Trend
                            </CardTitle>
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[200px] relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <defs>
                                    <linearGradient id="adminChartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    d={areaPath}
                                    fill="url(#adminChartGradient)"
                                    animate={{ d: areaPath }}
                                    transition={{ duration: 0.5 }}
                                />
                                <motion.polyline
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    animate={{ points }}
                                    transition={{ duration: 0.5 }}
                                    strokeLinecap="round"
                                />
                                {chartData.map((val, i) => (
                                    <motion.circle
                                        key={i}
                                        r="2"
                                        fill="#fff"
                                        stroke="#3b82f6"
                                        strokeWidth="1"
                                        animate={{
                                            cx: (i / (chartData.length - 1)) * 100,
                                            cy: 100 - (val / max) * 80
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                ))}
                            </svg>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="p-6">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            Activity Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex items-center gap-6">
                            <div className="relative w-40 h-40">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    {pieData.map((item, i) => {
                                        const angle = (item.value / pieTotal) * 360;
                                        const startAngle = currentAngle;
                                        currentAngle += angle;

                                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                        const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                                        const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                                        const largeArc = angle > 180 ? 1 : 0;

                                        return (
                                            <motion.path
                                                key={i}
                                                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                fill={item.color}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="hover:opacity-80 cursor-pointer"
                                            />
                                        );
                                    })}
                                    <circle cx="50" cy="50" r="25" className="fill-background" />
                                </svg>
                            </div>
                            <div className="space-y-3">
                                {pieData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm">{item.label}</span>
                                        <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-10 w-10 text-blue-500 p-2 rounded-lg bg-blue-500/10" />
                        <div>
                            <p className="text-2xl font-bold">{stats.resourcesShared}</p>
                            <p className="text-sm text-muted-foreground">Resources Shared</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Award className="h-10 w-10 text-yellow-500 p-2 rounded-lg bg-yellow-500/10" />
                        <div>
                            <p className="text-2xl font-bold">{stats.questionsAnswered}</p>
                            <p className="text-sm text-muted-foreground">Questions Answered</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-10 w-10 text-green-500 p-2 rounded-lg bg-green-500/10" />
                        <div>
                            <p className="text-2xl font-bold">{stats.avgSessionTime} min</p>
                            <p className="text-sm text-muted-foreground">Avg Session Time</p>
                        </div>
                    </div>
                </Card>
            </div>
        </PageTransition>
    );
};

export default AdminAnalytics;
