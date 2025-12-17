import { auth } from "@clerk/nextjs/server";
import { getDecksWithCardCounts } from "@/db/queries/decks";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId, has } = await auth();

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

  // Fetch user's decks with card counts
  const deckStats = await getDecksWithCardCounts(userId);

  // Check billing features
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const has3DeckLimit = has({ feature: '3_deck_limit' });
  const deckLimit = hasUnlimitedDecks ? Infinity : 3;
  const isAtLimit = has3DeckLimit && deckStats.length >= 3;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your flashcard decks and track your progress
          </p>
        </div>
        <CreateDeckDialog />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Decks</div>
          <div className="text-3xl font-bold">
            {deckStats.length}
            {!hasUnlimitedDecks && (
              <span className="text-base text-muted-foreground ml-2">
                / {deckLimit}
              </span>
            )}
          </div>
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
            {deckStats.length > 0
              ? Math.round(
                  deckStats.reduce((sum, deck) => sum + deck.cardCount, 0) /
                    deckStats.length
                )
              : 0}
          </div>
        </div>
      </div>

      {/* Deck Limit Alert */}
      {isAtLimit && (
        <Alert className="mb-8">
          <AlertTitle>Deck Limit Reached</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              You&apos;ve reached the free tier limit of 3 decks. Upgrade to Pro for unlimited decks!
            </span>
            <Button asChild variant="default" size="sm" className="ml-4">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Decks List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Decks</h2>
        {deckStats.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any decks yet
            </p>
            <CreateDeckDialog>
              Create Your First Deck
            </CreateDeckDialog>
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
                      {new Date(deck.updatedAt).toLocaleDateString()}
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

