/**
 * Progress indicator for study sessions.
 * Shows current position, cards remaining, and visual progress bar.
 */

export interface SessionProgressProps {
  currentIndex: number;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  className?: string;
}

export function SessionProgress({
  currentIndex,
  totalCards,
  correctCount,
  incorrectCount,
  className = '',
}: SessionProgressProps) {
  const progressPercentage = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;
  const cardsRemaining = totalCards - currentIndex;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <span className="text-sm text-gray-500">
            {cardsRemaining} remaining
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={currentIndex}
            aria-valuemin={0}
            aria-valuemax={totalCards}
          />
        </div>
      </div>

      {/* Stats */}
      {(correctCount > 0 || incorrectCount > 0) && (
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-700">
              {correctCount} correct
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-gray-700">
              {incorrectCount} incorrect
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
