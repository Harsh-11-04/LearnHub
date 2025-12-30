
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
    Users
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

const ROOM_ID = 'demo-room';

export default function CodeSpace() {
    const { user } = useAppContext();
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
    const [code, setCode] = useState(defaultCode['javascript']);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ sender: string, content: string }[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !supabase) return;

        const channel = supabase.channel(`room:${ROOM_ID}`)
            .on('broadcast', { event: 'code-update' }, (payload) => {
                if (payload.payload.sender !== user.id) {
                    setCode(payload.payload.content);
                }
            })
            .on('broadcast', { event: 'chat-message' }, (payload) => {
                setMessages(prev => [...prev, payload.payload]);
            })
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const presenceUsers = Object.values(state).flat();
                setUsers(presenceUsers);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        online_at: new Date().toISOString(),
                    });
                    toast.success('Connected to CodeSpace Live');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleCodeChange = async (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);

        // Broadcast code change
        await supabase?.channel(`room:${ROOM_ID}`).send({
            type: 'broadcast',
            event: 'code-update',
            payload: { content: newCode, sender: user?.id }
        });
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !user) return;
        const msg = { sender: user.name, content: message };
        setMessages(prev => [...prev, msg]);
        setMessage('');

        await supabase?.channel(`room:${ROOM_ID}`).send({
            type: 'broadcast',
            event: 'chat-message',
            payload: msg
        });
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setCode(defaultCode[newLang as keyof typeof defaultCode]);
    };

    const handleRunCode = () => {
        console.log('Running code:', code);
        toast.info("Code execution simulation: Output will appear in console");
    };

    return (
        <PageTransition className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-md px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Code2 className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">Code Space <span className="text-xs font-normal text-muted-foreground ml-2">(Live Sync)</span></h1>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-4 bg-muted px-2 py-1 rounded-full">
                            <Users className="h-3 w-3" />
                            <span>{users.length} online</span>
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
                        <h3 className="text-sm font-semibold mb-2">Participants ({users.length})</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {users.map((u, i) => (
                                <motion.div
                                    key={u.id || i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden group">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={u.avatar} />
                                            <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-2 left-2 text-xs font-medium bg-background/80 px-2 py-1 rounded">
                                            {u.name} {u.id === user?.id && '(You)'}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                            {users.length === 0 && <div className="text-xs text-muted-foreground col-span-2 text-center py-4">Connecting to room...</div>}
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
                        <h3 className="text-sm font-semibold mb-3">Room Chat</h3>

                        {/* Messages */}
                        <div className="flex-1 space-y-2 overflow-y-auto mb-3 pr-2">
                            {messages.map((msg, i) => (
                                <div key={i} className="text-xs text-muted-foreground break-words">
                                    <span className={`font-medium ${msg.sender === user?.name ? 'text-primary' : ''}`}>
                                        {msg.sender}:
                                    </span> {msg.content}
                                </div>
                            ))}
                            {messages.length === 0 && <div className="text-xs text-muted-foreground italic">No messages yet</div>}
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="text-sm"
                            />
                            <Button size="icon" variant="ghost" onClick={handleSendMessage}>
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
                        onChange={handleCodeChange}
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
        </PageTransition>
    );
}
