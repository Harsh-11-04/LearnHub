import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    type: 'assignment' | 'quiz' | 'doubt';
}

const mockTasks: Record<string, Task[]> = {
    assignments: [
        { id: '1', title: 'Data Structures Assignment 3', dueDate: '2 days', priority: 'high', type: 'assignment' },
        { id: '2', title: 'Web Dev Project Submission', dueDate: '5 days', priority: 'medium', type: 'assignment' }
    ],
    quizzes: [
        { id: '3', title: 'OS Mid-term Quiz', dueDate: 'Tomorrow', priority: 'high', type: 'quiz' },
        { id: '4', title: 'DBMS Practice Test', dueDate: '3 days', priority: 'low', type: 'quiz' }
    ],
    doubts: [
        { id: '5', title: 'Graph traversal optimization', dueDate: 'Today', priority: 'high', type: 'doubt' },
        { id: '6', title: 'React useEffect cleanup', dueDate: '1 day', priority: 'medium', type: 'doubt' }
    ]
};

const typeToRoute: Record<string, string> = {
    assignments: '/assignments',
    quizzes: '/quizzes',
    doubts: '/doubts'
};

export function PriorityStack() {
    const navigate = useNavigate();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-muted-foreground bg-muted/10';
        }
    };

    const getColumnColor = (type: string) => {
        switch (type) {
            case 'assignments': return 'border-red-500/30';
            case 'quizzes': return 'border-yellow-500/30';
            case 'doubts': return 'border-blue-500/30';
            default: return 'border-border';
        }
    };

    const getColumnIcon = (type: string) => {
        switch (type) {
            case 'assignments': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'quizzes': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'doubts': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            default: return null;
        }
    };

    const handleCardClick = (type: string) => {
        const route = typeToRoute[type];
        if (route) {
            navigate(route);
        }
    };

    const handleViewAll = (type: string) => {
        const route = typeToRoute[type];
        if (route) {
            navigate(route);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">Priority Stack</h3>
                <p className="text-sm text-muted-foreground">Your upcoming tasks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(mockTasks).map(([type, tasks], columnIndex) => (
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: columnIndex * 0.1 }}
                    >
                        <Card className={`p-4 border-t-2 ${getColumnColor(type)} bg-background/40 backdrop-blur-sm`}>
                            <div className="flex items-center gap-2 mb-4">
                                {getColumnIcon(type)}
                                <h4 className="font-semibold capitalize">{type}</h4>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    {tasks.length}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {tasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: columnIndex * 0.1 + index * 0.05 }}
                                    >
                                        <Card
                                            className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group hover:border-primary/30"
                                            onClick={() => handleCardClick(type)}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium line-clamp-2 flex-1">
                                                        {task.title}
                                                    </p>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{task.dueDate}</span>
                                                    </div>

                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs px-2 py-0 ${getPriorityColor(task.priority)}`}
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* View All Button */}
                            <Button
                                variant="ghost"
                                className="w-full mt-3 text-xs"
                                size="sm"
                                onClick={() => handleViewAll(type)}
                            >
                                View All {type}
                                <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
