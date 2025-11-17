# Learning Mechanics

**Document Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Status:** Finalized for MVP

---

## Overview

The learning system uses **spaced repetition with multi-card randomization** to build durable vocabulary mastery. This document specifies how the learning mechanics work.

---

## Core Learning Principles

### 1. Multiple Retrieval Pathways
Each vocabulary term has multiple cards presenting different aspects:
- Visual (images, videos)
- Auditory (pronunciation, usage audio)
- Textual (definitions, contextual sentences)
- Associative (trivia, connections)

**Benefit:** Strengthens memory through varied encoding.

### 2. Randomized Card Selection
When a word is due for review, one card is randomly selected from its pool.

**Benefit:** Prevents pattern memorization, tests true understanding.

### 3. Spaced Repetition
Reviews are scheduled based on performance using the SM-2 algorithm.

**Benefit:** Optimizes retention while minimizing study time.

---

## Spaced Repetition Algorithm (SM-2)

### Initial State
When a new vocabulary entry is first encountered:
```
interval = 1 day
ease_factor = 2.5
repetitions = 0
```

### Review Response

**If answer is CORRECT:**
```
if repetitions == 0:
    interval = 1 day
else if repetitions == 1:
    interval = 6 days
else:
    interval = interval * ease_factor

ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
ease_factor = max(1.3, ease_factor)  # Never go below 1.3

repetitions = repetitions + 1
```

**If answer is INCORRECT:**
```
interval = 1 day
repetitions = 0
ease_factor = max(1.3, ease_factor - 0.2)  # Decrease but stay above 1.3
```

### Quality Grades (MVP Simplified)
For MVP, we use binary grading:
- **Correct answer** → Quality 4 (Good)
- **Incorrect answer** → Quality 0 (Complete blackout)

Post-MVP can add:
- Quality 5: Perfect recall
- Quality 3: Correct with difficulty
- Quality 2: Correct after hint
- Quality 1: Incorrect but familiar

### Next Review Date
```
next_review_date = current_date + interval (days)
```

---

## Card Selection Mechanism

### MVP: Pure Random Selection

**Algorithm:**
```python
def select_card(vocabulary_entry):
    """Select one card at random from entry's card pool."""
    available_cards = vocabulary_entry.cards
    selected_card = random.choice(available_cards)
    return selected_card
```

**Properties:**
- ✅ Simple to implement
- ✅ Fair distribution over time
- ✅ Prevents predictability
- ⚠️ May repeat same card consecutively (rare with 3+ cards)

### Post-MVP: Enhanced Strategies

**Weighted Random (avoid recent):**
```python
def select_card_weighted(vocabulary_entry, last_card_id):
    """Reduce probability of showing card that was just shown."""
    cards = vocabulary_entry.cards
    weights = [0.5 if card.id == last_card_id else 1.0 for card in cards]
    selected_card = random.choices(cards, weights=weights)[0]
    return selected_card
```

**Round-Robin (guaranteed variety):**
```python
def select_card_round_robin(vocabulary_entry, card_history):
    """Cycle through all cards before repeating."""
    cards = vocabulary_entry.cards
    shown_cards = set(card_history)
    
    if len(shown_cards) >= len(cards):
        # All cards shown, reset cycle
        card_history.clear()
        shown_cards.clear()
    
    unshown_cards = [c for c in cards if c.id not in shown_cards]
    selected_card = random.choice(unshown_cards)
    return selected_card
```

---

## Review Session Flow

### 1. Determine Due Words
```python
def get_due_words(current_date):
    """Get all vocabulary entries due for review."""
    due_entries = []
    for entry in all_vocabulary:
        if entry.mastery.next_review_date <= current_date:
            due_entries.append(entry)
    return due_entries
```

### 2. Present Card
```
1. Select card using card_selector
2. Display card content (image/video/audio/text)
3. Show prompt text
4. Provide input field for answer
5. Wait for user submission
```

### 3. Validate Answer
```python
def validate_answer(user_input, expected, alternatives):
    """Check if answer is correct using fuzzy matching."""
    user_input = user_input.lower().strip()
    
    # Check exact match with expected answer
    if user_input == expected.lower():
        return True
    
    # Check exact match with alternatives
    for alt in alternatives:
        if user_input == alt.lower():
            return True
    
    # Check fuzzy match (allow minor typos)
    if fuzzy_ratio(user_input, expected.lower()) >= 90:
        return True
    
    for alt in alternatives:
        if fuzzy_ratio(user_input, alt.lower()) >= 90:
            return True
    
    return False
```

### 4. Provide Feedback
```
If correct:
  - Show ✓ "Correct!"
  - Display expected answer (confirmation)
  - Show brief definition/context
  
If incorrect:
  - Show ✗ "Incorrect"
  - Display user's answer
  - Show correct answer(s)
  - Show definition/context for learning
```

### 5. Update Mastery
```python
def update_mastery(entry, was_correct):
    """Update spaced repetition state."""
    if was_correct:
        # Increase interval
        if entry.repetitions == 0:
            entry.interval = 1
        elif entry.repetitions == 1:
            entry.interval = 6
        else:
            entry.interval = round(entry.interval * entry.ease_factor)
        
        entry.repetitions += 1
        entry.ease_factor = min(3.0, entry.ease_factor + 0.1)
    else:
        # Reset interval
        entry.interval = 1
        entry.repetitions = 0
        entry.ease_factor = max(1.3, entry.ease_factor - 0.2)
    
    entry.last_reviewed = current_date
    entry.next_review = current_date + timedelta(days=entry.interval)
    
    # Log review
    save_review_history(entry.id, was_correct, card_shown)
```

### 6. Continue or End Session
```
If more due words:
  → Go to step 2 (next word)
  
If no more due words OR user ends session:
  → Show session summary
  → Save progress
  → Return to main menu
```

---

## Session Summary Statistics

Display at end of each session:
- **Words reviewed:** Total count
- **Accuracy:** Percentage correct
- **New words:** First-time reviews
- **Time spent:** Session duration
- **Next session:** Words due tomorrow

---

## Progress Metrics

### Per-Entry Metrics
- Interval (days until next review)
- Ease factor (difficulty rating)
- Repetitions (times reviewed correctly in a row)
- Total reviews (lifetime count)
- Accuracy rate (% correct)
- Last card shown (for future optimization)

### Global Metrics
- Words learned (repetitions >= 3)
- Words in progress (0 < repetitions < 3)
- Words new (repetitions == 0)
- Daily streak (consecutive days studied)
- Total time spent
- Average accuracy

---

## Mastery Levels

Words are categorized by mastery:

| Level | Criteria | Next Review Interval |
|-------|----------|---------------------|
| **New** | Never reviewed | 1 day (first review) |
| **Learning** | 1-2 correct reviews | 1-6 days |
| **Young** | 3-5 correct reviews | 6-30 days |
| **Mature** | 6+ correct reviews | 30+ days |
| **Mastered** | Interval >= 180 days | 180+ days |

---

## Daily Study Routine

### Recommended Flow
1. **Review due words** (priority)
   - Required for maintaining retention
   - Do this first every session

2. **Learn new words** (optional)
   - Add 5-20 new words per day
   - Based on user's pace preference

3. **Custom practice** (optional)
   - Review specific modules
   - Practice difficult words
   - Explore user customizations

### Daily Limits
- **Recommended:** 10 new words + 50 reviews per day
- **Configurable:** User can adjust based on capacity
- **Flexible:** No enforced limits, just recommendations

---

## Answer Input Specifications

### Text Input Processing
```python
def process_input(user_input):
    """Normalize user input for comparison."""
    # Convert to lowercase
    normalized = user_input.lower()
    
    # Strip leading/trailing whitespace
    normalized = normalized.strip()
    
    # Remove extra internal spaces
    normalized = " ".join(normalized.split())
    
    # Remove punctuation (optional, configurable)
    # normalized = normalized.translate(str.maketrans('', '', string.punctuation))
    
    return normalized
```

### Fuzzy Matching Tolerance
```
Similarity >= 90% → Accept as correct
Similarity >= 80% → Suggest correction, ask user
Similarity < 80% → Mark as incorrect
```

**Fuzzy matching library:** Levenshtein distance or fuzzywuzzy

---

## Edge Cases

### No Cards Available
If an entry somehow has zero cards (shouldn't happen with validation):
- Log error
- Skip entry
- Alert user to fix module

### Media Loading Failure
If image/video/audio fails to load:
- Show error message
- Display text prompt only
- Allow user to answer or skip
- Log issue for review

### Incorrect Schema
If user customization has invalid card structure:
- Skip invalid card
- Use valid cards only
- Warn user

---

## Future Enhancements

### Adaptive Card Selection
Track per-card performance and prioritize difficult cards:
```python
card_difficulty = {
    card_id: accuracy_rate  # Track each card separately
}

# Select cards user struggles with more frequently
select_weighted_by_difficulty(card_difficulty)
```

### Card-Level Mastery
Track mastery per card instead of per entry:
- Word is "mastered" only when ALL cards are mastered
- Identifies weak spots (e.g., good with images, bad with audio)

### Self-Assessment Mode
For advanced learners:
- "I know it" / "I don't know it" buttons
- Faster than typing
- Optional alongside typed answers

---

**Document Maintained By:** Dr. Alex Chen  
**Algorithm Reference:** SM-2 Algorithm (SuperMemo)  
**Review Frequency:** Monthly
