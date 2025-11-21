import React, { useState, useEffect } from 'react';
import { ModuleCard } from './ModuleCard';
import { StatsPanel } from './StatsPanel';
import { QuickStart } from './QuickStart';

export interface ModuleInfo {
  moduleId: string;
  title: string;
  description?: string;
  progress: number;
  dueCount: number;
  totalEntries: number;
  imageUrl?: string;
}

export interface DashboardStats {
  wordsLearned: number;
  streak: number;
  reviewsToday: number;
  accuracy: number;
}

export interface DashboardProps {
  /** Available modules */
  modules: ModuleInfo[];
  /** User statistics */
  stats: DashboardStats;
  /** Start study session callback */
  onStartStudy: (moduleId: string, cardLimit: number) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Main dashboard component with responsive grid layout.
 * Shows module cards, user stats, and quick start panel.
 */
export function Dashboard({
  modules,
  stats,
  onStartStudy,
  loading = false,
}: DashboardProps): JSX.Element {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Auto-select first module with due cards, or first module
  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      const moduleWithDue = modules.find((m) => m.dueCount > 0);
      setSelectedModuleId(moduleWithDue?.moduleId || modules[0].moduleId);
    }
  }, [modules, selectedModuleId]);

  const selectedModule = modules.find((m) => m.moduleId === selectedModuleId);

  const handleStartStudy = (cardLimit: number) => {
    if (selectedModuleId) {
      onStartStudy(selectedModuleId, cardLimit);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your progress and start learning
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Panel */}
        <section className="mb-8" aria-label="Learning statistics">
          <StatsPanel
            wordsLearned={stats.wordsLearned}
            streak={stats.streak}
            reviewsToday={stats.reviewsToday}
            accuracy={stats.accuracy}
          />
        </section>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Quick Start (mobile: top, desktop: left) */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="lg:sticky lg:top-6">
              <QuickStart
                selectedModule={selectedModule?.title || null}
                dueCount={selectedModule?.dueCount || 0}
                onStart={handleStartStudy}
                disabled={loading}
              />

              {/* Recent Activity (optional section for future) */}
              <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6 hidden lg:block">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats.reviewsToday > 0 ? (
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Completed {stats.reviewsToday} reviews today
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Keep up the great work!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        No reviews completed yet today
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Module Grid */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Modules
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select a module to start studying
              </p>
            </div>

            {modules.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No modules yet
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get started by importing your first vocabulary module
                </p>
                <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Import Module
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {modules.map((module) => (
                  <ModuleCard
                    key={module.moduleId}
                    moduleId={module.moduleId}
                    title={module.title}
                    description={module.description}
                    progress={module.progress}
                    dueCount={module.dueCount}
                    totalEntries={module.totalEntries}
                    imageUrl={module.imageUrl}
                    isSelected={module.moduleId === selectedModuleId}
                    onClick={() => setSelectedModuleId(module.moduleId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
