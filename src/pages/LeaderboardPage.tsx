import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    Medal,
    Award,
    TrendingUp,
    Download,
    FileText,
    Star,
    Crown,
    Zap
} from 'lucide-react';
import { LeaderboardEntry, Badge as BadgeType, gamificationService } from '@/services/gamification.service';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1:
            return <Crown className="h-6 w-6 text-yellow-500" />;
        case 2:
            return <Medal className="h-6 w-6 text-gray-400" />;
        case 3:
            return <Medal className="h-6 w-6 text-amber-600" />;
        default:
            return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
};

const getRankBg = (rank: number) => {
    switch (rank) {
        case 1:
            return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
        case 2:
            return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
        case 3:
            return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
        default:
            return 'hover:bg-muted/50';
    }
};

const LeaderboardPage = () => {
    const { user } = useAppContext();
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
    const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');

    useEffect(() => {
        const load = async () => {
            const [leaderData, badgesData, myBadges] = await Promise.all([
                gamificationService.getLeaderboard(20),
                gamificationService.getAllBadges(),
                user ? gamificationService.getUserBadges(user.id) : Promise.resolve([])
            ]);
            setLeaders(leaderData);
            setAllBadges(badgesData);
            setUserBadges(myBadges);
            setLoading(false);
        };
        load();
    }, [user]);

    const myRank = leaders.find(l => l.id === user?.id);
    const nextLevel = myRank ? gamificationService.getPointsForNextLevel(myRank.level) : 100;
    const currentPoints = myRank?.points || 0;
    const levelProgress = (currentPoints / nextLevel) * 100;

    if (loading) {
        return (
            <PageTransition className="container mx-auto px-4 py-10 max-w-5xl">
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Leaderboard & Achievements
                </h1>
                <p className="text-muted-foreground mt-2">
                    Compete with peers and earn badges for your contributions
                </p>
            </div>

            {/* User Stats Card */}
            {user && myRank && (
                <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-16 w-16 border-4 border-purple-500">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold">{user.name}</h2>
                                <Badge className="bg-purple-500">
                                    <Zap className="h-3 w-3 mr-1" /> Level {myRank.level}
                                </Badge>
                                <Badge variant="outline">
                                    Rank #{myRank.rank}
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{currentPoints} points</span>
                                    <span>{nextLevel} points to level {myRank.level + 1}</span>
                                </div>
                                <Progress value={levelProgress} className="h-2" />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-purple-500">{userBadges.length}</div>
                            <div className="text-sm text-muted-foreground">Badges Earned</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="leaderboard" className="gap-2">
                        <TrendingUp className="h-4 w-4" /> Leaderboard
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="gap-2">
                        <Award className="h-4 w-4" /> Badges
                    </TabsTrigger>
                </TabsList>

                {/* Leaderboard Tab */}
                <TabsContent value="leaderboard" className="mt-6">
                    <Card className="p-6">
                        <div className="space-y-3">
                            {leaders.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                                        getRankBg(entry.rank),
                                        entry.id === user?.id && "ring-2 ring-purple-500"
                                    )}
                                >
                                    <div className="w-10 flex justify-center">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={entry.avatar} />
                                        <AvatarFallback>{entry.name[0]}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{entry.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                Lvl {entry.level}
                                            </Badge>
                                            {entry.id === user?.id && (
                                                <Badge className="bg-purple-500 text-xs">You</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
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
                                        <div className="font-bold text-xl">{entry.points.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges" className="mt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allBadges.map((badge) => {
                            const isEarned = userBadges.some(ub => ub.id === badge.id);
                            return (
                                <Card
                                    key={badge.id}
                                    className={cn(
                                        "p-6 text-center transition-all",
                                        isEarned
                                            ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/50"
                                            : "opacity-50 grayscale"
                                    )}
                                >
                                    <div className="text-4xl mb-3">{badge.icon}</div>
                                    <h3 className="font-bold">{badge.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                                    <div className="mt-3 flex items-center justify-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium">{badge.points} points</span>
                                    </div>
                                    {isEarned && (
                                        <Badge className="mt-3 bg-green-500">✓ Earned</Badge>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </PageTransition>
    );
};

export default LeaderboardPage;
