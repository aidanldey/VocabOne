# CLAUDE.md - AI Assistant Guide for VocabOne

This file provides essential context and guidance for AI assistants working with the VocabOne vocabulary learning system repository.

## Project Status: DOCUMENTATION PHASE (No Implementation Yet)

**Critical Understanding:** This repository contains **only documentation and specifications**. No source code has been implemented. The project is in the Requirements & Architecture phase, preparing for development.

### Current State
- All files are markdown documentation or JSON schemas
- No programming language runtime or build system exists
- No tests, no source code, no dependencies installed
- Technology stack has NOT been finalized (Python desktop vs React web app)

---

## Repository Structure

```
VocabOne/
├── CLAUDE.md                              # This file - AI assistant guide
├── README.md                              # Project overview and vision
├── INDEX.md                               # Documentation navigation
├── QUICKSTART.md                          # 5-minute orientation
├── DOCUMENTATION_SUMMARY.md               # Package statistics
│
├── Core Specifications (numbered docs):
│   ├── 00-project-overview.md            # Vision, goals, competitive analysis
│   ├── 01-requirements.md                # Functional & non-functional requirements
│   ├── 02-data-schema.md                 # Complete data structure specification
│   ├── 03-architecture.md                # System architecture and components
│   ├── 04-learning-mechanics.md          # SM-2 spaced repetition algorithm
│   └── 06-implementation-plan.md         # 12-week development roadmap
│
├── Technical Assets:
│   ├── module-schema-v1.0.0.json         # JSON Schema (Draft 07) for validation
│   ├── module-template.json              # Starter template for modules
│   └── decision-log.md                   # 11 architectural decisions recorded
│
├── Implementation Guides:
│   ├── vocabulary-system-analysis.md     # Critical analysis & recommendations
│   ├── claude-code-implementation-guide.md  # 10 strategic prompts for building
│   └── architecture-patterns-guide.md    # Clean architecture patterns (~12k words)
│
└── workit.zip                            # Archive with additional guides
```

**Note:** README.md references `docs/`, `schemas/`, `templates/`, `examples/` directories that don't exist. All documentation is in the root directory.

---

## Key Files to Understand

### For Understanding the Project
1. **QUICKSTART.md** - 5-minute orientation
2. **00-project-overview.md** - Core vision and innovation (multi-card learning)
3. **02-data-schema.md** - Complete data structure (~8000 words, very detailed)
4. **decision-log.md** - Why architectural choices were made

### For Implementation
1. **module-schema-v1.0.0.json** - JSON Schema for validating modules
2. **04-learning-mechanics.md** - SM-2 algorithm details
3. **claude-code-implementation-guide.md** - 10 prompts for building MVP
4. **architecture-patterns-guide.md** - Clean architecture patterns

---

## Core Technical Decisions (Already Made)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card Architecture | Multiple cards per term, random selection | Prevents pattern memorization |
| Data Format | JSON with JSON Schema validation | Human-readable, portable, standardized |
| Spaced Repetition | SM-2 Algorithm | Well-tested, simple to implement |
| Media Paths | Relative paths from module file | Portable, offline-capable |
| User Customizations | Stored separately from modules | Preserves official content on updates |
| Answer Input | Typed text with fuzzy matching | Tests true recall, not recognition |
| Mastery Tracking | Word-level (MVP), expandable to card-level | Simpler for MVP, future-proof design |

---

## Pending Decisions

1. **Platform/Technology Stack** - NOT YET DECIDED
   - Option A: Python desktop app (PyQt6/Tkinter)
   - Option B: React/TypeScript web app (Vite + Tailwind)
   - Recommendation documents suggest Option B for modern web deployment

2. **License** - TBD after MVP

3. **05-module-builder.md** - Document referenced but missing

---

## Data Schema Overview

### Module Structure (module-schema-v1.0.0.json)
```json
{
  "schema_version": "1.0.0",
  "module_metadata": {
    "module_id": "kebab-case-identifier",
    "title": "Human readable title",
    "version": "1.0.0",
    "language": "es"  // ISO 639-1
  },
  "vocabulary_entries": [
    {
      "entry_id": "unique-entry-id",
      "term": "vocabulary term",
      "cards": [
        {
          "card_id": "unique-card-id",
          "card_type": "image|video|audio|definition|cloze|trivia",
          "content": { /* type-specific */ }
        }
      ]
    }
  ]
}
```

### Supported Card Types
1. **image** - Visual recognition
2. **video** - Motion/action (max 30s, <2MB)
3. **audio** - Pronunciation/auditory
4. **definition** - Text-based comprehension
5. **cloze** - Fill-in-the-blank
6. **trivia** - Association/cultural knowledge

---

## Naming Conventions

- **Module IDs:** kebab-case (`spanish-animals-basics`)
- **Entry IDs:** descriptive with number (`perro-001`)
- **Card IDs:** entry-type-number (`perro-001-img-01`)
- **Language Codes:** ISO 639-1 (`es`, `en`, `fr`)
- **Versions:** Semantic versioning (`1.0.0`)

---

## SM-2 Algorithm Summary

```python
# Initial state for each word
interval = 1  # days
ease_factor = 2.5
repetitions = 0

# On correct answer (quality >= 3):
if repetitions == 0:
    interval = 1
elif repetitions == 1:
    interval = 6
else:
    interval = interval * ease_factor

ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
repetitions += 1

# On incorrect answer (quality < 3):
interval = 1
repetitions = 0
ease_factor = max(1.3, ease_factor - 0.2)
```

---

## What AI Assistants Should Know

### When Asked to Explore the Codebase
- **There is no code to explore.** All content is documentation.
- Direct users to specific markdown files for information.
- The JSON schema file is the only "executable" asset (for validation).

### When Asked to Implement Features
1. **Confirm technology stack first** - Ask user to decide between Python or React/TypeScript
2. **Reference existing guides:**
   - `claude-code-implementation-guide.md` for step-by-step prompts
   - `architecture-patterns-guide.md` for clean architecture patterns
   - `02-data-schema.md` for exact data structures
3. **Follow the 12-week plan** in `06-implementation-plan.md`

### When Validating Module Files
- Use `module-schema-v1.0.0.json` for JSON Schema validation
- Use `module-template.json` as a starting point
- Ensure all required fields are present per schema

### When Modifying Documentation
- Keep numbered files (00-06) in sequence
- Maintain consistent markdown formatting
- Update INDEX.md if adding new documents
- Record architectural decisions in decision-log.md

---

## Common Tasks

### Creating a Sample Module
```bash
# Use module-template.json as base
# Validate against module-schema-v1.0.0.json
# Follow naming conventions above
```

### Starting Implementation
1. Choose technology stack (ask user)
2. Set up project structure per `03-architecture.md`
3. Start with core engine (spaced repetition) per `06-implementation-plan.md`
4. Use prompts from `claude-code-implementation-guide.md`

### Understanding Requirements
- Start with `01-requirements.md` for complete functional requirements
- Priority levels: P0 (MVP), P1 (important), P2 (nice-to-have)
- Non-functional requirements include performance targets (1000+ entries, <1s load)

---

## Project Success Criteria (MVP)

1. User can import a module and complete a review session
2. Spaced repetition schedules correctly (SM-2)
3. Cards present randomly from pools (no pattern)
4. Progress persists across sessions
5. 3+ beta testers complete 1-week usage

---

## Important Constraints

- **No source code exists yet** - Do not look for implementation files
- **README references incorrect paths** - Ignore `docs/`, `schemas/` directories
- **Missing documentation** - `05-module-builder.md` is referenced but doesn't exist
- **No build/test commands** - No package.json, requirements.txt, or similar
- **Pre-implementation phase** - Focus on specification adherence

---

## Recommended Development Approach

Based on the implementation guides, the recommended approach is:

1. **React/TypeScript Web App** (per `claude-code-implementation-guide.md`)
   - Vite + React + TypeScript + Tailwind CSS
   - Zustand for state management
   - Dexie.js + IndexedDB for persistence
   - Vitest for testing

2. **Clean Architecture** (per `architecture-patterns-guide.md`)
   - Domain layer (business logic, pure functions)
   - Application layer (use cases, orchestration)
   - Infrastructure layer (storage, external services)
   - Presentation layer (UI components)

3. **Test-Driven Development**
   - Start with SM-2 algorithm tests
   - Build module loader with validation
   - Create card selector with randomization
   - Implement answer validator with fuzzy matching

---

## Quick Reference Commands

Since no implementation exists, there are no build/test commands yet.

**Future commands (once implemented):**
```bash
# If React/TypeScript:
npm install
npm run dev
npm run test
npm run build

# If Python:
pip install -r requirements.txt
python main.py
pytest
```

---

## Contact and Contribution

- Project is in design phase
- Contributions welcome once MVP is complete
- License TBD
- See decision-log.md for architectural context

---

## Last Updated

- **Date:** 2025-11-17
- **Phase:** Requirements & Architecture (Pre-MVP)
- **Documentation Version:** 1.0.0
- **Repository State:** Documentation only, no source code
