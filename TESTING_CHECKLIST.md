# VocabOne Automated Testing Checklist

## Test Coverage Goals
- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between components and services
- **E2E Tests**: Test complete user workflows
- **Target Coverage**: 80%+ for critical paths

---

## Critical Path Tests

### 1. Module Import ✓
- [ ] Import valid JSON module
- [ ] Validate module schema
- [ ] Reject invalid module format
- [ ] Handle missing required fields
- [ ] Import module with all card types
- [ ] Check duplicate module handling
- [ ] Verify module metadata extraction

### 2. Study Session ✓
- [ ] Start new study session
- [ ] Display cards in correct order
- [ ] Show card content correctly
- [ ] Submit answer
- [ ] Rate answer quality (1-4)
- [ ] Progress to next card
- [ ] Complete session
- [ ] Handle empty queue
- [ ] Auto-advance when enabled

### 3. Spaced Repetition (SM-2) ✓
- [ ] Initial interval calculation (1 day)
- [ ] Second interval calculation (6 days)
- [ ] Subsequent intervals with ease factor
- [ ] Ease factor adjustment on correct answer
- [ ] Ease factor adjustment on wrong answer
- [ ] Reset repetitions on failure
- [ ] Minimum ease factor (1.3)
- [ ] Schedule next review date
- [ ] Due cards selection

### 4. Answer Validation ✓
- [ ] Exact match validation
- [ ] Case-insensitive matching
- [ ] Fuzzy matching (typos)
- [ ] Whitespace normalization
- [ ] Accent insensitive matching
- [ ] Alternative answers support
- [ ] Language-specific processing (Spanish)
- [ ] Similarity threshold calculation

### 5. Progress Persistence ✓
- [ ] Save progress to IndexedDB
- [ ] Load progress on startup
- [ ] Update word mastery level
- [ ] Track study streaks
- [ ] Save session history
- [ ] Export progress with module
- [ ] Clear progress option
- [ ] Handle storage quota exceeded

### 6. Offline Functionality ✓
- [ ] Service worker registration
- [ ] Cache static assets
- [ ] Cache modules
- [ ] Access cached content offline
- [ ] Show offline indicator
- [ ] Sync when back online
- [ ] Handle network errors gracefully
- [ ] PWA install prompt

---

## Component Tests

### Settings ✓
- [ ] Save settings to localStorage
- [ ] Load settings on startup
- [ ] Theme switching (light/dark/system)
- [ ] Sound effects toggle
- [ ] Keyboard shortcuts toggle
- [ ] Daily goal configuration
- [ ] Reset settings
- [ ] Clear all data with confirmation

### Error Handling ✓
- [ ] ErrorBoundary catches errors
- [ ] Display error UI
- [ ] Log errors to console
- [ ] Retry functionality
- [ ] Fallback UI rendering

### Keyboard Shortcuts ✓
- [ ] Global shortcuts (?, ,, H)
- [ ] Study shortcuts (Space, Enter, 1-4)
- [ ] Navigation shortcuts (arrows)
- [ ] Disable when typing in input
- [ ] Respect settings toggle

---

## Performance Tests

### Load Time ✓
- [ ] Initial page load < 3s
- [ ] Module import < 1s for 100 entries
- [ ] Study session start < 500ms
- [ ] Answer submission < 100ms
- [ ] Database operations < 200ms

### Bundle Size ✓
- [ ] Main bundle < 300KB (gzipped)
- [ ] Vendor chunks properly split
- [ ] Lazy loading for routes
- [ ] Tree shaking effective

---

## Accessibility Tests

### WCAG Compliance ✓
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] ARIA labels

---

## Browser Compatibility

### Desktop ✓
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Mobile ✓
- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Responsive layouts

---

## Security Tests

### Data Protection ✓
- [ ] No sensitive data in localStorage
- [ ] CSP headers configured
- [ ] XSS prevention
- [ ] Input sanitization
- [ ] Safe JSON parsing

---

## Test Execution

### Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- moduleImporter.test

# Watch mode for development
npm test -- --watch
```

### CI/CD Integration
- [ ] Tests run on every commit
- [ ] Build fails if tests fail
- [ ] Coverage reports generated
- [ ] Performance budgets enforced

---

## Known Issues & TODO
- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Add load testing
- [ ] Add accessibility automated tests
- [ ] Add internationalization tests

---

## Test Maintenance

### Regular Tasks
- Review and update tests quarterly
- Remove obsolete tests
- Add tests for new features
- Maintain test data fixtures
- Update test documentation

### Code Coverage Goals
- Critical paths: 90%+
- Business logic: 85%+
- UI components: 70%+
- Overall: 80%+

---

*Last Updated: 2025-11-21*
*Version: 1.0.0*
