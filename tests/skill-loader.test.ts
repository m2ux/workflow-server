import { describe, it, expect } from 'vitest';
import { listSkills, listUniversalSkills, readSkill, readSkillIndex } from '../src/loaders/skill-loader.js';
import { join } from 'node:path';

const WORKFLOW_DIR = join(process.cwd(), 'registry/workflows');

describe('skill-loader', () => {
  describe('listUniversalSkills', () => {
    it('should list universal skills from meta workflow', async () => {
      const skills = await listUniversalSkills(WORKFLOW_DIR);
      expect(skills.length).toBeGreaterThanOrEqual(2);
      
      const ids = skills.map(s => s.id);
      expect(ids).toContain('activity-resolution');
      expect(ids).toContain('workflow-execution');
    });

    it('should include index, name, and path in universal skills', async () => {
      const skills = await listUniversalSkills(WORKFLOW_DIR);
      const activityResolution = skills.find(s => s.id === 'activity-resolution');
      
      expect(activityResolution).toBeDefined();
      expect(activityResolution?.index).toBe('00');
      expect(activityResolution?.name).toBe('Activity Resolution');
      expect(activityResolution?.path).toBe('00-activity-resolution.toon');
      expect(activityResolution?.workflowId).toBeUndefined();
    });
  });

  describe('listSkills', () => {
    it('should list all skills when given workflowDir', async () => {
      const skills = await listSkills(WORKFLOW_DIR);
      expect(skills.length).toBeGreaterThanOrEqual(2);
      
      const ids = skills.map(s => s.id);
      expect(ids).toContain('workflow-execution');
      expect(ids).toContain('activity-resolution');
    });
  });

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
        
        // Check execution_pattern
        expect(skill.execution_pattern).toBeDefined();
        expect(skill.execution_pattern.start).toContain('list_workflows');
        expect(skill.execution_pattern.start).toContain('get_workflow');
        
        // Check tools
        expect(skill.tools).toBeDefined();
        expect(skill.tools['list_workflows']).toBeDefined();
        expect(skill.tools['get_workflow']).toBeDefined();
        expect(skill.tools['get_workflow_activity']).toBeDefined();
        expect(skill.tools['get_checkpoint']).toBeDefined();
        expect(skill.tools['validate_transition']).toBeDefined();
        
        // Check state management
        expect(skill.state).toBeDefined();
        expect(skill.state.structure).toBeDefined();
        expect(skill.state.structure.currentActivity).toBeDefined();
        expect(skill.state.structure.completedActivities).toBeDefined();
        
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
        expect(ids).toContain('activity-resolution');
        expect(ids).toContain('workflow-execution');
        
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
