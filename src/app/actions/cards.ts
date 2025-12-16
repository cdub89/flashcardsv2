'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { insertCard, updateCard, deleteCard, getCardById, recordAnswer } from '@/db/queries/cards';
import { getDeckById } from '@/db/queries/decks';

// ============================================================================
// CREATE CARD
// ============================================================================

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, 'Card front is required').max(5000, 'Card front must be 5000 characters or less'),
  back: z.string().min(1, 'Card back is required').max(5000, 'Card back must be 5000 characters or less'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCardAction(input: CreateCardInput) {
  // 1. Validate input
  const result = createCardSchema.safeParse(input);
  
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
    // 3. Verify user owns the deck (cascading authorization)
    const deck = await getDeckById(validatedData.deckId, userId);
    if (!deck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    // 4. Call mutation function from db/queries
    const card = await insertCard({
      deckId: validatedData.deckId,
      front: validatedData.front,
      back: validatedData.back,
    });
    
    // 5. Revalidate cache
    revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
    revalidatePath('/dashboard');
    
    return { success: true, data: card };
  } catch (error) {
    console.error('Error creating card:', error);
    return { success: false, error: 'Failed to create card' };
  }
}

// ============================================================================
// UPDATE CARD
// ============================================================================

const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(), // Required to verify deck ownership
  front: z.string().min(1, 'Card front is required').max(5000, 'Card front must be 5000 characters or less').optional(),
  back: z.string().min(1, 'Card back is required').max(5000, 'Card back must be 5000 characters or less').optional(),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCardAction(input: UpdateCardInput) {
  // 1. Validate input
  const result = updateCardSchema.safeParse(input);
  
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
    // 3. Verify user owns the deck (cascading authorization)
    const deck = await getDeckById(validatedData.deckId, userId);
    if (!deck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    // 4. Verify card exists and belongs to the deck
    const existingCard = await getCardById(validatedData.cardId);
    if (!existingCard || existingCard.deckId !== validatedData.deckId) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }
    
    // 5. Call mutation function from db/queries
    const card = await updateCard(
      validatedData.cardId,
      {
        front: validatedData.front,
        back: validatedData.back,
      }
    );
    
    // 6. Revalidate cache
    revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
    
    return { success: true, data: card };
  } catch (error) {
    console.error('Error updating card:', error);
    return { success: false, error: 'Failed to update card' };
  }
}

// ============================================================================
// DELETE CARD
// ============================================================================

const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(), // Required to verify deck ownership
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCardAction(input: DeleteCardInput) {
  // 1. Validate input
  const result = deleteCardSchema.safeParse(input);
  
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
    // 3. Verify user owns the deck (cascading authorization)
    const deck = await getDeckById(validatedData.deckId, userId);
    if (!deck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    // 4. Verify card exists and belongs to the deck
    const existingCard = await getCardById(validatedData.cardId);
    if (!existingCard || existingCard.deckId !== validatedData.deckId) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }
    
    // 5. Call mutation function from db/queries
    await deleteCard(validatedData.cardId);
    
    // 6. Revalidate cache
    revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting card:', error);
    return { success: false, error: 'Failed to delete card' };
  }
}

// ============================================================================
// RECORD ANSWER
// ============================================================================

const recordAnswerSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(), // Required to verify deck ownership
  isCorrect: z.boolean(),
});

export type RecordAnswerInput = z.infer<typeof recordAnswerSchema>;

export async function recordAnswerAction(input: RecordAnswerInput) {
  // 1. Validate input
  const result = recordAnswerSchema.safeParse(input);
  
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
    // 3. Verify user owns the deck (cascading authorization)
    const deck = await getDeckById(validatedData.deckId, userId);
    if (!deck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    // 4. Verify card exists and belongs to the deck
    const existingCard = await getCardById(validatedData.cardId);
    if (!existingCard || existingCard.deckId !== validatedData.deckId) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }
    
    // 5. Call mutation function from db/queries
    const card = await recordAnswer(
      validatedData.cardId,
      validatedData.isCorrect
    );
    
    // 6. Revalidate cache
    revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
    revalidatePath(`/dashboard/decks/${validatedData.deckId}/study`);
    
    return { success: true, data: card };
  } catch (error) {
    console.error('Error recording answer:', error);
    return { success: false, error: 'Failed to record answer' };
  }
}

