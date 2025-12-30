import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    Activity, Search, Filter, Download, Eye, CheckCircle,
    XCircle, Clock, BookOpen, Code2, MessageCircle, Award,
    TrendingUp, Calendar, BarChart3, Users, ArrowLeft
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UserWorkData {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'student' | 'mentor';
    status: 'active' | 'inactive';
    stats: {
        quizzesCompleted: number;
        assignmentsSubmitted: number;
        resourcesShared: number;
        questionsAnswered: number;
        totalPoints: number;
        streak: number;
    };
    recentActivity: {
        type: string;
        description: string;
        timestamp: string;
        status: 'completed' | 'pending' | 'failed';
    }[];
    progress: number;
    lastActive: string;
}

const mockUserWorkData: UserWorkData[] = [
    {
        id: '1', name: 'Alice Chen', email: 'alice@example.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice',
        role: 'student', status: 'active',
        stats: { quizzesCompleted: 15, assignmentsSubmitted: 8, resourcesShared: 12, questionsAnswered: 25, totalPoints: 2840, streak: 12 },
        recentActivity: [
            { type: 'quiz', description: 'Completed React Fundamentals Quiz', timestamp: '2 hours ago', status: 'completed' },
            { type: 'assignment', description: 'Submitted Project Milestone 2', timestamp: '5 hours ago', status: 'completed' },
            { type: 'resource', description: 'Shared TypeScript Guide', timestamp: '1 day ago', status: 'completed' },
        ],
        progress: 85, lastActive: '2 hours ago'
    },
    {
        id: '2', name: 'Bob Kumar', email: 'bob@example.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob',
        role: 'mentor', status: 'active',
        stats: { quizzesCompleted: 8, assignmentsSubmitted: 3, resourcesShared: 45, questionsAnswered: 120, totalPoints: 4250, streak: 28 },
        recentActivity: [
            { type: 'answer', description: 'Answered React Hooks question', timestamp: '1 hour ago', status: 'completed' },
            { type: 'resource', description: 'Shared System Design Notes', timestamp: '3 hours ago', status: 'completed' },
        ],
        progress: 92, lastActive: '1 hour ago'
    },
    {
        id: '3', name: 'Charlie Lee', email: 'charlie@example.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Charlie',
        role: 'student', status: 'inactive',
        stats: { quizzesCompleted: 3, assignmentsSubmitted: 1, resourcesShared: 2, questionsAnswered: 5, totalPoints: 450, streak: 0 },
        recentActivity: [
            { type: 'quiz', description: 'Started JavaScript Basics Quiz', timestamp: '3 days ago', status: 'pending' },
        ],
        progress: 25, lastActive: '3 days ago'
    },
];

const AdminUserWork = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserWorkData[]>(mockUserWorkData);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserWorkData | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || user.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <Award className="h-4 w-4 text-yellow-500" />;
            case 'assignment': return <BookOpen className="h-4 w-4 text-blue-500" />;
            case 'resource': return <Code2 className="h-4 w-4 text-purple-500" />;
            case 'answer': return <MessageCircle className="h-4 w-4 text-green-500" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-500';
            case 'pending': return 'text-yellow-500';
            case 'failed': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const sendReminder = (userId: string) => {
        toast.success('Reminder sent to user');
    };

    const exportUserData = (userId: string) => {
        toast.success('User data exported');
    };

    // Detail View
    if (selectedUser) {
        return (
            <PageTransition className="container mx-auto px-4 py-8 max-w-6xl">
                <Button variant="ghost" onClick={() => setSelectedUser(null)} className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
                </Button>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* User Profile */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarImage src={selectedUser.avatar} />
                                <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{selectedUser.name}</CardTitle>
                            <CardDescription>{selectedUser.email}</CardDescription>
                            <div className="flex justify-center gap-2 mt-2">
                                <Badge variant={selectedUser.role === 'mentor' ? 'default' : 'secondary'}>
                                    {selectedUser.role}
                                </Badge>
                                <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                                    {selectedUser.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                                <Progress value={selectedUser.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{selectedUser.progress}%</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="flex-1" onClick={() => sendReminder(selectedUser.id)}>
                                    Send Reminder
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => exportUserData(selectedUser.id)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" /> Performance Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                                    <p className="text-2xl font-bold text-blue-500">{selectedUser.stats.quizzesCompleted}</p>
                                    <p className="text-xs text-muted-foreground">Quizzes Completed</p>
                                </div>
                                <div className="p-4 rounded-lg bg-green-500/10 text-center">
                                    <p className="text-2xl font-bold text-green-500">{selectedUser.stats.assignmentsSubmitted}</p>
                                    <p className="text-xs text-muted-foreground">Assignments</p>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                                    <p className="text-2xl font-bold text-purple-500">{selectedUser.stats.resourcesShared}</p>
                                    <p className="text-xs text-muted-foreground">Resources Shared</p>
                                </div>
                                <div className="p-4 rounded-lg bg-yellow-500/10 text-center">
                                    <p className="text-2xl font-bold text-yellow-500">{selectedUser.stats.questionsAnswered}</p>
                                    <p className="text-xs text-muted-foreground">Questions Answered</p>
                                </div>
                                <div className="p-4 rounded-lg bg-pink-500/10 text-center">
                                    <p className="text-2xl font-bold text-pink-500">{selectedUser.stats.totalPoints}</p>
                                    <p className="text-xs text-muted-foreground">Total Points</p>
                                </div>
                                <div className="p-4 rounded-lg bg-orange-500/10 text-center">
                                    <p className="text-2xl font-bold text-orange-500">{selectedUser.stats.streak}</p>
                                    <p className="text-xs text-muted-foreground">Day Streak</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" /> Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {selectedUser.recentActivity.map((activity, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                                    >
                                        {getActivityIcon(activity.type)}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                                            {activity.status}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageTransition>
        );
    }

    // List View
    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Activity className="h-8 w-8 text-purple-500" />
                        User Work Tracking
                    </h1>
                    <p className="text-muted-foreground mt-1">Monitor and manage user progress</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'active', 'inactive'] as const).map(f => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? 'default' : 'outline'}
                                onClick={() => setFilter(f)}
                                className="capitalize"
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Users Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedUser(user)}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate">{user.name}</CardTitle>
                                        <CardDescription className="truncate">{user.email}</CardDescription>
                                    </div>
                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                        {user.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-lg font-bold">{user.stats.quizzesCompleted}</p>
                                        <p className="text-xs text-muted-foreground">Quizzes</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">{user.stats.assignmentsSubmitted}</p>
                                        <p className="text-xs text-muted-foreground">Tasks</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">{user.stats.totalPoints}</p>
                                        <p className="text-xs text-muted-foreground">Points</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Progress</span>
                                        <span>{user.progress}%</span>
                                    </div>
                                    <Progress value={user.progress} className="h-1.5" />
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {user.lastActive}
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                                        <Eye className="h-3 w-3 mr-1" /> View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </PageTransition>
    );
};

export default AdminUserWork;
