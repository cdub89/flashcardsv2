"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Shuffle 
} from "lucide-react";

interface StudyCard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyCardClientProps {
  cards: StudyCard[];
  deckName: string;
}

export function StudyCardClient({ cards, deckName }: StudyCardClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState(cards);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, studyCards.length]);

  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex + 1) / studyCards.length) * 100;

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Card {currentIndex + 1} of {studyCards.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-lg text-muted-foreground">
            {isFlipped ? "Back" : "Front"}
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="min-h-[300px] flex items-center justify-center cursor-pointer"
          onClick={handleFlip}
        >
          <div className="text-center">
            <p className="text-2xl font-medium mb-4">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-sm text-muted-foreground">
              Click or press Space to flip
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>

        <Button
          size="lg"
          onClick={handleFlip}
          className="flex-1"
        >
          Flip Card
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === studyCards.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Space:</span> Flip card
            </div>
            <div>
              <span className="font-medium">←:</span> Previous card
            </div>
            <div>
              <span className="font-medium">→:</span> Next card
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {currentIndex === studyCards.length - 1 && (
        <Card className="mt-8 border-primary">
          <CardHeader>
            <CardTitle>Great Job! 🎉</CardTitle>
            <CardDescription>
              You've reached the last card in this deck. Keep up the great work!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleRestart}>
                Study Again
              </Button>
              <Button variant="outline" onClick={handleShuffle}>
                Shuffle and Study
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

