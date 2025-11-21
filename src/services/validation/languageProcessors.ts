/**
 * Language-specific validation processors for handling language-specific rules,
 * abbreviations, variations, and special characters.
 */

import type { ValidationResult, ValidationOptions } from './answerValidator';

/**
 * Base interface for language-specific processors.
 */
export interface LanguageProcessor {
  /** Language code (ISO 639-1) */
  readonly languageCode: string;

  /** Language name for display */
  readonly languageName: string;

  /**
   * Normalize input according to language-specific rules.
   * This runs BEFORE the main validator's normalization.
   */
  normalize(input: string): string;

  /**
   * Check for language-specific special cases and variations.
   * Returns a ValidationResult if a special rule matches, null otherwise.
   */
  checkSpecialRules(
    normalizedUser: string,
    normalizedExpected: string,
    originalUser: string,
    originalExpected: string,
    options?: ValidationOptions
  ): ValidationResult | null;

  /**
   * Get alternate forms for a given word (gender variations, abbreviations, etc.)
   */
  getAlternateForms(word: string): string[];
}

/**
 * Spanish language processor with support for accents, gender, and common variations.
 */
export class SpanishProcessor implements LanguageProcessor {
  readonly languageCode = 'es';
  readonly languageName = 'Spanish';

  /**
   * Spanish-specific normalization (handling of ñ, inverted punctuation, etc.)
   */
  normalize(input: string): string {
    // Spanish inverted punctuation should be removed
    let result = input.replace(/[¿¡]/g, '');

    // Normalize whitespace
    result = result.trim().replace(/\s+/g, ' ');

    return result;
  }

  /**
   * Check Spanish-specific rules: articles, gender variations, diminutives, etc.
   */
  checkSpecialRules(
    normalizedUser: string,
    normalizedExpected: string,
    originalUser: string,
    originalExpected: string,
    options?: ValidationOptions
  ): ValidationResult | null {
    // Check if user answer includes the article when expected doesn't (or vice versa)
    const articleMatch = this.checkArticleVariations(
      normalizedUser,
      normalizedExpected,
      originalExpected
    );
    if (articleMatch) return articleMatch;

    // Check common contractions (del = de + el, al = a + el)
    const contractionMatch = this.checkContractions(
      normalizedUser,
      normalizedExpected,
      originalExpected
    );
    if (contractionMatch) return contractionMatch;

    // Check diminutives (-ito, -ita, -cito, -cita)
    const diminutiveMatch = this.checkDiminutives(
      normalizedUser,
      normalizedExpected,
      originalExpected
    );
    if (diminutiveMatch) return diminutiveMatch;

    return null;
  }

  /**
   * Get alternate forms including articles, gender variations, plural forms.
   */
  getAlternateForms(word: string): string[] {
    const alternates: string[] = [];
    const lower = word.toLowerCase();

    // Add version without article
    const withoutArticle = this.removeArticle(lower);
    if (withoutArticle !== lower) {
      alternates.push(withoutArticle);
    }

    // Add version with article if it doesn't have one
    if (!this.hasArticle(lower)) {
      // Try common articles
      alternates.push(`el ${lower}`, `la ${lower}`, `los ${lower}`, `las ${lower}`);
      alternates.push(`un ${lower}`, `una ${lower}`);
    }

    // Handle common gender swaps for known patterns
    if (lower.endsWith('o')) {
      alternates.push(lower.slice(0, -1) + 'a'); // gato -> gata
    } else if (lower.endsWith('a')) {
      alternates.push(lower.slice(0, -1) + 'o'); // gata -> gato
    }

    // Handle plural forms
    if (!lower.endsWith('s')) {
      alternates.push(lower + 's');
      if (lower.endsWith('z')) {
        alternates.push(lower.slice(0, -1) + 'ces'); // pez -> peces
      }
    }

    return alternates;
  }

  /**
   * Check if user provided/omitted article correctly.
   */
  private checkArticleVariations(
    user: string,
    expected: string,
    originalExpected: string
  ): ValidationResult | null {
    const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];

    const userWords = user.split(' ');
    const expectedWords = expected.split(' ');

    // User included article, expected didn't
    if (userWords.length > expectedWords.length && articles.includes(userWords[0])) {
      const userWithoutArticle = userWords.slice(1).join(' ');
      if (userWithoutArticle === expected) {
        return {
          isCorrect: true,
          confidence: 1.0,
          tier: 'alternate',
          feedback: 'Correct! (Article included but not required)',
          matchedAnswer: originalExpected,
          similarity: 100,
          editDistance: 0,
        };
      }
    }

    // Expected has article, user didn't
    if (expectedWords.length > userWords.length && articles.includes(expectedWords[0])) {
      const expectedWithoutArticle = expectedWords.slice(1).join(' ');
      if (user === expectedWithoutArticle) {
        return {
          isCorrect: true,
          confidence: 0.95,
          tier: 'fuzzy',
          feedback: 'Almost correct! Consider including the article.',
          suggestion: `More complete: ${originalExpected}`,
          similarity: 95,
          editDistance: 1,
        };
      }
    }

    return null;
  }

  /**
   * Check Spanish contractions (del, al).
   */
  private checkContractions(
    user: string,
    expected: string,
    originalExpected: string
  ): ValidationResult | null {
    const contractions: Record<string, string[]> = {
      'del': ['de el', 'de l'],
      'al': ['a el', 'a l'],
    };

    // Check if user used contraction but expected expanded form
    for (const [contraction, expansions] of Object.entries(contractions)) {
      for (const expansion of expansions) {
        if (user.includes(contraction) && expected.includes(expansion)) {
          const userExpanded = user.replace(contraction, expansion);
          if (userExpanded === expected) {
            return {
              isCorrect: true,
              confidence: 1.0,
              tier: 'alternate',
              feedback: 'Correct! (Contraction accepted)',
              matchedAnswer: originalExpected,
              similarity: 100,
              editDistance: 0,
            };
          }
        }

        // Check if expected used contraction but user expanded
        if (expected.includes(contraction) && user.includes(expansion)) {
          const expectedExpanded = expected.replace(contraction, expansion);
          if (user === expectedExpanded) {
            return {
              isCorrect: true,
              confidence: 1.0,
              tier: 'alternate',
              feedback: 'Correct! (Expanded form accepted)',
              matchedAnswer: originalExpected,
              similarity: 100,
              editDistance: 0,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check diminutive forms (-ito, -ita, -cito, -cita).
   * Spanish diminutives often replace the final vowel: perro → perrito
   */
  private checkDiminutives(
    user: string,
    expected: string,
    originalExpected: string
  ): ValidationResult | null {
    const diminutiveSuffixes = [
      { suffix: 'ito', gender: 'o' },
      { suffix: 'ita', gender: 'a' },
      { suffix: 'cito', gender: 'o' },
      { suffix: 'cita', gender: 'a' },
      { suffix: 'illo', gender: 'o' },
      { suffix: 'illa', gender: 'a' },
    ];

    for (const { suffix, gender } of diminutiveSuffixes) {
      // User used diminutive, expected didn't
      if (user.endsWith(suffix) && !expected.endsWith(suffix)) {
        // Try removing the diminutive and adding back the original ending
        const baseUser = user.slice(0, -(suffix.length));

        // Check if base + gender matches expected (perr + o = perro)
        if (baseUser + gender === expected) {
          return {
            isCorrect: true,
            confidence: 0.95,
            tier: 'fuzzy',
            feedback: 'Almost correct! Diminutive form used.',
            suggestion: `Expected: ${originalExpected}`,
            similarity: 95,
            editDistance: suffix.length,
          };
        }

        // Also check direct removal (for words that don't end in vowel)
        if (baseUser === expected) {
          return {
            isCorrect: true,
            confidence: 0.95,
            tier: 'fuzzy',
            feedback: 'Almost correct! Diminutive form used.',
            suggestion: `Expected: ${originalExpected}`,
            similarity: 95,
            editDistance: suffix.length,
          };
        }
      }

      // Expected used diminutive, user didn't
      if (expected.endsWith(suffix) && !user.endsWith(suffix)) {
        const baseExpected = expected.slice(0, -(suffix.length));

        // Check if user + diminutive matches expected (perr + ito = perrito, perro matches perr+o)
        if (user === baseExpected + gender) {
          return {
            isCorrect: true,
            confidence: 0.95,
            tier: 'fuzzy',
            feedback: 'Almost correct! Missing diminutive form.',
            suggestion: `Try: ${originalExpected}`,
            similarity: 95,
            editDistance: suffix.length,
          };
        }

        // Direct match with base
        if (user === baseExpected) {
          return {
            isCorrect: true,
            confidence: 0.95,
            tier: 'fuzzy',
            feedback: 'Almost correct! Missing diminutive form.',
            suggestion: `Try: ${originalExpected}`,
            similarity: 95,
            editDistance: suffix.length,
          };
        }
      }
    }

    return null;
  }

  /**
   * Check if a word has a Spanish article.
   */
  private hasArticle(word: string): boolean {
    const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];
    const firstWord = word.split(' ')[0];
    return articles.includes(firstWord);
  }

  /**
   * Remove article from a word if present.
   */
  private removeArticle(word: string): string {
    const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];
    const words = word.split(' ');
    if (words.length > 1 && articles.includes(words[0])) {
      return words.slice(1).join(' ');
    }
    return word;
  }
}

/**
 * English language processor with support for contractions and spelling variants.
 */
export class EnglishProcessor implements LanguageProcessor {
  readonly languageCode = 'en';
  readonly languageName = 'English';

  /**
   * English-specific normalization.
   */
  normalize(input: string): string {
    // Normalize whitespace
    return input.trim().replace(/\s+/g, ' ');
  }

  /**
   * Check English-specific rules: contractions, spelling variants.
   */
  checkSpecialRules(
    normalizedUser: string,
    normalizedExpected: string,
    originalUser: string,
    originalExpected: string,
    options?: ValidationOptions
  ): ValidationResult | null {
    // Check contractions
    const contractionMatch = this.checkContractions(
      normalizedUser,
      normalizedExpected,
      originalExpected
    );
    if (contractionMatch) return contractionMatch;

    // Check British vs American spelling
    const spellingMatch = this.checkSpellingVariants(
      normalizedUser,
      normalizedExpected,
      originalExpected
    );
    if (spellingMatch) return spellingMatch;

    // Check article usage (a vs an)
    const articleMatch = this.checkArticles(
      normalizedUser,
      normalizedExpected,
      originalExpected
    );
    if (articleMatch) return articleMatch;

    return null;
  }

  /**
   * Get alternate forms including contractions, plurals, spelling variants.
   */
  getAlternateForms(word: string): string[] {
    const alternates: string[] = [];
    const lower = word.toLowerCase();

    // Add contraction expansions
    const contractionExpansions = this.getContractionExpansions(lower);
    alternates.push(...contractionExpansions);

    // Add British/American spelling variants
    const spellingVariants = this.getSpellingVariants(lower);
    alternates.push(...spellingVariants);

    // Add plural forms if not already plural
    if (!lower.endsWith('s')) {
      if (lower.endsWith('y')) {
        alternates.push(lower.slice(0, -1) + 'ies'); // city -> cities
      } else if (lower.endsWith('ch') || lower.endsWith('sh') || lower.endsWith('x')) {
        alternates.push(lower + 'es'); // church -> churches
      } else {
        alternates.push(lower + 's'); // dog -> dogs
      }
    }

    return alternates;
  }

  /**
   * Check contraction variations (can't vs cannot, it's vs it is).
   */
  private checkContractions(
    user: string,
    expected: string,
    originalExpected: string
  ): ValidationResult | null {
    const contractions: Record<string, string[]> = {
      "can't": ['cannot', 'can not'],
      "won't": ['will not'],
      "don't": ['do not'],
      "doesn't": ['does not'],
      "didn't": ['did not'],
      "isn't": ['is not'],
      "aren't": ['are not'],
      "wasn't": ['was not'],
      "weren't": ['were not'],
      "haven't": ['have not'],
      "hasn't": ['has not'],
      "hadn't": ['had not'],
      "wouldn't": ['would not'],
      "shouldn't": ['should not'],
      "couldn't": ['could not'],
      "it's": ['it is', 'it has'],
      "i'm": ['i am'],
      "you're": ['you are'],
      "we're": ['we are'],
      "they're": ['they are'],
      "i've": ['i have'],
      "you've": ['you have'],
      "we've": ['we have'],
      "they've": ['they have'],
      "i'll": ['i will'],
      "you'll": ['you will'],
      "he'll": ['he will'],
      "she'll": ['she will'],
      "we'll": ['we will'],
      "they'll": ['they will'],
    };

    // Check if user used contraction but expected expanded
    for (const [contraction, expansions] of Object.entries(contractions)) {
      for (const expansion of expansions) {
        if (user.includes(contraction) && expected.includes(expansion)) {
          const userExpanded = user.replace(contraction, expansion);
          if (userExpanded === expected) {
            return {
              isCorrect: true,
              confidence: 1.0,
              tier: 'alternate',
              feedback: 'Correct! (Contraction accepted)',
              matchedAnswer: originalExpected,
              similarity: 100,
              editDistance: 0,
            };
          }
        }

        // Check if expected used contraction but user expanded
        if (expected.includes(contraction) && user.includes(expansion)) {
          const expectedExpanded = expected.replace(contraction, expansion);
          if (user === expectedExpanded) {
            return {
              isCorrect: true,
              confidence: 1.0,
              tier: 'alternate',
              feedback: 'Correct! (Expanded form accepted)',
              matchedAnswer: originalExpected,
              similarity: 100,
              editDistance: 0,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check British vs American spelling variants.
   */
  private checkSpellingVariants(
    user: string,
    expected: string,
    originalExpected: string
  ): ValidationResult | null {
    const variants: Array<[string, string]> = [
      ['our', 'or'],      // colour vs color
      ['re', 'er'],       // centre vs center
      ['ise', 'ize'],     // realise vs realize
      ['yse', 'yze'],     // analyse vs analyze
      ['ogue', 'og'],     // dialogue vs dialog
      ['ll', 'l'],        // travelling vs traveling (in some positions)
    ];

    for (const [british, american] of variants) {
      // Check if one uses British and other uses American
      if (user.includes(british) && expected.includes(american)) {
        const userConverted = user.replace(new RegExp(british, 'g'), american);
        if (userConverted === expected) {
          return {
            isCorrect: true,
            confidence: 1.0,
            tier: 'alternate',
            feedback: 'Correct! (British spelling accepted)',
            matchedAnswer: originalExpected,
            similarity: 100,
            editDistance: 0,
          };
        }
      }

      if (expected.includes(british) && user.includes(american)) {
        const expectedConverted = expected.replace(new RegExp(british, 'g'), american);
        if (user === expectedConverted) {
          return {
            isCorrect: true,
            confidence: 1.0,
            tier: 'alternate',
            feedback: 'Correct! (American spelling accepted)',
            matchedAnswer: originalExpected,
            similarity: 100,
            editDistance: 0,
          };
        }
      }
    }

    return null;
  }

  /**
   * Check article variations (a vs an, with/without article).
   */
  private checkArticles(
    user: string,
    expected: string,
    originalExpected: string
  ): ValidationResult | null {
    const articles = ['a', 'an', 'the'];

    const userWords = user.split(' ');
    const expectedWords = expected.split(' ');

    // User included article, expected didn't
    if (userWords.length > expectedWords.length && articles.includes(userWords[0])) {
      const userWithoutArticle = userWords.slice(1).join(' ');
      if (userWithoutArticle === expected) {
        return {
          isCorrect: true,
          confidence: 1.0,
          tier: 'alternate',
          feedback: 'Correct! (Article included but not required)',
          matchedAnswer: originalExpected,
          similarity: 100,
          editDistance: 0,
        };
      }
    }

    // Expected has article, user didn't
    if (expectedWords.length > userWords.length && articles.includes(expectedWords[0])) {
      const expectedWithoutArticle = expectedWords.slice(1).join(' ');
      if (user === expectedWithoutArticle) {
        return {
          isCorrect: true,
          confidence: 0.95,
          tier: 'fuzzy',
          feedback: 'Almost correct! Consider including the article.',
          suggestion: `More complete: ${originalExpected}`,
          similarity: 95,
          editDistance: 1,
        };
      }
    }

    // Check a vs an swap (wrong article choice)
    if (userWords[0] === 'a' && expectedWords[0] === 'an') {
      if (userWords.slice(1).join(' ') === expectedWords.slice(1).join(' ')) {
        return {
          isCorrect: true,
          confidence: 0.98,
          tier: 'fuzzy',
          feedback: 'Almost perfect! Use "an" before vowel sounds.',
          suggestion: `Try: ${originalExpected}`,
          similarity: 98,
          editDistance: 1,
        };
      }
    }

    if (userWords[0] === 'an' && expectedWords[0] === 'a') {
      if (userWords.slice(1).join(' ') === expectedWords.slice(1).join(' ')) {
        return {
          isCorrect: true,
          confidence: 0.98,
          tier: 'fuzzy',
          feedback: 'Almost perfect! Use "a" before consonant sounds.',
          suggestion: `Try: ${originalExpected}`,
          similarity: 98,
          editDistance: 1,
        };
      }
    }

    return null;
  }

  /**
   * Get expansions of contractions.
   */
  private getContractionExpansions(word: string): string[] {
    const expansions: string[] = [];
    const contractions: Record<string, string[]> = {
      "can't": ['cannot'],
      "won't": ['will not'],
      "don't": ['do not'],
      "it's": ['it is'],
      "i'm": ['i am'],
    };

    for (const [contraction, expanded] of Object.entries(contractions)) {
      if (word === contraction) {
        expansions.push(...expanded);
      } else if (expanded.includes(word)) {
        expansions.push(contraction);
      }
    }

    return expansions;
  }

  /**
   * Get spelling variants (British/American).
   */
  private getSpellingVariants(word: string): string[] {
    const variants: string[] = [];

    // British to American
    if (word.includes('our')) {
      variants.push(word.replace(/our/g, 'or')); // colour -> color
    }
    if (word.includes('re') && word.endsWith('re')) {
      variants.push(word.slice(0, -2) + 'er'); // centre -> center
    }
    if (word.endsWith('ise')) {
      variants.push(word.slice(0, -3) + 'ize'); // realise -> realize
    }

    // American to British
    if (word.includes('or') && !word.includes('our')) {
      variants.push(word.replace(/or/g, 'our')); // color -> colour
    }
    if (word.includes('er') && word.endsWith('er')) {
      variants.push(word.slice(0, -2) + 're'); // center -> centre
    }
    if (word.endsWith('ize')) {
      variants.push(word.slice(0, -3) + 'ise'); // realize -> realise
    }

    return variants;
  }
}

/**
 * Default/fallback processor for languages without specific rules.
 */
export class DefaultProcessor implements LanguageProcessor {
  readonly languageCode = 'default';
  readonly languageName = 'Default';

  normalize(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  checkSpecialRules(): ValidationResult | null {
    return null; // No special rules
  }

  getAlternateForms(_word: string): string[] {
    return []; // No alternates
  }
}

/**
 * Registry of available language processors.
 */
const processorRegistry = new Map<string, LanguageProcessor>([
  ['es', new SpanishProcessor()],
  ['en', new EnglishProcessor()],
  ['default', new DefaultProcessor()],
]);

/**
 * Get the appropriate language processor for a language code.
 */
export function getLanguageProcessor(languageCode: string): LanguageProcessor {
  return processorRegistry.get(languageCode) || processorRegistry.get('default')!;
}

/**
 * Register a custom language processor.
 */
export function registerLanguageProcessor(processor: LanguageProcessor): void {
  processorRegistry.set(processor.languageCode, processor);
}

/**
 * Get all registered language codes.
 */
export function getRegisteredLanguages(): string[] {
  return Array.from(processorRegistry.keys()).filter(code => code !== 'default');
}
