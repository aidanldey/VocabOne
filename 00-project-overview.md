# Project Overview

**Document Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Status:** Requirements & Design Phase

---

## Executive Summary

The Vocabulary Learning System is a universal, content-agnostic platform for vocabulary acquisition that prioritizes **fluent understanding** over translation-based recall. By presenting multiple learning cards per vocabulary term and using evidence-based spaced repetition, learners build deep, durable mastery across any domain.

---

## The Problem We're Solving

### Current State of Vocabulary Learning

**Traditional flashcard apps have limitations:**
- Single card per term leads to pattern memorization
- Users memorize the specific card, not the underlying concept
- Boring repetition reduces engagement
- Translation-focused rather than understanding-focused
- Domain-specific apps don't transfer to other learning needs

### What Learners Actually Need

- **Multiple retrieval pathways** for the same concept
- **Varied presentation formats** to prevent memorization
- **Fluent recognition** without translation steps
- **One tool** that works for language learning AND domain expertise
- **Personal customization** without losing official content

---

## Our Solution

### The Multi-Card Architecture

Instead of one flashcard per word, each vocabulary term has **multiple cards** that test understanding in different ways:

- **Visual cards** (images, videos)
- **Auditory cards** (pronunciation, usage in speech)
- **Textual cards** (definitions, contextual sentences)
- **Interactive cards** (fill-in-blank, trivia questions)

When it's time to review a word, the system **randomly selects one card**, creating variety and testing true comprehension.

### Content-Agnostic Design

The learning engine is **completely separate** from vocabulary data, meaning:
- ✅ Works for ANY language (Spanish, Mandarin, Arabic, etc.)
- ✅ Works for ANY domain (medical terms, legal vocabulary, technical jargon)
- ✅ Users can create custom modules for their specific needs
- ✅ Modules are portable and shareable

### Evidence-Based Learning

Built on proven cognitive science principles:
- **Spaced repetition** (SM-2 algorithm) optimizes review timing
- **Multiple encoding** strengthens neural pathways
- **Randomized presentation** prevents rote memorization
- **Active recall** testing enhances retention

---

## Target Audiences

### Primary Users

**Language Learners**
- ESL/EFL students
- Foreign language students (Spanish, French, Mandarin, etc.)
- Heritage language learners
- Polyglots

**Professional Learners**
- Medical students learning terminology
- Law students mastering legal vocabulary
- Business professionals learning industry terms
- Technical workers acquiring domain knowledge

**Academic Learners**
- Students studying specialized subjects
- Graduate students in technical fields
- Researchers learning field-specific terminology

### Secondary Users

**Content Creators**
- Teachers building custom vocabulary sets
- Textbook authors providing supplementary materials
- Educational institutions creating standardized curricula
- Community contributors sharing specialty modules

---

## Core Features

### For Learners

**Multi-Modal Learning**
- Image recognition cards
- Video demonstration cards
- Audio pronunciation cards
- Text definition cards
- Contextual sentence cards
- Trivia/association cards

**Intelligent Spaced Repetition**
- Automatic scheduling based on performance
- Word-level mastery tracking
- Optimized review intervals
- Customizable daily goals

**Personal Customization**
- Add personal notes to any vocabulary term
- Create custom cards with personal associations
- Tag words for custom organization
- Adjust difficulty ratings

**Progress Tracking**
- Words learned count
- Review accuracy metrics
- Daily streak tracking
- Module completion status

### For Module Creators

**Flexible Module Format**
- JSON-based, human-readable structure
- Support for images, video, audio
- Extensible card type system
- Rich metadata for discoverability

**Module Builder Tool** (Planned)
- GUI for creating vocabulary modules
- No coding required
- Automatic card generation from minimal input
- Media file management

**Version Control**
- Module versioning system
- Update modules without losing user customizations
- User additions stored separately

---

## Design Philosophy

### 1. Separation of Concerns
**Software ≠ Content**  
The learning engine is generic and works with any properly formatted vocabulary module. This enables:
- Easy content updates
- Community-created modules
- Personal customization
- Long-term maintainability

### 2. Fluent Understanding Over Translation
We prioritize **recognition without translation**:
- Present words in authentic contexts
- Use monolingual definitions when possible
- Test understanding through multiple modalities
- Build automatic recognition patterns

### 3. Evidence-Based Design
Every design decision grounded in:
- Cognitive science research
- Spaced repetition theory
- Multi-modal learning principles
- Active recall testing

### 4. User Extensibility
Users should be able to:
- Add their own cards
- Customize official content
- Create entirely new modules
- Share with others

### 5. Maintainability First
Code and content structured for:
- Easy debugging
- Clear documentation
- Modular architecture
- Long-term sustainability

---

## Success Metrics

### Learning Effectiveness
- **Retention rate:** % of words retained after 30/60/90 days
- **Review accuracy:** % of correct answers during reviews
- **Time to mastery:** Average reviews needed to reach mastery

### User Engagement
- **Daily active users:** Consistent study habit formation
- **Session length:** Average time spent per study session
- **Completion rates:** % of started modules completed
- **Streak maintenance:** Consecutive days of study

### Content Ecosystem
- **Module diversity:** Number of available modules across domains/languages
- **Community contributions:** User-created modules shared
- **Module quality:** Average cards per entry, media richness

---

## Competitive Advantages

### vs. Traditional Flashcard Apps (Anki, Quizlet)
✅ **Multiple cards per term** (not just one front/back)  
✅ **Randomized presentation** (prevents pattern memorization)  
✅ **Content-agnostic architecture** (one app for everything)  
✅ **Built-in module builder** (easier content creation)

### vs. Language-Specific Apps (Duolingo, Babbel)
✅ **Works for ANY domain** (not just language learning)  
✅ **User-created content** (not limited to official lessons)  
✅ **Deeper customization** (add personal associations)  
✅ **No subscription required** (open module format)

### vs. Domain-Specific Tools (Medical flashcards, etc.)
✅ **Universal platform** (one tool for all subjects)  
✅ **Multi-modal learning** (not just text)  
✅ **Better spaced repetition** (optimized algorithms)  
✅ **Cross-domain transfer** (skills learned once, applied everywhere)

---

## Project Scope

### In Scope (MVP)

**Core Learning Engine**
- Spaced repetition scheduler (SM-2)
- Multi-card presentation system
- Answer validation with fuzzy matching
- Basic progress tracking

**Card Types**
- Image
- Video
- Audio
- Definition (text)
- Cloze (fill-in-blank)
- Trivia

**Data Management**
- JSON module format
- Module import/export
- User customization storage
- Sample modules for testing

**Basic UI**
- Card presentation interface
- Answer input
- Feedback display
- Simple progress dashboard

### Out of Scope (Post-MVP)

**Advanced Features**
- Social/multiplayer features
- Cloud sync
- Mobile apps (native)
- Speech recognition for pronunciation
- Gamification (points, badges, leaderboards)
- AI-generated card content

**Advanced Builder**
- Visual module editor
- Batch import from spreadsheets
- Automated media fetching
- Collaborative editing

**Platform Extensions**
- Browser extension
- API for third-party integrations
- LMS integration (Canvas, Moodle)
- Analytics dashboard for educators

---

## Technical Constraints

### Must Support
- ✅ Offline functionality
- ✅ Cross-platform compatibility
- ✅ Multiple media formats (jpg, mp4, mp3)
- ✅ Large vocabulary sets (1000+ entries)
- ✅ Fast card loading (<1 second)

### Should Support (Nice to Have)
- Cloud backup
- Multi-device sync
- Collaborative modules
- Progress export

### Won't Support (Initially)
- Real-time multiplayer
- Live video streaming
- Speech synthesis
- Handwriting recognition

---

## Development Phases

### Phase 1: Foundation (Current)
**Goal:** Finalize architecture and data structures  
- ✅ Requirements gathering
- ✅ Data schema design
- ✅ Architecture documentation
- ⏳ JSON schema validation
- ⏳ Sample module creation

### Phase 2: Core Engine
**Goal:** Build functional spaced repetition system  
- Implement SM-2 algorithm
- Build card selector
- Create answer validator
- Test with sample modules

### Phase 3: User Interface
**Goal:** Make it usable for learners  
- Card presentation UI
- Session flow
- Progress dashboard
- Settings/preferences

### Phase 4: Module Builder
**Goal:** Enable content creation  
- Simple module creation form
- Media upload management
- Module validation
- Export functionality

### Phase 5: Polish & Testing
**Goal:** Production-ready MVP  
- User testing
- Performance optimization
- Documentation completion
- Sample module library

---

## Open Questions

### Technical Decisions TBD
- [ ] Platform choice (web app, desktop, mobile-first?)
- [ ] Programming language/framework
- [ ] Database vs. file-based storage
- [ ] Media hosting strategy (local vs. CDN)

### Product Decisions TBD
- [ ] Pricing model (free, paid, freemium?)
- [ ] License for software and modules
- [ ] Community governance model
- [ ] Module quality standards

### Design Decisions TBD
- [ ] Visual design language
- [ ] Accessibility requirements (WCAG level?)
- [ ] Internationalization strategy
- [ ] Default module library

---

## Next Steps

### Immediate (This Week)
1. ✅ Complete data schema documentation
2. Create JSON schema validator
3. Build first sample module (Spanish Animals)
4. Design spaced repetition algorithm specification

### Short Term (This Month)
1. Implement core learning engine
2. Build basic card presenter
3. Create module builder wireframes
4. Write implementation guide for developers

### Medium Term (Next 3 Months)
1. Complete MVP development
2. Conduct user testing
3. Create 5-10 sample modules
4. Launch to early adopters

---

## Resources & References

### Learning Science
- Ebbinghaus forgetting curve
- Spaced repetition research (Piotr Wozniak)
- Dual coding theory
- Testing effect studies

### Technical Resources
- JSON Schema specification
- SM-2 algorithm documentation
- Fuzzy string matching algorithms
- Media format standards

### Inspirational Products
- Anki (spaced repetition leader)
- Duolingo (engagement mechanics)
- Notion (data flexibility)
- Obsidian (extensibility)

---

**Document Owner:** Dr. Alex Chen (Instructional Technology Architect)  
**Review Cycle:** Weekly during design phase, monthly during development  
**Feedback:** Document maintained in project repository
