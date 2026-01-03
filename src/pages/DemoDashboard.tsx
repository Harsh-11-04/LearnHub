import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContributionGraph } from '@/components/ContributionGraph';
import { LiveStudyRooms } from '@/components/LiveStudyRooms';
import { PriorityStack } from '@/components/PriorityStack';
import Leaderboard from '@/components/Leaderboard';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DemoDashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold">LearnHub Dashboard Demo</h1>
                        </div>
                        <Button onClick={() => navigate('/auth')} className="gap-2">
                            Sign In to Access
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h2 className="text-4xl font-bold flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Command Center
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Your academic life at a glance
                    </p>
                </motion.div>

                {/* Contribution Graph */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 bg-background/60 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-semibold">Your Activity</h3>
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

                {/* Two Column Layout: Priority Stack + Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Priority Stack - Takes 2 columns */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <PriorityStack />
                    </motion.div>

                    {/* Leaderboard - Takes 1 column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Leaderboard />
                    </motion.div>
                </div>

                {/* CTA Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-8"
                >
                    <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                        <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
                        <p className="text-muted-foreground mb-4">
                            Sign in to access your personalized dashboard and connect with peers
                        </p>
                        <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                            Sign In Now
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
