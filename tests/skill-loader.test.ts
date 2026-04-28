import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readSkill } from '../src/loaders/skill-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('skill-loader', () => {
  describe('readSkill', () => {
    it('should load a meta skill directly', async () => {
      const result = await readSkill('meta/agent-conduct', WORKFLOW_DIR);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('agent-conduct');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('should load workflow-engine directly', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('workflow-engine');
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

    it('should load workflow-engine skill with operations and rules', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const skill = result.value;
        
        expect(skill.operations).toBeDefined();
        expect(Object.keys(skill.operations!).length).toBeGreaterThanOrEqual(6);

        expect(skill.rules).toBeDefined();
        expect(Object.keys(skill.rules!).length).toBeGreaterThanOrEqual(3);

        // Errors live per-operation in v4+. Verify at least one operation declares errors.
        const opsWithErrors = Object.values(skill.operations!).filter(
          (op) => (op as { errors?: Record<string, unknown> }).errors !== undefined,
        );
        expect(opsWithErrors.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should have rule definitions with string values', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const [ruleName, ruleValue] of Object.entries(result.value.rules)) {
          expect(ruleValue, `${ruleName} should have a defined value`).toBeDefined();
        }
      }
    });

    it('should have per-operation error recovery patterns', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);

      expect(result.success).toBe(true);
      if (result.success && result.value.operations) {
        for (const [opName, opDef] of Object.entries(result.value.operations)) {
          const errors = (opDef as { errors?: Record<string, { cause?: string; recovery?: string }> }).errors;
          if (!errors) continue;
          for (const [errorName, errorInfo] of Object.entries(errors)) {
            expect(errorInfo.cause, `${opName}::${errorName} should have 'cause' field`).toBeDefined();
            expect(errorInfo.recovery, `${opName}::${errorName} should have 'recovery' field`).toBeDefined();
          }
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
