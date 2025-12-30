import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Video, Users, Plus, Search, Code2, BookOpen,
    Mic, MicOff, VideoOff, PhoneOff, X, MessageCircle
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

interface StudyRoom {
    id: string;
    name: string;
    topic: string;
    host: { id: string; name: string; avatar: string };
    participants: { id: string; name: string; avatar: string }[];
    techStack: string[];
    maxParticipants: number;
    isActive: boolean;
    category: 'coding' | 'design' | 'study' | 'discussion';
}

const mockRooms: StudyRoom[] = [
    {
        id: '1',
        name: 'React Deep Dive',
        topic: 'Hooks & Performance',
        host: { id: '1', name: 'Alice Chen', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice' },
        participants: [
            { id: '2', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob' },
            { id: '3', name: 'Charlie', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Charlie' }
        ],
        techStack: ['React', 'TypeScript'],
        maxParticipants: 10,
        isActive: true,
        category: 'coding'
    },
    {
        id: '2',
        name: 'DSA Practice',
        topic: 'Graph Algorithms',
        host: { id: '4', name: 'David', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=David' },
        participants: [
            { id: '5', name: 'Eve', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Eve' }
        ],
        techStack: ['Python', 'Algorithms'],
        maxParticipants: 8,
        isActive: true,
        category: 'coding'
    },
    {
        id: '3',
        name: 'System Design',
        topic: 'Microservices Architecture',
        host: { id: '6', name: 'Frank', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Frank' },
        participants: [
            { id: '7', name: 'Grace', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Grace' },
            { id: '8', name: 'Henry', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Henry' },
            { id: '9', name: 'Ivy', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ivy' }
        ],
        techStack: ['System Design', 'AWS'],
        maxParticipants: 6,
        isActive: true,
        category: 'design'
    },
    {
        id: '4',
        name: 'Physics Study Group',
        topic: 'Quantum Mechanics',
        host: { id: '10', name: 'Jack', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Jack' },
        participants: [],
        techStack: ['Physics', 'Math'],
        maxParticipants: 5,
        isActive: true,
        category: 'study'
    }
];

const StudyRoomsPage = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<StudyRoom[]>(mockRooms);
    const [filter, setFilter] = useState<'all' | 'coding' | 'design' | 'study' | 'discussion'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const [newRoom, setNewRoom] = useState({
        name: '',
        topic: '',
        category: 'coding' as 'coding' | 'design' | 'study' | 'discussion',
        maxParticipants: 10
    });

    const filteredRooms = rooms.filter(room => {
        const matchesFilter = filter === 'all' || room.category === filter;
        const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.topic.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'coding': return <Code2 className="h-4 w-4" />;
            case 'design': return <BookOpen className="h-4 w-4" />;
            case 'study': return <BookOpen className="h-4 w-4" />;
            default: return <MessageCircle className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'coding': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
            case 'design': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
            case 'study': return 'bg-green-500/10 text-green-500 border-green-500/30';
            default: return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
        }
    };

    const createRoom = () => {
        if (!newRoom.name || !newRoom.topic) {
            toast.error('Please fill in all fields');
            return;
        }

        const room: StudyRoom = {
            id: `new-${Date.now()}`,
            name: newRoom.name,
            topic: newRoom.topic,
            host: { id: 'me', name: 'You', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me' },
            participants: [],
            techStack: [],
            maxParticipants: newRoom.maxParticipants,
            isActive: true,
            category: newRoom.category
        };

        setRooms([room, ...rooms]);
        setShowCreateModal(false);
        setNewRoom({ name: '', topic: '', category: 'coding', maxParticipants: 10 });
        setActiveRoom(room);
        toast.success('Room created! You are now the host.');
    };

    const joinRoom = (room: StudyRoom) => {
        if (room.participants.length >= room.maxParticipants) {
            toast.error('Room is full');
            return;
        }
        setActiveRoom(room);
        toast.success(`Joined ${room.name}`);
    };

    const leaveRoom = () => {
        setActiveRoom(null);
        setIsMuted(false);
        setIsVideoOff(false);
        toast.info('Left the room');
    };

    // Active Room View
    if (activeRoom) {
        return (
            <PageTransition className="h-[calc(100vh-80px)] flex flex-col">
                {/* Room Header */}
                <div className="p-4 border-b flex items-center justify-between bg-background/80 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-bold">{activeRoom.name}</h2>
                        <p className="text-sm text-muted-foreground">{activeRoom.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {activeRoom.participants.length + 1}/{activeRoom.maxParticipants}
                        </Badge>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-green-500">Live</span>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-black/90">
                    {/* Host */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl overflow-hidden aspect-video flex items-center justify-center"
                    >
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={activeRoom.host.avatar} />
                            <AvatarFallback>{activeRoom.host.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white flex items-center gap-1">
                            {activeRoom.host.name}
                            <Badge className="ml-1 text-xs">Host</Badge>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Mic className="h-4 w-4 text-white" />
                        </div>
                    </motion.div>

                    {/* Participants */}
                    {activeRoom.participants.map((participant, index) => (
                        <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center"
                        >
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={participant.avatar} />
                                <AvatarFallback>{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
                                {participant.name}
                            </div>
                        </motion.div>
                    ))}

                    {/* Your Video */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-green-500"
                    >
                        {isVideoOff ? (
                            <Avatar className="h-16 w-16">
                                <AvatarImage src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me" />
                                <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="text-white text-sm">📹 Camera Active</div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
                            You
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                            {isMuted ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-white" />}
                        </div>
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="p-4 flex items-center justify-center gap-4 bg-background/80 backdrop-blur-sm border-t">
                    <Button
                        variant={isMuted ? 'destructive' : 'secondary'}
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                    <Button
                        variant={isVideoOff ? 'destructive' : 'secondary'}
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                    >
                        {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    </Button>
                    <Button
                        variant="destructive"
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={leaveRoom}
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Video className="h-8 w-8 text-purple-500" />
                        Live Study Rooms
                    </h1>
                    <p className="text-muted-foreground mt-1">{rooms.filter(r => r.isActive).length} active rooms</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'coding', 'design', 'study', 'discussion'] as const).map(f => (
                            <Button
                                key={f}
                                size="sm"
                                variant={filter === f ? 'default' : 'outline'}
                                onClick={() => setFilter(f)}
                                className="capitalize"
                            >
                                {f === 'all' ? 'All Rooms' : f}
                            </Button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search rooms..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64"
                        />
                    </div>
                </div>
            </Card>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((room, index) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className={`p-5 h-full flex flex-col ${getCategoryColor(room.category)} hover:shadow-lg transition-all`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-background">
                                        {getCategoryIcon(room.category)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{room.name}</h3>
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

                            <div className="flex items-center gap-2 mb-3">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={room.host.avatar} />
                                    <AvatarFallback>{room.host.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">Hosted by {room.host.name}</span>
                            </div>

                            <div className="flex -space-x-2 mb-3">
                                {room.participants.slice(0, 4).map(p => (
                                    <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={p.avatar} />
                                        <AvatarFallback>{p.name[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {room.participants.length > 4 && (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                        +{room.participants.length - 4}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4">
                                {room.techStack.map(tech => (
                                    <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                                ))}
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 inline mr-1" />
                                    {room.participants.length + 1}/{room.maxParticipants}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => joinRoom(room)}
                                    disabled={room.participants.length >= room.maxParticipants}
                                >
                                    Join Room
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <Card className="p-12 text-center">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No rooms found. Create one!</p>
                </Card>
            )}

            {/* Create Room Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <Card className="p-6 w-full max-w-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Create Study Room</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Room Name"
                                        value={newRoom.name}
                                        onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Topic"
                                        value={newRoom.topic}
                                        onChange={e => setNewRoom({ ...newRoom, topic: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        {(['coding', 'design', 'study', 'discussion'] as const).map(cat => (
                                            <Button
                                                key={cat}
                                                size="sm"
                                                variant={newRoom.category === cat ? 'default' : 'outline'}
                                                onClick={() => setNewRoom({ ...newRoom, category: cat })}
                                                className="capitalize flex-1"
                                            >
                                                {cat}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button onClick={createRoom} className="w-full bg-purple-500 hover:bg-purple-600">
                                        <Video className="h-4 w-4 mr-2" />
                                        Create & Start Room
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
};

export default StudyRoomsPage;
