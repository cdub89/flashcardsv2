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
import { createCardAction } from '@/app/actions/cards';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AddCardDialogProps {
  deckId: number;
  trigger?: React.ReactNode;
}

export function AddCardDialog({ deckId, trigger }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createCardAction({
        deckId,
        front,
        back,
      });

      if (result.success) {
        // Reset form and close dialog
        setFront('');
        setBack('');
        setOpen(false);
        toast.success('Card created successfully!');
        router.refresh();
      } else {
        setError(result.error || 'Failed to create card');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error creating card:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Card</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>
              Create a new flashcard for this deck. Fill in the front and back of the card.
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
              {isSubmitting ? 'Creating...' : 'Create Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

