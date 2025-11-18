import { useState, useRef, useEffect } from 'react';

export interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Shared input component for answering vocabulary cards.
 * Features auto-focus, Enter to submit, clear button, and loading states.
 */
export function AnswerInput({
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = 'Type your answer...',
  autoFocus = true,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !loading && !disabled) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleClear = () => {
    setAnswer('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled || loading}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pr-24
            text-lg
            border-2 rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              disabled || loading
                ? 'border-gray-300 bg-gray-100'
                : 'border-gray-300 bg-white hover:border-primary-400'
            }
          `}
          aria-label="Answer input"
        />

        {/* Clear button - shown when there's text */}
        {answer && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-16 top-1/2 -translate-y-1/2
              p-1.5 rounded-full
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-colors duration-200
            "
            aria-label="Clear input"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!answer.trim() || disabled || loading}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            px-4 py-1.5 rounded-md
            font-medium text-sm
            transition-all duration-200
            ${
              !answer.trim() || disabled || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
            }
          `}
          aria-label="Submit answer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
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
              <span>...</span>
            </span>
          ) : (
            'Submit'
          )}
        </button>
      </div>

      {/* Hint text */}
      <p className="mt-2 text-sm text-gray-500">
        Press <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to submit
      </p>
    </form>
  );
}
