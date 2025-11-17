# Requirements Document

**Document Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Status:** Approved for MVP Development

---

## User Journey Priorities

Ranked in order of importance for MVP:

1. **Learning/Practice** (CRITICAL) - Core study and review mechanics
2. **Assessment/Mastery** (HIGH) - Progress tracking and mastery indicators
3. **Progress/Motivation** (MEDIUM) - Engagement and statistics
4. **Discovery/Input** (LOW) - Module browsing and vocabulary addition

---

## Target Audience

### Primary Users

**Universal Learners**
- People of all skill levels (beginner to advanced)
- Anyone wanting to master vocabulary fluently
- Learners who want to understand, not translate
- Applicable to both foreign languages AND specialized domains

**Use Cases:**
- ESL student learning English vocabulary
- Medical student mastering terminology
- Business professional learning industry jargon
- Language enthusiast studying Spanish, French, Mandarin, etc.
- Computer science student learning technical terms

---

## Functional Requirements

### FR1: Multi-Card Vocabulary System

**Requirement:** Each vocabulary entry must support multiple learning cards with random selection.

**Specifications:**
- Each vocabulary entry MUST have at least 1 card
- Each vocabulary entry SHOULD have 3-5 cards for optimal learning
- When review is due, system MUST randomly select one card from available cards
- System MUST support these card types in MVP:
  - Image cards
  - Video cards
  - Audio cards
  - Definition cards (text)
  - Cloze cards (fill-in-blank)
  - Trivia cards

**Rationale:** Multiple retrieval pathways prevent pattern memorization and build deeper understanding.

**Priority:** P0 (Blocker for MVP)

---

### FR2: Spaced Repetition Learning

**Requirement:** System must use spaced repetition to optimize review timing.

**Specifications:**
- MUST implement SM-2 or similar algorithm
- MUST track word-level mastery state:
  - Interval (days until next review)
  - Ease factor (difficulty multiplier)
  - Repetition count
  - Last review date
  - Next review date
- MUST adjust intervals based on user performance (correct/incorrect)
- SHOULD allow users to manually override review schedule

**Rationale:** Spaced repetition is proven to optimize long-term retention.

**Priority:** P0 (Blocker for MVP)

---

### FR3: Answer Validation

**Requirement:** System must validate user answers with fuzzy matching.

**Specifications:**
- MUST accept typed text input
- MUST use fuzzy string matching to allow minor typos
- MUST support multiple correct answers (synonyms, variations)
- SHOULD provide immediate feedback (correct/incorrect)
- SHOULD show expected answer after user responds
- MAY support multiple input methods (typing, multiple choice, self-assessment) in future

**Rationale:** Typed answers test true recall, fuzzy matching reduces frustration from typos.

**Priority:** P0 (Blocker for MVP)

---

### FR4: Module-Based Content Architecture

**Requirement:** Software must be completely separate from vocabulary data.

**Specifications:**
- Vocabulary content MUST be stored in standalone module files (JSON)
- Module files MUST be human-readable and editable
- System MUST support loading/importing module files
- System MUST support multiple simultaneous modules
- Module files MUST include:
  - Module metadata (title, author, language, domain)
  - Vocabulary entries (terms with cards)
  - Media references (images, videos, audio)
- Module format MUST be version-controlled for future compatibility

**Rationale:** Separation enables easy content updates, user-generated modules, and long-term maintainability.

**Priority:** P0 (Blocker for MVP)

---

### FR5: User Customization

**Requirement:** Users must be able to extend official modules with personal additions.

**Specifications:**
- Users MUST be able to add personal notes to any vocabulary entry
- Users MUST be able to create custom cards for existing entries
- Users SHOULD be able to add custom tags
- Users SHOULD be able to add mnemonics
- User customizations MUST persist across module updates
- User customizations MUST be stored separately from official module files

**Rationale:** Personal associations enhance memory, and customizations shouldn't be lost when modules update.

**Priority:** P1 (Important for MVP)

---

### FR6: Progress Tracking

**Requirement:** System must track and display learning progress.

**Specifications:**
- MUST track per-entry mastery state
- MUST track review history (correct/incorrect)
- MUST display basic statistics:
  - Words learned
  - Review accuracy
  - Daily streak
- SHOULD allow filtering by module
- SHOULD provide progress visualization

**Rationale:** Progress visibility motivates continued learning.

**Priority:** P1 (Important for MVP)

---

### FR7: Media Support

**Requirement:** System must support rich media in learning cards.

**Specifications:**
- MUST support image formats: JPG, PNG, WebP, GIF
- MUST support video formats: MP4, WebM
- MUST support audio formats: MP3, OGG, WAV
- MUST handle relative file paths (media bundled with module)
- SHOULD support external URLs for hosted media (future)
- Video playback MUST include:
  - Autoplay option
  - Loop option
  - Playback controls
  - Maximum recommended duration: 30 seconds

**Rationale:** Multi-modal presentation is central to the learning approach.

**Priority:** P0 (Blocker for MVP)

---

### FR8: Module Validation

**Requirement:** System must validate module file integrity.

**Specifications:**
- MUST provide JSON schema for modules
- MUST validate modules against schema on import
- MUST report validation errors clearly
- SHOULD warn about missing media files
- SHOULD validate data type correctness

**Rationale:** Prevents broken or malformed modules from causing errors.

**Priority:** P1 (Important for MVP)

---

### FR9: Session Management

**Requirement:** System must manage review sessions effectively.

**Specifications:**
- MUST determine which words are due for review
- MUST present cards one at a time
- MUST allow user to progress at their own pace
- SHOULD limit session length based on user preference
- SHOULD provide session summary at completion

**Rationale:** Structured sessions prevent overwhelm and maintain engagement.

**Priority:** P0 (Blocker for MVP)

---

### FR10: Module Builder (Simplified)

**Requirement:** Provide basic UI for creating vocabulary modules without manual JSON editing.

**Specifications:**
- MVP: Simple form-based module creation
- MUST allow adding vocabulary entries
- MUST allow uploading media files
- MUST generate valid module JSON
- MUST validate entries before export
- SHOULD provide card templates for quick creation
- Post-MVP: Full visual editor with drag-and-drop

**Rationale:** Reduces barrier to content creation.

**Priority:** P2 (Nice to have for MVP, required post-MVP)

---

## Non-Functional Requirements

### NFR1: Performance

**Specifications:**
- Card loading MUST complete within 1 second
- Media files SHOULD be optimized:
  - Images: <500KB each
  - Videos: <2MB each, <30 seconds
  - Audio: <1MB each
- System MUST support modules with 1000+ entries without degradation
- Review session MUST remain responsive with no lag

**Priority:** P0

---

### NFR2: Usability

**Specifications:**
- Interface MUST be intuitive for first-time users
- Core learning flow MUST require <5 minutes to understand
- Error messages MUST be clear and actionable
- System MUST work offline (no internet required for core features)

**Priority:** P0

---

### NFR3: Accessibility

**Specifications:**
- SHOULD follow WCAG 2.1 Level AA guidelines
- MUST support keyboard navigation
- MUST provide alt text for images
- SHOULD support screen readers

**Priority:** P1

---

### NFR4: Maintainability

**Specifications:**
- Code MUST be modular and well-documented
- Module format MUST be version-controlled
- System MUST handle future schema versions gracefully
- Documentation MUST be kept up-to-date

**Priority:** P0

---

### NFR5: Portability

**Specifications:**
- Modules MUST be portable (copy folder = copy module)
- User data SHOULD be exportable
- System SHOULD support cross-platform use (web, desktop, mobile)

**Priority:** P1

---

## Data Requirements

### DR1: Module Data Structure

**Required Fields (Module Level):**
- `module_id`: Unique identifier
- `title`: Human-readable name
- `version`: Semantic versioning
- `language`: ISO 639-1 language code
- `vocabulary_entries`: Array of entries (minimum 1)

**Required Fields (Entry Level):**
- `entry_id`: Unique within module
- `term`: The vocabulary word/phrase
- `cards`: Array of cards (minimum 1)

**Required Fields (Card Level):**
- `card_id`: Unique identifier
- `card_type`: One of supported types
- `content`: Card-specific content object

See [02-data-schema.md](02-data-schema.md) for complete specification.

---

### DR2: User Progress Data

**Required Fields:**
- User identifier
- Entry identifier
- Mastery state:
  - Interval (days)
  - Ease factor (float)
  - Repetitions (integer)
  - Last reviewed (datetime)
  - Next review (datetime)
- Review history:
  - Timestamp
  - Card shown
  - User response
  - Correct/incorrect

---

### DR3: User Customization Data

**Stored Separately from Official Modules:**
- Module ID + Entry ID reference
- Personal notes (text)
- Custom cards (same structure as official cards)
- Mnemonics (text)
- Custom tags (array of strings)
- Difficulty override (optional)

---

## Card Type Requirements

### Image Cards

**MUST Support:**
- Display image
- Show prompt text
- Accept typed answer
- Validate against expected answer + alternatives

**Content Fields:**
- `image_url`: Path to image file (required)
- `prompt_text`: Question to ask (required)
- `expected_answer`: Correct answer (required)
- `alternative_answers`: Acceptable variations (optional)
- `hint`: Help text (optional)

---

### Video Cards

**MUST Support:**
- Play video (autoplay, loop, controls)
- Show prompt text
- Accept typed answer
- Validate against expected answer + alternatives

**Content Fields:**
- `video_url`: Path to video file (required)
- `prompt_text`: Question to ask (required)
- `expected_answer`: Correct answer (required)
- `duration_seconds`: Video length (optional but recommended)
- `playback_settings`: Autoplay, loop, controls (optional)

**Constraints:**
- Recommended maximum duration: 30 seconds
- File size target: <2MB

---

### Audio Cards

**MUST Support:**
- Play audio
- Show prompt text
- Accept typed answer
- Validate against expected answer + alternatives

**Content Fields:**
- `audio_url`: Path to audio file (required)
- `prompt_text`: Question to ask (required)
- `expected_answer`: Correct answer (required)
- `playback_settings`: Playback speed options (optional)

---

### Definition Cards

**MUST Support:**
- Display definition text
- Show prompt text
- Accept typed answer
- Validate against expected answer + alternatives

**Content Fields:**
- `definition`: The definition text (required)
- `expected_answer`: Correct answer (required)
- `prompt_text`: Question to ask (optional, has default)

---

### Cloze Cards (Fill-in-Blank)

**MUST Support:**
- Display sentence with blank
- Accept typed answer for missing word
- Validate against expected answer + alternatives

**Content Fields:**
- `sentence`: Full sentence with blank marker (required)
- `missing_word`: The word that goes in blank (required)
- `sentence_translation`: Translation (optional, for language learning)

---

### Trivia Cards

**MUST Support:**
- Display question
- Accept typed answer
- Validate against expected answer + alternatives

**Content Fields:**
- `question`: The trivia question (required)
- `expected_answer`: Correct answer (required)
- `hint`: Optional hint text

---

## Algorithm Requirements

### Spaced Repetition Algorithm (SM-2 Based)

**Parameters:**
- Initial interval: 1 day
- Minimum interval: 1 day
- Maximum interval: 365 days (1 year)
- Initial ease factor: 2.5

**Logic:**
```
If answer correct:
  - Increase interval (multiply by ease factor)
  - Slightly increase ease factor (max 3.0)
  - Increment repetition count

If answer incorrect:
  - Reset interval to 1 day
  - Decrease ease factor (min 1.3)
  - Reset repetition count to 0
```

**Review Scheduling:**
- Words with `next_review` <= current_date are "due"
- Present due words in order (oldest first, or random)
- After each review, update mastery state immediately

---

## User Interface Requirements

### Card Presentation Screen

**MUST Include:**
- Card content display (image/video/audio/text)
- Prompt text
- Answer input field
- Submit button
- Progress indicator (cards remaining)

**SHOULD Include:**
- Hint button (reveals hint if available)
- Skip button (mark as incorrect, move to next)
- Session timer

---

### Feedback Screen

**MUST Show:**
- Correct/Incorrect indicator
- Expected answer
- User's answer (if incorrect)
- Continue button

**SHOULD Show:**
- Additional context (definition, usage notes)
- Related terms
- Encouragement message

---

### Progress Dashboard

**MUST Show:**
- Total words learned
- Words due today
- Review accuracy (%)
- Daily streak

**SHOULD Show:**
- Words by mastery level
- Module progress breakdown
- Recent activity
- Upcoming reviews

---

## Technical Constraints

### Platform Support
- **MVP:** Desktop/Web browser (primary target)
- **Future:** Mobile apps (iOS, Android)
- **Future:** Command-line interface

### File Storage
- **MVP:** Local file system
- **Future:** Cloud storage with sync

### Database
- **MVP:** File-based (JSON for user progress)
- **Future:** SQLite or similar embedded database

### Network
- **MVP:** Offline-capable (no internet required)
- **Future:** Optional online features (sync, shared modules)

---

## Out of Scope (Deferred to Post-MVP)

### Features NOT in MVP
- ❌ Social/multiplayer features
- ❌ Cloud sync across devices
- ❌ Native mobile apps
- ❌ Speech recognition for pronunciation
- ❌ AI-generated card content
- ❌ Gamification (points, badges, leaderboards)
- ❌ Community module marketplace
- ❌ Collaborative module editing
- ❌ Advanced analytics dashboard
- ❌ LMS integration (Canvas, Moodle, etc.)

### Features for Future Consideration
- Self-assessment mode ("I know it" / "I don't know it")
- Multiple choice option (easier than typed)
- Card-level mastery tracking (vs. word-level only)
- Adaptive card selection (prioritize weak card types)
- Auto-generated example sentences using AI
- Image search integration for automatic card creation
- Text-to-speech for audio card generation
- Handwriting recognition (mobile)

---

## Success Criteria (MVP)

The MVP will be considered successful if:

✅ **Core Learning Works**
- Users can import a module
- Users can review due vocabulary
- System correctly implements spaced repetition
- Cards present randomly from available pool
- Answers validate with fuzzy matching

✅ **Data Structure Solid**
- Modules follow documented schema
- User customizations persist correctly
- Module updates don't break user data

✅ **Usability Acceptable**
- First-time users can complete a review session within 5 minutes
- No critical bugs during normal use
- Media loads quickly (<1 second per card)

✅ **Content Creation Possible**
- Module creators can build valid modules
- Sample modules demonstrate all card types
- Validation catches common errors

---

## Acceptance Criteria

### Must Pass Before MVP Launch

**Functional Testing:**
- [ ] All card types render correctly
- [ ] Spaced repetition intervals calculate correctly
- [ ] Answer validation works with fuzzy matching
- [ ] User customizations save and load properly
- [ ] Module import validates schema
- [ ] Media files load without errors

**Performance Testing:**
- [ ] Card loads in <1 second
- [ ] Supports module with 1000+ entries
- [ ] No lag during review sessions

**Usability Testing:**
- [ ] 5 new users complete first session without help
- [ ] Error messages are understandable
- [ ] No confusion about how to proceed

**Content Testing:**
- [ ] At least 3 complete sample modules created
- [ ] Sample modules cover different domains (language, technical, academic)
- [ ] All card types represented in samples

---

## Risks & Mitigation

### Risk: Media File Size Issues
**Mitigation:** 
- Document file size limits clearly
- Provide compression guidelines
- Implement file size warnings in module builder

### Risk: Complex JSON Intimidates Content Creators
**Mitigation:**
- Provide module builder UI
- Create easy-to-use templates
- Offer simple examples

### Risk: Algorithm Tuning Difficulties
**Mitigation:**
- Start with proven SM-2 algorithm
- Make parameters adjustable
- Collect user feedback on difficulty

### Risk: Cross-Platform Compatibility
**Mitigation:**
- Use standard file formats (JSON, MP4, MP3)
- Test on multiple operating systems
- Provide fallbacks for unsupported features

---

## Dependencies

### External Libraries (Proposed)
- JSON Schema validator
- Fuzzy string matching library (e.g., fuzzywuzzy, Levenshtein)
- Media player libraries (platform-dependent)
- File system libraries (platform-dependent)

### Assets Needed
- Sample vocabulary modules (3+ for testing)
- Sample media files (images, videos, audio)
- Documentation examples
- Module templates

---

## Timeline Estimate

**Phase 1: Data & Architecture** (2 weeks) ✅ Current  
**Phase 2: Core Engine** (3 weeks)  
**Phase 3: UI Implementation** (3 weeks)  
**Phase 4: Module Builder** (2 weeks)  
**Phase 5: Testing & Polish** (2 weeks)  

**Total MVP Timeline:** 12 weeks

---

## Appendix: User Stories

### Learner Stories

**As a Spanish learner**, I want to see different types of practice for the same word, so that I truly understand it rather than just memorizing one flashcard.

**As a medical student**, I want to study terminology using images and definitions, so I can recognize terms in clinical contexts.

**As a vocabulary learner**, I want the system to automatically schedule my reviews, so I don't waste time reviewing words I already know well.

**As a user**, I want to add personal notes to vocabulary entries, so I can include memory tricks that work for me.

---

### Content Creator Stories

**As a teacher**, I want to create custom vocabulary modules for my students, so they can study material that matches our curriculum.

**As a module creator**, I want to upload images and videos easily, so I can create rich, engaging content.

**As a content creator**, I want to validate my module files, so I know they'll work correctly before sharing.

**As a module author**, I want to update my modules with new content, so users get improvements without losing their progress.

---

**Document Maintained By:** Dr. Alex Chen  
**Review Frequency:** Weekly during design, monthly during development  
**Change Log:** Track all requirement changes in decision-log.md
