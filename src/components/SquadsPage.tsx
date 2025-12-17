import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { 
  Users, 
  Plus, 
  Search, 
  Github, 
  Star,
  Calendar,
  MessageCircle,
  Code2
} from 'lucide-react';

interface Study Group {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  members: number;
  maxMembers: number;
  isJoined: boolean;
  project: {
    name: string;
    repo: string;
    stars: number;
  };
  leader: {
    name: string;
    avatar: string;
  };
}

const Study GroupsPage: React.FC = () => {
  const { user } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStudy Group, setNewStudy Group] = useState({
    name: '',
    description: '',
    techStack: '',
    project: ''
  });

  const [Study Groups, setStudy Groups] = useState<Study Group[]>([
    {
      id: '1',
      name: 'React UI Library',
      description: 'Building a comprehensive React component library with TypeScript and Storybook.',
      techStack: ['React', 'TypeScript', 'Storybook'],
      members: 4,
      maxMembers: 6,
      isJoined: true,
      project: {
        name: 'ui-components',
        repo: 'github.com/Study Group/ui-components',
        stars: 128
      },
      leader: {
        name: 'Sarah Chen',
        avatar: 'https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U='
      }
    },
    {
      id: '2',
      name: 'AI Chat Bot',
      description: 'Developing an intelligent chatbot using Python, FastAPI, and OpenAI GPT.',
      techStack: ['Python', 'FastAPI', 'OpenAI'],
      members: 3,
      maxMembers: 5,
      isJoined: false,
      project: {
        name: 'smart-chatbot',
        repo: 'github.com/Study Group/smart-chatbot',
        stars: 89
      },
      leader: {
        name: 'Mike Rodriguez',
        avatar: 'https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U='
      }
    },
    {
      id: '3',
      name: 'DevOps Tools',
      description: 'Creating automation tools for CI/CD pipelines with Docker and Kubernetes.',
      techStack: ['Docker', 'Kubernetes', 'Go'],
      members: 2,
      maxMembers: 4,
      isJoined: false,
      project: {
        name: 'devops-toolkit',
        repo: 'github.com/Study Group/devops-toolkit',
        stars: 45
      },
      leader: {
        name: 'Alex Kim',
        avatar: 'https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U='
      }
    }
  ]);

  const handleJoinStudy Group = (Study GroupId: string) => {
    setStudy Groups(Study Groups.map(Study Group => 
      Study Group.id === Study GroupId 
        ? { ...Study Group, isJoined: !Study Group.isJoined, members: Study Group.isJoined ? Study Group.members - 1 : Study Group.members + 1 }
        : Study Group
    ));
  };

  const handleCreateStudy Group = () => {
    if (!newStudy Group.name || !newStudy Group.description) return;

    const Study Group: Study Group = {
      id: Date.now().toString(),
      name: newStudy Group.name,
      description: newStudy Group.description,
      techStack: newStudy Group.techStack.split(',').map(t => t.trim()).filter(t => t),
      members: 1,
      maxMembers: 6,
      isJoined: true,
      project: {
        name: newStudy Group.project || newStudy Group.name.toLowerCase().replace(/\s+/g, '-'),
        repo: `github.com/${user?.name.toLowerCase()}/project`,
        stars: 0
      },
      leader: {
        name: user?.name || 'You',
        avatar: user?.avatar || 'https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U='
      }
    };

    setStudy Groups([Study Group, ...Study Groups]);
    setNewStudy Group({ name: '', description: '', techStack: '', project: '' });
    setShowCreateDialog(false);
  };

  const filteredStudy Groups = Study Groups.filter(Study Group =>
    Study Group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Study Group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Study Group.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dev Study Groups</h1>
          <p className="text-muted-foreground">Join or create Study Groups to collaborate on open-source projects</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Study Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="Study Group-name">Study Group Name</Label>
                <Input
                  id="Study Group-name"
                  value={newStudy Group.name}
                  onChange={(e) => setNewStudy Group({ ...newStudy Group, name: e.target.value })}
                  placeholder="React UI Library"
                />
              </div>
              <div>
                <Label htmlFor="Study Group-description">Description</Label>
                <Textarea
                  id="Study Group-description"
                  value={newStudy Group.description}
                  onChange={(e) => setNewStudy Group({ ...newStudy Group, description: e.target.value })}
                  placeholder="What will your Study Group work on?"
                />
              </div>
              <div>
                <Label htmlFor="tech-stack">Tech Stack (comma separated)</Label>
                <Input
                  id="tech-stack"
                  value={newStudy Group.techStack}
                  onChange={(e) => setNewStudy Group({ ...newStudy Group, techStack: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div>
                <Label htmlFor="project-name">Project Name (optional)</Label>
                <Input
                  id="project-name"
                  value={newStudy Group.project}
                  onChange={(e) => setNewStudy Group({ ...newStudy Group, project: e.target.value })}
                  placeholder="my-awesome-project"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateStudy Group} className="flex-1">
                  Create Study Group
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Study Groups by name, description, or tech..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Study Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudy Groups.map((Study Group) => (
          <Card key={Study Group.id} className="hover:shadow-lg transition-shadow border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{Study Group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {Study Group.description}
                  </p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={Study Group.leader.avatar} />
                  <AvatarFallback>{Study Group.leader.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {Study Group.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{Study Group.project.repo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{Study Group.members}/{Study Group.maxMembers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{Study Group.project.stars}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={Study Group.isJoined ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleJoinStudy Group(Study Group.id)}
                  className="flex-1"
                  disabled={!Study Group.isJoined && Study Group.members >= Study Group.maxMembers}
                >
                  {Study Group.isJoined ? 'Leave' : Study Group.members >= Study Group.maxMembers ? 'Full' : 'Join'}
                </Button>
                {Study Group.isJoined && (
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudy Groups.length === 0 && (
        <div className="text-center py-12">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Study Groups found</h3>
          <p className="text-muted-foreground">Try adjusting your search or create a new Study Group</p>
        </div>
      )}
    </div>
  );
};

export default Study GroupsPage;