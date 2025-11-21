import { describe, it, expect } from 'vitest';
import {
  validateModule,
  calculateModuleStats,
  generateSampleModule,
} from './moduleValidator';
import type { VocabularyModule } from '../models/types';

describe('validateModule', () => {
  const validModule = {
    schema_version: '1.0.0',
    module_metadata: {
      module_id: 'test-module',
      title: 'Test Module',
      version: '1.0.0',
      language: 'en',
    },
    vocabulary_entries: [
      {
        entry_id: 'test-001',
        term: 'test',
        cards: [
          {
            card_id: 'test-001-def-01',
            card_type: 'definition',
            content: {
              definition: 'A procedure intended to establish quality',
              expected_answer: 'test',
            },
          },
        ],
      },
    ],
  };

  it('should validate a correct module', () => {
    const result = validateModule(validModule);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.module).toBeDefined();
  });

  it('should reject non-object input', () => {
    const result = validateModule(null);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toContain('valid JSON object');
  });

  it('should reject missing module_metadata', () => {
    const invalidModule = { ...validModule };
    delete (invalidModule as any).module_metadata;

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'module_metadata')).toBe(true);
  });

  it('should reject missing module_id', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        module_id: '',
      },
    };
    delete (invalidModule.module_metadata as any).module_id;

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('module_id'))).toBe(true);
  });

  it('should reject invalid module_id format', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        module_id: 'InvalidModuleID',
      },
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('kebab-case'))).toBe(true);
  });

  it('should reject missing title', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        title: '',
      },
    };
    delete (invalidModule.module_metadata as any).title;

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('title'))).toBe(true);
  });

  it('should reject title that is too long', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        title: 'a'.repeat(101),
      },
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('100 characters'))).toBe(true);
  });

  it('should reject missing version', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        version: '',
      },
    };
    delete (invalidModule.module_metadata as any).version;

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('version'))).toBe(true);
  });

  it('should reject invalid version format', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        version: '1.0',
      },
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('semantic versioning'))).toBe(true);
  });

  it('should reject missing language', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        language: '',
      },
    };
    delete (invalidModule.module_metadata as any).language;

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('language'))).toBe(true);
  });

  it('should reject invalid language format', () => {
    const invalidModule = {
      ...validModule,
      module_metadata: {
        ...validModule.module_metadata,
        language: 'eng',
      },
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('ISO 639-1'))).toBe(true);
  });

  it('should reject missing vocabulary_entries', () => {
    const invalidModule = { ...validModule };
    delete (invalidModule as any).vocabulary_entries;

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'vocabulary_entries')).toBe(true);
  });

  it('should reject empty vocabulary_entries array', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('at least one'))).toBe(true);
  });

  it('should reject entry without entry_id', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          term: 'test',
          cards: validModule.vocabulary_entries[0].cards,
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('entry_id'))).toBe(true);
  });

  it('should reject entry without term', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          cards: validModule.vocabulary_entries[0].cards,
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('term'))).toBe(true);
  });

  it('should reject entry with empty term', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: '   ',
          cards: validModule.vocabulary_entries[0].cards,
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('cannot be empty'))).toBe(true);
  });

  it('should reject entry without cards', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('cards'))).toBe(true);
  });

  it('should reject entry with empty cards array', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('at least one card'))).toBe(true);
  });

  it('should reject card without card_id', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_type: 'definition',
              content: { definition: 'test', expected_answer: 'test' },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('card_id'))).toBe(true);
  });

  it('should reject card without card_type', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-def-01',
              content: { definition: 'test', expected_answer: 'test' },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('card_type'))).toBe(true);
  });

  it('should reject invalid card_type', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-invalid-01',
              card_type: 'invalid-type',
              content: { definition: 'test', expected_answer: 'test' },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('one of:'))).toBe(true);
  });

  it('should validate definition card with required fields', () => {
    const result = validateModule(validModule);
    expect(result.isValid).toBe(true);
  });

  it('should reject definition card without definition', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-def-01',
              card_type: 'definition',
              content: {
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('requires definition'))).toBe(true);
  });

  it('should reject image card without image_url', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-img-01',
              card_type: 'image',
              content: {
                prompt: 'What is this?',
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('requires image_url'))).toBe(true);
  });

  it('should reject audio card without audio_url', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-aud-01',
              card_type: 'audio',
              content: {
                prompt: 'What do you hear?',
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('requires audio_url'))).toBe(true);
  });

  it('should reject cloze card without sentence', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-cloze-01',
              card_type: 'cloze',
              content: {
                blank: 'test',
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('requires sentence'))).toBe(true);
  });

  it('should reject video card without video_url', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-vid-01',
              card_type: 'video',
              content: {
                prompt: 'What action is this?',
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('requires video_url'))).toBe(true);
  });

  it('should reject trivia card without question', () => {
    const invalidModule = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-triv-01',
              card_type: 'trivia',
              content: {
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(invalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('requires question'))).toBe(true);
  });

  it('should handle camelCase field names in content', () => {
    const moduleWithCamelCase = {
      ...validModule,
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-def-01',
              card_type: 'definition',
              content: {
                definition: 'A test definition',
                expectedAnswer: 'test', // camelCase instead of snake_case
              },
            },
          ],
        },
      ],
    };

    const result = validateModule(moduleWithCamelCase);
    expect(result.isValid).toBe(true);
    expect(result.module).toBeDefined();
  });

  it('should warn about invalid schema_version format', () => {
    const moduleWithInvalidSchema = {
      ...validModule,
      schema_version: '1.0',
    };

    const result = validateModule(moduleWithInvalidSchema);
    expect(result.warnings?.some((w) => w.field === 'schema_version')).toBe(true);
  });
});

describe('calculateModuleStats', () => {
  const testModule: VocabularyModule = {
    moduleId: 'test-module',
    title: 'Test Module',
    language: 'en',
    version: '1.0.0',
    entries: [
      {
        entryId: 'test-001',
        term: 'test',
        cards: [
          {
            cardId: 'test-001-def-01',
            type: 'definition' as any,
            definition: 'A test',
            expectedAnswer: 'test',
          },
          {
            cardId: 'test-001-img-01',
            type: 'image' as any,
            imageUrl: './test.jpg',
            prompt: 'What is this?',
            expectedAnswer: 'test',
          },
        ],
      },
      {
        entryId: 'test-002',
        term: 'example',
        cards: [
          {
            cardId: 'test-002-def-01',
            type: 'definition' as any,
            definition: 'An example',
            expectedAnswer: 'example',
          },
        ],
      },
    ],
  };

  it('should calculate total entries', () => {
    const stats = calculateModuleStats(testModule);
    expect(stats.totalEntries).toBe(2);
  });

  it('should calculate total cards', () => {
    const stats = calculateModuleStats(testModule);
    expect(stats.totalCards).toBe(3);
  });

  it('should calculate card type distribution', () => {
    const stats = calculateModuleStats(testModule);
    expect(stats.cardTypeDistribution.definition).toBe(2);
    expect(stats.cardTypeDistribution.image).toBe(1);
  });

  it('should calculate average cards per entry', () => {
    const stats = calculateModuleStats(testModule);
    expect(stats.averageCardsPerEntry).toBe(1.5);
  });
});

describe('generateSampleModule', () => {
  it('should generate valid JSON', () => {
    const sample = generateSampleModule();
    expect(() => JSON.parse(sample)).not.toThrow();
  });

  it('should generate a valid module', () => {
    const sample = generateSampleModule();
    const parsed = JSON.parse(sample);
    const result = validateModule(parsed);
    expect(result.isValid).toBe(true);
  });

  it('should include all required fields', () => {
    const sample = generateSampleModule();
    const parsed = JSON.parse(sample);
    expect(parsed.module_metadata).toBeDefined();
    expect(parsed.vocabulary_entries).toBeDefined();
    expect(parsed.vocabulary_entries.length).toBeGreaterThan(0);
  });
});
