import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import {
  loadWorkflow,
  listWorkflows,
  getPhase,
  getCheckpoint,
  getValidTransitions,
  validateTransition,
} from '../src/loaders/workflow-loader.js';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

describe('workflow-loader', () => {
  describe('listWorkflows', () => {
    it('should list all available workflows', async () => {
      const workflows = await listWorkflows(WORKFLOW_DIR);
      expect(workflows.length).toBeGreaterThanOrEqual(2);
      
      const ids = workflows.map(w => w.id);
      expect(ids).toContain('work-package');
      expect(ids).toContain('example-workflow');
    });

    it('should return empty array for non-existent directory', async () => {
      const workflows = await listWorkflows('/non/existent/path');
      expect(workflows).toEqual([]);
    });

    it('should include title and version in manifest entries', async () => {
      const workflows = await listWorkflows(WORKFLOW_DIR);
      const workPackage = workflows.find(w => w.id === 'work-package');
      
      expect(workPackage).toBeDefined();
      expect(workPackage?.title).toBe('Work Package Implementation Workflow');
      expect(workPackage?.version).toBe('1.0.0');
    });
  });

  describe('loadWorkflow', () => {
    it('should load a valid workflow', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('work-package');
        expect(result.value.phases.length).toBe(11);
        expect(result.value.initialPhase).toBe('phase-1-issue-verification');
      }
    });

    it('should return error for non-existent workflow', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'non-existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('WorkflowNotFoundError');
      }
    });

    it('should load workflow with all phase types', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Check for phases with different features
        const phase1 = result.value.phases.find(p => p.id === 'phase-1-issue-verification');
        expect(phase1?.checkpoints?.length).toBeGreaterThan(0);
        expect(phase1?.steps?.length).toBeGreaterThan(0);
        expect(phase1?.transitions?.length).toBeGreaterThan(0);
        
        const phase6 = result.value.phases.find(p => p.id === 'phase-6-implement');
        expect(phase6?.loops?.length).toBeGreaterThan(0);
        
        const phase7 = result.value.phases.find(p => p.id === 'phase-7-validate');
        expect(phase7?.decisions?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getPhase', () => {
    let workflow: Awaited<ReturnType<typeof loadWorkflow>>;
    
    beforeAll(async () => {
      workflow = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    });

    it('should get existing phase', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const phase = getPhase(workflow.value, 'phase-1-issue-verification');
        expect(phase).toBeDefined();
        expect(phase?.name).toBe('Issue Verification & PR Creation');
      }
    });

    it('should return undefined for non-existent phase', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const phase = getPhase(workflow.value, 'non-existent-phase');
        expect(phase).toBeUndefined();
      }
    });
  });

  describe('getCheckpoint', () => {
    let workflow: Awaited<ReturnType<typeof loadWorkflow>>;
    
    beforeAll(async () => {
      workflow = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    });

    it('should get existing checkpoint', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const checkpoint = getCheckpoint(workflow.value, 'phase-1-issue-verification', 'checkpoint-1-2-issue-verification');
        expect(checkpoint).toBeDefined();
        expect(checkpoint?.name).toBe('Issue Verification Checkpoint');
        expect(checkpoint?.options.length).toBeGreaterThan(0);
      }
    });

    it('should return undefined for non-existent checkpoint', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const checkpoint = getCheckpoint(workflow.value, 'phase-1-issue-verification', 'non-existent');
        expect(checkpoint).toBeUndefined();
      }
    });
  });

  describe('getValidTransitions', () => {
    let workflow: Awaited<ReturnType<typeof loadWorkflow>>;
    
    beforeAll(async () => {
      workflow = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    });

    it('should get valid transitions from phase with conditional transitions', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const transitions = getValidTransitions(workflow.value, 'phase-1-issue-verification');
        expect(transitions).toContain('phase-2-requirements-elicitation');
        expect(transitions).toContain('phase-3-implementation-analysis');
      }
    });

    it('should get transitions from decision branches', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const transitions = getValidTransitions(workflow.value, 'phase-7-validate');
        expect(transitions).toContain('phase-8-review');
        expect(transitions).toContain('phase-6-implement');
        expect(transitions).toContain('phase-5-plan-prepare');
      }
    });

    it('should return empty array for non-existent phase', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const transitions = getValidTransitions(workflow.value, 'non-existent');
        expect(transitions).toEqual([]);
      }
    });
  });

  describe('validateTransition', () => {
    let workflow: Awaited<ReturnType<typeof loadWorkflow>>;
    
    beforeAll(async () => {
      workflow = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    });

    it('should validate allowed transition', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'phase-1-issue-verification', 'phase-2-requirements-elicitation');
        expect(result.valid).toBe(true);
        expect(result.reason).toBeUndefined();
      }
    });

    it('should reject invalid transition', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'phase-1-issue-verification', 'phase-11-post-implementation');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('No valid transition');
      }
    });

    it('should reject transition from non-existent phase', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'non-existent', 'phase-2-requirements-elicitation');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Source phase not found');
      }
    });

    it('should reject transition to non-existent phase', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'phase-1-issue-verification', 'non-existent');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Target phase not found');
      }
    });
  });
});
