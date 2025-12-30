import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentCard } from '@/components/StudentCard';
import { Search, Filter, Users } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

interface Student {
    id: string;
    name: string;
    avatar?: string;
    year: 1 | 2 | 3 | 4;
    college: string;
    techStack: string[];
    bio: string;
    connections: number;
}

// Mock data
const mockStudents: Student[] = [
    {
        id: '1',
        name: 'Alice Chen',
        avatar: 'https://github.com/shadcn.png',
        year: 3,
        college: 'MIT',
        techStack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        bio: 'Full-stack developer passionate about building scalable web applications. Love collaborating on open-source projects!',
        connections: 156
    },
    {
        id: '2',
        name: 'Bob Kumar',
        year: 2,
        college: 'Stanford',
        techStack: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch'],
        bio: 'AI/ML enthusiast exploring deep learning and computer vision. Always excited to discuss neural networks!',
        connections: 142
    },
    {
        id: '3',
        name: 'Charlie Lee',
        year: 4,
        college: 'Berkeley',
        techStack: ['Java', 'Spring Boot', 'Kubernetes', 'AWS'],
        bio: 'Backend engineer focused on microservices architecture and cloud infrastructure. DevOps advocate.',
        connections: 198
    },
    {
        id: '4',
        name: 'Diana Smith',
        year: 1,
        college: 'CMU',
        techStack: ['JavaScript', 'React', 'Next.js', 'Tailwind'],
        bio: 'Frontend developer creating beautiful, accessible user interfaces. Design systems enthusiast.',
        connections: 89
    },
    {
        id: '5',
        name: 'Ethan Brown',
        year: 3,
        college: 'Georgia Tech',
        techStack: ['C++', 'Algorithms', 'Data Structures', 'Competitive Programming'],
        bio: 'Competitive programmer and algorithm geek. Love solving complex problems and optimizing code.',
        connections: 124
    },
    {
        id: '6',
        name: 'Fiona Wang',
        year: 2,
        college: 'Caltech',
        techStack: ['Flutter', 'Dart', 'Firebase', 'React Native'],
        bio: 'Mobile app developer building cross-platform applications. UI/UX design is my passion!',
        connections: 167
    }
];

const techStackOptions = [
    'React', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++',
    'Node.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'Flutter', 'Next.js', 'Spring Boot'
];

export default function PeerMatch() {
    const [students] = useState<Student[]>(mockStudents);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleConnect = (id: string) => {
        const student = students.find(s => s.id === id);
        toast.success(`Connection request sent to ${student?.name}!`);
    };

    const handleViewProfile = (id: string) => {
        const student = students.find(s => s.id === id);
        toast.info(`Viewing ${student?.name}'s profile`);
    };

    const toggleTechStack = (tech: string) => {
        setSelectedTechStack(prev =>
            prev.includes(tech)
                ? prev.filter(t => t !== tech)
                : [...prev, tech]
        );
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.college.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTech = selectedTechStack.length === 0 ||
            selectedTechStack.some(tech => student.techStack.includes(tech));
        const matchesYear = selectedYear === null || student.year === selectedYear;

        return matchesSearch && matchesTech && matchesYear;
    });

    return (
        <PageTransition className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary" />
                            Find Your Peers
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Connect with {students.length} students across top universities
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <Card className="p-4 bg-background/60 backdrop-blur-md">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or college..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t"
                        >
                            {/* Year Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Year</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((year) => (
                                        <Button
                                            key={year}
                                            variant={selectedYear === year ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                                        >
                                            {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'}
                                        </Button>
                                    ))}
                                    {selectedYear && (
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedYear(null)}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Tech Stack Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tech Stack</label>
                                <div className="flex flex-wrap gap-2">
                                    {techStackOptions.map((tech) => (
                                        <Badge
                                            key={tech}
                                            variant={selectedTechStack.includes(tech) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleTechStack(tech)}
                                        >
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredStudents.length} of {students.length} students
                </p>
                {(selectedTechStack.length > 0 || selectedYear !== null) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedTechStack([]);
                            setSelectedYear(null);
                        }}
                    >
                        Clear all filters
                    </Button>
                )}
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <StudentCard
                            student={student}
                            onConnect={handleConnect}
                            onViewProfile={handleViewProfile}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
                <Card className="p-12 text-center bg-background/40">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No students found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your filters or search query
                    </p>
                </Card>
            )}
        </PageTransition>
    );
}
