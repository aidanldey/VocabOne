# Architectural Patterns & Maintainability Guide

## Clean Architecture for Vocabulary Learning System

This guide provides architectural patterns and best practices to ensure your vocabulary learning system remains maintainable, testable, and scalable.

---

## 🏗️ Recommended Architecture: Clean Architecture with Hexagonal Ports

### Layer Structure
```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                      │
│         React Components / UI / User Interactions         │
└────────────────────────┬────────────────────────────────┘
                         │ DTOs
┌────────────────────────▼────────────────────────────────┐
│                   APPLICATION LAYER                       │
│          Use Cases / Application Services                 │
│     (Session Management, Progress Tracking, etc.)        │
└────────────────────────┬────────────────────────────────┘
                         │ Domain Models  
┌────────────────────────▼────────────────────────────────┐
│                     DOMAIN LAYER                          │
│     Entities / Value Objects / Domain Services            │
│   (Card, Module, Progress, SpacedRepetition Algorithm)   │
└────────────────────────┬────────────────────────────────┘
                         │ Interfaces
┌────────────────────────▼────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                     │
│     Repositories / External Services / Persistence        │
│        (IndexedDB, LocalStorage, File System)            │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule
- Dependencies only point inward
- Domain layer has no external dependencies
- Infrastructure depends on domain interfaces
- Application orchestrates between domain and infrastructure

---

## 📦 Domain-Driven Design Patterns

### 1. Aggregate Root Pattern for Module Management

```typescript
// Domain Layer - Aggregate Root
class VocabularyModule {
  private entries: Map<string, VocabularyEntry>;
  private metadata: ModuleMetadata;
  private version: number;

  constructor(metadata: ModuleMetadata) {
    this.metadata = metadata;
    this.entries = new Map();
    this.version = 0;
  }

  // All modifications go through the aggregate root
  addEntry(entry: VocabularyEntry): Result<void> {
    if (this.entries.has(entry.id)) {
      return Result.fail('Entry already exists');
    }
    
    // Business rule: Maximum 1000 entries per module
    if (this.entries.size >= 1000) {
      return Result.fail('Module has reached maximum capacity');
    }
    
    this.entries.set(entry.id, entry);
    this.version++;
    return Result.ok();
  }

  // Encapsulate complex business logic
  getReadyForReview(): VocabularyEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => this.isEntryDue(entry));
  }

  private isEntryDue(entry: VocabularyEntry): boolean {
    // Complex business logic encapsulated
    return entry.progress.nextReview <= new Date();
  }
}
```

### 2. Value Objects for Immutable Data

```typescript
// Value Object - Immutable and Self-Validating
class AnswerQuality {
  private readonly value: number;
  
  private constructor(value: number) {
    this.value = value;
  }
  
  static create(value: number): Result<AnswerQuality> {
    if (value < 0 || value > 5) {
      return Result.fail('Quality must be between 0 and 5');
    }
    return Result.ok(new AnswerQuality(value));
  }
  
  getValue(): number {
    return this.value;
  }
  
  isPass(): boolean {
    return this.value >= 3;
  }
  
  isPerfect(): boolean {
    return this.value === 5;
  }
}
```

### 3. Domain Service for Complex Algorithms

```typescript
// Domain Service - Stateless Business Logic
interface SpacedRepetitionAlgorithm {
  calculate(current: Progress, quality: AnswerQuality): Progress;
}

class SM2Algorithm implements SpacedRepetitionAlgorithm {
  calculate(current: Progress, quality: AnswerQuality): Progress {
    // Pure function - no side effects
    const newEase = this.calculateEase(current.ease, quality.getValue());
    const newInterval = this.calculateInterval(
      current.repetitions,
      newEase,
      current.interval,
      quality.getValue()
    );
    
    return new Progress({
      ...current,
      ease: newEase,
      interval: newInterval,
      repetitions: quality.isPass() ? current.repetitions + 1 : 0,
      lastReview: new Date(),
      nextReview: addDays(new Date(), newInterval)
    });
  }
  
  private calculateEase(currentEase: number, quality: number): number {
    // SM-2 algorithm implementation
    return Math.max(1.3, currentEase + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  
  private calculateInterval(n: number, ease: number, prevInterval: number, quality: number): number {
    if (quality < 3) return 1;
    if (n === 0) return 1;
    if (n === 1) return 6;
    return Math.round(prevInterval * ease);
  }
}
```

---

## 🎯 Application Layer Patterns

### 1. Use Case Pattern (Command Pattern)

```typescript
// Application Layer - Use Case
class StartStudySessionUseCase {
  constructor(
    private moduleRepo: ModuleRepository,
    private progressRepo: ProgressRepository,
    private scheduler: ReviewScheduler,
    private eventBus: EventBus
  ) {}
  
  async execute(request: StartSessionRequest): Promise<Result<SessionResponse>> {
    // 1. Validate request
    const validation = this.validate(request);
    if (validation.isFailure) {
      return Result.fail(validation.error);
    }
    
    // 2. Load module
    const module = await this.moduleRepo.findById(request.moduleId);
    if (!module) {
      return Result.fail('Module not found');
    }
    
    // 3. Get due cards
    const dueCards = await this.scheduler.getDueCards(module, request.limit);
    if (dueCards.length === 0) {
      return Result.fail('No cards due for review');
    }
    
    // 4. Create session
    const session = Session.create({
      moduleId: module.id,
      cards: dueCards,
      startTime: new Date()
    });
    
    // 5. Emit event
    await this.eventBus.emit(new SessionStartedEvent(session));
    
    // 6. Return response
    return Result.ok({
      sessionId: session.id,
      totalCards: dueCards.length,
      firstCard: dueCards[0]
    });
  }
  
  private validate(request: StartSessionRequest): Result<void> {
    if (!request.moduleId) {
      return Result.fail('Module ID is required');
    }
    if (request.limit && request.limit < 1) {
      return Result.fail('Limit must be positive');
    }
    return Result.ok();
  }
}
```

### 2. Repository Pattern with Unit of Work

```typescript
// Domain Layer - Repository Interface
interface ModuleRepository {
  findById(id: string): Promise<VocabularyModule | null>;
  save(module: VocabularyModule): Promise<void>;
  delete(id: string): Promise<void>;
}

// Infrastructure Layer - Implementation
class IndexedDBModuleRepository implements ModuleRepository {
  constructor(private db: Dexie, private unitOfWork: UnitOfWork) {}
  
  async findById(id: string): Promise<VocabularyModule | null> {
    const data = await this.db.modules.get(id);
    if (!data) return null;
    
    return ModuleMapper.toDomain(data);
  }
  
  async save(module: VocabularyModule): Promise<void> {
    // Register with unit of work for transaction
    this.unitOfWork.registerDirty(module);
  }
  
  async delete(id: string): Promise<void> {
    this.unitOfWork.registerDeleted(id);
  }
}

// Unit of Work for Transaction Management
class UnitOfWork {
  private dirty: Set<DomainEntity> = new Set();
  private deleted: Set<string> = new Set();
  private new: Set<DomainEntity> = new Set();
  
  async commit(): Promise<void> {
    const transaction = await this.db.transaction('rw', this.db.modules, async () => {
      // Save all dirty entities
      for (const entity of this.dirty) {
        await this.db.modules.put(EntityMapper.toPersistence(entity));
      }
      
      // Delete all marked entities
      for (const id of this.deleted) {
        await this.db.modules.delete(id);
      }
      
      // Insert new entities
      for (const entity of this.new) {
        await this.db.modules.add(EntityMapper.toPersistence(entity));
      }
    });
    
    this.clear();
  }
  
  rollback(): void {
    this.clear();
  }
  
  private clear(): void {
    this.dirty.clear();
    this.deleted.clear();
    this.new.clear();
  }
}
```

---

## 🔄 State Management Patterns

### 1. Event Sourcing for Progress Tracking

```typescript
// Event Sourcing for Complete History
interface DomainEvent {
  aggregateId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  version: number;
}

class CardReviewedEvent implements DomainEvent {
  constructor(
    public aggregateId: string,
    public eventData: {
      cardId: string;
      quality: number;
      timeSpent: number;
      answer: string;
    },
    public timestamp: Date = new Date(),
    public version: number = 1
  ) {}
  
  eventType = 'CardReviewed';
}

class EventStore {
  private events: DomainEvent[] = [];
  
  async append(event: DomainEvent): Promise<void> {
    this.events.push(event);
    await this.persist(event);
  }
  
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }
  
  // Rebuild state from events
  async rebuildProgress(userId: string): Promise<UserProgress> {
    const events = await this.getEvents(userId);
    return events.reduce((progress, event) => {
      return this.applyEvent(progress, event);
    }, new UserProgress());
  }
  
  private applyEvent(progress: UserProgress, event: DomainEvent): UserProgress {
    switch (event.eventType) {
      case 'CardReviewed':
        return progress.applyCardReview(event.eventData);
      case 'SessionCompleted':
        return progress.applySessionComplete(event.eventData);
      default:
        return progress;
    }
  }
}
```

### 2. CQRS Pattern for Read/Write Separation

```typescript
// Command Side - Write Model
class ModuleCommandService {
  constructor(
    private repository: ModuleRepository,
    private eventBus: EventBus
  ) {}
  
  async createModule(command: CreateModuleCommand): Promise<Result<void>> {
    const module = VocabularyModule.create(command);
    await this.repository.save(module);
    await this.eventBus.emit(new ModuleCreatedEvent(module));
    return Result.ok();
  }
  
  async updateProgress(command: UpdateProgressCommand): Promise<Result<void>> {
    const module = await this.repository.findById(command.moduleId);
    if (!module) return Result.fail('Module not found');
    
    module.updateProgress(command.entryId, command.progress);
    await this.repository.save(module);
    await this.eventBus.emit(new ProgressUpdatedEvent(command));
    return Result.ok();
  }
}

// Query Side - Read Model (Optimized for queries)
class ModuleQueryService {
  constructor(private readDb: ReadModelDatabase) {}
  
  async getModuleStatistics(moduleId: string): Promise<ModuleStats> {
    // Optimized read from denormalized view
    return this.readDb.moduleStats.get(moduleId);
  }
  
  async getDueCards(userId: string): Promise<DueCardsView> {
    // Pre-calculated view updated by event handlers
    return this.readDb.dueCards.getForUser(userId);
  }
  
  async getLeaderboard(): Promise<LeaderboardView> {
    // Cached and pre-sorted view
    return this.readDb.leaderboard.getTop(100);
  }
}

// Event Handler to Update Read Models
class ProgressEventHandler {
  constructor(private readDb: ReadModelDatabase) {}
  
  @EventHandler(ProgressUpdatedEvent)
  async handleProgressUpdate(event: ProgressUpdatedEvent): Promise<void> {
    // Update denormalized views
    await this.readDb.moduleStats.recalculate(event.moduleId);
    await this.readDb.dueCards.update(event.userId);
    await this.readDb.leaderboard.updateUser(event.userId);
  }
}
```

---

## 🧪 Testing Patterns

### 1. Test Data Builder Pattern

```typescript
// Test Data Builders for Clean Tests
class VocabularyModuleBuilder {
  private metadata: Partial<ModuleMetadata> = {};
  private entries: VocabularyEntry[] = [];
  
  withTitle(title: string): this {
    this.metadata.title = title;
    return this;
  }
  
  withLanguage(language: string): this {
    this.metadata.language = language;
    return this;
  }
  
  withEntry(entry: VocabularyEntry): this {
    this.entries.push(entry);
    return this;
  }
  
  withRandomEntries(count: number): this {
    for (let i = 0; i < count; i++) {
      this.entries.push(new VocabularyEntryBuilder().build());
    }
    return this;
  }
  
  build(): VocabularyModule {
    const module = new VocabularyModule({
      id: 'test-module',
      title: 'Test Module',
      language: 'en',
      ...this.metadata
    });
    
    this.entries.forEach(entry => module.addEntry(entry));
    return module;
  }
}

// Usage in tests
describe('StudySession', () => {
  it('should present cards in random order', () => {
    const module = new VocabularyModuleBuilder()
      .withTitle('Spanish Animals')
      .withRandomEntries(10)
      .build();
    
    const session = new StudySession(module);
    const firstCard = session.getNextCard();
    
    expect(firstCard).toBeDefined();
  });
});
```

### 2. Mock Factory Pattern

```typescript
// Factory for Creating Test Doubles
class MockFactory {
  static createModuleRepository(modules: VocabularyModule[] = []): ModuleRepository {
    const moduleMap = new Map(modules.map(m => [m.id, m]));
    
    return {
      findById: jest.fn((id) => Promise.resolve(moduleMap.get(id) || null)),
      save: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      findAll: jest.fn(() => Promise.resolve(Array.from(moduleMap.values())))
    };
  }
  
  static createProgressRepository(initialProgress = {}): ProgressRepository {
    const progress = { ...initialProgress };
    
    return {
      getProgress: jest.fn((id) => Promise.resolve(progress[id])),
      saveProgress: jest.fn((id, p) => {
        progress[id] = p;
        return Promise.resolve();
      }),
      getAllProgress: jest.fn(() => Promise.resolve(progress))
    };
  }
  
  static createEventBus(): EventBus {
    const events: DomainEvent[] = [];
    
    return {
      emit: jest.fn((event) => {
        events.push(event);
        return Promise.resolve();
      }),
      getEmittedEvents: () => events,
      clear: () => events.length = 0
    };
  }
}
```

---

## 🎨 UI Architecture Patterns

### 1. Presenter Pattern for Complex UI Logic

```typescript
// Separate presentation logic from React components
class CardPresenterLogic {
  constructor(
    private validator: AnswerValidator,
    private progressService: ProgressService
  ) {}
  
  prepareCard(card: Card): CardViewModel {
    return {
      id: card.id,
      type: card.type,
      content: this.processContent(card),
      hints: this.generateHints(card),
      difficulty: this.calculateDifficulty(card)
    };
  }
  
  async processAnswer(
    card: Card,
    userAnswer: string
  ): Promise<AnswerResultViewModel> {
    const validation = await this.validator.validate(userAnswer, card.expectedAnswer);
    
    return {
      isCorrect: validation.isCorrect,
      confidence: validation.confidence,
      feedback: this.generateFeedback(validation),
      correctAnswer: card.expectedAnswer,
      explanation: card.explanation,
      nextAction: this.determineNextAction(validation)
    };
  }
  
  private generateFeedback(validation: ValidationResult): string {
    if (validation.confidence === 1) return "Perfect! 🎉";
    if (validation.confidence > 0.9) return "Excellent! Minor typo detected.";
    if (validation.confidence > 0.7) return "Close! Check your spelling.";
    return "Not quite. Study the correct answer.";
  }
}

// Clean React Component
const CardPresenter: React.FC<{ card: Card }> = ({ card }) => {
  const presenter = useCardPresenter();
  const [viewModel, setViewModel] = useState<CardViewModel>();
  
  useEffect(() => {
    setViewModel(presenter.prepareCard(card));
  }, [card]);
  
  const handleAnswer = async (answer: string) => {
    const result = await presenter.processAnswer(card, answer);
    // Update UI with result
  };
  
  return (
    <div className="card-presenter">
      {/* Purely presentational JSX */}
    </div>
  );
};
```

### 2. Container/Presentational Component Pattern

```typescript
// Container Component - Handles Logic
const StudySessionContainer: React.FC = () => {
  const session = useStudySession();
  const progress = useProgress();
  const settings = useSettings();
  
  const handleCardAnswer = async (answer: string) => {
    const result = await session.submitAnswer(answer);
    await progress.update(result);
    
    if (settings.autoAdvance) {
      setTimeout(() => session.nextCard(), 1500);
    }
  };
  
  return (
    <StudySessionView
      currentCard={session.currentCard}
      progress={session.progress}
      onAnswer={handleCardAnswer}
      onSkip={session.skipCard}
      onEnd={session.endSession}
    />
  );
};

// Presentational Component - Pure UI
const StudySessionView: React.FC<StudySessionViewProps> = ({
  currentCard,
  progress,
  onAnswer,
  onSkip,
  onEnd
}) => {
  return (
    <div className="study-session">
      <ProgressBar value={progress.completed} max={progress.total} />
      <CardDisplay card={currentCard} />
      <AnswerInput onSubmit={onAnswer} />
      <SessionControls onSkip={onSkip} onEnd={onEnd} />
    </div>
  );
};
```

---

## 🔒 Error Handling Patterns

### 1. Result Type Pattern (No Exceptions)

```typescript
// Result type for explicit error handling
class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _error?: string,
    private readonly _value?: T
  ) {}
  
  static ok<T>(value?: T): Result<T> {
    return new Result(true, undefined, value);
  }
  
  static fail<T>(error: string): Result<T> {
    return new Result(false, error);
  }
  
  get isSuccess(): boolean {
    return this._isSuccess;
  }
  
  get isFailure(): boolean {
    return !this._isSuccess;
  }
  
  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value as T;
  }
  
  get error(): string {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error as string;
  }
  
  map<U>(fn: (value: T) => U): Result<U> {
    if (this._isSuccess) {
      return Result.ok(fn(this._value as T));
    }
    return Result.fail(this._error as string);
  }
  
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    return Result.fail(this._error as string);
  }
}

// Usage
async function importModule(file: File): Promise<Result<VocabularyModule>> {
  const parseResult = await parseJSON(file);
  if (parseResult.isFailure) {
    return Result.fail(`Parse error: ${parseResult.error}`);
  }
  
  const validationResult = validateModule(parseResult.value);
  if (validationResult.isFailure) {
    return Result.fail(`Validation error: ${validationResult.error}`);
  }
  
  const module = VocabularyModule.create(parseResult.value);
  return Result.ok(module);
}
```

### 2. Error Recovery Strategy Pattern

```typescript
// Strategy pattern for error recovery
interface ErrorRecoveryStrategy {
  canRecover(error: AppError): boolean;
  recover(error: AppError): Promise<void>;
}

class NetworkErrorRecovery implements ErrorRecoveryStrategy {
  canRecover(error: AppError): boolean {
    return error.type === 'NETWORK_ERROR';
  }
  
  async recover(error: AppError): Promise<void> {
    // Implement exponential backoff
    const retries = error.metadata?.retries || 0;
    const delay = Math.min(1000 * Math.pow(2, retries), 30000);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry the operation
    await error.retryOperation();
  }
}

class DataCorruptionRecovery implements ErrorRecoveryStrategy {
  canRecover(error: AppError): boolean {
    return error.type === 'DATA_CORRUPTION';
  }
  
  async recover(error: AppError): Promise<void> {
    // Clear corrupted data and restore from backup
    await this.clearCorruptedData(error.metadata.corruptedKey);
    await this.restoreFromBackup(error.metadata.backupKey);
  }
}

class ErrorRecoveryService {
  private strategies: ErrorRecoveryStrategy[] = [
    new NetworkErrorRecovery(),
    new DataCorruptionRecovery(),
    new CacheErrorRecovery()
  ];
  
  async handleError(error: AppError): Promise<void> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        await strategy.recover(error);
        return;
      }
    }
    
    // No recovery strategy available
    throw error;
  }
}
```

---

## 📈 Performance Patterns

### 1. Virtual Scrolling for Large Lists

```typescript
// Component for efficiently rendering large lists
const VirtualModuleList: React.FC<{ modules: Module[] }> = ({ modules }) => {
  const rowHeight = 80;
  const windowHeight = window.innerHeight;
  const overscan = 5; // Render 5 items outside viewport
  
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.ceil((scrollTop + windowHeight) / rowHeight);
  
  const visibleModules = modules.slice(
    Math.max(0, startIndex - overscan),
    Math.min(modules.length, endIndex + overscan)
  );
  
  return (
    <div 
      className="virtual-list"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height: windowHeight, overflow: 'auto' }}
    >
      <div style={{ height: modules.length * rowHeight }}>
        <div style={{ transform: `translateY(${startIndex * rowHeight}px)` }}>
          {visibleModules.map(module => (
            <ModuleRow key={module.id} module={module} height={rowHeight} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. Lazy Loading with Suspense

```typescript
// Lazy load heavy components
const DashboardCharts = lazy(() => import('./DashboardCharts'));
const ModuleBuilder = lazy(() => import('./ModuleBuilder'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));

// Intelligent preloading
class ComponentPreloader {
  static preloadDashboard() {
    import('./DashboardCharts');
  }
  
  static preloadBuilder() {
    import('./ModuleBuilder');
  }
  
  static preloadOnHover(component: string) {
    const preloadMap = {
      'dashboard': this.preloadDashboard,
      'builder': this.preloadBuilder
    };
    
    preloadMap[component]?.();
  }
}

// Usage in component
<Link 
  to="/dashboard"
  onMouseEnter={() => ComponentPreloader.preloadOnHover('dashboard')}
>
  Dashboard
</Link>
```

---

## 🔐 Security Patterns

### 1. Input Sanitization Layer

```typescript
// Centralized input sanitization
class InputSanitizer {
  sanitizeModuleImport(raw: any): SanitizedModule {
    return {
      id: this.sanitizeString(raw.id, 50),
      title: this.sanitizeString(raw.title, 100),
      entries: raw.entries?.map(e => this.sanitizeEntry(e)) || [],
      metadata: this.sanitizeMetadata(raw.metadata)
    };
  }
  
  private sanitizeString(input: any, maxLength: number): string {
    if (typeof input !== 'string') return '';
    
    return input
      .substring(0, maxLength)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '');
  }
  
  private sanitizeEntry(raw: any): SanitizedEntry {
    return {
      id: this.sanitizeString(raw.id, 50),
      term: this.sanitizeString(raw.term, 200),
      cards: Array.isArray(raw.cards) 
        ? raw.cards.slice(0, 20).map(c => this.sanitizeCard(c))
        : []
    };
  }
}
```

### 2. Content Security Policy

```typescript
// CSP configuration for the app
const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "blob:"],
  'media-src': ["'self'", "blob:"],
  'connect-src': ["'self'"],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"]
};

// Apply CSP headers
app.use((req, res, next) => {
  const policy = Object.entries(cspConfig)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  
  res.setHeader('Content-Security-Policy', policy);
  next();
});
```

---

## 📊 Monitoring & Observability

### 1. Performance Monitoring

```typescript
// Custom performance monitoring
class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark) || 0;
    const end = endMark ? (this.marks.get(endMark) || 0) : performance.now();
    const duration = end - start;
    
    // Log to analytics
    this.logMetric({
      name,
      value: duration,
      unit: 'milliseconds',
      tags: {
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
    
    return duration;
  }
  
  private logMetric(metric: Metric): void {
    // Send to analytics service
    if (window.analytics) {
      window.analytics.track('Performance Metric', metric);
    }
  }
}

// Usage
const monitor = new PerformanceMonitor();

monitor.mark('module-load-start');
const module = await loadModule(id);
monitor.mark('module-load-end');
monitor.measure('module-load-time', 'module-load-start', 'module-load-end');
```

---

## 🚀 Deployment Patterns

### 1. Feature Flags

```typescript
// Feature flag system for gradual rollouts
class FeatureFlags {
  private flags: Map<string, boolean> = new Map();
  
  async initialize(userId: string): Promise<void> {
    const response = await fetch(`/api/features/${userId}`);
    const features = await response.json();
    
    Object.entries(features).forEach(([key, value]) => {
      this.flags.set(key, value as boolean);
    });
  }
  
  isEnabled(feature: string): boolean {
    return this.flags.get(feature) || false;
  }
  
  whenEnabled(feature: string, callback: () => void): void {
    if (this.isEnabled(feature)) {
      callback();
    }
  }
}

// Usage in components
const features = useFeatureFlags();

return (
  <>
    <CoreFeatures />
    {features.isEnabled('advanced-stats') && <AdvancedStatistics />}
    {features.isEnabled('social-features') && <SocialPanel />}
  </>
);
```

### 2. Progressive Enhancement

```typescript
// Progressive enhancement strategy
class ProgressiveEnhancement {
  static enhance(): void {
    // Core functionality works without JS
    this.enhanceIfSupported('service-worker', this.registerServiceWorker);
    this.enhanceIfSupported('webgl', this.enable3DVisualizations);
    this.enhanceIfSupported('speech-synthesis', this.enableTextToSpeech);
    this.enhanceIfSupported('web-audio', this.enableAdvancedAudio);
  }
  
  private static enhanceIfSupported(
    feature: string,
    enhancement: () => void
  ): void {
    if (this.isSupported(feature)) {
      enhancement();
    }
  }
  
  private static isSupported(feature: string): boolean {
    const checks = {
      'service-worker': 'serviceWorker' in navigator,
      'webgl': !!document.createElement('canvas').getContext('webgl'),
      'speech-synthesis': 'speechSynthesis' in window,
      'web-audio': 'AudioContext' in window
    };
    
    return checks[feature] || false;
  }
}
```

---

## 📋 Maintenance Checklist

### Code Quality
- [ ] All domain logic in domain layer
- [ ] No framework dependencies in domain
- [ ] All side effects isolated in infrastructure
- [ ] 100% test coverage for domain logic
- [ ] Integration tests for critical paths

### Architecture
- [ ] Clear layer boundaries maintained
- [ ] Dependency injection used consistently
- [ ] Interfaces defined for all external dependencies
- [ ] Event-driven communication between modules
- [ ] SOLID principles followed

### Performance
- [ ] Virtual scrolling for large lists
- [ ] Code splitting implemented
- [ ] Images lazy loaded
- [ ] Service worker caching
- [ ] Bundle size < 500KB

### Security
- [ ] All inputs sanitized
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted
- [ ] Regular dependency updates

### Monitoring
- [ ] Error tracking configured
- [ ] Performance metrics collected
- [ ] User analytics implemented
- [ ] A/B testing framework ready
- [ ] Feature flags system operational

---

This architecture will ensure your vocabulary learning system remains maintainable, scalable, and testable as it grows. Focus on implementing these patterns incrementally, starting with the most critical ones for your MVP.
