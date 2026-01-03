import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Tag, tagService } from '@/services/tag.service';
import { cn } from '@/lib/utils';

interface TagInputProps {
    resourceId?: string;
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    readOnly?: boolean;
    className?: string;
}

export const TagInput = ({
    resourceId,
    selectedTags,
    onTagsChange,
    readOnly = false,
    className
}: TagInputProps) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [popularTags, setPopularTags] = useState<Tag[]>([]);

    useEffect(() => {
        const loadPopular = async () => {
            const tags = await tagService.getPopular(8);
            setPopularTags(tags);
        };
        loadPopular();
    }, []);

    useEffect(() => {
        const searchTags = async () => {
            if (input.length >= 2) {
                const results = await tagService.search(input);
                setSuggestions(results.filter(t =>
                    !selectedTags.find(st => st.id === t.id)
                ));
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        };
        searchTags();
    }, [input, selectedTags]);

    const handleAddTag = async (tag: Tag) => {
        if (!selectedTags.find(t => t.id === tag.id)) {
            onTagsChange([...selectedTags, tag]);
            if (resourceId) {
                await tagService.addToResource(resourceId, tag.id);
            }
        }
        setInput('');
        setShowSuggestions(false);
    };

    const handleCreateTag = async () => {
        if (input.trim().length >= 2) {
            const newTag = await tagService.create(input.trim());
            if (newTag) {
                handleAddTag(newTag);
            }
        }
    };

    const handleRemoveTag = async (tag: Tag) => {
        onTagsChange(selectedTags.filter(t => t.id !== tag.id));
        if (resourceId) {
            await tagService.removeFromResource(resourceId, tag.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length > 0) {
                handleAddTag(suggestions[0]);
            } else if (input.trim().length >= 2) {
                handleCreateTag();
            }
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                    <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                    >
                        <TagIcon className="h-3 w-3" />
                        {tag.name}
                        {!readOnly && (
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </Badge>
                ))}
            </div>

            {/* Input */}
            {!readOnly && (
                <div className="relative">
                    <Input
                        placeholder="Add tags..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => input.length >= 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
                            {suggestions.map(tag => (
                                <button
                                    key={tag.id}
                                    className="w-full px-3 py-2 text-left hover:bg-muted flex justify-between items-center"
                                    onMouseDown={() => handleAddTag(tag)}
                                >
                                    <span>{tag.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {tag.usageCount} uses
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Create new tag option */}
                    {showSuggestions && suggestions.length === 0 && input.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
                            <button
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                                onMouseDown={handleCreateTag}
                            >
                                <Plus className="h-4 w-4" />
                                Create "{input}"
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Popular Tags */}
            {!readOnly && selectedTags.length === 0 && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Popular tags:</p>
                    <div className="flex flex-wrap gap-1">
                        {popularTags
                            .filter(t => !selectedTags.find(st => st.id === t.id))
                            .slice(0, 6)
                            .map(tag => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-secondary"
                                    onClick={() => handleAddTag(tag)}
                                >
                                    + {tag.name}
                                </Badge>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagInput;
