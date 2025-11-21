/**
 * Settings Component
 * Application settings and preferences
 */

import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useProgressStore } from '@/store/progressStore';

export function Settings() {
  const {
    dailyGoal,
    autoAdvanceCards,
    theme,
    soundEffects,
    keyboardShortcuts,
    setDailyGoal,
    setAutoAdvanceCards,
    setTheme,
    setSoundEffects,
    setKeyboardShortcuts,
    resetSettings,
  } = useSettingsStore();

  const { clearAllProgress } = useProgressStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  const handleResetSettings = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  const handleClearAllData = () => {
    clearAllProgress();
    setShowClearDataConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Learning Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning</h2>

          {/* Daily Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Goal (cards per day)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <input
                type="number"
                min="5"
                max="500"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Set your daily learning target. Recommended: 20-50 cards per day.
            </p>
          </div>

          {/* Auto-advance Cards */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Auto-advance Cards</h3>
              <p className="text-sm text-gray-600">
                Automatically show the next card after answering
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoAdvanceCards(!autoAdvanceCards)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoAdvanceCards ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoAdvanceCards ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appearance</h2>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setTheme(themeOption)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === themeOption
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {themeOption === 'light' && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    )}
                    {themeOption === 'dark' && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    )}
                    {themeOption === 'system' && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-medium capitalize">{themeOption}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Audio & Interaction */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Audio & Interaction</h2>

          <div className="space-y-3">
            {/* Sound Effects */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Sound Effects</h3>
                <p className="text-sm text-gray-600">
                  Play sounds for correct/incorrect answers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSoundEffects(!soundEffects)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEffects ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEffects ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Keyboard Shortcuts</h3>
                <p className="text-sm text-gray-600">
                  Use spacebar, arrow keys, and number keys
                </p>
              </div>
              <button
                type="button"
                onClick={() => setKeyboardShortcuts(!keyboardShortcuts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  keyboardShortcuts ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    keyboardShortcuts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>

          <div className="space-y-4">
            {/* Reset Settings */}
            <div className="p-4 border border-gray-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">Reset Settings</h3>
                  <p className="text-sm text-gray-600">
                    Restore all settings to default values
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reset Settings
                </button>
              </div>

              {showResetConfirm && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    Are you sure? This will reset all settings to default values.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetSettings}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Yes, Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear All Progress */}
            <div className="p-4 border border-red-300 rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-red-900">Clear All Progress</h3>
                  <p className="text-sm text-red-700">
                    Permanently delete all learning progress and data
                  </p>
                </div>
                <button
                  onClick={() => setShowClearDataConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Data
                </button>
              </div>

              {showClearDataConfirm && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-900 mb-3 font-medium">
                    ⚠️ Warning: This action cannot be undone! All your learning progress,
                    streaks, and statistics will be permanently deleted.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAllData}
                      className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
                    >
                      Yes, Delete Everything
                    </button>
                    <button
                      onClick={() => setShowClearDataConfirm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts Reference */}
        {keyboardShortcuts && (
          <section className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Spacebar:</span>
                <span className="text-blue-600 font-mono">Submit/Continue</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Enter:</span>
                <span className="text-blue-600 font-mono">Submit/Continue</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">1-4:</span>
                <span className="text-blue-600 font-mono">Select quality</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Esc:</span>
                <span className="text-blue-600 font-mono">Close dialog</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">←/→:</span>
                <span className="text-blue-600 font-mono">Navigate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">?:</span>
                <span className="text-blue-600 font-mono">Show shortcuts</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
