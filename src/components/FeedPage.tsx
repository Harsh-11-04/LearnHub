import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Code2, 
  Plus,
  Hash,
  Calendar
} from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    techStack: string[];
  };
  content: string;
  tags: string[];
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const FeedPage: React.FC = () => {
  const { user } = useAppContext();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Chen',
        avatar: 'https://media.istockphoto.com/id/1411320618/photo/little-girl-pointing-her-finger-with-cartoon-style-3d-rendering.jpg?s=612x612&w=0&k=20&c=ulkjINV8d_g98gTCsFBJn526dqnAX-Yqzu0yBCy-mJI=',
        techStack: ['React', 'TypeScript']
      },
      content: 'Just shipped a new feature using React Server Components! The performance improvements are incredible. Anyone else experimenting with RSCs?',
      tags: ['react', 'nextjs', 'performance'],
      timestamp: '2h ago',
      likes: 24,
      comments: 8,
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Mike Rodriguez',
        avatar: 'https://github.com/shadcn.png',
        techStack: ['Python', 'AI/ML']
      },
      content: 'Working on an open-source ML library for real-time data processing. Looking for contributors who are passionate about Python and machine learning!',
      tags: ['python', 'machinelearning', 'opensource'],
      timestamp: '4h ago',
      likes: 42,
      comments: 15,
      isLiked: true
    }
  ]);

  const handlePost = () => {
    if (!newPost.trim() || !user) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: user.name,
        avatar: user.avatar,
        techStack: user.techStack
      },
      content: newPost,
      tags: [],
      timestamp: 'now',
      likes: 0,
      comments: 0,
      isLiked: false
    };
    
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src="https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U=" />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your latest dev insights..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Hash className="h-4 w-4" />
                    Tags
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Code2 className="h-4 w-4" />
                    Code
                  </Button>
                </div>
                <Button onClick={handlePost} disabled={!newPost.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{post.author.name}</h4>
                    <span className="text-muted-foreground text-sm">•</span>
                    <span className="text-muted-foreground text-sm">{post.timestamp}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {post.author.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="mb-4">{post.content}</p>
              
              {post.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      <Hash className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${post.isLiked ? 'text-orange-500 hover:text-orange-600' : 'hover:text-orange-400'}`}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </Button>
                
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </Button>
                
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;