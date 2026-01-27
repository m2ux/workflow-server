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
      workflowDir: resolve(import.meta.dirname, '../workflows'),
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
      expect(ids).toContain('meta');
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
      expect(workflow.version).toBe('2.1.0');
      expect(workflow.activities).toHaveLength(11);
      expect(workflow.initialActivity).toBe('issue-verification');
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

  describe('tool: get_workflow_activity', () => {
    it('should get specific activity from workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow_activity',
        arguments: { workflow_id: 'work-package', activity_id: 'issue-verification' },
      });
      
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(activity.id).toBe('issue-verification');
      expect(activity.name).toBe('Issue Verification & PR Creation');
      expect(activity.checkpoints).toBeDefined();
      expect(activity.checkpoints.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'get_workflow_activity',
        arguments: { workflow_id: 'work-package', activity_id: 'non-existent' },
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
          activity_id: 'issue-verification',
          checkpoint_id: 'issue-verification',
        },
      });
      
      const checkpoint = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(checkpoint.id).toBe('issue-verification');
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
          from_activity: 'issue-verification',
          to_activity: 'requirements-elicitation',
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
          from_activity: 'issue-verification',
          to_activity: 'post-implementation',
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

  describe('tool: get_activities', () => {
    it('should return activity index', async () => {
      const result = await client.callTool({ name: 'get_activities', arguments: {} });
      
      const index = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(index.description).toBeDefined();
      expect(index.activities).toBeDefined();
      expect(index.activities.length).toBeGreaterThanOrEqual(3);
      expect(index.quick_match).toBeDefined();
    });
  });

  describe('tool: get_activity', () => {
    it('should return specific activity', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { activity_id: 'start-workflow' },
      });
      
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(activity.id).toBe('start-workflow');
      expect(activity.skills).toBeDefined();
      expect(activity.skills.primary).toBe('workflow-execution');
    });
  });

  describe('tool: get_skill', () => {
    it('should return specific skill', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { skill_id: 'workflow-execution' },
      });
      
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(skill.id).toBe('workflow-execution');
      expect(skill.capability).toBeDefined();
      expect(skill.tools).toBeDefined();
    });
  });

  describe('tool: list_workflow_resources', () => {
    it('should list resources for a workflow', async () => {
      const result = await client.callTool({
        name: 'list_workflow_resources',
        arguments: { workflow_id: 'work-package' },
      });
      
      const resources = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0]).toHaveProperty('index');
      expect(resources[0]).toHaveProperty('name');
    });
  });

  describe('tool: get_resource', () => {
    it('should get specific resource', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { workflow_id: 'work-package', index: '00' },
      });
      
      // get_resource returns raw TOON content, not JSON
      const content = (result.content[0] as { type: 'text'; text: string }).text;
      
      expect(content).toBeDefined();
      expect(content).toContain('id:');
      expect(content).toContain('title:');
    });
  });
});
