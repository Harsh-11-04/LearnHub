import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Settings, User, Bell, Shield, Palette, LogOut,
    Save, Camera, Moon, Sun, Globe, Lock, Mail, Trash2
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

const SettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance'>('profile');

    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Passionate learner and developer. Love to explore new technologies.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev'
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: true,
        mentionAlerts: true,
        newFollowers: false,
        resourceUpdates: true
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: 'public',
        showEmail: false,
        showActivity: true,
        allowMessages: true
    });

    const saveSettings = () => {
        toast.success('Settings saved successfully!');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ];

    return (
        <PageTransition className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <Settings className="h-8 w-8 text-purple-500" />
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <Card className="p-4 md:w-64 h-fit">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                        <hr className="my-2" />
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <LogOut className="h-4 w-4 mr-2" />
                            Log Out
                        </Button>
                    </nav>
                </Card>

                {/* Content */}
                <Card className="flex-1 p-6">
                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Settings
                            </h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=me" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium">{profile.name}</p>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={profile.bio}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={profile.location}
                                            onChange={e => setProfile({ ...profile, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={profile.website}
                                            onChange={e => setProfile({ ...profile, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </h2>

                            <div className="space-y-4">
                                {Object.entries({
                                    emailNotifications: { label: 'Email Notifications', desc: 'Receive notifications via email' },
                                    pushNotifications: { label: 'Push Notifications', desc: 'Browser push notifications' },
                                    weeklyDigest: { label: 'Weekly Digest', desc: 'Summary of activity every week' },
                                    mentionAlerts: { label: 'Mention Alerts', desc: 'When someone mentions you' },
                                    newFollowers: { label: 'New Followers', desc: 'When someone follows you' },
                                    resourceUpdates: { label: 'Resource Updates', desc: 'Updates in your groups' }
                                }).map(([key, { label, desc }]) => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                                        <div>
                                            <p className="font-medium">{label}</p>
                                            <p className="text-sm text-muted-foreground">{desc}</p>
                                        </div>
                                        <Switch
                                            checked={notifications[key as keyof typeof notifications]}
                                            onCheckedChange={checked =>
                                                setNotifications({ ...notifications, [key]: checked })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Privacy Settings */}
                    {activeTab === 'privacy' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Privacy Settings
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <Label className="font-medium">Profile Visibility</Label>
                                    <p className="text-sm text-muted-foreground mb-3">Who can see your profile</p>
                                    <div className="flex gap-2">
                                        {['public', 'friends', 'private'].map(opt => (
                                            <Button
                                                key={opt}
                                                variant={privacy.profileVisibility === opt ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setPrivacy({ ...privacy, profileVisibility: opt })}
                                                className="capitalize"
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {Object.entries({
                                    showEmail: { label: 'Show Email', desc: 'Display email on profile' },
                                    showActivity: { label: 'Show Activity', desc: 'Display recent activity' },
                                    allowMessages: { label: 'Allow Messages', desc: 'Let others message you' }
                                }).map(([key, { label, desc }]) => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                                        <div>
                                            <p className="font-medium">{label}</p>
                                            <p className="text-sm text-muted-foreground">{desc}</p>
                                        </div>
                                        <Switch
                                            checked={privacy[key as keyof typeof privacy] as boolean}
                                            onCheckedChange={checked =>
                                                setPrivacy({ ...privacy, [key]: checked })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t">
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Appearance
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <Label className="font-medium">Theme</Label>
                                    <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={theme === 'light' ? 'default' : 'outline'}
                                            onClick={() => setTheme('light')}
                                        >
                                            <Sun className="h-4 w-4 mr-2" />
                                            Light
                                        </Button>
                                        <Button
                                            variant={theme === 'dark' ? 'default' : 'outline'}
                                            onClick={() => setTheme('dark')}
                                        >
                                            <Moon className="h-4 w-4 mr-2" />
                                            Dark
                                        </Button>
                                        <Button
                                            variant={theme === 'system' ? 'default' : 'outline'}
                                            onClick={() => setTheme('system')}
                                        >
                                            <Globe className="h-4 w-4 mr-2" />
                                            System
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Save Button */}
                    <div className="mt-6 pt-6 border-t">
                        <Button onClick={saveSettings} className="w-full md:w-auto">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </Card>
            </div>
        </PageTransition>
    );
};

export default SettingsPage;
