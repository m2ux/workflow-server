import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listSkills, listUniversalSkills, readSkill, readSkillIndex } from '../src/loaders/skill-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('skill-loader', () => {
  describe('listUniversalSkills', () => {
    it('should list universal skills from meta workflow', async () => {
      const skills = await listUniversalSkills(WORKFLOW_DIR);
      expect(skills.length).toBeGreaterThanOrEqual(2);
      
      const ids = skills.map(s => s.id);
      expect(ids).toContain('execute-activity');
      expect(ids).toContain('state-management');
    });

    it('should include index, name, and path in universal skills', async () => {
      const skills = await listUniversalSkills(WORKFLOW_DIR);
      const executeActivity = skills.find(s => s.id === 'execute-activity');
      
      expect(executeActivity).toBeDefined();
      expect(executeActivity?.index).toBe('02');
      expect(executeActivity?.name).toBe('Execute Activity');
      expect(executeActivity?.path).toContain('execute-activity.toon');
      expect(executeActivity?.workflowId).toBeUndefined();
    });
  });

  describe('listSkills', () => {
    it('should list all skills when given workflowDir', async () => {
      const skills = await listSkills(WORKFLOW_DIR);
      expect(skills.length).toBeGreaterThanOrEqual(2);
      
      const ids = skills.map(s => s.id);
      expect(ids).toContain('execute-activity');
      expect(ids).toContain('state-management');
    });
  });

  describe('readSkill', () => {
    it('should load a universal skill from meta workflow', async () => {
      const result = await readSkill('state-management', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('state-management');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('should load execute-activity as universal skill', async () => {
      const result = await readSkill('execute-activity', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('execute-activity');
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

    it('should load execute-activity skill with protocol and tools', async () => {
      const result = await readSkill('execute-activity', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const skill = result.value;
        
        expect(skill.protocol).toBeDefined();
        
        expect(skill.tools).toBeDefined();
        expect(skill.tools['start_session']).toBeDefined();
        expect(skill.tools['next_activity']).toBeDefined();
        expect(skill.tools['get_skills']).toBeDefined();
        
        expect(skill.rules).toBeDefined();
        expect(Object.keys(skill.rules).length).toBeGreaterThanOrEqual(7);
        
        expect(skill.errors).toBeDefined();
        expect(Object.keys(skill.errors).length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should have tool guidance with when field', async () => {
      const result = await readSkill('execute-activity', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        for (const [toolName, toolInfo] of Object.entries(result.value.tools)) {
          expect(toolInfo.when, `${toolName} should have 'when' field`).toBeDefined();
        }
      }
    });

    it('should have error recovery patterns', async () => {
      const result = await readSkill('execute-activity', WORKFLOW_DIR);
      
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

  describe('readSkillIndex', () => {
    it('should build skill index dynamically from skill files', async () => {
      const result = await readSkillIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toBeDefined();
        expect(result.value.universal.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should include universal skills with id and capability', async () => {
      const result = await readSkillIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const ids = result.value.universal.map(s => s.id);
        expect(ids).toContain('execute-activity');
        expect(ids).toContain('state-management');
        
        for (const skill of result.value.universal) {
          expect(skill.id).toBeDefined();
          expect(skill.capability).toBeDefined();
        }
      }
    });

    it('should group workflow-specific skills by workflow', async () => {
      const result = await readSkillIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Currently no workflow-specific skills exist
        expect(result.value.workflow_specific).toBeDefined();
      }
    });

    it('should include usage instructions and next_action for each skill', async () => {
      const result = await readSkillIndex(WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Check usage instructions exist
        expect(result.value.usage).toBeDefined();
        expect(result.value.usage).toContain('next_action');
        
        // Check each universal skill has next_action
        for (const skill of result.value.universal) {
          expect(skill.next_action).toBeDefined();
          expect(skill.next_action.tool).toBe('get_skill');
          expect(skill.next_action.parameters).toBeDefined();
          expect(skill.next_action.parameters.skill_id).toBe(skill.id);
        }
      }
    });
  });
});
