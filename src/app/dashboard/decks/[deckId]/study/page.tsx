import { auth } from "@clerk/nextjs/server";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StudyCardClient } from "@/components/study-card-client";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to study this deck
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const { deckId } = await params;
  const deckIdNum = parseInt(deckId, 10);

  if (isNaN(deckIdNum)) {
    notFound();
  }

  // Fetch deck and verify user owns it
  const deck = await getDeckById(deckIdNum, userId);

  if (!deck) {
    notFound();
  }

  // Fetch all cards in this deck
  const cards = await getCardsByDeckId(deckIdNum);

  if (cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Cards to Study</h1>
        <p className="text-muted-foreground mb-8">
          This deck doesn't have any cards yet. Add some cards before studying.
        </p>
        <Button asChild>
          <Link href={`/dashboard/decks/${deckId}`}>Back to Deck</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link href={`/dashboard/decks/${deckId}`} className="hover:text-foreground">
            {deck.name}
          </Link>
          <span>/</span>
          <span>Study</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study: {deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground">{deck.description}</p>
            )}
          </div>
          
          <Button variant="outline" asChild>
            <Link href={`/dashboard/decks/${deckId}`}>
              Back to Deck
            </Link>
          </Button>
        </div>
      </div>

      {/* Study Interface */}
      <StudyCardClient cards={cards} deckName={deck.name} />
    </div>
  );
}

