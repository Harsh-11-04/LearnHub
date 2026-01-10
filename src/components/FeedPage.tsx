import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/contexts/AppContext';
import api from '@/lib/api';
import {
  Heart,
  MessageCircle,
  Share,
  Code2,
  Plus,
  Hash,
  Sparkles,
  Zap,
  Flame,
  TrendingUp,
  BookOpen,
  Trophy,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import PageTransition from './PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types/post';

// --- Premium Bento Components ---

const BentoItem = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`group relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-2xl ${className}`}
  >
    {/* Noise Texture Overlay */}
    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

    {/* Content */}
    <div className="relative z-10 h-full">
      {children}
    </div>
  </motion.div>
);

const ActivityChart = () => {
  // Real-time animated data
  const [data, setData] = useState([4, 6, 3, 7, 5, 8, 6]);

  useEffect(() => {
    // Update data every 2 seconds for smooth real-time effect
    const interval = setInterval(() => {
      setData(prevData => {
        // Shift data left and add new random value
        const newData = [...prevData.slice(1), Math.floor(Math.random() * 6) + 3];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const max = Math.max(...data, 10); // Ensure minimum scale

  // Generate SVG Path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (val / max) * 80;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,100 L0,${100 - (data[0] / max) * 80} ${points} 100,100 Z`;

  return (
    <div className="h-[120px] w-full mt-4 relative">
      <div className="absolute top-0 right-0 flex items-center gap-1 text-xs text-green-500">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Live
      </div>
      <div className="absolute inset-0 flex items-end justify-between px-1 text-[10px] text-muted-foreground/50 font-medium pb-1">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill="url(#chartGradient)"
          animate={{ d: areaPath }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <motion.polyline
          fill="none"
          stroke="#818cf8"
          strokeWidth="2"
          animate={{ points }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((val, i) => (
          <motion.circle
            key={i}
            r="3"
            fill="#fff"
            stroke="#6366f1"
            strokeWidth="1.5"
            animate={{
              cx: (i / (data.length - 1)) * 100,
              cy: 100 - (val / max) * 80
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hover:r-4 transition-all cursor-pointer"
          />
        ))}
      </svg>
    </div>
  );
};

// --- Live Animated Pie Chart ---
const LivePieChart = () => {
  const [data, setData] = useState([
    { label: 'Coding', value: 35, color: '#6366f1' },
    { label: 'Reading', value: 25, color: '#22c55e' },
    { label: 'Videos', value: 20, color: '#f59e0b' },
    { label: 'Practice', value: 20, color: '#ec4899' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = prev.map(item => ({
          ...item,
          value: Math.max(10, Math.min(50, item.value + (Math.random() - 0.5) * 10))
        }));
        const total = newData.reduce((sum, item) => sum + item.value, 0);
        return newData.map(item => ({ ...item, value: (item.value / total) * 100 }));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.map((item, i) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;

            return (
              <motion.path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="hover:opacity-80 cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" className="fill-background" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">100%</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2 text-xs"
            animate={{ opacity: 1 }}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
            <span className="text-muted-foreground">{item.value.toFixed(0)}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Live Animated Bar Chart ---
const LiveBarChart = () => {
  const [data, setData] = useState([
    { label: 'React', value: 85 },
    { label: 'Python', value: 72 },
    { label: 'Node.js', value: 68 },
    { label: 'SQL', value: 55 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        value: Math.max(20, Math.min(100, item.value + (Math.random() - 0.5) * 15))
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{item.label}</span>
            <motion.span
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              {item.value.toFixed(0)}%
            </motion.span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: colors[i] }}
              animate={{ width: `${item.value}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Live Data Table ---
const LiveDataTable = () => {
  const [activities, setActivities] = useState([
    { user: 'Alice', action: 'Completed Quiz', points: 50, time: 'Just now' },
    { user: 'Bob', action: 'Shared Resource', points: 20, time: '1m ago' },
    { user: 'Charlie', action: 'Answered Question', points: 15, time: '2m ago' },
  ]);

  const actions = ['Completed Quiz', 'Shared Resource', 'Answered Question', 'Joined Group', 'Posted Update'];
  const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona'];

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        points: Math.floor(Math.random() * 40) + 10,
        time: 'Just now'
      };
      setActivities(prev => {
        const updated = prev.map((a, i) => ({
          ...a,
          time: i === 0 ? '1m ago' : i === 1 ? '2m ago' : '3m ago'
        }));
        return [newActivity, ...updated.slice(0, 2)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground font-medium px-2">
        <span>User</span>
        <span>Activity</span>
        <span>Points</span>
      </div>
      <AnimatePresence mode="popLayout">
        {activities.map((activity, i) => (
          <motion.div
            key={`${activity.user}-${activity.time}-${i}`}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-bold">
                {activity.user[0]}
              </div>
              <span className="text-sm font-medium">{activity.user}</span>
            </div>
            <span className="text-xs text-muted-foreground">{activity.action}</span>
            <motion.span
              key={activity.points}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-green-500"
            >
              +{activity.points}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page ---

const FeedPage: React.FC = () => {
  const { user } = useAppContext();
  const [newPost, setNewPost] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Try Supabase first
        const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('posts')
            .select(`
              *,
              profiles:author_id (name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

          if (!error && data) {
            setPosts(data.map(p => ({
              _id: p.id,
              content: p.content,
              author: {
                name: p.profiles?.name || 'Anonymous',
                avatar: p.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${p.author_id}`,
                techStack: ['LearnHub']
              },
              likes: p.likes || [],
              comments: [],
              tags: p.tags || [],
              createdAt: p.created_at
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');

      if (isSupabaseConfigured && supabase) {
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          const { data, error } = await supabase
            .from('posts')
            .insert({
              author_id: userData.user.id,
              content: newPost,
              tags: []
            })
            .select()
            .single();

          if (!error && data) {
            const newPostItem = {
              _id: data.id,
              content: data.content,
              author: {
                name: user.name || 'You',
                avatar: user.avatar,
                techStack: ['LearnHub']
              },
              likes: [],
              comments: [],
              tags: [],
              createdAt: data.created_at
            };
            setPosts([newPostItem, ...posts]);
            setNewPost('');
            const { toast } = await import('sonner');
            toast.success('Post shared successfully!');
            return;
          }
        }
      }

      // Fallback: local only
      const fallbackPost = {
        _id: `local-${Date.now()}`,
        content: newPost,
        author: {
          name: user.name || 'You',
          avatar: user.avatar,
          techStack: ['LearnHub']
        },
        likes: [],
        comments: [],
        tags: [],
        createdAt: new Date().toISOString()
      };
      setPosts([fallbackPost, ...posts]);
      setNewPost('');
      const { toast } = await import('sonner');
      toast.success('Post shared! (Local mode)');
    } catch (err) {
      console.error('Error creating post:', err);
      const { toast } = await import('sonner');
      toast.error('Failed to share post');
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');

      if (isSupabaseConfigured && supabase && !postId.startsWith('local-')) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const post = posts.find(p => p._id === postId);
        if (!post) return;

        const currentLikes: string[] = post.likes || [];
        const hasLiked = currentLikes.includes(userData.user.id);
        const newLikes = hasLiked
          ? currentLikes.filter((id: string) => id !== userData.user!.id)
          : [...currentLikes, userData.user.id];

        const { error } = await supabase
          .from('posts')
          .update({ likes: newLikes })
          .eq('id', postId);

        if (!error) {
          setPosts(posts.map(p => p._id === postId ? { ...p, likes: newLikes } : p));
        }
      } else {
        // Local toggle
        setPosts(posts.map(p => {
          if (p._id === postId) {
            const hasLiked = p.likes.includes(user.id);
            return {
              ...p,
              likes: hasLiked ? p.likes.filter((id: string) => id !== user.id) : [...p.likes, user.id]
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <PageTransition className="max-w-7xl mx-auto p-6 space-y-6">

      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* 1. HERO TILE (Welcome & Quick Actions) - Spans 8 Cols */}
        <BentoItem className="md:col-span-8 p-8 flex flex-col justify-between min-h-[300px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 border-2 border-white/50 shadow-lg">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-bold tracking-tight text-white drop-shadow-sm"
                >
                  Good Morning, {user?.name?.split(' ')[0] || 'Student'}.
                </motion.h1>
                <p className="text-white/70 text-lg">Ready to conquer your goals today?</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'New Project', icon: Code2, color: 'bg-emerald-500/20 text-emerald-300' },
              { label: 'Study Group', icon: BookOpen, color: 'bg-amber-500/20 text-amber-300' },
              { label: 'Daily Challenge', icon: Trophy, color: 'bg-pink-500/20 text-pink-300' },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 p-4 rounded-2xl border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/10 ${action.color}`}
              >
                <div className={`p-2 rounded-lg bg-white/10`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </BentoItem>

        {/* 2. STREAK TILE - Spans 4 Cols */}
        <BentoItem className="md:col-span-4 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10" delay={0.1}>
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/20">Top 1%</Badge>
          </div>
          <div className="mt-8 text-center">
            <span className="text-6xl font-black text-white drop-shadow-lg tracking-tighter">12</span>
            <p className="text-sm font-medium text-orange-200 uppercase tracking-widest mt-1">Day Streak</p>
          </div>
          <div className="mt-6 text-xs text-center text-white/50">
            Keep it up! You're beating your personal best.
          </div>
        </BentoItem>

        {/* 3. CHART TILE (Activity) - Spans 8 Cols */}
        <BentoItem className="md:col-span-8 p-6" delay={0.2}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Use of Time
            </h3>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">Weekly</Badge>
              <Badge variant="outline" className="text-muted-foreground border-transparent hover:bg-white/5">Monthly</Badge>
            </div>
          </div>
          <ActivityChart />
        </BentoItem>

        {/* NEW: Pie Chart - Learning Breakdown */}
        <BentoItem className="md:col-span-4 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10" delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Learning Mix
            </h3>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </div>
          <LivePieChart />
        </BentoItem>

        {/* NEW: Bar Chart - Skills Progress */}
        <BentoItem className="md:col-span-4 p-6 bg-gradient-to-br from-green-500/10 to-teal-500/10" delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-400" />
              Skills Progress
            </h3>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </div>
          <LiveBarChart />
        </BentoItem>

        {/* NEW: Live Activity Table */}
        <BentoItem className="md:col-span-4 p-6 bg-gradient-to-br from-pink-500/10 to-orange-500/10" delay={0.35}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-400" />
              Live Activity
            </h3>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Real-time
            </div>
          </div>
          <LiveDataTable />
        </BentoItem>

        {/* 4. TRENDING TILE - Spans 4 Cols */}
        <BentoItem className="md:col-span-4 p-6 overflow-hidden md:row-span-2" delay={0.3}>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Hash className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Trending Now</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {['#ReactJS', '#SystemDesign', '#InterviewPrep', '#Typescript', '#AI', '#Vercel', '#Supabase', '#CareerGrowth'].map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <Badge className="px-3 py-1.5 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 border-blue-500/20 cursor-pointer transition-colors">
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recommended For You</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                <div>
                  <p className="text-sm font-medium">Advanced React Patterns</p>
                  <p className="text-xs text-muted-foreground">Course • 2h left</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500" />
                <div>
                  <p className="text-sm font-medium">System Design Group</p>
                  <p className="text-xs text-muted-foreground">Live • 12 Active</p>
                </div>
              </div>
            </div>
          </div>
        </BentoItem>

        {/* 5. FEED TILE (Main Content) - Spans 8 Cols */}
        <div className="md:col-span-8 space-y-6">
          {/* Input */}
          <BentoItem className="p-1">
            <div className="flex gap-4 p-4 items-start">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your progress..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[60px] resize-none border-0 focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/50"
                />
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10"><Code2 className="h-4 w-4 mr-2" /> Code</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10"><Sparkles className="h-4 w-4 mr-2" /> Idea</Button>
                  </div>
                  <Button onClick={handlePost} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 shadow-lg shadow-indigo-500/20">Post</Button>
                </div>
              </div>
            </div>
          </BentoItem>

          {/* Posts */}
          <AnimatePresence>
            {posts.map((post) => (
              <BentoItem key={post._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-white/10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-sm">{post.author.name}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()} • {post.author.techStack[0]}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px]">{post.content}</p>

                <div className="flex gap-4 mt-6 pt-4 border-t border-white/5">
                  <Button
                    variant="ghost" size="sm"
                    className={`gap-2 hover:bg-red-500/10 ${user && post.likes.includes(user.id) ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'}`}
                    onClick={() => toggleLike(post._id)}
                  >
                    <Heart className={`h-4 w-4 ${user && post.likes.includes(user.id) ? 'fill-current' : ''}`} /> {post.likes.length}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10">
                    <MessageCircle className="h-4 w-4" /> {post.comments.length}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 ml-auto">
                    <Share className="h-4 w-4" /> Share
                  </Button>
                </div>
              </BentoItem>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </PageTransition>
  );
};

export default FeedPage;