import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  readAgentRegistry,
  listAgentRegistries,
  loadDefaultAgentRegistry,
  findAgentForEffectivityInRegistry,
  getRegistryCoverage,
  readAgentRegistryIndex,
  AgentRegistryNotFoundError,
} from '../src/loaders/agent-loader.js';
import {
  validateAgentRegistry,
  safeValidateAgentRegistry,
  validateAgentConfig,
  safeValidateAgentConfig,
  findAgentForEffectivity,
  findAgentsForEffectivities,
} from '../src/schema/agent.schema.js';

const FIXTURES_DIR = join(process.cwd(), 'tests', 'fixtures', 'agents');

describe('agent-schema', () => {
  describe('validateAgentConfig', () => {
    it('should validate a minimal agent config', () => {
      const data = {
        effectivities: ['code-review'],
        model: 'fast',
      };
      
      const result = safeValidateAgentConfig(data);
      expect(result.success).toBe(true);
    });

    it('should validate agent config with all fields', () => {
      const data = {
        effectivities: ['code-review', 'code-review_rust'],
        model: 'fast',
        instructions: 'Review code carefully',
        tools: ['read_file', 'grep'],
        timeout: 300,
      };
      
      const result = safeValidateAgentConfig(data);
      expect(result.success).toBe(true);
    });

    it('should reject agent config without effectivities', () => {
      const data = {
        model: 'fast',
      };
      
      const result = safeValidateAgentConfig(data);
      expect(result.success).toBe(false);
    });

    it('should reject agent config with empty effectivities', () => {
      const data = {
        effectivities: [],
        model: 'fast',
      };
      
      const result = safeValidateAgentConfig(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateAgentRegistry', () => {
    it('should validate a registry with agents', () => {
      const data = {
        agents: {
          'code-reviewer': {
            effectivities: ['code-review'],
            model: 'fast',
          },
        },
      };
      
      const result = safeValidateAgentRegistry(data);
      expect(result.success).toBe(true);
    });

    it('should validate a registry with metadata', () => {
      const data = {
        version: '1.0.0',
        description: 'Test registry',
        agents: {
          'reviewer': {
            effectivities: ['code-review'],
          },
        },
      };
      
      const result = safeValidateAgentRegistry(data);
      expect(result.success).toBe(true);
    });
  });

  describe('findAgentForEffectivity', () => {
    it('should find agent with exact effectivity match', () => {
      const registry = {
        agents: {
          'code-reviewer': {
            effectivities: ['code-review', 'code-review_rust'],
            model: 'fast' as const,
          },
          'test-reviewer': {
            effectivities: ['test-review'],
            model: 'fast' as const,
          },
        },
      };
      
      const result = findAgentForEffectivity(registry, 'code-review_rust');
      expect(result).not.toBeNull();
      expect(result?.agentId).toBe('code-reviewer');
    });

    it('should return null for unmatched effectivity', () => {
      const registry = {
        agents: {
          'code-reviewer': {
            effectivities: ['code-review'],
            model: 'fast' as const,
          },
        },
      };
      
      const result = findAgentForEffectivity(registry, 'test-review');
      expect(result).toBeNull();
    });

    it('should return first matching agent', () => {
      const registry = {
        agents: {
          'first-reviewer': {
            effectivities: ['code-review'],
            model: 'fast' as const,
          },
          'second-reviewer': {
            effectivities: ['code-review'],
            model: 'fast' as const,
          },
        },
      };
      
      const result = findAgentForEffectivity(registry, 'code-review');
      expect(result?.agentId).toBe('first-reviewer');
    });
  });

  describe('findAgentsForEffectivities', () => {
    it('should find agents for multiple effectivities', () => {
      const registry = {
        agents: {
          'code-reviewer': {
            effectivities: ['code-review'],
            model: 'fast' as const,
          },
          'test-reviewer': {
            effectivities: ['test-review'],
            model: 'fast' as const,
          },
        },
      };
      
      const result = findAgentsForEffectivities(registry, ['code-review', 'test-review']);
      expect(result.size).toBe(2);
      expect(result.get('code-review')?.agentId).toBe('code-reviewer');
      expect(result.get('test-review')?.agentId).toBe('test-reviewer');
    });

    it('should return partial matches', () => {
      const registry = {
        agents: {
          'code-reviewer': {
            effectivities: ['code-review'],
            model: 'fast' as const,
          },
        },
      };
      
      const result = findAgentsForEffectivities(registry, ['code-review', 'unknown']);
      expect(result.size).toBe(1);
      expect(result.has('code-review')).toBe(true);
      expect(result.has('unknown')).toBe(false);
    });
  });
});

describe('agent-loader', () => {
  describe('readAgentRegistry', () => {
    it('should load default registry', async () => {
      const result = await readAgentRegistry('default', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.version).toBe('1.0.0');
        expect(result.value.agents).toBeDefined();
        expect(result.value.agents['code-reviewer']).toBeDefined();
      }
    });

    it('should load minimal registry variant', async () => {
      const result = await readAgentRegistry('minimal', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.agents['reviewer']).toBeDefined();
      }
    });

    it('should return error for non-existent registry', async () => {
      const result = await readAgentRegistry('non-existent', FIXTURES_DIR);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(AgentRegistryNotFoundError);
        expect(result.error.variant).toBe('non-existent');
      }
    });
  });

  describe('listAgentRegistries', () => {
    it('should list all registry variants', async () => {
      const entries = await listAgentRegistries(FIXTURES_DIR);
      
      expect(entries.length).toBeGreaterThanOrEqual(2);
      const variants = entries.map(e => e.variant);
      expect(variants).toContain('default');
      expect(variants).toContain('minimal');
    });

    it('should include path for each variant', async () => {
      const entries = await listAgentRegistries(FIXTURES_DIR);
      const defaultEntry = entries.find(e => e.variant === 'default');
      
      expect(defaultEntry).toBeDefined();
      expect(defaultEntry?.path).toBe('default.toon');
    });
  });

  describe('loadDefaultAgentRegistry', () => {
    it('should load the default registry', async () => {
      const result = await loadDefaultAgentRegistry(FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.agents['code-reviewer']).toBeDefined();
      }
    });
  });

  describe('findAgentForEffectivityInRegistry', () => {
    it('should find agent in default registry', async () => {
      const result = await findAgentForEffectivityInRegistry('code-review', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).not.toBeNull();
        expect(result.value?.agentId).toBe('code-reviewer');
      }
    });

    it('should return null for unmatched effectivity', async () => {
      const result = await findAgentForEffectivityInRegistry('unknown', FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeNull();
      }
    });

    it('should find agent in specific variant', async () => {
      const result = await findAgentForEffectivityInRegistry('code-review', FIXTURES_DIR, 'minimal');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value?.agentId).toBe('reviewer');
      }
    });
  });

  describe('getRegistryCoverage', () => {
    it('should return all effectivities covered by registry', async () => {
      const result = await getRegistryCoverage(FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toContain('code-review');
        expect(result.value).toContain('code-review_rust');
        expect(result.value).toContain('test-review');
      }
    });
  });

  describe('readAgentRegistryIndex', () => {
    it('should build registry index', async () => {
      const result = await readAgentRegistryIndex(FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toBeDefined();
        expect(result.value.variants.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should include agent and effectivity counts', async () => {
      const result = await readAgentRegistryIndex(FIXTURES_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const defaultVariant = result.value.variants.find(v => v.variant === 'default');
        expect(defaultVariant).toBeDefined();
        expect(defaultVariant?.agentCount).toBeGreaterThanOrEqual(2);
        expect(defaultVariant?.effectivityCount).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
