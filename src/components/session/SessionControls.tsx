/**
 * Session control buttons for skip, pause, and end session.
 * Includes confirmation dialogs for destructive actions.
 */

import { useState } from 'react';

export interface SessionControlsProps {
  onSkip?: () => void;
  onPause?: () => void;
  onEndSession: () => void;
  canSkip?: boolean;
  showPause?: boolean;
  className?: string;
}

export function SessionControls({
  onSkip,
  onPause,
  onEndSession,
  canSkip = true,
  showPause = false,
  className = '',
}: SessionControlsProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleEndClick = () => {
    setShowEndConfirm(true);
  };

  const handleConfirmEnd = () => {
    setShowEndConfirm(false);
    onEndSession();
  };

  const handleCancelEnd = () => {
    setShowEndConfirm(false);
  };

  return (
    <>
      <div className={`flex gap-3 ${className}`}>
        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            disabled={!canSkip}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${
                canSkip
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Skip this card"
          >
            <svg
              className="inline-block w-4 h-4 mr-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Skip
          </button>
        )}

        {/* Pause button */}
        {showPause && onPause && (
          <button
            onClick={onPause}
            className="
              px-4 py-2 rounded-lg font-medium text-sm
              bg-gray-100 text-gray-700 hover:bg-gray-200
              transition-all duration-200 active:scale-95
            "
            title="Pause session"
          >
            <svg
              className="inline-block w-4 h-4 mr-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
          </button>
        )}

        {/* End session button */}
        <button
          onClick={handleEndClick}
          className="
            px-4 py-2 rounded-lg font-medium text-sm
            bg-red-100 text-red-700 hover:bg-red-200
            transition-all duration-200 active:scale-95
          "
          title="End session early"
        >
          <svg
            className="inline-block w-4 h-4 mr-1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
          End Session
        </button>
      </div>

      {/* Confirmation dialog */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  End Session?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to end this study session? Your progress will be saved, but you'll need to start a new session to continue.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelEnd}
                className="
                  px-4 py-2 rounded-lg font-medium
                  bg-gray-100 text-gray-700 hover:bg-gray-200
                  transition-all duration-200
                "
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnd}
                className="
                  px-4 py-2 rounded-lg font-medium
                  bg-red-600 text-white hover:bg-red-700
                  transition-all duration-200
                "
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
