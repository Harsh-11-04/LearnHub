export interface Post {
    _id: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        techStack?: string[];
    };
    likes: string[]; // array of user ids
    tags: string[];
    createdAt: string;
    comments?: any[]; // Simplified for now
}
