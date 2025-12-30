import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import {
    Search,
    Home,
    Users,
    FolderOpen,
    Code2,
    MessageCircle,
    Upload,
    UserPlus,
    PlusCircle,
    Settings,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CommandItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    category: 'Navigation' | 'Actions' | 'Account';
    keywords?: string[];
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAppContext();

    // Toggle command palette with Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelect = useCallback((callback: () => void) => {
        setOpen(false);
        callback();
    }, []);

    const commands: CommandItem[] = [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            icon: <Home className="h-4 w-4" />,
            action: () => navigate('/feed'),
            category: 'Navigation',
            keywords: ['home', 'feed', 'dashboard']
        },
        {
            id: 'nav-peers',
            label: 'Find Peers',
            icon: <Users className="h-4 w-4" />,
            action: () => navigate('/peers'),
            category: 'Navigation',
            keywords: ['network', 'students', 'connect']
        },
        {
            id: 'nav-resources',
            label: 'Browse Resources',
            icon: <FolderOpen className="h-4 w-4" />,
            action: () => navigate('/resources'),
            category: 'Navigation',
            keywords: ['files', 'notes', 'pdfs']
        },
        {
            id: 'nav-groups',
            label: 'Study Groups',
            icon: <Users className="h-4 w-4" />,
            action: () => navigate('/groups'),
            category: 'Navigation',
            keywords: ['teams', 'collaborate']
        },
        {
            id: 'nav-code',
            label: 'Code Space',
            icon: <Code2 className="h-4 w-4" />,
            action: () => navigate('/code'),
            category: 'Navigation',
            keywords: ['editor', 'pair programming', 'collaborate']
        },
        {
            id: 'nav-qa',
            label: 'Q&A Forum',
            icon: <MessageCircle className="h-4 w-4" />,
            action: () => navigate('/qa'),
            category: 'Navigation',
            keywords: ['questions', 'answers', 'help']
        },

        // Quick Actions
        {
            id: 'action-upload',
            label: 'Upload Resource',
            icon: <Upload className="h-4 w-4" />,
            action: () => navigate('/resources'),
            category: 'Actions',
            keywords: ['share', 'notes', 'file']
        },
        {
            id: 'action-group',
            label: 'Create Study Group',
            icon: <PlusCircle className="h-4 w-4" />,
            action: () => navigate('/groups'),
            category: 'Actions',
            keywords: ['new', 'team']
        },
        {
            id: 'action-connect',
            label: 'Connect with Peer',
            icon: <UserPlus className="h-4 w-4" />,
            action: () => navigate('/peers'),
            category: 'Actions',
            keywords: ['add', 'friend', 'network']
        },

        // Account
        {
            id: 'account-profile',
            label: 'View Profile',
            icon: <Settings className="h-4 w-4" />,
            action: () => navigate('/profile'),
            category: 'Account',
            keywords: ['settings', 'account']
        },
        {
            id: 'account-logout',
            label: 'Sign Out',
            icon: <LogOut className="h-4 w-4" />,
            action: () => logout(),
            category: 'Account',
            keywords: ['exit', 'logout']
        }
    ];

    // Group commands by category
    const categories = ['Navigation', 'Actions', 'Account'] as const;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden">
                <Command className="rounded-lg border-0 shadow-2xl">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[400px] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        {categories.map((category) => (
                            <Command.Group
                                key={category}
                                heading={category}
                                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                            >
                                {commands
                                    .filter((cmd) => cmd.category === category)
                                    .map((cmd) => (
                                        <Command.Item
                                            key={cmd.id}
                                            value={`${cmd.label} ${cmd.keywords?.join(' ')}`}
                                            onSelect={() => handleSelect(cmd.action)}
                                            className="relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="mr-2 flex h-5 w-5 items-center justify-center">
                                                {cmd.icon}
                                            </div>
                                            <span>{cmd.label}</span>
                                        </Command.Item>
                                    ))}
                            </Command.Group>
                        ))}
                    </Command.List>

                    <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                        <span>Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">⌘K</kbd> to toggle</span>
                        <span>Navigate with <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">↑↓</kbd></span>
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
