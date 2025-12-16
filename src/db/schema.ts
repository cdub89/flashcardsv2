import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Decks table - each user can create multiple decks
export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cards table - each deck has multiple cards
export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer("deck_id").notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(), // Front of the card (e.g., "Dog" or "When was the battle of hastings?")
  back: text().notNull(), // Back of the card (e.g., "Anjing" or "1066")
  correctCount: integer("correct_count").default(0).notNull(), // Number of correct answers
  incorrectCount: integer("incorrect_count").default(0).notNull(), // Number of incorrect answers
  lastStudied: timestamp("last_studied"), // Last time this card was studied
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
