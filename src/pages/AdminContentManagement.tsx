import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    FileText, Search, Plus, Edit, Trash2, Eye, CheckCircle,
    XCircle, Clock, BookOpen, Video, Code2, ArrowLeft, X, Save
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ContentItem {
    id: string;
    type: 'resource' | 'quiz' | 'assignment' | 'post';
    title: string;
    description: string;
    author: { name: string; avatar: string };
    status: 'published' | 'draft' | 'pending' | 'archived';
    createdAt: string;
    views: number;
    likes: number;
}

const mockContent: ContentItem[] = [
    {
        id: '1', type: 'resource', title: 'Advanced React Patterns',
        description: 'A comprehensive guide to React patterns including compound components, render props, and hooks.',
        author: { name: 'Alice Chen', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice' },
        status: 'published', createdAt: '2024-01-15', views: 1250, likes: 89
    },
    {
        id: '2', type: 'quiz', title: 'JavaScript Fundamentals Quiz',
        description: 'Test your knowledge of JavaScript basics including variables, functions, and DOM manipulation.',
        author: { name: 'Bob Kumar', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob' },
        status: 'published', createdAt: '2024-01-12', views: 890, likes: 56
    },
    {
        id: '3', type: 'assignment', title: 'Build a Todo App',
        description: 'Create a fully functional todo application using React and local storage.',
        author: { name: 'Charlie Lee', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Charlie' },
        status: 'pending', createdAt: '2024-01-10', views: 0, likes: 0
    },
    {
        id: '4', type: 'post', title: 'My Journey Learning TypeScript',
        description: 'Sharing my experience transitioning from JavaScript to TypeScript in production.',
        author: { name: 'Diana Smith', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Diana' },
        status: 'draft', createdAt: '2024-01-08', views: 0, likes: 0
    },
];

const AdminContentManagement = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState<ContentItem[]>(mockContent);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'resource' | 'quiz' | 'assignment' | 'post'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending' | 'archived'>('all');
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newContent, setNewContent] = useState({
        type: 'resource' as ContentItem['type'],
        title: '',
        description: '',
        status: 'draft' as ContentItem['status']
    });

    const filteredContent = content.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'resource': return <BookOpen className="h-4 w-4 text-blue-500" />;
            case 'quiz': return <FileText className="h-4 w-4 text-yellow-500" />;
            case 'assignment': return <Code2 className="h-4 w-4 text-purple-500" />;
            case 'post': return <Video className="h-4 w-4 text-pink-500" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return <Badge className="bg-green-500">Published</Badge>;
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'pending': return <Badge className="bg-yellow-500">Pending Review</Badge>;
            case 'archived': return <Badge variant="outline">Archived</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const updateStatus = (id: string, newStatus: ContentItem['status']) => {
        setContent(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
        toast.success(`Content ${newStatus === 'published' ? 'published' : 'updated'}`);
    };

    const deleteContent = (id: string) => {
        setContent(prev => prev.filter(item => item.id !== id));
        toast.success('Content deleted');
    };

    const createContent = () => {
        if (!newContent.title || !newContent.description) {
            toast.error('Please fill in all fields');
            return;
        }

        const item: ContentItem = {
            id: `new-${Date.now()}`,
            ...newContent,
            author: { name: 'Admin', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Admin' },
            createdAt: new Date().toISOString().split('T')[0],
            views: 0,
            likes: 0
        };

        setContent([item, ...content]);
        setShowCreateModal(false);
        setNewContent({ type: 'resource', title: '', description: '', status: 'draft' });
        toast.success('Content created');
    };

    const saveEdit = () => {
        if (!editingItem) return;
        setContent(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
        setEditingItem(null);
        toast.success('Changes saved');
    };

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-500" />
                        Content Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Create, edit, and manage all platform content</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowCreateModal(true)} className="bg-green-500 hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2" /> Create Content
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search content..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'resource', 'quiz', 'assignment', 'post'] as const).map(t => (
                            <Button
                                key={t}
                                size="sm"
                                variant={typeFilter === t ? 'default' : 'outline'}
                                onClick={() => setTypeFilter(t)}
                                className="capitalize"
                            >
                                {t === 'all' ? 'All Types' : t}
                            </Button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'published', 'draft', 'pending'] as const).map(s => (
                            <Button
                                key={s}
                                size="sm"
                                variant={statusFilter === s ? 'default' : 'outline'}
                                onClick={() => setStatusFilter(s)}
                                className="capitalize"
                            >
                                {s === 'all' ? 'All Status' : s}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Content Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium">Content</th>
                                <th className="text-left p-4 font-medium">Type</th>
                                <th className="text-left p-4 font-medium">Author</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-left p-4 font-medium">Stats</th>
                                <th className="text-right p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredContent.map((item, index) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-muted/30"
                                >
                                    <td className="p-4">
                                        <div className="max-w-xs">
                                            <p className="font-medium truncate">{item.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(item.type)}
                                            <span className="capitalize text-sm">{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={item.author.avatar} />
                                                <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{item.author.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(item.status)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" /> {item.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ❤️ {item.likes}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 justify-end">
                                            {item.status === 'pending' && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, 'published')}>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </Button>
                                            )}
                                            {item.status === 'draft' && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, 'published')}>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" onClick={() => setEditingItem(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => deleteContent(item.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredContent.length === 0 && (
                    <div className="p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No content found</p>
                    </div>
                )}
            </Card>

            {/* Create Modal */}
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
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <Card className="p-6 w-full max-w-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Create New Content</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        {(['resource', 'quiz', 'assignment', 'post'] as const).map(t => (
                                            <Button
                                                key={t}
                                                size="sm"
                                                variant={newContent.type === t ? 'default' : 'outline'}
                                                onClick={() => setNewContent({ ...newContent, type: t })}
                                                className="capitalize flex-1"
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="Title"
                                        value={newContent.title}
                                        onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                                    />
                                    <Textarea
                                        placeholder="Description"
                                        value={newContent.description}
                                        onChange={e => setNewContent({ ...newContent, description: e.target.value })}
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => {
                                            setNewContent({ ...newContent, status: 'draft' });
                                            createContent();
                                        }}>
                                            Save as Draft
                                        </Button>
                                        <Button className="flex-1 bg-green-500" onClick={() => {
                                            setNewContent({ ...newContent, status: 'published' });
                                            createContent();
                                        }}>
                                            Publish
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setEditingItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <Card className="p-6 w-full max-w-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Edit Content</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Title"
                                        value={editingItem.title}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                    />
                                    <Textarea
                                        placeholder="Description"
                                        value={editingItem.description}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        {(['draft', 'pending', 'published', 'archived'] as const).map(s => (
                                            <Button
                                                key={s}
                                                size="sm"
                                                variant={editingItem.status === s ? 'default' : 'outline'}
                                                onClick={() => setEditingItem({ ...editingItem, status: s })}
                                                className="capitalize flex-1"
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button className="w-full" onClick={saveEdit}>
                                        <Save className="h-4 w-4 mr-2" /> Save Changes
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

export default AdminContentManagement;
