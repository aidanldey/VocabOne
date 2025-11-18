import { useState, useRef, useEffect } from 'react';
import type { AudioCard as AudioCardType } from '@/models/types';
import { AnswerInput } from './AnswerInput';

export interface AudioCardProps {
  card: AudioCardType;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Displays an audio card with playback controls.
 */
export function AudioCard({ card, onAnswer, disabled, loading }: AudioCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play on mount
  useEffect(() => {
    if (audioRef.current && !hasPlayed) {
      audioRef.current.play().catch(() => {
        // Auto-play might be blocked by browser
        setAudioError(false);
      });
    }
  }, [hasPlayed]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setAudioError(true);
      });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
    setHasPlayed(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      {/* Prompt */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {card.prompt}
        </h2>
        {card.hint && (
          <p className="text-sm text-gray-500 italic">
            Hint: {card.hint}
          </p>
        )}
      </div>

      {/* Audio player */}
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            {/* Audio element (hidden) */}
            <audio
              ref={audioRef}
              src={card.audioUrl}
              onPlay={handleAudioPlay}
              onPause={handleAudioPause}
              onEnded={handleAudioEnded}
              onError={handleAudioError}
              className="hidden"
            />

            {/* Play/Pause button */}
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={audioError}
              className={`
                w-24 h-24 rounded-full
                flex items-center justify-center
                transition-all duration-300
                shadow-xl
                ${
                  audioError
                    ? 'bg-red-500 cursor-not-allowed'
                    : isPlaying
                    ? 'bg-primary-600 hover:bg-primary-700 active:scale-95'
                    : 'bg-primary-600 hover:bg-primary-700 hover:scale-110 active:scale-95'
                }
              `}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {audioError ? (
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : isPlaying ? (
                <svg
                  className="w-12 h-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Status text */}
            <p className="text-sm font-medium text-gray-600">
              {audioError
                ? 'Failed to load audio'
                : isPlaying
                ? 'Playing...'
                : hasPlayed
                ? 'Click to replay'
                : 'Click to play'}
            </p>

            {/* Duration */}
            {card.duration && !audioError && (
              <p className="text-xs text-gray-500">
                Duration: {card.duration}s
              </p>
            )}
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="mt-3 text-center text-sm text-gray-500">
          Press <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded">Space</kbd> to play/pause
        </p>
      </div>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Answer input */}
      <div className="w-full">
        <AnswerInput
          onSubmit={onAnswer}
          disabled={disabled}
          loading={loading}
          placeholder="Type what you heard..."
        />
      </div>
    </div>
  );
}
