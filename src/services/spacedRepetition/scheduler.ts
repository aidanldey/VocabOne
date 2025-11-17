/**
 * Review scheduler for managing study sessions and card prioritization.
 * Determines which cards are due for review and builds optimized study sessions.
 */

import {
  type VocabularyModule,
  type VocabularyEntry,
  type UserProgress,
} from '@/models/types';
import { isCardDue, getDaysUntilReview } from './sm2Algorithm';

/**
 * Settings for building a study session.
 */
export interface SessionSettings {
  /** Maximum number of new cards to introduce in this session */
  maxNew: number;
  /** Maximum number of review cards to study in this session */
  maxReview: number;
  /** Whether to randomize the order of cards */
  randomize: boolean;
  /** Whether to prioritize overdue cards */
  prioritizeOverdue?: boolean;
  /** Whether to mix new and review cards or separate them */
  mixCards?: boolean;
}

/**
 * A study session containing cards to review.
 */
export interface StudySession {
  /** Cards to study in this session */
  cards: VocabularyEntry[];
  /** Number of new cards in the session */
  newCount: number;
  /** Number of review cards in the session */
  reviewCount: number;
  /** Session metadata */
  metadata: {
    moduleId: string;
    createdAt: string;
    settings: SessionSettings;
  };
}

/**
 * Statistics about a vocabulary module's learning progress.
 */
export interface ModuleStatistics {
  /** Total number of vocabulary entries */
  totalEntries: number;
  /** Number of new entries (never studied) */
  newEntries: number;
  /** Number of entries currently being learned */
  learningEntries: number;
  /** Number of mastered entries */
  masteredEntries: number;
  /** Number of entries due for review today */
  dueToday: number;
  /** Number of overdue entries */
  overdue: number;
  /** Average ease factor across all entries with progress */
  averageEaseFactor: number;
  /** Total reviews completed across all entries */
  totalReviews: number;
  /** Overall accuracy percentage */
  accuracy: number;
}

/**
 * Priority level for sorting cards.
 */
export enum CardPriority {
  OVERDUE = 0,
  DUE_TODAY = 1,
  NEW = 2,
  FUTURE = 3,
}

/**
 * Gets all cards that are due for review today.
 * Includes both overdue cards and cards scheduled for today.
 *
 * @param module - The vocabulary module to check
 * @returns Array of entries that need review today
 *
 * @example
 * ```typescript
 * const dueCards = getDueCards(spanishModule);
 * console.log(`${dueCards.length} cards need review today`);
 * ```
 */
export function getDueCards(module: VocabularyModule): VocabularyEntry[] {
  return module.entries.filter((entry) => {
    // Entries without progress are not due (they're new)
    if (!entry.progress) {
      return false;
    }
    return isCardDue(entry.progress);
  });
}

/**
 * Gets cards that have never been studied (new cards).
 *
 * @param module - The vocabulary module
 * @param limit - Maximum number of new cards to return (0 = all)
 * @returns Array of new entries, up to the limit
 *
 * @example
 * ```typescript
 * const newCards = getNewCards(module, 10);
 * console.log(`Introducing ${newCards.length} new cards`);
 * ```
 */
export function getNewCards(
  module: VocabularyModule,
  limit: number = 0
): VocabularyEntry[] {
  const newEntries = module.entries.filter((entry) => !entry.progress);

  if (limit > 0) {
    return newEntries.slice(0, limit);
  }
  return newEntries;
}

/**
 * Determines the priority of a card for review scheduling.
 *
 * @param entry - The vocabulary entry to prioritize
 * @returns Priority level
 */
function getCardPriority(entry: VocabularyEntry): CardPriority {
  if (!entry.progress) {
    return CardPriority.NEW;
  }

  const daysUntil = getDaysUntilReview(entry.progress);

  if (daysUntil < 0) {
    return CardPriority.OVERDUE;
  } else if (daysUntil === 0) {
    return CardPriority.DUE_TODAY;
  } else {
    return CardPriority.FUTURE;
  }
}

/**
 * Sorts vocabulary entries by review priority.
 *
 * Priority order:
 * 1. Overdue cards (most overdue first)
 * 2. Cards due today (longest interval first - harder cards)
 * 3. New cards
 * 4. Future cards
 *
 * @param entries - Entries to sort
 * @returns Sorted array (does not modify original)
 *
 * @example
 * ```typescript
 * const prioritized = sortByPriority(dueCards);
 * // Start with most urgent cards first
 * ```
 */
export function sortByPriority(entries: VocabularyEntry[]): VocabularyEntry[] {
  return [...entries].sort((a, b) => {
    const priorityA = getCardPriority(a);
    const priorityB = getCardPriority(b);

    // Sort by priority level first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority, apply secondary sorting
    if (priorityA === CardPriority.OVERDUE) {
      // Most overdue first
      const daysA = getDaysUntilReview(a.progress!);
      const daysB = getDaysUntilReview(b.progress!);
      return daysA - daysB; // More negative = more overdue = higher priority
    }

    if (priorityA === CardPriority.DUE_TODAY) {
      // Longer interval first (harder/older cards)
      const intervalA = a.progress?.interval ?? 0;
      const intervalB = b.progress?.interval ?? 0;
      return intervalB - intervalA;
    }

    if (priorityA === CardPriority.NEW) {
      // Maintain order for new cards (could be randomized later)
      return 0;
    }

    return 0;
  });
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 *
 * @param array - Array to shuffle
 * @returns New shuffled array (does not modify original)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Builds a study session with a mix of new and review cards.
 *
 * @param module - The vocabulary module to study
 * @param settings - Session configuration
 * @returns A study session with selected cards
 *
 * @example
 * ```typescript
 * const session = buildSession(module, {
 *   maxNew: 10,
 *   maxReview: 20,
 *   randomize: true,
 *   prioritizeOverdue: true,
 *   mixCards: true
 * });
 *
 * console.log(`Session: ${session.newCount} new, ${session.reviewCount} review`);
 * ```
 */
export function buildSession(
  module: VocabularyModule,
  settings: SessionSettings
): StudySession {
  // Get due cards and new cards
  let dueCards = getDueCards(module);
  const newCards = getNewCards(module);

  // Prioritize overdue cards if requested
  if (settings.prioritizeOverdue) {
    dueCards = sortByPriority(dueCards);
  } else if (settings.randomize) {
    dueCards = shuffleArray(dueCards);
  }

  // Limit the number of cards
  const selectedReview = dueCards.slice(0, settings.maxReview);
  let selectedNew = newCards.slice(0, settings.maxNew);

  // Randomize new cards if requested
  if (settings.randomize) {
    selectedNew = shuffleArray(selectedNew);
  }

  // Combine cards
  let sessionCards: VocabularyEntry[];
  if (settings.mixCards) {
    // Interleave new and review cards
    sessionCards = interleaveCards(selectedNew, selectedReview);
  } else {
    // Review cards first, then new cards
    sessionCards = [...selectedReview, ...selectedNew];
  }

  // Final randomization if requested and not already done
  if (settings.randomize && settings.mixCards) {
    sessionCards = shuffleArray(sessionCards);
  }

  return {
    cards: sessionCards,
    newCount: selectedNew.length,
    reviewCount: selectedReview.length,
    metadata: {
      moduleId: module.moduleId,
      createdAt: new Date().toISOString(),
      settings,
    },
  };
}

/**
 * Interleaves two arrays, alternating elements from each.
 * Useful for mixing new and review cards evenly.
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Combined array with interleaved elements
 */
function interleaveCards<T>(arr1: T[], arr2: T[]): T[] {
  const result: T[] = [];
  const maxLength = Math.max(arr1.length, arr2.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < arr1.length) result.push(arr1[i]);
    if (i < arr2.length) result.push(arr2[i]);
  }

  return result;
}

/**
 * Calculates comprehensive statistics for a vocabulary module.
 *
 * @param module - The vocabulary module to analyze
 * @returns Statistics object with counts and percentages
 *
 * @example
 * ```typescript
 * const stats = getModuleStats(module);
 * console.log(`Progress: ${stats.masteredEntries}/${stats.totalEntries} mastered`);
 * console.log(`Accuracy: ${stats.accuracy.toFixed(1)}%`);
 * ```
 */
export function getModuleStats(module: VocabularyModule): ModuleStatistics {
  const totalEntries = module.entries.length;
  let newEntries = 0;
  let learningEntries = 0;
  let masteredEntries = 0;
  let dueToday = 0;
  let overdue = 0;
  let totalEaseFactor = 0;
  let entriesWithProgress = 0;
  let totalReviews = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  for (const entry of module.entries) {
    if (!entry.progress) {
      newEntries++;
      continue;
    }

    entriesWithProgress++;
    totalEaseFactor += entry.progress.easeFactor;
    totalReviews += entry.progress.totalReviews;
    totalCorrect += entry.progress.correctCount;
    totalIncorrect += entry.progress.incorrectCount;

    // Categorize by learning status
    if (entry.progress.mastered) {
      masteredEntries++;
    } else {
      learningEntries++;
    }

    // Check if due
    const daysUntil = getDaysUntilReview(entry.progress);
    if (daysUntil < 0) {
      overdue++;
      dueToday++; // Overdue cards are also due today
    } else if (daysUntil === 0) {
      dueToday++;
    }
  }

  const averageEaseFactor =
    entriesWithProgress > 0 ? totalEaseFactor / entriesWithProgress : 0;

  const totalAttempts = totalCorrect + totalIncorrect;
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  return {
    totalEntries,
    newEntries,
    learningEntries,
    masteredEntries,
    dueToday,
    overdue,
    averageEaseFactor,
    totalReviews,
    accuracy,
  };
}

/**
 * Gets a breakdown of entries by their learning phase.
 *
 * @param module - The vocabulary module
 * @returns Object with arrays of entries in each phase
 */
export function getEntriesByPhase(module: VocabularyModule): {
  new: VocabularyEntry[];
  learning: VocabularyEntry[];
  mastered: VocabularyEntry[];
} {
  const result = {
    new: [] as VocabularyEntry[],
    learning: [] as VocabularyEntry[],
    mastered: [] as VocabularyEntry[],
  };

  for (const entry of module.entries) {
    if (!entry.progress) {
      result.new.push(entry);
    } else if (entry.progress.mastered) {
      result.mastered.push(entry);
    } else {
      result.learning.push(entry);
    }
  }

  return result;
}

/**
 * Default session settings for a balanced study session.
 */
export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  maxNew: 10,
  maxReview: 20,
  randomize: true,
  prioritizeOverdue: true,
  mixCards: true,
};

/**
 * Calculates the forecasted review load for upcoming days.
 *
 * @param module - The vocabulary module
 * @param days - Number of days to forecast (default 7)
 * @returns Array of review counts for each day
 */
export function getForecast(module: VocabularyModule, days: number = 7): number[] {
  const forecast: number[] = new Array(days).fill(0);

  for (const entry of module.entries) {
    if (!entry.progress) continue;

    const daysUntil = getDaysUntilReview(entry.progress);

    // If within forecast range and not overdue
    if (daysUntil >= 0 && daysUntil < days) {
      forecast[daysUntil]++;
    }
  }

  return forecast;
}
