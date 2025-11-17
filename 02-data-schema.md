# Data Schema Documentation

**Document Version:** 1.0.0  
**Schema Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Status:** Finalized for MVP

---

## Overview

This document defines the complete data structure for vocabulary learning modules. The schema is designed to be:

- **Content-agnostic:** Works for any language or domain
- **Extensible:** New fields can be added without breaking existing modules
- **Human-readable:** JSON format that's easy to understand and edit
- **Validatable:** Formal JSON Schema for automated checking

---

## Simple Explanation

### The Big Picture

Think of the system like a **textbook with multiple types of flashcards**:

- **The Module** = The complete textbook (e.g., "Spanish Animals 101")
- **Vocabulary Entries** = Individual words/terms being learned (e.g., "perro" = dog)
- **Cards** = Different ways to practice the same word (image, video, audio, definition, etc.)

### How It Works

1. A **module file** contains metadata and all vocabulary entries
2. Each **vocabulary entry** represents one term with multiple practice cards
3. Each **card** presents the term in a different way (visual, auditory, textual, etc.)
4. When reviewing, the system **randomly picks one card** from the entry's card pool
5. This creates variety and tests true comprehension, not just memorization

---

## Complete Schema Structure

```
Module (Top Level)
├── schema_version
├── module_metadata
│   ├── module_id
│   ├── title
│   ├── description
│   ├── version
│   ├── author
│   ├── language
│   ├── domain
│   ├── difficulty_level
│   ├── target_audience
│   ├── entry_count
│   ├── created_date
│   ├── updated_date
│   ├── license
│   ├── tags
│   └── source
├── vocabulary_entries[]
│   ├── entry_id
│   ├── term
│   ├── term_language
│   ├── difficulty
│   ├── core_information
│   │   ├── definitions[]
│   │   ├── part_of_speech
│   │   ├── related_terms[]
│   │   ├── domain
│   │   ├── tags[]
│   │   ├── usage_notes
│   │   └── etymology
│   ├── cards[]
│   │   ├── card_id
│   │   ├── card_type
│   │   ├── prompt_type
│   │   ├── difficulty
│   │   └── content (varies by card_type)
│   └── user_additions
│       ├── personal_notes
│       ├── custom_cards[]
│       ├── mnemonics
│       ├── custom_tags[]
│       ├── favorite
│       └── difficulty_override
└── module_settings
    ├── default_learning_direction
    ├── enable_audio
    ├── enable_video
    ├── suggested_daily_new_words
    ├── suggested_daily_reviews
    ├── review_algorithm
    └── card_selection_strategy
```

---

## Field Definitions

### Top Level (Module Container)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | string | No | Version of this schema format (default: "1.0.0") |
| `module_metadata` | object | Yes | Information about the module |
| `vocabulary_entries` | array | Yes | Array of vocabulary terms with cards (min: 1) |
| `module_settings` | object | No | Default settings for learning this module |

---

### Module Metadata

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `module_id` | string | Yes | Unique identifier (kebab-case) | "spanish-animals-basics" |
| `title` | string | Yes | Human-readable title | "Spanish Animals Vocabulary - Basics" |
| `description` | string | No | Detailed description | "Essential animal vocabulary..." |
| `version` | string | Yes | Semantic version | "1.0.0" |
| `author` | string | No | Creator name/organization | "Dr. Maria Rodriguez" |
| `language` | string | Yes | ISO 639-1 language code | "es" (Spanish) |
| `domain` | string | No | Subject domain | "medical", "business", "general" |
| `difficulty_level` | enum | No | Overall difficulty | "beginner", "intermediate", "advanced", "mixed" |
| `target_audience` | string | No | Intended learners | "ESL students", "Medical professionals" |
| `entry_count` | integer | No | Total vocabulary entries | 250 |
| `created_date` | string | No | Date created (YYYY-MM-DD) | "2025-01-15" |
| `updated_date` | string | No | Date last updated | "2025-01-20" |
| `license` | string | No | Content license | "CC BY-SA 4.0", "MIT", "Proprietary" |
| `tags` | array | No | Searchable tags | ["medical", "spanish", "healthcare"] |
| `source` | string | No | Original source | "Oxford English Dictionary" |

---

### Vocabulary Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entry_id` | string | Yes | Unique identifier within module (kebab-case) |
| `term` | string | Yes | The vocabulary word/phrase being learned |
| `term_language` | string | No | ISO 639-1 code for the term's language |
| `difficulty` | enum | No | "beginner", "intermediate", "advanced" |
| `core_information` | object | No | Reference information about the term |
| `cards` | array | Yes | Array of learning cards (min: 1) |
| `user_additions` | object | No | Space for user customizations |

---

### Core Information

Supplementary reference information (not directly used in cards, but available to learners).

| Field | Type | Description |
|-------|------|-------------|
| `definitions` | array | Dictionary-style definitions in various languages |
| `part_of_speech` | enum | "noun", "verb", "adjective", etc. |
| `related_terms` | array | Related vocabulary (synonyms, word family) |
| `domain` | string | Specific subject domain for this term |
| `tags` | array | Categorization tags |
| `usage_notes` | string | Context about proper usage, formality, etc. |
| `etymology` | string | Word origin and history |

**Definition Object:**
```json
{
  "language": "es",
  "text": "Animal doméstico carnívoro...",
  "source": "RAE Dictionary" (optional)
}
```

---

### Card (Generic)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card_id` | string | Yes | Unique identifier (format: entry-id-type-number) |
| `card_type` | enum | Yes | "image", "video", "audio", "definition", "cloze", "trivia" |
| `prompt_type` | enum | No | "recognition" or "production" (default: "recognition") |
| `difficulty` | enum | No | "easy", "medium", "hard" |
| `content` | object | Yes | Card-specific content (structure varies by card_type) |

---

## Card Type Specifications

### Image Card

**Purpose:** Show an image, user identifies the term.

**Content Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_url` | string | Yes | Relative or absolute path to image file |
| `image_thumbnail` | string | No | Optional smaller preview image |
| `alt_text` | string | No | Accessibility description |
| `prompt_text` | string | Yes | Question to display |
| `prompt_translation` | string | No | Translation of prompt (for language learning) |
| `expected_answer` | string | Yes | The correct answer |
| `alternative_answers` | array | No | Acceptable alternative answers |
| `hint` | string | No | Optional hint text |
| `context` | string | No | Additional context about the image |

**Example:**
```json
{
  "card_id": "perro-001-img-01",
  "card_type": "image",
  "prompt_type": "recognition",
  "difficulty": "easy",
  "content": {
    "image_url": "images/golden-retriever.jpg",
    "alt_text": "A golden retriever sitting in grass",
    "prompt_text": "¿Qué animal es este?",
    "prompt_translation": "What animal is this?",
    "expected_answer": "perro",
    "alternative_answers": ["can", "chucho"],
    "context": "Common household pet"
  }
}
```

---

### Video Card

**Purpose:** Show a video clip, user identifies the term.

**Content Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video_url` | string | Yes | Relative or absolute path to video file |
| `video_thumbnail` | string | No | Preview image before video loads |
| `duration_seconds` | integer | No | Length of video clip (recommended) |
| `prompt_text` | string | Yes | Question to display |
| `prompt_translation` | string | No | Translation of prompt |
| `expected_answer` | string | Yes | The correct answer |
| `alternative_answers` | array | No | Acceptable alternatives |
| `hint` | string | No | Optional hint |
| `context` | string | No | Description of what video shows |
| `playback_settings` | object | No | Video playback configuration |

**Playback Settings:**
```json
{
  "autoplay": true,
  "loop": true,
  "show_controls": true,
  "mute_by_default": false
}
```

**Example:**
```json
{
  "card_id": "perro-001-video-01",
  "card_type": "video",
  "difficulty": "easy",
  "content": {
    "video_url": "videos/dog-playing-fetch.mp4",
    "video_thumbnail": "videos/thumbs/dog-playing-fetch.jpg",
    "duration_seconds": 8,
    "prompt_text": "¿Qué animal ves en el video?",
    "prompt_translation": "What animal do you see in the video?",
    "expected_answer": "perro",
    "context": "Dog playing fetch in park",
    "playback_settings": {
      "autoplay": true,
      "loop": true,
      "show_controls": true
    }
  }
}
```

**Recommended Constraints:**
- Maximum duration: 30 seconds
- File size: <2MB
- Format: MP4 (H.264 codec)

---

### Audio Card

**Purpose:** Play audio, user identifies the term or types what they hear.

**Content Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio_url` | string | Yes | Relative or absolute path to audio file |
| `duration_seconds` | integer | No | Length of audio clip |
| `prompt_text` | string | Yes | Question to display |
| `prompt_translation` | string | No | Translation of prompt |
| `expected_answer` | string | Yes | The correct answer |
| `alternative_answers` | array | No | Acceptable alternatives |
| `hint` | string | No | Optional hint |
| `ipa_transcription` | string | No | International Phonetic Alphabet transcription |
| `playback_settings` | object | No | Audio playback configuration |

**Playback Settings:**
```json
{
  "autoplay": true,
  "show_controls": true,
  "playback_speed_options": [0.75, 1.0, 1.25]
}
```

**Example:**
```json
{
  "card_id": "perro-001-audio-01",
  "card_type": "audio",
  "difficulty": "easy",
  "content": {
    "audio_url": "audio/perro-pronunciation.mp3",
    "duration_seconds": 2,
    "prompt_text": "¿Qué palabra escuchas?",
    "prompt_translation": "What word do you hear?",
    "expected_answer": "perro",
    "ipa_transcription": "/ˈpe.ro/",
    "playback_settings": {
      "autoplay": true,
      "show_controls": true
    }
  }
}
```

---

### Definition Card

**Purpose:** Show definition, user identifies the term.

**Content Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `definition` | string | Yes | The definition or description |
| `definition_language` | string | No | ISO 639-1 code for definition language |
| `definition_translation` | string | No | Translation of definition |
| `prompt_text` | string | No | Question (default: "What term matches this definition?") |
| `expected_answer` | string | Yes | The correct answer |
| `alternative_answers` | array | No | Acceptable alternatives |
| `hint` | string | No | Optional hint |

**Example:**
```json
{
  "card_id": "perro-001-def-01",
  "card_type": "definition",
  "difficulty": "medium",
  "content": {
    "definition": "Animal doméstico que ladra y es considerado el mejor amigo del hombre",
    "definition_language": "es",
    "definition_translation": "Domestic animal that barks and is considered man's best friend",
    "prompt_text": "¿Qué animal es?",
    "expected_answer": "perro",
    "alternative_answers": ["can"]
  }
}
```

---

### Cloze Card (Fill-in-the-Blank)

**Purpose:** Show sentence with missing word, user fills in the blank.

**Content Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sentence` | string | Yes | Sentence with blank (use ____ or {blank}) |
| `sentence_language` | string | No | ISO 639-1 code for sentence language |
| `sentence_translation` | string | No | Translation of complete sentence |
| `missing_word` | string | Yes | The word that belongs in the blank |
| `missing_word_position` | integer | No | Word index (for programmatic insertion) |
| `context_clues` | string | No | Hints about the missing word |
| `alternative_answers` | array | No | Acceptable alternatives |

**Example:**
```json
{
  "card_id": "perro-001-cloze-01",
  "card_type": "cloze",
  "difficulty": "medium",
  "content": {
    "sentence": "Mi vecino pasea a su ____ todas las mañanas.",
    "sentence_language": "es",
    "sentence_translation": "My neighbor walks his ____ every morning.",
    "missing_word": "perro",
    "context_clues": "mascota, animal",
    "alternative_answers": ["mascota", "can"]
  }
}
```

---

### Trivia Card

**Purpose:** Ask a question whose answer is the vocabulary term.

**Content Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | A question whose answer is the term |
| `question_language` | string | No | ISO 639-1 code for question language |
| `question_translation` | string | No | Translation of question |
| `expected_answer` | string | Yes | The correct answer |
| `alternative_answers` | array | No | Acceptable alternatives |
| `hint` | string | No | Optional hint |
| `category` | string | No | Type of trivia (cultural, factual, idiomatic) |

**Example:**
```json
{
  "card_id": "perro-001-trivia-01",
  "card_type": "trivia",
  "difficulty": "easy",
  "content": {
    "question": "¿Cuál es el mejor amigo del hombre?",
    "question_language": "es",
    "question_translation": "What is man's best friend?",
    "expected_answer": "perro",
    "alternative_answers": ["can"],
    "hint": "Un animal que ladra",
    "category": "idiomatic"
  }
}
```

---

### User Additions

Space for learner customizations (stored separately from official module).

| Field | Type | Description |
|-------|------|-------------|
| `personal_notes` | string | User's private notes |
| `custom_cards` | array | Additional cards created by user (same structure as official cards) |
| `mnemonics` | string | Memory devices or tricks |
| `custom_tags` | array | User's personal categorization tags |
| `favorite` | boolean | Whether user has marked as important |
| `difficulty_override` | enum | User's personal difficulty assessment |

**Example:**
```json
{
  "user_additions": {
    "personal_notes": "Remember: 'perro' NOT 'pero' (pero = but)",
    "custom_cards": [],
    "mnemonics": "Perro sounds like 'purr-oh' but dogs don't purr!",
    "custom_tags": ["review-pronunciation"],
    "favorite": false,
    "difficulty_override": "medium"
  }
}
```

---

### Module Settings

Recommended settings for learning this module (user can override).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `default_learning_direction` | enum | "recognition" | "recognition", "production", "mixed" |
| `enable_audio` | boolean | true | Whether audio cards are enabled |
| `enable_video` | boolean | true | Whether video cards are enabled |
| `suggested_daily_new_words` | integer | 10 | Recommended new words per day |
| `suggested_daily_reviews` | integer | 50 | Recommended max reviews per session |
| `review_algorithm` | enum | "sm2" | "sm2", "sm2-modified", "leitner" |
| `card_selection_strategy` | enum | "random" | "random", "weighted-random", "round-robin", "adaptive" |

---

## File Organization

### Directory Structure

```
module-name/
├── module.json              # Main module file (contains all metadata and entry data)
├── images/                  # Image files for image cards
│   ├── image001.jpg
│   └── image002.png
├── videos/                  # Video files for video cards
│   ├── video001.mp4
│   └── thumbnails/          # Optional thumbnails
│       └── video001.jpg
└── audio/                   # Audio files for audio cards
    ├── audio001.mp3
    └── audio002.mp3
```

### Media File Paths

**Use relative paths** from the module.json file:
- ✅ `"images/dog.jpg"` (relative)
- ✅ `"./images/dog.jpg"` (explicitly relative)
- ❌ `"/home/user/modules/images/dog.jpg"` (absolute - not portable)
- 🔮 `"https://cdn.example.com/images/dog.jpg"` (URL - future feature)

---

## Complete Example Module

See `examples/spanish-animals-basics/` for a complete, working module demonstrating all card types.

Key excerpt showing structure:

```json
{
  "schema_version": "1.0.0",
  "module_metadata": {
    "module_id": "spanish-animals-basics",
    "title": "Spanish Animals Vocabulary - Basics",
    "version": "1.0.0",
    "language": "es",
    "difficulty_level": "beginner"
  },
  "vocabulary_entries": [
    {
      "entry_id": "perro-001",
      "term": "perro",
      "cards": [
        { "card_type": "image", ... },
        { "card_type": "video", ... },
        { "card_type": "audio", ... },
        { "card_type": "definition", ... },
        { "card_type": "cloze", ... },
        { "card_type": "trivia", ... }
      ]
    }
  ]
}
```

---

## Validation Rules

### Required Field Validation

**Module Level:**
- ✅ `module_metadata` must exist
- ✅ `vocabulary_entries` must be non-empty array

**Entry Level:**
- ✅ `entry_id` must be unique within module
- ✅ `term` must be non-empty string
- ✅ `cards` must be non-empty array (minimum 1 card)

**Card Level:**
- ✅ `card_id` must be unique within entry
- ✅ `card_type` must be valid enum value
- ✅ `content` must match schema for that card_type

### Data Type Validation

**String Fields:**
- Must not be empty when required
- Pattern validation for IDs (kebab-case)
- Pattern validation for language codes (ISO 639-1)

**Integer Fields:**
- Must be non-negative
- Must fall within specified ranges

**Enum Fields:**
- Must match one of the allowed values exactly

**Array Fields:**
- Must be arrays when present
- Must meet minimum/maximum item constraints

### Media File Validation

**Recommended (not enforced by schema):**
- Image files exist at specified paths
- Video files are <2MB
- Audio files exist and are playable
- File formats are supported (jpg, png, mp4, mp3)

---

## Versioning Strategy

### Schema Version

Format: `major.minor.patch`

**Breaking changes** (increment major):
- Remove required fields
- Change field types
- Rename fields
- Change enum values

**Non-breaking additions** (increment minor):
- Add optional fields
- Add new card types
- Add enum values

**Bug fixes** (increment patch):
- Clarify documentation
- Fix validation rules

### Module Version

Each module has its own version independent of schema version.

**Module creators should increment:**
- **Major:** Complete module redesign, new structure
- **Minor:** New entries added, existing entries modified
- **Patch:** Typo fixes, minor corrections

---

## Best Practices

### For Module Creators

✅ **DO:**
- Include 3-5 cards per entry for optimal variety
- Use relative paths for all media files
- Compress images and videos to reduce file size
- Provide translations for language-learning modules
- Include context and hints to aid learning
- Test your module with the validator before sharing

❌ **DON'T:**
- Use absolute file paths (breaks portability)
- Create single-card entries (defeats the purpose)
- Upload huge media files (>2MB for video)
- Leave required fields empty
- Use special characters in IDs

### For Learners

✅ **DO:**
- Store user customizations separately
- Export progress regularly
- Use personal notes liberally
- Create custom cards for tricky words

❌ **DON'T:**
- Modify official module files directly
- Delete module files while in use
- Mix user data with module data

---

## Migration Path

### Future Schema Changes

When schema updates occur:

**Backward Compatibility:**
- Older modules will continue to work
- System ignores unknown fields
- Missing optional fields use defaults

**Forward Compatibility:**
- Module files include `schema_version`
- System can detect version and adapt
- Validation warnings for outdated schemas

**Migration Process:**
1. System detects old schema version
2. Offers to upgrade module automatically
3. Backs up original before conversion
4. Validates upgraded module
5. User customizations preserved

---

## Appendix: JSON Schema File

See `schemas/module-schema-v1.0.0.json` for the complete, formal JSON Schema specification that can be used for automated validation.

---

## Appendix: Quick Reference

### Card Type Summary

| Card Type | Shows | User Types | Good For |
|-----------|-------|-----------|----------|
| **Image** | Picture | Term name | Visual learners, concrete nouns |
| **Video** | Video clip | Term name | Actions, processes, contexts |
| **Audio** | Sound/pronunciation | Term or what they hear | Pronunciation, auditory learners |
| **Definition** | Text description | Term name | Conceptual understanding |
| **Cloze** | Sentence with blank | Missing word | Usage in context |
| **Trivia** | Question | Term name | Cultural knowledge, associations |

### Required vs. Optional Quick Guide

**Always Required:**
- `entry_id`, `term`, `cards`
- `card_id`, `card_type`, `content`
- Card-specific content varies (see individual card sections)

**Highly Recommended:**
- `module_id`, `title`, `version`, `language`
- `difficulty` levels
- `alternative_answers` for fuzzy matching
- `hint` for learner support

**Nice to Have:**
- Translations
- `core_information` block
- `etymology`, `usage_notes`
- `module_settings` customization

---

**Document Maintained By:** Dr. Alex Chen  
**Schema File Location:** `schemas/module-schema-v1.0.0.json`  
**Example Modules:** `examples/`  
**Validation Tool:** `tools/validate-module.py` (to be created)
