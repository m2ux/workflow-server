import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve } from 'node:path';

describe('mcp-server integration', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let sessionToken: string;

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

    const sessionResult = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package' },
    });
    const sessionResponse = JSON.parse((sessionResult.content[0] as { type: 'text'; text: string }).text);
    sessionToken = sessionResponse.session_token;
  });

  afterAll(async () => {
    await closeTransport();
  });

  // ============== Bootstrap Flow ==============

  describe('tool: help', () => {
    it('should return bootstrap procedure and session protocol', async () => {
      const result = await client.callTool({ name: 'help', arguments: {} });
      expect(result.isError).toBeFalsy();

      const guide = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);

      expect(guide.bootstrap).toBeDefined();
      expect(guide.bootstrap.step_1.tool).toBe('list_workflows');
      expect(guide.bootstrap.step_2.tool).toBe('start_session');
      expect(guide.session_protocol).toBeDefined();
      expect(guide.session_protocol.exempt_tools).toContain('help');
      expect(guide.available_workflows).toBeDefined();
      expect(guide.available_workflows.length).toBeGreaterThanOrEqual(2);
    });

    it('should not require session_token', async () => {
      const result = await client.callTool({ name: 'help', arguments: {} });
      expect(result.isError).toBeFalsy();
    });
  });

  describe('bootstrap flow: list_workflows -> start_session', () => {
    it('list_workflows should not require session_token', async () => {
      const result = await client.callTool({ name: 'list_workflows', arguments: {} });
      expect(result.isError).toBeFalsy();

      const workflows = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThanOrEqual(2);

      const ids = workflows.map((w: { id: string }) => w.id);
      expect(ids).toContain('work-package');
      expect(ids).toContain('meta');
    });

    it('start_session should return rules, workflow metadata, and opaque token', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();

      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);

      expect(response.rules).toBeDefined();
      expect(response.rules.id).toBe('agent-rules');
      expect(response.rules.sections).toBeDefined();

      expect(response.workflow).toBeDefined();
      expect(response.workflow.id).toBe('work-package');
      expect(response.workflow.version).toBe('3.4.0');

      expect(response.session_token).toBeDefined();
      expect(typeof response.session_token).toBe('string');
      expect(response.session_token.length).toBeGreaterThan(10);
    });

    it('start_session should reject unknown workflow_id', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });

    it('start_session should not require session_token (exempt)', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta' },
      });
      expect(result.isError).toBeFalsy();
    });
  });

  // ============== Session Token Lifecycle ==============

  describe('session token lifecycle', () => {
    it('token should be opaque (not readable JSON)', async () => {
      expect(sessionToken).not.toContain('{');
      expect(sessionToken).not.toContain('workflow');
    });

    it('tools should return updated token in _meta', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown> | undefined;
      expect(meta).toBeDefined();
      expect(meta!['session_token']).toBeDefined();
      expect(typeof meta!['session_token']).toBe('string');
      expect(meta!['session_token']).not.toBe(sessionToken);
    });

    it('should reject tool call without session_token', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });

    it('should reject tool call with invalid session_token', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: 'not-a-valid-token' },
      });
      expect(result.isError).toBe(true);
    });

    it('health_check should not require session_token', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      expect(result.isError).toBeFalsy();
    });
  });

  // ============== Old Tool Names Removed ==============

  describe('old tool names removed', () => {
    it('should reject get_activities (removed)', async () => {
      const result = await client.callTool({ name: 'get_activities', arguments: {} });
      expect(result.isError).toBe(true);
    });

    it('should reject get_rules (removed)', async () => {
      const result = await client.callTool({ name: 'get_rules', arguments: {} });
      expect(result.isError).toBe(true);
    });

    it('should reject match_goal (removed)', async () => {
      const result = await client.callTool({ name: 'match_goal', arguments: { prompt: 'test' } });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Workflow Tools ==============

  describe('tool: get_workflow', () => {
    it('should get workflow using workflow_id from token', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken },
      });

      expect(result.content).toBeDefined();
      const workflow = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);

      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toBe('3.4.0');
      expect(workflow.activities).toHaveLength(14);
    });
  });

  describe('tool: get_activity', () => {
    it('should get activity and update token act field', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });

      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activity.id).toBe('start-work-package');
      expect(activity.name).toBe('Start Work Package');
      expect(activity.checkpoints).toBeDefined();
      expect(activity.checkpoints.length).toBeGreaterThan(0);

      const meta = result._meta as Record<string, unknown> | undefined;
      expect(meta).toBeDefined();
      expect(meta!['session_token']).toBeDefined();
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, activity_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('tool: get_checkpoint', () => {
    it('should get checkpoint using activity from token', async () => {
      const actResult = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const updatedToken = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_checkpoint',
        arguments: { session_token: updatedToken, checkpoint_id: 'issue-verification' },
      });

      const checkpoint = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(checkpoint.id).toBe('issue-verification');
      expect(checkpoint.options).toBeDefined();
      expect(checkpoint.options.length).toBeGreaterThan(0);
    });
  });

  describe('tool: validate_transition', () => {
    it('should validate allowed transition', async () => {
      const result = await client.callTool({
        name: 'validate_transition',
        arguments: {
          session_token: sessionToken,
          from_activity: 'start-work-package',
          to_activity: 'design-philosophy',
        },
      });

      const validation = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(validation.valid).toBe(true);
    });

    it('should reject invalid transition', async () => {
      const result = await client.callTool({
        name: 'validate_transition',
        arguments: {
          session_token: sessionToken,
          from_activity: 'start-work-package',
          to_activity: 'complete',
        },
      });

      const validation = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(validation.valid).toBe(false);
    });
  });

  describe('tool: health_check', () => {
    it('should return healthy status', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });

      const health = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(health.status).toBe('healthy');
      expect(health.server).toBe('test-workflow-server');
      expect(health.workflows_available).toBeGreaterThanOrEqual(2);
    });
  });

  // ============== Resource Tools ==============

  describe('tool: get_skill', () => {
    it('should get skill using workflow from token', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, skill_id: 'workflow-execution' },
      });

      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(skill.id).toBe('workflow-execution');
      expect(skill.capability).toBeDefined();
    });
  });

  describe('tool: list_workflow_resources', () => {
    it('should list resources using workflow from token', async () => {
      const result = await client.callTool({
        name: 'list_workflow_resources',
        arguments: { session_token: sessionToken },
      });

      const resources = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0]).toHaveProperty('index');
    });
  });

  describe('tool: get_resource', () => {
    it('should get resource using workflow from token', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_token: sessionToken, index: '01' },
      });

      const content = (result.content[0] as { type: 'text'; text: string }).text;
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  // ============== Discovery Tool ==============

  describe('tool: discover_resources', () => {
    it('should reference list_workflows bootstrap in discovery', async () => {
      const result = await client.callTool({
        name: 'discover_resources',
        arguments: { session_token: sessionToken },
      });

      const discovery = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(discovery.bootstrap).toBeDefined();
      expect(discovery.bootstrap.tool).toBe('list_workflows');
    });
  });
});
