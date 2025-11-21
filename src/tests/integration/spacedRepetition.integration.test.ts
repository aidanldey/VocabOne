/**
 * Integration Tests: Spaced Repetition (SM-2 Algorithm)
 * Tests the complete spaced repetition workflow
 */

import { describe, it, expect } from 'vitest';
import { calculateNextReview } from '@/services/spacedRepetition/sm2Algorithm';
import { ReviewQuality } from '@/models/types';

describe('Spaced Repetition Integration', () => {
  it('should calculate correct intervals for perfect learning path', () => {
    // Simulate a learner who gets everything right
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;

    // Review 1: First time seeing the card - GOOD
    let result = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.GOOD);
    expect(result.interval).toBe(1); // 1 day
    expect(result.repetitions).toBe(1);
    expect(result.ease_factor).toBeGreaterThanOrEqual(2.5);

    interval = result.interval;
    easeFactor = result.ease_factor;
    repetitions = result.repetitions;

    // Review 2: After 1 day - GOOD
    result = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.GOOD);
    expect(result.interval).toBe(6); // 6 days
    expect(result.repetitions).toBe(2);

    interval = result.interval;
    easeFactor = result.ease_factor;
    repetitions = result.repetitions;

    // Review 3: After 6 days - GOOD
    result = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.GOOD);
    expect(result.interval).toBeGreaterThan(6); // Should grow
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBeCloseTo(6 * easeFactor, 0);

    // Verify exponential growth
    const previousInterval = interval;
    interval = result.interval;
    easeFactor = result.ease_factor;
    repetitions = result.repetitions;

    result = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.GOOD);
    expect(result.interval).toBeGreaterThan(previousInterval);
    expect(result.repetitions).toBe(4);
  });

  it('should handle difficulty progression (EASY answers)', () => {
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;

    // Consistently EASY answers should increase ease factor
    const result1 = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.EASY);
    expect(result1.ease_factor).toBeGreaterThan(easeFactor);

    const result2 = calculateNextReview(
      result1.interval,
      result1.ease_factor,
      result1.repetitions,
      ReviewQuality.EASY
    );
    expect(result2.ease_factor).toBeGreaterThan(result1.ease_factor);

    // Intervals should grow faster with higher ease factor
    expect(result2.interval).toBeGreaterThan(result1.interval);
  });

  it('should handle difficulty progression (HARD answers)', () => {
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;

    // HARD answers should decrease ease factor but still progress
    const result1 = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.HARD);
    expect(result1.ease_factor).toBeLessThan(easeFactor);
    expect(result1.interval).toBe(1); // Still moves to day 1

    const result2 = calculateNextReview(
      result1.interval,
      result1.ease_factor,
      result1.repetitions,
      ReviewQuality.HARD
    );
    expect(result2.ease_factor).toBeLessThan(result1.ease_factor);
    expect(result2.interval).toBe(6); // Still moves to day 6
  });

  it('should reset progress on AGAIN (incorrect answer)', () => {
    // Build up some progress
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;

    const result1 = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.GOOD);
    const result2 = calculateNextReview(
      result1.interval,
      result1.ease_factor,
      result1.repetitions,
      ReviewQuality.GOOD
    );

    expect(result2.interval).toBe(6);
    expect(result2.repetitions).toBe(2);

    // Now get it wrong
    const failResult = calculateNextReview(
      result2.interval,
      result2.ease_factor,
      result2.repetitions,
      ReviewQuality.AGAIN
    );

    expect(failResult.interval).toBe(1); // Reset to day 1
    expect(failResult.repetitions).toBe(0); // Reset repetitions
    expect(failResult.ease_factor).toBeLessThan(result2.ease_factor); // Penalty
    expect(failResult.ease_factor).toBeGreaterThanOrEqual(1.3); // Minimum ease factor
  });

  it('should maintain minimum ease factor of 1.3', () => {
    let interval = 1;
    let easeFactor = 1.3; // Already at minimum
    let repetitions = 1;

    // Even with AGAIN, ease factor shouldn't go below 1.3
    const result = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.AGAIN);
    expect(result.ease_factor).toBeGreaterThanOrEqual(1.3);
  });

  it('should handle realistic mixed performance scenario', () => {
    // Simulate a realistic learner with mixed performance
    const reviews = [
      ReviewQuality.GOOD, // Learn it
      ReviewQuality.GOOD, // Remember it
      ReviewQuality.HARD, // Struggle a bit
      ReviewQuality.GOOD, // Back on track
      ReviewQuality.AGAIN, // Forget it
      ReviewQuality.HARD, // Relearning
      ReviewQuality.GOOD, // Getting better
      ReviewQuality.GOOD, // Solid now
      ReviewQuality.EASY, // Mastered
    ];

    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;
    const intervals: number[] = [];

    for (const quality of reviews) {
      const result = calculateNextReview(interval, easeFactor, repetitions, quality);
      intervals.push(result.interval);
      interval = result.interval;
      easeFactor = result.ease_factor;
      repetitions = result.repetitions;
    }

    // Verify the pattern makes sense
    expect(intervals[0]).toBe(1); // First review
    expect(intervals[1]).toBe(6); // Second review
    expect(intervals[4]).toBe(1); // Reset after AGAIN
    expect(intervals[intervals.length - 1]).toBeGreaterThan(intervals[intervals.length - 2]); // Growing at the end
  });

  it('should calculate correct due dates', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const interval = 5;
    const easeFactor = 2.5;
    const repetitions = 2;

    const result = calculateNextReview(
      interval,
      easeFactor,
      repetitions,
      ReviewQuality.GOOD,
      now
    );

    const expectedDueDate = new Date(now);
    expectedDueDate.setDate(expectedDueDate.getDate() + result.interval);

    expect(result.next_review.getTime()).toBeGreaterThan(now.getTime());
    expect(result.next_review.toDateString()).toBe(expectedDueDate.toDateString());
  });

  it('should handle long-term retention (months)', () => {
    let interval = 0;
    let easeFactor = 2.6; // Slightly above average
    let repetitions = 0;

    // Simulate 10 perfect reviews
    for (let i = 0; i < 10; i++) {
      const result = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.GOOD);
      interval = result.interval;
      easeFactor = result.ease_factor;
      repetitions = result.repetitions;
    }

    // After 10 perfect reviews, interval should be quite long
    expect(interval).toBeGreaterThan(30); // More than a month
    expect(repetitions).toBe(10);
    expect(easeFactor).toBeGreaterThan(2.6); // Should have increased
  });

  it('should handle edge case: immediate re-review after failure', () => {
    const interval = 0;
    const easeFactor = 2.5;
    const repetitions = 0;

    // Fail on first attempt
    const result1 = calculateNextReview(interval, easeFactor, repetitions, ReviewQuality.AGAIN);
    expect(result1.interval).toBe(1);
    expect(result1.repetitions).toBe(0);

    // Try again after 1 day and succeed
    const result2 = calculateNextReview(
      result1.interval,
      result1.ease_factor,
      result1.repetitions,
      ReviewQuality.GOOD
    );
    expect(result2.interval).toBe(1); // Back to first interval
    expect(result2.repetitions).toBe(1);
  });

  it('should ensure intervals never decrease (except on failure)', () => {
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;

    const qualities = [ReviewQuality.GOOD, ReviewQuality.HARD, ReviewQuality.EASY];

    for (const quality of qualities) {
      const result = calculateNextReview(interval, easeFactor, repetitions, quality);

      if (quality !== ReviewQuality.AGAIN) {
        // Intervals should generally increase or stay the same (first two are fixed at 1 and 6)
        if (repetitions >= 2) {
          expect(result.interval).toBeGreaterThanOrEqual(interval);
        }
      }

      interval = result.interval;
      easeFactor = result.ease_factor;
      repetitions = result.repetitions;
    }
  });

  it('should handle study session with 20 cards (typical daily goal)', () => {
    const cards = Array.from({ length: 20 }, (_, i) => ({
      id: `card-${i}`,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    }));

    // Simulate reviewing all cards with ~80% success rate
    const results = cards.map((card) => {
      const quality = Math.random() < 0.8 ? ReviewQuality.GOOD : ReviewQuality.AGAIN;
      return calculateNextReview(card.interval, card.easeFactor, card.repetitions, quality);
    });

    // Verify all cards got processed
    expect(results).toHaveLength(20);

    // Most should have interval of 1 day
    const correctAnswers = results.filter((r) => r.interval === 1);
    expect(correctAnswers.length).toBeGreaterThan(10); // At least 50%

    // Some should have been reset
    const resetCards = results.filter((r) => r.repetitions === 0);
    expect(resetCards.length).toBeGreaterThan(0);
  });
});
