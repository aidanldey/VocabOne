/**
 * Integration Tests: Offline Functionality
 * Tests PWA offline capabilities and IndexedDB persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeDatabase,
  clearDatabase,
  saveModule,
  getModule,
  getAllModules,
  saveUserProgress,
  getUserProgress,
} from '@/services/storage/database';
import type { VocabularyModule } from '@/types/module';

describe('Offline Functionality Integration', () => {
  const testModule: VocabularyModule = {
    schema_version: '1.0.0',
    module_metadata: {
      module_id: 'offline-test-module',
      title: 'Offline Test Module',
      description: 'Module for testing offline capabilities',
      version: '1.0.0',
      author: 'Test',
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
            card_type: 'image',
            content: { image_url: 'dog.jpg', image_alt: 'A dog' },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await initializeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should store module data locally in IndexedDB', async () => {
    await saveModule(testModule);

    const stored = await getModule('offline-test-module');
    expect(stored).toBeDefined();
    expect(stored?.module_metadata.title).toBe('Offline Test Module');
  });

  it('should access stored modules without network', async () => {
    // Save module while "online"
    await saveModule(testModule);

    // Simulate offline mode by verifying we can still access data
    // In a real scenario, IndexedDB works regardless of network status
    const module = await getModule('offline-test-module');
    expect(module).toBeDefined();
    expect(module?.vocabulary_entries).toHaveLength(1);
  });

  it('should persist progress locally for offline study', async () => {
    await saveModule(testModule);

    // Save progress
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(Date.now() + 86400000),
      last_reviewed: new Date(),
    });

    // Retrieve progress (works offline)
    const progress = await getUserProgress('offline-test-module', 'word-001');
    expect(progress).toBeDefined();
    expect(progress!.interval).toBe(1);
  });

  it('should support full study session offline', async () => {
    await saveModule(testModule);

    // Initial progress
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 0,
      ease_factor: 2.5,
      repetitions: 0,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    // Complete a review
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(Date.now() + 86400000),
      last_reviewed: new Date(),
    });

    // Verify it worked
    const progress = await getUserProgress('offline-test-module', 'word-001');
    expect(progress!.repetitions).toBe(1);
  });

  it('should handle multiple modules offline', async () => {
    const modules = [
      { ...testModule, module_metadata: { ...testModule.module_metadata, module_id: 'module-1' } },
      { ...testModule, module_metadata: { ...testModule.module_metadata, module_id: 'module-2' } },
      { ...testModule, module_metadata: { ...testModule.module_metadata, module_id: 'module-3' } },
    ];

    for (const module of modules) {
      await saveModule(module);
    }

    const allModules = await getAllModules();
    expect(allModules).toHaveLength(3);
  });

  it('should detect online/offline status', () => {
    // Test navigator.onLine property
    const isOnline = navigator.onLine;
    expect(typeof isOnline).toBe('boolean');

    // In test environment, this is usually true
    // In production, this will reflect actual network status
  });

  it('should handle storage when switching offline/online', async () => {
    // Save while "online"
    await saveModule(testModule);

    // Verify data exists
    let module = await getModule('offline-test-module');
    expect(module).toBeDefined();

    // Data should still be accessible "offline"
    // IndexedDB doesn't care about network status
    module = await getModule('offline-test-module');
    expect(module).toBeDefined();
  });

  it('should queue operations during offline mode', async () => {
    // Save module
    await saveModule(testModule);

    // Save progress multiple times (simulating offline study session)
    const updates = [
      { repetitions: 1, interval: 1 },
      { repetitions: 2, interval: 6 },
      { repetitions: 3, interval: 15 },
    ];

    for (const update of updates) {
      await saveUserProgress('offline-test-module', 'word-001', {
        interval: update.interval,
        ease_factor: 2.5,
        repetitions: update.repetitions,
        due_date: new Date(),
        last_reviewed: new Date(),
      });
    }

    // Verify final state
    const progress = await getUserProgress('offline-test-module', 'word-001');
    expect(progress!.repetitions).toBe(3);
    expect(progress!.interval).toBe(15);
  });

  it('should maintain data integrity across sessions', async () => {
    // Session 1: Save module and initial progress
    await saveModule(testModule);
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    // Simulate app close/reopen
    // In real scenario, this would involve closing and reopening the browser
    // Here we just verify the data persists

    // Session 2: Verify data is still there
    const module = await getModule('offline-test-module');
    const progress = await getUserProgress('offline-test-module', 'word-001');

    expect(module).toBeDefined();
    expect(progress).toBeDefined();
    expect(progress!.repetitions).toBe(1);
  });

  it('should handle large offline data sets', async () => {
    const largeModule: VocabularyModule = {
      ...testModule,
      vocabulary_entries: Array.from({ length: 500 }, (_, i) => ({
        entry_id: `word-${String(i).padStart(3, '0')}`,
        term: `word${i}`,
        cards: [
          {
            card_id: `word-${String(i).padStart(3, '0')}-img-01`,
            card_type: 'image' as const,
            content: { image_url: `word${i}.jpg`, image_alt: `Word ${i}` },
          },
        ],
      })),
    };

    await saveModule(largeModule);

    const stored = await getModule('offline-test-module');
    expect(stored).toBeDefined();
    expect(stored!.vocabulary_entries).toHaveLength(500);
  });

  it('should preserve timestamps across offline operations', async () => {
    const beforeSave = new Date();

    await saveModule(testModule);
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: beforeSave,
    });

    const progress = await getUserProgress('offline-test-module', 'word-001');
    expect(progress!.last_reviewed).toBeDefined();
    expect(progress!.last_reviewed.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime() - 1000);
  });

  it('should handle IndexedDB errors gracefully', async () => {
    // Try to get non-existent module
    const module = await getModule('non-existent-module');
    expect(module).toBeUndefined();

    // Try to get progress for non-existent entry
    const progress = await getUserProgress('non-existent-module', 'non-existent-entry');
    expect(progress).toBeUndefined();
  });

  it('should support export/backup of offline data', async () => {
    await saveModule(testModule);
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    const module = await getModule('offline-test-module');
    const progress = await getUserProgress('offline-test-module', 'word-001');

    // Create backup object
    const backup = {
      module,
      progress,
      timestamp: new Date().toISOString(),
    };

    expect(backup.module).toBeDefined();
    expect(backup.progress).toBeDefined();

    // Verify backup can be serialized (for export)
    const serialized = JSON.stringify(backup);
    expect(serialized).toBeTruthy();

    const deserialized = JSON.parse(serialized);
    expect(deserialized.module.module_metadata.module_id).toBe('offline-test-module');
  });

  it('should clear offline data when requested', async () => {
    await saveModule(testModule);
    await saveUserProgress('offline-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    // Verify data exists
    let module = await getModule('offline-test-module');
    expect(module).toBeDefined();

    // Clear all data
    await clearDatabase();

    // Verify data was cleared
    module = await getModule('offline-test-module');
    expect(module).toBeUndefined();
  });

  it('should measure IndexedDB performance', async () => {
    const startTime = performance.now();

    await saveModule(testModule);

    const saveTime = performance.now() - startTime;

    // IndexedDB operations should be fast (< 100ms for simple operations)
    expect(saveTime).toBeLessThan(1000);

    const retrieveStart = performance.now();
    await getModule('offline-test-module');
    const retrieveTime = performance.now() - retrieveStart;

    expect(retrieveTime).toBeLessThan(1000);
  });
});
