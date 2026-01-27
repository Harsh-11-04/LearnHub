import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    FileText, Clock, CheckCircle, AlertCircle, Plus,
    Calendar, Upload, X, ChevronRight
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

interface Assignment {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'submitted' | 'graded';
    description: string;
    grade?: string;
}

const mockAssignments: Assignment[] = [
    {
        id: '1',
        title: 'Data Structures Assignment 3',
        subject: 'Computer Science',
        dueDate: '2024-12-28',
        priority: 'high',
        status: 'pending',
        description: 'Implement AVL tree with self-balancing rotations'
    },
    {
        id: '2',
        title: 'Web Dev Project Submission',
        subject: 'Web Development',
        dueDate: '2024-12-30',
        priority: 'medium',
        status: 'pending',
        description: 'Build a full-stack MERN application with authentication'
    },
    {
        id: '3',
        title: 'Database Design ER Diagram',
        subject: 'Database Management',
        dueDate: '2024-12-25',
        priority: 'low',
        status: 'submitted',
        description: 'Create ER diagram for e-commerce system'
    },
    {
        id: '4',
        title: 'Algorithm Analysis Report',
        subject: 'Algorithms',
        dueDate: '2024-12-20',
        priority: 'high',
        status: 'graded',
        description: 'Compare time complexity of sorting algorithms',
        grade: 'A+'
    }
];

const Assignments = () => {
    const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

    const [form, setForm] = useState({
        title: '',
        subject: '',
        dueDate: '',
        description: ''
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
            case 'pending': return 'bg-orange-500/10 text-orange-500';
            case 'submitted': return 'bg-blue-500/10 text-blue-500';
            case 'graded': return 'bg-green-500/10 text-green-500';
            default: return '';
        }
    };

    const filteredAssignments = filter === 'all'
        ? assignments
        : assignments.filter(a => a.status === filter);

    const handleSubmit = () => {
        if (!form.title || !form.subject || !form.dueDate) {
            toast.error('Please fill all required fields');
            return;
        }

        const newAssignment: Assignment = {
            id: `new-${Date.now()}`,
            ...form,
            priority: 'medium',
            status: 'pending'
        };

        setAssignments([newAssignment, ...assignments]);
        setForm({ title: '', subject: '', dueDate: '', description: '' });
        setShowForm(false);
        toast.success('Assignment added!');
    };

    const markSubmitted = (id: string) => {
        setAssignments(prev => prev.map(a =>
            a.id === id ? { ...a, status: 'submitted' as const } : a
        ));
        toast.success('Assignment marked as submitted!');
    };

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        Assignments
                    </h1>
                    <p className="text-muted-foreground mt-1">Track and manage your assignments</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-red-500 hover:bg-red-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
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
                        <Card className="p-6 border-t-4 border-t-red-500">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">New Assignment</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Assignment Title *"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                                <Input
                                    placeholder="Subject *"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                                <Input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Description"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="md:col-span-2"
                                />
                            </div>
                            <Button onClick={handleSubmit} className="mt-4 bg-red-500 hover:bg-red-600">
                                Add Assignment
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'submitted', 'graded'].map(f => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f as 'all' | 'pending' | 'submitted' | 'graded')}
                        className="capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {/* Assignment List */}
            <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No assignments found</p>
                    </Card>
                ) : (
                    filteredAssignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow bg-background/60 backdrop-blur-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{assignment.title}</h3>
                                            <Badge className={getPriorityColor(assignment.priority)}>
                                                {assignment.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-4 w-4" />
                                                {assignment.subject}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Due: {assignment.dueDate}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={getStatusColor(assignment.status)}>
                                            {assignment.status === 'graded' ? `Graded: ${assignment.grade}` : assignment.status}
                                        </Badge>
                                        {assignment.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                onClick={() => markSubmitted(assignment.id)}
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Submit
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </PageTransition>
    );
};

export default Assignments;
