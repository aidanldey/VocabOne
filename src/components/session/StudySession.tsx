/**
 * Main study session component that orchestrates the learning flow.
 * Manages card presentation, answer validation, feedback, and progress tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Card, VocabularyModule, UserProgress } from '@/models/types';
import { CardPresenter } from '../cards/CardPresenter';
import { SessionProgress } from './SessionProgress';
import { FeedbackDisplay } from './FeedbackDisplay';
import { SessionControls } from './SessionControls';
import { validateAnswer, getCardAnswer } from '@/utils/answerValidation';
import { calculateNextReview, getInitialProgress } from '@/services/spacedRepetition/sm2Algorithm';
import { ReviewQuality } from '@/models/types';
import { useSaveProgress, useBulkUpdateProgress } from '@/hooks/useStorage';

export interface StudySessionProps {
  module: VocabularyModule;
  cards: Card[];
  onComplete: (stats: SessionStats) => void;
  onExit: () => void;
}

export interface SessionStats {
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  duration: number; // in seconds
}

type SessionState = 'presenting' | 'feedback' | 'complete';

interface CardProgress {
  card: Card;
  entryId: string;
  userAnswer?: string;
  isCorrect?: boolean;
  wasExactMatch?: boolean;
  wasFuzzyMatch?: boolean;
  progress?: UserProgress;
}

/**
 * Main study session component.
 * Flow: Present → Answer → Feedback → Next → ... → Complete
 */
export function StudySession({ module, cards, onComplete, onExit }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>('presenting');
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const { bulkUpdateProgress } = useBulkUpdateProgress();

  const currentCard = cards[currentIndex];
  const currentCardProgress = cardProgress[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  // Initialize card progress array
  useEffect(() => {
    const initialProgress: CardProgress[] = cards.map((card) => {
      // Find the entry that contains this card
      const entry = module.entries.find((e) =>
        e.cards.some((c) => c.cardId === card.cardId)
      );

      return {
        card,
        entryId: entry?.entryId || '',
      };
    });

    setCardProgress(initialProgress);
  }, [cards, module]);

  /**
   * Handle answer submission from user.
   */
  const handleAnswer = useCallback(
    (userAnswer: string) => {
      if (sessionState !== 'presenting') return;

      const { expectedAnswer, alternateAnswers } = getCardAnswer(currentCard);

      // Validate the answer
      const result = validateAnswer(userAnswer, expectedAnswer, alternateAnswers);

      // Find the entry for this card
      const entry = module.entries.find((e) =>
        e.cards.some((c) => c.cardId === currentCard.cardId)
      );

      if (!entry) return;

      // Get existing progress or create new
      const existingProgress = entry.progress || getInitialProgress();

      // Calculate quality based on correctness and match type
      let quality: ReviewQuality;
      if (!result.isCorrect) {
        quality = ReviewQuality.WRONG; // 0
      } else if (result.exactMatch) {
        quality = ReviewQuality.PERFECT; // 5
      } else if (result.fuzzyMatch) {
        quality = ReviewQuality.GOOD; // 4
      } else {
        quality = ReviewQuality.GOOD; // 4
      }

      // Calculate next review using SM-2
      const updatedProgress = calculateNextReview(existingProgress, quality);

      // Update card progress
      const newCardProgress = [...cardProgress];
      newCardProgress[currentIndex] = {
        ...newCardProgress[currentIndex],
        userAnswer,
        isCorrect: result.isCorrect,
        wasExactMatch: result.exactMatch,
        wasFuzzyMatch: result.fuzzyMatch,
        progress: updatedProgress,
      };

      setCardProgress(newCardProgress);

      // Update counts
      if (result.isCorrect) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }

      // Show feedback
      setSessionState('feedback');
    },
    [currentCard, currentIndex, cardProgress, module.entries, sessionState]
  );

  /**
   * Handle continue from feedback to next card or completion.
   */
  const handleContinue = useCallback(() => {
    if (sessionState !== 'feedback') return;

    if (isLastCard) {
      // Session complete
      setSessionState('complete');

      // Save all progress to storage
      const progressUpdates = cardProgress
        .filter((cp) => cp.progress)
        .map((cp) => ({
          moduleId: module.moduleId,
          entryId: cp.entryId,
          progress: cp.progress!,
        }));

      bulkUpdateProgress(progressUpdates);

      // Calculate stats
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const stats: SessionStats = {
        totalCards: cards.length,
        correctCount,
        incorrectCount,
        accuracy: correctCount / cards.length,
        duration,
      };

      onComplete(stats);
    } else {
      // Move to next card
      setCurrentIndex((prev) => prev + 1);
      setSessionState('presenting');
    }
  }, [
    sessionState,
    isLastCard,
    cardProgress,
    module.moduleId,
    bulkUpdateProgress,
    startTime,
    cards.length,
    correctCount,
    incorrectCount,
    onComplete,
  ]);

  /**
   * Handle keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionState === 'feedback' && e.key === 'Enter') {
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sessionState, handleContinue]);

  /**
   * Handle skip card (mark as skipped, move to next).
   */
  const handleSkip = useCallback(() => {
    if (sessionState !== 'presenting') return;

    // Skip without updating progress
    if (isLastCard) {
      setSessionState('complete');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [sessionState, isLastCard]);

  /**
   * Handle end session early.
   */
  const handleEndSession = useCallback(() => {
    // Save progress for answered cards
    const progressUpdates = cardProgress
      .filter((cp) => cp.progress)
      .map((cp) => ({
        moduleId: module.moduleId,
        entryId: cp.entryId,
        progress: cp.progress!,
      }));

    if (progressUpdates.length > 0) {
      bulkUpdateProgress(progressUpdates);
    }

    onExit();
  }, [cardProgress, module.moduleId, bulkUpdateProgress, onExit]);

  // Show loading if cards not ready
  if (cards.length === 0 || cardProgress.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with module title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{module.title}</h1>
          <p className="text-gray-600">{module.description}</p>
        </div>

        {/* Progress bar */}
        <SessionProgress
          currentIndex={currentIndex}
          totalCards={cards.length}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
        />

        {/* Main content area */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {sessionState === 'presenting' && (
            <>
              <CardPresenter
                card={currentCard}
                onAnswer={handleAnswer}
                disabled={false}
                loading={false}
              />

              {/* Controls */}
              <div className="mt-6 flex justify-center">
                <SessionControls
                  onSkip={handleSkip}
                  onEndSession={handleEndSession}
                  canSkip={true}
                />
              </div>
            </>
          )}

          {sessionState === 'feedback' && currentCardProgress && (
            <FeedbackDisplay
              isCorrect={currentCardProgress.isCorrect || false}
              userAnswer={currentCardProgress.userAnswer || ''}
              correctAnswer={getCardAnswer(currentCard).expectedAnswer}
              wasExactMatch={currentCardProgress.wasExactMatch}
              wasFuzzyMatch={currentCardProgress.wasFuzzyMatch}
              onContinue={handleContinue}
            />
          )}

          {sessionState === 'complete' && (
            <SessionComplete
              stats={{
                totalCards: cards.length,
                correctCount,
                incorrectCount,
                accuracy: correctCount / cards.length,
                duration: Math.floor((Date.now() - startTime) / 1000),
              }}
              onExit={onExit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Session complete screen showing final stats.
 */
interface SessionCompleteProps {
  stats: SessionStats;
  onExit: () => void;
}

function SessionComplete({ stats, onExit }: SessionCompleteProps) {
  const accuracyPercentage = Math.round(stats.accuracy * 100);
  const minutes = Math.floor(stats.duration / 60);
  const seconds = stats.duration % 60;

  return (
    <div className="text-center space-y-8 py-8">
      {/* Celebration icon */}
      <div className="flex justify-center">
        <svg
          className="w-24 h-24 text-primary-600"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-xl text-gray-600">Great work on your study session</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Cards</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCards}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1">Correct</p>
          <p className="text-3xl font-bold text-green-600">{stats.correctCount}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700 mb-1">Incorrect</p>
          <p className="text-3xl font-bold text-red-600">{stats.incorrectCount}</p>
        </div>

        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm text-primary-700 mb-1">Accuracy</p>
          <p className="text-3xl font-bold text-primary-600">{accuracyPercentage}%</p>
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-gray-600">
          Session duration:{' '}
          <span className="font-semibold">
            {minutes}m {seconds}s
          </span>
        </p>
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="
          px-8 py-3 rounded-lg font-semibold text-white text-lg
          bg-primary-600 hover:bg-primary-700
          transition-all duration-200 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-primary-300
        "
      >
        Return to Dashboard
      </button>
    </div>
  );
}
