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
      arguments: { workflow_version: '3.4.0' },
    });
    const sessionResponse = JSON.parse((sessionResult.content[0] as { type: 'text'; text: string }).text);
    sessionToken = sessionResponse.session.token;
  });

  afterAll(async () => {
    await closeTransport();
  });

  // ============== Session & Bootstrap Tools ==============

  describe('tool: start_session', () => {
    it('should return rules and session with token', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_version: '3.4.0' },
      });

      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);

      expect(response.rules).toBeDefined();
      expect(response.rules.id).toBe('agent-rules');
      expect(response.rules.sections).toBeDefined();
      expect(response.session).toBeDefined();
      expect(response.session.token).toBeDefined();
      expect(response.session.created_at).toBeDefined();
      expect(response.session.server_version).toBe('1.0.0');
    });

    it('should return token matching structured format', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_version: '3.4.0' },
      });

      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(response.session.token).toMatch(/^[\d.]+_\d+_[0-9a-f]{8}$/);
      expect(response.session.token).toMatch(/^3\.4\.0_/);
    });

    it('should work without session_token (exempt)', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_version: '1.0.0' },
      });
      expect(result.isError).toBeFalsy();
    });
  });

  describe('tool: match_goal', () => {
    it('should return activity index', async () => {
      const result = await client.callTool({ name: 'match_goal', arguments: {} });
      
      const index = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(index.description).toBeDefined();
      expect(index.activities).toBeDefined();
      expect(index.activities.length).toBeGreaterThanOrEqual(3);
      expect(index.quick_match).toBeDefined();
    });

    it('should reference start_session in next_action', async () => {
      const result = await client.callTool({ name: 'match_goal', arguments: {} });

      const index = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);

      expect(index.next_action).toBeDefined();
      expect(index.next_action.tool).toBe('start_session');
    });

    it('should work without session_token (exempt)', async () => {
      const result = await client.callTool({ name: 'match_goal', arguments: {} });
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
  });

  // ============== Session Token Enforcement ==============

  describe('session_token enforcement', () => {
    it('should reject tool call without session_token', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { activity_id: 'start-workflow' },
      });
      expect(result.isError).toBe(true);
    });

    it('should reject tool call with malformed session_token', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: 'invalid-token', activity_id: 'start-workflow' },
      });
      expect(result.isError).toBe(true);
    });

    it('should accept tool call with valid session_token', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-workflow' },
      });
      expect(result.isError).toBeFalsy();
    });

    it('should not require session_token for health_check', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      expect(result.isError).toBeFalsy();
    });
  });

  // ============== Workflow Tools (with session_token) ==============

  describe('tool: list_workflows', () => {
    it('should list available workflows', async () => {
      const result = await client.callTool({ name: 'list_workflows', arguments: { session_token: sessionToken } });
      
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
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      
      expect(result.content).toBeDefined();
      const workflow = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toBe('3.4.0');
      expect(workflow.activities).toHaveLength(14);
      expect(workflow.initialActivity).toBe('start-work-package');
    });

    it('should return error for non-existent workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'non-existent' },
      });
      
      expect(result.isError).toBe(true);
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('not found');
    });
  });

  describe('tool: get_workflow_activity', () => {
    it('should get specific activity from workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      
      expect(activity.id).toBe('start-work-package');
      expect(activity.name).toBe('Start Work Package');
      expect(activity.checkpoints).toBeDefined();
      expect(activity.checkpoints.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'get_workflow_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'non-existent' },
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
          session_token: sessionToken,
          workflow_id: 'work-package',
          activity_id: 'start-work-package',
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
          session_token: sessionToken,
          workflow_id: 'work-package',
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
          workflow_id: 'work-package',
          from_activity: 'start-work-package',
          to_activity: 'complete',
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

  // ============== Resource Tools (with session_token) ==============

  describe('tool: get_activity', () => {
    it('should return specific activity', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-workflow' },
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
        arguments: { session_token: sessionToken, skill_id: 'workflow-execution' },
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
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
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
        arguments: { session_token: sessionToken, workflow_id: 'work-package', index: '01' },
      });
      
      const content = (result.content[0] as { type: 'text'; text: string }).text;
      
      expect(content).toBeDefined();
      expect(content).toContain('id:');
      expect(content.includes('title:') || content.includes('# ')).toBe(true);
    });
  });

  // ============== Discovery Tool ==============

  describe('tool: discover_resources', () => {
    it('should reference match_goal in discovery output', async () => {
      const result = await client.callTool({
        name: 'discover_resources',
        arguments: { session_token: sessionToken },
      });

      const discovery = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);

      expect(discovery.activities).toBeDefined();
      expect(discovery.activities.tool).toBe('match_goal');
    });
  });
});
