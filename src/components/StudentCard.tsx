import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, Eye } from 'lucide-react';

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

interface StudentCardProps {
    student: Student;
    onConnect: (id: string) => void;
    onViewProfile: (id: string) => void;
}

export function StudentCard({ student, onConnect, onViewProfile }: StudentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="p-6 bg-background/60 backdrop-blur-md hover:border-primary/40 transition-all h-full flex flex-col">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center text-center space-y-3 mb-4">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="text-2xl font-bold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {student.year}{student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year • {student.college}
                        </p>
                    </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2 flex-grow">
                    {student.bio}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {student.techStack.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                        </Badge>
                    ))}
                    {student.techStack.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                            +{student.techStack.length - 4}
                        </Badge>
                    )}
                </div>

                {/* Connections */}
                <p className="text-xs text-center text-muted-foreground mb-4">
                    {student.connections} connections
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => onConnect(student.id)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProfile(student.id)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
