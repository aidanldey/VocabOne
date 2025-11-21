/**
 * Module export utilities for VocabOne.
 * Handles exporting modules to JSON with various options.
 */

import type { VocabularyModule, VocabularyEntry } from '../../models/types';

export interface ExportOptions {
  /** Whether to include user progress data */
  includeProgress: boolean;
  /** Whether to include user-added custom cards */
  includeCustomCards: boolean;
  /** Whether to include user notes */
  includeNotes: boolean;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Exports a module to JSON format with specified options.
 */
export function exportModuleToJSON(
  module: VocabularyModule,
  options: ExportOptions = {
    includeProgress: false,
    includeCustomCards: false,
    includeNotes: false,
  }
): string {
  // Transform module to export format
  const exportData: Record<string, unknown> = {
    schema_version: '1.0.0',
    module_metadata: {
      module_id: module.moduleId,
      title: module.title,
      version: module.version,
      language: module.language,
      ...(module.description && { description: module.description }),
      ...(module.author && { author: module.author }),
      ...(module.tags && { tags: module.tags }),
      ...(module.license && { license: module.license }),
      ...(module.createdAt && { created_date: module.createdAt }),
      ...(module.updatedAt && { updated_date: module.updatedAt }),
    },
    vocabulary_entries: module.entries.map((entry) => exportEntry(entry, options)),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports a vocabulary entry with specified options.
 */
function exportEntry(entry: VocabularyEntry, options: ExportOptions): Record<string, unknown> {
  const exportedEntry: Record<string, unknown> = {
    entry_id: entry.entryId,
    term: entry.term,
    ...(entry.pronunciation && { pronunciation: entry.pronunciation }),
    ...(entry.difficulty && { difficulty: entry.difficulty }),
    cards: entry.cards.map((card) => ({
      card_id: card.cardId,
      card_type: card.type,
      content: transformCardContent(card),
      ...(card.hint && { hint: card.hint }),
      ...(card.tags && { tags: card.tags }),
    })),
  };

  // Include user notes if requested
  if (options.includeNotes && entry.userNotes) {
    exportedEntry.user_notes = entry.userNotes;
  }

  // Include progress if requested
  if (options.includeProgress && entry.progress) {
    exportedEntry.progress = {
      interval: entry.progress.interval,
      ease_factor: entry.progress.easeFactor,
      repetitions: entry.progress.repetitions,
      last_review: entry.progress.lastReview,
      next_review: entry.progress.nextReview,
      total_reviews: entry.progress.totalReviews,
      correct_count: entry.progress.correctCount,
      incorrect_count: entry.progress.incorrectCount,
      streak: entry.progress.streak,
      mastered: entry.progress.mastered,
    };
  }

  return exportedEntry;
}

/**
 * Transforms card content from internal format to export format (snake_case).
 */
function transformCardContent(card: any): Record<string, unknown> {
  const content: Record<string, unknown> = {};

  // Convert camelCase to snake_case for export
  Object.keys(card).forEach((key) => {
    if (key === 'cardId' || key === 'type' || key === 'hint' || key === 'tags') {
      return; // Skip metadata fields
    }

    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    content[snakeKey] = card[key];
  });

  return content;
}

/**
 * Downloads a module as a JSON file to the user's device.
 */
export function downloadModuleAsJSON(
  module: VocabularyModule,
  options: ExportOptions = {
    includeProgress: false,
    includeCustomCards: false,
    includeNotes: false,
  }
): ExportResult {
  try {
    const json = exportModuleToJSON(module, options);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const progressSuffix = options.includeProgress ? '-with-progress' : '';
    const filename = `${module.moduleId}${progressSuffix}-${timestamp}.json`;

    // Create download link and trigger
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export module',
    };
  }
}

/**
 * Exports multiple modules as a single JSON file.
 */
export function exportMultipleModules(
  modules: VocabularyModule[],
  options: ExportOptions = {
    includeProgress: false,
    includeCustomCards: false,
    includeNotes: false,
  }
): ExportResult {
  try {
    const exportData = {
      schema_version: '1.0.0',
      export_date: new Date().toISOString(),
      module_count: modules.length,
      modules: modules.map((module) => JSON.parse(exportModuleToJSON(module, options))),
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `vocabone-modules-${timestamp}.json`;

    // Create download link and trigger
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export modules',
    };
  }
}

/**
 * Creates a shareable module (without progress or user data).
 */
export function createShareableModule(module: VocabularyModule): string {
  return exportModuleToJSON(module, {
    includeProgress: false,
    includeCustomCards: false,
    includeNotes: false,
  });
}
