import { useState, useRef } from 'react';
import type { VideoCard as VideoCardType } from '@/models/types';
import { AnswerInput } from './AnswerInput';

export interface VideoCardProps {
  card: VideoCardType;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Displays a video card with playback controls.
 */
export function VideoCard({ card, onAnswer, disabled, loading }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setVideoError(true);
        });
      }
    }
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

      {/* Video container */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-12 w-12 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600">Loading video...</p>
            </div>
          </div>
        )}

        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3 text-red-600">
              <svg
                className="h-16 w-16"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium">Failed to load video</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={card.videoUrl}
            onLoadedData={() => setVideoLoaded(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => setVideoError(true)}
            controls
            loop={card.loop}
            className="w-full h-full object-contain"
          />
        )}

        {/* Play overlay (shown when paused) */}
        {videoLoaded && !isPlaying && !videoError && (
          <button
            onClick={handlePlayPause}
            className="
              absolute inset-0
              flex items-center justify-center
              bg-black bg-opacity-30
              hover:bg-opacity-40
              transition-all duration-200
              cursor-pointer
            "
            aria-label="Play video"
          >
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-xl">
              <svg
                className="w-10 h-10 text-primary-600 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Video info */}
      {(card.duration || card.subtitles) && (
        <div className="flex gap-4 text-sm text-gray-600">
          {card.duration && (
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {card.duration}s
            </span>
          )}
          {card.subtitles && (
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Subtitles available
            </span>
          )}
        </div>
      )}

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
          disabled={disabled || !videoLoaded}
          loading={loading}
          placeholder="Type your answer..."
        />
      </div>
    </div>
  );
}
