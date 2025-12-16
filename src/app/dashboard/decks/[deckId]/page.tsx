import { auth } from "@clerk/nextjs/server";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to view this deck
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span>{deck.name}</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground">{deck.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <EditDeckDialog 
              deckId={deck.id}
              currentName={deck.name}
              currentDescription={deck.description}
              trigger={<Button variant="outline">Edit Deck</Button>}
            />
            <Button asChild>
              <Link href={`/dashboard/decks/${deck.id}/study`}>
                Study Cards
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Cards</CardDescription>
            <CardTitle className="text-3xl">{cards.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Created</CardDescription>
            <CardTitle className="text-lg">
              {new Date(deck.createdAt).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last Updated</CardDescription>
            <CardTitle className="text-lg">
              {new Date(deck.updatedAt).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <AddCardDialog 
            deckId={deckIdNum}
            trigger={<Button variant="outline">Add Card</Button>}
          />
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                This deck doesn't have any cards yet
              </p>
              <AddCardDialog 
                deckId={deckIdNum}
                trigger={<Button>Add Your First Card</Button>}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card key={card.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Front</CardTitle>
                  <CardDescription className="text-foreground">
                    {card.front}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="text-sm font-medium mb-1">Back</div>
                    <div className="text-sm text-muted-foreground">
                      {card.back}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <EditCardDialog
                      cardId={card.id}
                      deckId={deck.id}
                      currentFront={card.front}
                      currentBack={card.back}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Edit
                        </Button>
                      }
                    />
                    <DeleteCardDialog
                      cardId={card.id}
                      deckId={deck.id}
                      cardFront={card.front}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

