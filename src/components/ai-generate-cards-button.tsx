'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { generateFlashcardsAction } from '@/app/actions/cards';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIGenerateCardsButtonProps {
  deckId: number;
}

export function AIGenerateCardsButton({ deckId }: AIGenerateCardsButtonProps) {
  const { has } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check if user has AI generation feature
  const hasAIGeneration = has ? has({ feature: 'ai_flashcard_generation' }) : false;
  
  async function handleGenerate() {
    // If user doesn't have the feature, redirect to pricing
    if (!hasAIGeneration) {
      router.push('/pricing');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateFlashcardsAction({ deckId });
      
      if (result.success) {
        toast.success(`Successfully generated ${result.data?.length || 0} flashcards!`);
      } else {
        toast.error(result.error || 'Failed to generate flashcards');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  }
  
  // If user doesn't have the feature, show tooltip
  if (!hasAIGeneration) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a Pro feature. Click to upgrade!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // If user has the feature, show regular button
  return (
    <Button
      variant="outline"
      onClick={handleGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  );
}

