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

  // ============== Bootstrap Tools ==============

  describe('tool: help', () => {
    it('should return bootstrap procedure and session protocol', async () => {
      const result = await client.callTool({ name: 'help', arguments: {} });
      expect(result.isError).toBeFalsy();
      const guide = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(guide.bootstrap).toBeDefined();
      expect(guide.bootstrap.step_1.tool).toBe('list_workflows');
      expect(guide.bootstrap.step_2.tool).toBe('start_session');
      expect(guide.session_protocol).toBeDefined();
      expect(guide.session_protocol.validation).toBeDefined();
      expect(guide.available_workflows.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('tool: list_workflows', () => {
    it('should not require session_token', async () => {
      const result = await client.callTool({ name: 'list_workflows', arguments: {} });
      expect(result.isError).toBeFalsy();
      const workflows = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(workflows)).toBe(true);
      const ids = workflows.map((w: { id: string }) => w.id);
      expect(ids).toContain('work-package');
      expect(ids).toContain('meta');
    });
  });

  describe('tool: start_session', () => {
    it('should return rules, workflow metadata, and opaque token', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(response.rules).toBeDefined();
      expect(response.rules.id).toBe('agent-rules');
      expect(response.workflow.id).toBe('work-package');
      expect(response.session_token).toBeDefined();
      expect(typeof response.session_token).toBe('string');
    });

    it('should reject unknown workflow_id', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Session Token Lifecycle ==============

  describe('session token lifecycle', () => {
    it('token should be opaque', async () => {
      expect(sessionToken).not.toContain('{');
      expect(sessionToken).not.toContain('workflow');
    });

    it('tools should return updated token and validation in _meta', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown> | undefined;
      expect(meta).toBeDefined();
      expect(meta!['session_token']).toBeDefined();
      expect(meta!['session_token']).not.toBe(sessionToken);
      expect(meta!['validation']).toBeDefined();
      const validation = meta!['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('valid');
      expect(validation.warnings).toHaveLength(0);
    });

    it('should reject tool call without session_token', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { workflow_id: 'work-package' },
      });
      expect(result.isError).toBe(true);
    });

    it('should reject tool call with invalid session_token', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: 'not-valid', workflow_id: 'work-package' },
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
    it('should reject get_activities', async () => {
      const result = await client.callTool({ name: 'get_activities', arguments: {} });
      expect(result.isError).toBe(true);
    });

    it('should reject get_rules', async () => {
      const result = await client.callTool({ name: 'get_rules', arguments: {} });
      expect(result.isError).toBe(true);
    });

    it('should reject match_goal', async () => {
      const result = await client.callTool({ name: 'match_goal', arguments: { prompt: 'test' } });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Workflow Tools ==============

  describe('tool: get_workflow', () => {
    it('should get workflow with explicit workflow_id', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      expect(result.content).toBeDefined();
      const workflow = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toBe('3.4.0');
    });

    it('should return error for non-existent workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('tool: next_activity', () => {
    it('should get activity with explicit params', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activity.id).toBe('start-work-package');
      expect(activity.name).toBe('Start Work Package');
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('tool: get_checkpoint', () => {
    it('should get checkpoint with explicit params', async () => {
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
      expect(checkpoint.options.length).toBeGreaterThan(0);
    });
  });


  describe('tool: health_check', () => {
    it('should return healthy status', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      const health = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(health.status).toBe('healthy');
      expect(health.workflows_available).toBeGreaterThanOrEqual(2);
    });
  });

  // ============== Resource Tools ==============

  describe('tool: get_skill', () => {
    it('should get skill with explicit workflow_id', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(response.skill).toBeDefined();
      expect(response.skill.id).toBe('create-issue');
      expect(response.resources).toBeDefined();
      expect(Array.isArray(response.resources)).toBe(true);
    });
  });

  describe('structured resources in skill responses', () => {
    it('get_skill should return structured resources with index/id/version/content', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(response.resources.length).toBeGreaterThan(0);
      const resource = response.resources[0];
      expect(resource.index).toBeDefined();
      expect(resource.id).toBeDefined();
      expect(resource.version).toBeDefined();
      expect(resource.content).toBeDefined();
      expect(resource.content.length).toBeGreaterThan(0);
    });

    it('get_skills should return structured resources array', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(Array.isArray(response.resources)).toBe(true);
      if (response.resources.length > 0) {
        expect(response.resources[0].index).toBeDefined();
        expect(response.resources[0].id).toBeDefined();
        expect(response.resources[0].content).toBeDefined();
      }
    });

    it('resource content should not contain frontmatter', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      for (const resource of response.resources) {
        expect(resource.content).not.toMatch(/^---/);
      }
    });
  });

  // ============== Batch Skill Loading ==============

  describe('tool: get_skills', () => {
    it('should return all skills for an activity in one call', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      expect(result.isError).toBeFalsy();

      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(response.activity_id).toBe('start-work-package');
      expect(response.skills).toBeDefined();
      expect(response.skills['create-issue']).toBeDefined();
    });

    it('should include primary and supporting skills', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const skillIds = Object.keys(response.skills);
      expect(skillIds.length).toBeGreaterThanOrEqual(1);
    });

    it('should return updated token in _meta', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
    });

    it('should error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Validation ==============

  describe('token validation', () => {
    it('should warn on workflow mismatch', async () => {
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta' },
      });
      const metaResponse = JSON.parse((metaSession.content[0] as { type: 'text'; text: string }).text);
      const metaToken = metaResponse.session_token;

      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: metaToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('Workflow mismatch');
    });

    it('should warn on invalid activity transition', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterStart = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenAfterStart, workflow_id: 'work-package', activity_id: 'complete' },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('not a direct transition'))).toBe(true);
    });

    it('should not warn on valid activity transition with manifest', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterStart = actMeta['session_token'] as string;

      const actContent = JSON.parse((actResult.content[0] as { type: 'text'; text: string }).text);
      const manifest = actContent.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'completed' }));

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenAfterStart, workflow_id: 'work-package', activity_id: 'design-philosophy', step_manifest: manifest },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('valid');
    });

    it('warnings should not block execution', async () => {
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta' },
      });
      const metaResponse = JSON.parse((metaSession.content[0] as { type: 'text'; text: string }).text);
      const metaToken = metaResponse.session_token;

      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: metaToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const workflow = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(workflow.id).toBe('work-package');
    });
  });

  // ============== Transition Condition Tracking ==============

  describe('transition condition validation', () => {
    it('should accept correct condition-activity pairing', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtComprehension = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtComprehension,
          workflow_id: 'work-package',
          activity_id: 'requirements-elicitation',
          transition_condition: 'needs_elicitation == true',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      const condWarnings = validation.warnings.filter((w: string) => w.includes('Condition mismatch') || w.includes('condition'));
      expect(condWarnings).toHaveLength(0);
    });

    it('should warn on mismatched condition for activity', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtComprehension = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtComprehension,
          workflow_id: 'work-package',
          activity_id: 'requirements-elicitation',
          transition_condition: 'skip_optional_activities == true',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('Condition mismatch'))).toBe(true);
    });

    it('should accept default transition with empty condition', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtStart = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtStart,
          workflow_id: 'work-package',
          activity_id: 'design-philosophy',
          transition_condition: 'default',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      const condWarnings = validation.warnings.filter((w: string) => w.includes('condition') || w.includes('Condition'));
      expect(condWarnings).toHaveLength(0);
    });

    it('condition should not block execution', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtComprehension = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtComprehension,
          workflow_id: 'work-package',
          activity_id: 'requirements-elicitation',
          transition_condition: 'wrong_condition == true',
        },
      });
      expect(result.isError).toBeFalsy();
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activity.id).toBe('requirements-elicitation');
    });
  });

  // ============== Step Manifest ==============

  describe('step completion manifest', () => {
    it('should warn when no manifest provided for previous activity', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenAfterAct, workflow_id: 'work-package', activity_id: 'design-philosophy' },
      });
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('No step_manifest'))).toBe(true);
    });

    it('should warn on missing steps in manifest', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAfterAct,
          workflow_id: 'work-package',
          activity_id: 'design-philosophy',
          step_manifest: [{ step_id: 'resolve-target', output: 'done' }],
        },
      });
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('Missing steps'))).toBe(true);
    });

    it('should warn on wrong step order in manifest', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const actContent = JSON.parse((actResult.content[0] as { type: 'text'; text: string }).text);
      const reversedManifest = actContent.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'done' })).reverse();

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAfterAct,
          workflow_id: 'work-package',
          activity_id: 'design-philosophy',
          step_manifest: reversedManifest,
        },
      });
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('order mismatch'))).toBe(true);
    });

    it('manifest validation should not block execution', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAfterAct,
          workflow_id: 'work-package',
          activity_id: 'design-philosophy',
          step_manifest: [{ step_id: 'fake-step', output: 'done' }],
        },
      });
      expect(result.isError).toBeFalsy();
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activity.id).toBe('design-philosophy');
    });
  });

  // ============== Get Activities ==============

  describe('tool: get_activities', () => {
    it('should return transition list for current activity', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activities',
        arguments: { session_token: tokenWithAct, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();

      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(response.current_activity).toBe('start-work-package');
      expect(response.transitions).toBeDefined();
      expect(Array.isArray(response.transitions)).toBe(true);
      expect(response.transitions.length).toBeGreaterThan(0);
      expect(response.transitions[0].to).toBeDefined();
    });

    it('should include conditions as readable strings', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activities',
        arguments: { session_token: tokenWithAct, workflow_id: 'work-package' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const conditional = response.transitions.find((t: { condition?: string }) => t.condition);
      expect(conditional).toBeDefined();
      expect(typeof conditional.condition).toBe('string');
    });

    it('should mark default transitions', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activities',
        arguments: { session_token: tokenWithAct, workflow_id: 'work-package' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const defaultTransition = response.transitions.find((t: { isDefault?: boolean }) => t.isDefault);
      expect(defaultTransition).toBeDefined();
    });

    it('should error when no activity in token', async () => {
      const result = await client.callTool({
        name: 'get_activities',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBe(true);
    });

    it('should return updated token in _meta', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activities',
        arguments: { session_token: tokenWithAct, workflow_id: 'work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
      expect(meta['session_token']).not.toBe(tokenWithAct);
    });
  });

  // ============== Workflow Summary Mode ==============

  describe('tool: get_workflow (summary mode)', () => {
    it('should return lightweight summary by default', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', summary: true },
      });
      expect(result.isError).toBeFalsy();

      const wf = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(wf.id).toBe('work-package');
      expect(wf.version).toBe('3.4.0');
      expect(wf.rules).toBeDefined();
      expect(wf.variables).toBeDefined();
      expect(wf.activities).toBeDefined();
      expect(wf.activities[0].id).toBeDefined();
      expect(wf.activities[0].steps).toBeUndefined();
      expect(wf.activities[0].checkpoints).toBeUndefined();
    });

    it('summary should be smaller than full definition', async () => {
      const fullResult = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', summary: false },
      });
      const summaryResult = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', summary: true },
      });

      const fullSize = (fullResult.content[0] as { type: 'text'; text: string }).text.length;
      const summarySize = (summaryResult.content[0] as { type: 'text'; text: string }).text.length;
      expect(summarySize).toBeLessThan(fullSize / 2);
    });

    it('should return full definition when summary=false', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', summary: false },
      });
      const wf = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(wf.activities[0].steps).toBeDefined();
    });
  });

  // ============== Trace Integration ==============

  describe('trace lifecycle', () => {
    let traceSessionToken: string;

    beforeAll(async () => {
      const sessionResult = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      const sessionResponse = JSON.parse((sessionResult.content[0] as { type: 'text'; text: string }).text);
      traceSessionToken = sessionResponse.session_token;
    });

    it('start_session initializes trace (IT-6)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken },
      });
      const trace = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(trace.source).toBe('memory');
      expect(trace.events.length).toBeGreaterThanOrEqual(1);
      expect(trace.events[0].name).toBe('start_session');
    });

    it('next_activity returns _meta.trace_token (IT-7)', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: traceSessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      expect(meta['trace_token']).toBeDefined();
      expect(typeof meta['trace_token']).toBe('string');
      expect((meta['trace_token'] as string).length).toBeGreaterThan(10);
    });

    it('get_trace without tokens returns in-memory trace (IT-13)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      const trace = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(trace.source).toBe('memory');
      expect(trace.events.length).toBeGreaterThan(0);
    });

    it('trace events have compressed field names (IT-10)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      const trace = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const event = trace.events[0];
      expect(event.ts).toBeDefined();
      expect(event.ms).toBeDefined();
      expect(event.s).toBeDefined();
      expect(event.wf).toBeDefined();
      expect(event.traceId).toBeDefined();
    });

    it('session_token not in trace events (IT-15)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      const traceText = (result.content[0] as { type: 'text'; text: string }).text;
      expect(traceText).not.toContain('session_token');
    });

    it('get_trace excludes itself from trace (IT-14)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      const trace = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const traceNames = trace.events.map((e: { name: string }) => e.name);
      expect(traceNames).not.toContain('get_trace');
    });

    it('error events are captured (IT-12)', async () => {
      try {
        await client.callTool({
          name: 'next_activity',
          arguments: { session_token: traceSessionToken, workflow_id: 'work-package', activity_id: 'nonexistent-activity' },
        });
      } catch { /* expected */ }

      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      const trace = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const errorEvents = trace.events.filter((e: { s: string }) => e.s === 'error');
      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].err).toBeDefined();
    });

    it('accumulated trace tokens resolve via get_trace (IT-8)', async () => {
      const session2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      let tok = JSON.parse((session2.content[0] as { type: 'text'; text: string }).text).session_token as string;

      await client.callTool({
        name: 'get_skills',
        arguments: { session_token: tok, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });

      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tok, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const meta1 = act1._meta as Record<string, unknown>;
      tok = meta1['session_token'] as string;
      const traceToken1 = meta1['trace_token'] as string;
      expect(traceToken1).toBeDefined();

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tok, workflow_id: 'work-package', activity_id: 'design-philosophy' },
      });
      const meta2 = act2._meta as Record<string, unknown>;
      tok = meta2['session_token'] as string;
      const traceToken2 = meta2['trace_token'] as string;
      expect(traceToken2).toBeDefined();

      const resolved = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: tok, trace_tokens: [traceToken1, traceToken2] },
      });
      const trace = JSON.parse((resolved.content[0] as { type: 'text'; text: string }).text);
      expect(trace.source).toBe('tokens');
      expect(trace.event_count).toBeGreaterThanOrEqual(2);
    });

    it('invalid trace token handled gracefully (IT-19)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: traceSessionToken, trace_tokens: ['invalid.token.here'] },
      });
      const meta = result._meta as Record<string, unknown>;
      traceSessionToken = meta['session_token'] as string;
      const trace = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(trace.token_errors).toBeDefined();
      expect(trace.token_errors.length).toBeGreaterThan(0);
    });

    it('activity_manifest accepted without error (IT-3)', async () => {
      const session3 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      const tok3 = JSON.parse((session3.content[0] as { type: 'text'; text: string }).text).session_token as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tok3,
          workflow_id: 'work-package',
          activity_id: 'start-work-package',
          activity_manifest: [
            { activity_id: 'start-work-package', outcome: 'completed' },
          ],
        },
      });
      expect(result.isError).toBeFalsy();
    });
  });
});
