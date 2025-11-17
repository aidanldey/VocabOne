import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calculateNextReview,
  getInitialProgress,
  getDaysUntilReview,
  isCardDue,
  getDueEntries,
  calculateEaseAdjustment,
  simulateIntervalProgression,
  estimateReviewsToMastery,
  MIN_EASE_FACTOR,
  DEFAULT_EASE_FACTOR,
  FIRST_INTERVAL,
  SECOND_INTERVAL,
  MASTERY_THRESHOLD_DAYS,
} from './sm2Algorithm';
import { ReviewQuality, type UserProgress } from '@/models/types';
import { addDays, subDays } from 'date-fns';

describe('SM-2 Spaced Repetition Algorithm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getInitialProgress', () => {
    it('should create progress with default values', () => {
      const progress = getInitialProgress();

      expect(progress.interval).toBe(FIRST_INTERVAL);
      expect(progress.easeFactor).toBe(DEFAULT_EASE_FACTOR);
      expect(progress.repetitions).toBe(0);
      expect(progress.lastReview).toBeNull();
      expect(progress.totalReviews).toBe(0);
      expect(progress.correctCount).toBe(0);
      expect(progress.incorrectCount).toBe(0);
      expect(progress.streak).toBe(0);
      expect(progress.mastered).toBe(false);
    });

    it('should set next review to current time (due immediately)', () => {
      const progress = getInitialProgress();
      expect(new Date(progress.nextReview)).toEqual(new Date('2025-01-15T10:00:00Z'));
    });
  });

  describe('calculateNextReview - Successful Reviews', () => {
    let initialProgress: UserProgress;

    beforeEach(() => {
      initialProgress = getInitialProgress();
    });

    it('should set interval to 1 day on first success', () => {
      const result = calculateNextReview(initialProgress, ReviewQuality.GOOD);
      expect(result.interval).toBe(FIRST_INTERVAL);
      expect(result.repetitions).toBe(1);
    });

    it('should set interval to 6 days on second success', () => {
      let progress = calculateNextReview(initialProgress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);

      expect(progress.interval).toBe(SECOND_INTERVAL);
      expect(progress.repetitions).toBe(2);
    });

    it('should multiply interval by ease factor on third success', () => {
      let progress = calculateNextReview(initialProgress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);

      // Third success: 6 * (updated easeFactor)
      // The ease factor is updated FIRST, then used for interval calculation
      const easeAfterUpdate = Math.max(
        MIN_EASE_FACTOR,
        progress.easeFactor + (0.1 - 2 * (0.08 + 2 * 0.02))
      );
      const expectedInterval = Math.round(SECOND_INTERVAL * easeAfterUpdate);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);

      expect(progress.interval).toBe(expectedInterval);
      expect(progress.repetitions).toBe(3);
    });

    it('should increment streak on success', () => {
      let progress = initialProgress;

      for (let i = 0; i < 5; i++) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
        expect(progress.streak).toBe(i + 1);
      }
    });

    it('should increment correct count', () => {
      let progress = initialProgress;

      for (let i = 0; i < 3; i++) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
        expect(progress.correctCount).toBe(i + 1);
      }
    });

    it('should update lastReview timestamp', () => {
      const result = calculateNextReview(initialProgress, ReviewQuality.GOOD);
      expect(new Date(result.lastReview!)).toEqual(new Date('2025-01-15T10:00:00Z'));
    });

    it('should calculate nextReview based on interval', () => {
      const result = calculateNextReview(initialProgress, ReviewQuality.GOOD);
      const expectedDate = addDays(new Date('2025-01-15'), 1);
      expect(new Date(result.nextReview).toDateString()).toBe(expectedDate.toDateString());
    });

    it('should increment total reviews', () => {
      let progress = initialProgress;
      for (let i = 0; i < 5; i++) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
        expect(progress.totalReviews).toBe(i + 1);
      }
    });
  });

  describe('calculateNextReview - Failed Reviews', () => {
    it('should reset interval to 1 on failure', () => {
      let progress = getInitialProgress();

      // Build up some progress
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.interval).toBeGreaterThan(1);

      // Fail the review
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.interval).toBe(FIRST_INTERVAL);
    });

    it('should reset repetitions to 0 on failure', () => {
      let progress = getInitialProgress();

      // Build up repetitions
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.repetitions).toBe(2);

      // Fail
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.repetitions).toBe(0);
    });

    it('should reset streak to 0 on failure', () => {
      let progress = getInitialProgress();

      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.streak).toBe(3);

      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.streak).toBe(0);
    });

    it('should increment incorrect count on failure', () => {
      let progress = getInitialProgress();

      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.incorrectCount).toBe(1);
      expect(progress.correctCount).toBe(0);

      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.incorrectCount).toBe(2);
    });

    it('should decrease ease factor on failure', () => {
      let progress = getInitialProgress();
      const initialEase = progress.easeFactor;

      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.easeFactor).toBeLessThan(initialEase);
      expect(progress.easeFactor).toBeCloseTo(initialEase - 0.2, 2);
    });

    it('should not decrease ease factor below minimum', () => {
      let progress = getInitialProgress();
      progress.easeFactor = MIN_EASE_FACTOR + 0.1;

      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR);
    });

    it('should treat quality < 3 as failure', () => {
      const qualities = [ReviewQuality.AGAIN, ReviewQuality.HARD];

      for (const quality of qualities) {
        let progress = getInitialProgress();
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
        progress = calculateNextReview(progress, ReviewQuality.GOOD);

        const beforeReset = progress.repetitions;
        progress = calculateNextReview(progress, quality);

        expect(progress.repetitions).toBe(0);
        expect(beforeReset).toBeGreaterThan(0);
      }
    });
  });

  describe('Ease Factor Adjustments', () => {
    it('should increase ease factor for quality = EASY (5)', () => {
      let progress = getInitialProgress();
      const initialEase = progress.easeFactor;

      progress = calculateNextReview(progress, ReviewQuality.EASY);
      expect(progress.easeFactor).toBeGreaterThan(initialEase);
      expect(progress.easeFactor).toBeCloseTo(initialEase + 0.1, 2);
    });

    it('should decrease ease factor for quality = GOOD (3)', () => {
      let progress = getInitialProgress();
      const initialEase = progress.easeFactor;

      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.easeFactor).toBeLessThan(initialEase);
      // Formula: 0.1 - 2 * (0.08 + 2 * 0.02) = 0.1 - 2 * 0.12 = -0.14
      expect(progress.easeFactor).toBeCloseTo(initialEase - 0.14, 2);
    });

    it('should keep ease factor stable for quality = 4', () => {
      // Quality 4 is not in our enum, but let's test the formula
      // 0.1 - 1 * (0.08 + 1 * 0.02) = 0.1 - 0.10 = 0
      const adjustment = 0.1 - 1 * (0.08 + 1 * 0.02);
      expect(adjustment).toBeCloseTo(0, 2);
    });

    it('should respect minimum ease factor', () => {
      let progress = getInitialProgress();
      progress.easeFactor = MIN_EASE_FACTOR;

      // Even with GOOD quality (which decreases ease), should not go below minimum
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.easeFactor).toBe(MIN_EASE_FACTOR);
    });

    it('should accumulate ease adjustments over time', () => {
      let progress = getInitialProgress();

      // Multiple EASY reviews should increase ease
      for (let i = 0; i < 3; i++) {
        progress = calculateNextReview(progress, ReviewQuality.EASY);
      }

      expect(progress.easeFactor).toBeGreaterThan(DEFAULT_EASE_FACTOR + 0.25);
    });
  });

  describe('Interval Progression', () => {
    it('should follow expected progression for consistent GOOD quality', () => {
      const intervals = simulateIntervalProgression(5, DEFAULT_EASE_FACTOR, ReviewQuality.GOOD);

      expect(intervals[0]).toBe(1); // First success
      expect(intervals[1]).toBe(6); // Second success
      expect(intervals[2]).toBeGreaterThan(10); // Third: 6 * ease
      expect(intervals[3]).toBeGreaterThan(intervals[2]); // Fourth grows
      expect(intervals[4]).toBeGreaterThan(intervals[3]); // Fifth grows
    });

    it('should grow faster with EASY quality', () => {
      const goodIntervals = simulateIntervalProgression(5, DEFAULT_EASE_FACTOR, ReviewQuality.GOOD);
      const easyIntervals = simulateIntervalProgression(5, DEFAULT_EASE_FACTOR, ReviewQuality.EASY);

      // After first two reviews, EASY should have larger intervals
      expect(easyIntervals[2]).toBeGreaterThan(goodIntervals[2]);
      expect(easyIntervals[3]).toBeGreaterThan(goodIntervals[3]);
      expect(easyIntervals[4]).toBeGreaterThan(goodIntervals[4]);
    });

    it('should simulate 10 reviews correctly', () => {
      const intervals = simulateIntervalProgression(10);

      expect(intervals).toHaveLength(10);
      expect(intervals[0]).toBe(1);
      expect(intervals[1]).toBe(6);

      // Each subsequent interval should be larger than the previous
      for (let i = 2; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
      }

      // Should reach long intervals
      expect(intervals[9]).toBeGreaterThan(100);
    });

    it('should reach mastery threshold within reasonable reviews', () => {
      let progress = getInitialProgress();
      let reviews = 0;

      while (progress.interval < MASTERY_THRESHOLD_DAYS && reviews < 20) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
        reviews++;
      }

      // Should reach 21+ day interval within 10 reviews
      expect(reviews).toBeLessThanOrEqual(10);
      expect(progress.mastered).toBe(true);
    });
  });

  describe('Mastery Status', () => {
    it('should mark as mastered when interval >= 21 days', () => {
      let progress = getInitialProgress();

      // Build up to mastery
      for (let i = 0; i < 10; i++) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
        if (progress.interval >= MASTERY_THRESHOLD_DAYS) {
          break;
        }
      }

      expect(progress.mastered).toBe(true);
      expect(progress.interval).toBeGreaterThanOrEqual(MASTERY_THRESHOLD_DAYS);
    });

    it('should not mark as mastered before threshold', () => {
      let progress = getInitialProgress();

      // First few reviews
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.mastered).toBe(false);

      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.mastered).toBe(false);
    });

    it('should lose mastery status on failure', () => {
      let progress = getInitialProgress();

      // Achieve mastery
      for (let i = 0; i < 10; i++) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
      }
      expect(progress.mastered).toBe(true);

      // Fail a review
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.mastered).toBe(false);
      expect(progress.interval).toBe(1);
    });
  });

  describe('getDaysUntilReview', () => {
    it('should return 0 when due today', () => {
      const progress = getInitialProgress();
      expect(getDaysUntilReview(progress)).toBe(0);
    });

    it('should return negative when overdue', () => {
      const progress = getInitialProgress();
      progress.nextReview = subDays(new Date(), 2).toISOString();

      expect(getDaysUntilReview(progress)).toBe(-2);
    });

    it('should return positive when not yet due', () => {
      const progress = getInitialProgress();
      progress.nextReview = addDays(new Date(), 5).toISOString();

      expect(getDaysUntilReview(progress)).toBe(5);
    });

    it('should handle same day correctly', () => {
      const progress = getInitialProgress();
      // Set to start of today
      progress.nextReview = new Date('2025-01-15T00:00:00Z').toISOString();

      expect(getDaysUntilReview(progress)).toBe(0);
    });
  });

  describe('isCardDue', () => {
    it('should return true for new cards', () => {
      const progress = getInitialProgress();
      expect(isCardDue(progress)).toBe(true);
    });

    it('should return true for overdue cards', () => {
      const progress = getInitialProgress();
      progress.nextReview = subDays(new Date(), 3).toISOString();

      expect(isCardDue(progress)).toBe(true);
    });

    it('should return false for future reviews', () => {
      const progress = getInitialProgress();
      progress.nextReview = addDays(new Date(), 5).toISOString();

      expect(isCardDue(progress)).toBe(false);
    });

    it('should return true for cards due today', () => {
      const progress = getInitialProgress();
      progress.nextReview = new Date('2025-01-15T00:00:00Z').toISOString();

      expect(isCardDue(progress)).toBe(true);
    });
  });

  describe('getDueEntries', () => {
    it('should return entries without progress (new entries)', () => {
      const entries = [
        { entryId: 'new-001', term: 'hello' },
        { entryId: 'new-002', term: 'world' },
      ];

      const due = getDueEntries(entries);
      expect(due).toHaveLength(2);
    });

    it('should filter out entries not yet due', () => {
      const dueProgress = getInitialProgress();
      const futureProgress = getInitialProgress();
      futureProgress.nextReview = addDays(new Date(), 5).toISOString();

      const entries = [
        { entryId: 'due-001', progress: dueProgress },
        { entryId: 'future-001', progress: futureProgress },
      ];

      const due = getDueEntries(entries);
      expect(due).toHaveLength(1);
      expect(due[0].entryId).toBe('due-001');
    });

    it('should include overdue entries', () => {
      const overdueProgress = getInitialProgress();
      overdueProgress.nextReview = subDays(new Date(), 3).toISOString();

      const entries = [{ entryId: 'overdue-001', progress: overdueProgress }];

      const due = getDueEntries(entries);
      expect(due).toHaveLength(1);
    });

    it('should handle mixed entries correctly', () => {
      const entries = [
        { entryId: 'new-001' }, // No progress - due
        {
          entryId: 'due-001',
          progress: getInitialProgress(), // Due today
        },
        {
          entryId: 'future-001',
          progress: {
            ...getInitialProgress(),
            nextReview: addDays(new Date(), 10).toISOString(),
          }, // Not due
        },
      ];

      const due = getDueEntries(entries);
      expect(due).toHaveLength(2);
      expect(due.map((e) => e.entryId)).toContain('new-001');
      expect(due.map((e) => e.entryId)).toContain('due-001');
    });
  });

  describe('calculateEaseAdjustment', () => {
    it('should show positive adjustment for EASY', () => {
      const result = calculateEaseAdjustment(ReviewQuality.EASY);
      expect(result.adjustment).toBeCloseTo(0.1, 2);
      expect(result.qualityDelta).toBe(0);
      expect(result.description).toContain('increase');
    });

    it('should show negative adjustment for GOOD', () => {
      const result = calculateEaseAdjustment(ReviewQuality.GOOD);
      expect(result.adjustment).toBeCloseTo(-0.14, 2);
      expect(result.qualityDelta).toBe(2);
      expect(result.description).toContain('decrease');
    });

    it('should show larger negative adjustment for HARD', () => {
      const result = calculateEaseAdjustment(ReviewQuality.HARD);
      expect(result.adjustment).toBeLessThan(-0.2);
      expect(result.qualityDelta).toBe(3);
    });

    it('should show even larger negative for AGAIN', () => {
      const result = calculateEaseAdjustment(ReviewQuality.AGAIN);
      expect(result.qualityDelta).toBe(5);
      expect(result.adjustment).toBeLessThan(-0.4);
    });
  });

  describe('estimateReviewsToMastery', () => {
    it('should estimate reviews correctly for GOOD quality', () => {
      const reviews = estimateReviewsToMastery(ReviewQuality.GOOD);
      // Should take around 4-5 reviews to reach 21+ day interval
      expect(reviews).toBeGreaterThanOrEqual(3);
      expect(reviews).toBeLessThanOrEqual(6);
    });

    it('should require fewer reviews for EASY quality', () => {
      const goodReviews = estimateReviewsToMastery(ReviewQuality.GOOD);
      const easyReviews = estimateReviewsToMastery(ReviewQuality.EASY);

      expect(easyReviews).toBeLessThanOrEqual(goodReviews);
    });

    it('should handle low initial ease', () => {
      const reviews = estimateReviewsToMastery(ReviewQuality.GOOD, MIN_EASE_FACTOR);
      // With minimum ease, it should take more reviews
      expect(reviews).toBeGreaterThan(3);
    });

    it('should not exceed reasonable bounds', () => {
      const reviews = estimateReviewsToMastery(ReviewQuality.GOOD);
      expect(reviews).toBeLessThan(100);
    });
  });

  describe('Edge Cases and Recovery', () => {
    it('should recover from multiple failures', () => {
      let progress = getInitialProgress();

      // Build up progress
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);

      const beforeFailures = progress.interval;

      // Multiple failures
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);

      expect(progress.interval).toBe(1);
      expect(progress.repetitions).toBe(0);
      expect(progress.incorrectCount).toBe(2);

      // Start recovering
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.interval).toBe(1);
      expect(progress.repetitions).toBe(1);

      // Ease factor should be lower than original
      expect(progress.easeFactor).toBeLessThan(DEFAULT_EASE_FACTOR);

      // Can still reach mastery
      for (let i = 0; i < 10; i++) {
        progress = calculateNextReview(progress, ReviewQuality.GOOD);
      }
      expect(progress.mastered).toBe(true);
    });

    it('should handle alternating success and failure', () => {
      let progress = getInitialProgress();

      // Success
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.streak).toBe(1);

      // Failure
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      expect(progress.streak).toBe(0);

      // Success again
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      expect(progress.streak).toBe(1);
      expect(progress.repetitions).toBe(1);
    });

    it('should track total reviews even with failures', () => {
      let progress = getInitialProgress();

      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);

      expect(progress.totalReviews).toBe(4);
      expect(progress.correctCount).toBe(2);
      expect(progress.incorrectCount).toBe(2);
    });

    it('should maintain accuracy statistics correctly', () => {
      let progress = getInitialProgress();

      // 3 correct, 2 incorrect
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);
      progress = calculateNextReview(progress, ReviewQuality.GOOD);
      progress = calculateNextReview(progress, ReviewQuality.AGAIN);

      const accuracy = progress.correctCount / progress.totalReviews;
      expect(accuracy).toBeCloseTo(0.6, 2);
      expect(progress.correctCount).toBe(3);
      expect(progress.incorrectCount).toBe(2);
    });
  });
});
