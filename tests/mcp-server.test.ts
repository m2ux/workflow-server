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

  describe('resource: guides', () => {
    it('should list available resources', async () => {
      const resources = await client.listResources();
      
      expect(resources.resources).toBeDefined();
      // Server registers two resource templates
      expect(resources.resources.length).toBeGreaterThanOrEqual(0);
    });

    it('should read guides list resource', async () => {
      const result = await client.readResource({ uri: 'workflow://guides' });
      
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBeGreaterThan(0);
      
      const content = result.contents[0];
      expect(content.uri).toBe('workflow://guides');
      
      const guides = JSON.parse((content as { text: string }).text);
      expect(Array.isArray(guides)).toBe(true);
    });

    it('should read specific guide content', async () => {
      const result = await client.readResource({ uri: 'workflow://guides/project-setup.guide.md' });
      
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBeGreaterThan(0);
      
      const content = result.contents[0];
      expect(content.uri).toBe('workflow://guides/project-setup.guide.md');
      expect((content as { text: string }).text).toContain('Project Setup');
    });
  });
});
