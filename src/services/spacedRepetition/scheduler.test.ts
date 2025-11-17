import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getDueCards,
  getNewCards,
  sortByPriority,
  buildSession,
  getModuleStats,
  getEntriesByPhase,
  getForecast,
  DEFAULT_SESSION_SETTINGS,
  type SessionSettings,
  CardPriority,
} from './scheduler';
import {
  type VocabularyModule,
  type VocabularyEntry,
  type UserProgress,
  CardType,
} from '@/models/types';
import { getInitialProgress, calculateNextReview } from './sm2Algorithm';
import { ReviewQuality } from '@/models/types';
import { addDays, subDays } from 'date-fns';

describe('Review Scheduler', () => {
  let testModule: VocabularyModule;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));

    // Create a test module with mixed progress states
    testModule = {
      moduleId: 'test-module',
      title: 'Test Module',
      language: 'en',
      version: '1.0.0',
      entries: [],
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createEntry(
    id: string,
    progress?: UserProgress | null
  ): VocabularyEntry {
    return {
      entryId: id,
      term: `term-${id}`,
      cards: [
        {
          cardId: `${id}-def-01`,
          type: CardType.DEFINITION,
          definition: 'Test definition',
          expectedAnswer: `term-${id}`,
        },
      ],
      progress: progress === null ? undefined : progress,
    };
  }

  describe('getDueCards', () => {
    it('should return only cards that are due for review', () => {
      const dueProgress = getInitialProgress();
      const futureProgress = { ...getInitialProgress(), nextReview: addDays(new Date(), 5).toISOString() };

      testModule.entries = [
        createEntry('due-1', dueProgress),
        createEntry('future-1', futureProgress),
        createEntry('new-1', null), // New card - not due
      ];

      const due = getDueCards(testModule);

      expect(due).toHaveLength(1);
      expect(due[0].entryId).toBe('due-1');
    });

    it('should include overdue cards', () => {
      const overdueProgress = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 3).toISOString(),
      };

      testModule.entries = [createEntry('overdue-1', overdueProgress)];

      const due = getDueCards(testModule);

      expect(due).toHaveLength(1);
      expect(due[0].entryId).toBe('overdue-1');
    });

    it('should return empty array when no cards are due', () => {
      const futureProgress = {
        ...getInitialProgress(),
        nextReview: addDays(new Date(), 10).toISOString(),
      };

      testModule.entries = [
        createEntry('future-1', futureProgress),
        createEntry('new-1', null),
      ];

      const due = getDueCards(testModule);

      expect(due).toHaveLength(0);
    });

    it('should handle module with no entries', () => {
      testModule.entries = [];

      const due = getDueCards(testModule);

      expect(due).toHaveLength(0);
    });

    it('should not include new cards without progress', () => {
      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
      ];

      const due = getDueCards(testModule);

      expect(due).toHaveLength(0);
    });
  });

  describe('getNewCards', () => {
    it('should return cards without progress', () => {
      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
        createEntry('studied-1', getInitialProgress()),
      ];

      const newCards = getNewCards(testModule);

      expect(newCards).toHaveLength(2);
      expect(newCards[0].entryId).toBe('new-1');
      expect(newCards[1].entryId).toBe('new-2');
    });

    it('should respect the limit parameter', () => {
      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
        createEntry('new-3', null),
        createEntry('new-4', null),
      ];

      const newCards = getNewCards(testModule, 2);

      expect(newCards).toHaveLength(2);
      expect(newCards[0].entryId).toBe('new-1');
      expect(newCards[1].entryId).toBe('new-2');
    });

    it('should return all cards when limit is 0', () => {
      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
        createEntry('new-3', null),
      ];

      const newCards = getNewCards(testModule, 0);

      expect(newCards).toHaveLength(3);
    });

    it('should return empty array when all cards have progress', () => {
      testModule.entries = [
        createEntry('studied-1', getInitialProgress()),
        createEntry('studied-2', getInitialProgress()),
      ];

      const newCards = getNewCards(testModule);

      expect(newCards).toHaveLength(0);
    });
  });

  describe('sortByPriority', () => {
    it('should prioritize overdue cards first', () => {
      const overdueProgress = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 3).toISOString(),
      };
      const dueProgress = getInitialProgress();

      const entries = [
        createEntry('due-1', dueProgress),
        createEntry('overdue-1', overdueProgress),
      ];

      const sorted = sortByPriority(entries);

      expect(sorted[0].entryId).toBe('overdue-1');
      expect(sorted[1].entryId).toBe('due-1');
    });

    it('should sort overdue cards by most overdue first', () => {
      const overdue1 = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 1).toISOString(),
      };
      const overdue5 = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 5).toISOString(),
      };
      const overdue3 = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 3).toISOString(),
      };

      const entries = [
        createEntry('overdue-1', overdue1),
        createEntry('overdue-5', overdue5),
        createEntry('overdue-3', overdue3),
      ];

      const sorted = sortByPriority(entries);

      expect(sorted[0].entryId).toBe('overdue-5');
      expect(sorted[1].entryId).toBe('overdue-3');
      expect(sorted[2].entryId).toBe('overdue-1');
    });

    it('should sort due today by longest interval first', () => {
      const shortInterval = { ...getInitialProgress(), interval: 1 };
      const longInterval = { ...getInitialProgress(), interval: 10 };

      const entries = [
        createEntry('short', shortInterval),
        createEntry('long', longInterval),
      ];

      const sorted = sortByPriority(entries);

      expect(sorted[0].entryId).toBe('long');
      expect(sorted[1].entryId).toBe('short');
    });

    it('should place new cards after due cards', () => {
      const dueProgress = getInitialProgress();

      const entries = [
        createEntry('new-1', null),
        createEntry('due-1', dueProgress),
      ];

      const sorted = sortByPriority(entries);

      expect(sorted[0].entryId).toBe('due-1');
      expect(sorted[1].entryId).toBe('new-1');
    });

    it('should not modify the original array', () => {
      const entries = [
        createEntry('a', null),
        createEntry('b', getInitialProgress()),
      ];
      const originalOrder = [...entries];

      sortByPriority(entries);

      expect(entries).toEqual(originalOrder);
    });
  });

  describe('buildSession', () => {
    beforeEach(() => {
      // Create a module with mixed card types
      const dueProgress = getInitialProgress();
      const futureProgress = {
        ...getInitialProgress(),
        nextReview: addDays(new Date(), 5).toISOString(),
      };

      testModule.entries = [
        // 3 due cards
        createEntry('due-1', dueProgress),
        createEntry('due-2', dueProgress),
        createEntry('due-3', dueProgress),
        // 2 future cards
        createEntry('future-1', futureProgress),
        createEntry('future-2', futureProgress),
        // 5 new cards
        createEntry('new-1', null),
        createEntry('new-2', null),
        createEntry('new-3', null),
        createEntry('new-4', null),
        createEntry('new-5', null),
      ];
    });

    it('should respect maxNew and maxReview limits', () => {
      const settings: SessionSettings = {
        maxNew: 2,
        maxReview: 1,
        randomize: false,
        prioritizeOverdue: false,
        mixCards: false,
      };

      const session = buildSession(testModule, settings);

      expect(session.newCount).toBe(2);
      expect(session.reviewCount).toBe(1);
      expect(session.cards).toHaveLength(3);
    });

    it('should include session metadata', () => {
      const settings = DEFAULT_SESSION_SETTINGS;
      const session = buildSession(testModule, settings);

      expect(session.metadata.moduleId).toBe('test-module');
      expect(session.metadata.createdAt).toBeDefined();
      expect(session.metadata.settings).toEqual(settings);
    });

    it('should mix cards when mixCards is true', () => {
      const settings: SessionSettings = {
        maxNew: 2,
        maxReview: 2,
        randomize: false,
        prioritizeOverdue: false,
        mixCards: true,
      };

      const session = buildSession(testModule, settings);

      // With interleaving, cards should alternate between new and review
      expect(session.cards).toHaveLength(4);
    });

    it('should separate cards when mixCards is false', () => {
      const settings: SessionSettings = {
        maxNew: 2,
        maxReview: 2,
        randomize: false,
        prioritizeOverdue: false,
        mixCards: false,
      };

      const session = buildSession(testModule, settings);

      // Review cards first, then new cards
      expect(session.cards).toHaveLength(4);
      // First 2 should be review cards
      expect(session.cards[0].progress).toBeDefined();
      expect(session.cards[1].progress).toBeDefined();
      // Last 2 should be new cards
      expect(session.cards[2].progress).toBeUndefined();
      expect(session.cards[3].progress).toBeUndefined();
    });

    it('should handle case when fewer cards available than requested', () => {
      const settings: SessionSettings = {
        maxNew: 100,
        maxReview: 100,
        randomize: false,
        prioritizeOverdue: false,
        mixCards: false,
      };

      const session = buildSession(testModule, settings);

      expect(session.newCount).toBe(5); // Only 5 new cards available
      expect(session.reviewCount).toBe(3); // Only 3 due cards available
    });

    it('should prioritize overdue when requested', () => {
      const overdue = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 5).toISOString(),
      };

      testModule.entries[0].progress = overdue;

      const settings: SessionSettings = {
        maxNew: 0,
        maxReview: 3,
        randomize: false,
        prioritizeOverdue: true,
        mixCards: false,
      };

      const session = buildSession(testModule, settings);

      // Overdue card should be first
      expect(session.cards[0].entryId).toBe('due-1');
    });

    it('should handle empty module gracefully', () => {
      testModule.entries = [];

      const session = buildSession(testModule, DEFAULT_SESSION_SETTINGS);

      expect(session.cards).toHaveLength(0);
      expect(session.newCount).toBe(0);
      expect(session.reviewCount).toBe(0);
    });

    it('should handle all new cards', () => {
      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
      ];

      const session = buildSession(testModule, {
        maxNew: 10,
        maxReview: 10,
        randomize: false,
        prioritizeOverdue: false,
        mixCards: false,
      });

      expect(session.newCount).toBe(2);
      expect(session.reviewCount).toBe(0);
    });

    it('should handle all review cards', () => {
      testModule.entries = [
        createEntry('due-1', getInitialProgress()),
        createEntry('due-2', getInitialProgress()),
      ];

      const session = buildSession(testModule, {
        maxNew: 10,
        maxReview: 10,
        randomize: false,
        prioritizeOverdue: false,
        mixCards: false,
      });

      expect(session.newCount).toBe(0);
      expect(session.reviewCount).toBe(2);
    });
  });

  describe('getModuleStats', () => {
    it('should calculate basic statistics correctly', () => {
      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
        createEntry('learning-1', getInitialProgress()),
      ];

      const stats = getModuleStats(testModule);

      expect(stats.totalEntries).toBe(3);
      expect(stats.newEntries).toBe(2);
      expect(stats.learningEntries).toBe(1);
      expect(stats.masteredEntries).toBe(0);
    });

    it('should count due cards correctly', () => {
      const dueProgress = getInitialProgress();
      const overdueProgress = {
        ...getInitialProgress(),
        nextReview: subDays(new Date(), 2).toISOString(),
      };
      const futureProgress = {
        ...getInitialProgress(),
        nextReview: addDays(new Date(), 5).toISOString(),
      };

      testModule.entries = [
        createEntry('due-1', dueProgress),
        createEntry('overdue-1', overdueProgress),
        createEntry('future-1', futureProgress),
      ];

      const stats = getModuleStats(testModule);

      expect(stats.dueToday).toBe(2); // Due + overdue
      expect(stats.overdue).toBe(1);
    });

    it('should count mastered cards correctly', () => {
      let masteredProgress = getInitialProgress();
      // Build up to mastery
      for (let i = 0; i < 10; i++) {
        masteredProgress = calculateNextReview(masteredProgress, ReviewQuality.GOOD);
      }

      testModule.entries = [
        createEntry('mastered-1', masteredProgress),
        createEntry('learning-1', getInitialProgress()),
      ];

      const stats = getModuleStats(testModule);

      expect(stats.masteredEntries).toBe(1);
      expect(stats.learningEntries).toBe(1);
    });

    it('should calculate average ease factor', () => {
      const progress1 = { ...getInitialProgress(), easeFactor: 2.5 };
      const progress2 = { ...getInitialProgress(), easeFactor: 2.7 };

      testModule.entries = [
        createEntry('entry-1', progress1),
        createEntry('entry-2', progress2),
      ];

      const stats = getModuleStats(testModule);

      expect(stats.averageEaseFactor).toBeCloseTo(2.6, 2);
    });

    it('should calculate accuracy percentage', () => {
      const progress = {
        ...getInitialProgress(),
        correctCount: 7,
        incorrectCount: 3,
        totalReviews: 10,
      };

      testModule.entries = [createEntry('entry-1', progress)];

      const stats = getModuleStats(testModule);

      expect(stats.accuracy).toBeCloseTo(70, 1);
      expect(stats.totalReviews).toBe(10);
    });

    it('should handle module with no entries', () => {
      testModule.entries = [];

      const stats = getModuleStats(testModule);

      expect(stats.totalEntries).toBe(0);
      expect(stats.newEntries).toBe(0);
      expect(stats.averageEaseFactor).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    it('should handle all new entries', () => {
      testModule.entries = [createEntry('new-1', null), createEntry('new-2', null)];

      const stats = getModuleStats(testModule);

      expect(stats.newEntries).toBe(2);
      expect(stats.learningEntries).toBe(0);
      expect(stats.averageEaseFactor).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    it('should aggregate reviews correctly', () => {
      const progress1 = {
        ...getInitialProgress(),
        totalReviews: 5,
        correctCount: 4,
        incorrectCount: 1,
      };
      const progress2 = {
        ...getInitialProgress(),
        totalReviews: 10,
        correctCount: 8,
        incorrectCount: 2,
      };

      testModule.entries = [
        createEntry('entry-1', progress1),
        createEntry('entry-2', progress2),
      ];

      const stats = getModuleStats(testModule);

      expect(stats.totalReviews).toBe(15);
      expect(stats.accuracy).toBeCloseTo(80, 1); // 12/15 = 80%
    });
  });

  describe('getEntriesByPhase', () => {
    it('should categorize entries correctly', () => {
      let masteredProgress = getInitialProgress();
      for (let i = 0; i < 10; i++) {
        masteredProgress = calculateNextReview(masteredProgress, ReviewQuality.GOOD);
      }

      testModule.entries = [
        createEntry('new-1', null),
        createEntry('new-2', null),
        createEntry('learning-1', getInitialProgress()),
        createEntry('mastered-1', masteredProgress),
      ];

      const phases = getEntriesByPhase(testModule);

      expect(phases.new).toHaveLength(2);
      expect(phases.learning).toHaveLength(1);
      expect(phases.mastered).toHaveLength(1);
    });

    it('should handle empty module', () => {
      testModule.entries = [];

      const phases = getEntriesByPhase(testModule);

      expect(phases.new).toHaveLength(0);
      expect(phases.learning).toHaveLength(0);
      expect(phases.mastered).toHaveLength(0);
    });
  });

  describe('getForecast', () => {
    it('should forecast reviews for upcoming days', () => {
      testModule.entries = [
        createEntry('today', {
          ...getInitialProgress(),
          nextReview: new Date().toISOString(),
        }),
        createEntry('tomorrow', {
          ...getInitialProgress(),
          nextReview: addDays(new Date(), 1).toISOString(),
        }),
        createEntry('day2', {
          ...getInitialProgress(),
          nextReview: addDays(new Date(), 2).toISOString(),
        }),
        createEntry('day2-b', {
          ...getInitialProgress(),
          nextReview: addDays(new Date(), 2).toISOString(),
        }),
      ];

      const forecast = getForecast(testModule, 7);

      expect(forecast).toHaveLength(7);
      expect(forecast[0]).toBe(1); // Today
      expect(forecast[1]).toBe(1); // Tomorrow
      expect(forecast[2]).toBe(2); // Day 2
      expect(forecast[3]).toBe(0); // Day 3
    });

    it('should not include overdue cards in forecast', () => {
      testModule.entries = [
        createEntry('overdue', {
          ...getInitialProgress(),
          nextReview: subDays(new Date(), 3).toISOString(),
        }),
      ];

      const forecast = getForecast(testModule, 7);

      // All zeros - overdue cards not counted
      expect(forecast.every((count) => count === 0)).toBe(true);
    });

    it('should not include cards beyond forecast range', () => {
      testModule.entries = [
        createEntry('far-future', {
          ...getInitialProgress(),
          nextReview: addDays(new Date(), 30).toISOString(),
        }),
      ];

      const forecast = getForecast(testModule, 7);

      expect(forecast.every((count) => count === 0)).toBe(true);
    });

    it('should ignore new cards without progress', () => {
      testModule.entries = [createEntry('new', null)];

      const forecast = getForecast(testModule, 7);

      expect(forecast.every((count) => count === 0)).toBe(true);
    });
  });

  describe('DEFAULT_SESSION_SETTINGS', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_SESSION_SETTINGS.maxNew).toBe(10);
      expect(DEFAULT_SESSION_SETTINGS.maxReview).toBe(20);
      expect(DEFAULT_SESSION_SETTINGS.randomize).toBe(true);
      expect(DEFAULT_SESSION_SETTINGS.prioritizeOverdue).toBe(true);
      expect(DEFAULT_SESSION_SETTINGS.mixCards).toBe(true);
    });
  });
});
