function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VocabOne
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master vocabulary through multi-modal spaced repetition learning
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="card text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-primary-600"
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to VocabOne
              </h2>
              <p className="text-gray-600 mb-6">
                Your journey to vocabulary mastery begins here. Learn through
                images, videos, audio, definitions, and more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">
                  Multi-Card Learning
                </h3>
                <p className="text-sm text-gray-600">
                  Multiple cards per term prevent pattern memorization
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">
                  Spaced Repetition
                </h3>
                <p className="text-sm text-gray-600">
                  SM-2 algorithm optimizes your review schedule
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">
                  Progress Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Monitor your learning journey with detailed stats
                </p>
              </div>
            </div>

            <div className="space-x-4">
              <button className="btn-primary">Import Module</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              VocabOne v0.1.0 - Pre-Alpha | Built with React + TypeScript +
              Vite
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
