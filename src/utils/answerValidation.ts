/**
 * Answer validation utilities with fuzzy matching.
 * Handles alternate answers, case-insensitivity, and common variations.
 */

/**
 * Normalize a string for comparison by:
 * - Converting to lowercase
 * - Removing extra whitespace
 * - Removing accents/diacritics
 * - Removing punctuation
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, '') // Remove punctuation including apostrophes
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Calculate Levenshtein distance between two strings.
 * Used for fuzzy matching to allow minor typos.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if user's answer matches the expected answer.
 * Supports exact matches, alternate answers, and fuzzy matching.
 *
 * @param userAnswer - The answer provided by the user
 * @param expectedAnswer - The primary correct answer
 * @param alternateAnswers - Optional array of alternate correct answers
 * @param allowFuzzy - Whether to allow fuzzy matching (default: true)
 * @param fuzzyThreshold - Maximum edit distance for fuzzy match (default: 2)
 * @returns Object with match status and matched answer
 */
export function validateAnswer(
  userAnswer: string,
  expectedAnswer: string,
  alternateAnswers: string[] = [],
  allowFuzzy = true,
  fuzzyThreshold = 2
): {
  isCorrect: boolean;
  matchedAnswer?: string;
  exactMatch: boolean;
  fuzzyMatch: boolean;
} {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedExpected = normalizeAnswer(expectedAnswer);

  // Check exact match with expected answer
  if (normalizedUser === normalizedExpected) {
    return {
      isCorrect: true,
      matchedAnswer: expectedAnswer,
      exactMatch: true,
      fuzzyMatch: false,
    };
  }

  // Check exact match with alternate answers
  for (const alternate of alternateAnswers) {
    const normalizedAlternate = normalizeAnswer(alternate);
    if (normalizedUser === normalizedAlternate) {
      return {
        isCorrect: true,
        matchedAnswer: alternate,
        exactMatch: true,
        fuzzyMatch: false,
      };
    }
  }

  // If fuzzy matching is disabled, return incorrect
  if (!allowFuzzy) {
    return {
      isCorrect: false,
      exactMatch: false,
      fuzzyMatch: false,
    };
  }

  // Check fuzzy match with expected answer
  const expectedDistance = levenshteinDistance(normalizedUser, normalizedExpected);
  if (expectedDistance <= fuzzyThreshold) {
    return {
      isCorrect: true,
      matchedAnswer: expectedAnswer,
      exactMatch: false,
      fuzzyMatch: true,
    };
  }

  // Check fuzzy match with alternate answers
  for (const alternate of alternateAnswers) {
    const normalizedAlternate = normalizeAnswer(alternate);
    const distance = levenshteinDistance(normalizedUser, normalizedAlternate);
    if (distance <= fuzzyThreshold) {
      return {
        isCorrect: true,
        matchedAnswer: alternate,
        exactMatch: false,
        fuzzyMatch: true,
      };
    }
  }

  // No match found
  return {
    isCorrect: false,
    exactMatch: false,
    fuzzyMatch: false,
  };
}

/**
 * Get the expected answer from a card.
 * Handles different card types that may have different answer structures.
 */
export function getCardAnswer(card: any): {
  expectedAnswer: string;
  alternateAnswers: string[];
} {
  return {
    expectedAnswer: card.expectedAnswer || '',
    alternateAnswers: card.alternateAnswers || [],
  };
}
