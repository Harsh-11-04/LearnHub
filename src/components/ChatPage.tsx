import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { Send, Search, Plus, MessageCircle, Users } from 'lucide-react';
import PageTransition from './PageTransition';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface UserPresence {
  user_id: string;
  online_at: string;
}

// Fixed room for demo "Global Chat"
const GLOBAL_ROOM = 'global-chat';

const ChatPage: React.FC = () => {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;

    // Join the channel
    const channel = supabase.channel(GLOBAL_ROOM)
      .on('broadcast', { event: 'message' }, (payload) => {
        const newMsg = payload.payload as Message;
        setMessages((prev) => [...prev, { ...newMsg, isOwn: newMsg.sender_id === user.id }]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !supabase) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      sender_name: user.name,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      isOwn: true
    };

    // Optimistic update
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');

    // Broadcast to others
    await supabase.channel(GLOBAL_ROOM).send({
      type: 'broadcast',
      event: 'message',
      payload: msg
    });
  };

  return (
    <PageTransition className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Using simplified layout for Global Chat */}
      <div className="w-80 border-r bg-background/50 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Channels
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            <div className="p-3 rounded-lg bg-accent cursor-pointer">
              <div className="font-medium"># global-chat</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                {onlineUsers} online
              </div>
            </div>
            <div className="p-3 rounded-lg hover:bg-muted/50 cursor-not-allowed opacity-50">
              <div className="font-medium"># react-devs (Locked)</div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background/30 backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b bg-background/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h3 className="font-semibold">Global Chat</h3>
              <p className="text-xs text-muted-foreground">Real-time Advanced Communication</p>
            </div>
          </div>
          {!isConnected && <span className="text-xs text-yellow-500">Connecting...</span>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10">
              <p>Welcome to the global chat!</p>
              <p className="text-sm">Say hello to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isOwn && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarFallback>{msg.sender_name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                  {!msg.isOwn && <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender_name}</p>}
                  <div
                    className={`p-3 rounded-2xl ${msg.isOwn
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                      }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-1 text-right">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-md">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-background/50"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChatPage;
