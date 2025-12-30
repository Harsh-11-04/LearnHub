import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Award } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    avatar?: string;
    points: number;
    contributions: number;
    trend: 'up' | 'down' | 'same';
}

const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, id: '1', name: 'Alice Chen', avatar: 'https://github.com/shadcn.png', points: 2840, contributions: 156, trend: 'up' },
    { rank: 2, id: '2', name: 'Bob Kumar', points: 2650, contributions: 142, trend: 'up' },
    { rank: 3, id: '3', name: 'Charlie Lee', points: 2420, contributions: 128, trend: 'same' },
    { rank: 4, id: '4', name: 'Diana Smith', points: 2180, contributions: 115, trend: 'down' },
    { rank: 5, id: '5', name: 'Ethan Brown', points: 1950, contributions: 98, trend: 'up' }
];

export function Leaderboard() {
    const navigate = useNavigate();

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-500 bg-yellow-500/10';
            case 2: return 'text-slate-400 bg-slate-400/10';
            case 3: return 'text-amber-600 bg-amber-600/10';
            default: return 'text-muted-foreground bg-muted/10';
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
        if (rank === 2) return <Award className="h-4 w-4 text-slate-400" />;
        if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
        return null;
    };

    return (
        <Card className="p-6 bg-background/60 backdrop-blur-md">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Top Contributors
                        </h3>
                        <p className="text-sm text-muted-foreground">This month's leaders</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/leaderboard')}>
                        View All
                    </Button>
                </div>

                {/* Leaderboard List */}
                <div className="space-y-2">
                    {mockLeaderboard.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                                {/* Rank */}
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankColor(entry.rank)}`}>
                                    {getRankIcon(entry.rank) || entry.rank}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-10 w-10 border-2 border-background">
                                    <AvatarImage src={entry.avatar} />
                                    <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                                </Avatar>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{entry.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.contributions} contributions
                                    </p>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1">
                                        <motion.p
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.05 + 0.2 }}
                                            className="font-bold text-primary"
                                        >
                                            {entry.points.toLocaleString()}
                                        </motion.p>
                                        {entry.trend === 'up' && (
                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">points</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Rank</span>
                        <Badge variant="secondary" className="font-semibold">
                            #12
                        </Badge>
                    </div>
                </div>
            </div>
        </Card>
    );
}
