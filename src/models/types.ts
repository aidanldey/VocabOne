/**
 * Core domain types for the VocabOne vocabulary learning system.
 * These types define the structure for modules, entries, cards, and progress tracking.
 */

// =============================================================================
// CARD TYPES - Discriminated Union Pattern
// =============================================================================

/**
 * Enumeration of supported card types in the learning system.
 * Each type represents a different modality for testing vocabulary knowledge.
 */
export enum CardType {
  IMAGE = 'image',
  AUDIO = 'audio',
  DEFINITION = 'definition',
  CLOZE = 'cloze',
  VIDEO = 'video',
  TRIVIA = 'trivia',
}

/**
 * Base interface for all card types.
 * Uses discriminated union pattern with `type` as the discriminant.
 */
interface BaseCard {
  /** Unique identifier for the card (format: entry-type-number, e.g., "perro-001-img-01") */
  cardId: string;
  /** The type of card - used as discriminant for union */
  type: CardType;
  /** Optional hint to show if user struggles */
  hint?: string;
  /** Optional tags for categorization */
  tags?: string[];
}

/**
 * Card that displays an image and asks the user to identify the vocabulary term.
 * Best for visual learning and concrete nouns.
 */
export interface ImageCard extends BaseCard {
  type: CardType.IMAGE;
  /** URL or relative path to the image file */
  imageUrl: string;
  /** Question or instruction shown to the user (e.g., "What animal is this?") */
  prompt: string;
  /** The correct answer the user should type */
  expectedAnswer: string;
  /** Alternative acceptable answers (synonyms, alternate spellings) */
  alternateAnswers?: string[];
  /** Optional alt text for accessibility */
  altText?: string;
}

/**
 * Card that plays an audio clip and asks the user to identify or transcribe.
 * Useful for pronunciation and listening comprehension.
 */
export interface AudioCard extends BaseCard {
  type: CardType.AUDIO;
  /** URL or relative path to the audio file (mp3, wav, ogg) */
  audioUrl: string;
  /** Question or instruction (e.g., "What word do you hear?") */
  prompt: string;
  /** The correct answer */
  expectedAnswer: string;
  /** Alternative acceptable answers */
  alternateAnswers?: string[];
  /** Duration of audio in seconds */
  duration?: number;
}

/**
 * Card that provides a text definition and asks for the term.
 * Tests comprehension and recall from semantic description.
 */
export interface DefinitionCard extends BaseCard {
  type: CardType.DEFINITION;
  /** The definition or description of the term */
  definition: string;
  /** The correct vocabulary term */
  expectedAnswer: string;
  /** Alternative acceptable answers */
  alternateAnswers?: string[];
  /** Part of speech (noun, verb, adjective, etc.) */
  partOfSpeech?: string;
  /** Example sentence using the term */
  exampleSentence?: string;
}

/**
 * Card with a fill-in-the-blank sentence.
 * Tests understanding in context.
 */
export interface ClozeCard extends BaseCard {
  type: CardType.CLOZE;
  /** The sentence with a blank (use "___" or similar placeholder) */
  sentence: string;
  /** The word that should fill the blank */
  blank: string;
  /** The expected answer (usually same as blank) */
  expectedAnswer: string;
  /** Alternative acceptable answers */
  alternateAnswers?: string[];
  /** Position of the blank in the sentence (word index) */
  blankPosition?: number;
}

/**
 * Card that plays a video clip for learning actions or context.
 * Good for verbs, actions, and cultural context.
 */
export interface VideoCard extends BaseCard {
  type: CardType.VIDEO;
  /** URL or relative path to video file (mp4, webm) */
  videoUrl: string;
  /** Question or instruction */
  prompt: string;
  /** The correct answer */
  expectedAnswer: string;
  /** Alternative acceptable answers */
  alternateAnswers?: string[];
  /** Duration in seconds (max 30s recommended) */
  duration?: number;
  /** Whether to loop the video */
  loop?: boolean;
}

/**
 * Card with trivia or cultural knowledge question.
 * Tests association and broader context.
 */
export interface TriviaCard extends BaseCard {
  type: CardType.TRIVIA;
  /** The trivia question */
  question: string;
  /** The expected answer */
  expectedAnswer: string;
  /** Alternative acceptable answers */
  alternateAnswers?: string[];
  /** Additional context or explanation */
  explanation?: string;
}

/**
 * Union type representing any card type in the system.
 * Use type guards or switch on `type` to narrow.
 */
export type Card = ImageCard | AudioCard | DefinitionCard | ClozeCard | VideoCard | TriviaCard;

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

/**
 * Represents a single vocabulary term with all its associated cards.
 * A term can have multiple cards to test knowledge from different angles.
 */
export interface VocabularyEntry {
  /** Unique identifier for the entry (format: descriptive-number, e.g., "perro-001") */
  entryId: string;
  /** The vocabulary term being learned */
  term: string;
  /** Array of cards testing this term (minimum 1, recommended 3-5) */
  cards: Card[];
  /** User's learning progress for this entry */
  progress?: UserProgress;
  /** Optional phonetic pronunciation */
  pronunciation?: string;
  /** Optional notes added by user */
  userNotes?: string;
  /** Difficulty level (1-5, where 1 is easiest) */
  difficulty?: number;
  /** ISO 8601 timestamp when entry was created */
  createdAt?: string;
  /** ISO 8601 timestamp when entry was last modified */
  updatedAt?: string;
}

/**
 * Represents a complete vocabulary learning module.
 * A module is a self-contained package of vocabulary entries.
 */
export interface VocabularyModule {
  /** Unique identifier for the module (kebab-case, e.g., "spanish-animals-basics") */
  moduleId: string;
  /** Human-readable title of the module */
  title: string;
  /** ISO 639-1 language code (e.g., "es", "fr", "zh") */
  language: string;
  /** Array of vocabulary entries in this module */
  entries: VocabularyEntry[];
  /** Semantic version of the module (e.g., "1.0.0") */
  version: string;
  /** Optional description of the module */
  description?: string;
  /** Optional author information */
  author?: string;
  /** Optional tags for categorization */
  tags?: string[];
  /** ISO 8601 timestamp when module was created */
  createdAt?: string;
  /** ISO 8601 timestamp when module was last updated */
  updatedAt?: string;
  /** Optional license information */
  license?: string;
}

// =============================================================================
// PROGRESS TRACKING TYPES
// =============================================================================

/**
 * Quality of response during review, based on SM-2 algorithm.
 * These values affect how the next review is scheduled.
 */
export enum ReviewQuality {
  /** Complete blackout, no recall at all */
  AGAIN = 0,
  /** Wrong answer, but recognized it after seeing answer */
  HARD = 2,
  /** Correct answer with some hesitation */
  GOOD = 3,
  /** Perfect recall, answered quickly and confidently */
  EASY = 5,
}

/**
 * Tracks a user's learning progress for a specific vocabulary entry.
 * Based on the SM-2 spaced repetition algorithm.
 */
export interface UserProgress {
  /** Number of days until next review */
  interval: number;
  /** Ease factor (starts at 2.5, min 1.3) - affects interval growth */
  easeFactor: number;
  /** Number of consecutive correct reviews */
  repetitions: number;
  /** ISO 8601 timestamp of last review */
  lastReview: string | null;
  /** ISO 8601 timestamp of next scheduled review */
  nextReview: string;
  /** Total number of times this entry has been reviewed */
  totalReviews: number;
  /** Number of correct answers */
  correctCount: number;
  /** Number of incorrect answers */
  incorrectCount: number;
  /** Current streak of correct answers */
  streak: number;
  /** Whether the entry is considered mastered (e.g., interval > 21 days) */
  mastered: boolean;
}

/**
 * Represents the current state of a learning session.
 * Tracks which cards have been shown and performance metrics.
 */
export interface SessionState {
  /** The current card being displayed (null if session not started) */
  currentCard: Card | null;
  /** The current entry being tested */
  currentEntry: VocabularyEntry | null;
  /** Queue of entries waiting to be reviewed */
  queue: VocabularyEntry[];
  /** Entries that have been completed in this session */
  completed: VocabularyEntry[];
  /** Session statistics */
  stats: SessionStats;
  /** Session start time (ISO 8601) */
  startTime: string;
  /** Session end time (ISO 8601, null if ongoing) */
  endTime: string | null;
  /** Whether the session is currently active */
  isActive: boolean;
  /** ID of the module being studied */
  moduleId: string;
}

/**
 * Statistics for a learning session.
 */
export interface SessionStats {
  /** Total cards reviewed in session */
  totalReviewed: number;
  /** Number of correct answers */
  correctAnswers: number;
  /** Number of incorrect answers */
  incorrectAnswers: number;
  /** Accuracy as a percentage (0-100) */
  accuracy: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Total time spent in session in milliseconds */
  totalTime: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Represents the result of an operation that can succeed or fail.
 * Use this instead of throwing exceptions for expected error cases.
 *
 * @template T - The type of the success value
 *
 * @example
 * ```typescript
 * function loadModule(id: string): Result<VocabularyModule> {
 *   if (!id) {
 *     return { success: false, error: 'Module ID is required' };
 *   }
 *   // ... load module
 *   return { success: true, data: module };
 * }
 *
 * const result = loadModule('spanish-basics');
 * if (result.success) {
 *   console.log(result.data.title);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Result of validating a user's answer against expected answer.
 */
export interface ValidationResult {
  /** Whether the answer was accepted as correct */
  isCorrect: boolean;
  /** Confidence score of the match (0-1, where 1 is exact match) */
  confidence: number;
  /** Feedback message for the user */
  feedback: string;
  /** The user's submitted answer */
  userAnswer: string;
  /** The expected correct answer */
  expectedAnswer: string;
  /** Time taken to answer in milliseconds */
  responseTime?: number;
  /** Suggested quality rating based on confidence */
  suggestedQuality: ReviewQuality;
}

/**
 * Configuration for answer validation.
 */
export interface ValidationConfig {
  /** Minimum confidence threshold to accept as correct (0-1) */
  threshold: number;
  /** Whether to ignore case differences */
  ignoreCase: boolean;
  /** Whether to ignore accents/diacritics */
  ignoreAccents: boolean;
  /** Whether to trim whitespace */
  trimWhitespace: boolean;
  /** Whether to allow fuzzy matching */
  fuzzyMatching: boolean;
  /** Maximum Levenshtein distance for fuzzy matching */
  maxEditDistance: number;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a card is an ImageCard.
 */
export function isImageCard(card: Card): card is ImageCard {
  return card.type === CardType.IMAGE;
}

/**
 * Type guard to check if a card is an AudioCard.
 */
export function isAudioCard(card: Card): card is AudioCard {
  return card.type === CardType.AUDIO;
}

/**
 * Type guard to check if a card is a DefinitionCard.
 */
export function isDefinitionCard(card: Card): card is DefinitionCard {
  return card.type === CardType.DEFINITION;
}

/**
 * Type guard to check if a card is a ClozeCard.
 */
export function isClozeCard(card: Card): card is ClozeCard {
  return card.type === CardType.CLOZE;
}

/**
 * Type guard to check if a card is a VideoCard.
 */
export function isVideoCard(card: Card): card is VideoCard {
  return card.type === CardType.VIDEO;
}

/**
 * Type guard to check if a card is a TriviaCard.
 */
export function isTriviaCard(card: Card): card is TriviaCard {
  return card.type === CardType.TRIVIA;
}

/**
 * Type guard to check if a Result is successful.
 */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a Result is a failure.
 */
export function isFailure<T>(result: Result<T>): result is { success: false; error: string; code?: string } {
  return result.success === false;
}
