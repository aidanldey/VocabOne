import { useMemo } from 'react';

export interface ProgressDataPoint {
  date: string;
  wordsLearned: number;
  reviewsCompleted: number;
  accuracy: number;
}

export interface StudyDay {
  date: string;
  reviewCount: number;
  isStudied: boolean;
}

export interface DerivedStatistics {
  /** Total words learned */
  totalWords: number;
  /** Current streak in days */
  currentStreak: number;
  /** Longest streak achieved */
  bestStreak: number;
  /** Average accuracy percentage */
  averageAccuracy: number;
  /** Reviews completed today */
  reviewsToday: number;
  /** Progress over time (last 30 days) */
  progressHistory: ProgressDataPoint[];
  /** Study days for calendar (last 90 days) */
  studyDays: StudyDay[];
  /** Estimated days to complete current module */
  estimatedDaysToComplete: number | null;
  /** Daily average reviews */
  dailyAverageReviews: number;
  /** Total reviews all time */
  totalReviews: number;
}

export interface UseStatisticsProps {
  /** Raw progress history data */
  progressHistory?: ProgressDataPoint[];
  /** Study session records */
  studyDays?: StudyDay[];
  /** Current module info */
  currentModule?: {
    totalWords: number;
    masteredWords: number;
  };
}

/**
 * Hook for calculating and caching derived statistics.
 * Performs memoized calculations to avoid unnecessary recomputation.
 */
export function useStatistics({
  progressHistory = [],
  studyDays = [],
  currentModule,
}: UseStatisticsProps): DerivedStatistics {
  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (studyDays.length === 0) return 0;

    // Sort by date descending
    const sorted = [...studyDays].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const studyDate = new Date(sorted[i].date);
      studyDate.setHours(0, 0, 0, 0);

      // Expected date for this position in streak
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (studyDate.getTime() === expectedDate.getTime() && sorted[i].isStudied) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [studyDays]);

  // Calculate best streak
  const bestStreak = useMemo(() => {
    if (studyDays.length === 0) return 0;

    const sorted = [...studyDays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxStreak = 0;
    let currentRun = 0;
    let prevDate: Date | null = null;

    for (const day of sorted) {
      if (!day.isStudied) {
        currentRun = 0;
        prevDate = null;
        continue;
      }

      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);

      if (prevDate === null) {
        currentRun = 1;
      } else {
        const dayDiff = (dayDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dayDiff === 1) {
          currentRun++;
        } else {
          currentRun = 1;
        }
      }

      maxStreak = Math.max(maxStreak, currentRun);
      prevDate = dayDate;
    }

    return maxStreak;
  }, [studyDays]);

  // Calculate average accuracy
  const averageAccuracy = useMemo(() => {
    if (progressHistory.length === 0) return 0;

    const totalAccuracy = progressHistory.reduce((sum, day) => sum + day.accuracy, 0);
    return Math.round(totalAccuracy / progressHistory.length);
  }, [progressHistory]);

  // Calculate reviews today
  const reviewsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = progressHistory.find((day) => day.date === today);
    return todayData?.reviewsCompleted || 0;
  }, [progressHistory]);

  // Get recent progress history (last 30 days)
  const recentHistory = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return progressHistory
      .filter((day) => new Date(day.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [progressHistory]);

  // Calculate total words learned
  const totalWords = useMemo(() => {
    if (progressHistory.length === 0) return 0;
    const latest = progressHistory[progressHistory.length - 1];
    return latest?.wordsLearned || 0;
  }, [progressHistory]);

  // Calculate estimated days to complete
  const estimatedDaysToComplete = useMemo(() => {
    if (!currentModule || progressHistory.length < 7) return null;

    const { totalWords: moduleTotal, masteredWords } = currentModule;
    const remaining = moduleTotal - masteredWords;

    if (remaining <= 0) return 0;

    // Calculate average words learned per day over last 7 days
    const recentDays = progressHistory.slice(-7);
    if (recentDays.length < 2) return null;

    const oldestRecent = recentDays[0];
    const newestRecent = recentDays[recentDays.length - 1];

    const wordsGained = newestRecent.wordsLearned - oldestRecent.wordsLearned;
    const daysSpan = recentDays.length;

    const avgWordsPerDay = wordsGained / daysSpan;

    if (avgWordsPerDay <= 0) return null;

    return Math.ceil(remaining / avgWordsPerDay);
  }, [currentModule, progressHistory]);

  // Calculate daily average reviews
  const dailyAverageReviews = useMemo(() => {
    if (progressHistory.length === 0) return 0;

    const totalReviews = progressHistory.reduce((sum, day) => sum + day.reviewsCompleted, 0);
    return Math.round(totalReviews / progressHistory.length);
  }, [progressHistory]);

  // Calculate total reviews
  const totalReviews = useMemo(() => {
    return progressHistory.reduce((sum, day) => sum + day.reviewsCompleted, 0);
  }, [progressHistory]);

  // Fill in study days for last 90 days (for calendar visualization)
  const studyDaysWithBlanks = useMemo(() => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const dayMap = new Map<string, StudyDay>();
    studyDays.forEach((day) => {
      dayMap.set(day.date, day);
    });

    const result: StudyDay[] = [];
    const current = new Date(ninetyDaysAgo);
    const today = new Date();

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const existingDay = dayMap.get(dateStr);

      result.push(
        existingDay || {
          date: dateStr,
          reviewCount: 0,
          isStudied: false,
        }
      );

      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [studyDays]);

  return {
    totalWords,
    currentStreak,
    bestStreak,
    averageAccuracy,
    reviewsToday,
    progressHistory: recentHistory,
    studyDays: studyDaysWithBlanks,
    estimatedDaysToComplete,
    dailyAverageReviews,
    totalReviews,
  };
}
