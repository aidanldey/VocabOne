import { describe, it, expect } from 'vitest';
import {
  SpanishProcessor,
  EnglishProcessor,
  DefaultProcessor,
  getLanguageProcessor,
  registerLanguageProcessor,
  getRegisteredLanguages,
} from './languageProcessors';
import { AnswerValidator } from './answerValidator';

describe('SpanishProcessor', () => {
  const processor = new SpanishProcessor();
  const validator = new AnswerValidator();

  describe('Basic Properties', () => {
    it('should have correct language code', () => {
      expect(processor.languageCode).toBe('es');
      expect(processor.languageName).toBe('Spanish');
    });
  });

  describe('Normalization', () => {
    it('should remove inverted punctuation', () => {
      expect(processor.normalize('¿Cómo estás?')).toBe('Cómo estás?');
      expect(processor.normalize('¡Hola!')).toBe('Hola!');
    });

    it('should normalize whitespace', () => {
      expect(processor.normalize('  hola  mundo  ')).toBe('hola mundo');
    });
  });

  describe('Spanish Animals - Article Variations', () => {
    it('should accept "perro" when expected is "el perro"', () => {
      const result = validator.validate('perro', 'el perro', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      // Article variations trigger special rules check
      expect(['fuzzy', 'alternate']).toContain(result.tier);
    });

    it('should accept "el perro" when expected is "perro"', () => {
      const result = validator.validate('el perro', 'perro', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
      expect(result.feedback).toContain('Alternative');
    });

    it('should accept "gato" when expected is "el gato"', () => {
      const result = validator.validate('gato', 'el gato', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      // Can be caught by alternates or special rules
      expect(['fuzzy', 'alternate']).toContain(result.tier);
    });

    it('should accept "la vaca" when expected is "vaca"', () => {
      const result = validator.validate('la vaca', 'vaca', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
    });

    it('should accept "un caballo" when expected is "caballo"', () => {
      const result = validator.validate('un caballo', 'caballo', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
    });
  });

  describe('Spanish Animals - Gender Variations', () => {
    it('should provide alternate forms for gender', () => {
      const alternates = processor.getAlternateForms('gato');
      expect(alternates).toContain('gata');
    });

    it('should provide alternate forms for female animals', () => {
      const alternates = processor.getAlternateForms('perra');
      expect(alternates).toContain('perro');
    });

    it('should accept gender variations through alternates', () => {
      // When validator checks alternates, it should find gata
      const result = validator.validate('gata', 'gato', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
    });
  });

  describe('Spanish Animals - Plural Forms', () => {
    it('should provide plural alternates', () => {
      const alternates = processor.getAlternateForms('perro');
      expect(alternates).toContain('perros');
    });

    it('should handle z -> ces transformation', () => {
      const alternates = processor.getAlternateForms('pez');
      expect(alternates).toContain('peces');
    });

    it('should accept plural when singular expected', () => {
      const result = validator.validate('perros', 'perro', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
    });
  });

  describe('Spanish Animals - Contractions', () => {
    it('should accept "del" when "de el" is expected', () => {
      const result = processor.checkSpecialRules(
        'del perro',
        'de el perro',
        'del perro',
        'de el perro'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.tier).toBe('alternate');
    });

    it('should accept "al" when "a el" is expected', () => {
      const result = processor.checkSpecialRules(
        'al gato',
        'a el gato',
        'al gato',
        'a el gato'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });

    it('should accept expanded form when contraction expected', () => {
      const result = processor.checkSpecialRules(
        'de el perro',
        'del perro',
        'de el perro',
        'del perro'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });
  });

  describe('Spanish Animals - Diminutives', () => {
    it('should accept "perrito" when "perro" expected', () => {
      const result = processor.checkSpecialRules(
        'perrito',
        'perro',
        'perrito',
        'perro'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.tier).toBe('fuzzy');
      expect(result?.feedback).toContain('Diminutive');
    });

    it('should accept "gatito" when "gato" expected', () => {
      const result = processor.checkSpecialRules(
        'gatito',
        'gato',
        'gatito',
        'gato'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });

    it('should accept "perrito" with -ito suffix', () => {
      const result = processor.checkSpecialRules(
        'perrito',
        'perro',
        'perrito',
        'perro'
      );
      expect(result?.feedback.toLowerCase()).toContain('diminutive');
    });

    it('should handle base form when diminutive expected', () => {
      const result = processor.checkSpecialRules(
        'gato',
        'gatito',
        'gato',
        'gatito'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });
  });

  describe('Real Spanish Animal Vocabulary', () => {
    const animals = [
      { spanish: 'perro', english: 'dog' },
      { spanish: 'gato', english: 'cat' },
      { spanish: 'caballo', english: 'horse' },
      { spanish: 'vaca', english: 'cow' },
      { spanish: 'pájaro', english: 'bird' },
      { spanish: 'pez', english: 'fish' },
      { spanish: 'ratón', english: 'mouse' },
      { spanish: 'león', english: 'lion' },
      { spanish: 'elefante', english: 'elephant' },
      { spanish: 'mono', english: 'monkey' },
    ];

    animals.forEach(({ spanish, english }) => {
      it(`should validate exact match for ${english} (${spanish})`, () => {
        const result = validator.validate(spanish, spanish, { languageCode: 'es' });
        expect(result.isCorrect).toBe(true);
        expect(result.tier).toBe('exact');
        expect(result.confidence).toBe(1.0);
      });
    });

    it('should handle accented characters - pájaro', () => {
      // Without accent should still be accepted with fuzzy matching disabled for accents
      const result = validator.validate('pajaro', 'pájaro', {
        languageCode: 'es',
        accentSensitive: false,
      });
      expect(result.isCorrect).toBe(true);
    });

    it('should handle accented characters - ratón', () => {
      const result = validator.validate('raton', 'ratón', {
        languageCode: 'es',
        accentSensitive: false,
      });
      expect(result.isCorrect).toBe(true);
    });

    it('should handle accented characters - león', () => {
      const result = validator.validate('leon', 'león', {
        languageCode: 'es',
        accentSensitive: false,
      });
      expect(result.isCorrect).toBe(true);
    });

    it('should accept "el león" or "león" interchangeably', () => {
      const result1 = validator.validate('león', 'el león', { languageCode: 'es' });
      expect(result1.isCorrect).toBe(true);

      const result2 = validator.validate('el león', 'león', { languageCode: 'es' });
      expect(result2.isCorrect).toBe(true);
    });

    it('should handle typos with fuzzy matching - "parro" → "perro"', () => {
      const result = validator.validate('parro', 'perro', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('fuzzy');
    });

    it('should handle typos with fuzzy matching - "gto" → "gato"', () => {
      const result = validator.validate('gto', 'gato', { languageCode: 'es' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('fuzzy');
    });
  });

  describe('Spanish Phrases with Animals', () => {
    it('should handle multi-word phrases', () => {
      const result = validator.validate(
        'el perro grande',
        'el perro grande',
        { languageCode: 'es' }
      );
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('exact');
    });

    it('should accept phrase without article when article expected', () => {
      const result = validator.validate(
        'perro grande',
        'el perro grande',
        { languageCode: 'es' }
      );
      expect(result.isCorrect).toBe(true);
    });
  });
});

describe('EnglishProcessor', () => {
  const processor = new EnglishProcessor();
  const validator = new AnswerValidator();

  describe('Basic Properties', () => {
    it('should have correct language code', () => {
      expect(processor.languageCode).toBe('en');
      expect(processor.languageName).toBe('English');
    });
  });

  describe('Contractions', () => {
    it('should accept "can\'t" when "cannot" expected', () => {
      const result = processor.checkSpecialRules(
        "can't",
        'cannot',
        "can't",
        'cannot'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.tier).toBe('alternate');
    });

    it('should accept "cannot" when "can\'t" expected', () => {
      const result = processor.checkSpecialRules(
        'cannot',
        "can't",
        'cannot',
        "can't"
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });

    it('should handle "it\'s" and "it is"', () => {
      const result = processor.checkSpecialRules(
        "it's",
        'it is',
        "it's",
        'it is'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });

    it('should get contraction expansions', () => {
      const alternates = processor.getAlternateForms("can't");
      expect(alternates).toContain('cannot');
    });
  });

  describe('Spelling Variants', () => {
    it('should accept "color" when "colour" expected', () => {
      const result = processor.checkSpecialRules(
        'color',
        'colour',
        'color',
        'colour'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.feedback).toContain('American spelling');
    });

    it('should accept "colour" when "color" expected', () => {
      const result = processor.checkSpecialRules(
        'colour',
        'color',
        'colour',
        'color'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.feedback).toContain('British spelling');
    });

    it('should handle "center" vs "centre"', () => {
      const result = processor.checkSpecialRules(
        'center',
        'centre',
        'center',
        'centre'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });

    it('should handle "realize" vs "realise"', () => {
      const result = processor.checkSpecialRules(
        'realize',
        'realise',
        'realize',
        'realise'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });
  });

  describe('Article Variations', () => {
    it('should accept "dog" when "a dog" expected', () => {
      const result = processor.checkSpecialRules(
        'dog',
        'a dog',
        'dog',
        'a dog'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.tier).toBe('fuzzy');
    });

    it('should accept "a dog" when "dog" expected', () => {
      const result = processor.checkSpecialRules(
        'a dog',
        'dog',
        'a dog',
        'dog'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
    });

    it('should handle "a" vs "an" mistakes', () => {
      const result = processor.checkSpecialRules(
        'a apple',
        'an apple',
        'a apple',
        'an apple'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.feedback).toContain('vowel');
    });

    it('should handle "an" vs "a" mistakes', () => {
      const result = processor.checkSpecialRules(
        'an dog',
        'a dog',
        'an dog',
        'a dog'
      );
      expect(result).not.toBeNull();
      expect(result?.isCorrect).toBe(true);
      expect(result?.feedback).toContain('consonant');
    });
  });

  describe('Plural Forms', () => {
    it('should provide plural alternates', () => {
      const alternates = processor.getAlternateForms('dog');
      expect(alternates).toContain('dogs');
    });

    it('should handle -y to -ies transformation', () => {
      const alternates = processor.getAlternateForms('city');
      expect(alternates).toContain('cities');
    });

    it('should handle -ch to -ches transformation', () => {
      const alternates = processor.getAlternateForms('church');
      expect(alternates).toContain('churches');
    });
  });

  describe('Integration with Validator', () => {
    it('should work with validator for contractions', () => {
      const result = validator.validate("can't", 'cannot', { languageCode: 'en' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
    });

    it('should work with validator for spelling variants', () => {
      const result = validator.validate('color', 'colour', { languageCode: 'en' });
      expect(result.isCorrect).toBe(true);
      expect(result.tier).toBe('alternate');
    });
  });
});

describe('DefaultProcessor', () => {
  const processor = new DefaultProcessor();

  it('should have default language code', () => {
    expect(processor.languageCode).toBe('default');
    expect(processor.languageName).toBe('Default');
  });

  it('should normalize whitespace', () => {
    expect(processor.normalize('  hello  world  ')).toBe('hello world');
  });

  it('should return null for special rules', () => {
    const result = processor.checkSpecialRules('test', 'test', 'test', 'test');
    expect(result).toBeNull();
  });

  it('should return empty alternates', () => {
    const alternates = processor.getAlternateForms('test');
    expect(alternates).toEqual([]);
  });
});

describe('Language Processor Registry', () => {
  it('should get Spanish processor', () => {
    const processor = getLanguageProcessor('es');
    expect(processor.languageCode).toBe('es');
  });

  it('should get English processor', () => {
    const processor = getLanguageProcessor('en');
    expect(processor.languageCode).toBe('en');
  });

  it('should fallback to default for unknown language', () => {
    const processor = getLanguageProcessor('xyz');
    expect(processor.languageCode).toBe('default');
  });

  it('should list registered languages', () => {
    const languages = getRegisteredLanguages();
    expect(languages).toContain('es');
    expect(languages).toContain('en');
    expect(languages).not.toContain('default');
  });

  it('should allow registering custom processors', () => {
    const customProcessor = {
      languageCode: 'fr',
      languageName: 'French',
      normalize: (input: string) => input.toLowerCase(),
      checkSpecialRules: () => null,
      getAlternateForms: () => [],
    };

    registerLanguageProcessor(customProcessor);
    const processor = getLanguageProcessor('fr');
    expect(processor.languageCode).toBe('fr');
  });
});

describe('End-to-End Spanish Animal Learning', () => {
  const validator = new AnswerValidator();

  describe('Complete Learning Session', () => {
    it('should validate a complete set of animal answers', () => {
      const testCases = [
        { user: 'perro', expected: 'perro', shouldPass: true },
        { user: 'el perro', expected: 'perro', shouldPass: true },
        { user: 'perro', expected: 'el perro', shouldPass: true },
        { user: 'perros', expected: 'perro', shouldPass: true },
        { user: 'perrito', expected: 'perro', shouldPass: true },
        { user: 'parro', expected: 'perro', shouldPass: true },
        { user: 'gato', expected: 'gato', shouldPass: true },
        { user: 'gata', expected: 'gato', shouldPass: true },
        { user: 'leon', expected: 'león', shouldPass: true },
        { user: 'pajaro', expected: 'pájaro', shouldPass: true },
      ];

      testCases.forEach(({ user, expected, shouldPass }) => {
        const result = validator.validate(user, expected, { languageCode: 'es' });
        expect(result.isCorrect).toBe(shouldPass);
      });
    });

    it('should reject completely wrong answers', () => {
      const result = validator.validate('gato', 'perro', { languageCode: 'es' });
      expect(result.isCorrect).toBe(false);
      expect(result.tier).toBe('incorrect');
    });

    it('should provide helpful feedback for wrong answers', () => {
      const result = validator.validate('gato', 'perro', { languageCode: 'es' });
      expect(result.feedback).toContain('Incorrect');
      expect(result.suggestion).toBeDefined();
    });
  });
});
