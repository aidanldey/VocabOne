/**
 * Example instances for testing the vocabulary learning system types.
 * These examples demonstrate proper usage and can be used in unit tests.
 */

import {
  CardType,
  ImageCard,
  AudioCard,
  DefinitionCard,
  ClozeCard,
  VideoCard,
  TriviaCard,
  VocabularyEntry,
  VocabularyModule,
  UserProgress,
  SessionState,
  SessionStats,
  ReviewQuality,
  ValidationResult,
  ValidationConfig,
  Result,
} from './types';

// =============================================================================
// EXAMPLE CARDS
// =============================================================================

/**
 * Example image card for learning the Spanish word "perro" (dog).
 */
export const exampleImageCard: ImageCard = {
  cardId: 'perro-001-img-01',
  type: CardType.IMAGE,
  imageUrl: '/modules/spanish-animals/media/perro.jpg',
  prompt: 'What animal is this?',
  expectedAnswer: 'perro',
  alternateAnswers: ['el perro', 'un perro'],
  altText: 'A golden retriever sitting in a park',
  hint: 'It is a common household pet that barks',
  tags: ['animals', 'pets'],
};

/**
 * Example audio card for learning the French word "bonjour" (hello).
 */
export const exampleAudioCard: AudioCard = {
  cardId: 'bonjour-001-audio-01',
  type: CardType.AUDIO,
  audioUrl: '/modules/french-greetings/media/bonjour.mp3',
  prompt: 'What word do you hear?',
  expectedAnswer: 'bonjour',
  alternateAnswers: ['Bonjour'],
  duration: 2.5,
  hint: 'A common greeting used during the day',
  tags: ['greetings', 'basic'],
};

/**
 * Example definition card for learning "ubiquitous".
 */
export const exampleDefinitionCard: DefinitionCard = {
  cardId: 'ubiquitous-001-def-01',
  type: CardType.DEFINITION,
  definition: 'Present, appearing, or found everywhere; widespread',
  expectedAnswer: 'ubiquitous',
  alternateAnswers: ['ubiquitious'], // Common misspelling
  partOfSpeech: 'adjective',
  exampleSentence: 'Smartphones have become ubiquitous in modern society.',
  hint: 'Starts with "ubi-" from Latin meaning "everywhere"',
  tags: ['advanced', 'academic'],
};

/**
 * Example cloze card for learning "mitochondria".
 */
export const exampleClozeCard: ClozeCard = {
  cardId: 'mitochondria-001-cloze-01',
  type: CardType.CLOZE,
  sentence: 'The ___ is known as the powerhouse of the cell.',
  blank: 'mitochondria',
  expectedAnswer: 'mitochondria',
  alternateAnswers: ['mitochondrion'],
  blankPosition: 1,
  hint: 'This organelle produces ATP',
  tags: ['biology', 'cells'],
};

/**
 * Example video card for learning "run" in sign language.
 */
export const exampleVideoCard: VideoCard = {
  cardId: 'run-001-video-01',
  type: CardType.VIDEO,
  videoUrl: '/modules/asl-verbs/media/run.mp4',
  prompt: 'What action is being signed?',
  expectedAnswer: 'run',
  alternateAnswers: ['running', 'to run'],
  duration: 5,
  loop: true,
  hint: 'A fast locomotion verb',
  tags: ['verbs', 'actions'],
};

/**
 * Example trivia card for cultural knowledge.
 */
export const exampleTriviaCard: TriviaCard = {
  cardId: 'paella-001-trivia-01',
  type: CardType.TRIVIA,
  question: 'What is the traditional Spanish rice dish from Valencia called?',
  expectedAnswer: 'paella',
  alternateAnswers: ['la paella'],
  explanation: 'Paella originated in Valencia and traditionally contains rice, saffron, vegetables, and meat or seafood.',
  hint: 'Named after the pan it is cooked in',
  tags: ['food', 'culture', 'spanish'],
};

// =============================================================================
// EXAMPLE PROGRESS
// =============================================================================

/**
 * Example progress for a new entry (just started learning).
 */
export const exampleNewProgress: UserProgress = {
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
  lastReview: null,
  nextReview: new Date().toISOString(),
  totalReviews: 0,
  correctCount: 0,
  incorrectCount: 0,
  streak: 0,
  mastered: false,
};

/**
 * Example progress for an entry in learning phase.
 */
export const exampleLearningProgress: UserProgress = {
  interval: 6,
  easeFactor: 2.6,
  repetitions: 2,
  lastReview: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  nextReview: new Date().toISOString(),
  totalReviews: 3,
  correctCount: 2,
  incorrectCount: 1,
  streak: 2,
  mastered: false,
};

/**
 * Example progress for a mastered entry.
 */
export const exampleMasteredProgress: UserProgress = {
  interval: 30,
  easeFactor: 2.8,
  repetitions: 8,
  lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  nextReview: new Date().toISOString(),
  totalReviews: 12,
  correctCount: 11,
  incorrectCount: 1,
  streak: 8,
  mastered: true,
};

// =============================================================================
// EXAMPLE VOCABULARY ENTRIES
// =============================================================================

/**
 * Example vocabulary entry with multiple card types.
 */
export const exampleVocabularyEntry: VocabularyEntry = {
  entryId: 'perro-001',
  term: 'perro',
  cards: [
    exampleImageCard,
    {
      cardId: 'perro-001-def-01',
      type: CardType.DEFINITION,
      definition: 'A domesticated carnivorous mammal that typically has a long snout and barks',
      expectedAnswer: 'perro',
      alternateAnswers: ['el perro'],
      partOfSpeech: 'noun',
      exampleSentence: 'El perro corre en el parque.',
    } as DefinitionCard,
    {
      cardId: 'perro-001-cloze-01',
      type: CardType.CLOZE,
      sentence: 'Mi ___ es muy amigable.',
      blank: 'perro',
      expectedAnswer: 'perro',
    } as ClozeCard,
  ],
  progress: exampleLearningProgress,
  pronunciation: '/ˈpe.ro/',
  difficulty: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T10:30:00Z',
};

/**
 * Example vocabulary entry for a mastered term.
 */
export const exampleMasteredEntry: VocabularyEntry = {
  entryId: 'gato-002',
  term: 'gato',
  cards: [
    {
      cardId: 'gato-002-img-01',
      type: CardType.IMAGE,
      imageUrl: '/modules/spanish-animals/media/gato.jpg',
      prompt: 'What animal is this?',
      expectedAnswer: 'gato',
      alternateAnswers: ['el gato', 'un gato'],
      altText: 'A tabby cat sleeping on a couch',
    } as ImageCard,
    {
      cardId: 'gato-002-audio-01',
      type: CardType.AUDIO,
      audioUrl: '/modules/spanish-animals/media/gato.mp3',
      prompt: 'What word do you hear?',
      expectedAnswer: 'gato',
      duration: 1.5,
    } as AudioCard,
  ],
  progress: exampleMasteredProgress,
  pronunciation: '/ˈɡa.to/',
  difficulty: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-02-20T14:00:00Z',
};

// =============================================================================
// EXAMPLE MODULE
// =============================================================================

/**
 * Example vocabulary module for Spanish animal vocabulary.
 */
export const exampleVocabularyModule: VocabularyModule = {
  moduleId: 'spanish-animals-basics',
  title: 'Spanish Animals - Basics',
  language: 'es',
  version: '1.0.0',
  description: 'Learn common animal names in Spanish with images, audio, and contextual examples.',
  author: 'VocabOne Team',
  tags: ['spanish', 'animals', 'beginner', 'vocabulary'],
  entries: [exampleVocabularyEntry, exampleMasteredEntry],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-02-20T14:00:00Z',
  license: 'CC-BY-4.0',
};

// =============================================================================
// EXAMPLE SESSION STATE
// =============================================================================

/**
 * Example session statistics.
 */
export const exampleSessionStats: SessionStats = {
  totalReviewed: 15,
  correctAnswers: 12,
  incorrectAnswers: 3,
  accuracy: 80,
  averageResponseTime: 3500,
  totalTime: 600000, // 10 minutes
};

/**
 * Example active session state.
 */
export const exampleSessionState: SessionState = {
  currentCard: exampleImageCard,
  currentEntry: exampleVocabularyEntry,
  queue: [exampleMasteredEntry],
  completed: [],
  stats: {
    totalReviewed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    averageResponseTime: 0,
    totalTime: 0,
  },
  startTime: new Date().toISOString(),
  endTime: null,
  isActive: true,
  moduleId: 'spanish-animals-basics',
};

/**
 * Example completed session state.
 */
export const exampleCompletedSessionState: SessionState = {
  currentCard: null,
  currentEntry: null,
  queue: [],
  completed: [exampleVocabularyEntry, exampleMasteredEntry],
  stats: exampleSessionStats,
  startTime: new Date(Date.now() - 600000).toISOString(),
  endTime: new Date().toISOString(),
  isActive: false,
  moduleId: 'spanish-animals-basics',
};

// =============================================================================
// EXAMPLE VALIDATION RESULTS
// =============================================================================

/**
 * Example validation configuration with fuzzy matching enabled.
 */
export const exampleValidationConfig: ValidationConfig = {
  threshold: 0.8,
  ignoreCase: true,
  ignoreAccents: true,
  trimWhitespace: true,
  fuzzyMatching: true,
  maxEditDistance: 2,
};

/**
 * Example validation result for a correct answer.
 */
export const exampleCorrectValidation: ValidationResult = {
  isCorrect: true,
  confidence: 1.0,
  feedback: 'Perfect! Your answer matches exactly.',
  userAnswer: 'perro',
  expectedAnswer: 'perro',
  responseTime: 2500,
  suggestedQuality: ReviewQuality.EASY,
};

/**
 * Example validation result for a nearly correct answer (fuzzy match).
 */
export const exampleFuzzyValidation: ValidationResult = {
  isCorrect: true,
  confidence: 0.85,
  feedback: 'Close enough! The exact spelling is "perro".',
  userAnswer: 'pero',
  expectedAnswer: 'perro',
  responseTime: 4000,
  suggestedQuality: ReviewQuality.GOOD,
};

/**
 * Example validation result for an incorrect answer.
 */
export const exampleIncorrectValidation: ValidationResult = {
  isCorrect: false,
  confidence: 0.3,
  feedback: 'Not quite. The correct answer is "perro".',
  userAnswer: 'gato',
  expectedAnswer: 'perro',
  responseTime: 8000,
  suggestedQuality: ReviewQuality.AGAIN,
};

// =============================================================================
// EXAMPLE RESULT TYPE USAGE
// =============================================================================

/**
 * Example successful result.
 */
export const exampleSuccessResult: Result<VocabularyModule> = {
  success: true,
  data: exampleVocabularyModule,
};

/**
 * Example failure result.
 */
export const exampleFailureResult: Result<VocabularyModule> = {
  success: false,
  error: 'Module file not found at specified path',
  code: 'MODULE_NOT_FOUND',
};

/**
 * Example of type-safe error handling with Result type.
 */
export function demonstrateResultUsage(): void {
  const result = exampleSuccessResult;

  if (result.success) {
    // TypeScript knows result.data is VocabularyModule here
    console.log(`Loaded module: ${result.data.title}`);
    console.log(`Entries: ${result.data.entries.length}`);
  } else {
    // TypeScript knows result.error is string here
    console.error(`Error: ${result.error}`);
    if (result.code) {
      console.error(`Error code: ${result.code}`);
    }
  }
}
