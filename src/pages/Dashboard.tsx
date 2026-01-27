import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContributionGraph } from '@/components/ContributionGraph';
import { LiveStudyRooms } from '@/components/LiveStudyRooms';
import { PriorityStack } from '@/components/PriorityStack';
import Leaderboard from '@/components/Leaderboard';
import {
    Sparkles, TrendingUp, Award, BookOpen, Users, Trophy, Zap,
    ChevronRight, LayoutDashboard, ListTodo, Activity, Medal
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useAppContext } from '@/contexts/AppContext';
import { gamificationService } from '@/services/gamification.service';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState({ points: 150, level: 2, rank: 10, badgeCount: 3 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const load = async () => {
            if (user) {
                const stats = await gamificationService.getUserStats(user.id);
                if (stats) {
                    setUserStats({
                        points: stats.points,
                        level: stats.level,
                        rank: stats.rank,
                        badgeCount: stats.badges.length
                    });
                }
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const nextLevel = gamificationService.getPointsForNextLevel(userStats.level);
    const levelProgress = (userStats.points / nextLevel) * 100;

    const quickActions = [
        { label: 'Upload Resource', icon: BookOpen, path: '/resources', color: 'text-blue-500' },
        { label: 'View Leaderboard', icon: Trophy, path: '/leaderboard', color: 'text-yellow-500' },
        { label: 'Find Peers', icon: Users, path: '/peers', color: 'text-green-500' },
    ];

    const statCards = [
        { label: 'Points', value: userStats.points, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Level', value: userStats.level, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Rank', value: `#${userStats.rank}`, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Badges', value: userStats.badgeCount, icon: Award, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    return (
        <PageTransition className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Compact Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-7 w-7 text-primary" />
                        Welcome, {user?.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Your academic command center
                    </p>
                </div>

                {/* Mini Stats Bar */}
                <div className="flex items-center gap-3">
                    {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg} border border-white/5`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                            <div className="text-sm">
                                <span className="font-bold">{value}</span>
                                <span className="text-muted-foreground ml-1 hidden sm:inline">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Level Progress (Compact) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Level {userStats.level} Progress</span>
                    <span className="text-xs text-muted-foreground">{userStats.points} / {nextLevel} pts</span>
                </div>
                <Progress value={levelProgress} className="h-1.5" />
            </motion.div>

            {/* Main Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="overview" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="gap-2">
                        <ListTodo className="h-4 w-4" />
                        <span className="hidden sm:inline">Tasks</span>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline">Activity</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="gap-2">
                        <Medal className="h-4 w-4" />
                        <span className="hidden sm:inline">Rankings</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {quickActions.map(({ label, icon: Icon, path, color }) => (
                                <Button
                                    key={path}
                                    variant="outline"
                                    onClick={() => navigate(path)}
                                    className="gap-2 btn-press hover-lift"
                                >
                                    <Icon className={`h-4 w-4 ${color}`} />
                                    {label}
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Activity Graph */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-6 card-elevated">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Your Activity</h2>
                            </div>
                            <ContributionGraph />
                        </Card>
                    </motion.div>

                    {/* Live Study Rooms */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <LiveStudyRooms />
                    </motion.div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PriorityStack />
                    </motion.div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-6 card-elevated">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Contribution Activity</h2>
                            </div>
                            <ContributionGraph />
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <LiveStudyRooms />
                    </motion.div>
                </TabsContent>

                {/* Leaderboard Tab */}
                <TabsContent value="leaderboard" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Leaderboard />
                    </motion.div>
                </TabsContent>
            </Tabs>
        </PageTransition>
    );
}
