/**
 * Module validation utilities for VocabOne.
 * Validates imported JSON modules against the schema requirements.
 */

import type { VocabularyModule, Card, CardType } from '../models/types';

export interface ValidationError {
  field: string;
  message: string;
  path?: string;
}

export interface ModuleValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
  module?: VocabularyModule;
}

export interface ModuleStats {
  totalEntries: number;
  totalCards: number;
  cardTypeDistribution: Record<string, number>;
  averageCardsPerEntry: number;
}

/**
 * Validates a module JSON object against the schema requirements.
 */
export function validateModule(data: unknown): ModuleValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Module data must be a valid JSON object' }],
    };
  }

  const moduleData = data as Record<string, unknown>;

  // Validate module_metadata
  if (!moduleData.module_metadata || typeof moduleData.module_metadata !== 'object') {
    errors.push({
      field: 'module_metadata',
      message: 'Module metadata is required and must be an object',
    });
  } else {
    const metadata = moduleData.module_metadata as Record<string, unknown>;

    // Validate module_id
    if (!metadata.module_id || typeof metadata.module_id !== 'string') {
      errors.push({ field: 'module_metadata.module_id', message: 'Module ID is required' });
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(metadata.module_id)) {
      errors.push({
        field: 'module_metadata.module_id',
        message: 'Module ID must be in kebab-case format (e.g., "spanish-animals-basics")',
      });
    }

    // Validate title
    if (!metadata.title || typeof metadata.title !== 'string') {
      errors.push({ field: 'module_metadata.title', message: 'Module title is required' });
    } else if (metadata.title.length < 1 || metadata.title.length > 100) {
      errors.push({
        field: 'module_metadata.title',
        message: 'Module title must be between 1 and 100 characters',
      });
    }

    // Validate version
    if (!metadata.version || typeof metadata.version !== 'string') {
      errors.push({ field: 'module_metadata.version', message: 'Module version is required' });
    } else if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      errors.push({
        field: 'module_metadata.version',
        message: 'Module version must be in semantic versioning format (e.g., "1.0.0")',
      });
    }

    // Validate language
    if (!metadata.language || typeof metadata.language !== 'string') {
      errors.push({ field: 'module_metadata.language', message: 'Module language is required' });
    } else if (!/^[a-z]{2}$/.test(metadata.language)) {
      errors.push({
        field: 'module_metadata.language',
        message: 'Module language must be a 2-letter ISO 639-1 code (e.g., "es", "en", "fr")',
      });
    }
  }

  // Validate vocabulary_entries
  if (!moduleData.vocabulary_entries || !Array.isArray(moduleData.vocabulary_entries)) {
    errors.push({
      field: 'vocabulary_entries',
      message: 'Vocabulary entries are required and must be an array',
    });
  } else {
    const entries = moduleData.vocabulary_entries as unknown[];

    if (entries.length === 0) {
      errors.push({
        field: 'vocabulary_entries',
        message: 'Module must contain at least one vocabulary entry',
      });
    }

    // Validate each entry
    entries.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        errors.push({
          field: `vocabulary_entries[${index}]`,
          message: 'Entry must be an object',
        });
        return;
      }

      const entryData = entry as Record<string, unknown>;

      // Validate entry_id
      if (!entryData.entry_id || typeof entryData.entry_id !== 'string') {
        errors.push({
          field: `vocabulary_entries[${index}].entry_id`,
          message: 'Entry ID is required',
        });
      }

      // Validate term
      if (!entryData.term || typeof entryData.term !== 'string') {
        errors.push({
          field: `vocabulary_entries[${index}].term`,
          message: 'Entry term is required',
        });
      } else if (entryData.term.trim().length === 0) {
        errors.push({
          field: `vocabulary_entries[${index}].term`,
          message: 'Entry term cannot be empty',
        });
      }

      // Validate cards
      if (!entryData.cards || !Array.isArray(entryData.cards)) {
        errors.push({
          field: `vocabulary_entries[${index}].cards`,
          message: 'Entry cards are required and must be an array',
        });
      } else {
        const cards = entryData.cards as unknown[];

        if (cards.length === 0) {
          errors.push({
            field: `vocabulary_entries[${index}].cards`,
            message: 'Entry must have at least one card',
          });
        }

        // Validate each card
        cards.forEach((card, cardIndex) => {
          if (!card || typeof card !== 'object') {
            errors.push({
              field: `vocabulary_entries[${index}].cards[${cardIndex}]`,
              message: 'Card must be an object',
            });
            return;
          }

          const cardData = card as Record<string, unknown>;
          const cardPath = `vocabulary_entries[${index}].cards[${cardIndex}]`;

          // Validate card_id
          if (!cardData.card_id || typeof cardData.card_id !== 'string') {
            errors.push({
              field: `${cardPath}.card_id`,
              message: 'Card ID is required',
            });
          }

          // Validate card_type
          const validCardTypes = ['image', 'audio', 'definition', 'cloze', 'video', 'trivia'];
          if (!cardData.card_type || typeof cardData.card_type !== 'string') {
            errors.push({
              field: `${cardPath}.card_type`,
              message: 'Card type is required',
            });
          } else if (!validCardTypes.includes(cardData.card_type)) {
            errors.push({
              field: `${cardPath}.card_type`,
              message: `Card type must be one of: ${validCardTypes.join(', ')}`,
            });
          }

          // Validate content
          if (!cardData.content || typeof cardData.content !== 'object') {
            errors.push({
              field: `${cardPath}.content`,
              message: 'Card content is required and must be an object',
            });
          } else {
            validateCardContent(cardData.card_type as string, cardData.content as Record<string, unknown>, cardPath, errors);
          }
        });
      }
    });
  }

  // Validate schema_version if present
  if (moduleData.schema_version && typeof moduleData.schema_version === 'string') {
    if (!/^\d+\.\d+\.\d+$/.test(moduleData.schema_version)) {
      warnings.push({
        field: 'schema_version',
        message: 'Schema version should be in semantic versioning format (e.g., "1.0.0")',
      });
    }
  }

  // If no errors, attempt to transform to VocabularyModule
  let transformedModule: VocabularyModule | undefined;
  if (errors.length === 0) {
    try {
      transformedModule = transformToModule(moduleData);
    } catch (error) {
      errors.push({
        field: 'transformation',
        message: `Failed to transform module: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    module: transformedModule,
  };
}

/**
 * Validates card content based on card type.
 */
function validateCardContent(
  cardType: string,
  content: Record<string, unknown>,
  cardPath: string,
  errors: ValidationError[]
): void {
  switch (cardType) {
    case 'image':
      if (!content.image_url && !content.imageUrl) {
        errors.push({ field: `${cardPath}.content`, message: 'Image card requires image_url' });
      }
      if (!content.prompt && !content.prompt_text) {
        errors.push({ field: `${cardPath}.content`, message: 'Image card requires prompt' });
      }
      if (!content.expected_answer && !content.expectedAnswer) {
        errors.push({ field: `${cardPath}.content`, message: 'Image card requires expected_answer' });
      }
      break;

    case 'audio':
      if (!content.audio_url && !content.audioUrl) {
        errors.push({ field: `${cardPath}.content`, message: 'Audio card requires audio_url' });
      }
      if (!content.prompt && !content.prompt_text) {
        errors.push({ field: `${cardPath}.content`, message: 'Audio card requires prompt' });
      }
      if (!content.expected_answer && !content.expectedAnswer) {
        errors.push({ field: `${cardPath}.content`, message: 'Audio card requires expected_answer' });
      }
      break;

    case 'definition':
      if (!content.definition) {
        errors.push({ field: `${cardPath}.content`, message: 'Definition card requires definition' });
      }
      if (!content.expected_answer && !content.expectedAnswer) {
        errors.push({ field: `${cardPath}.content`, message: 'Definition card requires expected_answer' });
      }
      break;

    case 'cloze':
      if (!content.sentence) {
        errors.push({ field: `${cardPath}.content`, message: 'Cloze card requires sentence' });
      }
      if (!content.blank) {
        errors.push({ field: `${cardPath}.content`, message: 'Cloze card requires blank' });
      }
      if (!content.expected_answer && !content.expectedAnswer) {
        errors.push({ field: `${cardPath}.content`, message: 'Cloze card requires expected_answer' });
      }
      break;

    case 'video':
      if (!content.video_url && !content.videoUrl) {
        errors.push({ field: `${cardPath}.content`, message: 'Video card requires video_url' });
      }
      if (!content.prompt && !content.prompt_text) {
        errors.push({ field: `${cardPath}.content`, message: 'Video card requires prompt' });
      }
      if (!content.expected_answer && !content.expectedAnswer) {
        errors.push({ field: `${cardPath}.content`, message: 'Video card requires expected_answer' });
      }
      break;

    case 'trivia':
      if (!content.question) {
        errors.push({ field: `${cardPath}.content`, message: 'Trivia card requires question' });
      }
      if (!content.expected_answer && !content.expectedAnswer) {
        errors.push({ field: `${cardPath}.content`, message: 'Trivia card requires expected_answer' });
      }
      break;
  }
}

/**
 * Transforms validated module data to VocabularyModule type.
 */
function transformToModule(data: Record<string, unknown>): VocabularyModule {
  const metadata = data.module_metadata as Record<string, unknown>;
  const entries = (data.vocabulary_entries as Record<string, unknown>[]).map((entry) => {
    const cards = (entry.cards as Record<string, unknown>[]).map((card) => {
      const content = card.content as Record<string, unknown>;
      const cardType = card.card_type as CardType;

      // Normalize content properties (handle both snake_case and camelCase)
      const normalizedContent: Record<string, unknown> = {};
      Object.keys(content).forEach((key) => {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        normalizedContent[camelKey] = content[key];
      });

      return {
        cardId: card.card_id as string,
        type: cardType,
        ...(cardType === 'image' && {
          imageUrl: normalizedContent.imageUrl as string,
          prompt: normalizedContent.prompt as string,
          expectedAnswer: normalizedContent.expectedAnswer as string,
          alternateAnswers: normalizedContent.alternateAnswers as string[] | undefined,
          altText: normalizedContent.altText as string | undefined,
        }),
        ...(cardType === 'audio' && {
          audioUrl: normalizedContent.audioUrl as string,
          prompt: normalizedContent.prompt as string,
          expectedAnswer: normalizedContent.expectedAnswer as string,
          alternateAnswers: normalizedContent.alternateAnswers as string[] | undefined,
          duration: normalizedContent.duration as number | undefined,
        }),
        ...(cardType === 'definition' && {
          definition: normalizedContent.definition as string,
          expectedAnswer: normalizedContent.expectedAnswer as string,
          alternateAnswers: normalizedContent.alternateAnswers as string[] | undefined,
          partOfSpeech: normalizedContent.partOfSpeech as string | undefined,
          exampleSentence: normalizedContent.exampleSentence as string | undefined,
        }),
        ...(cardType === 'cloze' && {
          sentence: normalizedContent.sentence as string,
          blank: normalizedContent.blank as string,
          expectedAnswer: normalizedContent.expectedAnswer as string,
          alternateAnswers: normalizedContent.alternateAnswers as string[] | undefined,
          blankPosition: normalizedContent.blankPosition as number | undefined,
        }),
        ...(cardType === 'video' && {
          videoUrl: normalizedContent.videoUrl as string,
          prompt: normalizedContent.prompt as string,
          expectedAnswer: normalizedContent.expectedAnswer as string,
          alternateAnswers: normalizedContent.alternateAnswers as string[] | undefined,
          duration: normalizedContent.duration as number | undefined,
          loop: normalizedContent.loop as boolean | undefined,
        }),
        ...(cardType === 'trivia' && {
          question: normalizedContent.question as string,
          expectedAnswer: normalizedContent.expectedAnswer as string,
          alternateAnswers: normalizedContent.alternateAnswers as string[] | undefined,
          explanation: normalizedContent.explanation as string | undefined,
        }),
      } as Card;
    });

    return {
      entryId: entry.entry_id as string,
      term: entry.term as string,
      cards,
    };
  });

  return {
    moduleId: metadata.module_id as string,
    title: metadata.title as string,
    language: metadata.language as string,
    version: metadata.version as string,
    entries,
    description: metadata.description as string | undefined,
    author: metadata.author as string | undefined,
    tags: metadata.tags as string[] | undefined,
  };
}

/**
 * Calculates statistics about a module.
 */
export function calculateModuleStats(module: VocabularyModule): ModuleStats {
  const cardTypeDistribution: Record<string, number> = {};
  let totalCards = 0;

  module.entries.forEach((entry) => {
    entry.cards.forEach((card) => {
      totalCards++;
      cardTypeDistribution[card.type] = (cardTypeDistribution[card.type] || 0) + 1;
    });
  });

  return {
    totalEntries: module.entries.length,
    totalCards,
    cardTypeDistribution,
    averageCardsPerEntry: totalCards / module.entries.length,
  };
}

/**
 * Generates a sample module template for download.
 */
export function generateSampleModule(): string {
  const sample = {
    schema_version: '1.0.0',
    module_metadata: {
      module_id: 'my-vocabulary-module',
      title: 'My Vocabulary Module',
      version: '1.0.0',
      language: 'en',
      description: 'A sample vocabulary module',
      author: 'Your Name',
    },
    vocabulary_entries: [
      {
        entry_id: 'example-001',
        term: 'example',
        cards: [
          {
            card_id: 'example-001-def-01',
            card_type: 'definition',
            content: {
              definition: 'A thing that illustrates a general rule or principle',
              expected_answer: 'example',
              alternative_answers: ['sample', 'instance'],
            },
          },
          {
            card_id: 'example-001-img-01',
            card_type: 'image',
            content: {
              image_url: './images/example.jpg',
              prompt: 'What word does this image represent?',
              expected_answer: 'example',
            },
          },
        ],
      },
    ],
  };

  return JSON.stringify(sample, null, 2);
}
