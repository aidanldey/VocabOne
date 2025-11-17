import { describe, it, expect } from 'vitest';
import {
  validateModule,
  loadModuleFromString,
  ModuleLoaderErrorCode,
} from './moduleLoader';
import { spanishAnimalsModule, getSampleModuleJSON, getModuleStats } from './sampleModule';
import { CardType } from '@/models/types';

describe('Module Loader', () => {
  describe('validateModule', () => {
    it('should validate a correct module', () => {
      const result = validateModule(spanishAnimalsModule);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.moduleId).toBe('spanish-animals-basics');
        expect(result.data.entries).toHaveLength(5);
      }
    });

    it('should reject non-object input', () => {
      const result = validateModule('not an object');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_STRUCTURE);
      }
    });

    it('should reject null input', () => {
      const result = validateModule(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_STRUCTURE);
      }
    });

    it('should reject array input', () => {
      const result = validateModule([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_STRUCTURE);
      }
    });
  });

  describe('moduleId validation', () => {
    it('should require moduleId', () => {
      const module = { ...spanishAnimalsModule, moduleId: undefined };
      const result = validateModule(module);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should reject non-kebab-case moduleId', () => {
      const module = { ...spanishAnimalsModule, moduleId: 'Invalid_Module_ID' };
      const result = validateModule(module);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_MODULE_ID);
      }
    });

    it('should accept valid kebab-case moduleId', () => {
      const module = { ...spanishAnimalsModule, moduleId: 'my-valid-module-123' };
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should reject moduleId with uppercase', () => {
      const module = { ...spanishAnimalsModule, moduleId: 'Spanish-Animals' };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should reject moduleId over 100 characters', () => {
      const module = { ...spanishAnimalsModule, moduleId: 'a'.repeat(101) };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });
  });

  describe('title validation', () => {
    it('should require title', () => {
      const module = { ...spanishAnimalsModule, title: undefined };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const module = { ...spanishAnimalsModule, title: '   ' };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should reject title over 100 characters', () => {
      const module = { ...spanishAnimalsModule, title: 'A'.repeat(101) };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });
  });

  describe('language validation', () => {
    it('should require language', () => {
      const module = { ...spanishAnimalsModule, language: undefined };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should accept valid ISO 639-1 codes', () => {
      const validCodes = ['es', 'en', 'fr', 'de', 'zh', 'ja'];
      for (const code of validCodes) {
        const module = { ...spanishAnimalsModule, language: code };
        const result = validateModule(module);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid language codes', () => {
      const invalidCodes = ['ESP', 'english', 'e', 'ES', '12'];
      for (const code of invalidCodes) {
        const module = { ...spanishAnimalsModule, language: code };
        const result = validateModule(module);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_LANGUAGE_CODE);
        }
      }
    });
  });

  describe('version validation', () => {
    it('should require version', () => {
      const module = { ...spanishAnimalsModule, version: undefined };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should accept valid semver', () => {
      const validVersions = ['1.0.0', '0.0.1', '10.20.30', '2.3.4'];
      for (const version of validVersions) {
        const module = { ...spanishAnimalsModule, version };
        const result = validateModule(module);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid semver', () => {
      const invalidVersions = ['1.0', 'v1.0.0', '1.0.0-beta', '1.0.0.0'];
      for (const version of invalidVersions) {
        const module = { ...spanishAnimalsModule, version };
        const result = validateModule(module);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_VERSION);
        }
      }
    });
  });

  describe('entries validation', () => {
    it('should require entries array', () => {
      const module = { ...spanishAnimalsModule, entries: undefined };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should reject empty entries array', () => {
      const module = { ...spanishAnimalsModule, entries: [] };
      const result = validateModule(module);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.EMPTY_ENTRIES);
      }
    });

    it('should reject entries that are not objects', () => {
      const module = { ...spanishAnimalsModule, entries: ['not an object'] };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should require entryId in each entry', () => {
      const module = {
        ...spanishAnimalsModule,
        entries: [{ term: 'test', cards: [] }],
      };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should require term in each entry', () => {
      const module = {
        ...spanishAnimalsModule,
        entries: [{ entryId: 'test-001', cards: [] }],
      };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should require at least one card per entry', () => {
      const module = {
        ...spanishAnimalsModule,
        entries: [{ entryId: 'test-001', term: 'test', cards: [] }],
      };
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });
  });

  describe('card validation', () => {
    const createMinimalModule = (cards: unknown[]) => ({
      moduleId: 'test-module',
      title: 'Test Module',
      language: 'en',
      version: '1.0.0',
      entries: [
        {
          entryId: 'test-001',
          term: 'test',
          cards,
        },
      ],
    });

    it('should validate image card', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-img-01',
          type: 'image',
          imageUrl: '/test.jpg',
          prompt: 'What is this?',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should reject image card without imageUrl', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-img-01',
          type: 'image',
          prompt: 'What is this?',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });

    it('should validate audio card', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-audio-01',
          type: 'audio',
          audioUrl: '/test.mp3',
          prompt: 'What do you hear?',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should validate definition card', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-def-01',
          type: 'definition',
          definition: 'A test definition',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should validate cloze card', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-cloze-01',
          type: 'cloze',
          sentence: 'This is a ___ sentence.',
          blank: 'test',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should validate video card', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-video-01',
          type: 'video',
          videoUrl: '/test.mp4',
          prompt: 'What action is shown?',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should validate trivia card', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-trivia-01',
          type: 'trivia',
          question: 'What is the answer?',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(true);
    });

    it('should reject invalid card type', () => {
      const module = createMinimalModule([
        {
          cardId: 'test-001-invalid-01',
          type: 'invalid-type',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_CARD);
      }
    });

    it('should reject card without cardId', () => {
      const module = createMinimalModule([
        {
          type: 'definition',
          definition: 'A test definition',
          expectedAnswer: 'test',
        },
      ]);
      const result = validateModule(module);
      expect(result.success).toBe(false);
    });
  });

  describe('duplicate ID checking', () => {
    it('should reject duplicate entry IDs', () => {
      const module = {
        ...spanishAnimalsModule,
        entries: [
          spanishAnimalsModule.entries[0],
          { ...spanishAnimalsModule.entries[1], entryId: spanishAnimalsModule.entries[0].entryId },
        ],
      };
      const result = validateModule(module);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.DUPLICATE_ID);
        expect(result.error).toContain('Duplicate entry ID');
      }
    });

    it('should reject duplicate card IDs', () => {
      const module = {
        ...spanishAnimalsModule,
        entries: [
          {
            ...spanishAnimalsModule.entries[0],
            cards: [
              spanishAnimalsModule.entries[0].cards[0],
              {
                ...spanishAnimalsModule.entries[0].cards[1],
                cardId: spanishAnimalsModule.entries[0].cards[0].cardId,
              },
            ],
          },
        ],
      };
      const result = validateModule(module);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.DUPLICATE_ID);
        expect(result.error).toContain('Duplicate card ID');
      }
    });
  });

  describe('loadModuleFromString', () => {
    it('should load valid JSON string', () => {
      const jsonString = getSampleModuleJSON();
      const result = loadModuleFromString(jsonString);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.moduleId).toBe('spanish-animals-basics');
      }
    });

    it('should reject invalid JSON syntax', () => {
      const result = loadModuleFromString('{ invalid json }');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ModuleLoaderErrorCode.INVALID_JSON);
      }
    });

    it('should reject valid JSON with invalid structure', () => {
      const result = loadModuleFromString('{"foo": "bar"}');
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should include optional module fields when present', () => {
      const result = validateModule(spanishAnimalsModule);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeDefined();
        expect(result.data.author).toBe('VocabOne Team');
        expect(result.data.tags).toContain('spanish');
        expect(result.data.license).toBe('CC-BY-4.0');
      }
    });

    it('should work without optional fields', () => {
      const minimalModule = {
        moduleId: 'minimal-module',
        title: 'Minimal Module',
        language: 'en',
        version: '1.0.0',
        entries: [
          {
            entryId: 'test-001',
            term: 'test',
            cards: [
              {
                cardId: 'test-001-def-01',
                type: 'definition',
                definition: 'A test',
                expectedAnswer: 'test',
              },
            ],
          },
        ],
      };
      const result = validateModule(minimalModule);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
        expect(result.data.author).toBeUndefined();
        expect(result.data.tags).toBeUndefined();
      }
    });
  });
});

describe('Sample Module', () => {
  it('should have correct structure', () => {
    expect(spanishAnimalsModule.moduleId).toBe('spanish-animals-basics');
    expect(spanishAnimalsModule.language).toBe('es');
    expect(spanishAnimalsModule.version).toBe('1.0.0');
  });

  it('should have 5 vocabulary entries', () => {
    expect(spanishAnimalsModule.entries).toHaveLength(5);
  });

  it('should have correct animal terms', () => {
    const terms = spanishAnimalsModule.entries.map((e) => e.term);
    expect(terms).toEqual(['perro', 'gato', 'pájaro', 'pez', 'caballo']);
  });

  it('should have 2-3 cards per entry', () => {
    for (const entry of spanishAnimalsModule.entries) {
      expect(entry.cards.length).toBeGreaterThanOrEqual(2);
      expect(entry.cards.length).toBeLessThanOrEqual(3);
    }
  });

  it('should have mixed card types', () => {
    const cardTypes = new Set<CardType>();
    for (const entry of spanishAnimalsModule.entries) {
      for (const card of entry.cards) {
        cardTypes.add(card.type);
      }
    }
    expect(cardTypes.has(CardType.IMAGE)).toBe(true);
    expect(cardTypes.has(CardType.DEFINITION)).toBe(true);
    expect(cardTypes.has(CardType.AUDIO)).toBe(true);
    expect(cardTypes.has(CardType.CLOZE)).toBe(true);
  });

  it('should pass validation', () => {
    const result = validateModule(spanishAnimalsModule);
    expect(result.success).toBe(true);
  });
});

describe('getModuleStats', () => {
  it('should calculate correct statistics', () => {
    const stats = getModuleStats(spanishAnimalsModule);

    expect(stats.totalEntries).toBe(5);
    expect(stats.totalCards).toBe(14); // perro(3) + gato(3) + pajaro(3) + pez(2) + caballo(3) = 14
    expect(stats.averageCardsPerEntry).toBeCloseTo(2.8, 1);
  });

  it('should break down card types', () => {
    const stats = getModuleStats(spanishAnimalsModule);

    expect(stats.cardTypeBreakdown[CardType.IMAGE]).toBe(5);
    expect(stats.cardTypeBreakdown[CardType.DEFINITION]).toBe(5);
    expect(stats.cardTypeBreakdown[CardType.AUDIO]).toBe(2);
    expect(stats.cardTypeBreakdown[CardType.CLOZE]).toBe(2);
  });
});
