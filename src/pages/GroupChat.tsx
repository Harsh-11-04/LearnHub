import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Users, Paperclip, Image, FileText, X, Download, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface GroupMessage {
    id: string;
    group_id: string;
    sender_id: string;
    sender_name?: string;
    sender_avatar?: string;
    content: string;
    message_type: 'text' | 'image' | 'file';
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    created_at: string;
}

const GroupChat = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [groupName, setGroupName] = useState('Group Chat');
    const [memberCount, setMemberCount] = useState(0);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load messages from Supabase
    useEffect(() => {
        if (!groupId || !isSupabaseConfigured || !supabase) return;

        const loadMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('group_messages')
                    .select(`
                        *,
                        profiles:sender_id (name, avatar_url)
                    `)
                    .eq('group_id', groupId)
                    .order('created_at', { ascending: true })
                    .limit(100);

                if (!error && data) {
                    setMessages(data.map(m => ({
                        ...m,
                        sender_name: m.profiles?.name || 'Unknown',
                        sender_avatar: m.profiles?.avatar_url
                    })));
                }

                // Load group info
                const { data: groupData } = await supabase
                    .from('study_groups')
                    .select('name, member_count')
                    .eq('id', groupId)
                    .single();

                if (groupData) {
                    setGroupName(groupData.name);
                    setMemberCount(groupData.member_count || 0);
                }
            } catch (err) {
                console.error('Error loading messages:', err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();

        // Real-time subscription
        const channel = supabase
            .channel(`group-${groupId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'group_messages',
                filter: `group_id=eq.${groupId}`
            }, async (payload) => {
                const newMsg = payload.new as GroupMessage;

                // Fetch sender info
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('name, avatar_url')
                    .eq('id', newMsg.sender_id)
                    .single();

                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, {
                        ...newMsg,
                        sender_name: profile?.name || 'Unknown',
                        sender_avatar: profile?.avatar_url
                    }];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', fileData?: any) => {
        if (!groupId || !user || !supabase) return;

        setSending(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                toast.error('Please login to send messages');
                return;
            }

            const messageData: any = {
                group_id: groupId,
                sender_id: userData.user.id,
                content: type === 'text' ? content : fileData?.fileName || '',
                message_type: type,
                ...(fileData && {
                    file_url: fileData.fileUrl,
                    file_name: fileData.fileName,
                    file_size: fileData.fileSize,
                    file_type: fileData.fileType
                })
            };

            const { error } = await supabase
                .from('group_messages')
                .insert(messageData);

            if (error) throw error;

            setNewMessage('');
            toast.success(type === 'text' ? 'Message sent!' : 'File shared!');
        } catch (err: any) {
            console.error('Error sending message:', err);
            toast.error(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'image' | 'file') => {
        if (!supabase) return;

        setShowAttachMenu(false);
        setUploadProgress(10);

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `group-files/${groupId}/${fileName}`;

            setUploadProgress(30);

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setUploadProgress(70);

            const { data: urlData } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath);

            setUploadProgress(100);

            await sendMessage('', type, {
                fileUrl: urlData.publicUrl,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            setUploadProgress(0);
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error('Failed to upload file');
            setUploadProgress(0);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderMessage = (msg: GroupMessage, index: number) => {
        const isMe = msg.sender_id === user?.id;
        const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

        return (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
            >
                {showAvatar && !isMe ? (
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender_avatar} />
                        <AvatarFallback>{msg.sender_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="w-8" />
                )}

                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && !isMe && (
                        <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender_name}</p>
                    )}

                    <div className={`rounded-2xl overflow-hidden ${isMe
                            ? 'bg-green-600 text-white rounded-tr-md'
                            : 'bg-secondary rounded-tl-md'
                        }`}>
                        {/* Text Message */}
                        {msg.message_type === 'text' && (
                            <p className="px-4 py-2 text-sm">{msg.content}</p>
                        )}

                        {/* Image Message */}
                        {msg.message_type === 'image' && msg.file_url && (
                            <div className="p-1">
                                <img
                                    src={msg.file_url}
                                    alt={msg.file_name}
                                    className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(msg.file_url, '_blank')}
                                />
                            </div>
                        )}

                        {/* File Message */}
                        {msg.message_type === 'file' && msg.file_url && (
                            <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 px-4 py-3 hover:opacity-80 ${isMe ? 'bg-green-700' : 'bg-secondary/80'
                                    }`}
                            >
                                <FileText className="h-10 w-10 p-2 rounded-lg bg-white/20" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{msg.file_name}</p>
                                    <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>
                                </div>
                                <Download className="h-5 w-5" />
                            </a>
                        )}
                    </div>

                    <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                        {isMe && <CheckCheck className="h-3 w-3 text-blue-400" />}
                    </div>
                </div>
            </motion.div>
        );
    };

    if (!groupId) {
        return (
            <PageTransition className="container mx-auto px-4 py-10 text-center">
                <p>No group selected</p>
                <Button onClick={() => navigate('/groups')} className="mt-4">Back to Groups</Button>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="container mx-auto px-4 py-4 max-w-4xl h-[calc(100vh-100px)] flex flex-col">
            {/* WhatsApp-style Header */}
            <div className="bg-green-600 text-white rounded-t-xl p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/groups')} className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 border-2 border-white/30">
                    <AvatarFallback className="bg-green-700">{groupName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="font-semibold">{groupName}</h1>
                    <p className="text-xs text-green-100 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {memberCount} members
                    </p>
                </div>
            </div>

            {/* Messages Area with Chat Background */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{
                    backgroundColor: '#0b141a',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="bg-green-500/20 p-4 rounded-full mb-4">
                            <Users className="h-12 w-12 text-green-500" />
                        </div>
                        <p className="text-white">No messages yet</p>
                        <p className="text-sm text-gray-400">Be the first to say hello! 👋</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => renderMessage(msg, index))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
                <div className="px-4 py-2 bg-background border-t">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-background border-t p-3 rounded-b-xl">
                <div className="flex items-center gap-2">
                    {/* Attachment Menu */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAttachMenu(!showAttachMenu)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        <AnimatePresence>
                            {showAttachMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-12 left-0 bg-card border rounded-lg p-2 shadow-lg flex gap-2"
                                >
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="bg-green-500/20 hover:bg-green-500/30 text-green-500"
                                    >
                                        <Image className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-500"
                                    >
                                        <FileText className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(newMessage)}
                        disabled={sending}
                        className="flex-1 rounded-full bg-secondary border-0"
                    />

                    <Button
                        onClick={() => sendMessage(newMessage)}
                        disabled={!newMessage.trim() || sending}
                        className="rounded-full bg-green-500 hover:bg-green-600"
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                {/* Hidden File Inputs */}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'file')}
                />
            </div>
        </PageTransition>
    );
};

export default GroupChat;
