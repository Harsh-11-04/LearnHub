import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    MoreVertical,
    FileText,
    MessageSquare,
    User as UserIcon,
    ExternalLink
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentModeration() {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');

    const { data: reports, isLoading } = useQuery({
        queryKey: ['adminReports', filterStatus],
        queryFn: () => adminService.getReports(filterStatus)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'resolved' | 'dismissed' }) =>
            adminService.updateReportStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminReports'] });
            toast.success('Report updated');
        },
        onError: () => toast.error('Failed to update report')
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'post': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'comment': return <MessageSquare className="h-4 w-4 text-purple-500" />;
            case 'user': return <UserIcon className="h-4 w-4 text-green-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        }
    };

    return (
        <PageTransition className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            <Shield className="h-8 w-8 text-primary" />
                            Content Moderation
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Review and resolve user reports
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Filter Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {['all', 'pending', 'resolved', 'dismissed'].map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus(status as any)}
                                className="capitalize"
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Reports Table */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Reports ({reports?.length || 0})</CardTitle>
                    <CardDescription>Manage reported content</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No reports found. Good job!
                                        </TableCell>
                                    </TableRow>
                                )}
                                {reports?.map((report: any) => (
                                    <TableRow key={report._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 capitalize">
                                                {getIcon(report.targetType)}
                                                {report.targetType}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{report.reason}</TableCell>
                                        <TableCell>{report.reporter?.name || 'Unknown'}</TableCell>
                                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'}>
                                                {report.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                                {report.status === 'pending' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: report._id, status: 'resolved' })}>
                                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                                Mark as Resolved
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: report._id, status: 'dismissed' })}>
                                                                <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                                                                Dismiss
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </PageTransition>
    );
}
