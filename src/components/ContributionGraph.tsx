import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContributionDay {
    date: Date;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionGraphProps {
    data?: ContributionDay[];
}

// Generate mock data for demonstration
const generateMockData = (): ContributionDay[] => {
    const days: ContributionDay[] = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
        const date = subDays(today, i);
        const count = Math.floor(Math.random() * 15);
        const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;

        days.push({ date, count, level: level as 0 | 1 | 2 | 3 | 4 });
    }

    return days;
};

export function ContributionGraph({ data }: ContributionGraphProps) {
    const contributionData = data || generateMockData();

    // Organize data into weeks
    const weeks = useMemo(() => {
        const firstDay = contributionData[0].date;
        const startDay = startOfWeek(firstDay, { weekStartsOn: 0 }); // Sunday

        const weeksArray: (ContributionDay | null)[][] = [];
        let currentWeek: (ContributionDay | null)[] = [];

        // Fill initial empty days
        const daysDiff = differenceInDays(firstDay, startDay);
        for (let i = 0; i < daysDiff; i++) {
            currentWeek.push(null);
        }

        contributionData.forEach((day) => {
            currentWeek.push(day);

            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });

        // Fill remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeksArray.push(currentWeek);
        }

        return weeksArray;
    }, [contributionData]);

    const getLevelColor = (level: 0 | 1 | 2 | 3 | 4) => {
        const colors = {
            0: 'bg-muted/30',
            1: 'bg-primary/20',
            2: 'bg-primary/40',
            3: 'bg-primary/60',
            4: 'bg-primary/80'
        };
        return colors[level];
    };

    const totalContributions = contributionData.reduce((sum, day) => sum + day.count, 0);
    const currentStreak = useMemo(() => {
        let streak = 0;
        for (let i = contributionData.length - 1; i >= 0; i--) {
            if (contributionData[i].count > 0) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }, [contributionData]);

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Total Contributions</p>
                    <p className="text-2xl font-bold">{totalContributions}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold text-primary">{currentStreak} days</p>
                </div>
            </div>

            {/* Graph */}
            <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-[3px]">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dayIndex) => (
                                <TooltipProvider key={dayIndex} delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                                                className={`w-[11px] h-[11px] rounded-sm ${day ? getLevelColor(day.level) : 'bg-transparent'
                                                    } ${day ? 'hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer' : ''}`}
                                            />
                                        </TooltipTrigger>
                                        {day && (
                                            <TooltipContent>
                                                <p className="font-medium">{day.count} contributions</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(day.date, 'MMM d, yyyy')}
                                                </p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`w-3 h-3 rounded-sm ${getLevelColor(level as 0 | 1 | 2 | 3 | 4)}`}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
