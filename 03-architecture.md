# System Architecture

**Document Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Status:** Design Phase

---

## Architecture Overview

The Vocabulary Learning System uses a **modular, content-agnostic architecture** where the learning engine is completely separate from vocabulary data.

```
┌─────────────────────────────────────────────────────────────┐
│                   USER INTERFACE LAYER                       │
│  - Card Presenter                                            │
│  - Progress Dashboard                                        │
│  - Module Manager                                            │
│  - Settings Interface                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                APPLICATION LOGIC LAYER                       │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ Session Manager │  │ Answer         │  │ Progress     │ │
│  │                 │  │ Validator      │  │ Tracker      │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ Card Selector   │  │ Spaced         │  │ Module       │ │
│  │                 │  │ Repetition     │  │ Loader       │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   DATA LAYER                                 │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ Module Files    │  │ User Progress  │  │ User         │ │
│  │ (JSON)          │  │ Database       │  │ Customiz.    │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Media Files (Images/Video/Audio)           │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Session Manager
**Responsibility:** Orchestrate review sessions  
**Functions:**
- Query spaced repetition engine for due words
- Present cards one at a time
- Handle user input
- Update mastery state after each review
- Provide session statistics

### 2. Card Selector
**Responsibility:** Choose which card to present  
**Functions:**
- Random selection from entry's card pool (MVP)
- Track which card was last shown (future: avoid immediate repeats)
- Support different selection strategies (random, round-robin, adaptive)

### 3. Spaced Repetition Engine
**Responsibility:** Calculate review intervals  
**Functions:**
- Implement SM-2 algorithm
- Track per-entry mastery state (interval, ease, repetitions)
- Adjust intervals based on correct/incorrect responses
- Determine which entries are due for review

### 4. Answer Validator
**Responsibility:** Check user responses  
**Functions:**
- Fuzzy string matching (allow minor typos)
- Support multiple acceptable answers
- Case-insensitive comparison
- Provide immediate feedback

### 5. Module Loader
**Responsibility:** Import and validate modules  
**Functions:**
- Parse JSON module files
- Validate against schema
- Check media file existence
- Load module metadata and entries into memory

### 6. Progress Tracker
**Responsibility:** Track and persist learning data  
**Functions:**
- Save mastery state for each entry
- Log review history
- Calculate statistics (accuracy, streak, words learned)
- Export/import progress data

### 7. Card Presenter (UI)
**Responsibility:** Display cards and collect input  
**Functions:**
- Render appropriate UI for each card type
- Play media (images, video, audio)
- Capture user input
- Display feedback and correct answer

---

## Data Flow

### Review Session Flow

```
1. User initiates review session
   ↓
2. Session Manager queries Spaced Repetition Engine
   → Returns list of due entries
   ↓
3. For each due entry:
   a. Card Selector chooses random card from entry
   b. Card Presenter displays card content + prompt
   c. User types answer
   d. Answer Validator checks response
   e. Card Presenter shows feedback
   f. Spaced Repetition Engine updates mastery state
   g. Progress Tracker logs review
   ↓
4. Session completes
   → Display session summary
   → Save progress to disk
```

### Module Import Flow

```
1. User selects module file
   ↓
2. Module Loader reads JSON
   ↓
3. Schema validator checks structure
   → If invalid: show errors, abort
   → If valid: continue
   ↓
4. Check media file references
   → Warn about missing files
   ↓
5. Load module into app
   ↓
6. Module available for study
```

---

## Data Persistence

### Module Files (Read-Only)
- **Location:** User-specified module directories
- **Format:** JSON
- **Contents:** Vocabulary entries with cards
- **Access:** Read by Module Loader

### User Progress (Read-Write)
- **Location:** App data directory
- **Format:** JSON (MVP) / SQLite (future)
- **Contents:**
  - Per-entry mastery state
  - Review history
  - Last card shown per entry
- **Access:** Read/Write by Progress Tracker

### User Customizations (Read-Write)
- **Location:** App data directory
- **Format:** JSON
- **Contents:**
  - Personal notes per entry
  - Custom cards
  - Custom tags
  - Mnemonics
- **Access:** Read/Write by Module Loader and UI

---

## File Structure

```
app-directory/
├── modules/                    # User's module collection
│   ├── spanish-animals/
│   │   ├── module.json
│   │   ├── images/
│   │   ├── videos/
│   │   └── audio/
│   └── medical-terms/
│       └── module.json
│
├── user-data/                  # App-generated data
│   ├── progress.json           # Mastery states
│   ├── settings.json           # User preferences
│   ├── review-history.json     # Historical review data
│   └── customizations/
│       ├── spanish-animals-custom.json
│       └── medical-terms-custom.json
│
└── app/                        # Application code
    ├── core/
    │   ├── session_manager.py
    │   ├── card_selector.py
    │   ├── spaced_repetition.py
    │   ├── answer_validator.py
    │   └── progress_tracker.py
    ├── data/
    │   ├── module_loader.py
    │   └── schema_validator.py
    └── ui/
        ├── card_presenter.py
        └── dashboard.py
```

---

## Technology Decisions (Proposed)

### Platform
- **MVP:** Desktop application (cross-platform)
- **Technology:** Python with GUI framework (TBD: Tkinter, PyQt, or Electron)
- **Future:** Web app, mobile apps

### Data Storage
- **Modules:** JSON files
- **User Data:** JSON (MVP), SQLite (post-MVP)
- **Media:** Local file system

### Key Libraries
- **JSON validation:** jsonschema
- **Fuzzy matching:** fuzzywuzzy or python-Levenshtein
- **Media playback:** Platform-dependent (PyQt multimedia, web APIs)
- **File handling:** pathlib (Python standard library)

---

## Scalability Considerations

### Performance Targets
- Card loading: <1 second
- Module loading: <5 seconds for 1000+ entries
- Session responsiveness: No lag or freezing

### Optimization Strategies
- Lazy load media files (load when card is presented)
- Cache frequently used data in memory
- Index entries for fast lookups
- Compress large media files

---

## Security Considerations

### User Data Protection
- Store user data in standard app data locations
- No network transmission (offline-first)
- User controls all data files

### Module Safety
- Validate JSON structure before loading
- Sanitize file paths (prevent directory traversal)
- Warn about external URLs (future feature)

---

## Extension Points

### Plugin Architecture (Future)
- Custom card types
- Alternative spaced repetition algorithms
- Custom statistics/analytics
- Import/export formats

### API (Future)
- Module management API
- Progress tracking API
- Third-party integrations

---

## Error Handling

### Module Loading Errors
- Invalid JSON → Show parse error, line number
- Schema validation failure → Show specific field errors
- Missing media files → Warn but allow loading

### Runtime Errors
- Media playback failure → Show error, skip to next card
- Progress save failure → Alert user, retry
- Answer validation error → Log error, accept any answer

---

**Document Maintained By:** Dr. Alex Chen  
**Review Frequency:** Weekly during development
