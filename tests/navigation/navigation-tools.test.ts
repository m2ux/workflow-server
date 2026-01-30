import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerNavigationTools } from '../../src/tools/navigation-tools.js';
import type { ServerConfig } from '../../src/config.js';
import * as workflowLoader from '../../src/loaders/workflow-loader.js';
import type { Workflow } from '../../src/schema/workflow.schema.js';

// Mock workflow
const mockWorkflow: Workflow = {
  id: 'test-workflow',
  version: '1.0.0',
  title: 'Test Workflow',
  initialActivity: 'activity-1',
  activities: [
    {
      id: 'activity-1',
      name: 'First Activity',
      version: '1.0.0',
      steps: [
        { id: 'step-1', name: 'Step One', required: true },
        { id: 'step-2', name: 'Step Two', required: true },
      ],
      checkpoints: [
        {
          id: 'checkpoint-1',
          name: 'Review Checkpoint',
          message: 'Ready to proceed?',
          required: true,
          blocking: true,
          options: [
            { id: 'yes', label: 'Yes, proceed' },
            { id: 'no', label: 'No, go back' },
          ],
        },
      ],
      transitions: [
        { to: 'activity-2', isDefault: true },
      ],
    },
    {
      id: 'activity-2',
      name: 'Second Activity',
      version: '1.0.0',
      steps: [
        { id: 'final-step', name: 'Final Step', required: true },
      ],
      transitions: [],
    },
  ],
};

// Mock config
const mockConfig: ServerConfig = {
  serverName: 'test-server',
  serverVersion: '1.0.0',
  workflowDir: '/test/workflows',
  resourcesDir: '/test/resources',
  rulesDir: '/test/rules',
};

// Helper to capture registered tools
interface RegisteredTool {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;
}

function captureTools(config: ServerConfig): Map<string, RegisteredTool> {
  const tools = new Map<string, RegisteredTool>();
  
  const mockServer = {
    tool: (name: string, description: string, schema: Record<string, unknown>, handler: RegisteredTool['handler']) => {
      tools.set(name, { name, description, schema, handler });
    },
  } as unknown as Server;
  
  registerNavigationTools(mockServer, config);
  return tools;
}

describe('Navigation Tools', () => {
  let tools: Map<string, RegisteredTool>;
  
  beforeEach(() => {
    vi.spyOn(workflowLoader, 'loadWorkflow').mockResolvedValue({
      success: true,
      value: mockWorkflow,
    });
    
    tools = captureTools(mockConfig);
  });
  
  describe('tool registration', () => {
    it('registers all 4 navigation tools', () => {
      expect(tools.has('start-workflow')).toBe(true);
      expect(tools.has('resume-workflow')).toBe(true);
      expect(tools.has('advance-workflow')).toBe(true);
      expect(tools.has('end-workflow')).toBe(true);
      expect(tools.size).toBe(4);
    });
  });
  
  describe('start-workflow', () => {
    it('starts workflow and returns initial situation', async () => {
      const handler = tools.get('start-workflow')!.handler;
      const result = await handler({ workflow_id: 'test-workflow' });
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.position.workflow).toBe('test-workflow');
      expect(response.position.activity.id).toBe('activity-1');
      expect(response.state).toMatch(/^v1\.gzB64\./);
      expect(response.availableActions).toBeDefined();
    });
    
    it('includes initial checkpoint in response', async () => {
      const handler = tools.get('start-workflow')!.handler;
      const result = await handler({ workflow_id: 'test-workflow' });
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.checkpoint).toBeDefined();
      expect(response.checkpoint.id).toBe('checkpoint-1');
      expect(response.availableActions.required).toContainEqual(
        expect.objectContaining({ action: 'respond_to_checkpoint' })
      );
    });
  });
  
  describe('resume-workflow', () => {
    it('returns current situation from state token', async () => {
      // First start a workflow
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'test-workflow' });
      const startResponse = JSON.parse(startResult.content[0].text);
      
      // Then get situation
      const handler = tools.get('resume-workflow')!.handler;
      const result = await handler({ state: startResponse.state });
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.position.activity.id).toBe('activity-1');
      expect(response.state).toBeDefined();
    });
  });
  
  describe('advance-workflow', () => {
    it('responds to checkpoint successfully', async () => {
      // Start workflow
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'test-workflow' });
      const startResponse = JSON.parse(startResult.content[0].text);
      
      // Respond to checkpoint
      const actionHandler = tools.get('advance-workflow')!.handler;
      const result = await actionHandler({
        state: startResponse.state,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'checkpoint-1',
        option_id: 'yes',
      });
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('checkpoint');
      // After responding, should no longer have checkpoint blocking
      expect(response.checkpoint).toBeUndefined();
    });
    
    it('completes step after checkpoint responded', async () => {
      // Start workflow
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'test-workflow' });
      let currentState = JSON.parse(startResult.content[0].text).state;
      
      // Respond to checkpoint
      const actionHandler = tools.get('advance-workflow')!.handler;
      const checkpointResult = await actionHandler({
        state: currentState,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'checkpoint-1',
        option_id: 'yes',
      });
      currentState = JSON.parse(checkpointResult.content[0].text).state;
      
      // Complete step
      const stepResult = await actionHandler({
        state: currentState,
        action: 'complete_step',
        step_id: 'step-1',
      });
      
      const response = JSON.parse(stepResult.content[0].text);
      
      expect(response.success).toBe(true);
      expect(response.message).toContain("Completed step 'step-1'");
    });
    
    it('fails to complete step when checkpoint blocking', async () => {
      // Start workflow
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'test-workflow' });
      const currentState = JSON.parse(startResult.content[0].text).state;
      
      // Try to complete step without responding to checkpoint
      const actionHandler = tools.get('advance-workflow')!.handler;
      const result = await actionHandler({
        state: currentState,
        action: 'complete_step',
        step_id: 'step-1',
      });
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('CHECKPOINT_BLOCKING');
    });
    
    it('validates required parameters for actions', async () => {
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'test-workflow' });
      const currentState = JSON.parse(startResult.content[0].text).state;
      
      const actionHandler = tools.get('advance-workflow')!.handler;
      
      // Missing step_id for complete_step
      await expect(actionHandler({
        state: currentState,
        action: 'complete_step',
      })).rejects.toThrow('step_id is required');
      
      // Missing checkpoint_id for respond_to_checkpoint
      await expect(actionHandler({
        state: currentState,
        action: 'respond_to_checkpoint',
        option_id: 'yes',
      })).rejects.toThrow('checkpoint_id and option_id are required');
    });
  });
  
  describe('state token opacity', () => {
    it('state token changes between actions', async () => {
      // Start workflow
      const startHandler = tools.get('start-workflow')!.handler;
      const startResult = await startHandler({ workflow_id: 'test-workflow' });
      const state1 = JSON.parse(startResult.content[0].text).state;
      
      // Respond to checkpoint
      const actionHandler = tools.get('advance-workflow')!.handler;
      const result = await actionHandler({
        state: state1,
        action: 'respond_to_checkpoint',
        checkpoint_id: 'checkpoint-1',
        option_id: 'yes',
      });
      const state2 = JSON.parse(result.content[0].text).state;
      
      // Tokens should be different
      expect(state1).not.toBe(state2);
      // But both should be valid format
      expect(state1).toMatch(/^v1\.gzB64\./);
      expect(state2).toMatch(/^v1\.gzB64\./);
    });
  });
});
