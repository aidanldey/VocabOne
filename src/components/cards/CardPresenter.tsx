import { useState, useEffect } from 'react';
import type { Card } from '@/models/types';
import { ImageCard } from './ImageCard';
import { DefinitionCard } from './DefinitionCard';
import { AudioCard } from './AudioCard';
import { ClozeCard } from './ClozeCard';
import { VideoCard } from './VideoCard';
import { TriviaCard } from './TriviaCard';

export interface CardPresenterProps {
  card: Card;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Main card presenter component that routes to the appropriate card type.
 * Features smooth transitions, keyboard navigation, and mobile-responsive design.
 */
export function CardPresenter({
  card,
  onAnswer,
  disabled = false,
  loading = false,
  className = '',
}: CardPresenterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCard, setCurrentCard] = useState(card);

  // Fade in on mount and when card changes
  useEffect(() => {
    // Fade out
    setIsVisible(false);

    // Wait for fade out, then update card and fade in
    const fadeOutTimer = setTimeout(() => {
      setCurrentCard(card);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(fadeOutTimer);
  }, [card.cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial fade in
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Space for audio/video cards
      if (e.code === 'Space' && (currentCard.type === 'audio' || currentCard.type === 'video')) {
        e.preventDefault();
        // The audio/video components handle space internally
      }

      // Escape to blur input (allow backing out)
      if (e.code === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard.type]);

  // Render the appropriate card component based on type
  const renderCard = () => {
    switch (currentCard.type) {
      case 'image':
        return (
          <ImageCard
            card={currentCard}
            onAnswer={onAnswer}
            disabled={disabled}
            loading={loading}
          />
        );

      case 'definition':
        return (
          <DefinitionCard
            card={currentCard}
            onAnswer={onAnswer}
            disabled={disabled}
            loading={loading}
          />
        );

      case 'audio':
        return (
          <AudioCard
            card={currentCard}
            onAnswer={onAnswer}
            disabled={disabled}
            loading={loading}
          />
        );

      case 'cloze':
        return (
          <ClozeCard
            card={currentCard}
            onAnswer={onAnswer}
            disabled={disabled}
            loading={loading}
          />
        );

      case 'video':
        return (
          <VideoCard
            card={currentCard}
            onAnswer={onAnswer}
            disabled={disabled}
            loading={loading}
          />
        );

      case 'trivia':
        return (
          <TriviaCard
            card={currentCard}
            onAnswer={onAnswer}
            disabled={disabled}
            loading={loading}
          />
        );

      default:
        // TypeScript ensures exhaustiveness, but add fallback for safety
        return (
          <div className="text-center text-red-600">
            <p>Unknown card type</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        w-full min-h-[500px]
        flex items-center justify-center
        p-4 sm:p-6 md:p-8
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
    >
      {/* Card container with responsive padding */}
      <div className="w-full max-w-4xl">
        {/* Card type indicator */}
        <div className="mb-6 text-center">
          <span
            className={`
              inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
              ${
                currentCard.type === 'image'
                  ? 'bg-blue-100 text-blue-700'
                  : currentCard.type === 'audio'
                  ? 'bg-green-100 text-green-700'
                  : currentCard.type === 'video'
                  ? 'bg-red-100 text-red-700'
                  : currentCard.type === 'definition'
                  ? 'bg-yellow-100 text-yellow-700'
                  : currentCard.type === 'cloze'
                  ? 'bg-indigo-100 text-indigo-700'
                  : currentCard.type === 'trivia'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }
            `}
          >
            {currentCard.type} card
          </span>
        </div>

        {/* Render the specific card component */}
        {renderCard()}

        {/* Card ID (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 font-mono">
              Card ID: {currentCard.cardId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
