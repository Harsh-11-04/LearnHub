import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { followService } from '@/services/follow.service';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    userId: string;
    initialFollowing?: boolean;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'default';
    className?: string;
}

export const FollowButton = ({
    userId,
    initialFollowing = false,
    variant = 'default',
    size = 'sm',
    className
}: FollowButtonProps) => {
    const { user } = useAppContext();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (user && userId !== user.id) {
                const result = await followService.isFollowing(userId);
                setIsFollowing(result);
            }
            setChecking(false);
        };
        checkStatus();
    }, [userId, user]);

    // Don't show button for own profile
    if (!user || user.id === userId) return null;

    const handleClick = async () => {
        setLoading(true);

        if (isFollowing) {
            const success = await followService.unfollow(userId);
            if (success) {
                setIsFollowing(false);
                toast.success('Unfollowed successfully');
            } else {
                toast.error('Failed to unfollow');
            }
        } else {
            const success = await followService.follow(userId);
            if (success) {
                setIsFollowing(true);
                toast.success('Following!');
            } else {
                toast.error('Failed to follow');
            }
        }

        setLoading(false);
    };

    if (checking) {
        return (
            <Button variant="outline" size={size} disabled className={className}>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    return (
        <Button
            variant={isFollowing ? 'outline' : variant}
            size={size}
            onClick={handleClick}
            disabled={loading}
            className={cn(
                isFollowing && 'hover:bg-destructive hover:text-destructive-foreground hover:border-destructive',
                className
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus className="h-4 w-4 mr-1" /> Unfollow
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4 mr-1" /> Follow
                </>
            )}
        </Button>
    );
};

export default FollowButton;
