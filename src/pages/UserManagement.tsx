import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Search,
    MoreVertical,
    Shield,
    Ban,
    CheckCircle,
    Mail,
    Calendar,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

    // Fetch Users
    const { data: userResponse, isLoading } = useQuery({
        queryKey: ['adminUsers', page, searchQuery, filterRole, filterStatus],
        queryFn: () => adminService.getUsers(page, searchQuery, filterRole, filterStatus),
    });

    // Mutations
    const banMutation = useMutation({
        mutationFn: ({ userId, status }: { userId: string, status: 'active' | 'banned' }) =>
            adminService.banUser(userId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success('User status updated');
        },
        onError: () => toast.error('Failed to update user status')
    });

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: 'user' | 'admin' }) =>
            adminService.updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success('User role updated');
        },
        onError: () => toast.error('Failed to update user role')
    });

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
                            <Users className="h-8 w-8 text-primary" />
                            User Management
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Manage registered users and permissions
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1); // Reset to page 1 on search
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterRole === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterRole('all')}
                            >
                                All Roles
                            </Button>
                            <Button
                                variant={filterRole === 'user' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterRole('user')}
                            >
                                Users
                            </Button>
                            <Button
                                variant={filterRole === 'admin' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterRole('admin')}
                            >
                                Admins
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('all')}
                            >
                                All Status
                            </Button>
                            <Button
                                variant={filterStatus === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('active')}
                            >
                                Active
                            </Button>
                            <Button
                                variant={filterStatus === 'banned' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('banned')}
                            >
                                Banned
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Users ({userResponse?.totalUsers || 0})</CardTitle>
                    <CardDescription>Manage user accounts and permissions. Showing page {userResponse?.currentPage} of {userResponse?.totalPages}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userResponse?.users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'banned' ? 'destructive' : 'outline'} className={user.status === 'active' ? 'text-green-500 border-green-500/20 bg-green-500/10' : ''}>
                                                    {user.status === 'active' ? (
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <Ban className="h-3 w-3 mr-1" />
                                                    )}
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => { }}>
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Send Email
                                                        </DropdownMenuItem>
                                                        {user.role === 'user' ? (
                                                            <DropdownMenuItem onClick={() => roleMutation.mutate({ userId: user.id || '', role: 'admin' })}>
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Make Admin
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => roleMutation.mutate({ userId: user.id || '', role: 'user' })}>
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Remove Admin
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {user.status !== 'banned' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => banMutation.mutate({ userId: user.id || '', status: 'banned' })}
                                                                className="text-destructive"
                                                            >
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Ban User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => banMutation.mutate({ userId: user.id || '', status: 'active' })}>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Unban User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {userResponse?.totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(userResponse?.totalPages || 1, p + 1))}
                                    disabled={page === (userResponse?.totalPages || 1)}
                                >
                                    Next <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </PageTransition>
    );
}
