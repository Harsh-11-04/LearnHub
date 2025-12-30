import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Play,
    Moon,
    Sun,
    Video,
    Mic,
    MicOff,
    VideoOff,
    Send,
    Code2,
    Users,
    ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
];

const defaultCode = {
    javascript: '// Write your JavaScript code here\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();',
    typescript: '// Write your TypeScript code here\nfunction hello(): void {\n  console.log("Hello, World!");\n}\n\nhello();',
    python: '# Write your Python code here\ndef hello():\n    print("Hello, World!")\n\nhello()',
    java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    cpp: '// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    go: '// Write your Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    rust: '// Write your Rust code here\nfn main() {\n    println!("Hello, World!");\n}',
};

export default function DemoCodeSpace() {
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
    const [code, setCode] = useState(defaultCode[language as keyof typeof defaultCode]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [message, setMessage] = useState('');

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setCode(defaultCode[newLang as keyof typeof defaultCode]);
    };

    const handleRunCode = () => {
        console.log('Running code:', code);
        // Placeholder for code execution
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Demo Banner */}
            <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 flex-shrink-0">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-primary/40">DEMO MODE</Badge>
                        <p className="text-xs text-muted-foreground">
                            This is a preview of the CodeSpace collaboration feature
                        </p>
                    </div>
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-md px-4 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Code2 className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">Code Space</h1>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>2 online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                        >
                            {theme === 'vs-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>

                        <Button onClick={handleRunCode} className="gap-2">
                            <Play className="h-4 w-4" />
                            Run Code
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content: Split Pane */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: Video & Chat (30%) */}
                <div className="w-full lg:w-[30%] border-r border-border/40 flex flex-col bg-background/40">
                    {/* Video Grid */}
                    <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold mb-2">Participants</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden group">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={`https://github.com/shadcn.png`} />
                                            <AvatarFallback>U{i}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-2 left-2 text-xs font-medium bg-background/80 px-2 py-1 rounded">
                                            User {i}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Video Controls */}
                        <div className="flex gap-2 justify-center pt-2">
                            <Button
                                variant={isMuted ? "destructive" : "outline"}
                                size="icon"
                                onClick={() => setIsMuted(!isMuted)}
                            >
                                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant={isVideoOff ? "destructive" : "outline"}
                                size="icon"
                                onClick={() => setIsVideoOff(!isVideoOff)}
                            >
                                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="flex-1 flex flex-col border-t border-border/40 p-4">
                        <h3 className="text-sm font-semibold mb-3">Chat</h3>

                        {/* Messages */}
                        <div className="flex-1 space-y-2 overflow-y-auto mb-3">
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">User 1:</span> Hey! Ready to code?
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">You:</span> Yes, let's start!
                            </div>
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        setMessage('');
                                    }
                                }}
                                className="text-sm"
                            />
                            <Button size="icon" variant="ghost">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Monaco Editor (70%) */}
                <div className="flex-1 flex flex-col">
                    <Editor
                        height="100%"
                        language={language}
                        theme={theme}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            tabSize: 2,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
