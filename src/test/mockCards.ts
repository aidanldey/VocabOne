/**
 * Mock card data for testing card components.
 */

import type {
  ImageCard,
  AudioCard,
  DefinitionCard,
  ClozeCard,
  VideoCard,
  TriviaCard,
} from '@/models/types';
import { CardType } from '@/models/types';

export const mockImageCard: ImageCard = {
  cardId: 'perro-001-img-01',
  type: CardType.IMAGE,
  imageUrl: '/test/dog.jpg',
  prompt: 'What animal is this?',
  expectedAnswer: 'perro',
  alternateAnswers: ['el perro', 'un perro'],
  altText: 'A golden retriever dog sitting in a park',
  hint: 'This is a common household pet that barks',
  tags: ['pets', 'mammals'],
};

export const mockAudioCard: AudioCard = {
  cardId: 'perro-001-audio-01',
  type: CardType.AUDIO,
  audioUrl: '/test/perro.mp3',
  prompt: 'What word do you hear?',
  expectedAnswer: 'perro',
  alternateAnswers: ['el perro'],
  duration: 1.5,
  tags: ['pronunciation'],
};

export const mockDefinitionCard: DefinitionCard = {
  cardId: 'perro-001-def-01',
  type: CardType.DEFINITION,
  definition: 'A domesticated carnivorous mammal with four legs, known for its loyalty and ability to bark',
  expectedAnswer: 'perro',
  alternateAnswers: ['el perro'],
  partOfSpeech: 'noun',
  exampleSentence: 'El perro corre en el parque.',
  hint: "Man's best friend",
  tags: ['pets', 'mammals'],
};

export const mockClozeCard: ClozeCard = {
  cardId: 'gato-002-cloze-01',
  type: CardType.CLOZE,
  sentence: 'El ___ tiene nueve vidas según el dicho popular.',
  blank: 'gato',
  blankPosition: 1,
  expectedAnswer: 'gato',
  hint: 'This animal is said to have nine lives',
  tags: ['idioms'],
};

export const mockVideoCard: VideoCard = {
  cardId: 'perro-001-video-01',
  type: CardType.VIDEO,
  videoUrl: '/test/dog-running.mp4',
  prompt: 'What is this animal doing?',
  expectedAnswer: 'perro',
  alternateAnswers: ['el perro'],
  duration: 5,
  loop: false,
  subtitles: '/test/dog-running.vtt',
  tags: ['animals', 'actions'],
};

export const mockTriviaCard: TriviaCard = {
  cardId: 'perro-001-trivia-01',
  type: CardType.TRIVIA,
  question: 'What do we call the most popular pet in many households that is known for being loyal?',
  expectedAnswer: 'perro',
  context: 'In Spanish-speaking countries, this animal is commonly kept as a companion',
  hint: 'Starts with P',
  difficulty: 2,
  tags: ['culture', 'pets'],
};
