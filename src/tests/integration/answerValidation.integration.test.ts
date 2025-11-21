/**
 * Integration Tests: Answer Validation
 * Tests the complete answer validation workflow
 */

import { describe, it, expect } from 'vitest';
import { validateAnswer } from '@/utils/answerValidation';

describe('Answer Validation Integration', () => {
  it('should validate exact matches', () => {
    const result = validateAnswer('perro', 'perro', 'es');
    expect(result.isCorrect).toBe(true);
    expect(result.similarity).toBe(1.0);
    expect(result.feedback).toBe('Perfect!');
  });

  it('should handle case-insensitive matching', () => {
    const testCases = [
      { user: 'PERRO', correct: 'perro' },
      { user: 'Perro', correct: 'perro' },
      { user: 'pErRo', correct: 'perro' },
    ];

    for (const { user, correct } of testCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('should handle whitespace normalization', () => {
    const testCases = [
      { user: ' perro ', correct: 'perro' },
      { user: 'perro  ', correct: 'perro' },
      { user: '  perro', correct: 'perro' },
      { user: 'el perro', correct: 'el perro' },
    ];

    for (const { user, correct } of testCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(true);
    }
  });

  it('should handle minor typos with fuzzy matching', () => {
    const testCases = [
      { user: 'pero', correct: 'perro', shouldPass: true }, // Missing one letter
      { user: 'perrro', correct: 'perro', shouldPass: true }, // Extra letter
      { user: 'perdo', correct: 'perro', shouldPass: true }, // Wrong letter
      { user: 'prro', correct: 'perro', shouldPass: false }, // Too different
    ];

    for (const { user, correct, shouldPass } of testCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(shouldPass);
    }
  });

  it('should handle accent-insensitive matching', () => {
    const testCases = [
      { user: 'cafe', correct: 'café' },
      { user: 'espanol', correct: 'español' },
      { user: 'nino', correct: 'niño' },
      { user: 'acion', correct: 'acción' },
    ];

    for (const { user, correct } of testCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBeGreaterThanOrEqual(0.85);
    }
  });

  it('should support alternative correct answers', () => {
    const alternatives = ['coche', 'auto', 'automóvil', 'carro'];

    for (const alt of alternatives) {
      const result = validateAnswer(alt, alternatives[0], 'es', {
        alternativeAnswers: alternatives,
      });
      expect(result.isCorrect).toBe(true);
    }
  });

  it('should handle multi-word phrases', () => {
    const testCases = [
      { user: 'buenos dias', correct: 'buenos días' },
      { user: 'buenos días', correct: 'buenos días' },
      { user: 'BUENOS DIAS', correct: 'buenos días' },
    ];

    for (const { user, correct } of testCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(true);
    }
  });

  it('should reject completely wrong answers', () => {
    const testCases = [
      { user: 'gato', correct: 'perro' }, // Completely different word
      { user: 'casa', correct: 'perro' },
      { user: 'hello', correct: 'perro' },
      { user: '', correct: 'perro' }, // Empty answer
    ];

    for (const { user, correct } of testCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(false);
      expect(result.similarity).toBeLessThan(0.7);
    }
  });

  it('should calculate appropriate similarity scores', () => {
    const testCases = [
      { user: 'perro', correct: 'perro', expectedMin: 0.95 },
      { user: 'pero', correct: 'perro', expectedMin: 0.7 },
      { user: 'prro', correct: 'perro', expectedMin: 0.6 },
      { user: 'gato', correct: 'perro', expectedMax: 0.5 },
    ];

    for (const { user, correct, expectedMin, expectedMax } of testCases) {
      const result = validateAnswer(user, correct, 'es');

      if (expectedMin) {
        expect(result.similarity).toBeGreaterThanOrEqual(expectedMin);
      }
      if (expectedMax) {
        expect(result.similarity).toBeLessThanOrEqual(expectedMax);
      }
    }
  });

  it('should provide helpful feedback messages', () => {
    const perfectResult = validateAnswer('perro', 'perro', 'es');
    expect(perfectResult.feedback).toContain('Perfect');

    const closeResult = validateAnswer('pero', 'perro', 'es');
    expect(closeResult.feedback).toBeTruthy();

    const wrongResult = validateAnswer('gato', 'perro', 'es');
    expect(wrongResult.feedback).toBeTruthy();
  });

  it('should handle Spanish-specific rules', () => {
    // Articles should be optional
    const result1 = validateAnswer('perro', 'el perro', 'es', {
      ignoreArticles: true,
    });
    expect(result1.isCorrect).toBe(true);

    // Gender variations
    const result2 = validateAnswer('gato', 'gata', 'es');
    expect(result2.similarity).toBeGreaterThan(0.8);
  });

  it('should handle English validation', () => {
    const testCases = [
      { user: 'dog', correct: 'dog' },
      { user: 'DOG', correct: 'dog' },
      { user: 'the dog', correct: 'dog', ignoreArticles: true },
    ];

    for (const { user, correct, ignoreArticles } of testCases) {
      const result = validateAnswer(user, correct, 'en', { ignoreArticles });
      expect(result.isCorrect).toBe(true);
    }
  });

  it('should handle real-world study session scenarios', () => {
    // Common student mistakes
    const scenarios = [
      { user: 'cafe', correct: 'café', expected: true }, // Forgot accent
      { user: 'espanol', correct: 'español', expected: true }, // Forgot ñ
      { user: 'tambien', correct: 'también', expected: true }, // Forgot accent
      { user: 'perro', correct: 'el perro', expected: true, ignoreArticles: true }, // Forgot article
      { user: 'perrro', correct: 'perro', expected: true }, // Typo
      { user: 'casa grande', correct: 'casa grande', expected: true }, // Multi-word
      { user: 'grande casa', correct: 'casa grande', expected: false }, // Wrong order
    ];

    for (const { user, correct, expected, ignoreArticles } of scenarios) {
      const result = validateAnswer(user, correct, 'es', { ignoreArticles });
      expect(result.isCorrect).toBe(expected);
    }
  });

  it('should handle edge cases', () => {
    // Numbers
    const result1 = validateAnswer('1', '1', 'es');
    expect(result1.isCorrect).toBe(true);

    // Special characters
    const result2 = validateAnswer('¿Qué?', '¿Qué?', 'es');
    expect(result2.isCorrect).toBe(true);

    // Very long input
    const longText = 'a'.repeat(1000);
    const result3 = validateAnswer(longText, 'perro', 'es');
    expect(result3.isCorrect).toBe(false);

    // Empty strings
    const result4 = validateAnswer('', '', 'es');
    expect(result4.isCorrect).toBe(true);
  });

  it('should handle validation with strict mode', () => {
    const strictOptions = {
      fuzzyThreshold: 1.0, // Require exact match
      caseSensitive: false,
    };

    // Close but not exact - should fail in strict mode
    const result1 = validateAnswer('pero', 'perro', 'es', strictOptions);
    expect(result1.isCorrect).toBe(false);

    // Exact match - should pass
    const result2 = validateAnswer('perro', 'perro', 'es', strictOptions);
    expect(result2.isCorrect).toBe(true);
  });

  it('should handle validation with lenient mode', () => {
    const lenientOptions = {
      fuzzyThreshold: 0.6, // Very lenient
    };

    // Even with significant differences, should pass
    const result = validateAnswer('prro', 'perro', 'es', lenientOptions);
    expect(result.isCorrect).toBe(true);
  });

  it('should validate complex vocabulary entries', () => {
    const complexCases = [
      {
        user: 'hablar',
        correct: 'hablar',
        description: 'infinitive verb',
      },
      {
        user: 'corriendo',
        correct: 'corriendo',
        description: 'gerund',
      },
      {
        user: 'los ninos',
        correct: 'los niños',
        description: 'plural with accent',
      },
    ];

    for (const { user, correct, description } of complexCases) {
      const result = validateAnswer(user, correct, 'es');
      expect(result.isCorrect).toBe(true);
    }
  });

  it('should provide progressive feedback based on similarity', () => {
    // Perfect answer
    const perfect = validateAnswer('perro', 'perro', 'es');
    expect(perfect.feedback).toMatch(/perfect|correct|excellent/i);

    // Close answer
    const close = validateAnswer('pero', 'perro', 'es');
    if (close.isCorrect) {
      expect(close.feedback).toBeTruthy();
    }

    // Wrong answer
    const wrong = validateAnswer('gato', 'perro', 'es');
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.feedback).toBeTruthy();
  });
});
