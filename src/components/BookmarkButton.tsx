import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { bookmarkService } from '@/services/bookmark.service';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
    resourceId: string;
    variant?: 'ghost' | 'outline' | 'default';
    size?: 'sm' | 'default' | 'icon';
    showLabel?: boolean;
    className?: string;
}

export const BookmarkButton = ({
    resourceId,
    variant = 'ghost',
    size = 'sm',
    showLabel = false,
    className
}: BookmarkButtonProps) => {
    const { user } = useAppContext();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkBookmark = async () => {
            if (user) {
                const result = await bookmarkService.isBookmarked(resourceId);
                setIsBookmarked(result);
            }
        };
        checkBookmark();
    }, [resourceId, user]);

    const handleToggle = async () => {
        if (!user) {
            toast.error('Please sign in to bookmark resources');
            return;
        }

        setLoading(true);
        const success = await bookmarkService.toggle(resourceId, isBookmarked);

        if (success) {
            setIsBookmarked(!isBookmarked);
            toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
        } else {
            toast.error('Failed to update bookmark');
        }
        setLoading(false);
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                isBookmarked
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-muted-foreground hover:text-yellow-500',
                className
            )}
        >
            {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" fill="currentColor" />
            ) : (
                <Bookmark className="h-4 w-4" />
            )}
            {showLabel && (
                <span className="ml-1">{isBookmarked ? 'Saved' : 'Save'}</span>
            )}
        </Button>
    );
};

export default BookmarkButton;
