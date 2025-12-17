import { db } from '@/db';
import { cardsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Get all cards for a specific deck
 * Sorted by updatedAt in descending order (newest/recently updated first)
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

/**
 * Get a single card by ID
 */
export async function getCardById(cardId: number) {
  const result = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .limit(1);
  
  return result[0];
}

/**
 * Insert a new card
 */
export async function insertCard(data: {
  deckId: number;
  front: string;
  back: string;
}) {
  const result = await db.insert(cardsTable).values({
    deckId: data.deckId,
    front: data.front,
    back: data.back,
  }).returning();
  
  return result[0];
}

/**
 * Update an existing card
 */
export async function updateCard(
  cardId: number,
  data: { front?: string; back?: string }
) {
  const result = await db.update(cardsTable)
    .set({ 
      ...data, 
      updatedAt: new Date() 
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return result[0];
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: number) {
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

/**
 * Record an answer for a card (correct or incorrect)
 */
export async function recordAnswer(
  cardId: number,
  isCorrect: boolean
) {
  const card = await getCardById(cardId);
  
  if (!card) {
    throw new Error('Card not found');
  }

  const result = await db.update(cardsTable)
    .set({
      correctCount: isCorrect 
        ? (card.correctCount || 0) + 1 
        : card.correctCount,
      incorrectCount: !isCorrect 
        ? (card.incorrectCount || 0) + 1 
        : card.incorrectCount,
      lastStudied: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return result[0];
}

