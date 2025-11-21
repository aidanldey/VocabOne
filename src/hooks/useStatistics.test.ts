import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStatistics } from './useStatistics';
import type { ProgressDataPoint, StudyDay } from './useStatistics';

describe('useStatistics', () => {
  const mockProgressHistory: ProgressDataPoint[] = [
    { date: '2025-01-01', wordsLearned: 10, reviewsCompleted: 20, accuracy: 85 },
    { date: '2025-01-02', wordsLearned: 15, reviewsCompleted: 25, accuracy: 90 },
    { date: '2025-01-03', wordsLearned: 22, reviewsCompleted: 30, accuracy: 88 },
    { date: '2025-01-04', wordsLearned: 28, reviewsCompleted: 35, accuracy: 92 },
    { date: '2025-01-05', wordsLearned: 35, reviewsCompleted: 40, accuracy: 87 },
  ];

  const mockStudyDays: StudyDay[] = [
    { date: '2025-01-01', reviewCount: 20, isStudied: true },
    { date: '2025-01-02', reviewCount: 25, isStudied: true },
    { date: '2025-01-03', reviewCount: 30, isStudied: true },
    { date: '2025-01-04', reviewCount: 0, isStudied: false },
    { date: '2025-01-05', reviewCount: 40, isStudied: true },
  ];

  it('should calculate total words learned', () => {
    const { result } = renderHook(() =>
      useStatistics({ progressHistory: mockProgressHistory })
    );

    expect(result.current.totalWords).toBe(35);
  });

  it('should return 0 for empty progress history', () => {
    const { result } = renderHook(() => useStatistics({ progressHistory: [] }));

    expect(result.current.totalWords).toBe(0);
    expect(result.current.averageAccuracy).toBe(0);
    expect(result.current.totalReviews).toBe(0);
  });

  it('should calculate average accuracy', () => {
    const { result } = renderHook(() =>
      useStatistics({ progressHistory: mockProgressHistory })
    );

    // (85 + 90 + 88 + 92 + 87) / 5 = 442 / 5 = 88.4 rounded to 88
    expect(result.current.averageAccuracy).toBe(88);
  });

  it('should calculate total reviews', () => {
    const { result } = renderHook(() =>
      useStatistics({ progressHistory: mockProgressHistory })
    );

    // 20 + 25 + 30 + 35 + 40 = 150
    expect(result.current.totalReviews).toBe(150);
  });

  it('should calculate daily average reviews', () => {
    const { result } = renderHook(() =>
      useStatistics({ progressHistory: mockProgressHistory })
    );

    // 150 / 5 = 30
    expect(result.current.dailyAverageReviews).toBe(30);
  });

  it('should calculate current streak', () => {
    // Create a streak ending today
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const streakDays: StudyDay[] = [
      { date: twoDaysAgo.toISOString().split('T')[0], reviewCount: 10, isStudied: true },
      { date: yesterday.toISOString().split('T')[0], reviewCount: 15, isStudied: true },
      { date: today.toISOString().split('T')[0], reviewCount: 20, isStudied: true },
    ];

    const { result } = renderHook(() =>
      useStatistics({ studyDays: streakDays })
    );

    expect(result.current.currentStreak).toBe(3);
  });

  it('should return 0 for broken streak', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const brokenStreak: StudyDay[] = [
      { date: twoDaysAgo.toISOString().split('T')[0], reviewCount: 10, isStudied: true },
      // Missing yesterday
    ];

    const { result } = renderHook(() =>
      useStatistics({ studyDays: brokenStreak })
    );

    expect(result.current.currentStreak).toBe(0);
  });

  it('should calculate best streak', () => {
    const streakDays: StudyDay[] = [
      { date: '2025-01-01', reviewCount: 10, isStudied: true },
      { date: '2025-01-02', reviewCount: 15, isStudied: true },
      { date: '2025-01-03', reviewCount: 20, isStudied: true },
      { date: '2025-01-04', reviewCount: 0, isStudied: false }, // Break
      { date: '2025-01-05', reviewCount: 10, isStudied: true },
      { date: '2025-01-06', reviewCount: 15, isStudied: true },
      { date: '2025-01-07', reviewCount: 20, isStudied: true },
      { date: '2025-01-08', reviewCount: 25, isStudied: true },
    ];

    const { result } = renderHook(() =>
      useStatistics({ studyDays: streakDays })
    );

    // Best streak is 4 days (Jan 5-8)
    expect(result.current.bestStreak).toBe(4);
  });

  it('should get reviews today', () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData: ProgressDataPoint[] = [
      { date: '2025-01-01', wordsLearned: 10, reviewsCompleted: 20, accuracy: 85 },
      { date: today, wordsLearned: 15, reviewsCompleted: 42, accuracy: 90 },
    ];

    const { result } = renderHook(() =>
      useStatistics({ progressHistory: todayData })
    );

    expect(result.current.reviewsToday).toBe(42);
  });

  it('should return 0 reviews for today if no data', () => {
    const { result } = renderHook(() =>
      useStatistics({ progressHistory: mockProgressHistory })
    );

    // Mock data doesn't include today
    expect(result.current.reviewsToday).toBe(0);
  });

  it('should calculate estimated days to complete', () => {
    // Need at least 7 days for estimate calculation
    const weekHistory: ProgressDataPoint[] = [
      { date: '2025-01-01', wordsLearned: 10, reviewsCompleted: 20, accuracy: 85 },
      { date: '2025-01-02', wordsLearned: 15, reviewsCompleted: 25, accuracy: 90 },
      { date: '2025-01-03', wordsLearned: 20, reviewsCompleted: 30, accuracy: 88 },
      { date: '2025-01-04', wordsLearned: 25, reviewsCompleted: 35, accuracy: 92 },
      { date: '2025-01-05', wordsLearned: 30, reviewsCompleted: 40, accuracy: 87 },
      { date: '2025-01-06', wordsLearned: 35, reviewsCompleted: 45, accuracy: 89 },
      { date: '2025-01-07', wordsLearned: 40, reviewsCompleted: 50, accuracy: 91 },
    ];

    const { result } = renderHook(() =>
      useStatistics({
        progressHistory: weekHistory,
        currentModule: {
          totalWords: 100,
          masteredWords: 40,
        },
      })
    );

    // Remaining: 100 - 40 = 60 words
    // Growth: (40 - 10) / 7 = 4.29 words/day
    // Days needed: 60 / 4.29 = ~14 days
    expect(result.current.estimatedDaysToComplete).toBeGreaterThan(10);
    expect(result.current.estimatedDaysToComplete).toBeLessThan(20);
  });

  it('should return null for estimated days with insufficient data', () => {
    const shortHistory: ProgressDataPoint[] = [
      { date: '2025-01-01', wordsLearned: 10, reviewsCompleted: 20, accuracy: 85 },
    ];

    const { result } = renderHook(() =>
      useStatistics({
        progressHistory: shortHistory,
        currentModule: {
          totalWords: 100,
          masteredWords: 10,
        },
      })
    );

    expect(result.current.estimatedDaysToComplete).toBeNull();
  });

  it('should return 0 days when module is complete', () => {
    const weekHistory: ProgressDataPoint[] = [
      { date: '2025-01-01', wordsLearned: 10, reviewsCompleted: 20, accuracy: 85 },
      { date: '2025-01-02', wordsLearned: 15, reviewsCompleted: 25, accuracy: 90 },
      { date: '2025-01-03', wordsLearned: 20, reviewsCompleted: 30, accuracy: 88 },
      { date: '2025-01-04', wordsLearned: 25, reviewsCompleted: 35, accuracy: 92 },
      { date: '2025-01-05', wordsLearned: 30, reviewsCompleted: 40, accuracy: 87 },
      { date: '2025-01-06', wordsLearned: 35, reviewsCompleted: 45, accuracy: 89 },
      { date: '2025-01-07', wordsLearned: 40, reviewsCompleted: 50, accuracy: 91 },
    ];

    const { result } = renderHook(() =>
      useStatistics({
        progressHistory: weekHistory,
        currentModule: {
          totalWords: 40,
          masteredWords: 40,
        },
      })
    );

    expect(result.current.estimatedDaysToComplete).toBe(0);
  });

  it('should fill in blank study days for last 90 days', () => {
    const recentDays: StudyDay[] = [
      { date: '2025-01-01', reviewCount: 10, isStudied: true },
    ];

    const { result } = renderHook(() =>
      useStatistics({ studyDays: recentDays })
    );

    // Should have 91 days (including today)
    expect(result.current.studyDays.length).toBeGreaterThanOrEqual(90);
  });

  it('should include unstudied days in calendar', () => {
    // Use recent dates relative to today
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const someDays: StudyDay[] = [
      { date: threeDaysAgo.toISOString().split('T')[0], reviewCount: 10, isStudied: true },
      { date: oneDayAgo.toISOString().split('T')[0], reviewCount: 15, isStudied: true },
    ];

    const { result } = renderHook(() =>
      useStatistics({ studyDays: someDays })
    );

    // Should fill in gaps with isStudied: false
    const filledDays = result.current.studyDays;
    const missingDay = filledDays.find((d) => d.date === twoDaysAgo.toISOString().split('T')[0]);
    expect(missingDay).toBeDefined();
    expect(missingDay?.isStudied).toBe(false);
    expect(missingDay?.reviewCount).toBe(0);
  });

  it('should filter progress history to last 30 days', () => {
    const longHistory: ProgressDataPoint[] = [];
    for (let i = 60; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      longHistory.push({
        date: date.toISOString().split('T')[0],
        wordsLearned: 100 - i,
        reviewsCompleted: 10,
        accuracy: 85,
      });
    }

    const { result } = renderHook(() =>
      useStatistics({ progressHistory: longHistory })
    );

    // Should only have last 30 days
    expect(result.current.progressHistory.length).toBeLessThanOrEqual(31);
  });
});
