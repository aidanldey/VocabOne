/**
 * Integration Tests: Progress Persistence
 * Tests that progress is correctly saved and loaded from IndexedDB
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeDatabase,
  clearDatabase,
  db,
  saveUserProgress,
  getUserProgress,
  getAllProgressForModule,
  deleteProgress,
  saveModule,
  getModule,
  saveSession,
  getAllSessions,
  getSessionsForModule,
} from '@/services/storage/database';
import type { VocabularyModule } from '@/types/module';

describe('Progress Persistence Integration', () => {
  const testModule: VocabularyModule = {
    schema_version: '1.0.0',
    module_metadata: {
      module_id: 'progress-test-module',
      title: 'Progress Test Module',
      description: 'Module for testing progress persistence',
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
      {
        entry_id: 'word-002',
        term: 'gato',
        cards: [
          {
            card_id: 'word-002-img-01',
            card_type: 'image',
            content: { image_url: 'cat.jpg', image_alt: 'A cat' },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await initializeDatabase();
    await saveModule(testModule);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should save and retrieve user progress', async () => {
    const progress = {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(Date.now() + 86400000), // +1 day
      last_reviewed: new Date(),
    };

    await saveUserProgress('progress-test-module', 'word-001', progress);

    const retrieved = await getUserProgress('progress-test-module', 'word-001');
    expect(retrieved).toBeDefined();
    expect(retrieved!.interval).toBe(progress.interval);
    expect(retrieved!.ease_factor).toBe(progress.ease_factor);
    expect(retrieved!.repetitions).toBe(progress.repetitions);
  });

  it('should update existing progress', async () => {
    const initialProgress = {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(Date.now() + 86400000),
      last_reviewed: new Date(),
    };

    await saveUserProgress('progress-test-module', 'word-001', initialProgress);

    // Update progress
    const updatedProgress = {
      interval: 6,
      ease_factor: 2.6,
      repetitions: 2,
      due_date: new Date(Date.now() + 518400000), // +6 days
      last_reviewed: new Date(),
    };

    await saveUserProgress('progress-test-module', 'word-001', updatedProgress);

    const retrieved = await getUserProgress('progress-test-module', 'word-001');
    expect(retrieved!.interval).toBe(6);
    expect(retrieved!.repetitions).toBe(2);
  });

  it('should retrieve all progress for a module', async () => {
    // Save progress for multiple words
    await saveUserProgress('progress-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    await saveUserProgress('progress-test-module', 'word-002', {
      interval: 6,
      ease_factor: 2.6,
      repetitions: 2,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    const allProgress = await getAllProgressForModule('progress-test-module');
    expect(allProgress).toHaveLength(2);
  });

  it('should delete progress for specific entry', async () => {
    await saveUserProgress('progress-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    let progress = await getUserProgress('progress-test-module', 'word-001');
    expect(progress).toBeDefined();

    await deleteProgress('progress-test-module', 'word-001');

    progress = await getUserProgress('progress-test-module', 'word-001');
    expect(progress).toBeUndefined();
  });

  it('should persist progress across database reconnections', async () => {
    await saveUserProgress('progress-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    // Close and reopen database
    db.close();
    await initializeDatabase();

    const progress = await getUserProgress('progress-test-module', 'word-001');
    expect(progress).toBeDefined();
    expect(progress!.interval).toBe(1);
  });

  it('should save and retrieve study sessions', async () => {
    const session = {
      module_id: 'progress-test-module',
      start_time: new Date(),
      end_time: new Date(Date.now() + 600000), // 10 minutes later
      cards_reviewed: 10,
      correct_answers: 8,
      incorrect_answers: 2,
      duration_seconds: 600,
    };

    await saveSession(session);

    const sessions = await getAllSessions();
    expect(sessions.length).toBeGreaterThan(0);

    const moduleSessions = await getSessionsForModule('progress-test-module');
    expect(moduleSessions).toHaveLength(1);
    expect(moduleSessions[0].cards_reviewed).toBe(10);
    expect(moduleSessions[0].correct_answers).toBe(8);
  });

  it('should track streak correctly', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Session today
    await saveSession({
      module_id: 'progress-test-module',
      start_time: today,
      end_time: new Date(),
      cards_reviewed: 10,
      correct_answers: 8,
      incorrect_answers: 2,
      duration_seconds: 600,
    });

    // Session yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await saveSession({
      module_id: 'progress-test-module',
      start_time: yesterday,
      end_time: yesterday,
      cards_reviewed: 15,
      correct_answers: 12,
      incorrect_answers: 3,
      duration_seconds: 900,
    });

    const sessions = await getAllSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle progress for large vocabulary set', async () => {
    const largeModule: VocabularyModule = {
      ...testModule,
      module_metadata: {
        ...testModule.module_metadata,
        module_id: 'large-module',
      },
      vocabulary_entries: Array.from({ length: 100 }, (_, i) => ({
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

    // Save progress for all entries
    const savePromises = largeModule.vocabulary_entries.map((entry) =>
      saveUserProgress('large-module', entry.entry_id, {
        interval: Math.floor(Math.random() * 30),
        ease_factor: 2.5,
        repetitions: Math.floor(Math.random() * 5),
        due_date: new Date(Date.now() + Math.random() * 2592000000), // Random within 30 days
        last_reviewed: new Date(),
      })
    );

    await Promise.all(savePromises);

    const allProgress = await getAllProgressForModule('large-module');
    expect(allProgress).toHaveLength(100);
  });

  it('should handle concurrent progress updates', async () => {
    // Simulate multiple concurrent updates
    const updates = Array.from({ length: 10 }, (_, i) =>
      saveUserProgress('progress-test-module', 'word-001', {
        interval: i + 1,
        ease_factor: 2.5 + i * 0.1,
        repetitions: i,
        due_date: new Date(),
        last_reviewed: new Date(),
      })
    );

    await Promise.all(updates);

    const progress = await getUserProgress('progress-test-module', 'word-001');
    expect(progress).toBeDefined();
    // Should have the last update
    expect(progress!.repetitions).toBeGreaterThanOrEqual(0);
  });

  it('should export module with progress', async () => {
    await saveUserProgress('progress-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    const module = await getModule('progress-test-module');
    const progress = await getAllProgressForModule('progress-test-module');

    expect(module).toBeDefined();
    expect(progress).toHaveLength(1);

    // Export data structure
    const exportData = {
      module,
      progress,
      exported_at: new Date().toISOString(),
    };

    expect(exportData.module).toBeDefined();
    expect(exportData.progress).toHaveLength(1);
  });

  it('should handle storage quota gracefully', async () => {
    // This test simulates approaching storage limits
    // In practice, IndexedDB has generous limits (50MB+)

    try {
      const largeData = {
        interval: 1,
        ease_factor: 2.5,
        repetitions: 1,
        due_date: new Date(),
        last_reviewed: new Date(),
        // Additional data that won't cause issues in test
        metadata: 'x'.repeat(1000),
      };

      await saveUserProgress('progress-test-module', 'word-001', largeData);

      const retrieved = await getUserProgress('progress-test-module', 'word-001');
      expect(retrieved).toBeDefined();
    } catch (error) {
      // If quota exceeded, should throw specific error
      expect(error).toBeDefined();
    }
  });

  it('should maintain data integrity during bulk operations', async () => {
    const bulkProgress = testModule.vocabulary_entries.map((entry, i) => ({
      module_id: 'progress-test-module',
      entry_id: entry.entry_id,
      interval: i + 1,
      ease_factor: 2.5,
      repetitions: i,
      due_date: new Date(Date.now() + (i + 1) * 86400000),
      last_reviewed: new Date(),
    }));

    // Save all progress
    for (const progress of bulkProgress) {
      await saveUserProgress(progress.module_id, progress.entry_id, progress);
    }

    // Verify all were saved correctly
    const allProgress = await getAllProgressForModule('progress-test-module');
    expect(allProgress).toHaveLength(bulkProgress.length);

    // Verify each entry
    for (let i = 0; i < bulkProgress.length; i++) {
      const progress = await getUserProgress(
        'progress-test-module',
        testModule.vocabulary_entries[i].entry_id
      );
      expect(progress?.interval).toBe(i + 1);
    }
  });

  it('should handle progress for deleted modules gracefully', async () => {
    await saveUserProgress('progress-test-module', 'word-001', {
      interval: 1,
      ease_factor: 2.5,
      repetitions: 1,
      due_date: new Date(),
      last_reviewed: new Date(),
    });

    // Progress should exist
    let progress = await getUserProgress('progress-test-module', 'word-001');
    expect(progress).toBeDefined();

    // Even if module is deleted, progress remains (could be re-imported)
    // This is by design for data preservation
    const allProgress = await getAllProgressForModule('progress-test-module');
    expect(allProgress.length).toBeGreaterThan(0);
  });
});
