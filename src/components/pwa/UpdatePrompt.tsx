/**
 * UpdatePrompt component for PWA updates.
 * Notifies users when a new version is available and provides option to update.
 */

import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 m-4 z-50">
      <div className="bg-white border-2 border-orange-500 rounded-lg shadow-lg p-4 max-w-sm">
        {offlineReady && !needRefresh && (
          <div>
            <div className="flex items-start space-x-3 mb-3">
              <svg
                className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">App ready for offline use</h3>
                <p className="text-sm text-gray-600">
                  You can now use VocabMaster without an internet connection.
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {needRefresh && (
          <div>
            <div className="flex items-start space-x-3 mb-3">
              <svg
                className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Update Available</h3>
                <p className="text-sm text-gray-600">
                  A new version of VocabMaster is available. Reload to get the latest features
                  and improvements.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={close}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                Reload Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
