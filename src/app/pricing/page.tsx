import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Upgrade to Pro for unlimited decks and AI-powered flashcard generation
          </p>
        </div>
        
        <PricingTable />
      </div>
    </div>
  );
}

