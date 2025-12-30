import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Bell, Check, Trash2, MessageCircle, Heart, UserPlus,
    Award, BookOpen, Video, CheckCheck, Filter
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: 'message' | 'like' | 'follow' | 'achievement' | 'resource' | 'room';
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    avatar?: string;
    actionUrl?: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'like',
        title: 'Alice liked your post',
        description: '"Learning React has been amazing..."',
        timestamp: '5 mins ago',
        read: false,
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alice'
    },
    {
        id: '2',
        type: 'message',
        title: 'New message from Bob',
        description: 'Hey, can you help me with the assignment?',
        timestamp: '15 mins ago',
        read: false,
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bob'
    },
    {
        id: '3',
        type: 'follow',
        title: 'Charlie started following you',
        description: 'You have a new follower!',
        timestamp: '1 hour ago',
        read: false,
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Charlie'
    },
    {
        id: '4',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        description: 'You earned the "Helper" badge',
        timestamp: '2 hours ago',
        read: true
    },
    {
        id: '5',
        type: 'resource',
        title: 'New resource in your group',
        description: 'Diana shared "Advanced TypeScript"',
        timestamp: '3 hours ago',
        read: true,
        avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Diana'
    },
    {
        id: '6',
        type: 'room',
        title: 'Study room starting',
        description: 'React Deep Dive is starting now',
        timestamp: 'Yesterday',
        read: true
    },
    {
        id: '7',
        type: 'like',
        title: '5 people liked your answer',
        description: 'Your answer about useEffect got popular',
        timestamp: 'Yesterday',
        read: true
    }
];

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="h-5 w-5 text-red-500" />;
            case 'message': return <MessageCircle className="h-5 w-5 text-blue-500" />;
            case 'follow': return <UserPlus className="h-5 w-5 text-green-500" />;
            case 'achievement': return <Award className="h-5 w-5 text-yellow-500" />;
            case 'resource': return <BookOpen className="h-5 w-5 text-purple-500" />;
            case 'room': return <Video className="h-5 w-5 text-pink-500" />;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification deleted');
    };

    const clearAll = () => {
        setNotifications([]);
        toast.success('All notifications cleared');
    };

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Bell className="h-8 w-8 text-blue-500" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-red-500 ml-2">{unreadCount}</Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">Stay updated with your activity</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all read
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear all
                    </Button>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </Button>
            </div>

            {/* Notifications List */}
            <Card className="divide-y overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`p-4 flex items-start gap-4 hover:bg-accent/30 transition-colors ${!notification.read ? 'bg-blue-500/5' : ''}`}
                        >
                            {/* Icon or Avatar */}
                            {notification.avatar ? (
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={notification.avatar} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    {getIcon(notification.type)}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {notification.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </Card>
        </PageTransition>
    );
};

export default NotificationsPage;
