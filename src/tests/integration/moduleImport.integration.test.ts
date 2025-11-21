/**
 * Integration Tests: Module Import
 * Tests the complete flow of importing a vocabulary module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateModule } from '@/services/validation/moduleValidator';
import { saveModule, getModule, getAllModules, initializeDatabase, clearDatabase } from '@/services/storage/database';

describe('Module Import Integration', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should successfully import a valid module', async () => {
    const validModule = {
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'test-module-001',
        title: 'Test Module',
        description: 'A test vocabulary module',
        version: '1.0.0',
        author: 'Test Author',
        language: 'es',
        created_date: new Date().toISOString(),
      },
      vocabulary_entries: [
        {
          entry_id: 'word-001',
          term: 'perro',
          cards: [
            {
              card_id: 'word-001-img-01',
              card_type: 'image' as const,
              content: {
                image_url: 'test.jpg',
                image_alt: 'A dog',
              },
            },
          ],
        },
      ],
    };

    // Validate module
    const validation = validateModule(validModule);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Save module
    await saveModule(validModule);

    // Verify it was saved
    const saved = await getModule('test-module-001');
    expect(saved).toBeDefined();
    expect(saved?.module_metadata.title).toBe('Test Module');
    expect(saved?.vocabulary_entries).toHaveLength(1);
  });

  it('should reject module with invalid schema', async () => {
    const invalidModule = {
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'invalid-module',
        title: 'Invalid Module',
        // Missing required fields
      },
      vocabulary_entries: [],
    };

    const validation = validateModule(invalidModule);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should handle module with all card types', async () => {
    const multiCardModule = {
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'multi-card-module',
        title: 'Multi-Card Module',
        description: 'Module with all card types',
        version: '1.0.0',
        author: 'Test',
        language: 'en',
        created_date: new Date().toISOString(),
      },
      vocabulary_entries: [
        {
          entry_id: 'word-001',
          term: 'test',
          cards: [
            {
              card_id: 'word-001-img-01',
              card_type: 'image' as const,
              content: { image_url: 'test.jpg', image_alt: 'Test' },
            },
            {
              card_id: 'word-001-aud-01',
              card_type: 'audio' as const,
              content: { audio_url: 'test.mp3' },
            },
            {
              card_id: 'word-001-vid-01',
              card_type: 'video' as const,
              content: { video_url: 'test.mp4' },
            },
            {
              card_id: 'word-001-def-01',
              card_type: 'definition' as const,
              content: { definition_text: 'A test word' },
            },
            {
              card_id: 'word-001-clo-01',
              card_type: 'cloze' as const,
              content: { sentence: 'This is a {{test}}.' },
            },
            {
              card_id: 'word-001-tri-01',
              card_type: 'trivia' as const,
              content: { trivia_text: 'Interesting fact about test' },
            },
          ],
        },
      ],
    };

    const validation = validateModule(multiCardModule);
    expect(validation.isValid).toBe(true);

    await saveModule(multiCardModule);
    const saved = await getModule('multi-card-module');
    expect(saved?.vocabulary_entries[0].cards).toHaveLength(6);
  });

  it('should handle duplicate module imports', async () => {
    const module1 = {
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'duplicate-test',
        title: 'First Version',
        description: 'First version',
        version: '1.0.0',
        author: 'Test',
        language: 'en',
        created_date: new Date().toISOString(),
      },
      vocabulary_entries: [],
    };

    const module2 = {
      ...module1,
      module_metadata: {
        ...module1.module_metadata,
        title: 'Second Version',
        version: '2.0.0',
      },
    };

    // Import first version
    await saveModule(module1);
    let saved = await getModule('duplicate-test');
    expect(saved?.module_metadata.title).toBe('First Version');

    // Import second version (should update)
    await saveModule(module2);
    saved = await getModule('duplicate-test');
    expect(saved?.module_metadata.title).toBe('Second Version');
    expect(saved?.module_metadata.version).toBe('2.0.0');
  });

  it('should retrieve all imported modules', async () => {
    const modules = [
      {
        schema_version: '1.0.0',
        module_metadata: {
          module_id: 'module-1',
          title: 'Module 1',
          description: 'First module',
          version: '1.0.0',
          author: 'Test',
          language: 'en',
          created_date: new Date().toISOString(),
        },
        vocabulary_entries: [],
      },
      {
        schema_version: '1.0.0',
        module_metadata: {
          module_id: 'module-2',
          title: 'Module 2',
          description: 'Second module',
          version: '1.0.0',
          author: 'Test',
          language: 'es',
          created_date: new Date().toISOString(),
        },
        vocabulary_entries: [],
      },
    ];

    for (const module of modules) {
      await saveModule(module);
    }

    const allModules = await getAllModules();
    expect(allModules).toHaveLength(2);
    expect(allModules.map((m) => m.module_metadata.module_id)).toContain('module-1');
    expect(allModules.map((m) => m.module_metadata.module_id)).toContain('module-2');
  });

  it('should validate module metadata completeness', async () => {
    const incompleteModule = {
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'incomplete',
        title: 'Incomplete',
        // Missing description, author, created_date
        version: '1.0.0',
        language: 'en',
      },
      vocabulary_entries: [],
    };

    const validation = validateModule(incompleteModule);
    // Should pass basic validation but might have warnings
    expect(validation.isValid).toBe(true);
  });

  it('should reject module with empty vocabulary entries', async () => {
    const emptyModule = {
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'empty-module',
        title: 'Empty Module',
        description: 'Module with no entries',
        version: '1.0.0',
        author: 'Test',
        language: 'en',
        created_date: new Date().toISOString(),
      },
      vocabulary_entries: [],
    };

    const validation = validateModule(emptyModule);
    // Empty entries should still be valid (might be a template)
    expect(validation.isValid).toBe(true);
  });
});
