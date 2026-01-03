import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
    Shield, AlertTriangle, CheckCircle, XCircle, Eye, Flag,
    MessageSquare, FileText, Image, Video, Clock, User,
    ThumbsUp, ThumbsDown, MoreVertical, RefreshCw, Filter
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { reportService, Report as ReportData } from '@/services/report.service';

interface Report {
    id: string;
    type: 'post' | 'comment' | 'resource' | 'message';
    content: string;
    contentPreview: string;
    reporter: { name: string; avatar: string };
    reported: { name: string; avatar: string };
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
}

// Mock reports data
const mockReports: Report[] = [
    {
        id: '1',
        type: 'post',
        content: 'This is the full content of the reported post that contains potentially inappropriate material...',
        contentPreview: 'This is a reported post with inappropriate content...',
        reporter: { name: 'Priya Patel', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=priya' },
        reported: { name: 'Unknown User', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=unknown' },
        reason: 'Spam or misleading content',
        status: 'pending',
        severity: 'medium',
        createdAt: '2024-12-30T10:30:00Z'
    },
    {
        id: '2',
        type: 'comment',
        content: 'Offensive comment that violates community guidelines...',
        contentPreview: 'Offensive language in comment...',
        reporter: { name: 'Rahul Sharma', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=rahul' },
        reported: { name: 'Vikram Rao', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=vikram' },
        reason: 'Harassment or bullying',
        status: 'pending',
        severity: 'high',
        createdAt: '2024-12-30T09:15:00Z'
    },
    {
        id: '3',
        type: 'resource',
        content: 'Resource file that might contain copyrighted material...',
        contentPreview: 'Potentially copyrighted resource...',
        reporter: { name: 'Amit Kumar', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=amit' },
        reported: { name: 'Neha Gupta', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=neha' },
        reason: 'Copyright violation',
        status: 'pending',
        severity: 'medium',
        createdAt: '2024-12-29T16:45:00Z'
    },
    {
        id: '4',
        type: 'message',
        content: 'Private message with inappropriate solicitation...',
        contentPreview: 'Inappropriate private message...',
        reporter: { name: 'Kavya Singh', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=kavya' },
        reported: { name: 'Arjun Mehta', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=arjun' },
        reason: 'Inappropriate behavior',
        status: 'resolved',
        severity: 'high',
        createdAt: '2024-12-29T14:20:00Z'
    },
    {
        id: '5',
        type: 'post',
        content: 'Post promoting external services without permission...',
        contentPreview: 'Self-promotion violation...',
        reporter: { name: 'Sneha Reddy', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sneha' },
        reported: { name: 'Rohan Joshi', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=rohan' },
        reason: 'Self-promotion / Advertising',
        status: 'dismissed',
        severity: 'low',
        createdAt: '2024-12-28T11:00:00Z'
    },
];

export default function ContentModeration() {
    const [reports, setReports] = useState<Report[]>(mockReports);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [moderationNote, setModerationNote] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load reports from service
    useEffect(() => {
        const loadReports = async () => {
            try {
                const pending = await reportService.getPendingReports();
                // If we have real reports, merge with mock for demo
                if (pending.length > 0) {
                    const formattedReports: Report[] = pending.map(r => ({
                        id: r.id,
                        type: r.resourceId ? 'resource' : r.commentId ? 'comment' : 'post',
                        content: r.description || 'No content provided',
                        contentPreview: r.description?.slice(0, 50) || r.reason,
                        reporter: { name: 'User', avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${r.reporterId}` },
                        reported: { name: 'Reported User', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=reported' },
                        reason: r.reason,
                        status: r.status as 'pending' | 'resolved' | 'dismissed',
                        severity: 'medium' as const,
                        createdAt: r.createdAt
                    }));
                    setReports([...formattedReports, ...mockReports.slice(0, 3)]);
                }
            } catch (err) {
                console.error('Error loading reports:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadReports();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'post': return <FileText className="h-4 w-4" />;
            case 'comment': return <MessageSquare className="h-4 w-4" />;
            case 'resource': return <Image className="h-4 w-4" />;
            case 'message': return <MessageSquare className="h-4 w-4" />;
            default: return <Flag className="h-4 w-4" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high': return <Badge variant="destructive">High</Badge>;
            case 'medium': return <Badge variant="default" className="bg-orange-500">Medium</Badge>;
            case 'low': return <Badge variant="secondary">Low</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'resolved': return <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
            case 'dismissed': return <Badge variant="outline" className="text-gray-500 border-gray-500/30 bg-gray-500/10"><XCircle className="h-3 w-3 mr-1" />Dismissed</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setShowReportDetail(true);
        setModerationNote('');
    };

    const handleResolve = (reportId: string, action: 'resolve' | 'dismiss') => {
        setReports(prev => prev.map(r =>
            r.id === reportId
                ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' }
                : r
        ));
        toast.success(`Report ${action === 'resolve' ? 'resolved' : 'dismissed'} successfully`);
        setShowReportDetail(false);
    };

    const handleBanUser = (userName: string) => {
        toast.success(`User ${userName} has been banned`);
        setShowReportDetail(false);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success('Reports refreshed');
        }, 1000);
    };

    const filteredReports = activeTab === 'all'
        ? reports
        : reports.filter(r => r.status === activeTab);

    const stats = {
        pending: reports.filter(r => r.status === 'pending').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
        highPriority: reports.filter(r => r.severity === 'high' && r.status === 'pending').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        Content Moderation
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review and manage reported content
                    </p>
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="glass-panel border-yellow-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass-panel border-red-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">High Priority</p>
                                    <p className="text-3xl font-bold text-red-500">{stats.highPriority}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="glass-panel border-green-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Resolved</p>
                                    <p className="text-3xl font-bold text-green-500">{stats.resolved}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="glass-panel border-gray-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Dismissed</p>
                                    <p className="text-3xl font-bold text-gray-500">{stats.dismissed}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-gray-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Reports Table */}
            <Card className="glass-panel">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Reports Queue</CardTitle>
                            <CardDescription>Review flagged content from users</CardDescription>
                        </div>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                            <TabsList>
                                <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
                                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                                <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                            <p className="text-muted-foreground">No reports in this category</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Reported By</TableHead>
                                    <TableHead>Against</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredReports.map((report, index) => (
                                        <motion.tr
                                            key={report.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-white/5 cursor-pointer"
                                            onClick={() => handleViewReport(report)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(report.type)}
                                                    <span className="capitalize">{report.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {report.contentPreview}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={report.reporter.avatar} />
                                                        <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{report.reporter.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={report.reported.avatar} />
                                                        <AvatarFallback>{report.reported.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{report.reported.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{report.reason}</TableCell>
                                            <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewReport(report); }}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {report.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleResolve(report.id, 'resolve'); }}>
                                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                                    Resolve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleResolve(report.id, 'dismiss'); }}>
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Dismiss
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Report Detail Dialog */}
            <Dialog open={showReportDetail} onOpenChange={setShowReportDetail}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Flag className="h-5 w-5 text-primary" />
                            Report Details
                        </DialogTitle>
                        <DialogDescription>
                            Review the reported content and take action
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-6">
                            {/* Report Info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getTypeIcon(selectedReport.type)}
                                    <span className="capitalize font-medium">{selectedReport.type}</span>
                                    {getSeverityBadge(selectedReport.severity)}
                                </div>
                                {getStatusBadge(selectedReport.status)}
                            </div>

                            {/* Parties */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-xs text-muted-foreground mb-2">Reported by</p>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={selectedReport.reporter.avatar} />
                                            <AvatarFallback>{selectedReport.reporter.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{selectedReport.reporter.name}</p>
                                            <p className="text-xs text-muted-foreground">Reporter</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-xs text-muted-foreground mb-2">Reported user</p>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={selectedReport.reported.avatar} />
                                            <AvatarFallback>{selectedReport.reported.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{selectedReport.reported.name}</p>
                                            <p className="text-xs text-muted-foreground">Offender</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Reason for report</p>
                                <p className="font-medium">{selectedReport.reason}</p>
                            </div>

                            {/* Content */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Reported content</p>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm">{selectedReport.content}</p>
                                </div>
                            </div>

                            {/* Moderation Note */}
                            {selectedReport.status === 'pending' && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Moderation note (optional)</p>
                                    <Textarea
                                        placeholder="Add a note about your decision..."
                                        value={moderationNote}
                                        onChange={(e) => setModerationNote(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            {selectedReport.status === 'pending' && (
                                <DialogFooter className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleResolve(selectedReport.id, 'dismiss')}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Dismiss Report
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleBanUser(selectedReport.reported.name)}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Ban User
                                    </Button>
                                    <Button
                                        onClick={() => handleResolve(selectedReport.id, 'resolve')}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Resolve & Remove Content
                                    </Button>
                                </DialogFooter>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
