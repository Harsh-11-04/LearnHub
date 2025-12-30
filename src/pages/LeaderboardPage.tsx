import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Trophy, Medal, Award, TrendingUp, TrendingDown,
    Search, Crown, Flame, Star, Users
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    avatar?: string;
    points: number;
    contributions: number;
    streak: number;
    trend: 'up' | 'down' | 'same';
    badges: string[];
}

const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, id: '1', name: 'Alice Chen', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice', points: 2840, contributions: 156, streak: 45, trend: 'up', badges: ['Top Contributor', 'Mentor'] },
    { rank: 2, id: '2', name: 'Bob Kumar', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob', points: 2650, contributions: 142, streak: 32, trend: 'up', badges: ['Helper'] },
    { rank: 3, id: '3', name: 'Charlie Lee', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Charlie', points: 2420, contributions: 128, streak: 28, trend: 'same', badges: ['Rising Star'] },
    { rank: 4, id: '4', name: 'Diana Smith', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Diana', points: 2180, contributions: 115, streak: 21, trend: 'down', badges: [] },
    { rank: 5, id: '5', name: 'Ethan Brown', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ethan', points: 1950, contributions: 98, streak: 18, trend: 'up', badges: [] },
    { rank: 6, id: '6', name: 'Fiona Wilson', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Fiona', points: 1820, contributions: 92, streak: 15, trend: 'up', badges: [] },
    { rank: 7, id: '7', name: 'George Davis', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=George', points: 1680, contributions: 85, streak: 12, trend: 'down', badges: [] },
    { rank: 8, id: '8', name: 'Hannah Miller', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hannah', points: 1520, contributions: 78, streak: 10, trend: 'same', badges: [] },
    { rank: 9, id: '9', name: 'Ivan Taylor', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ivan', points: 1380, contributions: 70, streak: 8, trend: 'up', badges: [] },
    { rank: 10, id: '10', name: 'Julia Anderson', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Julia', points: 1250, contributions: 64, streak: 6, trend: 'down', badges: [] },
    { rank: 12, id: 'me', name: 'You', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me', points: 980, contributions: 42, streak: 7, trend: 'up', badges: ['Newcomer'] },
];

const LeaderboardPage = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('monthly');
    const [categoryFilter, setCategoryFilter] = useState<'points' | 'contributions' | 'streak'>('points');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLeaderboard = mockLeaderboard
        .filter(entry => entry.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (categoryFilter === 'points') return b.points - a.points;
            if (categoryFilter === 'contributions') return b.contributions - a.contributions;
            return b.streak - a.streak;
        });

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-slate-300 to-slate-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
        return 'bg-muted text-muted-foreground';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5" />;
        if (rank === 2) return <Medal className="h-5 w-5" />;
        if (rank === 3) return <Award className="h-5 w-5" />;
        return <span className="font-bold">{rank}</span>;
    };

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                    <Trophy className="h-10 w-10 text-yellow-500" />
                    Leaderboard
                </h1>
                <p className="text-muted-foreground mt-2">Top contributors in the community</p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {/* 2nd Place */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="pt-8"
                >
                    <Card className="p-4 text-center bg-gradient-to-b from-slate-400/20 to-slate-400/5 border-slate-400/30">
                        <div className="relative inline-block">
                            <Avatar className="h-16 w-16 mx-auto border-4 border-slate-400">
                                <AvatarImage src={mockLeaderboard[1]?.avatar} />
                                <AvatarFallback>2</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <p className="font-semibold mt-3 text-sm">{mockLeaderboard[1]?.name}</p>
                        <p className="text-xl font-bold text-slate-400">{mockLeaderboard[1]?.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                    </Card>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <Card className="p-4 text-center bg-gradient-to-b from-yellow-400/20 to-yellow-400/5 border-yellow-400/30">
                        <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <div className="relative inline-block">
                            <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                                <AvatarImage src={mockLeaderboard[0]?.avatar} />
                                <AvatarFallback>1</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <p className="font-semibold mt-3">{mockLeaderboard[0]?.name}</p>
                        <p className="text-2xl font-bold text-yellow-500">{mockLeaderboard[0]?.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                        <div className="flex gap-1 justify-center mt-2 flex-wrap">
                            {mockLeaderboard[0]?.badges.map(badge => (
                                <Badge key={badge} className="text-xs bg-yellow-500/20 text-yellow-600">{badge}</Badge>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-12"
                >
                    <Card className="p-4 text-center bg-gradient-to-b from-amber-600/20 to-amber-600/5 border-amber-600/30">
                        <div className="relative inline-block">
                            <Avatar className="h-14 w-14 mx-auto border-4 border-amber-600">
                                <AvatarImage src={mockLeaderboard[2]?.avatar} />
                                <AvatarFallback>3</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">3</div>
                        </div>
                        <p className="font-semibold mt-3 text-sm">{mockLeaderboard[2]?.name}</p>
                        <p className="text-lg font-bold text-amber-600">{mockLeaderboard[2]?.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Time Filter */}
                    <div className="flex gap-2">
                        {(['daily', 'weekly', 'monthly', 'alltime'] as const).map(filter => (
                            <Button
                                key={filter}
                                size="sm"
                                variant={timeFilter === filter ? 'default' : 'outline'}
                                onClick={() => setTimeFilter(filter)}
                                className="capitalize"
                            >
                                {filter === 'alltime' ? 'All Time' : filter}
                            </Button>
                        ))}
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={categoryFilter === 'points' ? 'default' : 'ghost'}
                            onClick={() => setCategoryFilter('points')}
                        >
                            <Star className="h-4 w-4 mr-1" /> Points
                        </Button>
                        <Button
                            size="sm"
                            variant={categoryFilter === 'contributions' ? 'default' : 'ghost'}
                            onClick={() => setCategoryFilter('contributions')}
                        >
                            <Users className="h-4 w-4 mr-1" /> Contributions
                        </Button>
                        <Button
                            size="sm"
                            variant={categoryFilter === 'streak' ? 'default' : 'ghost'}
                            onClick={() => setCategoryFilter('streak')}
                        >
                            <Flame className="h-4 w-4 mr-1" /> Streak
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64"
                        />
                    </div>
                </div>
            </Card>

            {/* Full Leaderboard */}
            <Card className="overflow-hidden">
                <div className="divide-y">
                    {filteredLeaderboard.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors ${entry.id === 'me' ? 'bg-purple-500/10 border-l-4 border-purple-500' : ''}`}
                        >
                            {/* Rank */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankStyle(entry.rank)}`}>
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={entry.avatar} />
                                <AvatarFallback>{entry.name[0]}</AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold truncate">{entry.name}</p>
                                    {entry.id === 'me' && <Badge className="bg-purple-500">You</Badge>}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {entry.contributions}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Flame className="h-3 w-3 text-orange-500" /> {entry.streak} days
                                    </span>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="hidden md:flex gap-1">
                                {entry.badges.slice(0, 2).map(badge => (
                                    <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                                ))}
                            </div>

                            {/* Points & Trend */}
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <span className="text-xl font-bold">
                                        {categoryFilter === 'points' && entry.points.toLocaleString()}
                                        {categoryFilter === 'contributions' && entry.contributions}
                                        {categoryFilter === 'streak' && entry.streak}
                                    </span>
                                    {entry.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                    {entry.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {categoryFilter === 'points' && 'points'}
                                    {categoryFilter === 'contributions' && 'contributions'}
                                    {categoryFilter === 'streak' && 'day streak'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </PageTransition>
    );
};

export default LeaderboardPage;
