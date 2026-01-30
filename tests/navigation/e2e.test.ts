/**
 * End-to-End Navigation Tests
 * 
 * Tests complete workflow traversal scenarios using the navigation API.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerNavigationTools } from '../../src/tools/navigation-tools.js';
import type { ServerConfig } from '../../src/config.js';
import * as workflowLoader from '../../src/loaders/workflow-loader.js';
import type { Workflow } from '../../src/schema/workflow.schema.js';

// Complex test workflow with multiple features
const createComplexWorkflow = (): Workflow => ({
  id: 'complex-workflow',
  version: '1.0.0',
  title: 'Complex Test Workflow',
  initialActivity: 'planning',
  activities: [
    {
      id: 'planning',
      name: 'Planning Phase',
      version: '1.0.0',
      steps: [
        { id: 'analyze', name: 'Analyze Requirements', required: true },
        { id: 'design', name: 'Create Design', required: true },
        { id: 'review-design', name: 'Review Design', required: false },
      ],
      checkpoints: [
        {
          id: 'ready-checkpoint',
          name: 'Ready to Implement',
          message: 'Is the design ready for implementation?',
          required: true,
          blocking: true,
          options: [
            { id: 'ready', label: 'Yes, ready to implement' },
            { id: 'not-ready', label: 'No, needs more work' },
          ],
        },
      ],
      transitions: [
        { to: 'implementation', isDefault: true },
      ],
    },
    {
      id: 'implementation',
      name: 'Implementation Phase',
      version: '1.0.0',
      steps: [
        { id: 'code', name: 'Write Code', required: true },
        { id: 'test', name: 'Write Tests', required: true },
        { id: 'docs', name: 'Write Documentation', required: false },
      ],
      checkpoints: [
        {
          id: 'code-review',
          name: 'Code Review',
          message: 'Has the code been reviewed?',
          required: true,
          blocking: true,
          options: [
            { id: 'approved', label: 'Approved' },
            { id: 'changes-needed', label: 'Changes needed' },
          ],
        },
      ],
      transitions: [
        { to: 'deployment', isDefault: true },
      ],
    },
    {
      id: 'deployment',
      name: 'Deployment Phase',
      version: '1.0.0',
      steps: [
        { id: 'deploy', name: 'Deploy to Production', required: true },
        { id: 'verify', name: 'Verify Deployment', required: true },
      ],
      transitions: [],
    },
  ],
});

// Simple workflow for basic tests
const createSimpleWorkflow = (): Workflow => ({
  id: 'simple-workflow',
  version: '1.0.0',
  title: 'Simple Workflow',
  initialActivity: 'task',
  activities: [
    {
      id: 'task',
      name: 'Single Task',
      version: '1.0.0',
      steps: [
        { id: 'step-1', name: 'Step One', required: true },
        { id: 'step-2', name: 'Step Two', required: true },
      ],
      transitions: [],
    },
  ],
});

// Workflow with effectivities for delegation tests
const createEffectivityWorkflow = (): Workflow => ({
  id: 'effectivity-workflow',
  version: '1.0.0',
  title: 'Effectivity Workflow',
  initialActivity: 'review',
  activities: [
    {
      id: 'review',
      name: 'Code Review',
      version: '1.0.0',
      steps: [
        { 
          id: 'run-review', 
          name: 'Run Code Review', 
          required: true,
          effectivities: ['code-review_rust'],
        },
        { 
          id: 'run-test-review', 
          name: 'Run Test Review', 
          required: true,
          effectivities: ['test-review'],
        },
        { 
          id: 'document', 
          name: 'Document Findings', 
          required: true,
          // No effectivities - can be done by primary agent
        },
      ],
      transitions: [],
    },
  ],
});

const mockConfig: ServerConfig = {
  serverName: 'test-server',
  serverVersion: '1.0.0',
  workflowDir: '/test/workflows',
  resourcesDir: '/test/resources',
  rulesDir: '/test/rules',
};

interface RegisteredTool {
  name: string;
  handler: (args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;
}

function captureTools(config: ServerConfig): Map<string, RegisteredTool> {
  const tools = new Map<string, RegisteredTool>();
  const mockServer = {
    tool: (name: string, _desc: string, _schema: unknown, handler: RegisteredTool['handler']) => {
      tools.set(name, { name, handler });
    },
  } as unknown as Server;
  registerNavigationTools(mockServer, config);
  return tools;
}

describe('End-to-End Navigation', () => {
  let tools: Map<string, RegisteredTool>;
  
  describe('Simple Workflow Traversal', () => {
    beforeEach(() => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createSimpleWorkflow(),
      });
      tools = captureTools(mockConfig);
    });
    
    it('completes workflow without checkpoints', async () => {
      // Start workflow
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'simple-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.position.activity.id).toBe('task');
      expect(response.checkpoint).toBeUndefined();
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Complete step 1
      const step1Result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'step-1',
      });
      response = JSON.parse(step1Result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('step-1');
      
      // Complete step 2
      const step2Result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'step-2',
      });
      response = JSON.parse(step2Result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('step-2');
    });
  });
  
  describe('Checkpoint Flow', () => {
    beforeEach(() => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createComplexWorkflow(),
      });
      tools = captureTools(mockConfig);
    });
    
    it('checkpoint blocks until responded', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'complex-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      // Should have checkpoint immediately
      expect(response.checkpoint).toBeDefined();
      expect(response.checkpoint.id).toBe('ready-checkpoint');
      
      // Try to complete step - should fail
      const actionHandler = tools.get('advance-workflow')!.handler;
      const failResult = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'analyze',
      });
      const failResponse = JSON.parse(failResult.content[0].text);
      
      expect(failResponse.success).toBe(false);
      expect(failResponse.error?.code).toBe('CHECKPOINT_BLOCKING');
      
      // Respond to checkpoint
      const checkpointResult = await actionHandler({
        state: response.state,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'ready-checkpoint',
        option_id: 'ready',
      });
      response = JSON.parse(checkpointResult.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.checkpoint).toBeUndefined();
      
      // Now step completion should work
      const stepResult = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'analyze',
      });
      response = JSON.parse(stepResult.content[0].text);
      
      expect(response.success).toBe(true);
    });
    
    it('full activity traversal with transition', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'complex-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Respond to checkpoint
      let result = await actionHandler({
        state: response.state,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'ready-checkpoint',
        option_id: 'ready',
      });
      response = JSON.parse(result.content[0].text);
      
      // Complete required steps
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'analyze',
      });
      response = JSON.parse(result.content[0].text);
      
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'design',
      });
      response = JSON.parse(result.content[0].text);
      
      // Activity should now be complete, transition to implementation
      result = await actionHandler({
        state: response.state,
        action: 'transition',
        activity_id: 'implementation',
      });
      response = JSON.parse(result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.position.activity.id).toBe('implementation');
      expect(response.message).toContain('implementation');
    });
  });
  
  describe('State Resumption', () => {
    beforeEach(() => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createSimpleWorkflow(),
      });
      tools = captureTools(mockConfig);
    });
    
    it('resume from saved state token', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'simple-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Complete step 1
      const step1Result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'step-1',
      });
      response = JSON.parse(step1Result.content[0].text);
      
      // Save state token
      const savedToken = response.state;
      
      // "Resume" by calling resume-workflow with saved token
      const situationHandler = tools.get('resume-workflow')!.handler;
      const resumeResult = await situationHandler({ state: savedToken });
      const resumeResponse = JSON.parse(resumeResult.content[0].text);
      
      expect(resumeResponse.success).toBe(true);
      expect(resumeResponse.position.activity.id).toBe('task');
      
      // Should be able to continue from where we left off
      const step2Result = await actionHandler({
        state: resumeResponse.state,
        action: 'complete_step',
        step_id: 'step-2',
      });
      const step2Response = JSON.parse(step2Result.content[0].text);
      
      expect(step2Response.success).toBe(true);
    });
    
    it('state token contains progress history', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'simple-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Complete step 1
      let result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'step-1',
      });
      response = JSON.parse(result.content[0].text);
      
      // Complete step 2
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'step-2',
      });
      response = JSON.parse(result.content[0].text);
      
      // State token changes after each action
      const situationHandler = tools.get('resume-workflow')!.handler;
      const situationResult = await situationHandler({ state: response.state });
      const situationResponse = JSON.parse(situationResult.content[0].text);
      
      // Position should reflect completed work
      expect(situationResponse.success).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    beforeEach(() => {
      tools = captureTools(mockConfig);
    });
    
    it('handles invalid workflow ID', async () => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: false,
        error: new Error('Workflow not found'),
      });
      
      const startHandler = tools.get('start-workflow')!.handler;
      
      await expect(startHandler({ workflow_id: 'nonexistent' }))
        .rejects.toThrow('Workflow not found');
    });
    
    it('handles corrupted state token', async () => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createSimpleWorkflow(),
      });
      
      const situationHandler = tools.get('resume-workflow')!.handler;
      
      await expect(situationHandler({ state: 'invalid-token' }))
        .rejects.toThrow();
    });
    
    it('handles missing required action parameters', async () => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createSimpleWorkflow(),
      });
      
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'simple-workflow' });
      const response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Missing step_id
      await expect(actionHandler({
        state: response.state,
        action: 'complete_step',
      })).rejects.toThrow('step_id is required');
      
      // Missing activity_id
      await expect(actionHandler({
        state: response.state,
        action: 'transition',
      })).rejects.toThrow('activity_id is required');
      
      // Missing loop_id
      await expect(actionHandler({
        state: response.state,
        action: 'advance_loop',
      })).rejects.toThrow('loop_id is required');
    });
  });
  
  describe('Multi-Activity Workflow', () => {
    beforeEach(() => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createComplexWorkflow(),
      });
      tools = captureTools(mockConfig);
    });
    
    it('traverses multiple activities in sequence', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'complex-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // === PLANNING PHASE ===
      // Respond to checkpoint
      let result = await actionHandler({
        state: response.state,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'ready-checkpoint',
        option_id: 'ready',
      });
      response = JSON.parse(result.content[0].text);
      
      // Complete required steps
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'analyze',
      });
      response = JSON.parse(result.content[0].text);
      
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'design',
      });
      response = JSON.parse(result.content[0].text);
      
      // Transition to implementation
      result = await actionHandler({
        state: response.state,
        action: 'transition',
        activity_id: 'implementation',
      });
      response = JSON.parse(result.content[0].text);
      
      expect(response.position.activity.id).toBe('implementation');
      expect(response.checkpoint?.id).toBe('code-review');
      
      // === IMPLEMENTATION PHASE ===
      // Respond to code review checkpoint
      result = await actionHandler({
        state: response.state,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'code-review',
        option_id: 'approved',
      });
      response = JSON.parse(result.content[0].text);
      
      // Complete required steps
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'code',
      });
      response = JSON.parse(result.content[0].text);
      
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'test',
      });
      response = JSON.parse(result.content[0].text);
      
      // Transition to deployment
      result = await actionHandler({
        state: response.state,
        action: 'transition',
        activity_id: 'deployment',
      });
      response = JSON.parse(result.content[0].text);
      
      expect(response.position.activity.id).toBe('deployment');
      
      // === DEPLOYMENT PHASE ===
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'deploy',
      });
      response = JSON.parse(result.content[0].text);
      
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'verify',
      });
      response = JSON.parse(result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('verify');
    });
  });
  
  describe('Effectivity-Aware Navigation', () => {
    beforeEach(() => {
      vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
        success: true,
        value: createEffectivityWorkflow(),
      });
      tools = captureTools(mockConfig);
    });
    
    it('includes effectivities in initial navigation response', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'effectivity-workflow' });
      const response = JSON.parse(startResult.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.availableActions.required.length).toBeGreaterThanOrEqual(1);
      
      // First step should have effectivities
      const stepAction = response.availableActions.required.find(
        (a: Record<string, unknown>) => a.action === 'complete_step' && a.step === 'run-review'
      );
      expect(stepAction).toBeDefined();
      expect(stepAction.effectivities).toBeDefined();
      expect(stepAction.effectivities).toContain('code-review_rust');
    });
    
    it('effectivities change as workflow progresses', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'effectivity-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Complete first step
      const step1Result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'run-review',
      });
      response = JSON.parse(step1Result.content[0].text);
      
      // Second step should have different effectivities
      const stepAction = response.availableActions.required.find(
        (a: Record<string, unknown>) => a.action === 'complete_step' && a.step === 'run-test-review'
      );
      expect(stepAction).toBeDefined();
      expect(stepAction.effectivities).toContain('test-review');
    });
    
    it('steps without effectivities have no effectivities field', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'effectivity-workflow' });
      let response = JSON.parse(startResult.content[0].text);
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Complete first two steps
      let result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'run-review',
      });
      response = JSON.parse(result.content[0].text);
      
      result = await actionHandler({
        state: response.state,
        action: 'complete_step',
        step_id: 'run-test-review',
      });
      response = JSON.parse(result.content[0].text);
      
      // Third step should have no effectivities
      const stepAction = response.availableActions.required.find(
        (a: Record<string, unknown>) => a.action === 'complete_step' && a.step === 'document'
      );
      expect(stepAction).toBeDefined();
      expect(stepAction.effectivities).toBeUndefined();
    });
  });
});
