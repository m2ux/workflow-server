import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readSkill } from '../src/loaders/skill-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('skill-loader', () => {
  describe('readSkill', () => {
    it('should load a universal skill from meta workflow', async () => {
      const result = await readSkill('activity-resolution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('activity-resolution');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('should load workflow-execution as universal skill', async () => {
      const result = await readSkill('workflow-execution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('workflow-execution');
        expect(result.value.version).toBe('3.0.0');
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

    it('should load workflow-execution skill with all required sections', async () => {
      const result = await readSkill('workflow-execution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const skill = result.value;
        
        // Check protocol (refactored from execution_pattern)
        expect(skill.protocol).toBeDefined();
        
        // Check tools
        expect(skill.tools).toBeDefined();
        expect(skill.tools['list_workflows']).toBeDefined();
        expect(skill.tools['get_workflow']).toBeDefined();
        expect(skill.tools['next_activity']).toBeDefined();
        expect(skill.tools['get_checkpoint']).toBeDefined();
        expect(skill.tools['get_activities']).toBeDefined();
        
        // Check state reference (structure now in state.schema.json, behavior in state-management skill)
        expect(skill.state).toBeDefined();
        
        // Check interpretation
        expect(skill.interpretation).toBeDefined();
        expect(skill.interpretation.transitions).toBeDefined();
        expect(skill.interpretation.checkpoints).toBeDefined();
        
        // Check errors
        expect(skill.errors).toBeDefined();
        expect(Object.keys(skill.errors).length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should have tool guidance with when and returns fields', async () => {
      const result = await readSkill('workflow-execution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const [toolName, toolInfo] of Object.entries(result.value.tools)) {
          expect(toolInfo.when, `${toolName} should have 'when' field`).toBeDefined();
          expect(toolInfo.returns, `${toolName} should have 'returns' field`).toBeDefined();
        }
      }
    });

    it('should have error recovery patterns', async () => {
      const result = await readSkill('workflow-execution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const [errorName, errorInfo] of Object.entries(result.value.errors)) {
          expect(errorInfo.cause, `${errorName} should have 'cause' field`).toBeDefined();
          expect(errorInfo.recovery, `${errorName} should have 'recovery' field`).toBeDefined();
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
