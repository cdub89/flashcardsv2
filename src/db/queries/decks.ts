import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';

/**
 * Get all decks for a specific user, ordered by creation date (newest first)
 */
export async function getDecksByUserId(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));
}

/**
 * Get a single deck by ID and userId (for authorization)
 */
export async function getDeckById(deckId: number, userId: string) {
  const result = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  return result[0];
}

/**
 * Get the card count for a specific deck
 */
export async function getCardCountByDeckId(deckId: number) {
  const result = await db
    .select({ count: count() })
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
  
  return result[0]?.count || 0;
}

/**
 * Get decks with their card counts for a specific user
 */
export async function getDecksWithCardCounts(userId: string) {
  const decks = await getDecksByUserId(userId);
  
  const deckStats = await Promise.all(
    decks.map(async (deck) => {
      const cardCount = await getCardCountByDeckId(deck.id);
      
      return {
        ...deck,
        cardCount,
      };
    })
  );
  
  return deckStats;
}

/**
 * Insert a new deck
 */
export async function insertDeck(data: {
  userId: string;
  name: string;
  description?: string | null;
}) {
  const result = await db.insert(decksTable).values({
    userId: data.userId,
    name: data.name,
    description: data.description,
  }).returning();
  
  return result[0];
}

/**
 * Update an existing deck
 */
export async function updateDeck(
  deckId: number,
  userId: string,
  data: { name?: string; description?: string | null }
) {
  const result = await db.update(decksTable)
    .set({ 
      ...data, 
      updatedAt: new Date() 
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return result[0];
}

/**
 * Delete a deck (cards will be cascade deleted)
 */
export async function deleteDeck(deckId: number, userId: string) {
  await db.delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
}

