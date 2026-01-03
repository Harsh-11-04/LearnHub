import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Reply, Trash2, Edit2, Send } from 'lucide-react';
import { Comment, commentService } from '@/services/comment.service';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface CommentSectionProps {
    resourceId: string;
}

export const CommentSection = ({ resourceId }: CommentSectionProps) => {
    const { user } = useAppContext();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Load comments
    useState(() => {
        const loadComments = async () => {
            const data = await commentService.getByResource(resourceId);
            setComments(data);
            setLoading(false);
        };
        loadComments();
    });

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        if (!user) {
            toast.error('Please sign in to comment');
            return;
        }

        setSubmitting(true);
        const comment = await commentService.add(resourceId, newComment);
        if (comment) {
            setComments([...comments, comment]);
            setNewComment('');
            toast.success('Comment added!');
        } else {
            toast.error('Failed to add comment');
        }
        setSubmitting(false);
    };

    const handleReply = async (parentId: string) => {
        if (!replyContent.trim()) return;
        if (!user) {
            toast.error('Please sign in to reply');
            return;
        }

        setSubmitting(true);
        const reply = await commentService.add(resourceId, replyContent, parentId);
        if (reply) {
            setComments(comments.map(c =>
                c.id === parentId
                    ? { ...c, replies: [...(c.replies || []), reply] }
                    : c
            ));
            setReplyTo(null);
            setReplyContent('');
            toast.success('Reply added!');
        } else {
            toast.error('Failed to add reply');
        }
        setSubmitting(false);
    };

    const handleDelete = async (commentId: string, parentId?: string) => {
        const success = await commentService.delete(commentId);
        if (success) {
            if (parentId) {
                setComments(comments.map(c =>
                    c.id === parentId
                        ? { ...c, replies: c.replies?.filter(r => r.id !== commentId) }
                        : c
                ));
            } else {
                setComments(comments.filter(c => c.id !== commentId));
            }
            toast.success('Comment deleted');
        }
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
        <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>{comment.userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        {user?.id === comment.userId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(comment.id, isReply ? comment.parentId : undefined)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                </div>
                {!isReply && user && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 text-xs"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    >
                        <Reply className="h-3 w-3 mr-1" /> Reply
                    </Button>
                )}

                {/* Reply input */}
                {replyTo === comment.id && (
                    <div className="flex gap-2 mt-2 ml-10">
                        <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            disabled={submitting || !replyContent.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Replies */}
                {comment.replies?.map(reply => (
                    <CommentItem key={reply.id} comment={reply} isReply />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({comments.length})
            </h3>

            {/* New comment input */}
            {user ? (
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[60px]"
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !newComment.trim()}
                            className="self-end"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Sign in to add a comment
                </p>
            )}

            {/* Comments list */}
            {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                    No comments yet. Be the first!
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
