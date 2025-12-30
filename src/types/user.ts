export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    techStack?: string[];
    bio?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    password?: string; // Optional for registration payloads
    role?: 'user' | 'admin';
    status?: 'active' | 'banned';
    createdAt?: string;
}
