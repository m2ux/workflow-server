import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  readEffectivity,
  listEffectivities,
  loadAllEffectivities,
  resolveIncludes,
  readResolvedEffectivity,
  matchesEffectivity,
  readEffectivityIndex,
  EffectivityNotFoundError,
  CircularIncludeError,
} from '../src/loaders/effectivity-loader.js';
import {
  validateEffectivity,
  safeValidateEffectivity,
  parseEffectivityId,
  isExtensionOf,
} from '../src/schema/effectivity.schema.js';

const FIXTURES_DIR = join(process.cwd(), 'tests', 'fixtures', 'effectivities');

describe('effectivity-schema', () => {
  describe('validateEffectivity', () => {
    it('should validate a minimal effectivity', () => {
      const data = {
        id: 'test-effectivity',
        name: 'Test Effectivity',
        version: '1.0.0',
      };
      
      const result = safeValidateEffectivity(data);
      expect(result.success).toBe(true);
    });

    it('should validate effectivity with includes', () => {
      const data = {
        id: 'code-review_rust',
        name: 'Rust Code Review',
        version: '1.0.0',
        includes: ['code-review'],
      };
      
      const result = safeValidateEffectivity(data);
      expect(result.success).toBe(true);
    });

    it('should reject effectivity without id', () => {
      const data = {
        name: 'Test',
        version: '1.0.0',
      };
      
      const result = safeValidateEffectivity(data);
      expect(result.success).toBe(false);
    });

    it('should reject effectivity with invalid version', () => {
      const data = {
        id: 'test',
        name: 'Test',
        version: 'invalid',
      };
      
      const result = safeValidateEffectivity(data);
      expect(result.success).toBe(false);
    });

    it('should reject effectivity with invalid id format', () => {
      const data = {
        id: 'Invalid ID',
        name: 'Test',
        version: '1.0.0',
      };
      
      const result = safeValidateEffectivity(data);
      expect(result.success).toBe(false);
    });
  });

  describe('parseEffectivityId', () => {
    it('should parse base effectivity', () => {
      const result = parseEffectivityId('code-review');
      expect(result.base).toBe('code-review');
      expect(result.extensions).toEqual([]);
    });

    it('should parse effectivity with one extension', () => {
      const result = parseEffectivityId('code-review_rust');
      expect(result.base).toBe('code-review');
      expect(result.extensions).toEqual(['rust']);
    });

    it('should parse effectivity with multiple extensions', () => {
      const result = parseEffectivityId('code-review_rust_substrate');
      expect(result.base).toBe('code-review');
      expect(result.extensions).toEqual(['rust', 'substrate']);
    });
  });

  describe('isExtensionOf', () => {
    it('should return true for direct extension', () => {
      expect(isExtensionOf('code-review_rust', 'code-review')).toBe(true);
    });

    it('should return true for nested extension', () => {
      expect(isExtensionOf('code-review_rust_substrate', 'code-review_rust')).toBe(true);
      expect(isExtensionOf('code-review_rust_substrate', 'code-review')).toBe(true);
    });

    it('should return false for same id', () => {
      expect(isExtensionOf('code-review', 'code-review')).toBe(false);
    });

    it('should return false for unrelated ids', () => {
      expect(isExtensionOf('test-review', 'code-review')).toBe(false);
    });
  });
});

describe('effectivity-loader', () => {
  describe('readEffectivity', () => {
    it('should load a base effectivity', async () => {
      const result = await readEffectivity('code-review', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('code-review');
        expect(result.value.name).toBe('Code Review');
        expect(result.value.version).toBe('1.0.0');
        expect(result.value.description).toBeDefined();
      }
    });

    it('should load an extended effectivity', async () => {
      const result = await readEffectivity('code-review_rust', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('code-review_rust');
        expect(result.value.includes).toContain('code-review');
      }
    });

    it('should return error for non-existent effectivity', async () => {
      const result = await readEffectivity('non-existent', FIXTURES_DIR);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(EffectivityNotFoundError);
        expect(result.error.effectivityId).toBe('non-existent');
      }
    });
  });

  describe('listEffectivities', () => {
    it('should list all effectivities', async () => {
      const entries = await listEffectivities(FIXTURES_DIR);
      
      expect(entries.length).toBeGreaterThanOrEqual(3);
      const ids = entries.map(e => e.id);
      expect(ids).toContain('code-review');
      expect(ids).toContain('code-review_rust');
      expect(ids).toContain('test-review');
    });

    it('should include name, version, and path', async () => {
      const entries = await listEffectivities(FIXTURES_DIR);
      const codeReview = entries.find(e => e.id === 'code-review');
      
      expect(codeReview).toBeDefined();
      expect(codeReview?.name).toBe('Code Review');
      expect(codeReview?.version).toBe('1.0.0');
      expect(codeReview?.path).toBe('code-review.toon');
    });
  });

  describe('loadAllEffectivities', () => {
    it('should load all effectivities into a map', async () => {
      const effectivities = await loadAllEffectivities(FIXTURES_DIR);
      
      expect(effectivities.size).toBeGreaterThanOrEqual(3);
      expect(effectivities.has('code-review')).toBe(true);
      expect(effectivities.has('code-review_rust')).toBe(true);
      expect(effectivities.has('test-review')).toBe(true);
    });
  });

  describe('resolveIncludes', () => {
    it('should return empty for effectivity without includes', async () => {
      const result = await resolveIncludes('code-review', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual([]);
      }
    });

    it('should resolve single include', async () => {
      const result = await resolveIncludes('code-review_rust', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toContain('code-review');
      }
    });

    it('should return error for non-existent include target', async () => {
      // This would require a fixture with a bad include
      const result = await resolveIncludes('non-existent', FIXTURES_DIR);
      
      expect(result.success).toBe(false);
    });
  });

  describe('readResolvedEffectivity', () => {
    it('should return effectivity with resolved includes', async () => {
      const result = await readResolvedEffectivity('code-review_rust', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('code-review_rust');
        expect(result.value.resolvedIncludes).toContain('code-review');
      }
    });
  });

  describe('matchesEffectivity', () => {
    it('should match exact effectivity id', () => {
      expect(matchesEffectivity('code-review', 'code-review')).toBe(true);
    });

    it('should not match different effectivity id', () => {
      expect(matchesEffectivity('code-review', 'test-review')).toBe(false);
    });

    it('should not match base for extended requirement', () => {
      // Exact match required per design decision
      expect(matchesEffectivity('code-review', 'code-review_rust')).toBe(false);
    });
  });

  describe('readEffectivityIndex', () => {
    it('should build effectivity index', async () => {
      const result = await readEffectivityIndex(FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toBeDefined();
        expect(result.value.effectivities.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should include id, name for each effectivity', async () => {
      const result = await readEffectivityIndex(FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const eff of result.value.effectivities) {
          expect(eff.id).toBeDefined();
          expect(eff.name).toBeDefined();
        }
      }
    });
  });
});
