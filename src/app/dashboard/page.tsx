import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Flashcards</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to access your dashboard
        </p>
      </div>
    );
  }

  // Fetch user's decks
  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.createdAt);

  // Fetch card counts for each deck
  const deckStats = await Promise.all(
    decks.map(async (deck) => {
      const cardCount = await db
        .select({ count: count() })
        .from(cardsTable)
        .where(eq(cardsTable.deckId, deck.id));
      
      return {
        ...deck,
        cardCount: cardCount[0]?.count || 0,
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your flashcard decks and track your progress
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/decks/new">Create New Deck</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Decks</div>
          <div className="text-3xl font-bold">{decks.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Cards</div>
          <div className="text-3xl font-bold">
            {deckStats.reduce((sum, deck) => sum + deck.cardCount, 0)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-1">
            Average Cards per Deck
          </div>
          <div className="text-3xl font-bold">
            {decks.length > 0
              ? Math.round(
                  deckStats.reduce((sum, deck) => sum + deck.cardCount, 0) /
                    decks.length
                )
              : 0}
          </div>
        </div>
      </div>

      {/* Decks List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Decks</h2>
        {deckStats.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You don't have any decks yet
            </p>
            <Button asChild>
              <Link href="/dashboard/decks/new">Create Your First Deck</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deckStats.map((deck) => (
              <Link
                key={deck.id}
                href={`/dashboard/decks/${deck.id}`}
                className="block"
              >
                <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer h-full">
                  <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                  {deck.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(deck.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

