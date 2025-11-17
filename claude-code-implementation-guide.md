# Claude Code Implementation Guide for Vocabulary Learning System

## Complete MVP Implementation in 10 Strategic Prompts

This guide provides exact Claude Code prompts to build your vocabulary learning system efficiently. Each prompt is designed to generate production-ready, maintainable code.

---

## 🎯 Pre-Implementation Setup

### Critical Decision: Technology Stack
**Recommended Stack for Maximum Efficiency:**
- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **State Management:** Zustand (simpler than Redux)
- **Data Persistence:** IndexedDB with Dexie.js
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel (zero-config deployment)

---

## 📝 The 10 Strategic Claude Code Prompts

### PROMPT 1: Project Foundation & Data Models
```markdown
Create a React TypeScript project using Vite for a vocabulary learning application with spaced repetition. 

Set up the following:

1. PROJECT STRUCTURE:
src/
  ├── components/
  │   ├── cards/
  │   ├── dashboard/
  │   ├── session/
  │   └── common/
  ├── services/
  │   ├── spacedRepetition/
  │   ├── storage/
  │   └── validation/
  ├── models/
  ├── hooks/
  ├── utils/
  └── store/

2. TYPESCRIPT INTERFACES in src/models/types.ts:
- Module (with metadata, entries, settings)
- VocabularyEntry (with id, term, cards array, progress)
- Card (base interface with type discriminated union for each card type)
- CardTypes: ImageCard, VideoCard, AudioCard, DefinitionCard, ClozeCard, TriviaCard
- UserProgress (interval, ease, repetitions, lastReview, nextReview)
- SessionState (current card, remaining cards, statistics)

3. INSTALL DEPENDENCIES:
- React 18, TypeScript, Vite
- Tailwind CSS with config
- Dexie for IndexedDB
- Zustand for state management
- date-fns for date handling
- fuse.js for fuzzy string matching

4. Create a working App.tsx with basic routing structure

Make sure all TypeScript types are comprehensive and well-documented with JSDoc comments.
```

### PROMPT 2: Spaced Repetition Engine
```markdown
Create a complete spaced repetition system in TypeScript implementing the SM-2 algorithm.

Requirements:

1. FILE: src/services/spacedRepetition/sm2Algorithm.ts
   - Implement SM-2 algorithm with these methods:
     - calculateInterval(n: number, ease: number, interval: number): number
     - calculateEase(ease: number, quality: number): number
     - processAnswer(card: CardProgress, quality: number): CardProgress
   - Quality scale: 0-5 (0=complete failure, 5=perfect recall)
   - Initial values: ease=2.5, interval=1, repetitions=0

2. FILE: src/services/spacedRepetition/scheduler.ts
   - getDueCards(entries: VocabularyEntry[]): VocabularyEntry[]
   - isCardDue(progress: UserProgress): boolean
   - getNextReviewDate(progress: UserProgress): Date
   - getDailyStats(entries: VocabularyEntry[]): DailyStats

3. FILE: src/services/spacedRepetition/cardSelector.ts
   - selectRandomCard(entry: VocabularyEntry): Card
   - Implement strategy pattern for future selection algorithms
   - Track last shown card to avoid immediate repeats

4. COMPREHENSIVE TESTS: src/services/spacedRepetition/__tests__/
   - Test edge cases (first review, consecutive failures, perfect streak)
   - Test interval progression over 30-day period
   - Test ease factor adjustments

Include detailed comments explaining the algorithm logic and provide example progressions.
```

### PROMPT 3: Storage Layer with IndexedDB
```markdown
Create a complete storage solution using Dexie.js for IndexedDB.

Requirements:

1. FILE: src/services/storage/database.ts
   - Define Dexie database schema with tables:
     - modules: id, metadata, entries, version, createdAt, updatedAt
     - progress: entryId, moduleId, interval, ease, repetitions, lastReview, nextReview
     - sessions: id, moduleId, startTime, endTime, cardsReviewed, accuracy
     - customizations: entryId, notes, customCards, mnemonics, tags
   
2. FILE: src/services/storage/moduleRepository.ts
   - Async CRUD operations:
     - importModule(moduleData: Module): Promise<Module>
     - getModule(id: string): Promise<Module>
     - getAllModules(): Promise<Module[]>
     - updateModule(id: string, updates: Partial<Module>): Promise<void>
     - deleteModule(id: string): Promise<void>
   
3. FILE: src/services/storage/progressRepository.ts
   - saveProgress(entryId: string, progress: UserProgress): Promise<void>
   - getProgress(moduleId: string): Promise<Map<string, UserProgress>>
   - resetProgress(moduleId: string): Promise<void>
   - exportProgress(): Promise<ProgressExport>

4. FILE: src/services/storage/migrations.ts
   - Version migration support
   - Data backup before migrations
   - Rollback capability

5. FILE: src/hooks/useStorage.ts
   - Custom React hooks for storage operations
   - Automatic error handling and loading states
   - Optimistic updates support

Include proper error handling, transaction support, and offline capability.
```

### PROMPT 4: Answer Validation System
```markdown
Create a sophisticated answer validation system with fuzzy matching.

Requirements:

1. FILE: src/services/validation/answerValidator.ts
   Main validation class with:
   - validateAnswer(userInput: string, expected: string, options?: ValidationOptions): ValidationResult
   - Multiple validation strategies:
     * Exact match (case-insensitive)
     * Alternative answers check
     * Fuzzy match with configurable threshold
     * Partial credit for close answers
   - Language-specific normalization (remove accents, handle special characters)
   - Common typo patterns detection

2. FILE: src/services/validation/fuzzyMatcher.ts
   - Implement Levenshtein distance algorithm
   - Character transposition detection
   - Keyboard distance consideration for typos
   - Phonetic matching for similar-sounding words

3. FILE: src/services/validation/languageProcessors.ts
   - Language-specific processors:
     * Spanish: handle ñ, accents, gender variations
     * French: handle accents, silent letters
     * German: handle umlauts, compound words
     * Chinese: pinyin validation
   - Extensible processor interface for new languages

4. FILE: src/services/validation/validationFeedback.ts
   - Generate helpful feedback based on error type:
     * "Close! Check your spelling"
     * "Right concept, wrong form"
     * "Remember the accent on the second syllable"
   - Confidence scores for partial credit

5. TESTS: Comprehensive test suite with real-world examples

Return ValidationResult with: isCorrect, confidence, feedback, corrections
```

### PROMPT 5: Card Presenter Components
```markdown
Create React components for presenting different card types with a unified interface.

Requirements:

1. FILE: src/components/cards/CardPresenter.tsx
   Main presenter component that:
   - Accepts any card type and renders appropriate sub-component
   - Handles card transitions with smooth animations (using Framer Motion)
   - Manages answer input and submission
   - Shows feedback after answer
   - Props: card, onAnswer, onSkip, showHint

2. FILE: src/components/cards/ImageCard.tsx
   - Lazy load images with blur-up effect
   - Support for multiple image formats
   - Pinch-to-zoom on mobile
   - Alt text for accessibility
   - Loading skeleton

3. FILE: src/components/cards/VideoCard.tsx
   - Custom video player with controls
   - Autoplay with muted start
   - Loop option for short clips
   - Playback speed control
   - Thumbnail preview

4. FILE: src/components/cards/AudioCard.tsx
   - Custom audio player with waveform visualization
   - Playback speed control
   - Replay button
   - Visual feedback during playback

5. FILE: src/components/cards/ClozeCard.tsx
   - Render sentence with blank
   - Multiple input handling for multiple blanks
   - Context highlighting
   - Hint system

6. FILE: src/components/cards/AnswerInput.tsx
   Shared input component with:
   - Auto-focus
   - Submit on Enter
   - Clear button
   - Character counter for long answers
   - Virtual keyboard support for special characters

Use Tailwind CSS for styling with mobile-first responsive design.
Include loading states, error boundaries, and accessibility features.
```

### PROMPT 6: Session Management & Flow
```markdown
Create a complete study session management system.

Requirements:

1. FILE: src/components/session/SessionManager.tsx
   Main session orchestrator:
   - Initialize session with selected module
   - Fetch due cards from scheduler
   - Manage session flow (present → answer → feedback → next)
   - Track session statistics
   - Handle session completion
   - Auto-save progress every 5 cards

2. FILE: src/components/session/SessionControls.tsx
   - Pause/Resume session
   - Skip card (with confirmation)
   - End session early
   - Settings access (audio on/off, hints on/off)
   - Progress indicator (cards remaining, time elapsed)

3. FILE: src/components/session/FeedbackDisplay.tsx
   - Show correct answer
   - Display user's answer with differences highlighted
   - Confidence score visualization
   - "Hard/Good/Easy" self-assessment buttons
   - Explanation or notes if available

4. FILE: src/components/session/SessionSummary.tsx
   Post-session summary screen:
   - Cards reviewed count
   - Accuracy percentage with trend
   - Streak information
   - Time spent
   - Experience points earned (gamification)
   - Next review preview
   - Share results option

5. FILE: src/store/sessionStore.ts
   Zustand store for session state:
   - Current session data
   - Statistics tracking
   - Undo/redo capability
   - Session history

6. FILE: src/hooks/useSession.ts
   Custom hook for session operations:
   - Start/pause/resume/end session
   - Submit answer
   - Skip card
   - Get session statistics

Include proper error recovery, offline support, and session restoration after app reload.
```

### PROMPT 7: Dashboard & Progress Tracking
```markdown
Create a comprehensive dashboard for progress tracking and statistics.

Requirements:

1. FILE: src/components/dashboard/Dashboard.tsx
   Main dashboard layout with:
   - Module selection cards
   - Quick stats summary
   - Start study button
   - Recent activity feed
   - Responsive grid layout

2. FILE: src/components/dashboard/ProgressChart.tsx
   - Interactive charts using Recharts:
     * Words learned over time (line chart)
     * Daily review count (bar chart)
     * Accuracy trend (area chart)
     * Retention heatmap (calendar view)
   - Time range selector (week/month/year/all-time)
   - Export chart as image

3. FILE: src/components/dashboard/ModuleCard.tsx
   - Module thumbnail and title
   - Progress bar (% mastered)
   - Due cards count badge
   - Last studied date
   - Quick actions (study, browse, settings)
   - Difficulty distribution visualization

4. FILE: src/components/dashboard/StreakTracker.tsx
   - Current streak display with fire emoji
   - Best streak record
   - Calendar view of study days
   - Streak freeze feature
   - Motivational messages

5. FILE: src/components/dashboard/LeaderBoard.tsx (optional gamification)
   - Weekly/monthly/all-time views
   - Points calculation system
   - Achievement badges
   - Friend comparisons (future feature)

6. FILE: src/services/statistics/statsCalculator.ts
   - Calculate comprehensive statistics:
     * Retention rate
     * Average ease factor
     * Study time analytics
     * Predicted mastery date
     * Learning velocity

Use Tailwind CSS with dark mode support.
Include data export functionality (CSV/JSON).
```

### PROMPT 8: Module Import/Export System
```markdown
Create a robust module management system for importing, validating, and exporting vocabulary modules.

Requirements:

1. FILE: src/components/modules/ModuleImporter.tsx
   - Drag-and-drop zone for JSON files
   - File picker fallback
   - Multi-file import support
   - Import progress indicator
   - Validation results display
   - Duplicate detection
   - Preview before import

2. FILE: src/services/modules/moduleValidator.ts
   - Validate against JSON schema
   - Check required fields
   - Verify media references
   - Validate card content completeness
   - Language code validation
   - Version compatibility check
   - Return detailed error messages with line numbers

3. FILE: src/services/modules/moduleParser.ts
   - Parse JSON with error recovery
   - Handle different schema versions
   - Migrate old formats automatically
   - Sanitize user input
   - Extract and validate media URLs
   - Generate missing IDs

4. FILE: src/components/modules/ModuleExporter.tsx
   - Export module with/without progress
   - Include/exclude custom additions
   - Bundle media files option (base64 encoding)
   - Compress large modules
   - Generate shareable link
   - QR code for mobile transfer

5. FILE: src/components/modules/ModuleBrowser.tsx
   - Grid/list view toggle
   - Search and filter:
     * By language
     * By domain
     * By difficulty
     * By author
   - Sort options (name, date, progress)
   - Bulk operations (delete, export, reset progress)

6. FILE: src/services/modules/sampleModules.ts
   - Generate sample modules for testing:
     * Basic Spanish Animals (10 words)
     * Medical Terminology (20 words)
     * Computer Science Terms (15 words)
   - Include all card types
   - Proper media references

Include comprehensive error handling and user feedback.
```

### PROMPT 9: User Settings & Preferences
```markdown
Create a settings system with user preferences and app configuration.

Requirements:

1. FILE: src/components/settings/SettingsPanel.tsx
   Tabbed interface with sections:
   - Learning preferences
   - App appearance  
   - Audio/video settings
   - Data management
   - About section

2. FILE: src/components/settings/LearningSettings.tsx
   - Daily goals:
     * New cards per day (slider: 5-50)
     * Review cards per day (slider: 20-200)
   - Session length preference
   - Spaced repetition algorithm choice
   - Card selection strategy
   - Answer strictness level
   - Hint availability
   - Auto-play media toggle

3. FILE: src/components/settings/AppearanceSettings.tsx
   - Theme selection (light/dark/auto)
   - Font size adjustment (small/medium/large)
   - Color scheme customization
   - Reduce animations toggle
   - High contrast mode
   - Language selection for UI

4. FILE: src/components/settings/MediaSettings.tsx
   - Audio autoplay toggle
   - Default volume level
   - Video quality preference
   - Subtitle preferences
   - Playback speed defaults
   - Download media for offline toggle

5. FILE: src/components/settings/DataSettings.tsx
   - Export all data (JSON)
   - Import data backup
   - Clear progress (with confirmation)
   - Clear cache
   - Storage usage display
   - Sync settings (future feature prep)

6. FILE: src/store/settingsStore.ts
   Zustand store for settings:
   - Persist to localStorage
   - Default values
   - Migration support
   - Export/import settings

7. FILE: src/hooks/useSettings.ts
   - Type-safe settings access
   - Update callbacks
   - Reset to defaults
   - Settings validation

Include settings sync across devices preparation (for future implementation).
```

### PROMPT 10: Testing, PWA & Deployment
```markdown
Create comprehensive testing, PWA configuration, and deployment setup.

Requirements:

1. FILE: src/__tests__/integration/userJourney.test.tsx
   Complete user journey tests:
   - Import module → start session → complete reviews → check progress
   - Test all card types
   - Test answer validation scenarios
   - Test progress persistence
   - Test offline functionality

2. FILE: src/__tests__/components/CardPresenter.test.tsx
   Component testing:
   - Render each card type
   - User interaction simulation
   - Accessibility testing
   - Responsive design testing
   - Error state handling

3. FILE: vite.config.ts with PWA plugin configuration:
   - Service worker with offline support
   - App manifest with icons
   - Cache strategies:
     * Cache-first for static assets
     * Network-first for API calls
     * Stale-while-revalidate for modules
   - Background sync for progress
   - Update prompt

4. FILE: public/manifest.json
   - App name and description
   - Icon sizes for all platforms
   - Theme colors
   - Display mode: standalone
   - Orientation: any
   - Categories: education

5. FILE: .github/workflows/deploy.yml
   GitHub Actions workflow:
   - Run tests on push
   - Build production bundle
   - Deploy to Vercel
   - Lighthouse CI checks
   - Bundle size monitoring

6. FILE: src/utils/errorBoundary.tsx
   Global error boundary:
   - Catch and log errors
   - User-friendly error display
   - Error recovery options
   - Send errors to logging service (prep)

7. FILE: src/utils/performance.ts
   Performance monitoring:
   - Web Vitals tracking
   - Custom performance marks
   - Memory usage monitoring
   - Report to analytics (prep)

8. FILE: playwright.config.ts
   E2E testing configuration:
   - Test on multiple browsers
   - Mobile viewport testing  
   - Visual regression testing
   - Accessibility audit

Include comprehensive documentation in README.md with setup instructions.
```

---

## 🚀 Implementation Strategy

### Week 1: Core Foundation
**Day 1-2:** Run Prompts 1-2 (Project setup & Spaced Repetition)
**Day 3:** Run Prompt 3 (Storage Layer)
**Day 4:** Run Prompt 4 (Answer Validation)
**Day 5:** Run Prompt 5 (Card Presenters)

### Week 2: User Experience
**Day 6-7:** Run Prompt 6 (Session Management)
**Day 8:** Run Prompt 7 (Dashboard)
**Day 9:** Run Prompt 8 (Module Import/Export)
**Day 10:** Run Prompt 9 (Settings)

### Week 3: Polish & Deploy
**Day 11-12:** Run Prompt 10 (Testing & PWA)
**Day 13:** Bug fixes and refinements
**Day 14:** Deploy and gather feedback

---

## 💡 Pro Tips for Claude Code

### 1. Iterative Refinement
After each prompt, review the code and ask for specific improvements:
```
"Add error handling to the moduleImporter component, specifically for malformed JSON and network failures"
```

### 2. Code Review Requests
```
"Review this spaced repetition implementation for potential bugs and suggest optimizations"
```

### 3. Documentation Generation
```
"Generate comprehensive JSDoc comments for all public methods in the storage service"
```

### 4. Test Generation
```
"Create unit tests for the answer validation service covering these edge cases: [list cases]"
```

### 5. Performance Optimization
```
"Optimize the CardPresenter component for better performance on mobile devices"
```

---

## 🎯 Success Metrics Tracking

### Code Quality Metrics
- TypeScript coverage: 100%
- Test coverage: >80%
- Bundle size: <500KB
- Lighthouse score: >90

### User Experience Metrics
- First contentful paint: <1.5s
- Time to interactive: <3s
- Card load time: <100ms
- Offline capability: 100%

---

## 🔧 Troubleshooting Common Issues

### Issue: Large bundle size
**Solution:** Implement code splitting
```
"Implement React lazy loading for the dashboard and settings components"
```

### Issue: Slow card rendering
**Solution:** Add virtualization
```
"Implement react-window for the module browser component to handle 1000+ modules"
```

### Issue: Memory leaks in session
**Solution:** Proper cleanup
```
"Add cleanup functions to all useEffect hooks in session components"
```

---

## 📚 Additional Resources

### Sample Data Generation
```
"Generate 3 complete vocabulary modules with 20 entries each:
1. Spanish food vocabulary with images
2. Medical terminology with definitions
3. Programming concepts with examples"
```

### UI Component Library
```
"Create a Storybook configuration with all card components showcased"
```

### API Documentation
```
"Generate OpenAPI specification for future backend API"
```

---

## Next Steps

1. Start with Prompt 1 to establish the foundation
2. Test each component thoroughly before moving to the next
3. Keep a development log of what works and what needs adjustment
4. Deploy early and often to get user feedback
5. Iterate based on real user behavior

Remember: The goal is a working MVP in 2 weeks, not perfection. Focus on core learning functionality first, polish later.
