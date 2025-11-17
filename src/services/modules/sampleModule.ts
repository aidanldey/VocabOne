/**
 * Sample vocabulary module for Spanish Animals.
 * Contains 5 vocabulary entries with multiple card types.
 */

import { CardType, type VocabularyModule } from '@/models/types';

/**
 * A sample Spanish Animals vocabulary module for testing and demonstration.
 */
export const spanishAnimalsModule: VocabularyModule = {
  moduleId: 'spanish-animals-basics',
  title: 'Spanish Animals - Basics',
  language: 'es',
  version: '1.0.0',
  description:
    'Learn the names of common animals in Spanish through images, definitions, and audio.',
  author: 'VocabOne Team',
  tags: ['spanish', 'animals', 'beginner', 'vocabulary'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  license: 'CC-BY-4.0',
  entries: [
    // Entry 1: perro (dog)
    {
      entryId: 'perro-001',
      term: 'perro',
      pronunciation: '/ˈpe.ro/',
      difficulty: 1,
      cards: [
        {
          cardId: 'perro-001-img-01',
          type: CardType.IMAGE,
          imageUrl: '/modules/spanish-animals/media/perro.jpg',
          prompt: 'What animal is this?',
          expectedAnswer: 'perro',
          alternateAnswers: ['el perro', 'un perro'],
          altText: 'A golden retriever dog sitting in a park',
          hint: 'This is a common household pet that barks',
          tags: ['pets', 'mammals'],
        },
        {
          cardId: 'perro-001-def-01',
          type: CardType.DEFINITION,
          definition:
            'A domesticated carnivorous mammal with four legs, known for its loyalty and ability to bark',
          expectedAnswer: 'perro',
          alternateAnswers: ['el perro'],
          partOfSpeech: 'noun',
          exampleSentence: 'El perro corre en el parque.',
          hint: 'Man\'s best friend',
          tags: ['pets', 'mammals'],
        },
        {
          cardId: 'perro-001-audio-01',
          type: CardType.AUDIO,
          audioUrl: '/modules/spanish-animals/media/perro.mp3',
          prompt: 'What word do you hear?',
          expectedAnswer: 'perro',
          alternateAnswers: ['el perro'],
          duration: 1.5,
          tags: ['pronunciation'],
        },
      ],
    },

    // Entry 2: gato (cat)
    {
      entryId: 'gato-002',
      term: 'gato',
      pronunciation: '/ˈɡa.to/',
      difficulty: 1,
      cards: [
        {
          cardId: 'gato-002-img-01',
          type: CardType.IMAGE,
          imageUrl: '/modules/spanish-animals/media/gato.jpg',
          prompt: 'What animal is this?',
          expectedAnswer: 'gato',
          alternateAnswers: ['el gato', 'un gato'],
          altText: 'A tabby cat sleeping on a couch',
          hint: 'This pet meows and purrs',
          tags: ['pets', 'mammals'],
        },
        {
          cardId: 'gato-002-def-01',
          type: CardType.DEFINITION,
          definition:
            'A small domesticated feline mammal with soft fur, retractable claws, and a long tail',
          expectedAnswer: 'gato',
          alternateAnswers: ['el gato'],
          partOfSpeech: 'noun',
          exampleSentence: 'Mi gato duerme todo el día.',
          hint: 'It catches mice',
          tags: ['pets', 'mammals'],
        },
        {
          cardId: 'gato-002-cloze-01',
          type: CardType.CLOZE,
          sentence: 'El ___ tiene nueve vidas según el dicho popular.',
          blank: 'gato',
          expectedAnswer: 'gato',
          blankPosition: 1,
          hint: 'This animal is said to have nine lives',
          tags: ['idioms'],
        },
      ],
    },

    // Entry 3: pájaro (bird)
    {
      entryId: 'pajaro-003',
      term: 'pájaro',
      pronunciation: '/ˈpa.xa.ɾo/',
      difficulty: 2,
      cards: [
        {
          cardId: 'pajaro-003-img-01',
          type: CardType.IMAGE,
          imageUrl: '/modules/spanish-animals/media/pajaro.jpg',
          prompt: 'What type of animal is this?',
          expectedAnswer: 'pájaro',
          alternateAnswers: ['el pájaro', 'un pájaro', 'pajaro'],
          altText: 'A colorful bird perched on a tree branch',
          hint: 'This animal has wings and can fly',
          tags: ['birds', 'wildlife'],
        },
        {
          cardId: 'pajaro-003-def-01',
          type: CardType.DEFINITION,
          definition:
            'A warm-blooded vertebrate animal with feathers, wings, and a beak, most species capable of flight',
          expectedAnswer: 'pájaro',
          alternateAnswers: ['el pájaro', 'pajaro'],
          partOfSpeech: 'noun',
          exampleSentence: 'El pájaro canta en la mañana.',
          hint: 'It builds nests in trees',
          tags: ['birds', 'wildlife'],
        },
        {
          cardId: 'pajaro-003-audio-01',
          type: CardType.AUDIO,
          audioUrl: '/modules/spanish-animals/media/pajaro.mp3',
          prompt: 'What word do you hear?',
          expectedAnswer: 'pájaro',
          alternateAnswers: ['pajaro', 'el pájaro'],
          duration: 2.0,
          tags: ['pronunciation'],
        },
      ],
    },

    // Entry 4: pez (fish)
    {
      entryId: 'pez-004',
      term: 'pez',
      pronunciation: '/peθ/',
      difficulty: 2,
      cards: [
        {
          cardId: 'pez-004-img-01',
          type: CardType.IMAGE,
          imageUrl: '/modules/spanish-animals/media/pez.jpg',
          prompt: 'What animal is this?',
          expectedAnswer: 'pez',
          alternateAnswers: ['el pez', 'un pez'],
          altText: 'A goldfish swimming in a bowl',
          hint: 'This animal lives in water and has gills',
          tags: ['aquatic', 'pets'],
        },
        {
          cardId: 'pez-004-def-01',
          type: CardType.DEFINITION,
          definition:
            'A cold-blooded aquatic vertebrate with gills and fins, living in water',
          expectedAnswer: 'pez',
          alternateAnswers: ['el pez'],
          partOfSpeech: 'noun',
          exampleSentence: 'El pez nada en el acuario.',
          hint: 'It breathes underwater',
          tags: ['aquatic'],
        },
      ],
    },

    // Entry 5: caballo (horse)
    {
      entryId: 'caballo-005',
      term: 'caballo',
      pronunciation: '/kaˈβa.ʎo/',
      difficulty: 2,
      cards: [
        {
          cardId: 'caballo-005-img-01',
          type: CardType.IMAGE,
          imageUrl: '/modules/spanish-animals/media/caballo.jpg',
          prompt: 'What animal is this?',
          expectedAnswer: 'caballo',
          alternateAnswers: ['el caballo', 'un caballo'],
          altText: 'A brown horse running in a field',
          hint: 'People ride this large animal',
          tags: ['farm', 'mammals'],
        },
        {
          cardId: 'caballo-005-def-01',
          type: CardType.DEFINITION,
          definition:
            'A large, solid-hoofed herbivorous mammal domesticated for riding and carrying loads',
          expectedAnswer: 'caballo',
          alternateAnswers: ['el caballo'],
          partOfSpeech: 'noun',
          exampleSentence: 'El caballo galopa por el campo.',
          hint: 'Knights rode these in medieval times',
          tags: ['farm', 'mammals'],
        },
        {
          cardId: 'caballo-005-cloze-01',
          type: CardType.CLOZE,
          sentence: 'El vaquero monta su ___ todos los días.',
          blank: 'caballo',
          expectedAnswer: 'caballo',
          blankPosition: 4,
          hint: 'Cowboys ride this animal',
          tags: ['farm', 'culture'],
        },
      ],
    },
  ],
};

/**
 * Get the sample module as a JSON string (for testing file loading).
 */
export function getSampleModuleJSON(): string {
  return JSON.stringify(spanishAnimalsModule, null, 2);
}

/**
 * Get module statistics.
 */
export function getModuleStats(module: VocabularyModule): {
  totalEntries: number;
  totalCards: number;
  cardTypeBreakdown: Record<string, number>;
  averageCardsPerEntry: number;
} {
  const cardTypeBreakdown: Record<string, number> = {};
  let totalCards = 0;

  for (const entry of module.entries) {
    totalCards += entry.cards.length;
    for (const card of entry.cards) {
      cardTypeBreakdown[card.type] = (cardTypeBreakdown[card.type] || 0) + 1;
    }
  }

  return {
    totalEntries: module.entries.length,
    totalCards,
    cardTypeBreakdown,
    averageCardsPerEntry: totalCards / module.entries.length,
  };
}
