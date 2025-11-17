import { describe, it, expect } from 'vitest';
import {
  CardType,
  ReviewQuality,
  isImageCard,
  isAudioCard,
  isDefinitionCard,
  isClozeCard,
  isVideoCard,
  isTriviaCard,
  isSuccess,
  isFailure,
  type Card,
  type Result,
  type VocabularyModule,
} from './types';
import {
  exampleImageCard,
  exampleAudioCard,
  exampleDefinitionCard,
  exampleClozeCard,
  exampleVideoCard,
  exampleTriviaCard,
  exampleVocabularyEntry,
  exampleVocabularyModule,
  exampleNewProgress,
  exampleLearningProgress,
  exampleMasteredProgress,
  exampleSuccessResult,
  exampleFailureResult,
  exampleCorrectValidation,
  exampleIncorrectValidation,
} from './examples';

describe('Card Types', () => {
  describe('CardType enum', () => {
    it('should have correct values', () => {
      expect(CardType.IMAGE).toBe('image');
      expect(CardType.AUDIO).toBe('audio');
      expect(CardType.DEFINITION).toBe('definition');
      expect(CardType.CLOZE).toBe('cloze');
      expect(CardType.VIDEO).toBe('video');
      expect(CardType.TRIVIA).toBe('trivia');
    });
  });

  describe('Type guards', () => {
    it('should identify ImageCard correctly', () => {
      expect(isImageCard(exampleImageCard)).toBe(true);
      expect(isImageCard(exampleAudioCard)).toBe(false);
      expect(isImageCard(exampleDefinitionCard)).toBe(false);
    });

    it('should identify AudioCard correctly', () => {
      expect(isAudioCard(exampleAudioCard)).toBe(true);
      expect(isAudioCard(exampleImageCard)).toBe(false);
    });

    it('should identify DefinitionCard correctly', () => {
      expect(isDefinitionCard(exampleDefinitionCard)).toBe(true);
      expect(isDefinitionCard(exampleClozeCard)).toBe(false);
    });

    it('should identify ClozeCard correctly', () => {
      expect(isClozeCard(exampleClozeCard)).toBe(true);
      expect(isClozeCard(exampleDefinitionCard)).toBe(false);
    });

    it('should identify VideoCard correctly', () => {
      expect(isVideoCard(exampleVideoCard)).toBe(true);
      expect(isVideoCard(exampleImageCard)).toBe(false);
    });

    it('should identify TriviaCard correctly', () => {
      expect(isTriviaCard(exampleTriviaCard)).toBe(true);
      expect(isTriviaCard(exampleClozeCard)).toBe(false);
    });
  });

  describe('Card structure', () => {
    it('ImageCard should have required fields', () => {
      expect(exampleImageCard.cardId).toBeDefined();
      expect(exampleImageCard.type).toBe(CardType.IMAGE);
      expect(exampleImageCard.imageUrl).toBeDefined();
      expect(exampleImageCard.prompt).toBeDefined();
      expect(exampleImageCard.expectedAnswer).toBeDefined();
    });

    it('AudioCard should have required fields', () => {
      expect(exampleAudioCard.cardId).toBeDefined();
      expect(exampleAudioCard.type).toBe(CardType.AUDIO);
      expect(exampleAudioCard.audioUrl).toBeDefined();
      expect(exampleAudioCard.prompt).toBeDefined();
      expect(exampleAudioCard.expectedAnswer).toBeDefined();
    });

    it('DefinitionCard should have required fields', () => {
      expect(exampleDefinitionCard.cardId).toBeDefined();
      expect(exampleDefinitionCard.type).toBe(CardType.DEFINITION);
      expect(exampleDefinitionCard.definition).toBeDefined();
      expect(exampleDefinitionCard.expectedAnswer).toBeDefined();
    });

    it('ClozeCard should have required fields', () => {
      expect(exampleClozeCard.cardId).toBeDefined();
      expect(exampleClozeCard.type).toBe(CardType.CLOZE);
      expect(exampleClozeCard.sentence).toBeDefined();
      expect(exampleClozeCard.blank).toBeDefined();
      expect(exampleClozeCard.expectedAnswer).toBeDefined();
    });
  });
});

describe('VocabularyEntry', () => {
  it('should have required fields', () => {
    expect(exampleVocabularyEntry.entryId).toBe('perro-001');
    expect(exampleVocabularyEntry.term).toBe('perro');
    expect(exampleVocabularyEntry.cards).toHaveLength(3);
  });

  it('should have multiple card types', () => {
    const cardTypes = exampleVocabularyEntry.cards.map((c) => c.type);
    expect(cardTypes).toContain(CardType.IMAGE);
    expect(cardTypes).toContain(CardType.DEFINITION);
    expect(cardTypes).toContain(CardType.CLOZE);
  });

  it('should have progress tracking', () => {
    expect(exampleVocabularyEntry.progress).toBeDefined();
    expect(exampleVocabularyEntry.progress?.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(exampleVocabularyEntry.progress?.repetitions).toBeGreaterThanOrEqual(0);
  });
});

describe('VocabularyModule', () => {
  it('should have required metadata', () => {
    expect(exampleVocabularyModule.moduleId).toBe('spanish-animals-basics');
    expect(exampleVocabularyModule.title).toBeDefined();
    expect(exampleVocabularyModule.language).toBe('es');
    expect(exampleVocabularyModule.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should contain vocabulary entries', () => {
    expect(exampleVocabularyModule.entries).toHaveLength(2);
    expect(exampleVocabularyModule.entries[0].term).toBe('perro');
    expect(exampleVocabularyModule.entries[1].term).toBe('gato');
  });

  it('should have optional metadata', () => {
    expect(exampleVocabularyModule.description).toBeDefined();
    expect(exampleVocabularyModule.author).toBeDefined();
    expect(exampleVocabularyModule.tags).toContain('spanish');
    expect(exampleVocabularyModule.license).toBe('CC-BY-4.0');
  });
});

describe('UserProgress', () => {
  describe('New progress', () => {
    it('should have default SM-2 values', () => {
      expect(exampleNewProgress.interval).toBe(1);
      expect(exampleNewProgress.easeFactor).toBe(2.5);
      expect(exampleNewProgress.repetitions).toBe(0);
      expect(exampleNewProgress.lastReview).toBeNull();
      expect(exampleNewProgress.mastered).toBe(false);
    });
  });

  describe('Learning progress', () => {
    it('should show progression', () => {
      expect(exampleLearningProgress.interval).toBeGreaterThan(1);
      expect(exampleLearningProgress.repetitions).toBeGreaterThan(0);
      expect(exampleLearningProgress.streak).toBeGreaterThan(0);
      expect(exampleLearningProgress.mastered).toBe(false);
    });
  });

  describe('Mastered progress', () => {
    it('should indicate mastery', () => {
      expect(exampleMasteredProgress.interval).toBeGreaterThanOrEqual(21);
      expect(exampleMasteredProgress.mastered).toBe(true);
      expect(exampleMasteredProgress.easeFactor).toBeGreaterThan(2.5);
      expect(exampleMasteredProgress.streak).toBeGreaterThanOrEqual(5);
    });
  });
});

describe('ReviewQuality', () => {
  it('should have correct values', () => {
    expect(ReviewQuality.AGAIN).toBe(0);
    expect(ReviewQuality.HARD).toBe(2);
    expect(ReviewQuality.GOOD).toBe(3);
    expect(ReviewQuality.EASY).toBe(5);
  });

  it('should be ordered by difficulty', () => {
    expect(ReviewQuality.AGAIN).toBeLessThan(ReviewQuality.HARD);
    expect(ReviewQuality.HARD).toBeLessThan(ReviewQuality.GOOD);
    expect(ReviewQuality.GOOD).toBeLessThan(ReviewQuality.EASY);
  });
});

describe('Result type', () => {
  it('should handle success result', () => {
    expect(isSuccess(exampleSuccessResult)).toBe(true);
    expect(isFailure(exampleSuccessResult)).toBe(false);

    if (isSuccess(exampleSuccessResult)) {
      expect(exampleSuccessResult.data.moduleId).toBe('spanish-animals-basics');
    }
  });

  it('should handle failure result', () => {
    expect(isFailure(exampleFailureResult)).toBe(true);
    expect(isSuccess(exampleFailureResult)).toBe(false);

    if (isFailure(exampleFailureResult)) {
      expect(exampleFailureResult.error).toContain('not found');
      expect(exampleFailureResult.code).toBe('MODULE_NOT_FOUND');
    }
  });

  it('should work with type narrowing', () => {
    const processResult = (result: Result<VocabularyModule>): string => {
      if (result.success) {
        return `Module: ${result.data.title}`;
      } else {
        return `Error: ${result.error}`;
      }
    };

    expect(processResult(exampleSuccessResult)).toContain('Spanish Animals');
    expect(processResult(exampleFailureResult)).toContain('not found');
  });
});

describe('ValidationResult', () => {
  it('should indicate correct answer', () => {
    expect(exampleCorrectValidation.isCorrect).toBe(true);
    expect(exampleCorrectValidation.confidence).toBe(1.0);
    expect(exampleCorrectValidation.suggestedQuality).toBe(ReviewQuality.EASY);
  });

  it('should indicate incorrect answer', () => {
    expect(exampleIncorrectValidation.isCorrect).toBe(false);
    expect(exampleIncorrectValidation.confidence).toBeLessThan(0.5);
    expect(exampleIncorrectValidation.suggestedQuality).toBe(ReviewQuality.AGAIN);
  });

  it('should track response time', () => {
    expect(exampleCorrectValidation.responseTime).toBeDefined();
    expect(exampleCorrectValidation.responseTime).toBeLessThan(
      exampleIncorrectValidation.responseTime!
    );
  });
});

describe('Card ID conventions', () => {
  it('should follow naming pattern', () => {
    // Pattern: entry-type-number (e.g., "perro-001-img-01")
    const pattern = /^[\w-]+-\d{3}-(img|audio|def|cloze|video|trivia)-\d{2}$/;

    expect(exampleImageCard.cardId).toMatch(pattern);
    expect(exampleClozeCard.cardId).toMatch(pattern);
  });
});

describe('Discriminated union pattern', () => {
  it('should allow type narrowing with switch', () => {
    const getCardDescription = (card: Card): string => {
      switch (card.type) {
        case CardType.IMAGE:
          return `Image: ${card.imageUrl}`;
        case CardType.AUDIO:
          return `Audio: ${card.audioUrl}`;
        case CardType.DEFINITION:
          return `Definition: ${card.definition.substring(0, 50)}...`;
        case CardType.CLOZE:
          return `Cloze: ${card.sentence}`;
        case CardType.VIDEO:
          return `Video: ${card.videoUrl}`;
        case CardType.TRIVIA:
          return `Trivia: ${card.question}`;
      }
    };

    expect(getCardDescription(exampleImageCard)).toContain('perro.jpg');
    expect(getCardDescription(exampleDefinitionCard)).toContain('Present');
    expect(getCardDescription(exampleClozeCard)).toContain('___');
  });
});
