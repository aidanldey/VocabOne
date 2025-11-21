/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts
 */

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Global',
      items: [
        { key: '?', description: 'Show this help' },
        { key: ',', description: 'Open settings' },
        { key: 'H', description: 'Go to home' },
        { key: 'Esc', description: 'Close dialog' },
      ],
    },
    {
      category: 'Study Session',
      items: [
        { key: 'Space', description: 'Submit answer / Continue' },
        { key: 'Enter', description: 'Submit answer / Continue' },
        { key: '1', description: 'Rate: Again (completely forgot)' },
        { key: '2', description: 'Rate: Hard (barely remembered)' },
        { key: '3', description: 'Rate: Good (correct with effort)' },
        { key: '4', description: 'Rate: Easy (perfect recall)' },
        { key: 'H', description: 'Show hint (if available)' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { key: '←', description: 'Previous item' },
        { key: '→', description: 'Next item' },
        { key: 'Home', description: 'First item' },
        { key: 'End', description: 'Last item' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {shortcuts.map((section) => (
                <div key={section.category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700">{item.description}</span>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded font-mono text-sm shadow-sm">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can disable keyboard shortcuts in Settings if
                you prefer not to use them.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="btn-primary">
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
