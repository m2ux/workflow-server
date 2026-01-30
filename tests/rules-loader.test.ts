import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readRules, readRulesRaw } from '../src/loaders/rules-loader.js';

const WORKFLOW_DIR = join(process.cwd(), 'registry/workflows');

describe('rules-loader', () => {
  describe('readRules', () => {
    it('should load global rules from meta/rules.toon', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('agent-rules');
        expect(result.value.version).toBeDefined();
        expect(result.value.title).toBeDefined();
        expect(result.value.description).toBeDefined();
      }
    });

    it('should have sections array with rule categories', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.value.sections)).toBe(true);
        expect(result.value.sections.length).toBeGreaterThan(0);
      }
    });

    it('should include code-modification section', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const codeModSection = result.value.sections.find(s => s.id === 'code-modification');
        expect(codeModSection).toBeDefined();
        expect(codeModSection?.title).toBe('Code Modification Boundaries');
        expect(codeModSection?.priority).toBe('critical');
      }
    });

    it('should include version-control section with GitHub CLI guidance', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const githubSection = result.value.sections.find(s => s.id === 'github-cli');
        expect(githubSection).toBeDefined();
        expect(githubSection?.title).toBe('GitHub CLI Usage');
      }
    });

    it('should include precedence statement', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.precedence).toContain('Workflow-specific rules override');
      }
    });

    it('should return error when rules file not found', async () => {
      const result = await readRules('/non/existent/path');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('RULES_NOT_FOUND');
      }
    });
  });

  describe('readRulesRaw', () => {
    it('should return raw TOON content', async () => {
      const result = await readRulesRaw(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toContain('id: agent-rules');
        expect(result.value).toContain('sections[');
      }
    });
  });
});
