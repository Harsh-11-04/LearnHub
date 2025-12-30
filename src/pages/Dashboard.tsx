import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ContributionGraph } from '@/components/ContributionGraph';
import { LiveStudyRooms } from '@/components/LiveStudyRooms';
import { PriorityStack } from '@/components/PriorityStack';
import { Leaderboard } from '@/components/Leaderboard';
import { Sparkles, TrendingUp } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function DashboardPage() {
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
                    Command Center
                </h1>
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
                        <h2 className="text-xl font-semibold">Your Activity</h2>
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
        </PageTransition>
    );
}
