import type { DefinitionCard as DefinitionCardType } from '@/models/types';
import { AnswerInput } from './AnswerInput';

export interface DefinitionCardProps {
  card: DefinitionCardType;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Displays a definition card with text-based content.
 */
export function DefinitionCard({ card, onAnswer, disabled, loading }: DefinitionCardProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      {/* Definition box */}
      <div className="w-full bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 shadow-md">
        <div className="space-y-4">
          {/* Part of speech badge */}
          {card.partOfSpeech && (
            <div className="inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-primary-700 shadow-sm">
              {card.partOfSpeech}
            </div>
          )}

          {/* Definition */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Definition
            </h3>
            <p className="text-xl text-gray-800 leading-relaxed">
              {card.definition}
            </p>
          </div>

          {/* Example sentence */}
          {card.exampleSentence && (
            <div className="pt-4 border-t border-primary-200">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Example
              </h4>
              <p className="text-lg text-gray-700 italic">
                "{card.exampleSentence}"
              </p>
            </div>
          )}

          {/* Hint */}
          {card.hint && (
            <div className="pt-4 border-t border-primary-200">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Hint
              </h4>
              <p className="text-base text-gray-600">
                {card.hint}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-700">
          What word matches this definition?
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
          placeholder="Type the word..."
        />
      </div>
    </div>
  );
}
