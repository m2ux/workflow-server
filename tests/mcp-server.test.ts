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

  describe('tool: get_activity', () => {
    it('should get activity with explicit params', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const activity = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(activity.id).toBe('start-work-package');
      expect(activity.name).toBe('Start Work Package');
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'get_activity',
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
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(skill.id).toBe('create-issue');
    });
  });

  describe('resources attached to skills', () => {
    it('get_skill should include referenced resources in _resources', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const skill = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      if (skill.resources && skill.resources.length > 0) {
        expect(skill._resources).toBeDefined();
        expect(Object.keys(skill._resources).length).toBeGreaterThan(0);
      }
    });
  });

  describe('tool: discover_resources', () => {
    it('should return bootstrap info in discovery', async () => {
      const result = await client.callTool({
        name: 'discover_resources',
        arguments: { session_token: sessionToken },
      });
      const discovery = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      expect(discovery.bootstrap).toBeDefined();
      expect(discovery.bootstrap.tool).toBe('list_workflows');
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterStart = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterStart = actMeta['session_token'] as string;

      const actContent = JSON.parse((actResult.content[0] as { type: 'text'; text: string }).text);
      const manifest = actContent.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'completed' }));

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtComprehension = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtComprehension = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtStart = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAtComprehension = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: tokenAfterAct, workflow_id: 'work-package', activity_id: 'design-philosophy' },
      });
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('No step_manifest'))).toBe(true);
    });

    it('should warn on missing steps in manifest', async () => {
      const actResult = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const actContent = JSON.parse((actResult.content[0] as { type: 'text'; text: string }).text);
      const reversedManifest = actContent.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'done' })).reverse();

      const result = await client.callTool({
        name: 'get_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenAfterAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'get_activity',
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

  // ============== Next Activity ==============

  describe('tool: next_activity', () => {
    it('should return transition list for current activity', async () => {
      const actResult = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
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
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenWithAct, workflow_id: 'work-package' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const conditional = response.transitions.find((t: { condition?: string }) => t.condition);
      expect(conditional).toBeDefined();
      expect(typeof conditional.condition).toBe('string');
    });

    it('should mark default transitions', async () => {
      const actResult = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenWithAct, workflow_id: 'work-package' },
      });
      const response = JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
      const defaultTransition = response.transitions.find((t: { isDefault?: boolean }) => t.isDefault);
      expect(defaultTransition).toBeDefined();
    });

    it('should error when no activity in token', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBe(true);
    });

    it('should return updated token in _meta', async () => {
      const actResult = await client.callTool({
        name: 'get_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'next_activity',
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
});
