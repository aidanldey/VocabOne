import React from 'react';

export interface ModuleCardProps {
  /** Module ID */
  moduleId: string;
  /** Module title */
  title: string;
  /** Optional description */
  description?: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Number of cards due for review */
  dueCount: number;
  /** Total number of vocabulary entries */
  totalEntries: number;
  /** Optional image URL */
  imageUrl?: string;
  /** Whether this module is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Module card component displaying module information and progress.
 */
export function ModuleCard({
  moduleId,
  title,
  description,
  progress,
  dueCount,
  totalEntries,
  imageUrl,
  isSelected = false,
  onClick,
}: ModuleCardProps): JSX.Element {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg border-2 shadow-md transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? 'border-blue-500 shadow-lg scale-105 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white'
        }
      `}
      role="button"
      tabIndex={0}
      aria-label={`${title} module, ${progress}% complete, ${dueCount} cards due`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Image or placeholder */}
      {imageUrl ? (
        <div className="h-32 sm:h-40 w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 sm:h-40 w-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      )}

      {/* Due count badge */}
      {dueCount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold shadow-md">
          {dueCount} due
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{totalEntries} words</span>
          <span className="font-medium text-blue-600">{progress}% learned</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress === 100
                ? 'bg-green-500'
                : progress >= 50
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${progress}%` }}
            aria-label={`${progress}% progress`}
          />
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute bottom-2 right-2">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
