/**
 * IndexedDB database setup using Dexie for data persistence.
 * Stores vocabulary modules, user progress, and study sessions.
 */

import Dexie, { type Table } from 'dexie';
import type { VocabularyModule, UserProgress } from '@/models/types';

/**
 * Stored module with metadata.
 */
export interface StoredModule {
  /** Unique module identifier */
  id: string;
  /** The complete vocabulary module data */
  data: VocabularyModule;
  /** When the module was imported */
  createdAt: string;
  /** Last time the module was updated */
  updatedAt: string;
  /** Optional user-defined tags */
  userTags?: string[];
}

/**
 * User progress for a specific vocabulary entry.
 */
export interface StoredProgress {
  /** Composite key: moduleId:entryId */
  id: string;
  /** Module this progress belongs to */
  moduleId: string;
  /** Entry this progress is for */
  entryId: string;
  /** The progress data */
  progress: UserProgress;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Study session record.
 */
export interface StoredSession {
  /** Unique session ID (UUID) */
  id: string;
  /** Module studied in this session */
  moduleId: string;
  /** Session start time */
  startTime: string;
  /** Session end time (null if ongoing) */
  endTime: string | null;
  /** Number of cards reviewed */
  cardsReviewed: number;
  /** Number of correct answers */
  correctAnswers: number;
  /** Number of incorrect answers */
  incorrectAnswers: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Whether the session was completed */
  completed: boolean;
}

/**
 * VocabOne database class extending Dexie.
 */
export class VocabOneDatabase extends Dexie {
  // Declare table properties for TypeScript
  modules!: Table<StoredModule, string>;
  progress!: Table<StoredProgress, string>;
  sessions!: Table<StoredSession, string>;

  constructor() {
    super('VocabOneDB');

    // Define database schema
    // Version 1: Initial schema
    this.version(1).stores({
      modules: 'id, createdAt, updatedAt',
      progress: 'id, moduleId, entryId, updatedAt',
      sessions: 'id, moduleId, startTime, endTime, completed',
    });

    // Future versions can add migrations here:
    // this.version(2).stores({...}).upgrade(tx => {...});
  }

  /**
   * Clears all data from the database.
   * Use with caution - this is irreversible!
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.modules.clear(),
      this.progress.clear(),
      this.sessions.clear(),
    ]);
  }

  /**
   * Gets database statistics.
   */
  async getStats(): Promise<{
    moduleCount: number;
    progressCount: number;
    sessionCount: number;
    totalSize: number;
  }> {
    const [moduleCount, progressCount, sessionCount] = await Promise.all([
      this.modules.count(),
      this.progress.count(),
      this.sessions.count(),
    ]);

    // Estimate total size (rough approximation)
    const totalSize = await this.estimateSize();

    return {
      moduleCount,
      progressCount,
      sessionCount,
      totalSize,
    };
  }

  /**
   * Estimates the total database size in bytes.
   * Note: This is an approximation using browser storage APIs when available.
   */
  private async estimateSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }
}

// Singleton instance
let dbInstance: VocabOneDatabase | null = null;

/**
 * Gets the singleton database instance.
 * Creates the database if it doesn't exist.
 *
 * @returns The database instance
 * @throws Error if database initialization fails
 *
 * @example
 * ```typescript
 * const db = getDatabase();
 * const modules = await db.modules.toArray();
 * ```
 */
export function getDatabase(): VocabOneDatabase {
  if (!dbInstance) {
    dbInstance = new VocabOneDatabase();
  }
  return dbInstance;
}

/**
 * Initializes the database and verifies it's accessible.
 * Should be called on app startup.
 *
 * @returns Promise that resolves when database is ready
 * @throws Error if database cannot be initialized
 */
export async function initializeDatabase(): Promise<VocabOneDatabase> {
  try {
    const db = getDatabase();

    // Test database accessibility by attempting to read
    await db.modules.limit(1).toArray();

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);

    // Attempt recovery
    if (error instanceof Error && error.name === 'VersionError') {
      console.warn('Database version mismatch, attempting to recover...');
      await recoverDatabase();
      return getDatabase();
    }

    throw new Error(
      `Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Attempts to recover from database errors.
 * This will delete the existing database and create a new one.
 */
async function recoverDatabase(): Promise<void> {
  try {
    if (dbInstance) {
      await dbInstance.delete();
      dbInstance = null;
    }

    // Create new database
    dbInstance = new VocabOneDatabase();
    console.log('Database recovered successfully');
  } catch (error) {
    console.error('Database recovery failed:', error);
    throw error;
  }
}

/**
 * Closes the database connection.
 * Useful for cleanup during testing or app shutdown.
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Resets the database by deleting all data and reinitializing.
 * Use with caution in production!
 */
export async function resetDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.clearAll();
  }
}

// =============================================================================
// Module Operations
// =============================================================================

/**
 * Saves or updates a vocabulary module.
 *
 * @param module - The module to save
 * @returns Promise resolving to the stored module
 */
export async function saveModule(module: VocabularyModule): Promise<StoredModule> {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Check if module exists
  const existing = await db.modules.get(module.moduleId);

  const storedModule: StoredModule = {
    id: module.moduleId,
    data: module,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    userTags: existing?.userTags,
  };

  await db.modules.put(storedModule);
  return storedModule;
}

/**
 * Retrieves a module by ID.
 *
 * @param moduleId - The module identifier
 * @returns Promise resolving to the module, or undefined if not found
 */
export async function getModule(moduleId: string): Promise<StoredModule | undefined> {
  const db = getDatabase();
  return await db.modules.get(moduleId);
}

/**
 * Gets all stored modules.
 *
 * @returns Promise resolving to array of all modules
 */
export async function getAllModules(): Promise<StoredModule[]> {
  const db = getDatabase();
  return await db.modules.toArray();
}

/**
 * Deletes a module and all associated progress.
 *
 * @param moduleId - The module to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteModule(moduleId: string): Promise<void> {
  const db = getDatabase();

  await db.transaction('rw', [db.modules, db.progress, db.sessions], async () => {
    // Delete module
    await db.modules.delete(moduleId);

    // Delete associated progress
    await db.progress.where('moduleId').equals(moduleId).delete();

    // Delete associated sessions
    await db.sessions.where('moduleId').equals(moduleId).delete();
  });
}

// =============================================================================
// Progress Operations
// =============================================================================

/**
 * Saves user progress for a vocabulary entry.
 *
 * @param moduleId - Module identifier
 * @param entryId - Entry identifier
 * @param progress - Progress data to save
 * @returns Promise resolving to the stored progress
 */
export async function saveProgress(
  moduleId: string,
  entryId: string,
  progress: UserProgress
): Promise<StoredProgress> {
  const db = getDatabase();
  const id = `${moduleId}:${entryId}`;

  const storedProgress: StoredProgress = {
    id,
    moduleId,
    entryId,
    progress,
    updatedAt: new Date().toISOString(),
  };

  await db.progress.put(storedProgress);
  return storedProgress;
}

/**
 * Retrieves progress for a specific entry.
 *
 * @param moduleId - Module identifier
 * @param entryId - Entry identifier
 * @returns Promise resolving to progress, or undefined if not found
 */
export async function getProgress(
  moduleId: string,
  entryId: string
): Promise<StoredProgress | undefined> {
  const db = getDatabase();
  const id = `${moduleId}:${entryId}`;
  return await db.progress.get(id);
}

/**
 * Gets all progress for a specific module.
 *
 * @param moduleId - Module identifier
 * @returns Promise resolving to array of progress records
 */
export async function getModuleProgress(moduleId: string): Promise<StoredProgress[]> {
  const db = getDatabase();
  return await db.progress.where('moduleId').equals(moduleId).toArray();
}

/**
 * Loads a module with all user progress applied.
 * This merges stored progress into the module's entries.
 *
 * @param moduleId - Module to load
 * @returns Promise resolving to module with progress, or undefined if not found
 */
export async function loadModuleWithProgress(
  moduleId: string
): Promise<VocabularyModule | undefined> {
  const db = getDatabase();

  const [storedModule, progressRecords] = await Promise.all([
    db.modules.get(moduleId),
    db.progress.where('moduleId').equals(moduleId).toArray(),
  ]);

  if (!storedModule) {
    return undefined;
  }

  // Create a map of progress by entryId
  const progressMap = new Map<string, UserProgress>();
  for (const record of progressRecords) {
    progressMap.set(record.entryId, record.progress);
  }

  // Merge progress into module entries
  const moduleWithProgress: VocabularyModule = {
    ...storedModule.data,
    entries: storedModule.data.entries.map((entry) => ({
      ...entry,
      progress: progressMap.get(entry.entryId),
    })),
  };

  return moduleWithProgress;
}

/**
 * Saves progress for multiple entries in a batch.
 * More efficient than calling saveProgress multiple times.
 *
 * @param progressRecords - Array of progress to save
 * @returns Promise resolving when batch is complete
 */
export async function batchSaveProgress(
  progressRecords: Array<{
    moduleId: string;
    entryId: string;
    progress: UserProgress;
  }>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const storedRecords: StoredProgress[] = progressRecords.map(({ moduleId, entryId, progress }) => ({
    id: `${moduleId}:${entryId}`,
    moduleId,
    entryId,
    progress,
    updatedAt: now,
  }));

  await db.progress.bulkPut(storedRecords);
}

// =============================================================================
// Session Operations
// =============================================================================

/**
 * Creates a new study session record.
 *
 * @param moduleId - Module being studied
 * @returns Promise resolving to the created session
 */
export async function createSession(moduleId: string): Promise<StoredSession> {
  const db = getDatabase();

  const session: StoredSession = {
    id: crypto.randomUUID(),
    moduleId,
    startTime: new Date().toISOString(),
    endTime: null,
    cardsReviewed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageResponseTime: 0,
    completed: false,
  };

  await db.sessions.add(session);
  return session;
}

/**
 * Updates an existing session.
 *
 * @param sessionId - Session to update
 * @param updates - Fields to update
 * @returns Promise resolving when update is complete
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<StoredSession, 'id'>>
): Promise<void> {
  const db = getDatabase();
  await db.sessions.update(sessionId, updates);
}

/**
 * Completes a study session.
 *
 * @param sessionId - Session to complete
 * @param stats - Final session statistics
 * @returns Promise resolving when session is completed
 */
export async function completeSession(
  sessionId: string,
  stats: {
    cardsReviewed: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageResponseTime: number;
  }
): Promise<void> {
  const db = getDatabase();

  await db.sessions.update(sessionId, {
    endTime: new Date().toISOString(),
    completed: true,
    ...stats,
  });
}

/**
 * Gets all sessions for a specific module.
 *
 * @param moduleId - Module identifier
 * @param limit - Maximum number of sessions to return (0 = all)
 * @returns Promise resolving to array of sessions
 */
export async function getModuleSessions(
  moduleId: string,
  limit: number = 0
): Promise<StoredSession[]> {
  const db = getDatabase();

  let query = db.sessions.where('moduleId').equals(moduleId).reverse();

  if (limit > 0) {
    query = query.limit(limit);
  }

  return await query.toArray();
}

/**
 * Gets the most recent session for a module.
 *
 * @param moduleId - Module identifier
 * @returns Promise resolving to the most recent session, or undefined
 */
export async function getLatestSession(
  moduleId: string
): Promise<StoredSession | undefined> {
  const sessions = await getModuleSessions(moduleId, 1);
  return sessions[0];
}

/**
 * Deletes old completed sessions to free up space.
 * Keeps the most recent N sessions.
 *
 * @param keepCount - Number of recent sessions to keep per module
 * @returns Promise resolving to number of sessions deleted
 */
export async function pruneOldSessions(keepCount: number = 50): Promise<number> {
  const db = getDatabase();

  // Get all modules
  const modules = await db.modules.toArray();
  let deletedCount = 0;

  for (const module of modules) {
    // Get sessions for this module, sorted by start time descending
    const sessions = await db.sessions
      .where('moduleId')
      .equals(module.id)
      .reverse()
      .toArray();

    // Delete sessions beyond keepCount
    if (sessions.length > keepCount) {
      const sessionsToDelete = sessions.slice(keepCount);
      const idsToDelete = sessionsToDelete.map((s) => s.id);
      await db.sessions.bulkDelete(idsToDelete);
      deletedCount += idsToDelete.length;
    }
  }

  return deletedCount;
}

// =============================================================================
// Export/Import Operations
// =============================================================================

/**
 * Exports all user data as JSON.
 * Useful for backups and transferring data between devices.
 *
 * @returns Promise resolving to serialized data
 */
export async function exportUserData(): Promise<string> {
  const db = getDatabase();

  const [modules, progress, sessions] = await Promise.all([
    db.modules.toArray(),
    db.progress.toArray(),
    db.sessions.toArray(),
  ]);

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    modules,
    progress,
    sessions,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Imports user data from JSON export.
 * This will merge with existing data, not replace it.
 *
 * @param jsonData - Exported data string
 * @returns Promise resolving when import is complete
 */
export async function importUserData(jsonData: string): Promise<void> {
  const db = getDatabase();

  try {
    const data = JSON.parse(jsonData);

    if (!data.version || !data.modules) {
      throw new Error('Invalid export data format');
    }

    await db.transaction('rw', [db.modules, db.progress, db.sessions], async () => {
      // Import modules
      if (data.modules?.length > 0) {
        await db.modules.bulkPut(data.modules);
      }

      // Import progress
      if (data.progress?.length > 0) {
        await db.progress.bulkPut(data.progress);
      }

      // Import sessions
      if (data.sessions?.length > 0) {
        await db.sessions.bulkPut(data.sessions);
      }
    });

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
