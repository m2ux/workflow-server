import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readSkill } from '../src/loaders/skill-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('skill-loader', () => {
  describe('readSkill', () => {
    it('should load a meta skill directly', async () => {
      const result = await readSkill('meta/state-management', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('state-management');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('should load activity-worker directly', async () => {
      const result = await readSkill('meta/activity-worker', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('activity-worker');
        expect(result.value.version).toBeDefined();
        expect(result.value.capability).toBeDefined();
      }
    });

    it('should return error for non-existent skill', async () => {
      const result = await readSkill('non-existent-skill', WORKFLOW_DIR);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('SkillNotFoundError');
        expect(result.error.code).toBe('SKILL_NOT_FOUND');
      }
    });

    it('should load activity-worker skill with protocol and rules', async () => {
      const result = await readSkill('meta/activity-worker', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const skill = result.value;
        
        expect(skill.protocol).toBeDefined();
        expect(Object.keys(skill.protocol).length).toBeGreaterThanOrEqual(6);

        expect(skill.rules).toBeDefined();
        expect(Object.keys(skill.rules).length).toBeGreaterThanOrEqual(3);

        expect(skill.errors).toBeDefined();
        expect(Object.keys(skill.errors).length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should have rule definitions with string values', async () => {
      const result = await readSkill('meta/activity-worker', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const [ruleName, ruleValue] of Object.entries(result.value.rules)) {
          expect(ruleValue, `${ruleName} should have a defined value`).toBeDefined();
        }
      }
    });

    it('should have error recovery patterns', async () => {
      const result = await readSkill('meta/activity-worker', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const [errorName, errorInfo] of Object.entries(result.value.errors)) {
          expect((errorInfo as Record<string, any>).cause, `${errorName} should have 'cause' field`).toBeDefined();
          expect((errorInfo as Record<string, any>).recovery, `${errorName} should have 'recovery' field`).toBeDefined();
        }
      }
    });
  });

  describe('malformed TOON handling', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then(fs =>
        fs.mkdtemp(join(tmpdir(), 'skill-test-'))
      );
      await mkdir(join(tempDir, 'meta', 'skills'), { recursive: true });
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('should reject non-skill TOON content as validation failure', async () => {
      await writeFile(join(tempDir, 'meta', 'skills', '01-not-a-skill.toon'), 'just a plain string', 'utf-8');
      const result = await readSkill('not-a-skill', tempDir);
      expect(result.success).toBe(false);
    });

    it('should handle empty TOON file without crashing', async () => {
      await writeFile(join(tempDir, 'meta', 'skills', '01-empty-skill.toon'), '', 'utf-8');
      const result = await readSkill('empty-skill', tempDir);
      expect(result.success).toBe(false);
    });

    it('should handle TOON with minimal valid fields', async () => {
      await writeFile(join(tempDir, 'meta', 'skills', '01-minimal.toon'), 'id: minimal\nversion: 1.0.0\ncapability: test capability\n', 'utf-8');
      const result = await readSkill('minimal', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('minimal');
      }
    });

    it('should return error for non-existent skill in temp directory', async () => {
      const result = await readSkill('does-not-exist', tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('SkillNotFoundError');
      }
    });
  });
});
