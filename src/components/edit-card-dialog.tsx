'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateCardAction } from '@/app/actions/cards';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  currentFront: string;
  currentBack: string;
  trigger?: React.ReactNode;
}

export function EditCardDialog({ 
  cardId,
  deckId,
  currentFront, 
  currentBack, 
  trigger 
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(currentFront);
  const [back, setBack] = useState(currentBack);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await updateCardAction({
        cardId,
        deckId,
        front,
        back,
      });

      if (result.success) {
        setOpen(false);
        toast.success('Card updated successfully!');
        router.refresh();
      } else {
        setError(result.error || 'Failed to update card');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error updating card:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setFront(currentFront);
      setBack(currentBack);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Card</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the front and back of your flashcard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="front">
                Front <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="front"
                placeholder="Enter the question or term..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="back">
                Back <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="back"
                placeholder="Enter the answer or definition..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

