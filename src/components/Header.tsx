import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Sun, Menu, Code2, Users, MessageCircle, User } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const Header: React.FC = () => {
  const { user, currentPage, setCurrentPage, toggleSidebar, isAuthenticated } = useAppContext();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Code2 },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'squads', label: 'Squads', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
              DevConnect
            </h1>
          </div>
        </div>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentPage === id ? "default" : "ghost"}
                onClick={() => setCurrentPage(id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U=" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block font-medium">{user.name}</span>
            </div>
          ) : (
            <Button onClick={() => setCurrentPage('auth')} className="gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;