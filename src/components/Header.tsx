import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppContext } from "@/contexts/AppContext";
import { useTheme } from "@/components/theme-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  User,
  Sun,
  Moon,
  Sparkles,
  Home,
  Settings,
  LogOut,
  Menu,
  Code,
  UsersRound,
  Library,
  Shield,
  Bell,
  Activity,
} from "lucide-react";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAppContext();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: Home },
    { id: "feed", path: "/feed", label: "Feed", icon: MessageSquare },
    { id: "peers", path: "/peers", label: "Peers", icon: UsersRound },
    { id: "code", path: "/code", label: "Code", icon: Code },
    { id: "resources", path: "/resources", label: "Resources", icon: Library },
    { id: "groups", path: "/groups", label: "Groups", icon: Users },
    { id: "qa", path: "/qa", label: "Q&A", icon: HelpCircle },
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-orange-400/20">
            <Sparkles className="h-5 w-5 text-cyan-500" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-orange-500 bg-clip-text text-transparent">
            LearnHub
          </span>
        </motion.div>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <motion.button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`
                    relative px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground hover:text-foreground"}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-cyan-100 dark:bg-cyan-900/30 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </motion.button>
              );
            })}
            {/* Admin Portal Link - visible for admin users */}
            {user?.role === 'admin' && (
              <motion.button
                onClick={() => navigate('/admin')}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin')
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-muted-foreground hover:text-purple-500"}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {location.pathname.startsWith('/admin') && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </span>
              </motion.button>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path;
                    return (
                      <Button
                        key={path}
                        variant={isActive ? "default" : "ghost"}
                        className="justify-start gap-3"
                        onClick={() => {
                          navigate(path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Button>
                    );
                  })}
                  <div className="border-t my-2" />
                  <Button
                    variant="ghost"
                    className="justify-start gap-3"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-primary"
                    onClick={() => {
                      navigate('/admin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Shield className="h-5 w-5" />
                    Admin Portal
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start gap-3"
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-destructive hover:text-destructive"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>

          {/* Activity */}
          {isAuthenticated && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/activity')}
                className="rounded-full"
              >
                <Activity className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                className="rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </motion.div>
          )}

          {/* Settings */}
          {isAuthenticated && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Avatar className="cursor-pointer border-2 border-transparent hover:border-cyan-500 transition-all">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/activity')}>
                  <Activity className="mr-2 h-4 w-4" />
                  <span>Activity</span>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="text-purple-600 dark:text-purple-400">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
