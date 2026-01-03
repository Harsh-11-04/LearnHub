import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellDot, Check, Trash2, User, MessageCircle, Upload, Download, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification, notificationService } from '@/services/notification.service';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'new_follower':
            return <User className="h-4 w-4 text-blue-500" />;
        case 'new_comment':
            return <MessageCircle className="h-4 w-4 text-green-500" />;
        case 'new_resource':
            return <Upload className="h-4 w-4 text-purple-500" />;
        case 'resource_downloaded':
            return <Download className="h-4 w-4 text-orange-500" />;
        case 'badge_earned':
            return <Award className="h-4 w-4 text-yellow-500" />;
        default:
            return <Bell className="h-4 w-4" />;
    }
};

export const NotificationBell = () => {
    const { user } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const loadNotifications = async () => {
        if (!user) return;
        const data = await notificationService.getAll();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (id: string) => {
        await notificationService.delete(id);
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (!user) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <>
                            <BellDot className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </>
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            <Check className="h-3 w-3 mr-1" /> Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                                    )}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{notification.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notification.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
