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
  MessageCircle,
  Code2
} from 'lucide-react';

interface StudyGroup {
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

const StudyGroupsPage: React.FC = () => {
  const { user } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStudyGroup, setNewStudyGroup] = useState({
    name: '',
    description: '',
    techStack: '',
    project: ''
  });

  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
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
        repo: 'github.com/studygroup/ui-components',
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
        repo: 'github.com/studygroup/smart-chatbot',
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
        repo: 'github.com/studygroup/devops-toolkit',
        stars: 45
      },
      leader: {
        name: 'Alex Kim',
        avatar: 'https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U='
      }
    }
  ]);

  const handleJoinStudyGroup = (studyGroupId: string) => {
    setStudyGroups(studyGroups.map(group =>
      group.id === studyGroupId
        ? { ...group, isJoined: !group.isJoined, members: group.isJoined ? group.members - 1 : group.members + 1 }
        : group
    ));
  };

  const handleCreateStudyGroup = () => {
    if (!newStudyGroup.name || !newStudyGroup.description) return;

    const group: StudyGroup = {
      id: Date.now().toString(),
      name: newStudyGroup.name,
      description: newStudyGroup.description,
      techStack: newStudyGroup.techStack.split(',').map(t => t.trim()).filter(t => t),
      members: 1,
      maxMembers: 6,
      isJoined: true,
      project: {
        name: newStudyGroup.project || newStudyGroup.name.toLowerCase().replace(/\s+/g, '-'),
        repo: `github.com/${user?.name?.toLowerCase() || 'user'}/project`,
        stars: 0
      },
      leader: {
        name: user?.name || 'You',
        avatar: user?.avatar || 'https://media.istockphoto.com/id/1186723101/photo/digital-3d-illustration-of-a-toon-girl.webp?a=1&b=1&s=612x612&w=0&k=20&c=rIBUz9p3Tr60ncI26uuu1N-qxwbKEs5_kEgWmJGMX0U='
      }
    };

    setStudyGroups([group, ...studyGroups]);
    setNewStudyGroup({ name: '', description: '', techStack: '', project: '' });
    setShowCreateDialog(false);
  };

  const filteredStudyGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dev Study Groups</h1>
          <p className="text-muted-foreground">Join or create study groups to collaborate on open-source projects</p>
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
                <Label htmlFor="studygroup-name">Study Group Name</Label>
                <Input
                  id="studygroup-name"
                  value={newStudyGroup.name}
                  onChange={(e) => setNewStudyGroup({ ...newStudyGroup, name: e.target.value })}
                  placeholder="React UI Library"
                />
              </div>
              <div>
                <Label htmlFor="studygroup-description">Description</Label>
                <Textarea
                  id="studygroup-description"
                  value={newStudyGroup.description}
                  onChange={(e) => setNewStudyGroup({ ...newStudyGroup, description: e.target.value })}
                  placeholder="What will your study group work on?"
                />
              </div>
              <div>
                <Label htmlFor="tech-stack">Tech Stack (comma separated)</Label>
                <Input
                  id="tech-stack"
                  value={newStudyGroup.techStack}
                  onChange={(e) => setNewStudyGroup({ ...newStudyGroup, techStack: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div>
                <Label htmlFor="project-name">Project Name (optional)</Label>
                <Input
                  id="project-name"
                  value={newStudyGroup.project}
                  onChange={(e) => setNewStudyGroup({ ...newStudyGroup, project: e.target.value })}
                  placeholder="my-awesome-project"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateStudyGroup} className="flex-1">
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
          placeholder="Search study groups by name, description, or tech..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Study Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudyGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.leader.avatar} />
                  <AvatarFallback>{group.leader.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {group.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{group.project.repo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{group.members}/{group.maxMembers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{group.project.stars}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={group.isJoined ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleJoinStudyGroup(group.id)}
                  className="flex-1"
                  disabled={!group.isJoined && group.members >= group.maxMembers}
                >
                  {group.isJoined ? 'Leave' : group.members >= group.maxMembers ? 'Full' : 'Join'}
                </Button>
                {group.isJoined && (
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudyGroups.length === 0 && (
        <div className="text-center py-12">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Study Groups found</h3>
          <p className="text-muted-foreground">Try adjusting your search or create a new study group</p>
        </div>
      )}
    </div>
  );
};

export default StudyGroupsPage;