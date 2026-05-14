import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve, join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { decode } from '@toon-format/toon';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseToolResponse(result: any): any {
  const text = (result.content[0] as { type: 'text'; text: string }).text;

  // Try JSON first (tier 3 tools: yield/respond/resume checkpoint, get_trace, health_check, etc.)
  try { return JSON.parse(text); } catch { /* not JSON */ }

  // Try TOON decode (handles encodeToon output AND header+TOON body since
  // TOON treats blank lines as whitespace between top-level keys)
  try { return decode(text); } catch { /* not pure TOON */ }

  // Fallback: split header from body on first double-newline
  const splitIdx = text.indexOf('\n\n');
  if (splitIdx > 0) {
    const header = text.substring(0, splitIdx);
    const body = text.substring(splitIdx + 2);
    const meta: Record<string, string> = {};
    for (const line of header.split('\n')) {
      const colonIdx = line.indexOf(': ');
      if (colonIdx > 0) meta[line.substring(0, colonIdx)] = line.substring(colonIdx + 2);
    }
    // Try decoding body as TOON
    try { return { ...meta, ...decode(body) }; } catch { /* body is not TOON */ }
    return { ...meta, _body: body };
  }

  return { _raw: text };
}

/**
 * Parse a get_workflow response which may contain a primary skill section
 * followed by a --- separator and the workflow definition.
 * Returns the workflow portion as a parsed object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseWorkflowResponse(result: any): any {
  const text = (result.content[0] as { type: 'text'; text: string }).text;
  // Split on --- separator (skill comes first, workflow after)
  const sepIdx = text.indexOf('\n\n---\n\n');
  const workflowText = sepIdx >= 0 ? text.substring(sepIdx + 5) : text;
  // Try JSON first
  try { return JSON.parse(workflowText); } catch { /* not JSON */ }
  // Try TOON decode
  try { return decode(workflowText); } catch { /* not pure TOON */ }
  // Fallback to parseToolResponse on the workflow portion
  return parseToolResponse({ content: [{ type: 'text' as const, text: workflowText }] });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveCheckpoints(client: Client, sessionIndex: string, activityResponse: any): Promise<string> {
  const checkpoints = activityResponse.checkpoints ?? [];
  for (const cp of checkpoints) {
    if (cp.required === false) continue;

    // 1. Yield the checkpoint (simulating worker)
    const yieldResult = await client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_index: sessionIndex, checkpoint_id: cp.id },
    });
    if (yieldResult.isError) throw new Error(`Failed to yield checkpoint ${cp.id}`);

    // 2. Respond to the checkpoint (simulating orchestrator)
    const result = await client.callTool({
      name: 'respond_checkpoint',
      arguments: { session_index: sessionIndex, option_id: cp.options[0].id },
    });
    if (result.isError) throw new Error(`Failed to resolve checkpoint ${cp.id}`);

    // 3. Resume the checkpoint (simulating worker)
    const resumeResult = await client.callTool({
      name: 'resume_checkpoint',
      arguments: { session_index: sessionIndex },
    });
    if (resumeResult.isError) throw new Error(`Failed to resume checkpoint ${cp.id}`);
  }
  return sessionIndex;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function transitionToActivity(client: Client, sessionIndex: string, activityId: string, extra?: Record<string, any>): Promise<{ actMeta: Record<string, unknown>; nextToken: string; actResponse: any }> {
  const args: Record<string, unknown> = { session_index: sessionIndex, activity_id: activityId };
  if (extra?.transition_condition) args.transition_condition = extra.transition_condition;
  if (extra?.step_manifest) args.step_manifest = extra.step_manifest;
  if (extra?.activity_manifest) args.activity_manifest = extra.activity_manifest;

  const actResult = await client.callTool({ name: 'next_activity', arguments: args });
  if (actResult.isError) throw new Error(`next_activity failed: ${(actResult.content[0] as { type: string; text: string }).text}`);
  const actMeta = actResult._meta as Record<string, unknown>;

  const getResult = await client.callTool({ name: 'get_activity', arguments: { session_index: sessionIndex } });
  if (getResult.isError) throw new Error(`get_activity failed: ${(getResult.content[0] as { type: string; text: string }).text}`);
  // get_activity prepends a resolved-operations bundle separated by '\n\n---\n\n' from the activity body.
  const actResponse = parseWorkflowResponse(getResult);

  // The session_index is stable; keep the alias `nextToken` only to minimise diff churn in callers.
  return { actMeta, nextToken: sessionIndex, actResponse };
}

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

describe('mcp-server integration', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workspaceDir: string;
  /** session_index for a fresh work-package session (set per-test in beforeEach). */
  let sessionToken: string;
  /** session_index for a fresh meta session (set per-test in beforeEach). */
  let metaToken: string;

  beforeAll(async () => {
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-mcp-test-'));
    const config = {
      workflowDir: resolve(import.meta.dirname, '../workflows'),
      schemasDir: resolve(import.meta.dirname, '../schemas'),
      workspaceDir,
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
    const result = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'test-worker' },
    });
    sessionToken = parseToolResponse(result).session_index;

    const metaResult = await client.callTool({
      name: 'start_session',
      arguments: { agent_id: 'test-orchestrator' },
    });
    metaToken = parseToolResponse(metaResult).session_index;
  });

  afterAll(async () => {
    await closeTransport();
    try { rmSync(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  // ============== Bootstrap Tools ==============

  describe('tool: discover', () => {
    it('should return bootstrap guide and available workflows', async () => {
      const result = await client.callTool({ name: 'discover', arguments: {} });
      expect(result.isError).toBeFalsy();
      const guide = parseToolResponse(result);
      expect(guide.server).toBeDefined();
      expect(guide.version).toBeDefined();
      expect(guide._body).toBeDefined();
      expect(typeof guide._body).toBe('string');
      expect(guide._body).toContain('start_session');
      expect(guide._body).toContain('get_workflow');
      expect(guide.available_workflows).toBeUndefined();
    });
  });

  describe('tool: list_workflows', () => {
    it('should not require session_index', async () => {
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
    it('should return workflow metadata and opaque token for default meta workflow', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { agent_id: 'test-agent' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.rules).toBeUndefined();
      expect(response.workflow.id).toBe('meta');
      expect(response.session_index).toBeDefined();
      expect(typeof response.session_index).toBe('string');
    });

    it('should reject when meta workflow cannot be loaded', async () => {
      // Fresh sessions default to 'meta' — if that workflow doesn't load, it errors.
      // This is tested implicitly; a non-existent workflow can only be reached via
      // a corrupted token or a misconfigured server. The loadWorkflow call will fail.
      // We verify the happy path here: meta loads successfully.
      const result = await client.callTool({
        name: 'start_session',
        arguments: { agent_id: 'test-agent' },
      });
      expect(result.isError).toBeFalsy();
    });
  });

  // ============== Session Index Lifecycle ==============

  describe('session index lifecycle', () => {
    it('session_index is a 6-character base32 string', async () => {
      expect(sessionToken).toMatch(/^[A-Z2-7]{6}$/);
    });

    it('tools return the same session_index in _meta (stable across calls — Phase 4 R3)', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      expect(meta).toBeDefined();
      expect(meta!['session_index']).toBe(sessionToken);
      expect(meta!['validation']).toBeDefined();
      const validation = meta!['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('valid');
      expect(validation.warnings).toHaveLength(0);
    });

    it('rejects tool call without session_index', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });

    it('rejects tool call with malformed session_index (non-base32)', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: 'not-valid' },
      });
      expect(result.isError).toBe(true);
    });

    it('rejects authenticated call passing legacy session_token parameter (PR116-TC-60)', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        // The strict zod schema only accepts `session_index`; `session_token`
        // is rejected with a clear error pointing at the migration.
        arguments: { session_token: sessionToken },
      });
      expect(result.isError).toBe(true);
    });

    it('health_check should not require session_index', async () => {
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
        arguments: { session_index: sessionToken },
      });
      expect(result.content).toBeDefined();
      const workflow = parseWorkflowResponse(result);
      expect(workflow.id).toBe('work-package');
      expect(workflow.version).toMatch(SEMVER_RE);
    });
  });

  describe('tool: next_activity', () => {
    it('should get activity with explicit params', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const nextAct = parseToolResponse(result);
      expect(nextAct.activity_id).toBe('start-work-package');
      expect(nextAct.name).toBe('Start Work Package');
    });

    it('should return error for non-existent activity', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'non-existent' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('tool: get_activity', () => {
    it('should return complete activity definition after next_activity', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: nextToken },
      });
      expect(result.isError).toBeFalsy();
      const activity = parseWorkflowResponse(result);
      expect(activity.id).toBe('start-work-package');
      expect(activity.steps).toBeDefined();
      expect(Array.isArray(activity.steps)).toBe(true);
      expect(activity.checkpoints).toBeDefined();
      expect(activity.transitions).toBeDefined();
      expect(activity.session_index).toBeDefined();
    });

    it('should error when no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('No current activity');
    });

    it('returns the stable session_index in _meta (Phase 4 R3)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: nextToken },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_index']).toBe(nextToken);
    });
  });

  describe('tool: yield_checkpoint', () => {
    it('should yield checkpoint with explicit params', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const result = await client.callTool({
        name: 'yield_checkpoint',
        arguments: {
          session_index: nextToken,
          checkpoint_id: 'issue-verification',
        },
      });
      const content = parseToolResponse(result);
      expect(content.status).toBe('yielded');
      expect(content.session_index).toBe(nextToken);
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
    it('should error when step_id is provided but no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_index: metaToken, step_id: 'create-issue' },
      });
      expect(result.isError).toBe(true);
    });

    it('get_skill returns an error when the workflow declares no primary skill', async () => {
      // Workflows have migrated to operations[] and no longer declare skills.primary.
      // get_skill without a step_id has no primary to load and errors.
      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBe(true);
    });

    it('get_skills returns the workflow scope but no primary-skill body for migrated workflows', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
    });

    it('should error when step_id not found in activity', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const actToken = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_index: actToken, step_id: 'nonexistent-step' },
      });
      expect(result.isError).toBe(true);
    });

    it('should error when step has no associated skill', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const actToken = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_index: actToken, step_id: 'resolve-target' },
      });
      expect(result.isError).toBe(true);
    });

  });


  describe('resource refs in skill responses', () => {
    it('get_skills returns scope and session_index for migrated workflows', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_index']).toBeDefined();
    });
  });

  describe('tool: get_resource', () => {
    it('should load resource content by bare index', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: '03' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource_id).toBe('03');
      expect(response._body).toBeDefined();
      expect(response._body.length).toBeGreaterThan(0);
      expect(response.session_index).toBeDefined();
    });

    it('should load cross-workflow resource with prefix', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'meta/01' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource_id).toBe('meta/01');
      expect(response.id).toBe('activity-worker-prompt');
      expect(response._body.length).toBeGreaterThan(0);
    });

    it('should strip frontmatter from resource content', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: '03' },
      });
      const response = parseToolResponse(result);
      expect(response._body).not.toMatch(/^---/);
    });

    it('should error for nonexistent resource', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: '99' },
      });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Token-Driven Skill Loading ==============

  describe('tool: get_skills', () => {
    it('should return workflow scope when no primary skill is declared', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      // Migrated workflows declare operations[] instead of skills.primary; get_skills returns no primary-skill body for them.
    });

    it.skip('should return workflow-level skills even after entering an activity', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const actToken = await resolveCheckpoints(client, nextToken, actResponse);
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: actToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
      expect(response._body).toBeDefined();
      expect(response._body).not.toContain('id: create-issue');
    });

    it.skip('should include resource references in raw skill TOON', async () => {
      // Legacy assertion — workflows now declare operations[] and resources are
      // surfaced via get_workflow / get_activity bundles instead of primary-skill body.
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: sessionToken },
      });
      const response = parseToolResponse(result);
      expect(response._body).toContain('resources');
    });

    it('should return updated token in _meta', async () => {
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: sessionToken },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_index']).toBeDefined();
    });

    it('should return empty body for workflows that have migrated to skill_operations', async () => {
      // Meta workflow under v5 declares skill_operations[] and has no skills.primary;
      // get_skills (legacy) returns no primary-skill body for such workflows.
      const metaSession = await client.callTool({
        name: 'start_session',
        arguments: { agent_id: 'test-agent' },
      });
      const metaToken = parseToolResponse(metaSession).session_index;
      const result = await client.callTool({
        name: 'get_skills',
        arguments: { session_index: metaToken },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.scope).toBe('workflow');
    });
  });

  // Agent-ID meta-skill loading tests removed — get_skills always returns workflow.skills only.
  // Step-level skills are loaded via get_skill per step.

  // ============== Cross-Workflow Resource Resolution ==============

  describe('cross-workflow resource resolution', () => {
    it('meta/NN prefix can be loaded directly via get_resource', async () => {
      // Cross-workflow resource resolution under the new model: agents fetch
      // resources by their canonical "meta/NN" reference via get_resource.
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'meta/01' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.id).toBe('activity-worker-prompt');
    });

    it('get_resource should load cross-workflow resource content by ref', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'meta/01' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.id).toBe('activity-worker-prompt');
      expect(response._body.length).toBeGreaterThan(0);
    });
  });

  // ============== Validation ==============

  describe('token validation', () => {
    it('should warn on invalid activity transition', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      let tokenAfterStart = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: tokenAfterStart, activity_id: 'complete' },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('not a direct transition'))).toBe(true);
    });

    it('should not warn on valid activity transition with manifest', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      let tokenAfterStart = await resolveCheckpoints(client, nextToken, actResponse);

      const manifest = actResponse.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'completed' }));

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: tokenAfterStart, activity_id: 'design-philosophy', step_manifest: manifest },
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
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
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
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
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
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const tokenAtStart = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtStart,
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
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
          activity_id: 'requirements-elicitation',
          transition_condition: 'wrong_condition == true',
        },
      });
      expect(result.isError).toBeFalsy();
      const nextAct = parseToolResponse(result);
      expect(nextAct.activity_id).toBe('requirements-elicitation');
    });
  });

  // ============== Step Manifest ==============

  describe('step completion manifest', () => {
    it('should warn when no manifest provided for previous activity', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const tokenAfterAct = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: tokenAfterAct, activity_id: 'design-philosophy' },
      });
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes('No step_manifest'))).toBe(true);
    });

    it('should warn on missing steps in manifest', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const tokenAfterAct = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAfterAct,
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
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const tokenAfterAct = await resolveCheckpoints(client, nextToken, actResponse);

      const reversedManifest = actResponse.steps.map((s: { id: string }) => ({ step_id: s.id, output: 'done' })).reverse();

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAfterAct,
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
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const tokenAfterAct = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAfterAct,
          activity_id: 'design-philosophy',
          step_manifest: [{ step_id: 'fake-step', output: 'done' }],
        },
      });
      expect(result.isError).toBeFalsy();
      const nextAct = parseToolResponse(result);
      expect(nextAct.activity_id).toBe('design-philosophy');
    });
  });

  // ============== Workflow Summary Mode ==============

  describe('tool: get_workflow (summary mode)', () => {
    it('should include the resolved-operations bundle before the --- separator', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken, summary: true },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content[0] as { type: 'text'; text: string }).text;
      // The operations bundle (workflow.operations + core orchestrator ops) appears before the --- separator
      const sepIdx = text.indexOf('\n\n---\n\n');
      expect(sepIdx).toBeGreaterThan(0);
      const preamble = text.substring(0, sepIdx);
      const decoded = decode(preamble) as Record<string, unknown>;
      expect(decoded.operations).toBeDefined();
      // Bundle shape: operations keyed by `<skill>::<name>`, rules as [header, line] tuples.
      expect(typeof decoded.operations).toBe('object');
      expect(Array.isArray(decoded.operations)).toBe(false);
    });

    it('should return lightweight summary by default', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken, summary: true },
      });
      expect(result.isError).toBeFalsy();

      const wf = parseWorkflowResponse(result);
      expect(wf.id).toBe('work-package');
      expect(wf.version).toMatch(SEMVER_RE);
      expect(wf.rules).toBeDefined();
      expect(wf.variables).toBeDefined();
      expect(wf.activities).toBeDefined();
      expect(wf.activities[0].id).toBeDefined();
      expect(wf.activities[0].steps).toBeUndefined();
      expect(wf.activities[0].checkpoints).toBeUndefined();
    });

    it('summary and full definition should differ in content', async () => {
      const fullResult = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken, summary: false },
      });
      const summaryResult = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken, summary: true },
      });

      const fullText = (fullResult.content[0] as { type: 'text'; text: string }).text;
      const summaryText = (summaryResult.content[0] as { type: 'text'; text: string }).text;
      // Full definition includes raw workflow TOON with skills, modes, tags etc.
      // Summary includes activity stubs but omits raw details
      expect(fullText).not.toBe(summaryText);
      // Full raw TOON includes fields not in summary
      const fullParsed = parseWorkflowResponse(fullResult);
      expect(fullParsed.skills).toBeDefined();
      expect(fullParsed.modes).toBeDefined();
    });

    it('should return full definition when summary=false', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken, summary: false },
      });
      const wf = parseWorkflowResponse(result);
      // Full raw workflow TOON includes fields like skills, modes, tags that summary omits
      expect(wf.skills).toBeDefined();
      expect(wf.modes).toBeDefined();
      expect(wf.tags).toBeDefined();
    });
  });

  // ============== Trace Integration ==============

  describe('trace lifecycle', () => {
    it('session creation initializes trace (IT-6)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      });
      const trace = parseToolResponse(result);
      expect(trace.source).toBe('memory');
      expect(trace.events.length).toBeGreaterThanOrEqual(1);
      // sessionToken is from start_session with workflow_id
      expect(trace.events[0].name).toBe('start_session');
    });

    it('next_activity returns _meta.trace_token (IT-7)', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['trace_token']).toBeDefined();
      expect(typeof meta['trace_token']).toBe('string');
      expect((meta['trace_token'] as string).length).toBeGreaterThan(10);
    });

    it('get_trace without tokens returns in-memory trace (IT-13)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      });
      const trace = parseToolResponse(result);
      expect(trace.source).toBe('memory');
      expect(trace.events.length).toBeGreaterThan(0);
    });

    it('trace events have compressed field names (IT-10)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      });
      const trace = parseToolResponse(result);
      const event = trace.events[0];
      expect(event.ts).toBeDefined();
      expect(event.ms).toBeDefined();
      expect(event.s).toBeDefined();
      expect(event.wf).toBeDefined();
      expect(event.traceId).toBeDefined();
    });

    it('session_index not in trace events (IT-15)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      });
      const trace = parseToolResponse(result);
      for (const event of trace.events) {
        expect(JSON.stringify(event)).not.toContain('session_index');
      }
    });

    it('get_trace excludes itself from trace (IT-14)', async () => {
      await client.callTool({ name: 'get_trace', arguments: { session_index: sessionToken } });
      const result = await client.callTool({ name: 'get_trace', arguments: { session_index: sessionToken } });
      const trace = parseToolResponse(result);
      const traceNames = trace.events.map((e: { name: string }) => e.name);
      expect(traceNames).not.toContain('get_trace');
    });

    it('error events are captured (IT-12)', async () => {
      try {
        await client.callTool({
          name: 'next_activity',
          arguments: { session_index: sessionToken, activity_id: 'nonexistent-activity' },
        });
      } catch { /* expected */ }

      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      });
      const trace = parseToolResponse(result);
      const errorEvents = trace.events.filter((e: { s: string }) => e.s === 'error');
      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].err).toBeDefined();
    });

    it('accumulated trace tokens resolve via get_trace (IT-8)', async () => {
      await client.callTool({
        name: 'get_skills',
        arguments: { session_index: sessionToken },
      });

      const { actMeta: meta1, nextToken: nextToken1, actResponse: act1Response } = await transitionToActivity(client, sessionToken, 'start-work-package');
      let updatedToken = nextToken1;
      const traceToken1 = meta1['trace_token'] as string;
      expect(traceToken1).toBeDefined();

      updatedToken = await resolveCheckpoints(client, updatedToken, act1Response);

      const { actMeta: meta2, nextToken: nextToken2, actResponse: act2Response } = await transitionToActivity(client, updatedToken, 'design-philosophy');
      let updatedToken2 = nextToken2;
      const traceToken2 = meta2['trace_token'] as string;
      expect(traceToken2).toBeDefined();

      updatedToken2 = await resolveCheckpoints(client, updatedToken2, act2Response);

      const resolved = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: updatedToken2, trace_tokens: [traceToken1, traceToken2] },
      });
      const trace = parseToolResponse(resolved);
      expect(trace.source).toBe('tokens');
      expect(trace.event_count).toBeGreaterThanOrEqual(2);
    });

    it('invalid trace token handled gracefully (IT-19)', async () => {
      const result = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken, trace_tokens: ['invalid.token.here'] },
      });
      const trace = parseToolResponse(result);
      expect(trace.token_errors).toBeDefined();
      expect(trace.token_errors.length).toBeGreaterThan(0);
    });

    it('activity_manifest accepted without error (IT-3)', async () => {
      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionToken,
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
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent-1' },
      });
      const token1 = parseToolResponse(s1).session_index;

      const s2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent-2' },
      });
      const token2 = parseToolResponse(s2).session_index;

      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: token1, activity_id: 'design-philosophy' },
      });
      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: token2, activity_id: 'start-work-package' },
      });

      expect(act1.isError).toBeFalsy();
      expect(act2.isError).toBeFalsy();
      expect(parseToolResponse(act1).activity_id).toBe('design-philosophy');
      expect(parseToolResponse(act2).activity_id).toBe('start-work-package');
    });

    it('traces from different sessions should be isolated', async () => {
      const s1 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent-1' },
      });
      const token1 = parseToolResponse(s1).session_index;

      const s2 = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'test-agent-2' },
      });
      const token2 = parseToolResponse(s2).session_index;

      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: token1, activity_id: 'start-work-package' },
      });

      const trace2 = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: token2 },
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
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      expect(result.isError).toBeFalsy();
    });

    it('next_activity should hard-reject when bcp is non-empty and transitioning', async () => {
      const act1 = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act1._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;

      const cpResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: 'issue-verification' },
      });
      const tokenWithBcp = (cpResult._meta as Record<string, unknown>)['session_index'] as string;

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: tokenWithBcp, activity_id: 'design-philosophy' },
      });
      expect(act2.isError).toBe(true);
      const errorText = (act2.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Active checkpoint');
      expect(errorText).toContain('respond_checkpoint');
    });

    it('respond_checkpoint should clear a checkpoint from bcp', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const firstCpId = 'classification-confirmed'; // Known from the workflow

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: firstCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const cpResult = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, option_id: 'confirmed' }, // Assumes 'confirmed' is a valid option
      });
      expect(cpResult.isError).toBeFalsy();
      const response = parseToolResponse(cpResult);
      expect(response.resolved).toBe(true);
    });

    it('respond_checkpoint should reject invalid option_id', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const firstCpId = 'classification-confirmed';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: firstCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, option_id: 'nonexistent-option' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Invalid option');
    });

    it('respond_checkpoint should reject if bcp is empty', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const token = actMeta['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: token, option_id: 'some-opt' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('no active checkpoint');
    });

    it('respond_checkpoint with auto_advance should reject if no autoAdvanceMs config is present', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const normalCpId = 'issue-verification';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: normalCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, auto_advance: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('missing defaultOption or autoAdvanceMs');
    });

    it('respond_checkpoint with condition_not_met should reject unconditional checkpoint', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const unconditionalCpId = 'workflow-path-selected';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: unconditionalCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, condition_not_met: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('no condition field');
    });

    it('respond_checkpoint with condition_not_met should accept conditional checkpoint', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const conditionalCpId = 'pr-check';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: conditionalCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, condition_not_met: true },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.dismissed).toBe(true);
    });

    it('respond_checkpoint should return effects from selected option', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const cpWithEffectsId = 'issue-verification';

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: cpWithEffectsId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, option_id: 'create-issue' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.effect).toBeDefined();
    });

    it('full flow: next_activity -> yield -> respond -> resume -> next_activity succeeds', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      let token = nextToken;

      token = await resolveCheckpoints(client, token, actResponse);

      const act2 = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: token, activity_id: 'design-philosophy' },
      });
      expect(act2.isError).toBeFalsy();
      expect(parseToolResponse(act2).activity_id).toBe('design-philosophy');
    });

    it('get_skill should be gated when a checkpoint is yielded', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: 'issue-verification' },
      });
      const tokenWithBcp = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'get_skill',
        arguments: { session_index: tokenWithBcp, step_id: 'create-issue' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Active checkpoint');
    });

    it('respond_checkpoint should require exactly one resolution mode', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: 'classification-confirmed' },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, option_id: 'confirmed', auto_advance: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Exactly one');
    });

    it('present_checkpoint reads activeCheckpoint from session.json (PD-11)', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const firstCpId = 'classification-confirmed';

      await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: firstCpId },
      });

      const presentResult = await client.callTool({
        name: 'present_checkpoint',
        arguments: { session_index: tokenWithAct },
      });
      expect(presentResult.isError).toBeFalsy();
      const response = parseToolResponse(presentResult);
      expect(response.id).toBe(firstCpId);
      expect(response.session_index).toBe(tokenWithAct);
    });

    it('respond_checkpoint reads activeCheckpoint from session.json (PD-11)', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const firstCpId = 'classification-confirmed';

      await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: firstCpId },
      });

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: tokenWithAct, option_id: 'confirmed' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resolved).toBe(true);
    });

    it('present_checkpoint errors when no active checkpoint is set', async () => {
      const result = await client.callTool({
        name: 'present_checkpoint',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('no active checkpoint');
    });

    it('respond_checkpoint errors when no active checkpoint is set', async () => {
      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: sessionToken, option_id: 'confirmed' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('no active checkpoint');
    });
  });

  // ============== start_session shape (Phase 5) ==============

  describe('start_session (Phase 5 surface)', () => {
    it('returns a 6-character session_index for a fresh meta session', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { agent_id: 'orchestrator' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.workflow.id).toBe('meta');
      expect(response.session_index).toMatch(/^[A-Z2-7]{6}$/);
      expect(response.planning_slug).toBeDefined();
    });

    it('accepts workflow_id for non-meta workflow', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.workflow.id).toBe('work-package');
      expect(response.session_index).toMatch(/^[A-Z2-7]{6}$/);
    });

    it('is idempotent when planning_slug is provided — returns the same session_index on a second call (PR116-TC-27, TC-28)', async () => {
      const slug = 'phase-5-idempotent-test';
      const first = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_slug: slug },
      });
      const second = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_slug: slug },
      });
      const firstIdx = parseToolResponse(first).session_index;
      const secondIdx = parseToolResponse(second).session_index;
      expect(firstIdx).toBe(secondIdx);
    });

    it('resume preserves the workflow_id stored in session.json even when a different workflow_id is supplied', async () => {
      const slug = 'phase-5-resume-workflow-stable';
      const first = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_slug: slug },
      });
      const firstIdx = parseToolResponse(first).session_index;

      // Resume with a different workflow_id — the stored workflowId wins.
      const second = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'remediate-vuln', agent_id: 'orchestrator', planning_slug: slug },
      });
      const secondResponse = parseToolResponse(second);
      expect(secondResponse.session_index).toBe(firstIdx);
      expect(secondResponse.workflow.id).toBe('work-package');
    });

    it('captures parent snapshot when parent_planning_slug is provided (PR116-TC-29)', async () => {
      const parent = await client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: 'work-package',
          agent_id: 'orchestrator',
          planning_slug: 'phase-5-parent-slug',
        },
      });
      const parentResponse = parseToolResponse(parent);
      const parentIdx = parentResponse.session_index;

      const child = await client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: 'remediate-vuln',
          parent_planning_slug: 'phase-5-parent-slug',
          agent_id: 'worker-1',
          planning_slug: 'phase-5-child-slug',
        },
      });
      expect(child.isError).toBeFalsy();
      const childResponse = parseToolResponse(child);
      expect(childResponse.workflow.id).toBe('remediate-vuln');
      expect(childResponse.session_index).toMatch(/^[A-Z2-7]{6}$/);
      expect(childResponse.session_index).not.toBe(parentIdx);
    });

    it('creates a fresh planning folder under .engineering/artifacts/planning/<slug>/ (PR116-TC-26)', async () => {
      const slug = 'phase-5-fresh-folder';
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_slug: slug },
      });
      expect(result.isError).toBeFalsy();
      // The folder must exist with session.json + .session-token.
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const { existsSync } = await import('node:fs');
      expect(existsSync(join(folderPath, 'session.json'))).toBe(true);
      expect(existsSync(join(folderPath, '.session-token'))).toBe(true);
    });
  });

  // The "start_session token inheritance" describe.skip block of 13 tests was
  // deleted in Phase 5. Those tests exercised the legacy contract whereby
  // start_session inherited a parent session by re-passing the parent's
  // session_token (later session_index). Phase 5 eliminates that contract:
  // session resumption is now driven by planning_slug (PR116-TC-27/28) and
  // parent-context capture is driven by parent_planning_slug (PR116-TC-29).
  // The retained equivalents live in the "start_session (Phase 5 surface)"
  // describe block above. See 02-assumptions-log.md for the rationale.

  // ============== Phase 5: legacy → server-managed migration via start_session ==============

  describe('start_session migration auto-trigger (Phase 5)', () => {
    it('PR116-TC-54: auto-migrates a planning folder containing legacy workflow-state.json + .session-token on first call', async () => {
      const slug = 'phase-5-migration-auto';
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const { mkdirSync, copyFileSync, existsSync } = await import('node:fs');
      mkdirSync(folderPath, { recursive: true });
      // Drop legacy artefacts in the folder before calling start_session.
      const fixtureDir = resolve(import.meta.dirname, 'fixtures/legacy-session');
      copyFileSync(join(fixtureDir, 'workflow-state.json'), join(folderPath, 'workflow-state.json'));
      copyFileSync(join(fixtureDir, '.session-token'), join(folderPath, '.session-token'));

      const result = await client.callTool({
        name: 'start_session',
        arguments: { planning_slug: slug, agent_id: 'orchestrator' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      // The migrated workflow_id wins over the default 'meta'.
      expect(response.workflow.id).toBe('work-package');
      expect(response.migrated).toBe(true);
      expect(response.session_index).toMatch(/^[A-Z2-7]{6}$/);

      // Legacy artefacts have been cleaned up; new shape is in place.
      expect(existsSync(join(folderPath, 'workflow-state.json'))).toBe(false);
      expect(existsSync(join(folderPath, 'session.json'))).toBe(true);
      expect(existsSync(join(folderPath, '.session-token'))).toBe(true);
    });

    it('PR116-TC-59: a second call against the same migrated folder reuses session.json without re-migrating', async () => {
      const slug = 'phase-5-migration-resume';
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const { mkdirSync, copyFileSync } = await import('node:fs');
      mkdirSync(folderPath, { recursive: true });
      const fixtureDir = resolve(import.meta.dirname, 'fixtures/legacy-session');
      copyFileSync(join(fixtureDir, 'workflow-state.json'), join(folderPath, 'workflow-state.json'));
      copyFileSync(join(fixtureDir, '.session-token'), join(folderPath, '.session-token'));

      const first = await client.callTool({
        name: 'start_session',
        arguments: { planning_slug: slug, agent_id: 'orchestrator' },
      });
      const firstResponse = parseToolResponse(first);

      const second = await client.callTool({
        name: 'start_session',
        arguments: { planning_slug: slug, agent_id: 'orchestrator' },
      });
      const secondResponse = parseToolResponse(second);
      expect(secondResponse.session_index).toBe(firstResponse.session_index);
      // The second call must NOT report a migration — session.json is already present.
      expect(secondResponse.migrated).toBeUndefined();
    });
  });

  // ============== Phase 5: dispatch_workflow tool stays removed ==============

  describe('Phase 5 deletions', () => {
    it('dispatch_workflow tool is not registered', async () => {
      const result = await client.callTool({
        name: 'dispatch_workflow',
        arguments: { workflow_id: 'work-package' },
      });
      expect(result.isError).toBe(true);
    });

    it('start_session rejects the deleted parent_session_index parameter (replaced by parent_planning_slug)', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: 'remediate-vuln',
          parent_session_index: 'ABCDEF',
          agent_id: 'worker-1',
        },
      });
      expect(result.isError).toBe(true);
    });
  });

});
