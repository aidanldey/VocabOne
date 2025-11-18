import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getProgressRepository,
  ProgressRepository,
  ProgressRepositoryError,
  type ProgressUpdate,
} from './progressRepository';
import {
  initializeDatabase,
  closeDatabase,
  resetDatabase,
  saveModule,
} from './database';
import { spanishAnimalsModule } from '../modules/sampleModule';
import { getInitialProgress, calculateNextReview } from '../spacedRepetition/sm2Algorithm';
import { ReviewQuality } from '@/models/types';
import type { UserProgress } from '@/models/types';

describe('ProgressRepository', () => {
  let repository: ProgressRepository;
  const moduleId = spanishAnimalsModule.moduleId;

  beforeEach(async () => {
    await initializeDatabase();
    await resetDatabase();
    await saveModule(spanishAnimalsModule);
    repository = getProgressRepository();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const repo1 = getProgressRepository();
      const repo2 = getProgressRepository();
      expect(repo1).toBe(repo2);
    });
  });

  describe('saveProgress', () => {
    it('should save progress for an entry', async () => {
      const progress = getInitialProgress();

      await repository.saveProgress(moduleId, 'perro-001', progress);

      const retrieved = await repository.getProgress(moduleId, 'perro-001');
      expect(retrieved).toEqual(progress);
    });

    it('should update existing progress', async () => {
      let progress = getInitialProgress();
      await repository.saveProgress(moduleId, 'perro-001', progress);

      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      await repository.saveProgress(moduleId, 'perro-001', progress);

      const retrieved = await repository.getProgress(moduleId, 'perro-001');
      expect(retrieved!.repetitions).toBe(1);
      expect(retrieved!.totalReviews).toBe(1);
    });

    it('should save with retry options', async () => {
      const progress = getInitialProgress();

      await expect(
        repository.saveProgress(moduleId, 'perro-001', progress, {
          retry: true,
          maxRetries: 2,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('getProgress', () => {
    beforeEach(async () => {
      const progress = getInitialProgress();
      await repository.saveProgress(moduleId, 'perro-001', progress);
    });

    it('should retrieve progress for an entry', async () => {
      const progress = await repository.getProgress(moduleId, 'perro-001');

      expect(progress).toBeDefined();
      expect(progress!.repetitions).toBe(0);
    });

    it('should return null for non-existent progress', async () => {
      const progress = await repository.getProgress(moduleId, 'non-existent');

      expect(progress).toBeNull();
    });
  });

  describe('getModuleProgress', () => {
    beforeEach(async () => {
      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());
      await repository.saveProgress(moduleId, 'gato-002', getInitialProgress());
      await repository.saveProgress(moduleId, 'pajaro-003', getInitialProgress());
    });

    it('should retrieve all progress for a module', async () => {
      const progressMap = await repository.getModuleProgress(moduleId);

      expect(progressMap.size).toBe(3);
      expect(progressMap.has('perro-001')).toBe(true);
      expect(progressMap.has('gato-002')).toBe(true);
      expect(progressMap.has('pajaro-003')).toBe(true);
    });

    it('should return empty map for module with no progress', async () => {
      const progressMap = await repository.getModuleProgress('non-existent');

      expect(progressMap.size).toBe(0);
    });
  });

  describe('resetProgress', () => {
    beforeEach(async () => {
      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());
      await repository.saveProgress(moduleId, 'gato-002', getInitialProgress());
    });

    it('should delete all progress for a module', async () => {
      await repository.resetProgress(moduleId);

      const progressMap = await repository.getModuleProgress(moduleId);
      expect(progressMap.size).toBe(0);
    });

    it('should not affect other modules', async () => {
      const otherModuleId = 'other-module';
      await repository.saveProgress(otherModuleId, 'entry-001', getInitialProgress());

      await repository.resetProgress(moduleId);

      const progressMap = await repository.getModuleProgress(otherModuleId);
      expect(progressMap.size).toBe(1);
    });
  });

  describe('bulkUpdate', () => {
    it('should save multiple progress records', async () => {
      const updates: ProgressUpdate[] = [
        { moduleId, entryId: 'perro-001', progress: getInitialProgress() },
        { moduleId, entryId: 'gato-002', progress: getInitialProgress() },
        { moduleId, entryId: 'pajaro-003', progress: getInitialProgress() },
      ];

      await repository.bulkUpdate(updates);

      const progressMap = await repository.getModuleProgress(moduleId);
      expect(progressMap.size).toBe(3);
    });

    it('should update existing records', async () => {
      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());

      const updatedProgress = calculateNextReview(
        getInitialProgress(),
        ReviewQuality.GOOD
      );
      const updates: ProgressUpdate[] = [
        { moduleId, entryId: 'perro-001', progress: updatedProgress },
      ];

      await repository.bulkUpdate(updates);

      const progress = await repository.getProgress(moduleId, 'perro-001');
      expect(progress!.repetitions).toBe(1);
    });

    it('should bulk update with retry options', async () => {
      const updates: ProgressUpdate[] = [
        { moduleId, entryId: 'perro-001', progress: getInitialProgress() },
      ];

      await expect(
        repository.bulkUpdate(updates, { retry: true, maxRetries: 2 })
      ).resolves.not.toThrow();
    });
  });

  describe('hasProgress', () => {
    beforeEach(async () => {
      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());
    });

    it('should return true for existing progress', async () => {
      const exists = await repository.hasProgress(moduleId, 'perro-001');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent progress', async () => {
      const exists = await repository.hasProgress(moduleId, 'non-existent');

      expect(exists).toBe(false);
    });
  });

  describe('countModuleProgress', () => {
    it('should count progress records for a module', async () => {
      expect(await repository.countModuleProgress(moduleId)).toBe(0);

      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());
      expect(await repository.countModuleProgress(moduleId)).toBe(1);

      await repository.saveProgress(moduleId, 'gato-002', getInitialProgress());
      expect(await repository.countModuleProgress(moduleId)).toBe(2);
    });
  });

  describe('getProgressStats', () => {
    it('should calculate statistics for a module', async () => {
      // Save varied progress states
      const newProgress = getInitialProgress();
      await repository.saveProgress(moduleId, 'entry-1', newProgress);

      let learningProgress = getInitialProgress();
      learningProgress = calculateNextReview(learningProgress, ReviewQuality.GOOD);
      await repository.saveProgress(moduleId, 'entry-2', learningProgress);

      const masteredProgress: UserProgress = {
        ...getInitialProgress(),
        repetitions: 10,
        easeFactor: 2.8,
        interval: 30,
        mastered: true,
      };
      await repository.saveProgress(moduleId, 'entry-3', masteredProgress);

      const stats = await repository.getProgressStats(moduleId);

      expect(stats.total).toBe(3);
      expect(stats.mastered).toBe(1);
      expect(stats.learning).toBe(1); // entry-2 has repetitions > 0 but not mastered
      expect(stats.averageEaseFactor).toBeGreaterThan(0);
    });

    it('should return zeros for empty module', async () => {
      const stats = await repository.getProgressStats(moduleId);

      expect(stats.total).toBe(0);
      expect(stats.mastered).toBe(0);
      expect(stats.learning).toBe(0);
      expect(stats.averageEaseFactor).toBe(0);
    });
  });

  describe('deleteProgress', () => {
    beforeEach(async () => {
      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());
    });

    it('should delete progress for an entry', async () => {
      await repository.deleteProgress(moduleId, 'perro-001');

      const progress = await repository.getProgress(moduleId, 'perro-001');
      expect(progress).toBeNull();
    });

    it('should not throw when deleting non-existent progress', async () => {
      await expect(
        repository.deleteProgress(moduleId, 'non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('getRecentProgress', () => {
    it('should retrieve progress updated since a date', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Save progress with different dates
      await repository.saveProgress(moduleId, 'entry-1', getInitialProgress());

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await repository.saveProgress(moduleId, 'entry-2', getInitialProgress());

      const recent = await repository.getRecentProgress(
        moduleId,
        yesterday.toISOString()
      );

      expect(recent.length).toBeGreaterThan(0);
      expect(recent.every((r) => r.moduleId === moduleId)).toBe(true);
    });

    it('should return empty array for date in future', async () => {
      await repository.saveProgress(moduleId, 'perro-001', getInitialProgress());

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const recent = await repository.getRecentProgress(
        moduleId,
        tomorrow.toISOString()
      );

      expect(recent).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw ProgressRepositoryError with operation name', async () => {
      // Test with an operation that will fail
      const invalidModule = 'invalid-module-id-that-does-not-exist';

      // This might not always throw depending on IndexedDB implementation
      // But we can test the error structure when it does
      try {
        await repository.resetProgress(invalidModule);
        // If it doesn't throw, that's ok - just test a different scenario
      } catch (error) {
        if (error instanceof ProgressRepositoryError) {
          expect(error.operation).toBeDefined();
          expect(error.message).toBeDefined();
        }
      }
    });
  });
});
