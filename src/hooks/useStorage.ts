/**
 * Custom React hooks for storage operations.
 * Provides loading states, error handling, and optimistic updates.
 */

import { useState, useEffect, useCallback } from 'react';
import type { VocabularyModule, UserProgress } from '@/models/types';
import {
  getModuleRepository,
  ModuleRepositoryError,
  type StoredModule,
} from '@/services/storage/moduleRepository';
import {
  getProgressRepository,
  ProgressRepositoryError,
  type ProgressUpdate,
} from '@/services/storage/progressRepository';

/**
 * Hook state interface for async operations.
 */
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching a single module by ID.
 *
 * @param moduleId - Module identifier
 * @param includeProgress - Whether to include progress data
 * @returns Module data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function ModuleView({ moduleId }: { moduleId: string }) {
 *   const { data: module, loading, error, refetch } = useModule(moduleId, true);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!module) return <div>Module not found</div>;
 *
 *   return <div>{module.title}</div>;
 * }
 * ```
 */
export function useModule(moduleId: string, includeProgress = false) {
  const [state, setState] = useState<AsyncState<VocabularyModule>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchModule = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const repo = getModuleRepository();
      const module = await repo.findById(moduleId, includeProgress);

      setState({
        data: module,
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ModuleRepositoryError
          ? err.message
          : 'Failed to load module';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [moduleId, includeProgress]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  return {
    ...state,
    refetch: fetchModule,
  };
}

/**
 * Hook for fetching all modules.
 *
 * @param includeMetadata - Whether to include StoredModule metadata
 * @returns Modules data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function ModuleList() {
 *   const { data: modules, loading, error } = useModules();
 *
 *   if (loading) return <div>Loading modules...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <ul>
 *       {modules?.map(m => <li key={m.moduleId}>{m.title}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useModules(includeMetadata = false) {
  const [state, setState] = useState<
    AsyncState<VocabularyModule[] | StoredModule[]>
  >({
    data: null,
    loading: true,
    error: null,
  });

  const fetchModules = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const repo = getModuleRepository();
      const modules = await repo.findAll(includeMetadata);

      setState({
        data: modules,
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ModuleRepositoryError
          ? err.message
          : 'Failed to load modules';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [includeMetadata]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    ...state,
    refetch: fetchModules,
  };
}

/**
 * Hook for saving a module.
 *
 * @returns Save function, loading state, error state
 *
 * @example
 * ```tsx
 * function ModuleImport() {
 *   const { saveModule, loading, error } = useSaveModule();
 *
 *   const handleImport = async (module: VocabularyModule) => {
 *     await saveModule(module);
 *     // Success!
 *   };
 *
 *   return <button onClick={handleImport} disabled={loading}>Import</button>;
 * }
 * ```
 */
export function useSaveModule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveModule = useCallback(async (module: VocabularyModule) => {
    setLoading(true);
    setError(null);

    try {
      const repo = getModuleRepository();
      await repo.save(module);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ModuleRepositoryError
          ? err.message
          : 'Failed to save module';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveModule,
    loading,
    error,
  };
}

/**
 * Hook for deleting a module.
 *
 * @returns Delete function, loading state, error state
 *
 * @example
 * ```tsx
 * function ModuleActions({ moduleId }: { moduleId: string }) {
 *   const { deleteModule, loading } = useDeleteModule();
 *
 *   const handleDelete = async () => {
 *     const confirmed = window.confirm('Delete this module?');
 *     if (confirmed) {
 *       await deleteModule(moduleId);
 *     }
 *   };
 *
 *   return <button onClick={handleDelete} disabled={loading}>Delete</button>;
 * }
 * ```
 */
export function useDeleteModule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteModule = useCallback(async (moduleId: string) => {
    setLoading(true);
    setError(null);

    try {
      const repo = getModuleRepository();
      await repo.delete(moduleId);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ModuleRepositoryError
          ? err.message
          : 'Failed to delete module';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteModule,
    loading,
    error,
  };
}

/**
 * Hook for fetching module progress.
 *
 * @param moduleId - Module identifier
 * @returns Progress map, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function ProgressView({ moduleId }: { moduleId: string }) {
 *   const { data: progressMap, loading } = useProgress(moduleId);
 *
 *   if (loading) return <div>Loading progress...</div>;
 *
 *   return <div>{progressMap?.size} entries tracked</div>;
 * }
 * ```
 */
export function useProgress(moduleId: string) {
  const [state, setState] = useState<AsyncState<Map<string, UserProgress>>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProgress = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const repo = getProgressRepository();
      const progressMap = await repo.getModuleProgress(moduleId);

      setState({
        data: progressMap,
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ProgressRepositoryError
          ? err.message
          : 'Failed to load progress';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [moduleId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    ...state,
    refetch: fetchProgress,
  };
}

/**
 * Hook for saving progress with optimistic updates.
 *
 * @returns Save function, loading state, error state
 *
 * @example
 * ```tsx
 * function ReviewCard({ moduleId, entryId }: Props) {
 *   const { saveProgress, loading } = useSaveProgress();
 *
 *   const handleReview = async (quality: ReviewQuality) => {
 *     const newProgress = calculateNextReview(currentProgress, quality);
 *     await saveProgress(moduleId, entryId, newProgress);
 *   };
 *
 *   return <button onClick={handleReview} disabled={loading}>Submit</button>;
 * }
 * ```
 */
export function useSaveProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProgress = useCallback(
    async (moduleId: string, entryId: string, progress: UserProgress) => {
      setLoading(true);
      setError(null);

      try {
        const repo = getProgressRepository();
        await repo.saveProgress(moduleId, entryId, progress);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof ProgressRepositoryError
            ? err.message
            : 'Failed to save progress';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    saveProgress,
    loading,
    error,
  };
}

/**
 * Hook for bulk updating progress.
 *
 * @returns Bulk update function, loading state, error state
 *
 * @example
 * ```tsx
 * function SessionComplete({ updates }: { updates: ProgressUpdate[] }) {
 *   const { bulkUpdateProgress, loading } = useBulkUpdateProgress();
 *
 *   const handleComplete = async () => {
 *     await bulkUpdateProgress(updates);
 *     // Navigate to results
 *   };
 *
 *   return <button onClick={handleComplete} disabled={loading}>Finish</button>;
 * }
 * ```
 */
export function useBulkUpdateProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpdateProgress = useCallback(async (updates: ProgressUpdate[]) => {
    setLoading(true);
    setError(null);

    try {
      const repo = getProgressRepository();
      await repo.bulkUpdate(updates);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ProgressRepositoryError
          ? err.message
          : 'Failed to update progress';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bulkUpdateProgress,
    loading,
    error,
  };
}

/**
 * Hook for fetching progress statistics.
 *
 * @param moduleId - Module identifier
 * @returns Statistics, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function ModuleStats({ moduleId }: { moduleId: string }) {
 *   const { data: stats, loading } = useProgressStats(moduleId);
 *
 *   if (loading) return <div>Loading stats...</div>;
 *
 *   return (
 *     <div>
 *       <p>Total: {stats?.total}</p>
 *       <p>Mastered: {stats?.mastered}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProgressStats(moduleId: string) {
  const [state, setState] = useState<
    AsyncState<{
      total: number;
      mastered: number;
      learning: number;
      averageEaseFactor: number;
    }>
  >({
    data: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const repo = getProgressRepository();
      const stats = await repo.getProgressStats(moduleId);

      setState({
        data: stats,
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ProgressRepositoryError
          ? err.message
          : 'Failed to load statistics';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [moduleId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refetch: fetchStats,
  };
}

/**
 * Hook for resetting module progress.
 *
 * @returns Reset function, loading state, error state
 *
 * @example
 * ```tsx
 * function ResetButton({ moduleId }: { moduleId: string }) {
 *   const { resetProgress, loading } = useResetProgress();
 *
 *   const handleReset = async () => {
 *     const confirmed = window.confirm('Reset all progress?');
 *     if (confirmed) {
 *       await resetProgress(moduleId);
 *     }
 *   };
 *
 *   return <button onClick={handleReset} disabled={loading}>Reset</button>;
 * }
 * ```
 */
export function useResetProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetProgress = useCallback(async (moduleId: string) => {
    setLoading(true);
    setError(null);

    try {
      const repo = getProgressRepository();
      await repo.resetProgress(moduleId);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ProgressRepositoryError
          ? err.message
          : 'Failed to reset progress';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    resetProgress,
    loading,
    error,
  };
}

/**
 * Hook for searching modules.
 *
 * @param query - Search query string
 * @returns Matching modules, loading state, error state
 *
 * @example
 * ```tsx
 * function ModuleSearch() {
 *   const [query, setQuery] = useState('');
 *   const { data: results, loading } = useModuleSearch(query);
 *
 *   return (
 *     <>
 *       <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       {loading ? <div>Searching...</div> : results?.map(...)}
 *     </>
 *   );
 * }
 * ```
 */
export function useModuleSearch(query: string) {
  const [state, setState] = useState<AsyncState<VocabularyModule[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchModules = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const repo = getModuleRepository();
      const results = await repo.search(searchQuery);

      setState({
        data: results,
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ModuleRepositoryError
          ? err.message
          : 'Failed to search modules';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  useEffect(() => {
    searchModules(query);
  }, [query, searchModules]);

  return state;
}
