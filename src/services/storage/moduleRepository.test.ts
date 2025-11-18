import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getModuleRepository,
  ModuleRepository,
  ModuleRepositoryError,
} from './moduleRepository';
import {
  initializeDatabase,
  closeDatabase,
  resetDatabase,
} from './database';
import { spanishAnimalsModule } from '../modules/sampleModule';
import type { VocabularyModule } from '@/models/types';

describe('ModuleRepository', () => {
  let repository: ModuleRepository;

  beforeEach(async () => {
    await initializeDatabase();
    await resetDatabase();
    repository = getModuleRepository();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const repo1 = getModuleRepository();
      const repo2 = getModuleRepository();
      expect(repo1).toBe(repo2);
    });
  });

  describe('save', () => {
    it('should save a new module', async () => {
      await repository.save(spanishAnimalsModule);

      const retrieved = await repository.findById(spanishAnimalsModule.moduleId);
      expect(retrieved).toBeDefined();
      expect(retrieved!.title).toBe(spanishAnimalsModule.title);
    });

    it('should update existing module', async () => {
      await repository.save(spanishAnimalsModule);

      const updated = {
        ...spanishAnimalsModule,
        description: 'Updated description',
      };
      await repository.save(updated);

      const retrieved = await repository.findById(spanishAnimalsModule.moduleId);
      expect(retrieved!.description).toBe('Updated description');
    });

    it('should throw ModuleRepositoryError on failure', async () => {
      // Create invalid module that will fail validation
      const invalidModule = {} as VocabularyModule;

      await expect(repository.save(invalidModule)).rejects.toThrow(
        ModuleRepositoryError
      );
    });

    it('should save with retry options', async () => {
      // Test that retry options are accepted
      await expect(
        repository.save(spanishAnimalsModule, { retry: true, maxRetries: 2 })
      ).resolves.not.toThrow();
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      await repository.save(spanishAnimalsModule);
    });

    it('should retrieve module by id', async () => {
      const module = await repository.findById(spanishAnimalsModule.moduleId);

      expect(module).toBeDefined();
      expect(module!.moduleId).toBe(spanishAnimalsModule.moduleId);
    });

    it('should return null for non-existent module', async () => {
      const module = await repository.findById('non-existent');

      expect(module).toBeNull();
    });

    it('should include progress when requested', async () => {
      const module = await repository.findById(
        spanishAnimalsModule.moduleId,
        true
      );

      expect(module).toBeDefined();
      // Even without progress data, entries should have structure
      expect(module!.entries).toBeDefined();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await repository.save(spanishAnimalsModule);

      const testModule: VocabularyModule = {
        ...spanishAnimalsModule,
        moduleId: 'test-module',
        title: 'Test Module',
      };
      await repository.save(testModule);
    });

    it('should retrieve all modules', async () => {
      const modules = await repository.findAll();

      expect(modules).toHaveLength(2);
      expect(modules.map((m) => m.moduleId)).toContain(
        spanishAnimalsModule.moduleId
      );
      expect(modules.map((m) => m.moduleId)).toContain('test-module');
    });

    it('should include metadata when requested', async () => {
      const modules = await repository.findAll(true);

      expect(modules).toHaveLength(2);
      // StoredModule has id, createdAt, updatedAt
      expect(modules[0]).toHaveProperty('id');
      expect(modules[0]).toHaveProperty('createdAt');
      expect(modules[0]).toHaveProperty('updatedAt');
    });

    it('should return empty array when no modules exist', async () => {
      await resetDatabase();

      const modules = await repository.findAll();

      expect(modules).toEqual([]);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await repository.save(spanishAnimalsModule);
    });

    it('should delete a module', async () => {
      await repository.delete(spanishAnimalsModule.moduleId);

      const module = await repository.findById(spanishAnimalsModule.moduleId);
      expect(module).toBeNull();
    });

    it('should not throw when deleting non-existent module', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });

    it('should delete with retry options', async () => {
      await expect(
        repository.delete(spanishAnimalsModule.moduleId, {
          retry: true,
          maxRetries: 2,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('transaction', () => {
    it('should execute operations in transaction', async () => {
      const result = await repository.transaction(async () => {
        await repository.save(spanishAnimalsModule);
        return 'success';
      });

      expect(result).toBe('success');

      const module = await repository.findById(spanishAnimalsModule.moduleId);
      expect(module).toBeDefined();
    });

    it('should handle errors in transaction', async () => {
      const testModule: VocabularyModule = {
        ...spanishAnimalsModule,
        moduleId: 'test-module',
      };

      await expect(
        repository.transaction(async () => {
          await repository.save(testModule);
          throw new Error('Simulated error');
        })
      ).rejects.toThrow();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await repository.save(spanishAnimalsModule);

      const frenchModule: VocabularyModule = {
        moduleId: 'french-colors',
        title: 'French Colors',
        description: 'Learn basic color vocabulary in French',
        language: 'fr',
        version: '1.0.0',
        entries: [],
        tags: ['french', 'colors', 'basics'],
      };
      await repository.save(frenchModule);

      const advancedModule: VocabularyModule = {
        moduleId: 'spanish-advanced',
        title: 'Spanish Advanced Verbs',
        description: 'Advanced verb conjugations',
        language: 'es',
        version: '1.0.0',
        entries: [],
        tags: ['spanish', 'verbs', 'advanced'],
      };
      await repository.save(advancedModule);
    });

    it('should search by title', async () => {
      const results = await repository.search('French');

      expect(results).toHaveLength(1);
      expect(results[0].moduleId).toBe('french-colors');
    });

    it('should search by description', async () => {
      const results = await repository.search('conjugations');

      expect(results).toHaveLength(1);
      expect(results[0].moduleId).toBe('spanish-advanced');
    });

    it('should search by tags', async () => {
      const results = await repository.search('animals');

      expect(results).toHaveLength(1);
      expect(results[0].moduleId).toBe(spanishAnimalsModule.moduleId);
    });

    it('should search by partial module id', async () => {
      const results = await repository.search('spanish');

      // Should match both spanish-animals-basics and spanish-advanced
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should be case insensitive', async () => {
      const results = await repository.search('FRENCH');

      expect(results).toHaveLength(1);
      expect(results[0].moduleId).toBe('french-colors');
    });

    it('should return multiple matches', async () => {
      const results = await repository.search('spanish');

      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.map((r) => r.moduleId)).toContain(
        spanishAnimalsModule.moduleId
      );
      expect(results.map((r) => r.moduleId)).toContain('spanish-advanced');
    });

    it('should return empty array for no matches', async () => {
      const results = await repository.search('xyz123notfound');

      expect(results).toEqual([]);
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await repository.save(spanishAnimalsModule);
    });

    it('should return true for existing module', async () => {
      const exists = await repository.exists(spanishAnimalsModule.moduleId);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent module', async () => {
      const exists = await repository.exists('non-existent');

      expect(exists).toBe(false);
    });
  });

  describe('count', () => {
    it('should count modules', async () => {
      expect(await repository.count()).toBe(0);

      await repository.save(spanishAnimalsModule);
      expect(await repository.count()).toBe(1);

      const testModule: VocabularyModule = {
        ...spanishAnimalsModule,
        moduleId: 'test-module',
      };
      await repository.save(testModule);
      expect(await repository.count()).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw ModuleRepositoryError with operation name', async () => {
      const invalidModule = {} as VocabularyModule;

      try {
        await repository.save(invalidModule);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleRepositoryError);
        expect((error as ModuleRepositoryError).operation).toBe('save');
      }
    });

    it('should include cause in error', async () => {
      const invalidModule = {} as VocabularyModule;

      try {
        await repository.save(invalidModule);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleRepositoryError);
        expect((error as ModuleRepositoryError).cause).toBeDefined();
      }
    });
  });
});
