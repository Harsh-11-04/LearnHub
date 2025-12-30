import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Shield,
    BarChart3,
    ClipboardList,
    Settings,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    LogOut,
    Menu,
    X,
    Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const sidebarItems = [
    {
        icon: LayoutDashboard,
        label: 'Dashboard',
        path: '/admin',
        badge: null
    },
    {
        icon: Users,
        label: 'Users',
        path: '/admin/users',
        badge: null
    },
    {
        icon: FileText,
        label: 'Content',
        path: '/admin/content',
        badge: null
    },
    {
        icon: Shield,
        label: 'Moderation',
        path: '/admin/moderation',
        badge: 3
    },
    {
        icon: BarChart3,
        label: 'Analytics',
        path: '/admin/analytics',
        badge: null
    },
    {
        icon: ClipboardList,
        label: 'User Work',
        path: '/admin/user-work',
        badge: null
    },
];

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout, loading, isAuthenticated } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    // Protect Admin Routes
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                // Not logged in -> redirect to login
                navigate('/auth');
            } else if (user?.role !== 'admin') {
                // Logged in but not admin -> redirect to dashboard
                navigate('/dashboard');
            }
        }
    }, [user, loading, isAuthenticated, navigate]);

    // Show loader while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If not authenticated or not admin, don't render layout (will redirect)
    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    // Get current page title from route
    const getCurrentPageTitle = () => {
        const currentItem = sidebarItems.find(item => item.path === location.pathname);
        return currentItem?.label || 'Admin';
    };

    // Get breadcrumb path
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        return paths.map((path, index) => ({
            label: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '),
            path: '/' + paths.slice(0, index + 1).join('/')
        }));
    };

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full">
            {/* Logo/Brand */}
            <div className={cn(
                "flex items-center gap-3 p-4 border-b border-white/10",
                sidebarCollapsed && !isMobile && "justify-center"
            )}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <AnimatePresence>
                    {(!sidebarCollapsed || isMobile) && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden"
                        >
                            <h1 className="font-bold text-lg whitespace-nowrap">Admin Panel</h1>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">LearnHub</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && setMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                                sidebarCollapsed && !isMobile && "justify-center px-2"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 flex-shrink-0",
                                isActive && "text-primary-foreground"
                            )} />
                            <AnimatePresence>
                                {(!sidebarCollapsed || isMobile) && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {item.badge && (!sidebarCollapsed || isMobile) && (
                                <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
                                    {item.badge}
                                </Badge>
                            )}
                            {item.badge && sidebarCollapsed && !isMobile && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}

                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && !isMobile && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className={cn(
                "p-3 border-t border-white/10",
                sidebarCollapsed && !isMobile && "flex flex-col items-center"
            )}>
                <NavLink
                    to="/dashboard"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200",
                        sidebarCollapsed && !isMobile && "justify-center px-2"
                    )}
                >
                    <Home className="w-5 h-5" />
                    {(!sidebarCollapsed || isMobile) && <span>Back to App</span>}
                </NavLink>

                {!sidebarCollapsed && !isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(true)}
                        className="w-full mt-2 text-muted-foreground"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Collapse
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 72 : 256 }}
                className="hidden lg:flex flex-col border-r border-white/10 bg-card/50 backdrop-blur-xl fixed h-screen z-40"
            >
                <SidebarContent />

                {/* Collapse/Expand toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-white/10 shadow-lg hover:bg-accent"
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                    ) : (
                        <ChevronLeft className="w-3 h-3" />
                    )}
                </Button>
            </motion.aside>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-white/10 z-50 lg:hidden"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute right-2 top-2"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            <SidebarContent isMobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300",
                sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[256px]"
            )}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Breadcrumbs */}
                        <div className="hidden sm:flex items-center gap-2 text-sm">
                            {getBreadcrumbs().map((crumb, index) => (
                                <span key={crumb.path} className="flex items-center gap-2">
                                    {index > 0 && <span className="text-muted-foreground">/</span>}
                                    <span className={index === getBreadcrumbs().length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                                        {crumb.label}
                                    </span>
                                </span>
                            ))}
                        </div>

                        {/* Mobile title */}
                        <h1 className="text-lg font-semibold sm:hidden">{getCurrentPageTitle()}</h1>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="hidden md:flex relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="w-64 pl-9 bg-white/5 border-white/10"
                            />
                        </div>

                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-primary/20 text-primary">
                                            {user?.name?.charAt(0) || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline text-sm font-medium">
                                        {user?.name || 'Admin'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <NavLink to="/profile" className="flex items-center gap-2 cursor-pointer">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </NavLink>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <NavLink to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                                        <Home className="w-4 h-4" />
                                        Back to App
                                    </NavLink>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
