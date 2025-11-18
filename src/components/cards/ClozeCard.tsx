import type { ClozeCard as ClozeCardType } from '@/models/types';
import { AnswerInput } from './AnswerInput';

export interface ClozeCardProps {
  card: ClozeCardType;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Displays a cloze (fill-in-the-blank) card.
 */
export function ClozeCard({ card, onAnswer, disabled, loading }: ClozeCardProps) {
  // Split sentence at the blank
  const parts = card.sentence.split('___');

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Fill in the blank
        </h2>
        {card.hint && (
          <p className="text-sm text-gray-500 italic">
            Hint: {card.hint}
          </p>
        )}
      </div>

      {/* Sentence with blank */}
      <div className="w-full bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <p className="text-2xl leading-relaxed text-gray-800">
            {parts.map((part, index) => (
              <span key={index}>
                {part}
                {index < parts.length - 1 && (
                  <span className="inline-block relative mx-2">
                    <span
                      className="
                        inline-block min-w-[120px] px-4 py-1
                        border-b-4 border-dashed border-primary-600
                        bg-white rounded-sm
                        font-mono text-lg text-gray-400
                      "
                    >
                      ?
                    </span>
                    <span
                      className="
                        absolute -top-6 left-1/2 -translate-x-1/2
                        px-2 py-0.5
                        bg-primary-600 text-white text-xs rounded
                        font-sans font-normal
                        whitespace-nowrap
                      "
                    >
                      blank
                    </span>
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* Blank position indicator */}
        {card.blankPosition !== undefined && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Word position: {card.blankPosition}
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-base text-gray-600">
          Type the word that belongs in the blank
        </p>
      </div>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
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
          placeholder="Type the missing word..."
        />
      </div>
    </div>
  );
}
