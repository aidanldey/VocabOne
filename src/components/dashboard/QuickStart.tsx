import React, { useState } from 'react';

export interface QuickStartProps {
  /** Selected module title (null if none selected) */
  selectedModule: string | null;
  /** Number of cards due in selected module */
  dueCount: number;
  /** Start studying callback */
  onStart: (cardLimit: number) => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Quick start component with big study button and session settings.
 */
export function QuickStart({
  selectedModule,
  dueCount,
  onStart,
  disabled = false,
}: QuickStartProps): JSX.Element {
  const [cardLimit, setCardLimit] = useState<number>(20);
  const [showSettings, setShowSettings] = useState(false);

  const handleStart = () => {
    if (!disabled && selectedModule) {
      onStart(cardLimit);
    }
  };

  const cardLimitOptions = [10, 20, 30, 50, 100];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Quick Start
      </h2>

      {/* Selected Module Info */}
      {selectedModule ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Selected Module
              </p>
              <p className="text-lg font-semibold text-blue-700 mt-1">
                {selectedModule}
              </p>
              {dueCount > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  {dueCount} card{dueCount !== 1 ? 's' : ''} due for review
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">
                No Module Selected
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Select a module from below to start studying
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session Settings */}
      <div className="mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Session Settings</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              showSettings ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showSettings && (
          <div className="mt-3 space-y-3">
            <div>
              <label
                htmlFor="card-limit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cards per session: {cardLimit}
              </label>
              <input
                type="range"
                id="card-limit"
                min="5"
                max="100"
                step="5"
                value={cardLimit}
                onChange={(e) => setCardLimit(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>100</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {cardLimitOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setCardLimit(option)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    cardLimit === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={disabled || !selectedModule}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
          ${
            disabled || !selectedModule
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg'
          }
        `}
        aria-label={`Start studying ${selectedModule || ''} with ${cardLimit} cards`}
      >
        <div className="flex items-center justify-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Start Studying
        </div>
      </button>

      {!selectedModule && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Select a module below to begin
        </p>
      )}
    </div>
  );
}
