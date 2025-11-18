import type { TriviaCard as TriviaCardType } from '@/models/types';
import { AnswerInput } from './AnswerInput';

export interface TriviaCardProps {
  card: TriviaCardType;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Displays a trivia/cultural knowledge card.
 */
export function TriviaCard({ card, onAnswer, disabled, loading }: TriviaCardProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center">
        <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-3">
          Trivia Challenge
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Test your knowledge!
        </h2>
      </div>

      {/* Question card */}
      <div className="w-full bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 shadow-lg border-2 border-purple-200">
        <div className="space-y-6">
          {/* Question */}
          <div>
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-800 leading-relaxed flex-1">
                {card.question}
              </p>
            </div>
          </div>

          {/* Context (if provided) */}
          {card.context && (
            <div className="pt-4 border-t border-purple-200">
              <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">
                Context
              </h4>
              <p className="text-base text-gray-700">
                {card.context}
              </p>
            </div>
          )}

          {/* Hint */}
          {card.hint && (
            <div className="pt-4 border-t border-purple-200">
              <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">
                Hint
              </h4>
              <p className="text-base text-gray-600 italic">
                {card.hint}
              </p>
            </div>
          )}

          {/* Difficulty indicator */}
          {card.difficulty && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Difficulty:</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < (card.difficulty || 0)
                        ? 'bg-purple-600'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <p className="text-base text-gray-600">
          Type the vocabulary word that answers this question
        </p>
      </div>

      {/* Answer input */}
      <div className="w-full">
        <AnswerInput
          onSubmit={onAnswer}
          disabled={disabled}
          loading={loading}
          placeholder="Type your answer..."
        />
      </div>
    </div>
  );
}
