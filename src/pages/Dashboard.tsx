import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ContributionGraph } from '@/components/ContributionGraph';
import { LiveStudyRooms } from '@/components/LiveStudyRooms';
import { PriorityStack } from '@/components/PriorityStack';
import Leaderboard from '@/components/Leaderboard';
import { Sparkles, TrendingUp, Award, BookOpen, Download, Users, Trophy, Zap, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useAppContext } from '@/contexts/AppContext';
import { gamificationService } from '@/services/gamification.service';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState({ points: 150, level: 2, rank: 10, badgeCount: 3 });
    const [loading, setLoading] = useState(true);

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

    return (
        <PageTransition className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-muted-foreground text-lg">
                    Your academic life at a glance
                </p>
            </motion.div>

            {/* User Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="p-4 card-elevated hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Zap className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Points</p>
                                <p className="text-2xl font-bold">{userStats.points}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="p-4 card-elevated hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Level</p>
                                <p className="text-2xl font-bold">{userStats.level}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="p-4 card-elevated hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rank</p>
                                <p className="text-2xl font-bold">#{userStats.rank}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card className="p-4 card-elevated hover-lift">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Award className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Badges</p>
                                <p className="text-2xl font-bold">{userStats.badgeCount}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Level Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-4 card-elevated">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Level {userStats.level} Progress</span>
                        <span className="text-xs text-muted-foreground">{userStats.points} / {nextLevel} points</span>
                    </div>
                    <Progress value={levelProgress} className="h-2" />
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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

            {/* Contribution Graph */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6 card-elevated">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Your Activity</h2>
                    </div>
                    <ContributionGraph />
                </Card>
            </motion.div>

            {/* Live Study Rooms */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <LiveStudyRooms />
            </motion.div>

            {/* Two Column Layout: Priority Stack + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Stack - Takes 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2"
                >
                    <PriorityStack />
                </motion.div>

                {/* Leaderboard - Takes 1 column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Leaderboard />
                </motion.div>
            </div>
        </PageTransition>
    );
}

