import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { loadWorkflow } from '../../src/loaders/workflow-loader.js';
import { createInitialState } from '../../src/schema/state.schema.js';
import { computeAvailableActions, computePosition } from '../../src/navigation/compute.js';

const FIXTURES_DIR = join(process.cwd(), 'tests', 'fixtures', 'workflows');

describe('navigation effectivities', () => {
  describe('computeAvailableActions', () => {
    it('should include effectivities in actions when step has them', async () => {
      const result = await loadWorkflow(FIXTURES_DIR, 'effectivity-test');
      expect(result.success).toBe(true);
      if (!result.success) return;
      
      const workflow = result.value;
      const state = createInitialState(workflow.id, workflow.version, 'review-code');
      
      const actions = computeAvailableActions(workflow, state);
      
      // First step should have effectivities
      expect(actions.required.length).toBeGreaterThanOrEqual(1);
      const stepAction = actions.required.find(a => a.action === 'complete_step' && a.step === 'run-review');
      expect(stepAction).toBeDefined();
      expect(stepAction?.effectivities).toBeDefined();
      expect(stepAction?.effectivities).toContain('code-review_rust');
    });

    it('should not include effectivities when step does not have them', async () => {
      const result = await loadWorkflow(FIXTURES_DIR, 'effectivity-test');
      expect(result.success).toBe(true);
      if (!result.success) return;
      
      const workflow = result.value;
      // Create state at second step (which has no effectivities)
      const state = createInitialState(workflow.id, workflow.version, 'review-code');
      state.currentStep = 2;
      state.completedSteps = { 'review-code': [1] };
      
      const actions = computeAvailableActions(workflow, state);
      
      const stepAction = actions.required.find(a => a.action === 'complete_step' && a.step === 'document-findings');
      expect(stepAction).toBeDefined();
      expect(stepAction?.effectivities).toBeUndefined();
    });
  });

  describe('effectivity-aware navigation flow', () => {
    it('should provide complete navigation info with effectivities', async () => {
      const result = await loadWorkflow(FIXTURES_DIR, 'effectivity-test');
      expect(result.success).toBe(true);
      if (!result.success) return;
      
      const workflow = result.value;
      const state = createInitialState(workflow.id, workflow.version, 'review-code');
      
      // Get position and actions
      const position = computePosition(workflow, state);
      const actions = computeAvailableActions(workflow, state);
      
      // Verify position
      expect(position.workflow).toBe('effectivity-test');
      expect(position.activity.id).toBe('review-code');
      
      // Verify actions include effectivities
      const stepAction = actions.required[0];
      expect(stepAction?.effectivities).toContain('code-review_rust');
    });
  });
});
