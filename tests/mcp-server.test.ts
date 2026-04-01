import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseToolResponse(result: { content: unknown[] }): any {
  return JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
}

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

describe('mcp-server integration', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let sessionToken: string;

  beforeAll(async () => {
    const config = {
      workflowDir: resolve(import.meta.dirname, '../workflows'),
      schemasDir: resolve(import.meta.dirname, '../schemas'),
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

  beforeEach(async () => {
    const sessionResult = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package' },
    });
    sessionToken = parseToolResponse(sessionResult).session_token;
  });

  afterAll(async () => {
    await closeTransport();
  });

  // ============== Bootstrap Tools ==============

  describe('tool: discover', () => {
    it('should return bootstrap guide and available workflows', async () => {
      const result = await client.callTool({ name: 'discover', arguments: {} });
      expect(result.isError).toBeFalsy();
      const guide = parseToolResponse(result);
      expect(guide.server).toBeDefined();
      expect(guide.version).toBeDefined();
      expect(guide.discovery).toBeDefined();
      expect(typeof guide.discovery).toBe('string');
      expect(guide.discovery).toContain('start_session');
      expect(guide.discovery).toContain('get_skills');
      expect(guide.available_workflows.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('tool: list_workflows', () => {
    it('should not require session_token', async () => {
      const result = await client.callTool({ name: 'list_workflows', arguments: {} });
      expect(result.isError).toBeFalsy();
      const workflows = parseToolResponse(result);
      expect(Array.isArray(workflows)).toBe(true);
      const ids = workflows.map((w: { id: string }) => w.id);
      expect(ids).toContain('work-package');
      expect(ids).not.toContain('meta');
    });
  });

  describe('tool: start_session', () => {
    it('should return workflow metadata and opaque token (no rules payload)', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.rules).toBeUndefined();
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
      const meta = result._meta as Record<string, unknown>;
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
      expect(result.content.length).toBeGreaterThan(0);
      expect((result.content[0] as { type: string; text: string }).text).toBeTruthy();
    });

    it('should reject get_rules', async () => {
      const result = await client.callTool({ name: 'get_rules', arguments: {} });
      expect(result.isError).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      expect((result.content[0] as { type: string; text: string }).text).toBeTruthy();
    });

    it('should reject match_goal', async () => {
      const result = await client.callTool({ name: 'match_goal', arguments: { prompt: 'test' } });
      expect(result.isError).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      expect((result.content[0] as { type: string; text: string }).text).toBeTruthy();
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
      const workflow = parseToolResponse(result);
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toMatch(SEMVER_RE);
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
      const activity = parseToolResponse(result);
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
      const checkpoint = parseToolResponse(result);
      expect(checkpoint.id).toBe('issue-verification');
      expect(checkpoint.options.length).toBeGreaterThan(0);
    });
  });


  describe('tool: health_check', () => {
    it('should return healthy status', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      const health = parseToolResponse(result);
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
      const response = parseToolResponse(result);
      expect(response.skill).toBeDefined();
      expect(response.skill.id).toBe('create-issue');
      expect(response.skill._resources).toBeDefined();
      expect(Array.isArray(response.skill._resources)).toBe(true);
    });
  });

  describe('structured resources in skill responses', () => {
    it('get_skill should nest _resources under the skill with index/id/version/content', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill._resources.length).toBeGreaterThan(0);
      const resource = response.skill._resources[0];
      expect(resource.index).toBeDefined();
      expect(resource.id).toBeDefined();
      expect(resource.version).toBeDefined();
      expect(resource.content).toBeDefined();
      expect(resource.content.length).toBeGreaterThan(0);
    });

    it('get_skill should strip raw resources array from skill', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill.resources).toBeUndefined();
      expect(response.resources).toBeUndefined();
    });

    it('get_skills should nest _resources under each skill', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actToken = (actResult._meta as Record<string, unknown>)['session_token'] as string;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resources).toBeUndefined();
      const createIssue = response.skills['create-issue'];
      expect(createIssue).toBeDefined();
      expect(createIssue._resources.length).toBeGreaterThan(0);
      expect(createIssue._resources[0].index).toBeDefined();
      expect(createIssue._resources[0].content).toBeDefined();
      expect(createIssue.resources).toBeUndefined();
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
    });

    it('resource content should not contain frontmatter', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'create-issue' },
      });
      const response = parseToolResponse(result);
      for (const resource of response.skill._resources) {
        expect(resource.content).not.toMatch(/^---/);
      }
    });
  });

  // ============== Token-Driven Skill Loading ==============

  describe('tool: get_skills', () => {
    it('should return only declared workflow-level skills before any activity is entered', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      expect(response.activity_id).toBeNull();
      const skillIds = Object.keys(response.skills);
      expect(skillIds).toContain('orchestrate-workflow');
      expect(skillIds).toContain('execute-activity');
      expect(skillIds).toContain('session-protocol');
      expect(skillIds).toContain('state-management');
      expect(skillIds).not.toContain('create-issue');
      expect(skillIds).not.toContain('knowledge-base-search');
    });

    it('should return activity skills after next_activity sets token.act', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actToken = (actResult._meta as Record<string, unknown>)['session_token'] as string;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('activity');
      expect(response.activity_id).toBe('start-work-package');
      expect(response.skills['create-issue']).toBeDefined();
      expect(response.skills['orchestrate-workflow']).toBeUndefined();
    });

    it('should nest resources under workflow-level skills', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      const response = parseToolResponse(result);
      expect(response.resources).toBeUndefined();
      const skillsWithResources = Object.values(response.skills).filter(
        (s: unknown) => (s as Record<string, unknown>)._resources
      );
      expect(skillsWithResources.length).toBeGreaterThan(0);
    });

    it('should return updated token in _meta', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
    });

    it('should return empty skills for workflows without declared skills', async () => {
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta' },
      });
      const metaToken = parseToolResponse(metaSession).session_token;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: metaToken, workflow_id: 'meta' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      expect(Object.keys(response.skills).length).toBe(0);
    });
  });

  // ============== Agent-ID Meta-Skill Loading ==============

  describe('agent_id meta-skill loading', () => {
    it('new agent_id should include workflow-level skills alongside activity skills', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actToken = (actResult._meta as Record<string, unknown>)['session_token'] as string;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken, workflow_id: 'work-package', agent_id: 'worker-001' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('activity+meta');
      expect(response.skills['create-issue']).toBeDefined();
      expect(response.skills['session-protocol']).toBeDefined();
      expect(response.skills['agent-conduct']).toBeDefined();
      expect(response.skills['knowledge-base-search']).toBeUndefined();
      expect(response.skills['gitnexus-operations']).toBeUndefined();
    });

    it('same agent_id should return activity skills only', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actToken = (actResult._meta as Record<string, unknown>)['session_token'] as string;

      const first = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken, workflow_id: 'work-package', agent_id: 'worker-001' },
      });
      const updatedToken = (first._meta as Record<string, unknown>)['session_token'] as string;

      const second = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: updatedToken, workflow_id: 'work-package', agent_id: 'worker-001' },
      });
      expect(second.isError).toBeFalsy();
      const response = parseToolResponse(second);
      expect(response.scope).toBe('activity');
      expect(response.skills['create-issue']).toBeDefined();
      expect(response.skills['session-protocol']).toBeUndefined();
    });

    it('different agent_id should re-include workflow-level skills', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actToken = (actResult._meta as Record<string, unknown>)['session_token'] as string;

      const first = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken, workflow_id: 'work-package', agent_id: 'worker-001' },
      });
      const updatedToken = (first._meta as Record<string, unknown>)['session_token'] as string;

      const second = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: updatedToken, workflow_id: 'work-package', agent_id: 'worker-002' },
      });
      expect(second.isError).toBeFalsy();
      const response = parseToolResponse(second);
      expect(response.scope).toBe('activity+meta');
      expect(response.skills['session-protocol']).toBeDefined();
    });

    it('omitted agent_id should return activity skills only (no workflow-level skills)', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const actToken = (actResult._meta as Record<string, unknown>)['session_token'] as string;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('activity');
      expect(response.skills['session-protocol']).toBeUndefined();
    });
  });

  // ============== Cross-Workflow Resource Resolution ==============

  describe('cross-workflow resource resolution', () => {
    it('meta/NN prefix should resolve from meta workflow resources', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'orchestrate-workflow' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      const workerPrompt = response.skill._resources.find((r: { id: string }) => r.id === 'worker-prompt-template');
      expect(workerPrompt).toBeDefined();
      expect(workerPrompt.content.length).toBeGreaterThan(0);
      expect(workerPrompt.index).toBe('meta/05');
    });

    it('bare index should still resolve from current workflow', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', skill_id: 'elicit-requirements' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      const resource = response.skill._resources.find((r: { id: string }) => r.id === 'requirements-elicitation');
      expect(resource).toBeDefined();
      expect(resource.index).toBe('05');
    });
  });

  // ============== Validation ==============

  describe('token validation', () => {
    it('should warn on workflow mismatch', async () => {
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta' },
      });
      const metaToken = parseToolResponse(metaSession).session_token;

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

      const actContent = parseToolResponse(actResult);
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
      const metaToken = parseToolResponse(metaSession).session_token;

      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: metaToken, workflow_id: 'work-package' },
      });
      expect(result.isError).toBeFalsy();
      const workflow = parseToolResponse(result);
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
      const activity = parseToolResponse(result);
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

      const actContent = parseToolResponse(actResult);
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
      const activity = parseToolResponse(result);
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

      const response = parseToolResponse(result);
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
      const response = parseToolResponse(result);
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
      const response = parseToolResponse(result);
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

      const wf = parseToolResponse(result);
      expect(wf.id).toBe('work-package');
      expect(wf.version).toMatch(SEMVER_RE);
      expect(wf.rules).toBeDefined();
      expect(wf.variables).toBeDefined();
      expect(wf.executionModel).toBeDefined();
      expect(wf.executionModel.roles).toBeDefined();
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
      const wf = parseToolResponse(result);
      expect(wf.activities[0].steps).toBeDefined();
    });
  });

  // ============== Trace Integration ==============

  describe('trace lifecycle', () => {
    it('start_session initializes trace (IT-6)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const trace = parseToolResponse(result);
      expect(trace.source).toBe('memory');
      expect(trace.events.length).toBeGreaterThanOrEqual(1);
      expect(trace.events[0].name).toBe('start_session');
    });

    it('next_activity returns _meta.trace_token (IT-7)', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['trace_token']).toBeDefined();
      expect(typeof meta['trace_token']).toBe('string');
      expect((meta['trace_token'] as string).length).toBeGreaterThan(10);
    });

    it('get_trace without tokens returns in-memory trace (IT-13)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const trace = parseToolResponse(result);
      expect(trace.source).toBe('memory');
      expect(trace.events.length).toBeGreaterThan(0);
    });

    it('trace events have compressed field names (IT-10)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const trace = parseToolResponse(result);
      const event = trace.events[0];
      expect(event.ts).toBeDefined();
      expect(event.ms).toBeDefined();
      expect(event.s).toBeDefined();
      expect(event.wf).toBeDefined();
      expect(event.traceId).toBeDefined();
    });

    it('session_token not in trace events (IT-15)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const traceText = (result.content[0] as { type: 'text'; text: string }).text;
      expect(traceText).not.toContain('session_token');
    });

    it('get_trace excludes itself from trace (IT-14)', async () => {
      await client.callTool({ name: 'get_trace', arguments: { session_token: sessionToken } });
      const result = await client.callTool({ name: 'get_trace', arguments: { session_token: sessionToken } });
      const trace = parseToolResponse(result);
      const traceNames = trace.events.map((e: { name: string }) => e.name);
      expect(traceNames).not.toContain('get_trace');
    });

    it('error events are captured (IT-12)', async () => {
      try {
        await client.callTool({
          name: 'next_activity',
          arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'nonexistent-activity' },
        });
      } catch { /* expected */ }

      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const trace = parseToolResponse(result);
      const errorEvents = trace.events.filter((e: { s: string }) => e.s === 'error');
      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].err).toBeDefined();
    });

    it('accumulated trace tokens resolve via get_trace (IT-8)', async () => {
      await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken, workflow_id: 'work-package' },
      });

      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });
      const meta1 = act1._meta as Record<string, unknown>;
      const updatedToken = meta1['session_token'] as string;
      const traceToken1 = meta1['trace_token'] as string;
      expect(traceToken1).toBeDefined();

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: updatedToken, workflow_id: 'work-package', activity_id: 'design-philosophy' },
      });
      const meta2 = act2._meta as Record<string, unknown>;
      const updatedToken2 = meta2['session_token'] as string;
      const traceToken2 = meta2['trace_token'] as string;
      expect(traceToken2).toBeDefined();

      const resolved = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: updatedToken2, trace_tokens: [traceToken1, traceToken2] },
      });
      const trace = parseToolResponse(resolved);
      expect(trace.source).toBe('tokens');
      expect(trace.event_count).toBeGreaterThanOrEqual(2);
    });

    it('invalid trace token handled gracefully (IT-19)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken, trace_tokens: ['invalid.token.here'] },
      });
      const trace = parseToolResponse(result);
      expect(trace.token_errors).toBeDefined();
      expect(trace.token_errors.length).toBeGreaterThan(0);
    });

    it('activity_manifest accepted without error (IT-3)', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: sessionToken,
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

  // ============== Concurrent Session Isolation ==============

  describe('concurrent session isolation', () => {
    it('operations on one session should not affect another', async () => {
      const s1 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      const s2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });

      const token1 = parseToolResponse(s1).session_token as string;
      const token2 = parseToolResponse(s2).session_token as string;

      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token1, workflow_id: 'work-package', activity_id: 'design-philosophy' },
      });
      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token2, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });

      expect(act1.isError).toBeFalsy();
      expect(act2.isError).toBeFalsy();
      expect(parseToolResponse(act1).id).toBe('design-philosophy');
      expect(parseToolResponse(act2).id).toBe('start-work-package');
    });

    it('traces from different sessions should be isolated', async () => {
      const s1 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });
      const s2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package' },
      });

      const token1 = parseToolResponse(s1).session_token as string;
      const token2 = parseToolResponse(s2).session_token as string;

      await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token1, workflow_id: 'work-package', activity_id: 'start-work-package' },
      });

      const trace2 = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: token2 },
      });
      const traceData = parseToolResponse(trace2);
      const names = traceData.events.map((e: { name: string }) => e.name);
      expect(names).not.toContain('next_activity');
    });
  });
});
