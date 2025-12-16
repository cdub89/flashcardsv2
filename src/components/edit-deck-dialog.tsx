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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateDeckAction, deleteDeckAction } from '@/app/actions/decks';
import { useRouter } from 'next/navigation';

interface EditDeckDialogProps {
  deckId: number;
  currentName: string;
  currentDescription?: string | null;
  trigger?: React.ReactNode;
}

export function EditDeckDialog({ 
  deckId, 
  currentName, 
  currentDescription, 
  trigger 
}: EditDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await updateDeckAction({
        deckId,
        name,
        description: description || null,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update deck');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error updating deck:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteDeckAction({ deckId });

      if (result.success) {
        setDeleteDialogOpen(false);
        setOpen(false);
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete deck');
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error deleting deck:', err);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setName(currentName);
      setDescription(currentDescription || '');
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Deck</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>
              Update the name and description of your deck.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name">
                Deck Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter deck name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={255}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this deck..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1 flex justify-start">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting || isDeleting}
              >
                Delete Deck
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deck{' '}
              <span className="font-semibold">&quot;{currentName}&quot;</span> and all{' '}
              {/* Add card count if available */}
              cards associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Deck'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

