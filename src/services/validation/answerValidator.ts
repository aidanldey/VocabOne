/**
 * Sophisticated answer validation system with tiers, confidence scores, and detailed feedback.
 * Provides intelligent validation for language learning with partial credit and suggestions.
 */

/**
 * Validation options for customizing validation behavior.
 */
export interface ValidationOptions {
  /** Alternative acceptable answers */
  alternateAnswers?: string[];
  /** Enable fuzzy matching for typos */
  enableFuzzy?: boolean;
  /** Minimum similarity for exact match (0-1) */
  exactThreshold?: number;
  /** Minimum similarity for partial credit (0-1) */
  partialThreshold?: number;
  /** Case sensitivity */
  caseSensitive?: boolean;
  /** Consider accents/diacritics as differences */
  accentSensitive?: boolean;
  /** Consider punctuation as differences */
  punctuationSensitive?: boolean;
}

/**
 * Result of answer validation with detailed feedback.
 */
export interface ValidationResult {
  /** Whether the answer is considered correct */
  isCorrect: boolean;
  /** Confidence score (0-1) */
  confidence: number;
  /** Validation tier that matched */
  tier: 'exact' | 'alternate' | 'fuzzy' | 'partial' | 'incorrect';
  /** User-friendly feedback message */
  feedback: string;
  /** Suggestion for improvement (if applicable) */
  suggestion?: string;
  /** Edit distance from expected answer */
  editDistance?: number;
  /** Similarity percentage (0-100) */
  similarity?: number;
  /** The matched answer (for alternate answers) */
  matchedAnswer?: string;
}

/**
 * Main answer validator class with sophisticated validation logic.
 */
export class AnswerValidator {
  private defaultOptions: Required<ValidationOptions> = {
    alternateAnswers: [],
    enableFuzzy: true,
    exactThreshold: 0.9,
    partialThreshold: 0.7,
    caseSensitive: false,
    accentSensitive: false,
    punctuationSensitive: false,
  };

  /**
   * Validate a user's answer against the expected answer.
   *
   * @param userInput - The answer provided by the user
   * @param expected - The expected correct answer
   * @param options - Optional validation configuration
   * @returns Detailed validation result with feedback
   *
   * @example
   * ```typescript
   * const validator = new AnswerValidator();
   * const result = validator.validate('perro', 'perro');
   * // { isCorrect: true, confidence: 1.0, tier: 'exact', ... }
   *
   * const result2 = validator.validate('parro', 'perro', { enableFuzzy: true });
   * // { isCorrect: true, confidence: 0.85, tier: 'fuzzy', ... }
   * ```
   */
  validate(
    userInput: string,
    expected: string,
    options?: ValidationOptions
  ): ValidationResult {
    const opts = { ...this.defaultOptions, ...options };

    // Handle empty inputs
    if (!userInput || !userInput.trim()) {
      return {
        isCorrect: false,
        confidence: 0,
        tier: 'incorrect',
        feedback: 'No answer provided',
        suggestion: `Try typing: ${expected}`,
      };
    }

    // Normalize inputs based on options
    const normalizedUser = this.normalizeString(userInput, opts);
    const normalizedExpected = this.normalizeString(expected, opts);

    // Tier 1: Exact match
    if (normalizedUser === normalizedExpected) {
      return {
        isCorrect: true,
        confidence: 1.0,
        tier: 'exact',
        feedback: 'Perfect match!',
        similarity: 100,
        editDistance: 0,
      };
    }

    // Tier 2: Alternative answers
    const alternateResult = this.checkAlternateAnswers(
      normalizedUser,
      opts.alternateAnswers,
      opts
    );
    if (alternateResult) {
      return alternateResult;
    }

    // Tier 3: Fuzzy matching
    if (opts.enableFuzzy) {
      const fuzzyResult = this.fuzzyMatch(
        normalizedUser,
        normalizedExpected,
        expected,
        opts
      );
      if (fuzzyResult) {
        return fuzzyResult;
      }
    }

    // Tier 4: No match - provide feedback
    return this.generateIncorrectFeedback(userInput, expected, normalizedUser, normalizedExpected);
  }

  /**
   * Normalize a string based on validation options.
   */
  private normalizeString(str: string, opts: Required<ValidationOptions>): string {
    let result = str.trim();

    if (!opts.caseSensitive) {
      result = result.toLowerCase();
    }

    if (!opts.accentSensitive) {
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    if (!opts.punctuationSensitive) {
      result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"¿?¡!]/g, '');
    }

    // Normalize whitespace
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Check if the answer matches any alternate answers.
   */
  private checkAlternateAnswers(
    normalizedUser: string,
    alternates: string[],
    opts: Required<ValidationOptions>
  ): ValidationResult | null {
    for (const alternate of alternates) {
      const normalizedAlt = this.normalizeString(alternate, opts);
      if (normalizedUser === normalizedAlt) {
        return {
          isCorrect: true,
          confidence: 1.0,
          tier: 'alternate',
          feedback: 'Correct! (Alternative form accepted)',
          matchedAnswer: alternate,
          similarity: 100,
          editDistance: 0,
        };
      }
    }
    return null;
  }

  /**
   * Perform fuzzy matching with similarity calculation.
   * Uses hybrid approach: edit distance for short words, percentage for longer words.
   */
  private fuzzyMatch(
    normalizedUser: string,
    normalizedExpected: string,
    originalExpected: string,
    opts: Required<ValidationOptions>
  ): ValidationResult | null {
    const distance = this.levenshteinDistance(normalizedUser, normalizedExpected);
    const maxLength = Math.max(normalizedUser.length, normalizedExpected.length);
    const similarity = maxLength > 0 ? 1 - distance / maxLength : 0;
    const similarityPercent = Math.round(similarity * 100);

    // For short words (<=8 chars), use edit distance thresholds
    // Only apply when using default sensitivity and thresholds
    const isDefaultSensitivity = !opts.caseSensitive && !opts.accentSensitive && !opts.punctuationSensitive;
    const isDefaultThresholds = opts.exactThreshold === 0.9 && opts.partialThreshold === 0.7;

    if (maxLength <= 8 && isDefaultSensitivity && isDefaultThresholds) {
      // Single character difference -> fuzzy (common typos, insertions, deletions)
      if (distance === 1 && similarity >= 0.75) {
        return {
          isCorrect: true,
          confidence: 0.95, // Fixed high confidence for single character errors
          tier: 'fuzzy',
          feedback: 'Very close! Minor typo detected.',
          suggestion: `Correct answer: ${originalExpected}`,
          similarity: similarityPercent,
          editDistance: distance,
        };
      }

      // Two character difference -> fuzzy for very short words, partial for slightly longer
      if (distance === 2) {
        if (maxLength <= 5) {
          return {
            isCorrect: true,
            confidence: 0.95, // High confidence for transpositions in very short words
            tier: 'fuzzy',
            feedback: 'Very close! Minor typo detected.',
            suggestion: `Correct answer: ${originalExpected}`,
            similarity: similarityPercent,
            editDistance: distance,
          };
        } else if (maxLength <= 6) {
          return {
            isCorrect: true,
            confidence: similarity,
            tier: 'partial',
            feedback: 'Partially correct. Close to the right answer.',
            suggestion: `Try: ${originalExpected}`,
            similarity: similarityPercent,
            editDistance: distance,
          };
        }
      }
    }

    // For longer words, use percentage-based thresholds
    // Exact tier (>90% similar)
    if (similarity >= opts.exactThreshold) {
      return {
        isCorrect: true,
        confidence: similarity,
        tier: 'fuzzy',
        feedback: 'Very close! Minor typo detected.',
        suggestion: `Correct answer: ${originalExpected}`,
        similarity: similarityPercent,
        editDistance: distance,
      };
    }

    // Partial tier (>70% similar)
    if (similarity >= opts.partialThreshold) {
      return {
        isCorrect: true,
        confidence: similarity,
        tier: 'partial',
        feedback: 'Partially correct. Close to the right answer.',
        suggestion: `Try: ${originalExpected}`,
        similarity: similarityPercent,
        editDistance: distance,
      };
    }

    return null;
  }

  /**
   * Generate detailed feedback for incorrect answers.
   */
  private generateIncorrectFeedback(
    userInput: string,
    expected: string,
    normalizedUser: string,
    normalizedExpected: string
  ): ValidationResult {
    const distance = this.levenshteinDistance(normalizedUser, normalizedExpected);
    const maxLength = Math.max(normalizedUser.length, normalizedExpected.length);
    const similarity = maxLength > 0 ? 1 - distance / maxLength : 0;
    const similarityPercent = Math.round(similarity * 100);

    // Analyze the type of error
    let suggestion = `The correct answer is: ${expected}`;

    // Check if it's a length issue (but not for very short single-char inputs)
    if (normalizedUser.length >= 2 && normalizedUser.length < normalizedExpected.length * 0.5) {
      suggestion = `The answer is longer. Try: ${expected}`;
    } else if (normalizedUser.length > normalizedExpected.length * 1.5) {
      suggestion = `The answer is shorter. Try: ${expected}`;
    } else if (similarity > 0.5) {
      // Close but not quite
      suggestion = `You're on the right track! The correct answer is: ${expected}`;
    } else if (this.hasCommonPrefix(normalizedUser, normalizedExpected)) {
      suggestion = `Good start! The complete answer is: ${expected}`;
    }

    return {
      isCorrect: false,
      confidence: 0,
      tier: 'incorrect',
      feedback: 'Incorrect answer',
      suggestion,
      similarity: similarityPercent,
      editDistance: distance,
    };
  }

  /**
   * Calculate Levenshtein distance between two strings.
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(0));

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Check if two strings share a common prefix.
   */
  private hasCommonPrefix(a: string, b: string, minLength = 3): boolean {
    const commonLength = this.getCommonPrefixLength(a, b);
    return commonLength >= minLength;
  }

  /**
   * Get the length of the common prefix between two strings.
   */
  private getCommonPrefixLength(a: string, b: string): number {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {
      i++;
    }
    return i;
  }

  /**
   * Batch validate multiple answers.
   */
  validateBatch(
    inputs: Array<{ userInput: string; expected: string }>,
    options?: ValidationOptions
  ): ValidationResult[] {
    return inputs.map((input) => this.validate(input.userInput, input.expected, options));
  }

  /**
   * Get validation statistics for a set of results.
   */
  getStatistics(results: ValidationResult[]): {
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    averageConfidence: number;
    tierBreakdown: Record<string, number>;
  } {
    const total = results.length;
    const correct = results.filter((r) => r.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? correct / total : 0;
    const averageConfidence =
      results.reduce((sum, r) => sum + r.confidence, 0) / total || 0;

    const tierBreakdown: Record<string, number> = {};
    for (const result of results) {
      tierBreakdown[result.tier] = (tierBreakdown[result.tier] || 0) + 1;
    }

    return {
      total,
      correct,
      incorrect,
      accuracy,
      averageConfidence,
      tierBreakdown,
    };
  }
}

/**
 * Create a singleton instance for convenience.
 */
let defaultValidator: AnswerValidator | null = null;

/**
 * Get the default validator instance.
 */
export function getDefaultValidator(): AnswerValidator {
  if (!defaultValidator) {
    defaultValidator = new AnswerValidator();
  }
  return defaultValidator;
}

/**
 * Convenience function for quick validation.
 */
export function quickValidate(
  userInput: string,
  expected: string,
  options?: ValidationOptions
): ValidationResult {
  return getDefaultValidator().validate(userInput, expected, options);
}
