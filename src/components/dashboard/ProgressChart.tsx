import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ProgressDataPoint } from '../../hooks/useStatistics';

export interface ProgressChartProps {
  /** Progress data over time */
  data: ProgressDataPoint[];
  /** Estimated days to complete (for forecast) */
  estimatedDaysToComplete: number | null;
  /** Current total words learned */
  currentWordsLearned: number;
}

type ChartView = 'wordsLearned' | 'accuracy' | 'reviews';

/**
 * Progress chart component with multiple views and forecast.
 */
export function ProgressChart({
  data,
  estimatedDaysToComplete,
  currentWordsLearned,
}: ProgressChartProps): JSX.Element {
  const [view, setView] = useState<ChartView>('wordsLearned');

  // Generate forecast data
  const forecastData = React.useMemo(() => {
    if (!estimatedDaysToComplete || data.length === 0) return [];

    const lastDate = new Date(data[data.length - 1].date);
    const forecast: Array<{ date: string; wordsLearned: number; forecast: boolean }> = [];

    // Calculate daily growth rate from last 7 days
    const recentData = data.slice(-7);
    if (recentData.length < 2) return [];

    const oldestRecent = recentData[0];
    const newestRecent = recentData[recentData.length - 1];
    const dailyGrowth =
      (newestRecent.wordsLearned - oldestRecent.wordsLearned) / recentData.length;

    // Generate forecast points
    for (let i = 1; i <= Math.min(estimatedDaysToComplete, 30); i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        wordsLearned: Math.round(currentWordsLearned + dailyGrowth * i),
        forecast: true,
      });
    }

    return forecast;
  }, [data, estimatedDaysToComplete, currentWordsLearned]);

  // Combine actual and forecast data for words learned view
  const combinedData = React.useMemo(() => {
    if (view !== 'wordsLearned') return data;

    const actualData = data.map((d) => ({
      ...d,
      forecast: false,
    }));

    return [...actualData, ...forecastData];
  }, [data, forecastData, view]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-1">
          {new Date(data.date).toLocaleDateString()}
        </p>
        {view === 'wordsLearned' && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Words: </span>
            {data.wordsLearned}
            {data.forecast && <span className="text-blue-500 ml-1">(forecast)</span>}
          </p>
        )}
        {view === 'accuracy' && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Accuracy: </span>
            {data.accuracy}%
          </p>
        )}
        {view === 'reviews' && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Reviews: </span>
            {data.reviewsCompleted}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
      {/* Header with view selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">
          Progress Over Time
        </h3>

        <div className="flex space-x-2">
          <button
            onClick={() => setView('wordsLearned')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'wordsLearned'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Words Learned
          </button>
          <button
            onClick={() => setView('accuracy')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'accuracy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accuracy
          </button>
          <button
            onClick={() => setView('reviews')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="mt-2 text-sm">No progress data yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start studying to see your progress
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              {view === 'wordsLearned' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="wordsLearned"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  {forecastData.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey="wordsLearned"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      data={forecastData}
                    />
                  )}
                </>
              )}
              {view === 'accuracy' && (
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
              {view === 'reviews' && (
                <Line
                  type="monotone"
                  dataKey="reviewsCompleted"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Forecast info */}
      {view === 'wordsLearned' && estimatedDaysToComplete && forecastData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Forecast: </span>
            At your current pace, you'll complete this module in approximately{' '}
            <span className="font-semibold">{estimatedDaysToComplete} days</span>
          </p>
        </div>
      )}
    </div>
  );
}
