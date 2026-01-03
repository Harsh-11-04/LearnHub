import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Flag, AlertTriangle } from 'lucide-react';
import { reportService, REPORT_REASONS } from '@/services/report.service';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface ReportButtonProps {
    type: 'resource' | 'comment';
    targetId: string;
    variant?: 'ghost' | 'outline';
    size?: 'sm' | 'default' | 'icon';
}

export const ReportButton = ({ type, targetId, variant = 'ghost', size = 'sm' }: ReportButtonProps) => {
    const { user } = useAppContext();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toast.error('Please select a reason');
            return;
        }

        setSubmitting(true);
        let success = false;

        if (type === 'resource') {
            success = await reportService.reportResource(targetId, reason, description);
        } else {
            success = await reportService.reportComment(targetId, reason, description);
        }

        if (success) {
            toast.success('Report submitted. Thank you for helping keep our community safe!');
            setOpen(false);
            setReason('');
            setDescription('');
        } else {
            toast.error('Failed to submit report');
        }
        setSubmitting(false);
    };

    if (!user) {
        return (
            <Button
                variant={variant}
                size={size}
                className="text-muted-foreground"
                onClick={() => toast.error('Please sign in to report content')}
            >
                <Flag className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} className="text-muted-foreground hover:text-destructive">
                    <Flag className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Report {type === 'resource' ? 'Resource' : 'Comment'}
                    </DialogTitle>
                    <DialogDescription>
                        Help us understand what's wrong with this content. Reports are reviewed by our moderation team.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason for reporting*</label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Additional details (optional)</label>
                        <Textarea
                            placeholder="Provide more context about why you're reporting this content..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={submitting || !reason}
                    >
                        {submitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportButton;
