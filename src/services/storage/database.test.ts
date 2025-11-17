import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  resetDatabase,
  saveModule,
  getModule,
  getAllModules,
  deleteModule,
  saveProgress,
  getProgress,
  getModuleProgress,
  loadModuleWithProgress,
  batchSaveProgress,
  createSession,
  updateSession,
  completeSession,
  getModuleSessions,
  getLatestSession,
  pruneOldSessions,
  exportUserData,
  importUserData,
} from './database';
import { spanishAnimalsModule } from '../modules/sampleModule';
import { getInitialProgress, calculateNextReview } from '../spacedRepetition/sm2Algorithm';
import { ReviewQuality } from '@/models/types';

describe('Database', () => {
  beforeEach(async () => {
    // Initialize and clear database before each test
    await initializeDatabase();
    await resetDatabase();
  });

  afterEach(async () => {
    // Clean up after each test
    await closeDatabase();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const db = await initializeDatabase();
      expect(db).toBeDefined();
      expect(db.modules).toBeDefined();
      expect(db.progress).toBeDefined();
      expect(db.sessions).toBeDefined();
    });

    it('should return singleton instance', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();
      expect(db1).toBe(db2);
    });

    it('should get database statistics', async () => {
      const db = getDatabase();
      const stats = await db.getStats();

      expect(stats.moduleCount).toBe(0);
      expect(stats.progressCount).toBe(0);
      expect(stats.sessionCount).toBe(0);
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Module Operations', () => {
    it('should save a module', async () => {
      const stored = await saveModule(spanishAnimalsModule);

      expect(stored.id).toBe(spanishAnimalsModule.moduleId);
      expect(stored.data).toEqual(spanishAnimalsModule);
      expect(stored.createdAt).toBeDefined();
      expect(stored.updatedAt).toBeDefined();
    });

    it('should retrieve a saved module', async () => {
      await saveModule(spanishAnimalsModule);
      const retrieved = await getModule(spanishAnimalsModule.moduleId);

      expect(retrieved).toBeDefined();
      expect(retrieved!.data).toEqual(spanishAnimalsModule);
    });

    it('should return undefined for non-existent module', async () => {
      const retrieved = await getModule('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all modules', async () => {
      await saveModule(spanishAnimalsModule);
      const testModule = {
        ...spanishAnimalsModule,
        moduleId: 'test-module',
        title: 'Test Module',
      };
      await saveModule(testModule);

      const all = await getAllModules();

      expect(all).toHaveLength(2);
      expect(all.map((m) => m.id)).toContain(spanishAnimalsModule.moduleId);
      expect(all.map((m) => m.id)).toContain('test-module');
    });

    it('should update existing module', async () => {
      const stored1 = await saveModule(spanishAnimalsModule);
      const createdAt = stored1.createdAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedModule = {
        ...spanishAnimalsModule,
        description: 'Updated description',
      };
      const stored2 = await saveModule(updatedModule);

      expect(stored2.createdAt).toBe(createdAt); // Should preserve original
      expect(stored2.updatedAt).not.toBe(stored1.updatedAt); // Should update
      expect(stored2.data.description).toBe('Updated description');
    });

    it('should delete module and associated data', async () => {
      await saveModule(spanishAnimalsModule);
      await saveProgress(
        spanishAnimalsModule.moduleId,
        'perro-001',
        getInitialProgress()
      );
      await createSession(spanishAnimalsModule.moduleId);

      await deleteModule(spanishAnimalsModule.moduleId);

      const module = await getModule(spanishAnimalsModule.moduleId);
      const progress = await getModuleProgress(spanishAnimalsModule.moduleId);
      const sessions = await getModuleSessions(spanishAnimalsModule.moduleId);

      expect(module).toBeUndefined();
      expect(progress).toHaveLength(0);
      expect(sessions).toHaveLength(0);
    });
  });

  describe('Progress Operations', () => {
    beforeEach(async () => {
      await saveModule(spanishAnimalsModule);
    });

    it('should save progress for an entry', async () => {
      const progress = getInitialProgress();
      const stored = await saveProgress(
        spanishAnimalsModule.moduleId,
        'perro-001',
        progress
      );

      expect(stored.id).toBe(`${spanishAnimalsModule.moduleId}:perro-001`);
      expect(stored.moduleId).toBe(spanishAnimalsModule.moduleId);
      expect(stored.entryId).toBe('perro-001');
      expect(stored.progress).toEqual(progress);
      expect(stored.updatedAt).toBeDefined();
    });

    it('should retrieve saved progress', async () => {
      const progress = getInitialProgress();
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', progress);

      const retrieved = await getProgress(spanishAnimalsModule.moduleId, 'perro-001');

      expect(retrieved).toBeDefined();
      expect(retrieved!.progress).toEqual(progress);
    });

    it('should update existing progress', async () => {
      let progress = getInitialProgress();
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', progress);

      // Update progress
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', progress);

      const retrieved = await getProgress(spanishAnimalsModule.moduleId, 'perro-001');

      expect(retrieved!.progress.repetitions).toBe(1);
      expect(retrieved!.progress.totalReviews).toBe(1);
    });

    it('should get all progress for a module', async () => {
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', getInitialProgress());
      await saveProgress(spanishAnimalsModule.moduleId, 'gato-002', getInitialProgress());

      const all = await getModuleProgress(spanishAnimalsModule.moduleId);

      expect(all).toHaveLength(2);
      expect(all.map((p) => p.entryId)).toContain('perro-001');
      expect(all.map((p) => p.entryId)).toContain('gato-002');
    });

    it('should batch save progress', async () => {
      const progressRecords = [
        { moduleId: spanishAnimalsModule.moduleId, entryId: 'perro-001', progress: getInitialProgress() },
        { moduleId: spanishAnimalsModule.moduleId, entryId: 'gato-002', progress: getInitialProgress() },
        { moduleId: spanishAnimalsModule.moduleId, entryId: 'pajaro-003', progress: getInitialProgress() },
      ];

      await batchSaveProgress(progressRecords);

      const all = await getModuleProgress(spanishAnimalsModule.moduleId);

      expect(all).toHaveLength(3);
    });

    it('should load module with progress merged', async () => {
      let progress1 = getInitialProgress();
      progress1 = calculateNextReview(progress1, ReviewQuality.GOOD);
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', progress1);

      let progress2 = getInitialProgress();
      progress2 = calculateNextReview(progress2, ReviewQuality.EASY);
      await saveProgress(spanishAnimalsModule.moduleId, 'gato-002', progress2);

      const moduleWithProgress = await loadModuleWithProgress(
        spanishAnimalsModule.moduleId
      );

      expect(moduleWithProgress).toBeDefined();
      expect(moduleWithProgress!.entries[0].progress).toBeDefined();
      expect(moduleWithProgress!.entries[0].progress?.repetitions).toBe(1);
      expect(moduleWithProgress!.entries[1].progress).toBeDefined();
      expect(moduleWithProgress!.entries[1].progress?.repetitions).toBe(1);
      // Entry without progress should be undefined
      expect(moduleWithProgress!.entries[2].progress).toBeUndefined();
    });
  });

  describe('Session Operations', () => {
    beforeEach(async () => {
      await saveModule(spanishAnimalsModule);
    });

    it('should create a new session', async () => {
      const session = await createSession(spanishAnimalsModule.moduleId);

      expect(session.id).toBeDefined();
      expect(session.moduleId).toBe(spanishAnimalsModule.moduleId);
      expect(session.startTime).toBeDefined();
      expect(session.endTime).toBeNull();
      expect(session.cardsReviewed).toBe(0);
      expect(session.completed).toBe(false);
    });

    it('should update a session', async () => {
      const session = await createSession(spanishAnimalsModule.moduleId);

      await updateSession(session.id, {
        cardsReviewed: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
      });

      const sessions = await getModuleSessions(spanishAnimalsModule.moduleId);
      const updated = sessions.find((s) => s.id === session.id);

      expect(updated!.cardsReviewed).toBe(5);
      expect(updated!.correctAnswers).toBe(4);
      expect(updated!.incorrectAnswers).toBe(1);
    });

    it('should complete a session', async () => {
      const session = await createSession(spanishAnimalsModule.moduleId);

      await completeSession(session.id, {
        cardsReviewed: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
        averageResponseTime: 3500,
      });

      const sessions = await getModuleSessions(spanishAnimalsModule.moduleId);
      const completed = sessions.find((s) => s.id === session.id);

      expect(completed!.completed).toBe(true);
      expect(completed!.endTime).toBeDefined();
      expect(completed!.cardsReviewed).toBe(10);
      expect(completed!.averageResponseTime).toBe(3500);
    });

    it('should get module sessions with limit', async () => {
      // Create multiple sessions
      for (let i = 0; i < 5; i++) {
        await createSession(spanishAnimalsModule.moduleId);
        await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure different timestamps
      }

      const all = await getModuleSessions(spanishAnimalsModule.moduleId);
      const limited = await getModuleSessions(spanishAnimalsModule.moduleId, 3);

      expect(all).toHaveLength(5);
      expect(limited).toHaveLength(3);
    });

    it('should get latest session', async () => {
      const session1 = await createSession(spanishAnimalsModule.moduleId);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const session2 = await createSession(spanishAnimalsModule.moduleId);

      const latest = await getLatestSession(spanishAnimalsModule.moduleId);

      expect(latest!.id).toBe(session2.id);
    });

    it('should prune old sessions', async () => {
      // Create 10 sessions
      for (let i = 0; i < 10; i++) {
        await createSession(spanishAnimalsModule.moduleId);
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      const beforePrune = await getModuleSessions(spanishAnimalsModule.moduleId);
      expect(beforePrune).toHaveLength(10);

      const deletedCount = await pruneOldSessions(5);

      const afterPrune = await getModuleSessions(spanishAnimalsModule.moduleId);
      expect(afterPrune).toHaveLength(5);
      expect(deletedCount).toBe(5);
    });
  });

  describe('Export/Import', () => {
    beforeEach(async () => {
      // Set up some data
      await saveModule(spanishAnimalsModule);
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', getInitialProgress());
      await createSession(spanishAnimalsModule.moduleId);
    });

    it('should export user data', async () => {
      const exported = await exportUserData();

      expect(exported).toBeDefined();
      const data = JSON.parse(exported);

      expect(data.version).toBe(1);
      expect(data.exportedAt).toBeDefined();
      expect(data.modules).toHaveLength(1);
      expect(data.progress).toHaveLength(1);
      expect(data.sessions).toHaveLength(1);
    });

    it('should import user data', async () => {
      const exported = await exportUserData();

      // Clear database
      await resetDatabase();

      // Verify empty
      let modules = await getAllModules();
      expect(modules).toHaveLength(0);

      // Import
      await importUserData(exported);

      // Verify restored
      modules = await getAllModules();
      const progress = await getModuleProgress(spanishAnimalsModule.moduleId);
      const sessions = await getModuleSessions(spanishAnimalsModule.moduleId);

      expect(modules).toHaveLength(1);
      expect(progress).toHaveLength(1);
      expect(sessions).toHaveLength(1);
    });

    it('should reject invalid import data', async () => {
      const invalidData = '{"invalid": true}';

      await expect(importUserData(invalidData)).rejects.toThrow();
    });

    it('should reject malformed JSON', async () => {
      const malformed = 'not valid json';

      await expect(importUserData(malformed)).rejects.toThrow();
    });
  });

  describe('Database Stats', () => {
    it('should track database statistics', async () => {
      await saveModule(spanishAnimalsModule);
      await saveProgress(spanishAnimalsModule.moduleId, 'perro-001', getInitialProgress());
      await createSession(spanishAnimalsModule.moduleId);

      const db = getDatabase();
      const stats = await db.getStats();

      expect(stats.moduleCount).toBe(1);
      expect(stats.progressCount).toBe(1);
      expect(stats.sessionCount).toBe(1);
    });
  });
});
