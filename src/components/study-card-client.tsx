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
  Shuffle,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { recordAnswerAction } from "@/app/actions/cards";
import { toast } from "sonner";

interface StudyCard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  correctCount: number;
  incorrectCount: number;
  lastStudied: Date | null;
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
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
  });
  const [isRecording, setIsRecording] = useState(false);

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
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (isRecording) return; // Prevent multiple submissions
    
    setIsRecording(true);
    
    try {
      const result = await recordAnswerAction({
        cardId: currentCard.id,
        deckId: currentCard.deckId,
        isCorrect,
      });
      
      if (result.success) {
        // Update session stats
        setSessionStats(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        }));
        
        // Update the card in the local state
        setStudyCards(prev => prev.map(card => 
          card.id === currentCard.id && result.data
            ? {
                ...card,
                correctCount: result.data.correctCount,
                incorrectCount: result.data.incorrectCount,
                lastStudied: result.data.lastStudied,
              }
            : card
        ));
        
        // Auto-advance to next card
        if (currentIndex < studyCards.length - 1) {
          setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
          }, 300);
        } else {
          toast.success("Session complete! Great work! 🎉");
        }
      } else {
        toast.error(result.error || "Failed to record answer");
      }
    } catch (error) {
      console.error("Error recording answer:", error);
      toast.error("Failed to record answer");
    } finally {
      setIsRecording(false);
    }
  };

  const totalAnswers = currentCard.correctCount + currentCard.incorrectCount;
  const accuracy = totalAnswers > 0 
    ? Math.round((currentCard.correctCount / totalAnswers) * 100) 
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Session Progress</CardDescription>
            <CardTitle className="text-2xl">
              {currentIndex + 1} / {studyCards.length}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Session Correct</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {sessionStats.correct}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Session Incorrect</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {sessionStats.incorrect}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-muted-foreground">
              {isFlipped ? "Back" : "Front"}
            </CardTitle>
            {totalAnswers > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">
                  {accuracy}% accuracy ({currentCard.correctCount}/{totalAnswers})
                </span>
              </div>
            )}
          </div>
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
              {isFlipped ? "Rate your answer below" : "Click or press Space to flip"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Answer Buttons (shown when flipped) */}
      {isFlipped ? (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            size="lg"
            variant="destructive"
            onClick={() => handleAnswer(false)}
            disabled={isRecording}
            className="h-16"
          >
            <X className="h-6 w-6 mr-2" />
            Incorrect
          </Button>
          <Button
            size="lg"
            variant="default"
            onClick={() => handleAnswer(true)}
            disabled={isRecording}
            className="h-16 bg-green-600 hover:bg-green-700"
          >
            <Check className="h-6 w-6 mr-2" />
            Correct
          </Button>
        </div>
      ) : null}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isRecording}
          className="flex-1"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>

        <Button
          size="lg"
          onClick={handleFlip}
          disabled={isRecording}
          className="flex-1"
        >
          Flip Card
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === studyCards.length - 1 || isRecording}
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
      {currentIndex === studyCards.length - 1 && sessionStats.correct + sessionStats.incorrect > 0 && (
        <Card className="mt-8 border-primary">
          <CardHeader>
            <CardTitle>Great Job! 🎉</CardTitle>
            <CardDescription>
              You've reached the last card in this deck. Keep up the great work!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Session Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {sessionStats.correct + sessionStats.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {sessionStats.correct}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {sessionStats.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>
              {sessionStats.correct + sessionStats.incorrect > 0 && (
                <div className="mt-3 text-center">
                  <span className="text-lg font-semibold">
                    Accuracy: {Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)}%
                  </span>
                </div>
              )}
            </div>
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

