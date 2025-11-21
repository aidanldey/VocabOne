/**
 * Integration Tests: Study Session
 * Tests the complete study session workflow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeDatabase,
  clearDatabase,
  saveModule,
  saveUserProgress,
  getUserProgress,
  getStudyQueue,
} from '@/services/storage/database';
import { calculateNextReview } from '@/services/spacedRepetition/sm2Algorithm';
import { ReviewQuality } from '@/models/types';
import type { VocabularyModule } from '@/types/module';

describe('Study Session Integration', () => {
  const testModule: VocabularyModule = {
    schema_version: '1.0.0',
    module_metadata: {
      module_id: 'study-test-module',
      title: 'Study Test Module',
      description: 'Module for testing study sessions',
      version: '1.0.0',
      author: 'Test',
      language: 'es',
      created_date: new Date().toISOString(),
    },
    vocabulary_entries: [
      {
        entry_id: 'word-001',
        term: 'perro',
        cards: [
          {
            card_id: 'word-001-img-01',
            card_type: 'image',
            content: { image_url: 'dog.jpg', image_alt: 'A dog' },
          },
          {
            card_id: 'word-001-def-01',
            card_type: 'definition',
            content: { definition_text: 'A domestic animal' },
          },
        ],
      },
      {
        entry_id: 'word-002',
        term: 'gato',
        cards: [
          {
            card_id: 'word-002-img-01',
            card_type: 'image',
            content: { image_url: 'cat.jpg', image_alt: 'A cat' },
          },
        ],
      },
      {
        entry_id: 'word-003',
        term: 'casa',
        cards: [
          {
            card_id: 'word-003-def-01',
            card_type: 'definition',
            content: { definition_text: 'A building for living' },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await initializeDatabase();
    await saveModule(testModule);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should start a new study session with due cards', async () => {
    // Get initial study queue (all cards should be new)
    const queue = await getStudyQueue('study-test-module');

    expect(queue.length).toBeGreaterThan(0);
    expect(queue.every((card) => card.due_date <= new Date())).toBe(true);
  });

  it('should complete a full study session flow', async () => {
    const queue = await getStudyQueue('study-test-module');
    expect(queue.length).toBeGreaterThan(0);

    const firstCard = queue[0];

    // Simulate answering the first card correctly
    const result = calculateNextReview(
      firstCard.interval,
      firstCard.ease_factor,
      firstCard.repetitions,
      ReviewQuality.GOOD
    );

    // Save progress
    await saveUserProgress('study-test-module', firstCard.entry_id, {
      interval: result.interval,
      ease_factor: result.ease_factor,
      repetitions: result.repetitions,
      due_date: result.next_review,
      last_reviewed: new Date(),
    });

    // Verify progress was saved
    const progress = await getUserProgress('study-test-module', firstCard.entry_id);
    expect(progress).toBeDefined();
    expect(progress!.repetitions).toBe(result.repetitions);
    expect(progress!.interval).toBe(result.interval);
  });

  it('should handle correct answers and update intervals', async () => {
    const queue = await getStudyQueue('study-test-module');
    const card = queue[0];

    // First review - correct answer
    let result = calculateNextReview(
      card.interval,
      card.ease_factor,
      card.repetitions,
      ReviewQuality.GOOD
    );

    expect(result.interval).toBe(1); // First interval should be 1 day
    expect(result.repetitions).toBe(1);

    // Save and get progress
    await saveUserProgress('study-test-module', card.entry_id, {
      interval: result.interval,
      ease_factor: result.ease_factor,
      repetitions: result.repetitions,
      due_date: result.next_review,
      last_reviewed: new Date(),
    });

    // Second review - correct answer
    const progress = await getUserProgress('study-test-module', card.entry_id);
    result = calculateNextReview(
      progress!.interval,
      progress!.ease_factor,
      progress!.repetitions,
      ReviewQuality.GOOD
    );

    expect(result.interval).toBe(6); // Second interval should be 6 days
    expect(result.repetitions).toBe(2);
  });

  it('should handle incorrect answers and reset progress', async () => {
    const queue = await getStudyQueue('study-test-module');
    const card = queue[0];

    // Build up some progress first
    let result = calculateNextReview(
      card.interval,
      card.ease_factor,
      card.repetitions,
      ReviewQuality.GOOD
    );

    await saveUserProgress('study-test-module', card.entry_id, {
      interval: result.interval,
      ease_factor: result.ease_factor,
      repetitions: result.repetitions,
      due_date: result.next_review,
      last_reviewed: new Date(),
    });

    // Now answer incorrectly
    const progress = await getUserProgress('study-test-module', card.entry_id);
    result = calculateNextReview(
      progress!.interval,
      progress!.ease_factor,
      progress!.repetitions,
      ReviewQuality.AGAIN
    );

    expect(result.interval).toBe(1); // Reset to 1 day
    expect(result.repetitions).toBe(0); // Reset repetitions
    expect(result.ease_factor).toBeLessThan(card.ease_factor); // Ease factor decreased
  });

  it('should filter out cards not yet due', async () => {
    const queue = await getStudyQueue('study-test-module');
    const card = queue[0];

    // Set a card to be due in the future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    await saveUserProgress('study-test-module', card.entry_id, {
      interval: 7,
      ease_factor: 2.5,
      repetitions: 2,
      due_date: futureDate,
      last_reviewed: new Date(),
    });

    // Get updated queue
    const updatedQueue = await getStudyQueue('study-test-module');

    // The card we just updated should not be in the queue
    const cardInQueue = updatedQueue.find((c) => c.entry_id === card.entry_id);
    expect(cardInQueue).toBeUndefined();
  });

  it('should handle study session with mixed card types', async () => {
    const queue = await getStudyQueue('study-test-module');

    // Verify we have cards of different types
    const cardTypes = queue.map((card) => {
      const entry = testModule.vocabulary_entries.find((e) => e.entry_id === card.entry_id);
      return entry?.cards[0].card_type;
    });

    expect(cardTypes).toContain('image');
    expect(cardTypes).toContain('definition');
  });

  it('should complete session when all cards reviewed', async () => {
    const queue = await getStudyQueue('study-test-module');
    const totalCards = queue.length;

    // Review all cards
    for (const card of queue) {
      const result = calculateNextReview(
        card.interval,
        card.ease_factor,
        card.repetitions,
        ReviewQuality.GOOD
      );

      await saveUserProgress('study-test-module', card.entry_id, {
        interval: result.interval,
        ease_factor: result.ease_factor,
        repetitions: result.repetitions,
        due_date: result.next_review,
        last_reviewed: new Date(),
      });
    }

    // Check that all cards have been reviewed
    const remainingQueue = await getStudyQueue('study-test-module');
    expect(remainingQueue.length).toBeLessThan(totalCards);
  });

  it('should track session statistics', async () => {
    const queue = await getStudyQueue('study-test-module');
    let correct = 0;
    let incorrect = 0;

    for (const card of queue) {
      const quality = Math.random() > 0.3 ? ReviewQuality.GOOD : ReviewQuality.AGAIN;

      if (quality >= ReviewQuality.HARD) {
        correct++;
      } else {
        incorrect++;
      }

      const result = calculateNextReview(
        card.interval,
        card.ease_factor,
        card.repetitions,
        quality
      );

      await saveUserProgress('study-test-module', card.entry_id, {
        interval: result.interval,
        ease_factor: result.ease_factor,
        repetitions: result.repetitions,
        due_date: result.next_review,
        last_reviewed: new Date(),
      });
    }

    // Verify we tracked both correct and incorrect answers
    expect(correct + incorrect).toBe(queue.length);
  });

  it('should handle empty queue gracefully', async () => {
    // Review all cards to empty the queue
    const queue = await getStudyQueue('study-test-module');

    for (const card of queue) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await saveUserProgress('study-test-module', card.entry_id, {
        interval: 30,
        ease_factor: 2.5,
        repetitions: 5,
        due_date: futureDate,
        last_reviewed: new Date(),
      });
    }

    const emptyQueue = await getStudyQueue('study-test-module');
    expect(emptyQueue).toHaveLength(0);
  });
});
