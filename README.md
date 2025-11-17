# Vocabulary Learning System

A universal, multi-modal vocabulary acquisition platform using spaced repetition with randomized multi-card presentation.

## Vision

Build a content-agnostic learning engine where vocabulary mastery happens through **fluent understanding** rather than translation. Support learning across:
- Foreign languages (Spanish, Mandarin, French, etc.)
- Technical domains (medical, legal, computer science)
- Academic fields (philosophy, science, business)
- Professional contexts (industry-specific terminology)

## Core Innovation: Multi-Card Learning

Traditional flashcard systems show the same card repeatedly. Our system presents **multiple cards per vocabulary term**, randomly selecting from:
- Images
- Videos
- Audio clips
- Text definitions
- Fill-in-the-blank sentences
- Trivia questions

This creates **multiple retrieval pathways** and prevents pattern memorization, leading to deeper, more durable learning.

## Key Principles

✅ **Software separate from data** - The learning engine works with any properly formatted module  
✅ **User extensible** - Learners can add custom cards and notes  
✅ **Update friendly** - Module updates preserve user customizations  
✅ **Evidence-based** - Built on spaced repetition research  
✅ **Multi-modal** - Supports visual, auditory, and textual learning styles

## Project Status

**Current Phase:** Requirements & Architecture (Pre-MVP)

**Completed:**
- ✅ Requirements definition
- ✅ Data schema design
- ✅ Learning mechanics specification
- ✅ Multi-card architecture
- ✅ Module builder concept

**Next Steps:**
- ⏳ JSON Schema validator
- ⏳ Sample module creation
- ⏳ Spaced repetition implementation
- ⏳ Card presenter UI
- ⏳ Module builder UI

## Documentation

All documentation is located in the `docs/` directory:

- **[00-project-overview.md](docs/00-project-overview.md)** - Vision, goals, and design philosophy
- **[01-requirements.md](docs/01-requirements.md)** - Detailed requirements and priorities
- **[02-data-schema.md](docs/02-data-schema.md)** - Complete module data structure
- **[03-architecture.md](docs/03-architecture.md)** - System architecture and components
- **[04-learning-mechanics.md](docs/04-learning-mechanics.md)** - Spaced repetition and card selection
- **[05-module-builder.md](docs/05-module-builder.md)** - Vocabulary builder design
- **[06-implementation-plan.md](docs/06-implementation-plan.md)** - Development roadmap
- **[decision-log.md](docs/decision-log.md)** - Record of architectural decisions

## Quick Start

### For Module Creators
1. Review the [data schema documentation](docs/02-data-schema.md)
2. Use the [module template](templates/module-template.json)
3. Validate with the [JSON schema](schemas/module-schema-v1.0.0.json)

### For Developers
1. Review [architecture documentation](docs/03-architecture.md)
2. Study [learning mechanics](docs/04-learning-mechanics.md)
3. Follow [implementation plan](docs/06-implementation-plan.md)

### For Learners
- Import vocabulary modules into the learning app
- Study using spaced repetition
- Customize with personal notes and cards

## Repository Structure

```
vocabulary-learning-system/
├── README.md                    # This file
├── docs/                        # All documentation
├── schemas/                     # JSON Schema validation files
├── examples/                    # Sample modules
├── templates/                   # Module creation templates
└── specs/                       # Technical specifications
```

## Technology Stack (Proposed)

- **Data Format:** JSON (with YAML support planned)
- **Schema Validation:** JSON Schema Draft 07
- **Spaced Repetition:** SM-2 Algorithm (modified)
- **Media Support:** Images (jpg/png), Video (mp4), Audio (mp3)
- **Platform:** Cross-platform (web/desktop/mobile TBD)

## Contributing

This project is currently in the design phase. Contributions welcome once MVP is complete.

## License

TBD

## Contact

For questions or collaboration inquiries, see project documentation.

---

**Last Updated:** November 16, 2025  
**Documentation Version:** 1.0.0  
**Project Phase:** Requirements & Architecture
