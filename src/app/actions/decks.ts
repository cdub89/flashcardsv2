'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { insertDeck, updateDeck, deleteDeck, getDeckById } from '@/db/queries/decks';

// ============================================================================
// CREATE DECK
// ============================================================================

const createDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  // 1. Validate input
  const result = createDeckSchema.safeParse(input);
  
  if (!result.success) {
    return { 
      success: false,
      error: 'Validation failed', 
      details: result.error.flatten().fieldErrors 
    };
  }
  
  const validatedData = result.data;
  
  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    // 3. Call mutation function from db/queries
    const deck = await insertDeck({
      userId,
      name: validatedData.name,
      description: validatedData.description,
    });
    
    // 4. Revalidate cache
    revalidatePath('/dashboard');
    
    return { success: true, data: deck };
  } catch (error) {
    console.error('Error creating deck:', error);
    return { success: false, error: 'Failed to create deck' };
  }
}

// ============================================================================
// UPDATE DECK
// ============================================================================

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name must be 255 characters or less').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  // 1. Validate input
  const result = updateDeckSchema.safeParse(input);
  
  if (!result.success) {
    return { 
      success: false,
      error: 'Validation failed', 
      details: result.error.flatten().fieldErrors 
    };
  }
  
  const validatedData = result.data;
  
  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    // 3. Verify ownership before updating
    const existingDeck = await getDeckById(validatedData.deckId, userId);
    if (!existingDeck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    // 4. Call mutation function from db/queries
    const deck = await updateDeck(
      validatedData.deckId,
      userId,
      {
        name: validatedData.name,
        description: validatedData.description,
      }
    );
    
    // 5. Revalidate cache
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
    
    return { success: true, data: deck };
  } catch (error) {
    console.error('Error updating deck:', error);
    return { success: false, error: 'Failed to update deck' };
  }
}

// ============================================================================
// DELETE DECK
// ============================================================================

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeckAction(input: DeleteDeckInput) {
  // 1. Validate input
  const result = deleteDeckSchema.safeParse(input);
  
  if (!result.success) {
    return { 
      success: false,
      error: 'Validation failed', 
      details: result.error.flatten().fieldErrors 
    };
  }
  
  const validatedData = result.data;
  
  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    // 3. Verify ownership before deleting
    const existingDeck = await getDeckById(validatedData.deckId, userId);
    if (!existingDeck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    // 4. Call mutation function from db/queries
    await deleteDeck(validatedData.deckId, userId);
    
    // 5. Revalidate cache
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting deck:', error);
    return { success: false, error: 'Failed to delete deck' };
  }
}

