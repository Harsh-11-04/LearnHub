import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { gamificationService, Badge as BadgeType } from '@/services/gamification.service';
import { followService } from '@/services/follow.service';
import {
  Edit,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Code2,
  Users,
  MessageCircle,
  Star,
  Settings,
  Trophy,
  Zap,
  Award
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPoints, setUserPoints] = useState({ points: 0, level: 1 });
  const [editForm, setEditForm] = useState({
    name: user?.name || 'Harsh Pawar',
    bio: 'Full-stack developer passionate about React, Node.js, and open-source. Always learning new technologies and building cool stuff!',
    location: 'LPU, Punjab, India',
    website: 'https://harshpawar.dev',
    github: 'harshpawar',
    linkedin: 'harsh-pawar'
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const [badges, followers, following, stats] = await Promise.all([
          gamificationService.getUserBadges(user.id),
          followService.getFollowerCount(user.id),
          followService.getFollowingCount(user.id),
          gamificationService.getUserStats(user.id)
        ]);
        setUserBadges(badges);
        setFollowerCount(followers);
        setFollowingCount(following);
        if (stats) {
          setUserPoints({ points: stats.points, level: stats.level });
        }
      }
    };
    loadUserData();
  }, [user]);

  const stats = [
    { label: 'Points', value: userPoints.points.toString(), icon: Zap },
    { label: 'Level', value: userPoints.level.toString(), icon: Trophy },
    { label: 'Followers', value: followerCount.toString(), icon: Users },
    { label: 'Badges', value: userBadges.length.toString(), icon: Award }
  ];

  const posts = [
    {
      id: '1',
      content: 'Just shipped a new feature using React Server Components! The performance improvements are incredible.',
      timestamp: '2 days ago',
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      content: 'Working on an open-source project for real-time collaboration. Excited to share it with the community soon!',
      timestamp: '1 week ago',
      likes: 18,
      comments: 5
    }
  ];

  const studyGroups = [
    {
      id: '1',
      name: 'React UI Library',
      role: 'Member',
      members: 4,
      project: 'ui-components'
    },
    {
      id: '2',
      name: 'DevOps Tools',
      role: 'Leader',
      members: 3,
      project: 'devops-toolkit'
    }
  ];

  const handleSaveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: editForm.name
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=HarshPawar&backgroundColor=b6e3f4" />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className="gap-2"
                >
                  {isEditing ? 'Save' : <><Edit className="h-4 w-4" />Edit</>}
                </Button>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Your name"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                    />
                    <Input
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="Website"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                    <p className="text-muted-foreground mb-3">{editForm.bio}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {editForm.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined June 2025
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <a href="https://github.com/harshpawar" target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
                        <Github className="h-4 w-4" />
                        {editForm.github}
                      </Button></a>
                      <a href="https://www.linkedin.com/in/harsh-pawar/" target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
                        <Linkedin className="h-4 w-4" />
                        {editForm.linkedin}
                      </Button></a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {user.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="Study Groups">Study Groups</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <p className="mb-3">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{post.timestamp}</span>
                  <div className="flex gap-4">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {studyGroups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.role} • {group.members} members • {group.project}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications about messages and Study Group updates</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Privacy Settings</h4>
                  <p className="text-sm text-muted-foreground">Control who can see your profile and activity</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default ProfilePage;