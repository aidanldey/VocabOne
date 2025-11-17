/**
 * Module loader service for importing and validating vocabulary modules.
 * Handles JSON parsing, validation, and error reporting.
 */

import {
  type Result,
  type VocabularyModule,
  type VocabularyEntry,
  type Card,
  CardType,
} from '@/models/types';

/**
 * Error codes for module loading failures.
 */
export enum ModuleLoaderErrorCode {
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_STRUCTURE = 'INVALID_STRUCTURE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE = 'INVALID_FIELD_TYPE',
  INVALID_MODULE_ID = 'INVALID_MODULE_ID',
  INVALID_LANGUAGE_CODE = 'INVALID_LANGUAGE_CODE',
  INVALID_VERSION = 'INVALID_VERSION',
  EMPTY_ENTRIES = 'EMPTY_ENTRIES',
  INVALID_ENTRY = 'INVALID_ENTRY',
  INVALID_CARD = 'INVALID_CARD',
  DUPLICATE_ID = 'DUPLICATE_ID',
}

/**
 * Parses a JSON file and returns the parsed data.
 *
 * @param file - The File object to parse
 * @returns Promise resolving to the parsed JSON data
 */
export async function parseJSON(file: File): Promise<Result<unknown>> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `Invalid JSON syntax: ${error.message}`,
        code: ModuleLoaderErrorCode.INVALID_JSON,
      };
    }
    return {
      success: false,
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: ModuleLoaderErrorCode.FILE_READ_ERROR,
    };
  }
}

/**
 * Validates that an object is a valid VocabularyModule.
 *
 * @param data - The unknown data to validate
 * @returns Result containing the validated module or an error
 */
export function validateModule(data: unknown): Result<VocabularyModule> {
  // Check if data is an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      success: false,
      error: 'Module must be a JSON object',
      code: ModuleLoaderErrorCode.INVALID_STRUCTURE,
    };
  }

  const obj = data as Record<string, unknown>;

  // Validate required top-level fields
  const moduleIdResult = validateModuleId(obj.moduleId);
  if (!moduleIdResult.success) return moduleIdResult;

  const titleResult = validateTitle(obj.title);
  if (!titleResult.success) return titleResult;

  const languageResult = validateLanguage(obj.language);
  if (!languageResult.success) return languageResult;

  const versionResult = validateVersion(obj.version);
  if (!versionResult.success) return versionResult;

  const entriesResult = validateEntries(obj.entries);
  if (!entriesResult.success) return entriesResult;

  // Build the validated module
  const module: VocabularyModule = {
    moduleId: obj.moduleId as string,
    title: obj.title as string,
    language: obj.language as string,
    version: obj.version as string,
    entries: entriesResult.data,
  };

  // Add optional fields if present
  if (typeof obj.description === 'string') {
    module.description = obj.description;
  }
  if (typeof obj.author === 'string') {
    module.author = obj.author;
  }
  if (Array.isArray(obj.tags) && obj.tags.every((t) => typeof t === 'string')) {
    module.tags = obj.tags as string[];
  }
  if (typeof obj.createdAt === 'string') {
    module.createdAt = obj.createdAt;
  }
  if (typeof obj.updatedAt === 'string') {
    module.updatedAt = obj.updatedAt;
  }
  if (typeof obj.license === 'string') {
    module.license = obj.license;
  }

  // Check for duplicate IDs
  const duplicateResult = checkForDuplicateIds(module);
  if (!duplicateResult.success) return duplicateResult;

  return { success: true, data: module };
}

/**
 * Validates the moduleId field.
 */
function validateModuleId(moduleId: unknown): Result<string> {
  if (typeof moduleId !== 'string') {
    return {
      success: false,
      error: 'moduleId is required and must be a string',
      code: ModuleLoaderErrorCode.MISSING_REQUIRED_FIELD,
    };
  }

  // Validate kebab-case format
  const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabCasePattern.test(moduleId)) {
    return {
      success: false,
      error: `moduleId "${moduleId}" must be in kebab-case format (e.g., "spanish-animals-basics")`,
      code: ModuleLoaderErrorCode.INVALID_MODULE_ID,
    };
  }

  if (moduleId.length > 100) {
    return {
      success: false,
      error: 'moduleId must be 100 characters or less',
      code: ModuleLoaderErrorCode.INVALID_MODULE_ID,
    };
  }

  return { success: true, data: moduleId };
}

/**
 * Validates the title field.
 */
function validateTitle(title: unknown): Result<string> {
  if (typeof title !== 'string') {
    return {
      success: false,
      error: 'title is required and must be a string',
      code: ModuleLoaderErrorCode.MISSING_REQUIRED_FIELD,
    };
  }

  if (title.trim().length === 0) {
    return {
      success: false,
      error: 'title cannot be empty',
      code: ModuleLoaderErrorCode.INVALID_FIELD_TYPE,
    };
  }

  if (title.length > 100) {
    return {
      success: false,
      error: 'title must be 100 characters or less',
      code: ModuleLoaderErrorCode.INVALID_FIELD_TYPE,
    };
  }

  return { success: true, data: title };
}

/**
 * Validates the language code (ISO 639-1).
 */
function validateLanguage(language: unknown): Result<string> {
  if (typeof language !== 'string') {
    return {
      success: false,
      error: 'language is required and must be a string',
      code: ModuleLoaderErrorCode.MISSING_REQUIRED_FIELD,
    };
  }

  // ISO 639-1 is 2 lowercase letters
  const iso639Pattern = /^[a-z]{2}$/;
  if (!iso639Pattern.test(language)) {
    return {
      success: false,
      error: `language "${language}" must be a valid ISO 639-1 code (e.g., "es", "en", "fr")`,
      code: ModuleLoaderErrorCode.INVALID_LANGUAGE_CODE,
    };
  }

  return { success: true, data: language };
}

/**
 * Validates the version string (semantic versioning).
 */
function validateVersion(version: unknown): Result<string> {
  if (typeof version !== 'string') {
    return {
      success: false,
      error: 'version is required and must be a string',
      code: ModuleLoaderErrorCode.MISSING_REQUIRED_FIELD,
    };
  }

  // Semantic versioning pattern
  const semverPattern = /^\d+\.\d+\.\d+$/;
  if (!semverPattern.test(version)) {
    return {
      success: false,
      error: `version "${version}" must be in semantic versioning format (e.g., "1.0.0")`,
      code: ModuleLoaderErrorCode.INVALID_VERSION,
    };
  }

  return { success: true, data: version };
}

/**
 * Validates the entries array.
 */
function validateEntries(entries: unknown): Result<VocabularyEntry[]> {
  if (!Array.isArray(entries)) {
    return {
      success: false,
      error: 'entries is required and must be an array',
      code: ModuleLoaderErrorCode.MISSING_REQUIRED_FIELD,
    };
  }

  if (entries.length === 0) {
    return {
      success: false,
      error: 'entries array cannot be empty',
      code: ModuleLoaderErrorCode.EMPTY_ENTRIES,
    };
  }

  const validatedEntries: VocabularyEntry[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entryResult = validateEntry(entries[i], i);
    if (!entryResult.success) {
      return entryResult;
    }
    validatedEntries.push(entryResult.data);
  }

  return { success: true, data: validatedEntries };
}

/**
 * Validates a single vocabulary entry.
 */
function validateEntry(entry: unknown, index: number): Result<VocabularyEntry> {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return {
      success: false,
      error: `Entry at index ${index} must be an object`,
      code: ModuleLoaderErrorCode.INVALID_ENTRY,
    };
  }

  const obj = entry as Record<string, unknown>;

  // Validate entryId
  if (typeof obj.entryId !== 'string' || obj.entryId.trim().length === 0) {
    return {
      success: false,
      error: `Entry at index ${index} must have a valid entryId string`,
      code: ModuleLoaderErrorCode.INVALID_ENTRY,
    };
  }

  // Validate term
  if (typeof obj.term !== 'string' || obj.term.trim().length === 0) {
    return {
      success: false,
      error: `Entry "${obj.entryId}" must have a valid term string`,
      code: ModuleLoaderErrorCode.INVALID_ENTRY,
    };
  }

  // Validate cards
  if (!Array.isArray(obj.cards) || obj.cards.length === 0) {
    return {
      success: false,
      error: `Entry "${obj.entryId}" must have at least one card`,
      code: ModuleLoaderErrorCode.INVALID_ENTRY,
    };
  }

  const validatedCards: Card[] = [];
  for (let i = 0; i < obj.cards.length; i++) {
    const cardResult = validateCard(obj.cards[i], obj.entryId as string, i);
    if (!cardResult.success) {
      return cardResult;
    }
    validatedCards.push(cardResult.data);
  }

  const validatedEntry: VocabularyEntry = {
    entryId: obj.entryId as string,
    term: obj.term as string,
    cards: validatedCards,
  };

  // Add optional fields
  if (typeof obj.pronunciation === 'string') {
    validatedEntry.pronunciation = obj.pronunciation;
  }
  if (typeof obj.userNotes === 'string') {
    validatedEntry.userNotes = obj.userNotes;
  }
  if (typeof obj.difficulty === 'number' && obj.difficulty >= 1 && obj.difficulty <= 5) {
    validatedEntry.difficulty = obj.difficulty;
  }
  if (typeof obj.createdAt === 'string') {
    validatedEntry.createdAt = obj.createdAt;
  }
  if (typeof obj.updatedAt === 'string') {
    validatedEntry.updatedAt = obj.updatedAt;
  }

  return { success: true, data: validatedEntry };
}

/**
 * Validates a single card.
 */
function validateCard(card: unknown, entryId: string, cardIndex: number): Result<Card> {
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return {
      success: false,
      error: `Card at index ${cardIndex} in entry "${entryId}" must be an object`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  const obj = card as Record<string, unknown>;

  // Validate cardId
  if (typeof obj.cardId !== 'string' || obj.cardId.trim().length === 0) {
    return {
      success: false,
      error: `Card at index ${cardIndex} in entry "${entryId}" must have a valid cardId`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  // Validate type
  if (typeof obj.type !== 'string' || !Object.values(CardType).includes(obj.type as CardType)) {
    return {
      success: false,
      error: `Card "${obj.cardId}" has invalid type. Must be one of: ${Object.values(CardType).join(', ')}`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  const cardType = obj.type as CardType;

  // Validate type-specific fields
  switch (cardType) {
    case CardType.IMAGE:
      return validateImageCard(obj);
    case CardType.AUDIO:
      return validateAudioCard(obj);
    case CardType.DEFINITION:
      return validateDefinitionCard(obj);
    case CardType.CLOZE:
      return validateClozeCard(obj);
    case CardType.VIDEO:
      return validateVideoCard(obj);
    case CardType.TRIVIA:
      return validateTriviaCard(obj);
    default:
      return {
        success: false,
        error: `Unknown card type: ${cardType}`,
        code: ModuleLoaderErrorCode.INVALID_CARD,
      };
  }
}

/**
 * Validates an image card.
 */
function validateImageCard(obj: Record<string, unknown>): Result<Card> {
  if (typeof obj.imageUrl !== 'string' || obj.imageUrl.trim().length === 0) {
    return {
      success: false,
      error: `Image card "${obj.cardId}" must have an imageUrl`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.prompt !== 'string' || obj.prompt.trim().length === 0) {
    return {
      success: false,
      error: `Image card "${obj.cardId}" must have a prompt`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.expectedAnswer !== 'string' || obj.expectedAnswer.trim().length === 0) {
    return {
      success: false,
      error: `Image card "${obj.cardId}" must have an expectedAnswer`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  return {
    success: true,
    data: {
      cardId: obj.cardId as string,
      type: CardType.IMAGE,
      imageUrl: obj.imageUrl as string,
      prompt: obj.prompt as string,
      expectedAnswer: obj.expectedAnswer as string,
      alternateAnswers: Array.isArray(obj.alternateAnswers)
        ? (obj.alternateAnswers as string[])
        : undefined,
      altText: typeof obj.altText === 'string' ? obj.altText : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    },
  };
}

/**
 * Validates an audio card.
 */
function validateAudioCard(obj: Record<string, unknown>): Result<Card> {
  if (typeof obj.audioUrl !== 'string' || obj.audioUrl.trim().length === 0) {
    return {
      success: false,
      error: `Audio card "${obj.cardId}" must have an audioUrl`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.prompt !== 'string' || obj.prompt.trim().length === 0) {
    return {
      success: false,
      error: `Audio card "${obj.cardId}" must have a prompt`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.expectedAnswer !== 'string' || obj.expectedAnswer.trim().length === 0) {
    return {
      success: false,
      error: `Audio card "${obj.cardId}" must have an expectedAnswer`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  return {
    success: true,
    data: {
      cardId: obj.cardId as string,
      type: CardType.AUDIO,
      audioUrl: obj.audioUrl as string,
      prompt: obj.prompt as string,
      expectedAnswer: obj.expectedAnswer as string,
      alternateAnswers: Array.isArray(obj.alternateAnswers)
        ? (obj.alternateAnswers as string[])
        : undefined,
      duration: typeof obj.duration === 'number' ? obj.duration : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    },
  };
}

/**
 * Validates a definition card.
 */
function validateDefinitionCard(obj: Record<string, unknown>): Result<Card> {
  if (typeof obj.definition !== 'string' || obj.definition.trim().length === 0) {
    return {
      success: false,
      error: `Definition card "${obj.cardId}" must have a definition`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.expectedAnswer !== 'string' || obj.expectedAnswer.trim().length === 0) {
    return {
      success: false,
      error: `Definition card "${obj.cardId}" must have an expectedAnswer`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  return {
    success: true,
    data: {
      cardId: obj.cardId as string,
      type: CardType.DEFINITION,
      definition: obj.definition as string,
      expectedAnswer: obj.expectedAnswer as string,
      alternateAnswers: Array.isArray(obj.alternateAnswers)
        ? (obj.alternateAnswers as string[])
        : undefined,
      partOfSpeech: typeof obj.partOfSpeech === 'string' ? obj.partOfSpeech : undefined,
      exampleSentence: typeof obj.exampleSentence === 'string' ? obj.exampleSentence : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    },
  };
}

/**
 * Validates a cloze card.
 */
function validateClozeCard(obj: Record<string, unknown>): Result<Card> {
  if (typeof obj.sentence !== 'string' || obj.sentence.trim().length === 0) {
    return {
      success: false,
      error: `Cloze card "${obj.cardId}" must have a sentence`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.blank !== 'string' || obj.blank.trim().length === 0) {
    return {
      success: false,
      error: `Cloze card "${obj.cardId}" must have a blank`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.expectedAnswer !== 'string' || obj.expectedAnswer.trim().length === 0) {
    return {
      success: false,
      error: `Cloze card "${obj.cardId}" must have an expectedAnswer`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  return {
    success: true,
    data: {
      cardId: obj.cardId as string,
      type: CardType.CLOZE,
      sentence: obj.sentence as string,
      blank: obj.blank as string,
      expectedAnswer: obj.expectedAnswer as string,
      alternateAnswers: Array.isArray(obj.alternateAnswers)
        ? (obj.alternateAnswers as string[])
        : undefined,
      blankPosition: typeof obj.blankPosition === 'number' ? obj.blankPosition : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    },
  };
}

/**
 * Validates a video card.
 */
function validateVideoCard(obj: Record<string, unknown>): Result<Card> {
  if (typeof obj.videoUrl !== 'string' || obj.videoUrl.trim().length === 0) {
    return {
      success: false,
      error: `Video card "${obj.cardId}" must have a videoUrl`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.prompt !== 'string' || obj.prompt.trim().length === 0) {
    return {
      success: false,
      error: `Video card "${obj.cardId}" must have a prompt`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.expectedAnswer !== 'string' || obj.expectedAnswer.trim().length === 0) {
    return {
      success: false,
      error: `Video card "${obj.cardId}" must have an expectedAnswer`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  return {
    success: true,
    data: {
      cardId: obj.cardId as string,
      type: CardType.VIDEO,
      videoUrl: obj.videoUrl as string,
      prompt: obj.prompt as string,
      expectedAnswer: obj.expectedAnswer as string,
      alternateAnswers: Array.isArray(obj.alternateAnswers)
        ? (obj.alternateAnswers as string[])
        : undefined,
      duration: typeof obj.duration === 'number' ? obj.duration : undefined,
      loop: typeof obj.loop === 'boolean' ? obj.loop : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    },
  };
}

/**
 * Validates a trivia card.
 */
function validateTriviaCard(obj: Record<string, unknown>): Result<Card> {
  if (typeof obj.question !== 'string' || obj.question.trim().length === 0) {
    return {
      success: false,
      error: `Trivia card "${obj.cardId}" must have a question`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }
  if (typeof obj.expectedAnswer !== 'string' || obj.expectedAnswer.trim().length === 0) {
    return {
      success: false,
      error: `Trivia card "${obj.cardId}" must have an expectedAnswer`,
      code: ModuleLoaderErrorCode.INVALID_CARD,
    };
  }

  return {
    success: true,
    data: {
      cardId: obj.cardId as string,
      type: CardType.TRIVIA,
      question: obj.question as string,
      expectedAnswer: obj.expectedAnswer as string,
      alternateAnswers: Array.isArray(obj.alternateAnswers)
        ? (obj.alternateAnswers as string[])
        : undefined,
      explanation: typeof obj.explanation === 'string' ? obj.explanation : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    },
  };
}

/**
 * Checks for duplicate entry IDs and card IDs within a module.
 */
function checkForDuplicateIds(module: VocabularyModule): Result<VocabularyModule> {
  const entryIds = new Set<string>();
  const cardIds = new Set<string>();

  for (const entry of module.entries) {
    if (entryIds.has(entry.entryId)) {
      return {
        success: false,
        error: `Duplicate entry ID found: "${entry.entryId}"`,
        code: ModuleLoaderErrorCode.DUPLICATE_ID,
      };
    }
    entryIds.add(entry.entryId);

    for (const card of entry.cards) {
      if (cardIds.has(card.cardId)) {
        return {
          success: false,
          error: `Duplicate card ID found: "${card.cardId}"`,
          code: ModuleLoaderErrorCode.DUPLICATE_ID,
        };
      }
      cardIds.add(card.cardId);
    }
  }

  return { success: true, data: module };
}

/**
 * Loads and validates a vocabulary module from a JSON file.
 *
 * @param file - The File object containing the module JSON
 * @returns Promise resolving to the validated module or an error
 */
export async function loadModule(file: File): Promise<Result<VocabularyModule>> {
  // Parse the JSON file
  const parseResult = await parseJSON(file);
  if (!parseResult.success) {
    return parseResult;
  }

  // Validate the module structure
  return validateModule(parseResult.data);
}

/**
 * Loads a module from a JSON string (useful for testing).
 *
 * @param jsonString - The JSON string to parse and validate
 * @returns Result containing the validated module or an error
 */
export function loadModuleFromString(jsonString: string): Result<VocabularyModule> {
  try {
    const data = JSON.parse(jsonString);
    return validateModule(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `Invalid JSON syntax: ${error.message}`,
        code: ModuleLoaderErrorCode.INVALID_JSON,
      };
    }
    return {
      success: false,
      error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: ModuleLoaderErrorCode.INVALID_JSON,
    };
  }
}
