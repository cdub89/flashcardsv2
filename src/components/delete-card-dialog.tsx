'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteCardAction } from '@/app/actions/cards';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DeleteCardDialogProps {
  cardId: number;
  deckId: number;
  cardFront: string;
  trigger?: React.ReactNode;
}

export function DeleteCardDialog({ 
  cardId,
  deckId,
  cardFront,
  trigger 
}: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteCardAction({
        cardId,
        deckId,
      });

      if (result.success) {
        setOpen(false);
        toast.success('Card deleted successfully!');
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete card');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error deleting card:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || <Button variant="destructive">Delete Card</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this card? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm font-medium mb-1">Card Front:</p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {cardFront}
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Card'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

