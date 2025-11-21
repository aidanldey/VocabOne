/**
 * About Page
 * Information about VocabOne and how to use it
 */

export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About VocabOne</h1>
        <p className="text-xl text-gray-600">
          Master vocabulary through multi-modal spaced repetition learning
        </p>
      </div>

      {/* What is VocabOne */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What is VocabOne?</h2>
        <p className="text-gray-700 mb-4">
          VocabOne is an innovative vocabulary learning system that helps you master new
          words through multiple learning modes. Unlike traditional flashcards, VocabOne
          uses various card types to reinforce learning and prevent pattern memorization.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">
              🎴 Multi-Card Learning
            </h3>
            <p className="text-sm text-primary-800">
              Each word has multiple cards with different content types (images, audio,
              definitions) to reinforce learning from different angles
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🧠 Spaced Repetition</h3>
            <p className="text-sm text-blue-800">
              Uses the proven SM-2 algorithm to schedule reviews at optimal intervals for
              long-term retention
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">📊 Progress Tracking</h3>
            <p className="text-sm text-green-800">
              Monitor your learning journey with detailed statistics, streaks, and
              visualizations
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">📱 Progressive Web App</h3>
            <p className="text-sm text-purple-800">
              Works offline, installs like a native app, and syncs your progress across
              devices
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Import a Module</h3>
              <p className="text-gray-700">
                Start by importing a vocabulary module (JSON file) containing the words
                you want to learn. Modules can include various card types: images, audio,
                video, definitions, cloze deletions, and trivia.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Study Session</h3>
              <p className="text-gray-700">
                Begin a study session where you'll be presented with cards due for review.
                For each card, you'll see the content (image, audio, etc.) and need to
                recall the vocabulary term. Type your answer to test true recall.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Rate Your Recall</h3>
              <p className="text-gray-700">
                After submitting your answer, rate how well you remembered:
              </p>
              <ul className="mt-2 space-y-1 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <strong>Again:</strong> Couldn't recall at all
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <strong>Hard:</strong> Barely remembered
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <strong>Good:</strong> Correct with some effort
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Easy:</strong> Perfect recall
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Your Streak</h3>
              <p className="text-gray-700">
                The algorithm schedules your next review based on your performance. Keep
                studying daily to build your streak and achieve long-term retention!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Types */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Card Types</h2>
        <p className="text-gray-700 mb-4">
          VocabOne supports multiple card types to reinforce learning:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🖼️ Image Cards</h3>
            <p className="text-sm text-gray-600">
              Visual learning with images. See a picture and recall the vocabulary term.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔊 Audio Cards</h3>
            <p className="text-sm text-gray-600">
              Listen to pronunciation or sounds and identify the word.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🎥 Video Cards</h3>
            <p className="text-sm text-gray-600">
              Watch short video clips showing actions or concepts in context.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">📖 Definition Cards</h3>
            <p className="text-sm text-gray-600">
              Read definitions or descriptions and recall the vocabulary term.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">✏️ Cloze Cards</h3>
            <p className="text-sm text-gray-600">
              Fill in the blank in a sentence to test contextual understanding.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Trivia Cards</h3>
            <p className="text-sm text-gray-600">
              Interesting facts and cultural context to make learning memorable.
            </p>
          </div>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tips for Success</h2>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">✓</span>
            <p className="text-gray-700">
              <strong>Study daily:</strong> Even 10-15 minutes per day is more effective
              than longer, infrequent sessions
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">✓</span>
            <p className="text-gray-700">
              <strong>Be honest with ratings:</strong> Rating cards honestly helps the
              algorithm schedule reviews optimally
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">✓</span>
            <p className="text-gray-700">
              <strong>Type answers:</strong> Typing forces active recall, which is more
              effective than recognition
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">✓</span>
            <p className="text-gray-700">
              <strong>Build streaks:</strong> Consistency is key to long-term retention
            </p>
          </li>
          <li className="flex gap-3">
            <span className="text-primary-600 font-bold">✓</span>
            <p className="text-gray-700">
              <strong>Use keyboard shortcuts:</strong> Enable shortcuts in settings for
              faster review (Space, Enter, 1-4 for ratings)
            </p>
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600">
              How does spaced repetition work?
            </summary>
            <p className="mt-2 text-gray-700 ml-4">
              Spaced repetition is a learning technique that increases intervals between
              reviews of learned material. VocabOne uses the SM-2 algorithm, which
              schedules reviews based on your performance. Cards you struggle with appear
              more frequently, while cards you know well appear less often.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600">
              Can I use VocabOne offline?
            </summary>
            <p className="mt-2 text-gray-700 ml-4">
              Yes! VocabOne is a Progressive Web App that works offline. Your previously
              loaded modules and progress are cached locally. You can study anytime,
              anywhere, even without an internet connection.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600">
              How do I create my own modules?
            </summary>
            <p className="mt-2 text-gray-700 ml-4">
              Modules are JSON files that follow a specific schema. You can create your
              own modules using a text editor. Check the documentation for the complete
              module schema and examples.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600">
              What happens if I miss a day?
            </summary>
            <p className="mt-2 text-gray-700 ml-4">
              Your streak will reset, but your learning progress remains intact. Cards due
              for review will accumulate, and you can catch up at your own pace. Don't
              worry—missing a day doesn't erase your knowledge!
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600">
              Can I export my progress?
            </summary>
            <p className="mt-2 text-gray-700 ml-4">
              Yes! You can export individual modules with your progress included from the
              Module Manager. This allows you to back up your data or share modules with
              others.
            </p>
          </details>
        </div>
      </section>

      {/* Get Started */}
      <div className="card bg-primary-50 border border-primary-200">
        <h2 className="text-2xl font-bold text-primary-900 mb-4">Ready to Start?</h2>
        <p className="text-primary-800 mb-6">
          Begin your vocabulary learning journey today. Import a module and start your
          first study session!
        </p>
        <div className="flex gap-3">
          <a href="/import" className="btn-primary">
            Import Module
          </a>
          <a href="/" className="btn-secondary">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
