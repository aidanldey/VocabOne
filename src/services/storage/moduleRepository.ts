/**
 * Repository pattern for vocabulary module data access.
 * Provides a clean abstraction over database operations with error handling.
 */

import type { VocabularyModule } from '@/models/types';
import {
  getDatabase,
  saveModule as dbSaveModule,
  getModule as dbGetModule,
  getAllModules as dbGetAllModules,
  deleteModule as dbDeleteModule,
  loadModuleWithProgress,
  type StoredModule,
} from './database';

/**
 * Error thrown when a module operation fails.
 */
export class ModuleRepositoryError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ModuleRepositoryError';
  }
}

/**
 * Options for retry logic.
 */
export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
}

/**
 * Default retry options.
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 100,
  exponentialBackoff: true,
};

/**
 * Retries an operation with exponential backoff.
 *
 * @param operation - The operation to retry
 * @param options - Retry configuration
 * @returns Promise resolving to the operation result
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = config.exponentialBackoff
        ? config.delayMs * Math.pow(2, attempt - 1)
        : config.delayMs;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.warn(`Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms`);
    }
  }

  throw lastError;
}

/**
 * Repository for vocabulary module operations.
 */
export class ModuleRepository {
  /**
   * Saves a vocabulary module to storage.
   *
   * @param module - The module to save
   * @param retryOptions - Optional retry configuration
   * @throws ModuleRepositoryError if save fails
   *
   * @example
   * ```typescript
   * const repo = new ModuleRepository();
   * await repo.save(spanishModule);
   * ```
   */
  async save(module: VocabularyModule, retryOptions?: RetryOptions): Promise<void> {
    try {
      await withRetry(async () => {
        await dbSaveModule(module);
      }, retryOptions);
    } catch (error) {
      throw new ModuleRepositoryError(
        `Failed to save module "${module.moduleId}"`,
        'save',
        error
      );
    }
  }

  /**
   * Finds a module by its ID.
   *
   * @param id - Module identifier
   * @param includeProgress - Whether to load with user progress merged
   * @returns The module, or null if not found
   * @throws ModuleRepositoryError if retrieval fails
   *
   * @example
   * ```typescript
   * const module = await repo.findById('spanish-animals-basics', true);
   * if (module) {
   *   console.log(`Found ${module.entries.length} entries`);
   * }
   * ```
   */
  async findById(
    id: string,
    includeProgress: boolean = false
  ): Promise<VocabularyModule | null> {
    try {
      return await withRetry(async () => {
        if (includeProgress) {
          const module = await loadModuleWithProgress(id);
          return module || null;
        } else {
          const stored = await dbGetModule(id);
          return stored ? stored.data : null;
        }
      });
    } catch (error) {
      throw new ModuleRepositoryError(
        `Failed to find module "${id}"`,
        'findById',
        error
      );
    }
  }

  /**
   * Gets all stored modules.
   *
   * @param includeMetadata - Whether to include storage metadata
   * @returns Array of all modules
   * @throws ModuleRepositoryError if retrieval fails
   */
  async findAll(includeMetadata: boolean = false): Promise<VocabularyModule[] | StoredModule[]> {
    try {
      return await withRetry(async () => {
        const stored = await dbGetAllModules();
        if (includeMetadata) {
          return stored;
        }
        return stored.map((s) => s.data);
      });
    } catch (error) {
      throw new ModuleRepositoryError(
        'Failed to retrieve all modules',
        'findAll',
        error
      );
    }
  }

  /**
   * Deletes a module and all associated data.
   *
   * @param id - Module identifier
   * @param retryOptions - Optional retry configuration
   * @throws ModuleRepositoryError if deletion fails
   *
   * @example
   * ```typescript
   * await repo.delete('old-module-id');
   * console.log('Module and all progress deleted');
   * ```
   */
  async delete(id: string, retryOptions?: RetryOptions): Promise<void> {
    try {
      await withRetry(async () => {
        await dbDeleteModule(id);
      }, retryOptions);
    } catch (error) {
      throw new ModuleRepositoryError(
        `Failed to delete module "${id}"`,
        'delete',
        error
      );
    }
  }

  /**
   * Checks if a module exists.
   *
   * @param id - Module identifier
   * @returns true if module exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const module = await this.findById(id);
      return module !== null;
    } catch (error) {
      throw new ModuleRepositoryError(
        `Failed to check existence of module "${id}"`,
        'exists',
        error
      );
    }
  }

  /**
   * Counts total number of stored modules.
   *
   * @returns Number of modules
   */
  async count(): Promise<number> {
    try {
      return await withRetry(async () => {
        const db = getDatabase();
        return await db.modules.count();
      });
    } catch (error) {
      throw new ModuleRepositoryError(
        'Failed to count modules',
        'count',
        error
      );
    }
  }

  /**
   * Performs a transaction with multiple module operations.
   * All operations succeed or all fail together.
   *
   * @param operations - Function containing operations to perform
   * @returns Promise resolving to the transaction result
   *
   * @example
   * ```typescript
   * await repo.transaction(async () => {
   *   await repo.save(module1);
   *   await repo.save(module2);
   *   await repo.delete('old-module');
   * });
   * ```
   */
  async transaction<T>(operations: () => Promise<T>): Promise<T> {
    try {
      const db = getDatabase();
      return await db.transaction('rw', [db.modules, db.progress, db.sessions], operations);
    } catch (error) {
      throw new ModuleRepositoryError(
        'Transaction failed',
        'transaction',
        error
      );
    }
  }

  /**
   * Searches modules by title or tags.
   *
   * @param query - Search query
   * @returns Matching modules
   */
  async search(query: string): Promise<VocabularyModule[]> {
    try {
      const all = await this.findAll() as VocabularyModule[];
      const lowerQuery = query.toLowerCase();

      return all.filter((module) => {
        // Search in title
        if (module.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in description
        if (module.description?.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in tags
        if (module.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
          return true;
        }

        return false;
      });
    } catch (error) {
      throw new ModuleRepositoryError(
        `Failed to search modules for "${query}"`,
        'search',
        error
      );
    }
  }
}

/**
 * Singleton instance of ModuleRepository.
 */
let moduleRepositoryInstance: ModuleRepository | null = null;

/**
 * Gets the singleton ModuleRepository instance.
 *
 * @returns ModuleRepository instance
 */
export function getModuleRepository(): ModuleRepository {
  if (!moduleRepositoryInstance) {
    moduleRepositoryInstance = new ModuleRepository();
  }
  return moduleRepositoryInstance;
}
