import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readRules, readRulesRaw } from '../src/loaders/rules-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('rules-loader', () => {
  describe('readRules with real workflow data', () => {
    it('should load rules from meta/rules.toon successfully', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.value;
        expect(rules.id).toBe('agent-rules');
        expect(rules.version).toBe('2.0.0');
        expect(rules.title).toBe('AI Agent Guidelines');
        expect(rules.description).toBeDefined();
        expect(rules.precedence).toBeDefined();
        expect(rules.sections.length).toBeGreaterThan(0);
      }
    });

    it('should validate required schema fields (id, version, title, description, precedence, sections)', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.value;
        expect(rules).toHaveProperty('id');
        expect(rules).toHaveProperty('version');
        expect(rules).toHaveProperty('title');
        expect(rules).toHaveProperty('description');
        expect(rules).toHaveProperty('precedence');
        expect(rules).toHaveProperty('sections');
        expect(Array.isArray(rules.sections)).toBe(true);
      }
    });

    it('should have sections with id and title', async () => {
      const result = await readRules(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        for (const section of result.value.sections) {
          expect(section.id).toBeDefined();
          expect(section.title).toBeDefined();
        }
      }
    });
  });

  describe('readRulesRaw with real workflow data', () => {
    it('should return raw TOON content as a string', async () => {
      const result = await readRulesRaw(WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeTypeOf('string');
        expect(result.value).toContain('agent-rules');
      }
    });
  });

  describe('BF-06: RulesSchema validation and error handling', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then(fs =>
        fs.mkdtemp(join(tmpdir(), 'rules-test-'))
      );
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('should return RulesNotFoundError when rules file is missing', async () => {
      const result = await readRules(tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('RulesNotFoundError');
        expect(result.error.code).toBe('RULES_NOT_FOUND');
      }
    });

    it('should return RulesNotFoundError (not crash) for empty meta dir', async () => {
      await mkdir(join(tempDir, 'meta'), { recursive: true });
      const result = await readRules(tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('RulesNotFoundError');
      }
    });

    it('should return parse error (not RulesNotFoundError without message) for malformed rules', async () => {
      await mkdir(join(tempDir, 'meta'), { recursive: true });
      await writeFile(join(tempDir, 'meta', 'rules.toon'), 'just a plain string with no structure', 'utf-8');
      const result = await readRules(tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('RulesNotFoundError');
        // The message should indicate a parse/validation problem, not just "not found"
        expect(result.error.message).toContain('Rules file exists but');
      }
    });

    it('should return validation error when required fields are missing', async () => {
      await mkdir(join(tempDir, 'meta'), { recursive: true });
      // TOON with some fields but missing required ones (no version, no precedence, no sections)
      const incompleteToon = 'id: test-rules\ntitle: Incomplete Rules\n';
      await writeFile(join(tempDir, 'meta', 'rules.toon'), incompleteToon, 'utf-8');
      const result = await readRules(tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('failed validation');
      }
    });

    it('should return validation error when sections is not an array', async () => {
      await mkdir(join(tempDir, 'meta'), { recursive: true });
      const badSections = [
        'id: test-rules',
        'version: 1.0.0',
        'title: Bad Rules',
        'description: Rules with wrong sections type',
        'precedence: global',
        'sections: not-an-array',
      ].join('\n');
      await writeFile(join(tempDir, 'meta', 'rules.toon'), badSections, 'utf-8');
      const result = await readRules(tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('failed validation');
      }
    });

    it('should succeed with valid minimal rules TOON', async () => {
      await mkdir(join(tempDir, 'meta'), { recursive: true });
      const validToon = [
        'id: minimal-rules',
        'version: 0.1.0',
        'title: Minimal Rules',
        'description: A minimal valid rules file',
        'precedence: global',
        'sections[1]:',
        '  - id: basics',
        '    title: Basic Rules',
      ].join('\n');
      await writeFile(join(tempDir, 'meta', 'rules.toon'), validToon, 'utf-8');
      const result = await readRules(tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('minimal-rules');
        expect(result.value.sections).toHaveLength(1);
        expect(result.value.sections[0].id).toBe('basics');
      }
    });
  });
});
