/**
 * Repository pattern for user progress data access.
 * Manages vocabulary learning progress across modules and entries.
 */

import type { UserProgress } from '@/models/types';
import {
  getDatabase,
  saveProgress as dbSaveProgress,
  getProgress as dbGetProgress,
  getModuleProgress as dbGetModuleProgress,
  batchSaveProgress as dbBatchSaveProgress,
} from './database';

/**
 * Error thrown when a progress operation fails.
 */
export class ProgressRepositoryError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ProgressRepositoryError';
  }
}

/**
 * Progress update for batch operations.
 */
export interface ProgressUpdate {
  /** Module identifier */
  moduleId: string;
  /** Entry identifier */
  entryId: string;
  /** Progress data */
  progress: UserProgress;
}

/**
 * Options for progress operations.
 */
export interface ProgressOptions {
  /** Whether to retry on failure */
  retry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * Repository for user progress operations.
 */
export class ProgressRepository {
  /**
   * Saves progress for a vocabulary entry.
   *
   * @param moduleId - Module identifier
   * @param entryId - Entry identifier
   * @param progress - Progress data to save
   * @param options - Operation options
   * @throws ProgressRepositoryError if save fails
   *
   * @example
   * ```typescript
   * const repo = new ProgressRepository();
   * await repo.saveProgress('spanish-animals', 'perro-001', updatedProgress);
   * ```
   */
  async saveProgress(
    moduleId: string,
    entryId: string,
    progress: UserProgress,
    options: ProgressOptions = {}
  ): Promise<void> {
    const { retry = true, maxRetries = 3 } = options;

    const operation = async () => {
      await dbSaveProgress(moduleId, entryId, progress);
    };

    try {
      if (retry) {
        await this.withRetry(operation, maxRetries);
      } else {
        await operation();
      }
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to save progress for ${moduleId}:${entryId}`,
        'saveProgress',
        error
      );
    }
  }

  /**
   * Gets progress for a specific entry.
   *
   * @param moduleId - Module identifier
   * @param entryId - Entry identifier
   * @returns Progress data, or null if not found
   * @throws ProgressRepositoryError if retrieval fails
   */
  async getProgress(moduleId: string, entryId: string): Promise<UserProgress | null> {
    try {
      const stored = await dbGetProgress(moduleId, entryId);
      return stored ? stored.progress : null;
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to get progress for ${moduleId}:${entryId}`,
        'getProgress',
        error
      );
    }
  }

  /**
   * Gets all progress for a module as a Map.
   *
   * @param moduleId - Module identifier
   * @returns Map of entryId -> UserProgress
   * @throws ProgressRepositoryError if retrieval fails
   *
   * @example
   * ```typescript
   * const progressMap = await repo.getModuleProgress('spanish-animals');
   * const perroProgress = progressMap.get('perro-001');
   * ```
   */
  async getModuleProgress(moduleId: string): Promise<Map<string, UserProgress>> {
    try {
      const records = await dbGetModuleProgress(moduleId);
      const progressMap = new Map<string, UserProgress>();

      for (const record of records) {
        progressMap.set(record.entryId, record.progress);
      }

      return progressMap;
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to get module progress for ${moduleId}`,
        'getModuleProgress',
        error
      );
    }
  }

  /**
   * Resets all progress for a module.
   * This deletes all progress records for the module's entries.
   *
   * @param moduleId - Module identifier
   * @throws ProgressRepositoryError if reset fails
   *
   * @example
   * ```typescript
   * await repo.resetProgress('spanish-animals');
   * console.log('All progress reset for module');
   * ```
   */
  async resetProgress(moduleId: string): Promise<void> {
    try {
      const db = getDatabase();
      await db.progress.where('moduleId').equals(moduleId).delete();
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to reset progress for module ${moduleId}`,
        'resetProgress',
        error
      );
    }
  }

  /**
   * Bulk updates progress for multiple entries.
   * More efficient than calling saveProgress multiple times.
   *
   * @param updates - Array of progress updates
   * @param options - Operation options
   * @throws ProgressRepositoryError if bulk update fails
   *
   * @example
   * ```typescript
   * await repo.bulkUpdate([
   *   { moduleId: 'spanish', entryId: 'perro-001', progress: progress1 },
   *   { moduleId: 'spanish', entryId: 'gato-002', progress: progress2 },
   * ]);
   * ```
   */
  async bulkUpdate(
    updates: ProgressUpdate[],
    options: ProgressOptions = {}
  ): Promise<void> {
    const { retry = true, maxRetries = 3 } = options;

    const operation = async () => {
      await dbBatchSaveProgress(updates);
    };

    try {
      if (retry) {
        await this.withRetry(operation, maxRetries);
      } else {
        await operation();
      }
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to bulk update ${updates.length} progress records`,
        'bulkUpdate',
        error
      );
    }
  }

  /**
   * Checks if progress exists for an entry.
   *
   * @param moduleId - Module identifier
   * @param entryId - Entry identifier
   * @returns true if progress exists
   */
  async hasProgress(moduleId: string, entryId: string): Promise<boolean> {
    try {
      const progress = await this.getProgress(moduleId, entryId);
      return progress !== null;
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to check progress existence for ${moduleId}:${entryId}`,
        'hasProgress',
        error
      );
    }
  }

  /**
   * Counts total progress records for a module.
   *
   * @param moduleId - Module identifier
   * @returns Number of progress records
   */
  async countModuleProgress(moduleId: string): Promise<number> {
    try {
      const db = getDatabase();
      return await db.progress.where('moduleId').equals(moduleId).count();
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to count progress for module ${moduleId}`,
        'countModuleProgress',
        error
      );
    }
  }

  /**
   * Gets progress statistics for a module.
   *
   * @param moduleId - Module identifier
   * @returns Statistics about progress
   */
  async getProgressStats(moduleId: string): Promise<{
    total: number;
    mastered: number;
    learning: number;
    averageEaseFactor: number;
  }> {
    try {
      const progressMap = await this.getModuleProgress(moduleId);
      let mastered = 0;
      let learning = 0;
      let totalEase = 0;

      for (const progress of progressMap.values()) {
        if (progress.mastered) {
          mastered++;
        } else if (progress.repetitions > 0) {
          learning++;
        }
        totalEase += progress.easeFactor;
      }

      return {
        total: progressMap.size,
        mastered,
        learning,
        averageEaseFactor: progressMap.size > 0 ? totalEase / progressMap.size : 0,
      };
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to get progress stats for module ${moduleId}`,
        'getProgressStats',
        error
      );
    }
  }

  /**
   * Deletes progress for a specific entry.
   *
   * @param moduleId - Module identifier
   * @param entryId - Entry identifier
   */
  async deleteProgress(moduleId: string, entryId: string): Promise<void> {
    try {
      const db = getDatabase();
      const id = `${moduleId}:${entryId}`;
      await db.progress.delete(id);
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to delete progress for ${moduleId}:${entryId}`,
        'deleteProgress',
        error
      );
    }
  }

  /**
   * Gets progress records that were updated recently.
   *
   * @param moduleId - Module identifier
   * @param sinceDate - ISO date string
   * @returns Progress records updated since the date
   */
  async getRecentProgress(moduleId: string, sinceDate: string): Promise<ProgressUpdate[]> {
    try {
      const db = getDatabase();
      const records = await db.progress
        .where('moduleId')
        .equals(moduleId)
        .and((record) => record.updatedAt >= sinceDate)
        .toArray();

      return records.map((record) => ({
        moduleId: record.moduleId,
        entryId: record.entryId,
        progress: record.progress,
      }));
    } catch (error) {
      throw new ProgressRepositoryError(
        `Failed to get recent progress for module ${moduleId}`,
        'getRecentProgress',
        error
      );
    }
  }

  /**
   * Retries an operation with exponential backoff.
   *
   * @param operation - Function to retry
   * @param maxAttempts - Maximum retry attempts
   * @returns Promise resolving to operation result
   */
  private async withRetry<T>(operation: () => Promise<T>, maxAttempts: number = 3): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          break;
        }

        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.warn(`Progress operation retry ${attempt}/${maxAttempts}`);
      }
    }

    throw lastError;
  }
}

/**
 * Singleton instance of ProgressRepository.
 */
let progressRepositoryInstance: ProgressRepository | null = null;

/**
 * Gets the singleton ProgressRepository instance.
 *
 * @returns ProgressRepository instance
 */
export function getProgressRepository(): ProgressRepository {
  if (!progressRepositoryInstance) {
    progressRepositoryInstance = new ProgressRepository();
  }
  return progressRepositoryInstance;
}
