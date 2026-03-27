import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import { readRules, readRulesRaw } from '../src/loaders/rules-loader.js';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('rules-loader', () => {
  describe('readRules', () => {
    let rulesResult: Awaited<ReturnType<typeof readRules>>;

    beforeAll(async () => {
      rulesResult = await readRules(WORKFLOW_DIR);
    });

    it('should load global rules from meta/rules.toon', () => {
      expect(rulesResult.success).toBe(true);
      if (rulesResult.success) {
        expect(rulesResult.value.id).toBe('agent-rules');
        expect(rulesResult.value.version).toBeDefined();
        expect(rulesResult.value.title).toBeDefined();
        expect(rulesResult.value.description).toBeDefined();
      }
    });

    it('should have sections array with rule categories', () => {
      expect(rulesResult.success).toBe(true);
      if (rulesResult.success) {
        expect(Array.isArray(rulesResult.value.sections)).toBe(true);
        expect(rulesResult.value.sections.length).toBeGreaterThan(0);
      }
    });

    it('should include code-modification section', () => {
      expect(rulesResult.success).toBe(true);
      if (rulesResult.success) {
        const codeModSection = rulesResult.value.sections.find(s => s.id === 'code-modification');
        expect(codeModSection).toBeDefined();
        expect(codeModSection?.title).toBe('Code Modification Boundaries');
        expect(codeModSection?.priority).toBe('critical');
      }
    });

    it('should include version-control section with GitHub CLI guidance', () => {
      expect(rulesResult.success).toBe(true);
      if (rulesResult.success) {
        const githubSection = rulesResult.value.sections.find(s => s.id === 'github-cli');
        expect(githubSection).toBeDefined();
        expect(githubSection?.title).toBe('GitHub CLI Usage');
      }
    });

    it('should include precedence statement', () => {
      expect(rulesResult.success).toBe(true);
      if (rulesResult.success) {
        expect(rulesResult.value.precedence).toContain('Workflow-specific rules override');
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
