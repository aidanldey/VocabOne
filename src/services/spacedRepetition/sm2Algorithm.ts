/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * The SM-2 algorithm was developed by Piotr Wozniak for SuperMemo in 1987.
 * It's one of the most well-known and proven spaced repetition algorithms.
 *
 * ## Core Concepts:
 *
 * 1. **Ease Factor (EF)**: A multiplier that determines how much the interval grows.
 *    - Starts at 2.5
 *    - Minimum 1.3 (to prevent intervals from shrinking too quickly)
 *    - Adjusted based on review quality
 *
 * 2. **Interval**: Number of days until the next review.
 *    - First success: 1 day
 *    - Second success: 6 days
 *    - Subsequent successes: previous interval * ease factor
 *
 * 3. **Quality Rating**: User's assessment of recall difficulty (0-5)
 *    - 0: Complete blackout (AGAIN)
 *    - 1: Wrong, but recognized after seeing answer
 *    - 2: Wrong, but easy to recall (HARD)
 *    - 3: Correct with difficulty (GOOD)
 *    - 4: Correct with hesitation
 *    - 5: Perfect recall (EASY)
 *
 * ## Algorithm Flow:
 *
 * 1. If quality < 3 (incorrect answer):
 *    - Reset repetitions to 0
 *    - Set interval to 1 day
 *    - Decrease ease factor slightly
 *
 * 2. If quality >= 3 (correct answer):
 *    - Increment repetitions
 *    - Calculate new interval based on repetition count
 *    - Adjust ease factor based on quality
 *
 * ## Ease Factor Formula:
 * ```
 * EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
 * ```
 *
 * This formula:
 * - Increases EF for quality = 5 (by 0.1)
 * - Keeps EF roughly the same for quality = 4
 * - Decreases EF for quality = 3 (by about 0.14)
 *
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import { type UserProgress, ReviewQuality } from '@/models/types';
import { addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';

/**
 * Minimum allowed ease factor.
 * Prevents the ease factor from dropping too low, which would cause
 * intervals to grow too slowly and overwhelm the learner.
 */
export const MIN_EASE_FACTOR = 1.3;

/**
 * Default ease factor for new cards.
 * This is the standard starting point in the SM-2 algorithm.
 */
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Default interval in days for the first successful review.
 */
export const FIRST_INTERVAL = 1;

/**
 * Default interval in days for the second successful review.
 */
export const SECOND_INTERVAL = 6;

/**
 * Number of consecutive correct reviews required for mastery.
 * Once a card reaches this interval, it's considered "mastered".
 */
export const MASTERY_THRESHOLD_DAYS = 21;

/**
 * Creates initial progress state for a new vocabulary entry.
 *
 * @returns A fresh UserProgress object with default values
 *
 * @example
 * ```typescript
 * const newEntry = {
 *   entryId: 'word-001',
 *   term: 'hello',
 *   cards: [...],
 *   progress: getInitialProgress()
 * };
 * ```
 */
export function getInitialProgress(): UserProgress {
  const now = new Date().toISOString();

  return {
    interval: FIRST_INTERVAL,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    lastReview: null,
    nextReview: now, // Due immediately
    totalReviews: 0,
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    mastered: false,
  };
}

/**
 * Calculates the updated progress after a review using the SM-2 algorithm.
 *
 * This is the core function that implements the spaced repetition logic.
 *
 * @param current - The current progress state before the review
 * @param quality - The quality rating of the user's response
 * @returns Updated progress state with new interval and next review date
 *
 * @example
 * ```typescript
 * const currentProgress = getInitialProgress();
 * const updatedProgress = calculateNextReview(currentProgress, ReviewQuality.GOOD);
 * console.log(updatedProgress.interval); // 1 (first success)
 * console.log(updatedProgress.repetitions); // 1
 * ```
 */
export function calculateNextReview(
  current: UserProgress,
  quality: ReviewQuality
): UserProgress {
  const now = new Date();
  const nowISO = now.toISOString();

  // Copy current state
  let newInterval = current.interval;
  let newEaseFactor = current.easeFactor;
  let newRepetitions = current.repetitions;
  let newStreak = current.streak;
  let newCorrectCount = current.correctCount;
  let newIncorrectCount = current.incorrectCount;

  // Quality < 3 means incorrect answer
  if (quality < ReviewQuality.GOOD) {
    // Reset progress - card goes back to learning phase
    newInterval = FIRST_INTERVAL;
    newRepetitions = 0;
    newStreak = 0;
    newIncorrectCount++;

    // Decrease ease factor on failure (minimum 1.3)
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.2);
  } else {
    // Correct answer - advance through the algorithm
    newCorrectCount++;
    newStreak++;

    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    const qualityDelta = 5 - quality;
    const easeAdjustment = 0.1 - qualityDelta * (0.08 + qualityDelta * 0.02);
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor + easeAdjustment);

    // Calculate new interval based on repetition count
    if (newRepetitions === 0) {
      // First successful review
      newInterval = FIRST_INTERVAL;
    } else if (newRepetitions === 1) {
      // Second successful review
      newInterval = SECOND_INTERVAL;
    } else {
      // Subsequent reviews - multiply by ease factor
      newInterval = Math.round(current.interval * newEaseFactor);
    }

    newRepetitions++;
  }

  // Calculate next review date
  const nextReviewDate = addDays(startOfDay(now), newInterval);

  // Check if mastered (interval >= 21 days indicates strong retention)
  const isMastered = newInterval >= MASTERY_THRESHOLD_DAYS;

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    lastReview: nowISO,
    nextReview: nextReviewDate.toISOString(),
    totalReviews: current.totalReviews + 1,
    correctCount: newCorrectCount,
    incorrectCount: newIncorrectCount,
    streak: newStreak,
    mastered: isMastered,
  };
}

/**
 * Calculates the number of days until the next review is due.
 *
 * @param progress - The user's current progress
 * @returns Number of days until review (negative if overdue, 0 if due today)
 *
 * @example
 * ```typescript
 * const daysLeft = getDaysUntilReview(progress);
 * if (daysLeft <= 0) {
 *   console.log('Review is due!');
 * } else {
 *   console.log(`Next review in ${daysLeft} days`);
 * }
 * ```
 */
export function getDaysUntilReview(progress: UserProgress): number {
  const now = startOfDay(new Date());
  const nextReview = startOfDay(parseISO(progress.nextReview));
  return differenceInDays(nextReview, now);
}

/**
 * Checks if a card is due for review.
 *
 * A card is due if:
 * - It has never been reviewed (new card), OR
 * - The current date is on or after the next review date
 *
 * @param progress - The user's current progress
 * @returns true if the card should be reviewed today
 *
 * @example
 * ```typescript
 * const dueCards = entries.filter(entry => isCardDue(entry.progress));
 * console.log(`${dueCards.length} cards due for review`);
 * ```
 */
export function isCardDue(progress: UserProgress): boolean {
  return getDaysUntilReview(progress) <= 0;
}

/**
 * Gets all entries that are due for review from a list.
 *
 * @param entries - Array of vocabulary entries with progress
 * @returns Entries that are due for review today
 */
export function getDueEntries<T extends { progress?: UserProgress }>(
  entries: T[]
): T[] {
  return entries.filter((entry) => {
    if (!entry.progress) {
      // No progress means it's a new entry, due immediately
      return true;
    }
    return isCardDue(entry.progress);
  });
}

/**
 * Calculates statistics about the review quality distribution.
 *
 * @param quality - The review quality
 * @returns Object containing adjustment details
 */
export function calculateEaseAdjustment(quality: ReviewQuality): {
  qualityDelta: number;
  adjustment: number;
  description: string;
} {
  const qualityDelta = 5 - quality;
  const adjustment = 0.1 - qualityDelta * (0.08 + qualityDelta * 0.02);

  let description: string;
  if (adjustment > 0) {
    description = 'Ease factor will increase';
  } else if (adjustment < 0) {
    description = 'Ease factor will decrease';
  } else {
    description = 'Ease factor will stay the same';
  }

  return { qualityDelta, adjustment, description };
}

/**
 * Simulates the progression of intervals over multiple successful reviews.
 * Useful for testing and demonstrating the algorithm behavior.
 *
 * @param numberOfReviews - How many successful reviews to simulate
 * @param initialEase - Starting ease factor (default 2.5)
 * @param qualityPerReview - Quality rating for each review (default GOOD)
 * @returns Array of intervals after each review
 *
 * @example
 * ```typescript
 * const intervals = simulateIntervalProgression(10);
 * // [1, 6, 15, 38, 95, 238, ...]
 * ```
 */
export function simulateIntervalProgression(
  numberOfReviews: number,
  initialEase: number = DEFAULT_EASE_FACTOR,
  qualityPerReview: ReviewQuality = ReviewQuality.GOOD
): number[] {
  const intervals: number[] = [];
  let progress = getInitialProgress();
  progress.easeFactor = initialEase;

  for (let i = 0; i < numberOfReviews; i++) {
    progress = calculateNextReview(progress, qualityPerReview);
    intervals.push(progress.interval);
  }

  return intervals;
}

/**
 * Estimates the total days to mastery given consistent performance.
 *
 * @param quality - Expected quality rating
 * @param initialEase - Starting ease factor
 * @returns Estimated number of reviews to reach mastery threshold
 */
export function estimateReviewsToMastery(
  quality: ReviewQuality = ReviewQuality.GOOD,
  initialEase: number = DEFAULT_EASE_FACTOR
): number {
  let progress = getInitialProgress();
  progress.easeFactor = initialEase;
  let reviews = 0;

  while (progress.interval < MASTERY_THRESHOLD_DAYS && reviews < 100) {
    progress = calculateNextReview(progress, quality);
    reviews++;
  }

  return reviews;
}
