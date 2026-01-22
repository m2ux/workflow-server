import { describe, it, expect } from 'vitest';
import { listSkills, listUniversalSkills, listWorkflowSkills, readSkill } from '../src/loaders/skill-loader.js';
import { join } from 'node:path';

const WORKFLOW_DIR = join(process.cwd(), 'workflows');

describe('skill-loader', () => {
  describe('listUniversalSkills', () => {
    it('should list universal skills from meta workflow', async () => {
      const skills = await listUniversalSkills(WORKFLOW_DIR);
      expect(skills.length).toBeGreaterThanOrEqual(2);
      
      const ids = skills.map(s => s.id);
      expect(ids).toContain('intent-resolution');
      expect(ids).toContain('workflow-execution');
    });

    it('should include index, name, and path in universal skills', async () => {
      const skills = await listUniversalSkills(WORKFLOW_DIR);
      const intentResolution = skills.find(s => s.id === 'intent-resolution');
      
      expect(intentResolution).toBeDefined();
      expect(intentResolution?.index).toBe('00');
      expect(intentResolution?.name).toBe('Intent Resolution');
      expect(intentResolution?.path).toBe('00-intent-resolution.toon');
      expect(intentResolution?.workflowId).toBeUndefined();
    });
  });

  describe('listWorkflowSkills', () => {
    it('should return empty for workflow without skills', async () => {
      const skills = await listWorkflowSkills(WORKFLOW_DIR, 'work-package');
      // work-package no longer has workflow-specific skills (they're all in meta)
      expect(skills.length).toBe(0);
    });
  });

  describe('listSkills', () => {
    it('should list all skills when given workflowDir', async () => {
      const skills = await listSkills(WORKFLOW_DIR);
      expect(skills.length).toBeGreaterThanOrEqual(2);
      
      const ids = skills.map(s => s.id);
      expect(ids).toContain('workflow-execution');
      expect(ids).toContain('intent-resolution');
    });
  });

  describe('readSkill', () => {
    it('should load a universal skill from meta workflow', async () => {
      const result = await readSkill('intent-resolution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('intent-resolution');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('should load workflow-execution as universal skill', async () => {
      const result = await readSkill('workflow-execution', WORKFLOW_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('workflow-execution');
        expect(result.value.version).toBe('2.0.0');
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
        expect(skill.tools['get_phase']).toBeDefined();
        expect(skill.tools['get_checkpoint']).toBeDefined();
        expect(skill.tools['validate_transition']).toBeDefined();
        
        // Check state management
        expect(skill.state).toBeDefined();
        expect(skill.state.track).toContain('currentPhase');
        expect(skill.state.track).toContain('completedPhases');
        
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
});
