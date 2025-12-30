import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    ArrowRight,
    RefreshCw,
    UserX,
    Eye,
    Trash2,
    ExternalLink,
    Github,
    Linkedin,
    AlertTriangle,
    X,
    UserMinus,
    UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupabaseService, AdminUser } from '@/services/admin.supabase.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

    // Multi-select state for bulk actions
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // Fetch Users from Supabase
    const { data: userResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['adminUsers', page, searchQuery, filterRole, filterStatus],
        queryFn: () => adminSupabaseService.getUsers(page, searchQuery, filterRole, filterStatus),
        enabled: isSupabaseConfigured,
        staleTime: 30000, // 30 seconds
    });

    // Fetch user activity when viewing details
    const { data: userActivity } = useQuery({
        queryKey: ['userActivity', selectedUser?.id],
        queryFn: () => selectedUser ? adminSupabaseService.getUserActivity(selectedUser.id) : null,
        enabled: !!selectedUser && showUserDetails,
    });

    // Mutations
    const banMutation = useMutation({
        mutationFn: ({ userId, status }: { userId: string, status: 'active' | 'banned' }) =>
            adminSupabaseService.updateUserStatus(userId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success(`User ${variables.status === 'banned' ? 'banned' : 'unbanned'} successfully`);
        },
        onError: (error: any) => toast.error(`Failed to update user status: ${error.message}`)
    });

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: 'user' | 'admin' }) =>
            adminSupabaseService.updateUserRole(userId, role),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success(`User ${variables.role === 'admin' ? 'promoted to admin' : 'demoted to user'}`);
        },
        onError: (error: any) => toast.error(`Failed to update user role: ${error.message}`)
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => adminSupabaseService.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success('User deleted successfully');
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        },
        onError: (error: any) => toast.error(`Failed to delete user: ${error.message}`)
    });

    // ============================================
    // Bulk Action Mutations
    // ============================================

    const batchBanMutation = useMutation({
        mutationFn: ({ userIds, status }: { userIds: string[], status: 'active' | 'banned' }) =>
            adminSupabaseService.batchUpdateStatus(userIds, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success(`${variables.userIds.length} users ${variables.status === 'banned' ? 'banned' : 'unbanned'} successfully`);
            setSelectedUsers(new Set());
        },
        onError: (error: any) => toast.error(`Bulk action failed: ${error.message}`)
    });

    const batchRoleMutation = useMutation({
        mutationFn: ({ userIds, role }: { userIds: string[], role: 'user' | 'admin' }) =>
            adminSupabaseService.batchUpdateRole(userIds, role),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success(`${variables.userIds.length} users ${variables.role === 'admin' ? 'promoted to admin' : 'demoted to user'}`);
            setSelectedUsers(new Set());
        },
        onError: (error: any) => toast.error(`Bulk action failed: ${error.message}`)
    });

    const batchDeleteMutation = useMutation({
        mutationFn: (userIds: string[]) => adminSupabaseService.batchDeleteUsers(userIds),
        onSuccess: (_, userIds) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success(`${userIds.length} users deleted successfully`);
            setSelectedUsers(new Set());
            setShowBulkDeleteConfirm(false);
        },
        onError: (error: any) => toast.error(`Bulk delete failed: ${error.message}`)
    });

    // ============================================
    // Selection Handlers
    // ============================================

    const toggleUserSelection = useCallback((userId: string, index: number, shiftKey: boolean) => {
        if (shiftKey && lastClickedIndex !== null && userResponse?.users) {
            // Shift+click: select range
            const start = Math.min(lastClickedIndex, index);
            const end = Math.max(lastClickedIndex, index);
            const newSelection = new Set(selectedUsers);
            for (let i = start; i <= end; i++) {
                newSelection.add(userResponse.users[i].id);
            }
            setSelectedUsers(newSelection);
        } else {
            // Regular click: toggle single
            const newSelection = new Set(selectedUsers);
            if (newSelection.has(userId)) {
                newSelection.delete(userId);
            } else {
                newSelection.add(userId);
            }
            setSelectedUsers(newSelection);
            setLastClickedIndex(index);
        }
    }, [selectedUsers, lastClickedIndex, userResponse?.users]);

    const selectAll = useCallback(() => {
        if (userResponse?.users) {
            const allIds = userResponse.users.map(u => u.id);
            if (selectedUsers.size === allIds.length) {
                setSelectedUsers(new Set());
            } else {
                setSelectedUsers(new Set(allIds));
            }
        }
    }, [userResponse?.users, selectedUsers.size]);

    const clearSelection = useCallback(() => {
        setSelectedUsers(new Set());
        setLastClickedIndex(null);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+A to select all
            if (e.ctrlKey && e.key === 'a' && !e.target?.toString().includes('Input')) {
                e.preventDefault();
                selectAll();
            }
            // Escape to clear selection
            if (e.key === 'Escape') {
                clearSelection();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectAll, clearSelection]);

    // View user details
    const handleViewUser = (user: AdminUser) => {
        setSelectedUser(user);
        setShowUserDetails(true);
    };

    // Confirm delete
    const handleDeleteClick = (user: AdminUser) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };


    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="glass-panel">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Supabase Not Configured</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            To use admin features with real data, please configure your Supabase credentials
                            in the <code className="bg-muted px-2 py-1 rounded">.env.local</code> file.
                        </p>
                        <div className="mt-6 text-sm text-muted-foreground">
                            <p>Required variables:</p>
                            <code className="block bg-muted p-4 rounded mt-2">
                                VITE_SUPABASE_URL=your_url<br />
                                VITE_SUPABASE_ANON_KEY=your_key
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary" />
                            User Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage registered users and permissions • Connected to Supabase
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-panel">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                <p className="text-2xl font-bold">{userResponse?.totalUsers || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-panel">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {userResponse?.users.filter(u => u.status === 'active').length || 0}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-panel">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Banned</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {userResponse?.users.filter(u => u.status === 'banned').length || 0}
                                </p>
                            </div>
                            <Ban className="h-8 w-8 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-panel">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Admins</p>
                                <p className="text-2xl font-bold text-purple-500">
                                    {userResponse?.users.filter(u => u.role === 'admin').length || 0}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="glass-panel">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Search & Filter</CardTitle>
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
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'user', 'admin'] as const).map((role) => (
                                <Button
                                    key={role}
                                    variant={filterRole === role ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setFilterRole(role); setPage(1); }}
                                >
                                    {role === 'all' ? 'All Roles' : role === 'admin' ? 'Admins' : 'Users'}
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'active', 'banned'] as const).map((status) => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setFilterStatus(status); setPage(1); }}
                                    className={status === 'banned' && filterStatus === status ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="glass-panel border-red-500/50">
                    <CardContent className="flex items-center gap-4 py-6">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="font-medium text-red-500">Error loading users</p>
                            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Actions Toolbar - Appears when users are selected */}
            <AnimatePresence>
                {selectedUsers.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                    >
                        <Card className="glass-panel border-primary/50 shadow-2xl">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-primary">
                                            {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <div className="h-6 w-px bg-border" />
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-orange-500 border-orange-500/50 hover:bg-orange-500/10"
                                            onClick={() => batchBanMutation.mutate({ userIds: Array.from(selectedUsers), status: 'banned' })}
                                            disabled={batchBanMutation.isPending}
                                        >
                                            <Ban className="h-4 w-4 mr-1" />
                                            Ban All
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-500 border-green-500/50 hover:bg-green-500/10"
                                            onClick={() => batchBanMutation.mutate({ userIds: Array.from(selectedUsers), status: 'active' })}
                                            disabled={batchBanMutation.isPending}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Unban All
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-purple-500 border-purple-500/50 hover:bg-purple-500/10"
                                            onClick={() => batchRoleMutation.mutate({ userIds: Array.from(selectedUsers), role: 'admin' })}
                                            disabled={batchRoleMutation.isPending}
                                        >
                                            <UserPlus className="h-4 w-4 mr-1" />
                                            Make Admin
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => batchRoleMutation.mutate({ userIds: Array.from(selectedUsers), role: 'user' })}
                                            disabled={batchRoleMutation.isPending}
                                        >
                                            <UserMinus className="h-4 w-4 mr-1" />
                                            Demote
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setShowBulkDeleteConfirm(true)}
                                            disabled={batchDeleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete All
                                        </Button>
                                    </div>
                                    <div className="h-6 w-px bg-border" />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={clearSelection}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Users Table */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle>Users ({userResponse?.totalUsers || 0})</CardTitle>
                    <CardDescription>
                        Page {userResponse?.currentPage || 1} of {userResponse?.totalPages || 1} •
                        Data from Supabase
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : userResponse?.users.length === 0 ? (
                        <div className="text-center py-12">
                            <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No users found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try adjusting your filters or run the mock users migration
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={userResponse?.users && selectedUsers.size === userResponse.users.length && userResponse.users.length > 0}
                                                onCheckedChange={selectAll}
                                                aria-label="Select all users"
                                            />
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Stats</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {userResponse?.users.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ delay: index * 0.03 }}
                                                className={`group hover:bg-white/5 ${selectedUsers.has(user.id) ? 'bg-primary/10' : ''}`}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedUsers.has(user.id)}
                                                        onCheckedChange={(checked) => {
                                                            const event = window.event as MouseEvent | undefined;
                                                            toggleUserSelection(user.id, index, event?.shiftKey || false);
                                                        }}
                                                        aria-label={`Select ${user.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={user.avatar_url} />
                                                            <AvatarFallback className="bg-primary/20 text-primary">
                                                                {user.name?.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
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
                                                    <Badge
                                                        variant={user.status === 'banned' ? 'destructive' : 'outline'}
                                                        className={user.status === 'active' ? 'text-green-500 border-green-500/20 bg-green-500/10' : ''}
                                                    >
                                                        {user.status === 'active' ? (
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <Ban className="h-3 w-3 mr-1" />
                                                        )}
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Contributions: </span>
                                                        <span className="font-medium">{user.contributions || 0}</span>
                                                        <span className="text-muted-foreground mx-2">•</span>
                                                        <span className="text-muted-foreground">Streak: </span>
                                                        <span className="font-medium">{user.streak || 0}🔥</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Send Email
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {user.role === 'user' ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => roleMutation.mutate({ userId: user.id, role: 'admin' })}
                                                                    disabled={roleMutation.isPending}
                                                                >
                                                                    <Shield className="h-4 w-4 mr-2" />
                                                                    Make Admin
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() => roleMutation.mutate({ userId: user.id, role: 'user' })}
                                                                    disabled={roleMutation.isPending}
                                                                >
                                                                    <Shield className="h-4 w-4 mr-2" />
                                                                    Remove Admin
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            {user.status !== 'banned' ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => banMutation.mutate({ userId: user.id, status: 'banned' })}
                                                                    className="text-orange-500"
                                                                    disabled={banMutation.isPending}
                                                                >
                                                                    <Ban className="h-4 w-4 mr-2" />
                                                                    Ban User
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() => banMutation.mutate({ userId: user.id, status: 'active' })}
                                                                    disabled={banMutation.isPending}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Unban User
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(user)}
                                                                className="text-red-500"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                                </Button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, userResponse?.totalPages || 1) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={page === pageNum ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setPage(pageNum)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
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

            {/* User Details Dialog */}
            <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedUser?.avatar_url} />
                                <AvatarFallback>{selectedUser?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p>{selectedUser?.name}</p>
                                <p className="text-sm font-normal text-muted-foreground">{selectedUser?.email}</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6">
                            {/* Status Badges */}
                            <div className="flex gap-2">
                                <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                    {selectedUser.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                    {selectedUser.role}
                                </Badge>
                                <Badge
                                    variant={selectedUser.status === 'banned' ? 'destructive' : 'outline'}
                                    className={selectedUser.status === 'active' ? 'text-green-500 border-green-500/20 bg-green-500/10' : ''}
                                >
                                    {selectedUser.status}
                                </Badge>
                            </div>

                            {/* Bio */}
                            {selectedUser.bio && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                                    <p>{selectedUser.bio}</p>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">College</p>
                                    <p className="font-medium">{selectedUser.college || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Year</p>
                                    <p className="font-medium">{selectedUser.year ? `Year ${selectedUser.year}` : 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Contributions</p>
                                    <p className="font-medium">{selectedUser.contributions || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Streak</p>
                                    <p className="font-medium">{selectedUser.streak || 0} days 🔥</p>
                                </div>
                            </div>

                            {/* Tech Stack */}
                            {selectedUser.tech_stack && selectedUser.tech_stack.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Tech Stack</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.tech_stack.map((tech, i) => (
                                            <Badge key={i} variant="secondary">{tech}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Interests */}
                            {selectedUser.interests && selectedUser.interests.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Interests</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.interests.map((interest, i) => (
                                            <Badge key={i} variant="outline">{interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Activity Stats */}
                            {userActivity && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Activity</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <p className="text-2xl font-bold">{userActivity.postsCount}</p>
                                            <p className="text-xs text-muted-foreground">Posts</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <p className="text-2xl font-bold">{userActivity.questionsCount}</p>
                                            <p className="text-xs text-muted-foreground">Questions</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <p className="text-2xl font-bold">{userActivity.resourcesCount}</p>
                                            <p className="text-xs text-muted-foreground">Resources</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex gap-2">
                                {selectedUser.github_profile && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={selectedUser.github_profile} target="_blank" rel="noopener noreferrer">
                                            <Github className="h-4 w-4 mr-2" />
                                            GitHub
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                    </Button>
                                )}
                                {selectedUser.linkedin_profile && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={selectedUser.linkedin_profile} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="h-4 w-4 mr-2" />
                                            LinkedIn
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                    </Button>
                                )}
                            </div>

                            {/* Joined Date */}
                            <div className="text-sm text-muted-foreground border-t border-white/10 pt-4">
                                Joined {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Delete User
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
                            This action cannot be undone and will remove all their data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Delete {selectedUsers.size} Users
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedUsers.size} users</strong>?
                            This action cannot be undone and will remove all their data permanently.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => batchDeleteMutation.mutate(Array.from(selectedUsers))}
                            disabled={batchDeleteMutation.isPending}
                        >
                            {batchDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedUsers.size} Users`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
