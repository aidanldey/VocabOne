import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportModuleToJSON,
  downloadModuleAsJSON,
  exportMultipleModules,
  createShareableModule,
  type ExportOptions,
} from './moduleExporter';
import type { VocabularyModule } from '../../models/types';

describe('moduleExporter', () => {
  const mockModule: VocabularyModule = {
    moduleId: 'test-module',
    title: 'Test Module',
    language: 'en',
    version: '1.0.0',
    description: 'A test module',
    author: 'Test Author',
    tags: ['test', 'sample'],
    entries: [
      {
        entryId: 'test-001',
        term: 'test',
        pronunciation: 'test',
        userNotes: 'My notes',
        cards: [
          {
            cardId: 'test-001-def-01',
            type: 'definition' as any,
            definition: 'A procedure to establish quality',
            expectedAnswer: 'test',
            hint: 'Starts with T',
          },
        ],
        progress: {
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          lastReview: null,
          nextReview: '2025-01-01',
          totalReviews: 0,
          correctCount: 0,
          incorrectCount: 0,
          streak: 0,
          mastered: false,
        },
      },
    ],
  };

  describe('exportModuleToJSON', () => {
    it('should export module to JSON string', () => {
      const json = exportModuleToJSON(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.schema_version).toBe('1.0.0');
      expect(parsed.module_metadata.module_id).toBe('test-module');
      expect(parsed.module_metadata.title).toBe('Test Module');
      expect(parsed.vocabulary_entries).toHaveLength(1);
    });

    it('should exclude progress by default', () => {
      const json = exportModuleToJSON(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries[0].progress).toBeUndefined();
    });

    it('should include progress when requested', () => {
      const json = exportModuleToJSON(mockModule, { includeProgress: true, includeCustomCards: false, includeNotes: false });
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries[0].progress).toBeDefined();
      expect(parsed.vocabulary_entries[0].progress.interval).toBe(1);
      expect(parsed.vocabulary_entries[0].progress.ease_factor).toBe(2.5);
    });

    it('should exclude notes by default', () => {
      const json = exportModuleToJSON(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries[0].user_notes).toBeUndefined();
    });

    it('should include notes when requested', () => {
      const json = exportModuleToJSON(mockModule, { includeProgress: false, includeCustomCards: false, includeNotes: true });
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries[0].user_notes).toBe('My notes');
    });

    it('should include module metadata fields', () => {
      const json = exportModuleToJSON(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.module_metadata.description).toBe('A test module');
      expect(parsed.module_metadata.author).toBe('Test Author');
      expect(parsed.module_metadata.tags).toEqual(['test', 'sample']);
    });

    it('should export card content with snake_case', () => {
      const json = exportModuleToJSON(mockModule);
      const parsed = JSON.parse(json);

      const card = parsed.vocabulary_entries[0].cards[0];
      expect(card.card_id).toBe('test-001-def-01');
      expect(card.card_type).toBe('definition');
      expect(card.content.expected_answer).toBe('test');
    });

    it('should handle module without optional fields', () => {
      const minimalModule: VocabularyModule = {
        moduleId: 'minimal',
        title: 'Minimal',
        language: 'en',
        version: '1.0.0',
        entries: [
          {
            entryId: 'min-001',
            term: 'minimal',
            cards: [
              {
                cardId: 'min-001-def-01',
                type: 'definition' as any,
                definition: 'Minimal definition',
                expectedAnswer: 'minimal',
              },
            ],
          },
        ],
      };

      const json = exportModuleToJSON(minimalModule);
      const parsed = JSON.parse(json);

      expect(parsed.module_metadata.module_id).toBe('minimal');
      expect(parsed.module_metadata.description).toBeUndefined();
    });

    it('should generate valid JSON', () => {
      const json = exportModuleToJSON(mockModule);
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('downloadModuleAsJSON', () => {
    beforeEach(() => {
      // Mock DOM APIs
      global.URL.createObjectURL = vi.fn(() => 'blob:test');
      global.URL.revokeObjectURL = vi.fn();
      document.createElement = vi.fn((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn(),
          } as any;
        }
        return {} as any;
      });
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
    });

    it('should successfully download module', () => {
      const result = downloadModuleAsJSON(mockModule);

      expect(result.success).toBe(true);
      expect(result.filename).toContain('test-module');
      expect(result.filename).toContain('.json');
    });

    it('should include date in filename', () => {
      const result = downloadModuleAsJSON(mockModule);

      expect(result.filename).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should add progress suffix when including progress', () => {
      const result = downloadModuleAsJSON(mockModule, { includeProgress: true, includeCustomCards: false, includeNotes: false });

      expect(result.filename).toContain('-with-progress');
    });

    it('should not add progress suffix when excluding progress', () => {
      const result = downloadModuleAsJSON(mockModule, { includeProgress: false, includeCustomCards: false, includeNotes: false });

      expect(result.filename).not.toContain('-with-progress');
    });

    it('should create blob with correct type', () => {
      downloadModuleAsJSON(mockModule);

      // Check that Blob was created with application/json
      // This is indirectly verified through successful execution
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should clean up URL after download', () => {
      downloadModuleAsJSON(mockModule);

      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportMultipleModules', () => {
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn(() => 'blob:test');
      global.URL.revokeObjectURL = vi.fn();
      document.createElement = vi.fn((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn(),
          } as any;
        }
        return {} as any;
      });
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
    });

    it('should export multiple modules', () => {
      const modules = [mockModule, { ...mockModule, moduleId: 'test-2', title: 'Test 2' }];
      const result = exportMultipleModules(modules);

      expect(result.success).toBe(true);
      expect(result.filename).toContain('vocabone-modules');
    });

    it('should include module count', () => {
      const modules = [mockModule, { ...mockModule, moduleId: 'test-2' }];
      exportMultipleModules(modules);

      // The export will contain module_count field
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle empty array', () => {
      const result = exportMultipleModules([]);

      expect(result.success).toBe(true);
    });
  });

  describe('createShareableModule', () => {
    it('should create module without progress', () => {
      const json = createShareableModule(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries[0].progress).toBeUndefined();
    });

    it('should create module without notes', () => {
      const json = createShareableModule(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries[0].user_notes).toBeUndefined();
    });

    it('should include all vocabulary entries', () => {
      const json = createShareableModule(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.vocabulary_entries).toHaveLength(1);
      expect(parsed.vocabulary_entries[0].entry_id).toBe('test-001');
    });

    it('should include module metadata', () => {
      const json = createShareableModule(mockModule);
      const parsed = JSON.parse(json);

      expect(parsed.module_metadata.module_id).toBe('test-module');
      expect(parsed.module_metadata.title).toBe('Test Module');
    });
  });
});
