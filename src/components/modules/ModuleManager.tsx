/**
 * ModuleManager component for managing vocabulary modules.
 * Displays modules in list or grid view with search, filter, and sort capabilities.
 */

import React from 'react';
import type { VocabularyModule } from '../../models/types';
import { downloadModuleAsJSON, type ExportOptions } from '../../services/modules/moduleExporter';

export interface ModuleWithProgress extends VocabularyModule {
  /** Progress statistics for display */
  stats?: {
    totalWords: number;
    masteredWords: number;
    progressPercentage: number;
    lastStudied?: string;
  };
}

export interface ModuleManagerProps {
  /** List of modules to display */
  modules: ModuleWithProgress[];
  /** Callback when user wants to import a module */
  onImport?: () => void;
  /** Callback when user wants to delete a module */
  onDelete?: (moduleId: string) => void;
  /** Callback when user wants to reset progress */
  onResetProgress?: (moduleId: string) => void;
  /** Callback when user wants to view module details */
  onViewDetails?: (moduleId: string) => void;
  /** Callback when user wants to study a module */
  onStudy?: (moduleId: string) => void;
  /** Optional CSS classes */
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'progress' | 'date' | 'language';

export function ModuleManager({
  modules,
  onImport,
  onDelete,
  onResetProgress,
  onViewDetails,
  onStudy,
  className = '',
}: ModuleManagerProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [languageFilter, setLanguageFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('name');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = React.useState<string | null>(null);
  const [exportOptions, setExportOptions] = React.useState<ExportOptions>({
    includeProgress: false,
    includeCustomCards: false,
    includeNotes: false,
  });

  // Get unique languages for filter
  const languages = React.useMemo(() => {
    const uniqueLanguages = new Set(modules.map((m) => m.language));
    return Array.from(uniqueLanguages).sort();
  }, [modules]);

  // Filter and sort modules
  const filteredModules = React.useMemo(() => {
    let result = modules;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (module) =>
          module.title.toLowerCase().includes(query) ||
          module.moduleId.toLowerCase().includes(query) ||
          module.description?.toLowerCase().includes(query)
      );
    }

    // Apply language filter
    if (languageFilter !== 'all') {
      result = result.filter((module) => module.language === languageFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'progress':
          return (b.stats?.progressPercentage || 0) - (a.stats?.progressPercentage || 0);
        case 'date':
          return (
            new Date(b.updatedAt || b.createdAt || 0).getTime() -
            new Date(a.updatedAt || a.createdAt || 0).getTime()
          );
        case 'language':
          return a.language.localeCompare(b.language);
        default:
          return 0;
      }
    });

    return result;
  }, [modules, searchQuery, languageFilter, sortBy]);

  // Handle export
  const handleExport = (module: VocabularyModule) => {
    const result = downloadModuleAsJSON(module, exportOptions);
    if (result.success) {
      setShowExportOptions(null);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (moduleId: string) => {
    setShowDeleteConfirm(moduleId);
  };

  const handleDeleteConfirm = (moduleId: string) => {
    onDelete?.(moduleId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className={`module-manager ${className}`}>
      {/* Empty State */}
      {modules.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Modules Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started by importing a vocabulary module. You can create your own or download sample
            modules to begin learning.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {onImport && (
              <button
                onClick={onImport}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Import Module
              </button>
            )}
            <a
              href="https://github.com/vocabone/sample-modules"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Browse Sample Modules
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Header Controls */}
          <div className="mb-6 space-y-4">
            {/* Search and Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Import Button */}
              {onImport && (
                <button
                  onClick={onImport}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium whitespace-nowrap"
                >
                  Import Module
                </button>
              )}
            </div>

            {/* Filters and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Language Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="language-filter" className="text-sm font-medium text-gray-700">
                  Language:
                </label>
                <select
                  id="language-filter"
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="name">Name</option>
                  <option value="progress">Progress</option>
                  <option value="date">Date Modified</option>
                  <option value="language">Language</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 ml-auto">
                {filteredModules.length} of {modules.length} module{modules.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* No Results */}
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No modules match your search criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLanguageFilter('all');
                }}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModules.map((module) => (
                    <ModuleCard
                      key={module.moduleId}
                      module={module}
                      onDelete={() => handleDeleteClick(module.moduleId)}
                      onExport={() => setShowExportOptions(module.moduleId)}
                      onResetProgress={() => onResetProgress?.(module.moduleId)}
                      onViewDetails={() => onViewDetails?.(module.moduleId)}
                      onStudy={() => onStudy?.(module.moduleId)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {filteredModules.map((module) => (
                    <ModuleListItem
                      key={module.moduleId}
                      module={module}
                      onDelete={() => handleDeleteClick(module.moduleId)}
                      onExport={() => setShowExportOptions(module.moduleId)}
                      onResetProgress={() => onResetProgress?.(module.moduleId)}
                      onViewDetails={() => onViewDetails?.(module.moduleId)}
                      onStudy={() => onStudy?.(module.moduleId)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Module?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this module? This action cannot be undone and all
              progress will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>

            <div className="space-y-3 mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeProgress}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, includeProgress: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-gray-700">Include progress data</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCustomCards}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, includeCustomCards: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-gray-700">Include custom cards</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeNotes}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, includeNotes: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-gray-700">Include notes</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportOptions(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const module = modules.find((m) => m.moduleId === showExportOptions);
                  if (module) handleExport(module);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Module Card Component for Grid View
interface ModuleCardProps {
  module: ModuleWithProgress;
  onDelete: () => void;
  onExport: () => void;
  onResetProgress?: () => void;
  onViewDetails?: () => void;
  onStudy?: () => void;
}

function ModuleCard({
  module,
  onDelete,
  onExport,
  onResetProgress,
  onViewDetails,
  onStudy,
}: ModuleCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow relative">
      {/* Actions Dropdown */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {showActions && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
            {onViewDetails && (
              <button
                onClick={() => {
                  onViewDetails();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
            )}
            <button
              onClick={() => {
                onExport();
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export
            </button>
            {onResetProgress && (
              <button
                onClick={() => {
                  onResetProgress();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Reset Progress
              </button>
            )}
            <button
              onClick={() => {
                onDelete();
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Module Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded uppercase">
            {module.language}
          </span>
        </div>
        {module.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      {module.stats && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{module.stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${module.stats.progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {module.stats.masteredWords} / {module.stats.totalWords} words
            </span>
            {module.stats.lastStudied && <span>Last: {module.stats.lastStudied}</span>}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">{module.entries.length}</span> entries
        </div>
        <div>
          <span className="font-medium">
            {module.entries.reduce((sum, e) => sum + e.cards.length, 0)}
          </span>{' '}
          cards
        </div>
      </div>

      {/* Study Button */}
      {onStudy && (
        <button
          onClick={onStudy}
          className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Study Now
        </button>
      )}
    </div>
  );
}

// Module List Item Component for List View
function ModuleListItem({
  module,
  onDelete,
  onExport,
  onResetProgress,
  onViewDetails,
  onStudy,
}: ModuleCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4">
      {/* Module Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{module.title}</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded uppercase flex-shrink-0">
            {module.language}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{module.entries.length} entries</span>
          <span>{module.entries.reduce((sum, e) => sum + e.cards.length, 0)} cards</span>
          {module.stats && (
            <span>
              {module.stats.masteredWords} / {module.stats.totalWords} mastered
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      {module.stats && (
        <div className="hidden md:block w-48">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${module.stats.progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {module.stats.progressPercentage}%
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onStudy && (
          <button
            onClick={onStudy}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Study
          </button>
        )}

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              {onViewDetails && (
                <button
                  onClick={() => {
                    onViewDetails();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Details
                </button>
              )}
              <button
                onClick={() => {
                  onExport();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Export
              </button>
              {onResetProgress && (
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Reset Progress
                </button>
              )}
              <button
                onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
