import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Video, Code2, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StudyRoom {
    id: string;
    name: string;
    topic: string;
    participants: {
        id: string;
        name: string;
        avatar?: string;
    }[];
    techStack: string[];
    isActive: boolean;
}

// Mock data
const mockRooms: StudyRoom[] = [
    {
        id: '1',
        name: 'React Deep Dive',
        topic: 'Hooks & Performance',
        participants: [
            { id: '1', name: 'Alice', avatar: 'https://github.com/shadcn.png' },
            { id: '2', name: 'Bob' },
            { id: '3', name: 'Charlie' }
        ],
        techStack: ['React', 'TypeScript'],
        isActive: true
    },
    {
        id: '2',
        name: 'DSA Practice',
        topic: 'Graph Algorithms',
        participants: [
            { id: '4', name: 'David' },
            { id: '5', name: 'Eve' }
        ],
        techStack: ['Python', 'Algorithms'],
        isActive: true
    },
    {
        id: '3',
        name: 'System Design',
        topic: 'Microservices Architecture',
        participants: [
            { id: '6', name: 'Frank' },
            { id: '7', name: 'Grace' },
            { id: '8', name: 'Henry' },
            { id: '9', name: 'Ivy' }
        ],
        techStack: ['System Design', 'AWS'],
        isActive: true
    }
];

export function LiveStudyRooms() {
    const navigate = useNavigate();

    const getIcon = (topic: string) => {
        if (topic.toLowerCase().includes('code') || topic.toLowerCase().includes('algorithm')) {
            return <Code2 className="h-4 w-4" />;
        }
        if (topic.toLowerCase().includes('design')) {
            return <BookOpen className="h-4 w-4" />;
        }
        return <Video className="h-4 w-4" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Live Study Rooms</h3>
                    <p className="text-sm text-muted-foreground">{mockRooms.length} active sessions</p>
                </div>
            </div>

            {/* Horizontal scroll container */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {mockRooms.map((room, index) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0"
                    >
                        <Card className="w-[280px] p-4 bg-background/60 backdrop-blur-md border-primary/20 hover:border-primary/40 transition-all">
                            <div className="space-y-3">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            {getIcon(room.topic)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm">{room.name}</h4>
                                            <p className="text-xs text-muted-foreground">{room.topic}</p>
                                        </div>
                                    </div>
                                    {room.isActive && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs text-green-500">Live</span>
                                        </div>
                                    )}
                                </div>

                                {/* Participants */}
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {room.participants.slice(0, 3).map((participant) => (
                                            <Avatar key={participant.id} className="h-7 w-7 border-2 border-background">
                                                <AvatarImage src={participant.avatar} />
                                                <AvatarFallback className="text-xs">
                                                    {participant.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {room.participants.length} {room.participants.length === 1 ? 'person' : 'people'}
                                    </span>
                                </div>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-1">
                                    {room.techStack.map((tech) => (
                                        <Badge key={tech} variant="secondary" className="text-xs px-2 py-0">
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Join Button */}
                                <Button size="sm" className="w-full" variant="outline" onClick={() => navigate('/study-rooms')}>
                                    <Users className="h-3 w-3 mr-2" />
                                    Join Room
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
