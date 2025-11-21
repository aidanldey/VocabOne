import React from 'react';

export interface StatsPanelProps {
  /** Total words learned (marked as learned in progress) */
  wordsLearned: number;
  /** Current streak in days */
  streak: number;
  /** Reviews completed today */
  reviewsToday: number;
  /** Accuracy percentage (0-100) */
  accuracy: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, color }: StatCardProps): JSX.Element {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats panel component displaying user learning statistics.
 */
export function StatsPanel({
  wordsLearned,
  streak,
  reviewsToday,
  accuracy,
}: StatsPanelProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Words Learned */}
      <StatCard
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        }
        label="Words Learned"
        value={wordsLearned}
        color="blue"
      />

      {/* Streak */}
      <StatCard
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
            />
          </svg>
        }
        label="Day Streak"
        value={streak}
        color="orange"
      />

      {/* Reviews Today */}
      <StatCard
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        label="Today's Reviews"
        value={reviewsToday}
        color="green"
      />

      {/* Accuracy */}
      <StatCard
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
        label="Accuracy"
        value={`${accuracy}%`}
        color="purple"
      />
    </div>
  );
}
