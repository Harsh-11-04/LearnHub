import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Activity, Calendar, Flame, Trophy, Target,
    BookOpen, Code2, MessageCircle, CheckCircle, Star
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface ActivityItem {
    id: string;
    type: 'post' | 'resource' | 'answer' | 'quiz' | 'group';
    title: string;
    timestamp: string;
    points: number;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
}

const mockActivities: ActivityItem[] = [
    { id: '1', type: 'answer', title: 'Answered a question about React Hooks', timestamp: '2 hours ago', points: 15 },
    { id: '2', type: 'resource', title: 'Shared "Advanced TypeScript Patterns"', timestamp: '5 hours ago', points: 20 },
    { id: '3', type: 'quiz', title: 'Completed DSA Quiz with 85%', timestamp: 'Yesterday', points: 50 },
    { id: '4', type: 'post', title: 'Posted about learning journey', timestamp: 'Yesterday', points: 10 },
    { id: '5', type: 'group', title: 'Joined React Developers group', timestamp: '2 days ago', points: 5 },
];

const mockAchievements: Achievement[] = [
    { id: '1', name: 'First Steps', description: 'Complete your first activity', icon: '🎯', unlocked: true },
    { id: '2', name: 'Helper', description: 'Answer 10 questions', icon: '🤝', unlocked: true },
    { id: '3', name: 'Scholar', description: 'Complete 5 quizzes', icon: '📚', unlocked: true },
    { id: '4', name: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: true },
    { id: '5', name: 'Mentor', description: 'Help 50 students', icon: '👨‍🏫', unlocked: false, progress: 32, maxProgress: 50 },
    { id: '6', name: 'Top Contributor', description: 'Reach top 10 on leaderboard', icon: '🏆', unlocked: false, progress: 12, maxProgress: 10 },
];

// Generate contribution data for the last 12 months
const generateContributionData = () => {
    const data = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10), // Random 0-9 contributions
            day: date.getDay()
        });
    }
    return data;
};

const contributionData = generateContributionData();

const ActivityPage = () => {
    const [view, setView] = useState<'overview' | 'achievements' | 'history'>('overview');

    const getContributionColor = (count: number) => {
        if (count === 0) return 'bg-muted';
        if (count <= 2) return 'bg-green-200 dark:bg-green-900';
        if (count <= 4) return 'bg-green-400 dark:bg-green-700';
        if (count <= 6) return 'bg-green-500 dark:bg-green-600';
        return 'bg-green-600 dark:bg-green-500';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'post': return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case 'resource': return <BookOpen className="h-4 w-4 text-purple-500" />;
            case 'answer': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'quiz': return <Target className="h-4 w-4 text-yellow-500" />;
            case 'group': return <Code2 className="h-4 w-4 text-pink-500" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const totalContributions = contributionData.reduce((sum, d) => sum + d.count, 0);
    const currentStreak = 7;
    const longestStreak = 15;

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="h-8 w-8 text-green-500" />
                    Activity & Progress
                </h1>
                <p className="text-muted-foreground mt-1">Track your learning journey</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-4 text-center bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <Activity className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{totalContributions}</p>
                        <p className="text-sm text-muted-foreground">Total Activities</p>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="p-4 text-center bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                        <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                        <p className="text-2xl font-bold">{currentStreak}</p>
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                        <Trophy className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">{longestStreak}</p>
                        <p className="text-sm text-muted-foreground">Longest Streak</p>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="p-4 text-center bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                        <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold">{mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length}</p>
                        <p className="text-sm text-muted-foreground">Achievements</p>
                    </Card>
                </motion.div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
                {(['overview', 'achievements', 'history'] as const).map(v => (
                    <Button
                        key={v}
                        variant={view === v ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView(v)}
                        className="capitalize"
                    >
                        {v}
                    </Button>
                ))}
            </div>

            {/* Overview View */}
            {view === 'overview' && (
                <div className="space-y-6">
                    {/* Contribution Graph */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-500" />
                                Contribution Graph
                            </h3>
                            <span className="text-sm text-muted-foreground">{totalContributions} contributions in the last year</span>
                        </div>

                        {/* Simplified Grid - Show weeks */}
                        <div className="overflow-x-auto">
                            <div className="flex gap-1" style={{ minWidth: '700px' }}>
                                {Array.from({ length: 52 }).map((_, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1">
                                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                                            const dataIndex = weekIndex * 7 + dayIndex;
                                            const d = contributionData[dataIndex];
                                            return (
                                                <motion.div
                                                    key={dayIndex}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: weekIndex * 0.01 }}
                                                    title={d ? `${d.date}: ${d.count} contributions` : ''}
                                                    className={`w-3 h-3 rounded-sm ${d ? getContributionColor(d.count) : 'bg-muted'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                            <span>Less</span>
                            {[0, 2, 4, 6, 8].map(level => (
                                <div key={level} className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {mockActivities.slice(0, 5).map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                                >
                                    {getActivityIcon(activity.type)}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">+{activity.points} pts</Badge>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Achievements View */}
            {view === 'achievements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockAchievements.map((achievement, index) => (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-4 ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/5' : 'opacity-60'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{achievement.name}</h4>
                                            {achievement.unlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                        {!achievement.unlocked && achievement.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>Progress</span>
                                                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                                                </div>
                                                <Progress value={(achievement.progress / (achievement.maxProgress || 1)) * 100} className="h-2" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* History View */}
            {view === 'history' && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Full Activity History</h3>
                    <div className="space-y-2">
                        {mockActivities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                            >
                                {getActivityIcon(activity.type)}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                </div>
                                <Badge variant="outline" className="text-xs capitalize">{activity.type}</Badge>
                                <Badge variant="secondary" className="text-xs">+{activity.points}</Badge>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            )}
        </PageTransition>
    );
};

export default ActivityPage;
