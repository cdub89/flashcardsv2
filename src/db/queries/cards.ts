import { db } from '@/db';
import { cardsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get all cards for a specific deck
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.createdAt);
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

