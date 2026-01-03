import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Download, FileText } from 'lucide-react';
import { LeaderboardEntry, gamificationService } from '@/services/gamification.service';
import { cn } from '@/lib/utils';

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1:
            return <Trophy className="h-5 w-5 text-yellow-500" />;
        case 2:
            return <Medal className="h-5 w-5 text-gray-400" />;
        case 3:
            return <Medal className="h-5 w-5 text-amber-600" />;
        default:
            return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
};

const getRankBg = (rank: number) => {
    switch (rank) {
        case 1:
            return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
        case 2:
            return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
        case 3:
            return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
        default:
            return '';
    }
};

export const LeaderboardComponent = () => {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'week'>('all');

    useEffect(() => {
        const load = async () => {
            const data = await gamificationService.getLeaderboard(20);
            setLeaders(data);
            setLoading(false);
        };
        load();
    }, [timeFrame]);

    if (loading) {
        return (
            <Card className="p-6">
                <div className="text-center text-muted-foreground">Loading leaderboard...</div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Leaderboard
                </h2>
                <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as any)}>
                    <TabsList>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="space-y-3">
                {leaders.map((entry, index) => (
                    <div
                        key={entry.id}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50",
                            getRankBg(entry.rank)
                        )}
                    >
                        <div className="w-8 flex justify-center">
                            {getRankIcon(entry.rank)}
                        </div>

                        <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback>{entry.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{entry.name}</span>
                                <Badge variant="outline" className="text-xs">
                                    Lvl {entry.level}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> {entry.resourceCount} resources
                                </span>
                                <span className="flex items-center gap-1">
                                    <Download className="h-3 w-3" /> {entry.totalDownloads} downloads
                                </span>
                                <span className="flex items-center gap-1">
                                    <Award className="h-3 w-3" /> {entry.badgeCount} badges
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-bold text-lg">{entry.points.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">points</div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
// Named export for backward compatibility
export const Leaderboard = LeaderboardComponent;

export default LeaderboardComponent;
