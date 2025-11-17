# Decision Log

**Purpose:** Record all major architectural and design decisions for future reference.

**Format:** Each decision includes context, options considered, decision made, and rationale.

---

## Decision 001: Multi-Card Architecture
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
Traditional flashcard systems present the same card repeatedly for each word, leading to pattern memorization rather than true comprehension.

**Options Considered:**
1. Single card per word (traditional approach)
2. Multiple cards with manual selection
3. Multiple cards with random selection

**Decision:** Option 3 - Multiple cards with random selection

**Rationale:**
- Prevents pattern memorization
- Tests true understanding from multiple angles
- Builds multiple retrieval pathways
- Random selection prevents predictability

---

## Decision 002: Software-Data Separation
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
Need to decide if vocabulary content should be bundled with application or stored separately.

**Options Considered:**
1. Vocabulary embedded in application code
2. Vocabulary in separate files (modules)
3. Vocabulary in online database

**Decision:** Option 2 - Separate JSON module files

**Rationale:**
- Enables user-created content
- Easy to update content without updating software
- Portable modules (copy folder = copy course)
- Works offline
- Community can share modules

---

## Decision 003: JSON Format for Modules
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
Need to choose data format for vocabulary modules.

**Options Considered:**
1. JSON
2. YAML
3. XML
4. Custom binary format
5. SQLite database files

**Decision:** Option 1 - JSON (with potential YAML support later)

**Rationale:**
- Widely supported
- Human-readable
- Easy to parse and validate
- Formal schema available (JSON Schema)
- Future: Add YAML support for easier hand-editing

---

## Decision 004: Word-Level Mastery Tracking (MVP)
**Date:** 2025-11-16  
**Status:** Approved for MVP

**Context:**  
Should mastery be tracked at word-level or card-level?

**Options Considered:**
1. Word-level only (all cards share same schedule)
2. Card-level (each card has independent schedule)
3. Hybrid (word-level scheduling, card-level analytics)

**Decision:** Option 1 for MVP, design to allow Option 3 later

**Rationale:**
- Simpler algorithm for MVP
- Sufficient for proving concept
- Data structure allows future card-level tracking
- Can add card-level analytics post-MVP without breaking changes

---

## Decision 005: SM-2 Algorithm
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
Which spaced repetition algorithm to use?

**Options Considered:**
1. SM-2 (SuperMemo 2)
2. SM-18 (latest SuperMemo)
3. Anki's modified SM-2
4. Custom algorithm

**Decision:** Option 1 - Standard SM-2

**Rationale:**
- Well-tested and proven effective
- Simple to implement
- Well-documented
- Can be modified/replaced later if needed

---

## Decision 006: Pure Random Card Selection (MVP)
**Date:** 2025-11-16  
**Status:** Approved for MVP

**Context:**  
How should system choose which card to show?

**Options Considered:**
1. Pure random
2. Weighted random (avoid recent cards)
3. Round-robin (cycle through all)
4. Adaptive (based on per-card performance)

**Decision:** Option 1 for MVP

**Rationale:**
- Simplest implementation
- Still achieves goal of variety
- With 3-5 cards per word, consecutive repeats are rare
- Can enhance later without architectural changes

---

## Decision 007: Relative File Paths for Media
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
How should modules reference media files?

**Options Considered:**
1. Relative paths (from module file)
2. Absolute paths
3. URLs to hosted content
4. Base64-encoded inline

**Decision:** Option 1 - Relative paths (Option 3 supported later)

**Rationale:**
- Portable: copy folder works anywhere
- Simple: no hosting infrastructure needed
- Offline-capable
- Future: Add URL support for optional online content

---

## Decision 008: Typed Answer Input (MVP)
**Date:** 2025-11-16  
**Status:** Approved for MVP

**Context:**  
How should users provide answers?

**Options Considered:**
1. Typed text input only
2. Multiple choice only
3. Self-assessment ("I know it" / "Don't know")
4. Mix of all above

**Decision:** Option 1 for MVP

**Rationale:**
- Tests true recall (no recognition shortcuts)
- Fuzzy matching handles minor typos
- Most rigorous testing method
- Can add other methods post-MVP

---

## Decision 009: User Customizations Stored Separately
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
Where should user's personal additions be stored?

**Options Considered:**
1. Modify original module file
2. Separate user customization file
3. Database

**Decision:** Option 2 - Separate files linked by entry_id

**Rationale:**
- Preserves official modules intact
- Module updates don't erase user work
- Clear separation of official vs. personal
- Easy to backup user data separately

---

## Decision 010: Video Card Type Included in MVP
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
User requested video card support. Should it be in MVP or deferred?

**Options Considered:**
1. Include in MVP
2. Defer to post-MVP

**Decision:** Option 1 - Include in MVP

**Rationale:**
- User specifically requested it
- Important for certain learning domains (sign language, actions, etc.)
- Architecture already supports it (same as images but with playback)
- Technical complexity is manageable

---

## Decision 011: Module Builder Deferred to Post-MVP
**Date:** 2025-11-16  
**Status:** Approved

**Context:**  
Should GUI module builder be in MVP?

**Options Considered:**
1. Full GUI builder in MVP
2. Simple form-based builder in MVP
3. Manual JSON editing only (MVP), builder later

**Decision:** Option 2/3 hybrid - Minimal builder if time permits, full builder post-MVP

**Rationale:**
- Learning engine is higher priority
- Manual JSON with templates is acceptable for MVP
- Module builder can be added once engine is proven
- Focus resources on core learning experience first

---

## Pending Decisions

### PD-001: Platform Choice
**Status:** Under consideration  
**Options:**
- Python desktop app (Tkinter/PyQt)
- Electron (web technologies)
- Web app (React/Vue)
- Native mobile apps

**Next Step:** Prototype with Python to validate learning mechanics

### PD-002: Licensing
**Status:** TBD  
**Options:**
- Open source (MIT, GPL, Apache)
- Proprietary
- Dual license

**Next Step:** Decide after MVP completion

---

**Document Maintained By:** Dr. Alex Chen  
**Update Frequency:** After each major decision  
**Review:** Before each development phase
