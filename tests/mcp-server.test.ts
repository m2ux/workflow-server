import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve } from 'node:path';

describe('mcp-server integration', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;

  beforeAll(async () => {
    const config = {
      workflowDir: resolve(import.meta.dirname, '../workflow-data/workflows'),
      guideDir: resolve(import.meta.dirname, '../workflow-data/guides'),
      serverName: 'test-workflow-server',
      serverVersion: '1.0.0',
    };

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    
    client = new Client({ name: 'test-client', version: '1.0.0' }, {});
    await client.connect(clientTransport);

    closeTransport = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await closeTransport();
  });

  describe('tool: list_workflows', () => {
    it('should list available workflows', async () => {
      const result = await client.callTool({ name: 'list_workflows', arguments: {} });
      
      expect(result.content).toBeDefined();
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const workflows = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThanOrEqual(2);
      
      const ids = workflows.map((w: { id: string }) => w.id);
      expect(ids).toContain('work-package');
      expect(ids).toContain('example-workflow');
    });
  });

  describe('tool: get_workflow', () => {
    it('should get work-package workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const workflow = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toBe('1.0.0');
      expect(workflow.phases).toHaveLength(11);
      expect(workflow.initialPhase).toBe('phase-1-issue-verification');
    });

    it('should return error for non-existent workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { workflow_id: 'non-existent' },
      });
      
      expect(result.isError).toBe(true);
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('not found');
    });
  });

  describe('tool: get_phase', () => {
    it('should get specific phase', async () => {
      const result = await client.callTool({
        name: 'get_phase',
        arguments: { workflow_id: 'work-package', phase_id: 'phase-1-issue-verification' },
      });
      
      const phase = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(phase.id).toBe('phase-1-issue-verification');
      expect(phase.name).toBe('Issue Verification & PR Creation');
      expect(phase.checkpoints).toBeDefined();
      expect(phase.checkpoints.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent phase', async () => {
      const result = await client.callTool({
        name: 'get_phase',
        arguments: { workflow_id: 'work-package', phase_id: 'non-existent' },
      });
      
      expect(result.isError).toBe(true);
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('not found');
    });
  });

  describe('tool: get_checkpoint', () => {
    it('should get specific checkpoint', async () => {
      const result = await client.callTool({
        name: 'get_checkpoint',
        arguments: {
          workflow_id: 'work-package',
          phase_id: 'phase-1-issue-verification',
          checkpoint_id: 'checkpoint-1-2-issue-verification',
        },
      });
      
      const checkpoint = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(checkpoint.id).toBe('checkpoint-1-2-issue-verification');
      expect(checkpoint.name).toBe('Issue Verification Checkpoint');
      expect(checkpoint.options).toBeDefined();
      expect(checkpoint.options.length).toBeGreaterThan(0);
    });
  });

  describe('tool: validate_transition', () => {
    it('should validate allowed transition', async () => {
      const result = await client.callTool({
        name: 'validate_transition',
        arguments: {
          workflow_id: 'work-package',
          from_phase: 'phase-1-issue-verification',
          to_phase: 'phase-2-requirements-elicitation',
        },
      });
      
      const validation = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(validation.valid).toBe(true);
    });

    it('should reject invalid transition', async () => {
      const result = await client.callTool({
        name: 'validate_transition',
        arguments: {
          workflow_id: 'work-package',
          from_phase: 'phase-1-issue-verification',
          to_phase: 'phase-11-post-implementation',
        },
      });
      
      const validation = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('No valid transition');
    });
  });

  describe('tool: health_check', () => {
    it('should return healthy status', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      
      const health = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(health.status).toBe('healthy');
      expect(health.server).toBe('test-workflow-server');
      expect(health.workflows_available).toBeGreaterThanOrEqual(2);
      expect(health.uptime_seconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('tool: list_resources', () => {
    it('should list all available resources', async () => {
      const result = await client.callTool({ name: 'list_resources', arguments: {} });
      
      expect(result.content).toBeDefined();
      const resources = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(resources.intents).toBeDefined();
      expect(resources.universal_skills).toBeDefined();
      expect(resources.workflows).toBeDefined();
      expect(resources['work-package']).toBeDefined();
      expect(resources['work-package'].skills).toBeDefined(); // Workflow-specific skills
    });
  });

  describe('tool: get_intents', () => {
    it('should get intents index', async () => {
      const result = await client.callTool({ name: 'get_intents', arguments: {} });
      
      expect(result.content).toBeDefined();
      const intents = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(intents).toBeDefined();
      expect(intents.quick_match).toBeDefined();
    });
  });

  describe('tool: get_intent', () => {
    it('should get specific intent', async () => {
      const result = await client.callTool({
        name: 'get_intent',
        arguments: { intent_id: 'start-workflow' },
      });
      
      expect(result.content).toBeDefined();
      const intent = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(intent.id).toBe('start-workflow');
    });
  });

  describe('tool: list_skills', () => {
    it('should list skills', async () => {
      const result = await client.callTool({ name: 'list_skills', arguments: {} });
      
      expect(result.content).toBeDefined();
      const skills = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(skills)).toBe(true);
    });
  });

  describe('tool: get_skill', () => {
    it('should get workflow-specific skill with workflow_id', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { skill_id: 'workflow-execution', workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(skill.id).toBe('workflow-execution');
    });

    it('should get universal skill without workflow_id', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { skill_id: 'intent-resolution' },
      });
      
      expect(result.content).toBeDefined();
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(skill.id).toBe('intent-resolution');
    });
  });

  describe('tool: list_guides', () => {
    it('should list guides for a workflow', async () => {
      const result = await client.callTool({
        name: 'list_guides',
        arguments: { workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const guides = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(guides)).toBe(true);
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0].index).toBeDefined();
      expect(guides[0].name).toBeDefined();
    });
  });

  describe('tool: get_guide', () => {
    it('should get specific guide by index', async () => {
      const result = await client.callTool({
        name: 'get_guide',
        arguments: { workflow_id: 'work-package', index: '00' },
      });
      
      expect(result.content).toBeDefined();
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('start-here');
    });
  });

  describe('tool: list_templates', () => {
    it('should list templates for a workflow', async () => {
      const result = await client.callTool({
        name: 'list_templates',
        arguments: { workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const templates = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('tool: get_template', () => {
    it('should get specific template by index', async () => {
      const result = await client.callTool({
        name: 'get_template',
        arguments: { workflow_id: 'work-package', index: '01' },
      });
      
      expect(result.content).toBeDefined();
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('Implementation Analysis');
    });
  });
});
