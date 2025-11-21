import React from 'react';
import type { StudyDay } from '../../hooks/useStatistics';

export interface StreakTrackerProps {
  /** Current consecutive study days */
  currentStreak: number;
  /** Best streak ever achieved */
  bestStreak: number;
  /** Study days for calendar (should include last 90 days) */
  studyDays: StudyDay[];
}

/**
 * Streak tracker with current streak, best streak, and calendar heatmap.
 */
export function StreakTracker({
  currentStreak,
  bestStreak,
  studyDays,
}: StreakTrackerProps): JSX.Element {
  // Get color for a study day based on review count
  const getDayColor = (day: StudyDay): string => {
    if (!day.isStudied) return 'bg-gray-100';

    const { reviewCount } = day;
    if (reviewCount >= 50) return 'bg-orange-500';
    if (reviewCount >= 30) return 'bg-orange-400';
    if (reviewCount >= 15) return 'bg-orange-300';
    if (reviewCount >= 5) return 'bg-orange-200';
    return 'bg-orange-100';
  };

  // Group days by week for calendar layout
  const weeklyData = React.useMemo(() => {
    const weeks: StudyDay[][] = [];
    let currentWeek: StudyDay[] = [];

    // Get day of week for first day (0 = Sunday)
    const firstDay = studyDays[0];
    if (firstDay) {
      const firstDayOfWeek = new Date(firstDay.date).getDay();

      // Add empty days to align first week
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({
          date: '',
          reviewCount: 0,
          isStudied: false,
        });
      }
    }

    studyDays.forEach((day, index) => {
      currentWeek.push(day);

      // Start new week on Sunday (or at end)
      const dayOfWeek = new Date(day.date).getDay();
      if (dayOfWeek === 6 || index === studyDays.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  }, [studyDays]);

  // Get month labels for calendar
  const monthLabels = React.useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    let lastMonth = -1;

    studyDays.forEach((day, index) => {
      const date = new Date(day.date);
      const month = date.getMonth();

      if (month !== lastMonth) {
        const weekIndex = Math.floor(index / 7);
        labels.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [studyDays]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Streak</h3>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl">🔥</span>
          </div>
          <p className="text-center text-2xl font-bold text-orange-600">
            {currentStreak}
          </p>
          <p className="text-center text-sm text-gray-600 mt-1">Current Streak</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-10 h-10 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <p className="text-center text-2xl font-bold text-gray-700">
            {bestStreak}
          </p>
          <p className="text-center text-sm text-gray-600 mt-1">Best Streak</p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Last 90 Days</p>

        {studyDays.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No study history yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start studying to build your streak!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Month labels */}
              <div className="flex mb-1">
                <div className="w-8"></div>
                <div className="flex-1 relative" style={{ height: '16px' }}>
                  {monthLabels.map((label, index) => (
                    <span
                      key={index}
                      className="absolute text-xs text-gray-600"
                      style={{ left: `${(label.weekIndex * 100) / weeklyData.length}%` }}
                    >
                      {label.month}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day labels + Calendar grid */}
              <div className="flex">
                {/* Day of week labels */}
                <div className="flex flex-col justify-around w-8 text-xs text-gray-600 pr-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Calendar grid */}
                <div className="flex-1">
                  <div className="flex gap-1">
                    {weeklyData.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const day = week[dayIndex];
                          if (!day || !day.date) {
                            return (
                              <div
                                key={dayIndex}
                                className="w-3 h-3 bg-transparent"
                              />
                            );
                          }

                          return (
                            <div
                              key={dayIndex}
                              className={`w-3 h-3 rounded-sm ${getDayColor(day)} transition-colors hover:ring-2 hover:ring-gray-400 cursor-pointer`}
                              title={`${new Date(day.date).toLocaleDateString()}: ${
                                day.isStudied
                                  ? `${day.reviewCount} reviews`
                                  : 'No study'
                              }`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end mt-3 text-xs text-gray-600">
                <span className="mr-2">Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100" title="No activity" />
                  <div className="w-3 h-3 rounded-sm bg-orange-100" title="1-4 reviews" />
                  <div className="w-3 h-3 rounded-sm bg-orange-200" title="5-14 reviews" />
                  <div className="w-3 h-3 rounded-sm bg-orange-300" title="15-29 reviews" />
                  <div className="w-3 h-3 rounded-sm bg-orange-400" title="30-49 reviews" />
                  <div className="w-3 h-3 rounded-sm bg-orange-500" title="50+ reviews" />
                </div>
                <span className="ml-2">More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Motivational message */}
      {currentStreak > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-800">
            {currentStreak === 1 && "Great start! Keep going to build your streak 🎯"}
            {currentStreak >= 2 && currentStreak < 7 && "Nice! You're on a roll 🚀"}
            {currentStreak >= 7 && currentStreak < 30 && "Impressive streak! Keep it up 🌟"}
            {currentStreak >= 30 && currentStreak < 100 && "Amazing dedication! You're crushing it 💪"}
            {currentStreak >= 100 && "Legendary streak! You're an inspiration 👑"}
          </p>
        </div>
      )}
    </div>
  );
}
