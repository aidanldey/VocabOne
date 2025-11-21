/**
 * Feedback display component showing whether answer was correct.
 * Displays the correct answer and provides a continue button.
 */

export interface FeedbackDisplayProps {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  wasExactMatch?: boolean;
  wasFuzzyMatch?: boolean;
  onContinue: () => void;
  className?: string;
}

export function FeedbackDisplay({
  isCorrect,
  userAnswer,
  correctAnswer,
  wasExactMatch = false,
  wasFuzzyMatch = false,
  onContinue,
  className = '',
}: FeedbackDisplayProps) {
  return (
    <div
      className={`
        rounded-xl p-8 shadow-lg
        ${isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}
        ${className}
      `}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Icon and title */}
        <div className="flex flex-col items-center space-y-3">
          {isCorrect ? (
            <>
              <svg
                className="w-20 h-20 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold text-green-700">
                {wasExactMatch ? 'Perfect!' : wasFuzzyMatch ? 'Close Enough!' : 'Correct!'}
              </h2>
            </>
          ) : (
            <>
              <svg
                className="w-20 h-20 text-red-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold text-red-700">Not Quite</h2>
            </>
          )}
        </div>

        {/* Answer details */}
        <div className="w-full space-y-4">
          {/* User's answer */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Your answer:</p>
            <p className="text-xl font-medium text-gray-800">{userAnswer}</p>
          </div>

          {/* Correct answer (if incorrect) */}
          {!isCorrect && (
            <div className="bg-white rounded-lg p-4 border-2 border-green-500">
              <p className="text-sm font-semibold text-green-700 mb-1">
                Correct answer:
              </p>
              <p className="text-xl font-medium text-green-800">{correctAnswer}</p>
            </div>
          )}

          {/* Fuzzy match note */}
          {isCorrect && wasFuzzyMatch && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> Your answer was close. The exact answer is: <span className="font-medium">{correctAnswer}</span>
              </p>
            </div>
          )}
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white text-lg
            transition-all duration-200
            focus:outline-none focus:ring-4
            ${
              isCorrect
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300 active:scale-95'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-300 active:scale-95'
            }
          `}
        >
          Continue
          <svg
            className="inline-block ml-2 w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Keyboard hint */}
        <p className="text-sm text-gray-500">
          Press <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to continue
        </p>
      </div>
    </div>
  );
}
