import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import {
  loadWorkflow,
  listWorkflows,
  getActivity,
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
      expect(ids).toContain('meta');
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
      expect(workPackage?.version).toBe('2.1.0');
    });
  });

  describe('loadWorkflow', () => {
    it('should load a valid workflow', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('work-package');
        expect(result.value.activities.length).toBe(12);
        expect(result.value.initialActivity).toBe('issue-management');
      }
    });

    it('should return error for non-existent workflow', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'non-existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('WorkflowNotFoundError');
      }
    });

    it('should load workflow with all activity types', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Check for activities with different features
        const issueManagement = result.value.activities.find(a => a.id === 'issue-management');
        expect(issueManagement?.checkpoints?.length).toBeGreaterThan(0);
        expect(issueManagement?.steps?.length).toBeGreaterThan(0);
        expect(issueManagement?.transitions?.length).toBeGreaterThan(0);
        
        const implement = result.value.activities.find(a => a.id === 'implement');
        expect(implement?.loops?.length).toBeGreaterThan(0);
        
        const validate = result.value.activities.find(a => a.id === 'validate');
        expect(validate?.decisions?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getActivity', () => {
    let workflow: Awaited<ReturnType<typeof loadWorkflow>>;
    
    beforeAll(async () => {
      workflow = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    });

    it('should get existing activity', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const activity = getActivity(workflow.value, 'issue-management');
        expect(activity).toBeDefined();
        expect(activity?.name).toBe('Issue Management');
      }
    });

    it('should return undefined for non-existent activity', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const activity = getActivity(workflow.value, 'non-existent-activity');
        expect(activity).toBeUndefined();
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
        const checkpoint = getCheckpoint(workflow.value, 'issue-management', 'issue-verification');
        expect(checkpoint).toBeDefined();
        expect(checkpoint?.name).toBe('Issue Verification Checkpoint');
        expect(checkpoint?.options.length).toBeGreaterThan(0);
      }
    });

    it('should return undefined for non-existent checkpoint', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const checkpoint = getCheckpoint(workflow.value, 'issue-management', 'non-existent');
        expect(checkpoint).toBeUndefined();
      }
    });
  });

  describe('getValidTransitions', () => {
    let workflow: Awaited<ReturnType<typeof loadWorkflow>>;
    
    beforeAll(async () => {
      workflow = await loadWorkflow(WORKFLOW_DIR, 'work-package');
    });

    it('should get valid transitions from activity with single transition', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const transitions = getValidTransitions(workflow.value, 'issue-management');
        expect(transitions).toContain('design-philosophy');
      }
    });

    it('should get transitions from decision branches', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const transitions = getValidTransitions(workflow.value, 'validate');
        expect(transitions).toContain('strategic-review');
        expect(transitions).toContain('implement');
        expect(transitions).toContain('plan-prepare');
      }
    });

    it('should return empty array for non-existent activity', () => {
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
        const result = validateTransition(workflow.value, 'issue-management', 'design-philosophy');
        expect(result.valid).toBe(true);
        expect(result.reason).toBeUndefined();
      }
    });

    it('should reject invalid transition', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'issue-management', 'post-implementation');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('No valid transition');
      }
    });

    it('should reject transition from non-existent activity', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'non-existent', 'requirements-elicitation');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Source activity not found');
      }
    });

    it('should reject transition to non-existent activity', () => {
      expect(workflow.success).toBe(true);
      if (workflow.success) {
        const result = validateTransition(workflow.value, 'issue-management', 'non-existent');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Target activity not found');
      }
    });
  });
});
