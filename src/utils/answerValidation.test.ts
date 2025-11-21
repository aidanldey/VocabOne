import { describe, it, expect } from 'vitest';
import {
  normalizeAnswer,
  levenshteinDistance,
  validateAnswer,
  getCardAnswer,
} from './answerValidation';

describe('answerValidation', () => {
  describe('normalizeAnswer', () => {
    it('should convert to lowercase', () => {
      expect(normalizeAnswer('HELLO')).toBe('hello');
      expect(normalizeAnswer('HeLLo')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(normalizeAnswer('  hello  ')).toBe('hello');
      expect(normalizeAnswer('\thello\n')).toBe('hello');
    });

    it('should remove accents/diacritics', () => {
      expect(normalizeAnswer('café')).toBe('cafe');
      expect(normalizeAnswer('naïve')).toBe('naive');
      expect(normalizeAnswer('résumé')).toBe('resume');
      expect(normalizeAnswer('pájaro')).toBe('pajaro');
    });

    it('should remove punctuation', () => {
      expect(normalizeAnswer('hello!')).toBe('hello');
      expect(normalizeAnswer('hello, world')).toBe('hello world');
      expect(normalizeAnswer('it\'s')).toBe('its');
    });

    it('should normalize multiple spaces', () => {
      expect(normalizeAnswer('hello    world')).toBe('hello world');
      expect(normalizeAnswer('a  b  c')).toBe('a b c');
    });

    it('should handle combined cases', () => {
      expect(normalizeAnswer('  Café, World!  ')).toBe('cafe world');
    });
  });

  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should return string length for empty string comparison', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'world')).toBe(5);
    });

    it('should calculate single character difference', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1); // substitution
      expect(levenshteinDistance('cat', 'cats')).toBe(1); // insertion
      expect(levenshteinDistance('cats', 'cat')).toBe(1); // deletion
    });

    it('should calculate multiple character differences', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
    });

    it('should be symmetric', () => {
      expect(levenshteinDistance('abc', 'def')).toBe(
        levenshteinDistance('def', 'abc')
      );
    });
  });

  describe('validateAnswer', () => {
    describe('Exact matches', () => {
      it('should accept exact match', () => {
        const result = validateAnswer('perro', 'perro');

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(true);
        expect(result.fuzzyMatch).toBe(false);
        expect(result.matchedAnswer).toBe('perro');
      });

      it('should accept exact match with alternate answer', () => {
        const result = validateAnswer('el perro', 'perro', ['el perro', 'un perro']);

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(true);
        expect(result.matchedAnswer).toBe('el perro');
      });

      it('should be case insensitive', () => {
        const result = validateAnswer('PERRO', 'perro');

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(true);
      });

      it('should ignore accents', () => {
        const result = validateAnswer('pajaro', 'pájaro');

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(true);
      });

      it('should ignore punctuation', () => {
        const result = validateAnswer('its', 'it\'s');

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(true);
      });

      it('should ignore extra whitespace', () => {
        const result = validateAnswer('  perro  ', 'perro');

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(true);
      });
    });

    describe('Fuzzy matches', () => {
      it('should accept fuzzy match with 1 character difference', () => {
        const result = validateAnswer('parro', 'perro');

        expect(result.isCorrect).toBe(true);
        expect(result.exactMatch).toBe(false);
        expect(result.fuzzyMatch).toBe(true);
      });

      it('should accept fuzzy match with 2 character differences', () => {
        const result = validateAnswer('parro', 'perro');

        expect(result.isCorrect).toBe(true);
        expect(result.fuzzyMatch).toBe(true);
      });

      it('should reject fuzzy match beyond threshold', () => {
        const result = validateAnswer('dog', 'perro', [], true, 2);

        expect(result.isCorrect).toBe(false);
      });

      it('should respect fuzzy threshold parameter', () => {
        // 'prro' vs 'perro' has edit distance of 1 (missing 'e')
        // With threshold 0, should fail
        const result1 = validateAnswer('prro', 'perro', [], true, 0);
        expect(result1.isCorrect).toBe(false);

        // With threshold 1, should pass
        const result2 = validateAnswer('prro', 'perro', [], true, 1);
        expect(result2.isCorrect).toBe(true);

        // 'prr' vs 'perro' has edit distance of 2 (missing 'e' and 'o')
        const result3 = validateAnswer('prr', 'perro', [], true, 1);
        expect(result3.isCorrect).toBe(false);

        const result4 = validateAnswer('prr', 'perro', [], true, 2);
        expect(result4.isCorrect).toBe(true);
      });

      it('should reject when fuzzy matching is disabled', () => {
        const result = validateAnswer('parro', 'perro', [], false);

        expect(result.isCorrect).toBe(false);
        expect(result.fuzzyMatch).toBe(false);
      });
    });

    describe('Incorrect answers', () => {
      it('should reject completely wrong answer', () => {
        const result = validateAnswer('gato', 'perro');

        expect(result.isCorrect).toBe(false);
        expect(result.exactMatch).toBe(false);
        expect(result.fuzzyMatch).toBe(false);
        expect(result.matchedAnswer).toBeUndefined();
      });

      it('should reject empty answer', () => {
        const result = validateAnswer('', 'perro');

        expect(result.isCorrect).toBe(false);
      });

      it('should reject whitespace-only answer', () => {
        const result = validateAnswer('   ', 'perro');

        expect(result.isCorrect).toBe(false);
      });
    });

    describe('Alternate answers', () => {
      it('should accept any alternate answer', () => {
        const alternates = ['el perro', 'un perro', 'los perros'];

        const result1 = validateAnswer('el perro', 'perro', alternates);
        expect(result1.isCorrect).toBe(true);
        expect(result1.matchedAnswer).toBe('el perro');

        const result2 = validateAnswer('un perro', 'perro', alternates);
        expect(result2.isCorrect).toBe(true);
        expect(result2.matchedAnswer).toBe('un perro');
      });

      it('should prefer exact match over fuzzy match in alternates', () => {
        const result = validateAnswer('el perro', 'perro', ['el perro']);

        expect(result.exactMatch).toBe(true);
        expect(result.fuzzyMatch).toBe(false);
      });

      it('should fuzzy match against alternates', () => {
        const result = validateAnswer('el parro', 'perro', ['el perro']);

        expect(result.isCorrect).toBe(true);
        expect(result.fuzzyMatch).toBe(true);
      });
    });
  });

  describe('getCardAnswer', () => {
    it('should extract expected answer from card', () => {
      const card = {
        expectedAnswer: 'perro',
        alternateAnswers: ['el perro'],
      };

      const result = getCardAnswer(card);

      expect(result.expectedAnswer).toBe('perro');
      expect(result.alternateAnswers).toEqual(['el perro']);
    });

    it('should handle missing alternate answers', () => {
      const card = {
        expectedAnswer: 'perro',
      };

      const result = getCardAnswer(card);

      expect(result.expectedAnswer).toBe('perro');
      expect(result.alternateAnswers).toEqual([]);
    });

    it('should handle empty card', () => {
      const card = {};

      const result = getCardAnswer(card);

      expect(result.expectedAnswer).toBe('');
      expect(result.alternateAnswers).toEqual([]);
    });
  });
});
