import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    HelpCircle, Clock, MessageCircle, CheckCircle,
    ThumbsUp, Plus, X, Send, AlertCircle
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

interface Doubt {
    id: string;
    title: string;
    description: string;
    subject: string;
    author: {
        name: string;
        avatar: string;
    };
    priority: 'high' | 'medium' | 'low';
    status: 'open' | 'answered' | 'resolved';
    answers: number;
    createdAt: string;
}

const mockDoubts: Doubt[] = [
    {
        id: '1',
        title: 'Graph traversal optimization',
        description: 'How can I optimize DFS for a very large graph with millions of nodes?',
        subject: 'Data Structures',
        author: { name: 'You', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me' },
        priority: 'high',
        status: 'open',
        answers: 2,
        createdAt: 'Today'
    },
    {
        id: '2',
        title: 'React useEffect cleanup',
        description: 'When exactly does the cleanup function in useEffect run?',
        subject: 'React',
        author: { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice' },
        priority: 'medium',
        status: 'answered',
        answers: 5,
        createdAt: '1 day ago'
    },
    {
        id: '3',
        title: 'SQL JOIN optimization',
        description: 'Which is more efficient: LEFT JOIN or subquery?',
        subject: 'Database',
        author: { name: 'Bob', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob' },
        priority: 'low',
        status: 'resolved',
        answers: 8,
        createdAt: '3 days ago'
    }
];

const Doubts = () => {
    const [doubts, setDoubts] = useState<Doubt[]>(mockDoubts);
    const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'resolved'>('all');
    const [showForm, setShowForm] = useState(false);
    const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
    const [newAnswer, setNewAnswer] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        subject: ''
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return '';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-orange-500/10 text-orange-500';
            case 'answered': return 'bg-blue-500/10 text-blue-500';
            case 'resolved': return 'bg-green-500/10 text-green-500';
            default: return '';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertCircle className="h-4 w-4" />;
            case 'answered': return <MessageCircle className="h-4 w-4" />;
            case 'resolved': return <CheckCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const filteredDoubts = filter === 'all'
        ? doubts
        : doubts.filter(d => d.status === filter);

    const handleSubmit = () => {
        if (!form.title || !form.description) {
            toast.error('Please fill all required fields');
            return;
        }

        const newDoubt: Doubt = {
            id: `new-${Date.now()}`,
            ...form,
            author: { name: 'You', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me' },
            priority: 'medium',
            status: 'open',
            answers: 0,
            createdAt: 'Just now'
        };

        setDoubts([newDoubt, ...doubts]);
        setForm({ title: '', description: '', subject: '' });
        setShowForm(false);
        toast.success('Doubt posted!');
    };

    const addAnswer = () => {
        if (!newAnswer.trim() || !selectedDoubt) return;

        setDoubts(prev => prev.map(d =>
            d.id === selectedDoubt.id
                ? { ...d, answers: d.answers + 1, status: 'answered' as const }
                : d
        ));
        setNewAnswer('');
        toast.success('Answer posted!');
    };

    const markResolved = (id: string) => {
        setDoubts(prev => prev.map(d =>
            d.id === id ? { ...d, status: 'resolved' as const } : d
        ));
        setSelectedDoubt(null);
        toast.success('Marked as resolved!');
    };

    // Doubt detail view
    if (selectedDoubt) {
        return (
            <PageTransition className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
                <Button variant="ghost" onClick={() => setSelectedDoubt(null)}>
                    ← Back to doubts
                </Button>

                <Card className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <Avatar>
                            <AvatarImage src={selectedDoubt.author.avatar} />
                            <AvatarFallback>{selectedDoubt.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold">{selectedDoubt.title}</h2>
                                <Badge className={getStatusColor(selectedDoubt.status)}>
                                    {getStatusIcon(selectedDoubt.status)}
                                    <span className="ml-1">{selectedDoubt.status}</span>
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{selectedDoubt.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{selectedDoubt.author.name}</span>
                                <span>•</span>
                                <span>{selectedDoubt.subject}</span>
                                <span>•</span>
                                <span>{selectedDoubt.createdAt}</span>
                            </div>
                        </div>
                    </div>

                    {selectedDoubt.status !== 'resolved' && (
                        <Button
                            onClick={() => markResolved(selectedDoubt.id)}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Resolved
                        </Button>
                    )}
                </Card>

                {/* Answers Section */}
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">
                        <MessageCircle className="h-5 w-5 inline mr-2" />
                        {selectedDoubt.answers} Answers
                    </h3>

                    <div className="space-y-4 mb-6">
                        {/* Mock answers */}
                        <div className="flex gap-3 p-4 rounded-lg bg-secondary/30">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=expert" />
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">Expert User</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You can use iterative DFS with an explicit stack to avoid recursion overhead.
                                    Also consider using adjacency lists and marking visited nodes in a hash set.
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Button variant="ghost" size="sm" className="h-6 px-2">
                                        <ThumbsUp className="h-3 w-3 mr-1" /> 5
                                    </Button>
                                    <span>2 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Answer */}
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Write your answer..."
                            value={newAnswer}
                            onChange={e => setNewAnswer(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={addAnswer} className="self-end">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <HelpCircle className="h-8 w-8 text-blue-500" />
                        Doubts
                    </h1>
                    <p className="text-muted-foreground mt-1">Ask questions and get help from peers</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Ask a Doubt
                </Button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="p-6 border-t-4 border-t-blue-500">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Ask a New Doubt</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    placeholder="What's your question? *"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                                <Input
                                    placeholder="Subject/Topic"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Describe your doubt in detail... *"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <Button onClick={handleSubmit} className="mt-4 bg-blue-500 hover:bg-blue-600">
                                Post Doubt
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'open', 'answered', 'resolved'].map(f => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f as any)}
                        className="capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {/* Doubts List */}
            <div className="space-y-4">
                {filteredDoubts.length === 0 ? (
                    <Card className="p-12 text-center">
                        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No doubts found</p>
                    </Card>
                ) : (
                    filteredDoubts.map((doubt, index) => (
                        <motion.div
                            key={doubt.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedDoubt(doubt)}
                            className="cursor-pointer"
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow bg-background/60 backdrop-blur-sm hover:border-blue-500/30">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={doubt.author.avatar} />
                                        <AvatarFallback>{doubt.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg hover:text-blue-500 transition-colors">
                                                {doubt.title}
                                            </h3>
                                            <Badge className={getPriorityColor(doubt.priority)}>
                                                {doubt.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {doubt.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{doubt.author.name}</span>
                                            <span>•</span>
                                            <span>{doubt.subject}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {doubt.createdAt}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="h-3 w-3" />
                                                {doubt.answers} answers
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(doubt.status)}>
                                        {getStatusIcon(doubt.status)}
                                        <span className="ml-1">{doubt.status}</span>
                                    </Badge>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </PageTransition>
    );
};

export default Doubts;
