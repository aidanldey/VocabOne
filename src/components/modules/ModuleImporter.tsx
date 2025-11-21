/**
 * ModuleImporter component for importing and validating vocabulary modules.
 * Supports drag-and-drop, file picker, validation, preview, and feedback.
 */

import React from 'react';
import type { VocabularyModule } from '../../models/types';
import {
  validateModule,
  calculateModuleStats,
  generateSampleModule,
  type ValidationError,
  type ModuleStats,
} from '../../utils/moduleValidator';

export interface ModuleImporterProps {
  /** Callback when module is successfully imported */
  onImportSuccess: (module: VocabularyModule) => void;
  /** Optional callback when import is cancelled */
  onCancel?: () => void;
  /** Optional CSS classes */
  className?: string;
}

type ImportStage = 'upload' | 'validating' | 'preview' | 'success' | 'error';

interface ImportState {
  stage: ImportStage;
  file: File | null;
  module: VocabularyModule | null;
  stats: ModuleStats | null;
  errors: ValidationError[];
  warnings: ValidationError[];
  isDragging: boolean;
}

export function ModuleImporter({ onImportSuccess, onCancel, className = '' }: ModuleImporterProps) {
  const [state, setState] = React.useState<ImportState>({
    stage: 'upload',
    file: null,
    module: null,
    stats: null,
    errors: [],
    warnings: [],
    isDragging: false,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: false }));

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find((file) => file.name.endsWith('.json'));

    if (jsonFile) {
      processFile(jsonFile);
    } else {
      setState((prev) => ({
        ...prev,
        stage: 'error',
        errors: [{ field: 'file', message: 'Please drop a JSON file' }],
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process the selected file
  const processFile = async (file: File) => {
    setState((prev) => ({
      ...prev,
      stage: 'validating',
      file,
      errors: [],
      warnings: [],
    }));

    try {
      const text = await file.text();
      let jsonData: unknown;

      try {
        jsonData = JSON.parse(text);
      } catch (parseError) {
        setState((prev) => ({
          ...prev,
          stage: 'error',
          errors: [
            {
              field: 'json',
              message: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            },
          ],
        }));
        return;
      }

      // Validate the module
      const validationResult = validateModule(jsonData);

      if (validationResult.isValid && validationResult.module) {
        const stats = calculateModuleStats(validationResult.module);
        setState((prev) => ({
          ...prev,
          stage: 'preview',
          module: validationResult.module!,
          stats,
          warnings: validationResult.warnings || [],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          stage: 'error',
          errors: validationResult.errors,
          warnings: validationResult.warnings || [],
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        stage: 'error',
        errors: [
          {
            field: 'file',
            message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }));
    }
  };

  // Handle import confirmation
  const handleConfirmImport = () => {
    if (state.module) {
      setState((prev) => ({ ...prev, stage: 'success' }));
      onImportSuccess(state.module);
    }
  };

  // Handle starting over
  const handleReset = () => {
    setState({
      stage: 'upload',
      file: null,
      module: null,
      stats: null,
      errors: [],
      warnings: [],
      isDragging: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sample module
  const handleDownloadSample = () => {
    const sample = generateSampleModule();
    const blob = new Blob([sample], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-module.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`module-importer ${className}`}>
      {/* Upload Stage */}
      {state.stage === 'upload' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Vocabulary Module</h2>
            <p className="text-gray-600">
              Upload a JSON file containing your vocabulary module
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              state.isDragging
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {state.isDragging ? 'Drop file here' : 'Drag and drop your JSON file'}
                </p>
                <p className="text-sm text-gray-500">or</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Choose File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Sample Download */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-gray-600">Need a template?</span>
            <button
              onClick={handleDownloadSample}
              className="text-orange-500 hover:text-orange-600 font-medium underline"
            >
              Download sample format
            </button>
          </div>

          {onCancel && (
            <div className="flex justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validating Stage */}
      {state.stage === 'validating' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Validating module...</h3>
          <p className="text-gray-600">Checking module structure and content</p>
        </div>
      )}

      {/* Preview Stage */}
      {state.stage === 'preview' && state.module && state.stats && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Module Preview</h2>
            <p className="text-gray-600">Review the module details before importing</p>
          </div>

          {/* Warnings */}
          {state.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 mb-1">Warnings</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {state.warnings.map((warning, index) => (
                      <li key={index}>
                        <span className="font-medium">{warning.field}:</span> {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Module Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{state.module.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Module ID: {state.module.moduleId} • Version: {state.module.version} • Language:{' '}
                {state.module.language.toUpperCase()}
              </p>
              {state.module.description && (
                <p className="text-gray-700 mt-2">{state.module.description}</p>
              )}
              {state.module.author && (
                <p className="text-sm text-gray-600 mt-1">Author: {state.module.author}</p>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-2xl font-bold text-gray-900">{state.stats.totalEntries}</p>
                <p className="text-sm text-gray-600">Vocabulary Entries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{state.stats.totalCards}</p>
                <p className="text-sm text-gray-600">Total Cards</p>
              </div>
            </div>

            {/* Card Type Distribution */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Card Types</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(state.stats.cardTypeDistribution).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm capitalize text-gray-700">{type}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Average cards per entry:{' '}
                <span className="font-medium text-gray-900">
                  {state.stats.averageCardsPerEntry.toFixed(1)}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Confirm Import
            </button>
          </div>
        </div>
      )}

      {/* Success Stage */}
      {state.stage === 'success' && state.module && (
        <div className="text-center py-12 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Module Imported Successfully!</h3>
            <p className="text-gray-600">
              <span className="font-medium">{state.module.title}</span> has been added to your
              library
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Import Another Module
          </button>
        </div>
      )}

      {/* Error Stage */}
      {state.stage === 'error' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Failed</h3>
            <p className="text-gray-600">Please fix the following errors and try again</p>
          </div>

          {/* Error List */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-3">
              {state.errors.map((error, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{error.field}</p>
                    <p className="text-sm text-red-800">{error.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Need help?</h4>
            <p className="text-sm text-blue-800 mb-3">
              Download a sample module template to see the correct format:
            </p>
            <button
              onClick={handleDownloadSample}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Download Sample Module
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Try Again
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
