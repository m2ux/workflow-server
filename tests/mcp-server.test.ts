import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseToolResponse(result: { content: unknown[] }): any {
  return JSON.parse((result.content[0] as { type: 'text'; text: string }).text);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveCheckpoints(client: Client, token: string, activityResponse: any): Promise<string> {
  let currentToken = token;
  const checkpoints = activityResponse.checkpoints ?? [];
  for (const cp of checkpoints) {
    if (cp.required === false) continue;
    
    // 1. Yield the checkpoint (simulating worker)
    const yieldResult = await client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_token: currentToken, checkpoint_id: cp.id },
    });
    if (yieldResult.isError) throw new Error(`Failed to yield checkpoint ${cp.id}`);
    const cpHandle = parseToolResponse(yieldResult).checkpoint_handle;
    
    // 2. Respond to the checkpoint (simulating orchestrator)
    const result = await client.callTool({
      name: 'respond_checkpoint',
      arguments: { checkpoint_handle: cpHandle, option_id: cp.options[0].id },
    });
    if (result.isError) throw new Error(`Failed to resolve checkpoint ${cp.id}`);
    const resolvedHandle = parseToolResponse(result).checkpoint_handle;

    // 3. Resume the checkpoint (simulating worker)
    const resumeResult = await client.callTool({
      name: 'resume_checkpoint',
      arguments: { session_token: resolvedHandle },
    });
    if (resumeResult.isError) throw new Error(`Failed to resume checkpoint ${cp.id}`);

    currentToken = (resumeResult._meta as Record<string, unknown>)['session_token'] as string;
  }
  return currentToken;
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
      minCheckpointResponseSeconds: 0,
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
      arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
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
      expect(guide.discovery).toContain('get_skill');
      expect(guide.available_workflows).toBeUndefined();
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
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
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
        arguments: { workflow_id: 'non-existent', agent_id: 'test-agent' },
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
        arguments: { session_token: sessionToken },
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

    it('tools should return session_token in content body', async () => {
      const wfResult = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken },
      });
      expect(parseToolResponse(wfResult).session_token).toBeDefined();

      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      expect(actResponse.session_token).toBeDefined();
      expect(actResponse.id).toBe('start-work-package');

      const skillsResult = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken },
      });
      expect(parseToolResponse(skillsResult).session_token).toBeDefined();

      const actMeta = actResult._meta as Record<string, unknown>;
      const clearedToken = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const skillResult = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: clearedToken, step_id: 'create-issue' },
      });
      expect(parseToolResponse(skillResult).session_token).toBeDefined();

      const cpResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: actMeta['session_token'] as string, checkpoint_id: 'issue-verification' },
      });
      const cpMeta = cpResult._meta as Record<string, unknown>;
      const cpHandle = cpMeta['session_token'] as string;

      const presentResult = await client.callTool({
        name: 'present_checkpoint',
        arguments: { checkpoint_handle: cpHandle },
      });
      expect(parseToolResponse(presentResult).checkpoint_handle).toBeDefined();
    });

    it('content-body token threading should work end-to-end (agent scenario)', async () => {
      const startResult = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
      });
      const startToken = parseToolResponse(startResult).session_token;

      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: startToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actMeta = actResult._meta as Record<string, unknown>;
      const actToken = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);
      expect(actToken).toBeDefined();
      expect(actToken).not.toBe(startToken);

      const stepResult = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'create-issue' },
      });
      expect(stepResult.isError).toBeFalsy();
      const stepResponse = parseToolResponse(stepResult);
      expect(stepResponse.skill.id).toBe('create-issue');
      expect(stepResponse.session_token).toBeDefined();
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
        arguments: { session_token: 'not-valid' },
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
    it('should get workflow for session workflow', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken },
      });
      expect(result.content).toBeDefined();
      const workflow = parseToolResponse(result);
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toMatch(SEMVER_RE);
    });
  });

  describe('tool: next_activity', () => {
    it('should get activity with explicit params', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const activity = parseToolResponse(result);
      expect(activity.id).toBe('start-work-package');
      expect(activity.name).toBe('Start Work Package');
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('tool: yield_checkpoint', () => {
    it('should yield checkpoint with explicit params', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'yield_checkpoint',
        arguments: {
          session_token: tokenWithAct,
          checkpoint_id: 'issue-verification',
        },
      });
      const content = parseToolResponse(result);
      expect(content.status).toBe('yielded');
      expect(content.checkpoint_handle).toBeDefined();
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
    it('should resolve skill from step_id after entering an activity', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'create-issue' },
      });
      const response = parseToolResponse(result);
      expect(response.skill).toBeDefined();
      expect(response.skill.id).toBe('create-issue');
      expect(response.skill._resources).toBeDefined();
      expect(Array.isArray(response.skill._resources)).toBe(true);
    });

    it('should error when step_id is provided but no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken, step_id: 'create-issue' },
      });
      expect(result.isError).toBe(true);
    });

    it('should return workflow primary skill when no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill.id).toBe('workflow-orchestrator');
    });

    it('should return workflow primary skill even when no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      const skillIds = Object.keys(response.skills);
      expect(skillIds).toContain('meta/workflow-orchestrator');
    });

    it('should error when step_id not found in activity', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'nonexistent-step' },
      });
      expect(result.isError).toBe(true);
    });

    it('should error when step has no associated skill', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'resolve-target' },
      });
      expect(result.isError).toBe(true);
    });

    it('should resolve skill from loop step', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'design-philosophy' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'reconcile-iteration' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill).toBeDefined();
      expect(response.skill.id).toBe('reconcile-assumptions');
    });

    it('should advance token with resolved skill ID', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'create-issue' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
      expect(meta['session_token']).not.toBe(actToken);
    });
  });


  describe('resource refs in skill responses', () => {
    it('get_skill should nest _resources as lightweight refs (index/id/version, no content)', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill._resources.length).toBeGreaterThan(0);
      const resource = response.skill._resources[0];
      expect(resource.index).toBeDefined();
      expect(resource.id).toBeDefined();
      expect(resource.version).toBeDefined();
      expect(resource.content).toBeUndefined();
    });

    it('get_skill should strip raw resources array from skill', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill.resources).toBeUndefined();
      expect(response.resources).toBeUndefined();
    });

    it('get_skills should nest _resources as refs under each workflow-level skill', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resources).toBeUndefined();
      const skillsWithResources = Object.values(response.skills).filter(
        (s: unknown) => (s as Record<string, unknown>)._resources
      );
      expect(skillsWithResources.length).toBeGreaterThan(0);
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
    });
  });

  describe('tool: get_resource', () => {
    it('should load resource content by bare index', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_token: sessionToken, resource_index: '03' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource).toBeDefined();
      expect(response.resource.index).toBe('03');
      expect(response.resource.content).toBeDefined();
      expect(response.resource.content.length).toBeGreaterThan(0);
      expect(response.session_token).toBeDefined();
    });

    it('should load cross-workflow resource with prefix', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_token: sessionToken, resource_index: 'meta/04' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource.index).toBe('meta/04');
      expect(response.resource.id).toBe('activity-worker-prompt');
      expect(response.resource.content.length).toBeGreaterThan(0);
    });

    it('should strip frontmatter from resource content', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_token: sessionToken, resource_index: '03' },
      });
      const response = parseToolResponse(result);
      expect(response.resource.content).not.toMatch(/^---/);
    });

    it('should error for nonexistent resource', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_token: sessionToken, resource_index: '99' },
      });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Token-Driven Skill Loading ==============

  describe('tool: get_skills', () => {
    it('should always return only declared workflow-level skills', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      const skillIds = Object.keys(response.skills);
      expect(skillIds).toContain('meta/workflow-orchestrator');
      expect(skillIds).not.toContain('meta/meta-orchestrator');
      expect(skillIds).not.toContain('create-issue');
      expect(skillIds).not.toContain('knowledge-base-search');
    });

    it('should return workflow-level skills even after entering an activity', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: actToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      const skillIds = Object.keys(response.skills);
      expect(skillIds).not.toContain('create-issue');
    });

    it('should nest resources under workflow-level skills', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken },
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
        arguments: { session_token: sessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_token']).toBeDefined();
    });

    it('should return empty skills for workflows without declared skills', async () => {
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'test-agent' },
      });
      const metaToken = parseToolResponse(metaSession).session_token;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: metaToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      expect(Object.keys(response.skills).length).toBe(0);
    });
  });

  // Agent-ID meta-skill loading tests removed — get_skills always returns workflow.skills only.
  // Step-level skills are loaded via get_skill per step.

  // ============== Cross-Workflow Resource Resolution ==============

  describe('cross-workflow resource resolution', () => {
    it('meta/NN prefix should resolve ref from meta workflow via get_skills', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      const orchestrate = response.skills['meta/workflow-orchestrator'];
      expect(orchestrate).toBeDefined();
      const crossWfRef = orchestrate._resources?.find((r: { index: string }) => r.index === 'meta/04');
      expect(crossWfRef).toBeDefined();
      expect(crossWfRef.id).toBe('activity-worker-prompt');
      expect(crossWfRef.content).toBeUndefined();
    });

    it('bare index should still resolve ref from current workflow via get_skill', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'requirements-elicitation' },
      });
      const actResponse = parseToolResponse(actResult);
      const actToken = await resolveCheckpoints(client, (actResult._meta as Record<string, unknown>)['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: actToken, step_id: 'elicit-requirements' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.skill._resources).toBeDefined();
      expect(response.skill._resources.length).toBeGreaterThan(0);
      const bareRef = response.skill._resources.find((r: { index: string }) => !r.index.includes('/'));
      expect(bareRef).toBeDefined();
      expect(bareRef.content).toBeUndefined();
    });

    it('get_resource should load cross-workflow resource content by ref', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_token: sessionToken, resource_index: 'meta/04' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource.id).toBe('activity-worker-prompt');
      expect(response.resource.content.length).toBeGreaterThan(0);
    });
  });

  // ============== Validation ==============

  describe('token validation', () => {
    it('should warn on invalid activity transition', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      let tokenAfterStart = actMeta['session_token'] as string;
      tokenAfterStart = await resolveCheckpoints(client, tokenAfterStart, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenAfterStart, activity_id: 'complete' },
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actContent = parseToolResponse(actResult);
      let tokenAfterStart = actMeta['session_token'] as string;
      tokenAfterStart = await resolveCheckpoints(client, tokenAfterStart, actContent);

      const manifest = actContent.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'completed' }));

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenAfterStart, activity_id: 'design-philosophy', step_manifest: manifest },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('valid');
    });

  });

  // ============== Transition Condition Tracking ==============

  describe('transition condition validation', () => {
    it('should accept correct condition-activity pairing', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAtComprehension = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtComprehension,
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
        arguments: { session_token: sessionToken, activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAtComprehension = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtComprehension,
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAtStart = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtStart,
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
        arguments: { session_token: sessionToken, activity_id: 'codebase-comprehension' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAtComprehension = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAtComprehension,
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAfterAct = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenAfterAct, activity_id: 'design-philosophy' },
      });
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('No step_manifest'))).toBe(true);
    });

    it('should warn on missing steps in manifest', async () => {
      const actResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAfterAct = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAfterAct,
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actContent = parseToolResponse(actResult);
      const tokenAfterAct = await resolveCheckpoints(client, actMeta['session_token'] as string, actContent);

      const reversedManifest = actContent.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'done' })).reverse();

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAfterAct,
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = actResult._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(actResult);
      const tokenAfterAct = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_token: tokenAfterAct,
          activity_id: 'design-philosophy',
          step_manifest: [{ step_id: 'fake-step', output: 'done' }],
        },
      });
      expect(result.isError).toBeFalsy();
      const activity = parseToolResponse(result);
      expect(activity.id).toBe('design-philosophy');
    });
  });

  // ============== Workflow Summary Mode ==============

  describe('tool: get_workflow (summary mode)', () => {
    it('should return lightweight summary by default', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, summary: true },
      });
      expect(result.isError).toBeFalsy();

      const wf = parseToolResponse(result);
      expect(wf.id).toBe('work-package');
      expect(wf.version).toMatch(SEMVER_RE);
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
        arguments: { session_token: sessionToken, summary: false },
      });
      const summaryResult = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, summary: true },
      });

      const fullSize = (fullResult.content[0] as { type: 'text'; text: string }).text.length;
      const summarySize = (summaryResult.content[0] as { type: 'text'; text: string }).text.length;
      expect(summarySize).toBeLessThan(fullSize / 2);
    });

    it('should return full definition when summary=false', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_token: sessionToken, summary: false },
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['trace_token']).toBeDefined();
      expect(typeof meta['trace_token']).toBe('string');
      expect((meta['trace_token'] as string).length).toBeGreaterThan(10);
    });

    it('get_trace without tokens returns in-memory trace (IT-13)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
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
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const trace = parseToolResponse(result);
      for (const event of trace.events) {
        expect(JSON.stringify(event)).not.toContain('session_token');
      }
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
          arguments: { session_token: sessionToken, activity_id: 'nonexistent-activity' },
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
        arguments: { session_token: sessionToken },
      });

      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const meta1 = act1._meta as Record<string, unknown>;
      const act1Response = parseToolResponse(act1);
      let updatedToken = meta1['session_token'] as string;
      const traceToken1 = meta1['trace_token'] as string;
      expect(traceToken1).toBeDefined();

      updatedToken = await resolveCheckpoints(client, updatedToken, act1Response);

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: updatedToken, activity_id: 'design-philosophy' },
      });
      const meta2 = act2._meta as Record<string, unknown>;
      const act2Response = parseToolResponse(act2);
      let updatedToken2 = meta2['session_token'] as string;
      const traceToken2 = meta2['trace_token'] as string;
      expect(traceToken2).toBeDefined();

      updatedToken2 = await resolveCheckpoints(client, updatedToken2, act2Response);

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
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
      });
      const s2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
      });

      const token1 = parseToolResponse(s1).session_token as string;
      const token2 = parseToolResponse(s2).session_token as string;

      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token1, activity_id: 'design-philosophy' },
      });
      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token2, activity_id: 'start-work-package' },
      });

      expect(act1.isError).toBeFalsy();
      expect(act2.isError).toBeFalsy();
      expect(parseToolResponse(act1).id).toBe('design-philosophy');
      expect(parseToolResponse(act2).id).toBe('start-work-package');
    });

    it('traces from different sessions should be isolated', async () => {
      const s1 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
      });
      const s2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
      });

      const token1 = parseToolResponse(s1).session_token as string;
      const token2 = parseToolResponse(s2).session_token as string;

      await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token1, activity_id: 'start-work-package' },
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

  // ============== Checkpoint Enforcement ==============

  describe('checkpoint enforcement', () => {
    it('next_activity should not fail when bcp is empty', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      expect(result.isError).toBeFalsy();
    });

    it('next_activity should hard-reject when bcp is non-empty and transitioning', async () => {
      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act1._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const cpResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: 'issue-verification' },
      });
      const tokenWithBcp = (cpResult._meta as Record<string, unknown>)['session_token'] as string;

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: tokenWithBcp, activity_id: 'design-philosophy' },
      });
      expect(act2.isError).toBe(true);
      const errorText = (act2.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Active checkpoint');
      expect(errorText).toContain('respond_checkpoint');
    });

    it('respond_checkpoint should clear a checkpoint from bcp', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;
      const firstCpId = 'classification-confirmed'; // Known from the workflow

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: firstCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const cpResult = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, option_id: 'confirmed' }, // Assumes 'confirmed' is a valid option
      });
      expect(cpResult.isError).toBeFalsy();
      const response = parseToolResponse(cpResult);
      expect(response.resolved).toBe(true);
    });

    it('respond_checkpoint should reject invalid option_id', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;
      const firstCpId = 'classification-confirmed';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: firstCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, option_id: 'nonexistent-option' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Invalid option');
    });

    it('respond_checkpoint should reject if bcp is empty', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const token = actMeta['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: token, option_id: 'some-opt' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('does not have an active checkpoint');
    });

    it('respond_checkpoint with auto_advance should reject on blocking checkpoint', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;
      const blockingCpId = 'issue-verification';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: blockingCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, auto_advance: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('blocking');
    });

    it('respond_checkpoint with condition_not_met should reject unconditional checkpoint', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;
      const unconditionalCpId = 'workflow-path-selected';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: unconditionalCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, condition_not_met: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('no condition field');
    });

    it('respond_checkpoint with condition_not_met should accept conditional checkpoint', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;
      const conditionalCpId = 'branch-check';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: conditionalCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, condition_not_met: true },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.dismissed).toBe(true);
    });

    it('respond_checkpoint should return effects from selected option', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;
      const cpWithEffectsId = 'issue-verification';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: cpWithEffectsId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, option_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.effect).toBeDefined();
    });

    it('full flow: next_activity -> yield -> respond -> resume -> next_activity succeeds', async () => {
      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const act1Meta = act1._meta as Record<string, unknown>;
      const act1Response = parseToolResponse(act1);
      let token = act1Meta['session_token'] as string;

      token = await resolveCheckpoints(client, token, act1Response);

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: token, activity_id: 'design-philosophy' },
      });
      expect(act2.isError).toBeFalsy();
      expect(parseToolResponse(act2).id).toBe('design-philosophy');
    });

    it('get_skill should be gated when a checkpoint is yielded', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: 'issue-verification' },
      });
      const tokenWithBcp = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: tokenWithBcp, step_id: 'create-issue' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Active checkpoint');
    });

    it('get_skill should work after checkpoint is resumed', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const actResponse = parseToolResponse(act);
      const clearedToken = await resolveCheckpoints(client, actMeta['session_token'] as string, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: clearedToken, step_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseToolResponse(result).skill.id).toBe('create-issue');
    });

    it('respond_checkpoint should require exactly one resolution mode', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: 'classification-confirmed' },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { checkpoint_handle: cpHandle, option_id: 'confirmed', auto_advance: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Exactly one');
    });
  });

  // ============== Token Inheritance ==============

  describe('start_session token inheritance', () => {
    it('should return a warning when agent_id does not match inherited session token', async () => {
      const inherited = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', session_token: sessionToken, agent_id: 'different-agent' },
      });
      expect(inherited.isError).toBeFalsy();
      const response = parseToolResponse(inherited);
      expect(response.warning).toBeDefined();
      expect(response.warning).toContain("does not match the inherited session token's agent_id");
      
      const meta = inherited._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings[0]).toContain("does not match the inherited session token's agent_id");
    });
    it('inherited session should preserve bcp from parent token', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_token'] as string;

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_token: tokenWithAct, checkpoint_id: 'issue-verification' },
      });
      const parentToken = (yieldResult._meta as Record<string, unknown>)['session_token'] as string;

      const inherited = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', session_token: parentToken, agent_id: 'worker-1' },
      });
      expect(inherited.isError).toBeFalsy();
      const response = parseToolResponse(inherited);
      expect(response.inherited).toBe(true);

      const skillResult = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: response.session_token, step_id: 'create-issue' },
      });
      expect(skillResult.isError).toBe(true);
      const errorText = (skillResult.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Active checkpoint');
    });

    it('inherited session should set aid from agent_id parameter', async () => {
      const inherited = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', session_token: sessionToken, agent_id: 'worker-42' },
      });
      expect(inherited.isError).toBeFalsy();
    });

    it('inherited session should preserve sid from parent', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const parentToken = (act._meta as Record<string, unknown>)['session_token'] as string;

      const inherited = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', session_token: parentToken, agent_id: 'worker-1' },
      });
      const childToken = parseToolResponse(inherited).session_token;

      const parentTrace = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const childTrace = await client.callTool({
        name: 'get_trace',
        arguments: { session_token: sessionToken },
      });
      const parentTraceId = parseToolResponse(parentTrace).traceId;
      const childTraceId = parseToolResponse(childTrace).traceId;
      expect(childTraceId).toBe(parentTraceId);
    });

    it('should reject workflow mismatch between token and workflow_id', async () => {
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'test-agent' },
      });
      const metaToken = parseToolResponse(metaSession).session_token;

      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', session_token: metaToken, agent_id: 'test-agent' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Workflow mismatch');
    });

    it('fresh session should still work without session_token', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.workflow.id).toBe('work-package');
      expect(response.session_token).toBeDefined();
      expect(response.inherited).toBeUndefined();
    });

    it('fresh session should accept agent_id without session_token', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseToolResponse(result).session_token).toBeDefined();
    });

    it('inherited session should preserve act from parent', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_token: sessionToken, activity_id: 'start-work-package' },
      });
      const parentToken = (act._meta as Record<string, unknown>)['session_token'] as string;
      const actResponse = parseToolResponse(act);
      const clearedToken = await resolveCheckpoints(client, parentToken, actResponse);

      const inherited = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', session_token: clearedToken, agent_id: 'worker-1' },
      });
      const childToken = parseToolResponse(inherited).session_token;

      const skillResult = await client.callTool({
        name: 'get_skill',
        arguments: { session_token: childToken, step_id: 'create-issue' },
      });
      expect(skillResult.isError).toBeFalsy();
      expect(parseToolResponse(skillResult).skill.id).toBe('create-issue');
    });
  });

});
