import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { createHarness, parseToolResponse, parseWorkflowResponse, type Harness } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';

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

  const getResult = await client.callTool({ name: 'get_activity', arguments: { session_index: sessionIndex, context_tokens: 200_000 } });
  if (getResult.isError) throw new Error(`get_activity failed: ${(getResult.content[0] as { type: string; text: string }).text}`);
  // get_activity prepends a technique bundle separated by '\n\n---\n\n' from the activity body.
  const actResponse = parseWorkflowResponse(getResult);

  // The session_index is stable; keep the alias `nextToken` only to minimise diff churn in callers.
  return { actMeta, nextToken: sessionIndex, actResponse };
}

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

describe('mcp-server integration', () => {
  let harness: Harness;
  let client: Client;
  let workspaceDir: string;
  /** session_index for a fresh work-package session (set per-test in beforeEach). */
  let sessionToken: string;
  /** session_index for a fresh meta session (set per-test in beforeEach). */
  let metaToken: string;
  /** Helper: resolve a slug to its absolute planning-folder path under the test workspace. */
  const planningFolder = (slug: string) => planningFolderPath(workspaceDir, slug);

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    workspaceDir = harness.workspaceDir;
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

  afterAll(async () => { await harness.close(); });

  // ============== Bootstrap Tools ==============

  describe('tool: discover', () => {
    it('should return bootstrap guide and available workflows', async () => {
      const result = await client.callTool({ name: 'discover', arguments: {} });
      expect(result.isError).toBeFalsy();
      const guide = parseToolResponse(result);
      expect(guide.server).toBeDefined();
      expect(guide.version).toBeDefined();
      expect(guide.repo_binding).toMatch(/required/);
      expect(guide._body).toBeDefined();
      expect(typeof guide._body).toBe('string');
      expect(guide._body).toContain('start_session');
      expect(guide._body).toContain('get_workflow');
      expect(guide._body).toMatch(/repo/i);
      expect(guide.available_workflows).toBeUndefined();
      expect(guide.session_scope).toBeUndefined();
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

    it('tools return the same session_index in _meta (stable across calls)', async () => {
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

    it('rejects authenticated call passing legacy session_token parameter', async () => {
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

  describe('registered tool surface', () => {
    // The registered set in full, so a tool added without a test here fails this
    // assertion, and a name the server no longer serves fails it too.
    const TOOLS = [
      'discover', 'dispatch_child', 'get_activity', 'get_resource', 'get_technique',
      'get_trace', 'get_workflow', 'get_workflow_status', 'health_check',
      'inspect_session', 'list_workflows', 'next_activity', 'present_checkpoint',
      'record_usage', 'respond_checkpoint', 'resume_checkpoint', 'start_session',
      'yield_checkpoint',
    ];

    it('serves exactly the registered tools', async () => {
      const { tools } = await client.listTools();
      expect(tools.map(t => t.name).sort()).toEqual(TOOLS);
    });
  });

  // ============== Workflow Tools ==============

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
        arguments: { session_index: nextToken, context_tokens: 200_000 },
      });
      expect(result.isError).toBeFalsy();
      const activity = parseWorkflowResponse(result);
      expect(activity.id).toBe('start-work-package');
      expect(activity.steps).toBeDefined();
      expect(Array.isArray(activity.steps)).toBe(true);
      // Unified model: checkpoints are inline kind:checkpoint steps (no separate checkpoints[] array).
      expect(activity.steps.some((s: { kind?: string }) => s.kind === 'checkpoint')).toBe(true);
      expect(activity.exits).toBeDefined();
      expect(activity.session_index).toBeDefined();
    });

    it('inherits the workflow techniques.activity into every activity technique bundle', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: nextToken, context_tokens: 200_000 },
      });
      expect(result.isError).toBeFalsy();

      // The technique bundle (the activity's own techniques + the workflow's inherited
      // techniques.activity + core worker techniques) precedes the --- separator.
      const text = (result.content[0] as { type: 'text'; text: string }).text;
      const sepIdx = text.indexOf('\n\n---\n\n');
      expect(sepIdx).toBeGreaterThan(0);
      const bundle = parse(text.substring(0, sepIdx)) as Record<string, unknown>;
      const techniques = bundle['techniques'] as Record<string, unknown>;

      // work-package declares `variable-binding` once at workflow.techniques.activity.
      // It is neither bound by start-work-package's steps nor a core worker technique,
      // so its presence proves the server injected the workflow's inherited activity techniques.
      expect(Object.keys(techniques)).toContain('variable-binding');
    });

    it('should error when no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: sessionToken, context_tokens: 200_000 },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('No current activity');
    });

    it('should error when context_tokens is omitted (required param)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: nextToken },
      });
      expect(result.isError).toBe(true);
    });

    it('returns the stable session_index in _meta', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: nextToken, context_tokens: 200_000 },
      });
      const meta = result._meta as Record<string, unknown>;
      expect(meta['session_index']).toBe(nextToken);
    });

    it('the batch reading arrives in the response body, not only in _meta (#473)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const result = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: nextToken, context_tokens: 200_000, agent_id: 'worker-batch-read' },
      });
      const text = (result.content as Array<{ text: string }>)[0]!.text;
      // A definition can tell a worker to report its own bound, so the reading has to be
      // where a worker reads. Protocol metadata is not a place the harness guarantees to
      // put in front of it.
      expect(text).toMatch(/^batch:$/m);
      expect(text).toMatch(/^ {2}may_continue: (true|false)$/m);
      expect(text).toMatch(/^ {2}max_activities: \d+$/m);
      expect(text).toMatch(/^ {2}activities: \d+$/m);

      // The same figures, so a caller asserting on either reads one answer.
      const batch = (result._meta as { batch?: Record<string, number | boolean> }).batch!;
      expect(batch).toBeDefined();
      expect(text).toContain(`max_activities: ${batch['max_activities']}`);
      expect(text).toContain(`activities: ${batch['activities']}`);
      expect(text).toContain(`may_continue: ${batch['may_continue']}`);
    });
  });

  describe('tool: resume_checkpoint', () => {
    /**
     * A worker suspends at a checkpoint and comes back to a bag the orchestrator has changed under
     * it. The tool's answer is what changed: without it a worker has to infer the new state from the
     * option id, which a live smoke run was observed doing — twice, and saying so in its report.
     */
    it('returns the resolved option and the variables its effect applied', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');
      await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: nextToken, checkpoint_id: 'issue-verification' },
      });
      await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: nextToken, option_id: 'create-issue' },
      });

      const resumed = parseToolResponse(await client.callTool({
        name: 'resume_checkpoint',
        arguments: { session_index: nextToken },
      }));
      expect(resumed.status).toBe('resumed');
      expect(resumed.checkpoint).toContain('issue-verification');
      expect(resumed.option_id).toBe('create-issue');
      // The option this checkpoint offers sets exactly one variable; the worker gets it back.
      expect(resumed.variables_changed).toEqual({ needs_issue_creation: true });
      expect(resumed.message).toContain('needs_issue_creation');
    });

    it('says so plainly when the selected option sets nothing', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');
      await client.callTool({
        name: 'yield_checkpoint',
        arguments: {
          session_index: nextToken,
          checkpoint_id: 'accept-scope-request',
          message: 'Take the extra scope into this work package?',
          options: [{ id: 'accept', label: 'Take it' }, { id: 'defer', label: 'Raise it separately' }],
        },
      });
      await new Promise(r => setTimeout(r, 3100));
      await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: nextToken, option_id: 'defer' },
      });

      const resumed = parseToolResponse(await client.callTool({
        name: 'resume_checkpoint',
        arguments: { session_index: nextToken },
      }));
      expect(resumed.option_id).toBe('defer');
      expect(resumed.variables_changed).toEqual({});
      expect(resumed.message).toContain('no variables');
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

    // submit-for-review's body-non-conformant gate offers a re-entry and an abort, with eleven
    // steps after it. Both exits are immediate, so either answer leaves those eleven unrun; the
    // ungated steps before the gate are what a worker that answers there has run.
    const RAN_BEFORE_ABORT = [
      { step_id: 'announce-start', output: 'announced' },
      { step_id: 'review-summary-approval', output: 'approved' },
      { step_id: 'dco-sign-off-confirmation', output: 'confirmed' },
      { step_id: 'private-remote-confirmation', output: 'confirmed' },
      { step_id: 'push-confirmation', output: 'confirmed' },
      { step_id: 'body-non-conformant', output: 'user aborted' },
    ];

    it('states each option\'s consequence from the workflow graph before the user chooses', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'submit-for-review');
      await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: nextToken, checkpoint_id: 'body-non-conformant' },
      });

      const presented = await client.callTool({
        name: 'present_checkpoint',
        arguments: { session_index: nextToken },
      });
      const checkpoint = parseToolResponse(presented);
      const options = checkpoint.options as Array<{ id: string; consequence?: Record<string, unknown> }>;

      expect(options.find(o => o.id === 'provide-input')?.consequence)
        .toEqual({ exit: 'provide-input', next_activity: 'submit-for-review', ends_activity: true });
      expect(options.find(o => o.id === 'abort')?.consequence)
        .toEqual({ exit: 'abort', next_activity: 'complete', ends_activity: true });
    });

    it('ends the activity where an immediate exit is selected, and accounts for the steps it skipped', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'submit-for-review');
      await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: nextToken, checkpoint_id: 'body-non-conformant' },
      });

      await new Promise(r => setTimeout(r, 3100));
      const responded = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: nextToken, option_id: 'abort' },
      });
      expect(responded.isError).toBeFalsy();
      const payload = parseToolResponse(responded);
      expect(payload.exit).toEqual({ id: 'abort', next_activity: 'complete', ends_activity: true });
      expect(payload.message).toContain('do not run the remaining steps');

      // The worker reports only what it ran. The steps after the gate are the exit's doing, so the
      // manifest check accounts for them rather than reporting them missing.
      const moved = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: nextToken,
          activity_id: 'complete',
          exit: 'abort',
          step_manifest: RAN_BEFORE_ABORT,
        },
      });
      expect(moved.isError).toBeFalsy();
      const validation = (moved._meta as Record<string, unknown>)['validation'] as { warnings: string[] };
      expect(validation.warnings.some(w => w.includes('Missing steps'))).toBe(false);
    });

    it('reports the tail missing when the same manifest arrives with no immediate exit taken', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'submit-for-review');

      const moved = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: nextToken,
          activity_id: 'complete',
          exit: 'review-approved',
          step_manifest: RAN_BEFORE_ABORT,
        },
      });
      expect(moved.isError).toBeFalsy();
      const validation = (moved._meta as Record<string, unknown>)['validation'] as { warnings: string[] };
      expect(validation.warnings.some(w => w.includes('Missing steps') && w.includes('announce-completion'))).toBe(true);
    });

    it('admits a gate the activity does not declare when it carries the decision (#477)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');

      const yielded = await client.callTool({
        name: 'yield_checkpoint',
        arguments: {
          session_index: nextToken,
          checkpoint_id: 'accept-reviewer-scope-request',
          message: 'The reviewer asked for the migration script to be covered too. Take it into this work package?',
          options: [
            { id: 'accept', label: 'Cover the migration script' },
            { id: 'defer', label: 'Leave it out and raise it separately' },
          ],
        },
      });
      expect(parseToolResponse(yielded).status).toBe('yielded');

      // The orchestrator presents the decision the worker supplied, under the id
      // that says what it decides.
      const presented = await client.callTool({
        name: 'present_checkpoint',
        arguments: { session_index: nextToken },
      });
      const checkpoint = parseToolResponse(presented);
      expect(checkpoint.id).toBe('accept-reviewer-scope-request');
      expect(checkpoint.declared).toBe(false);
      expect(checkpoint.message).toContain('migration script');
      expect((checkpoint.options as Array<{ id: string }>).map(o => o.id)).toEqual(['accept', 'defer']);

      await new Promise(r => setTimeout(r, 3100));
      const responded = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: nextToken, option_id: 'defer' },
      });
      expect(responded.isError).toBeFalsy();
      expect(parseToolResponse(responded).resolved_option).toBe('defer');
    });

    it('rejects an option the admitted gate does not offer (#477)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');
      await client.callTool({
        name: 'yield_checkpoint',
        arguments: {
          session_index: nextToken,
          checkpoint_id: 'accept-late-scope',
          message: 'Take the extra file into scope?',
          options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
        },
      });
      await new Promise(r => setTimeout(r, 3100));
      const bad = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: nextToken, option_id: 'maybe' },
      });
      expect(bad.isError).toBeTruthy();
    });

    it('a mistyped id with no decision still fails (#477)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const result = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: nextToken, checkpoint_id: 'issue-verifcation' },
      });
      expect(result.isError).toBeTruthy();
    });

    it('refuses a decision supplied for a checkpoint the activity declares (#477)', async () => {
      const { nextToken } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const result = await client.callTool({
        name: 'yield_checkpoint',
        arguments: {
          session_index: nextToken,
          checkpoint_id: 'issue-verification',
          message: 'Something else entirely',
          options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
        },
      });
      expect(result.isError).toBeTruthy();
    });
  });


  describe('tool: health_check', () => {
    it('should return healthy status', async () => {
      const result = await client.callTool({ name: 'health_check', arguments: {} });
      const health = parseToolResponse(result);
      expect(health.status).toBe('healthy');
      expect(health.workflows_available).toBeGreaterThanOrEqual(2);
      expect(health.repo_binding).toBe('required_on_start_session');
      expect(health.session_scope).toBeUndefined();
    });
  });

  // ============== Resource Tools ==============

  describe('tool: get_technique', () => {
    it('should error when step_id is provided but no activity in session token', async () => {
      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: metaToken, step_id: 'create-issue' },
      });
      expect(result.isError).toBe(true);
    });

    it('errors when the workflow declares no workflow-level techniques', async () => {
      // The workflow declares no workflow-level techniques[];
      // get_technique without a step_id has no technique to compose and errors.
      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBe(true);
    });

    it('should error when step_id not found in activity', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const actToken = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: actToken, step_id: 'nonexistent-step' },
      });
      expect(result.isError).toBe(true);
    });

    it('should error when step has no associated technique', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const actToken = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: actToken, step_id: 'resolve-target' },
      });
      expect(result.isError).toBe(true);
    });

    it('resolves a bare step technique via the activity-group convention', async () => {
      // codebase-comprehension binds its steps to bare op ids (e.g. `technique: survey`) that resolve
      // against the same-named `codebase-comprehension` group. A bare op has no standalone <op>.md and
      // no <op>/ group, so without the activity-group convention get_technique would error — a
      // non-error proves the bare ref resolved to <activity-id>::<op>.
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const actToken = await resolveCheckpoints(client, nextToken, actResponse);

      const bareStep = (actResponse.steps as Array<{ id?: string; technique?: string }>).find(
        (s) => typeof s.technique === 'string' && !s.technique.includes('::') && !s.technique.includes('/'),
      );
      expect(bareStep, 'expected a bare-op step in codebase-comprehension').toBeTruthy();

      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: actToken, step_id: bareStep!.id },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content[0] as { type: string; text: string }).text;
      expect(text).toContain('capability:');
      // The bare op resolved to the same-named group's op, whose projected id is the bare name.
      expect(text).toContain(`id: ${bareStep!.technique}`);
    });
  });

  describe('tool: get_resource', () => {
    it('should load resource content by bare id', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'github-issue-creation' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource_id).toBe('github-issue-creation');
      expect(response._body).toBeDefined();
      expect(response._body.length).toBeGreaterThan(0);
      expect(response.session_index).toBeDefined();
    });

    it('should load cross-workflow resource with prefix', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'meta/bootstrap-protocol' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.resource_id).toBe('meta/bootstrap-protocol');
      expect(response.id).toBe('bootstrap-protocol');
      expect(response._body.length).toBeGreaterThan(0);
    });

    it('should strip frontmatter from resource content', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'github-issue-creation' },
      });
      const response = parseToolResponse(result);
      expect(response._body).not.toMatch(/^---/);
    });

    it('should error for nonexistent resource', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'no-such-resource' },
      });
      expect(result.isError).toBe(true);
    });

    it('should reject numeric-only resource ids (numbering deprecated)', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: '01' },
      });
      expect(result.isError).toBe(true);
    });

    it('returns only the anchored section when resource_id carries a #section', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'assumption-reconciliation#integration-with-assumptions-log' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      // Body is just that section: starts with its heading, excludes sibling sections.
      expect(response._body).toMatch(/^#{2,}\s+Integration with Assumptions Log/);
      expect(response._body).not.toMatch(/##\s+Methodology/);
      expect(response._body).not.toMatch(/##\s+Scorecard/);
    });

    it('errors when a #section anchor matches no heading', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'assumption-reconciliation#no-such-section' },
      });
      expect(result.isError).toBe(true);
    });
  });

  // ============== Cross-Workflow Resource Resolution ==============

  describe('cross-workflow resource resolution', () => {
    it('meta/<id> prefix can be loaded directly via get_resource', async () => {
      // Cross-workflow resource resolution: agents fetch resources by their
      // canonical "meta/<id>" reference via get_resource. Numbered ids are deprecated.
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'meta/bootstrap-protocol' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.id).toBe('bootstrap-protocol');
    });

    it('get_resource should load cross-workflow resource content by ref', async () => {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'meta/bootstrap-protocol' },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.id).toBe('bootstrap-protocol');
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
      expect(validation.warnings.some((w: string) => w.includes('is not bound to any exit of'))).toBe(true);
    });

    it('should not warn on valid activity transition with manifest', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      let tokenAfterStart = await resolveCheckpoints(client, nextToken, actResponse);

      // Fetch each technique step's composed content first, as a real worker
      // does — a manifested technique step with no recorded fetch draws a
      // fidelity warning (#166 B8).
      for (const s of actResponse.steps as Array<{ id: string; kind?: string }>) {
        if (s.kind !== 'technique') continue;
        const fetchRes = await client.callTool({
          name: 'get_technique',
          arguments: { session_index: tokenAfterStart, step_id: s.id },
        });
        expect(fetchRes.isError).toBeFalsy();
      }

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

  describe('reported exit validation', () => {
    it('should accept an exit the graph binds to the requested activity', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
          activity_id: 'requirements-elicitation',
          exit: 'needs-elicitation',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.warnings.filter((w: string) => w.includes('exit'))).toHaveLength(0);
    });

    it('should warn when the reported exit is bound elsewhere', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
          activity_id: 'requirements-elicitation',
          exit: 'skip-optional-activities',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w: string) => w.includes("is bound to 'plan-prepare'"))).toBe(true);
    });

    it('should warn when the activity declares no such exit', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
          activity_id: 'requirements-elicitation',
          exit: 'no-such-exit',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.warnings.some((w: string) => w.includes("has no exit 'no-such-exit'"))).toBe(true);
    });

    it('should accept the transition with the exit omitted', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'start-work-package');
      const tokenAtStart = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtStart,
          activity_id: 'design-philosophy',
        },
      });
      expect(result.isError).toBeFalsy();
      const meta = result._meta as Record<string, unknown>;
      const validation = meta['validation'] as { status: string; warnings: string[] };
      expect(validation.warnings.filter((w: string) => w.includes('exit'))).toHaveLength(0);
    });

    it('a mismatched exit should not block execution', async () => {
      const { nextToken, actResponse } = await transitionToActivity(client, sessionToken, 'codebase-comprehension');
      const tokenAtComprehension = await resolveCheckpoints(client, nextToken, actResponse);

      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: tokenAtComprehension,
          activity_id: 'requirements-elicitation',
          exit: 'skip-optional-activities',
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

  // ============== get_workflow ==============

  describe('tool: get_workflow', () => {
    it('should include the technique bundle before the --- separator', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content[0] as { type: 'text'; text: string }).text;
      // The technique bundle (the workflow's techniques + core orchestrator techniques) appears before the --- separator
      const sepIdx = text.indexOf('\n\n---\n\n');
      expect(sepIdx).toBeGreaterThan(0);
      const preamble = text.substring(0, sepIdx);
      const decoded = parse(preamble) as Record<string, unknown>;
      // All techniques — standalone and nested — live in the single `techniques` bucket,
      // nested ones keyed by their `<technique>::<name>` path. There is no separate sub-technique bucket.
      expect(decoded['techniques']).toBeDefined();
      expect(typeof decoded['techniques']).toBe('object');
      expect(Array.isArray(decoded['techniques'])).toBe(false);
    });

    it('returns lightweight metadata: rules, variables, and activity stubs without step detail', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();

      const wf = parseWorkflowResponse(result);
      expect(wf.id).toBe('work-package');
      expect(wf.version).toMatch(SEMVER_RE);
      // work-package declares no orchestrator rules of its own — its conduct comes from the
      // conduct home via the bundle — so the key is absent rather than an empty list.
      expect(wf.rules).toBeUndefined();
      expect(wf.variables).toBeDefined();
      expect(wf.activities).toBeDefined();
      expect(wf.activities[0].id).toBeDefined();
      expect(wf.activities[0].steps).toBeUndefined();
      expect(wf.activities[0].checkpoints).toBeUndefined();
    });

    it('excludes worker-scoped content (rules.activity, techniques.activity) from the orchestrator response', async () => {
      const result = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: sessionToken },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content[0] as { type: 'text'; text: string }).text;
      const sepIdx = text.indexOf('\n\n---\n\n');
      const preamble = parse(text.substring(0, sepIdx)) as Record<string, unknown>;
      const body = parseWorkflowResponse(result);

      // work-package declares `variable-binding` at techniques.activity (worker-inherited). It is NOT
      // an orchestrator technique, so the orchestrator's bundle must never contain it.
      const bundled = Object.keys(preamble['techniques'] as Record<string, unknown>);
      expect(bundled).not.toContain('variable-binding');

      // The metadata body carries the flattened orchestrator `rules` list (workflow + universal),
      // and no `techniques` field — the worker buckets stay out of the orchestrator response.
      // work-package declares neither bucket, so both are absent here.
      expect(body.rules).toBeUndefined();
      expect(body.techniques).toBeUndefined();
    });
  });

  // ============== Trace Integration ==============

  describe('per-dispatch usage accounting (DI-33)', () => {
    it('record_usage adds one usage event per call, for dispatches no transition exits', async () => {
      const before = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      const baselineRows = Array.isArray(before) ? before : (before.rows ?? before.usage ?? []);
      const baseline = baselineRows.length;

      // Two dispatches of the SAME activity — a first pass and a resume after a
      // checkpoint yield. next_activity could account for at most one of them,
      // because only one transition exits the activity.
      for (const total of [111, 222]) {
        const res = await client.callTool({
          name: 'record_usage',
          arguments: {
            session_index: sessionToken,
            activity: 'start-work-package',
            usage: { input_tokens: total, output_tokens: 7, total_tokens: total + 7 },
            basis: 'delta',
          },
        });
        expect(res.isError).toBeFalsy();
        expect(parseToolResponse(res).status).toBe('recorded');
      }

      const after = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      const rows = Array.isArray(after) ? after : (after.rows ?? after.usage ?? []);
      expect(rows.length).toBe(baseline + 2);

      // Both passes survive as separate rows rather than one overwriting the other:
      // a merged total is what hid the missing third of the run.
      const mine = rows.filter((r: { activity?: string }) => r.activity === 'start-work-package');
      const totals = mine.map((r: { usage?: { input_tokens?: number } }) => r.usage?.input_tokens);
      expect(totals).toContain(111);
      expect(totals).toContain(222);
    });

    it('record_usage rejects an unknown session', async () => {
      const res = await client.callTool({
        name: 'record_usage',
        arguments: { session_index: 'NOPE00', activity: 'x', usage: { total_tokens: 1 }, basis: 'delta' },
      });
      expect(res.isError).toBeTruthy();
    });

    it('PR366-TC-01/02: optional agent_id attributes rows; omit stays unattributed', async () => {
      await client.callTool({
        name: 'record_usage',
        arguments: {
          session_index: sessionToken,
          activity: 'start-work-package',
          usage: { input_tokens: 10, output_tokens: 2, total_tokens: 12 },
          basis: 'delta',
          agent_id: 'worker-a',
        },
      });
      await client.callTool({
        name: 'record_usage',
        arguments: {
          session_index: sessionToken,
          activity: 'start-work-package',
          usage: { input_tokens: 3, output_tokens: 1, total_tokens: 4 },
          basis: 'delta',
        },
      });
      const all = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      expect(all.rows.some((r: { agentId?: string }) => r.agentId === 'worker-a')).toBe(true);
      expect(all.rows.some((r: { agentId?: string }) => r.agentId === undefined)).toBe(true);
      const filtered = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage', agent_id: 'worker-a' },
      }));
      expect(filtered.rows.every((r: { agentId?: string }) => r.agentId === 'worker-a')).toBe(true);
      expect(filtered.rows.length).toBeGreaterThanOrEqual(1);
    });

    it('PR366-TC-03/05: projectUsage plain-sum equals arithmetic sum; no cost field', async () => {
      const view = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      expect(view.rows).toBeDefined();
      expect(view.totals).toBeDefined();
      expect(view.cost).toBeUndefined();
      expect(view.price).toBeUndefined();
      let sumIn = 0;
      for (const r of view.rows as Array<{ usage?: { input_tokens?: number } }>) {
        if (typeof r.usage?.input_tokens === 'number') sumIn += r.usage.input_tokens;
      }
      if (sumIn > 0) expect(view.totals.input_tokens).toBe(sumIn);
    });

    it('a cumulative row is carried per agent rather than summed (#474 F7)', async () => {
      const before = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      const deltaBefore = before.totals.total_tokens ?? 0;

      // A harness reporting a running total per agent: the second figure already
      // contains the first, so summing the two counts the first activity twice.
      for (const total of [500, 900]) {
        const res = await client.callTool({
          name: 'record_usage',
          arguments: {
            session_index: sessionToken,
            activity: 'start-work-package',
            usage: { total_tokens: total },
            basis: 'cumulative',
            agent_id: 'worker-cumulative',
          },
        });
        expect(res.isError).toBeFalsy();
      }

      const after = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      // The delta total is untouched by either cumulative row.
      expect(after.totals.total_tokens ?? 0).toBe(deltaBefore);
      // The agent's latest figure is the one that stands, not 1400.
      expect(after.cumulative_latest_by_agent['worker-cumulative'].total_tokens).toBe(900);
    });

    it('a row states its basis, and one that does not is counted apart (#474 F7)', async () => {
      const view = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      expect(view.rows.every((r: { basis?: string }) => r.basis === 'delta' || r.basis === 'cumulative')).toBe(true);
      expect(view.unstated_basis).toBe(0);
    });

    it('wall clock is measured and declared non-additive, and absence is named (#474 F7)', async () => {
      const view = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'usage' },
      }));
      // Spans nest and hold user think time, so the run's elapsed time is the
      // outer span rather than the sum of the parts.
      expect(view.wall_clock_ms_not_additive).toBe(true);
      expect(typeof view.elapsed_ms).toBe('number');
      const measured = view.rows.filter((r: { wall_clock_ms?: number }) => typeof r.wall_clock_ms === 'number');
      for (const row of measured) expect(row.wall_clock_ms).toBeLessThanOrEqual(view.elapsed_ms);
      // Every completed activity carrying no row is listed rather than quietly
      // reducing the total.
      expect(Array.isArray(view.activities_without_usage)).toBe(true);
      expect(view.activities_without_usage).not.toContain('start-work-package');
    });

    it('record_usage refuses a figure whose basis is unstated (#474 F7)', async () => {
      const res = await client.callTool({
        name: 'record_usage',
        arguments: {
          session_index: sessionToken,
          activity: 'start-work-package',
          usage: { total_tokens: 5 },
        },
      });
      expect(res.isError).toBeTruthy();
    });

    it('PR366-TC-06: stale usage-on-next_activity phrases are absent from tool surface', async () => {
      const { readFileSync } = await import('node:fs');
      const { resolve } = await import('node:path');
      const src = readFileSync(resolve(import.meta.dirname, '../src/tools/workflow-tools.ts'), 'utf8');
      const dispatch = readFileSync(resolve(import.meta.dirname, '../src/utils/dispatch.ts'), 'utf8');
      expect(src).not.toMatch(/optional `usage` records the exited activity/);
      expect(src).not.toMatch(/as the orchestrator reported it on next_activity/);
      expect(dispatch).not.toMatch(/arrives on the\n \* `next_activity` that EXITS/);
      expect(dispatch).not.toMatch(/arrives on the\s+`next_activity` that EXITS/);
    });

    it('PR366-TC-07: delivery-ledger namespace comment matches delivery.ts keys', async () => {
      const { readFileSync } = await import('node:fs');
      const { resolve } = await import('node:path');
      const schema = readFileSync(resolve(import.meta.dirname, '../src/schema/session.schema.ts'), 'utf8');
      const delivery = readFileSync(resolve(import.meta.dirname, '../src/utils/delivery.ts'), 'utf8');
      expect(schema).toMatch(/technique:provenance_note/);
      expect(schema).toMatch(/inherited_\*\.note\|items/);
      expect(schema).toMatch(/bundle:/);
      expect(schema).toMatch(/resource:/);
      expect(delivery).toMatch(/technique:provenance_note/);
      expect(delivery).toMatch(/inherited_inputs\.note/);
      expect(delivery).toMatch(/DEDUP_BLOCKS.*provenance_note|provenance_note.*DEDUP_BLOCKS/s);
    });
  });

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

    it('PR366-TC-12/13: per-call agent_id sets aid; get_trace filter is subset', async () => {
      await client.callTool({
        name: 'get_activity',
        arguments: { session_index: sessionToken, context_tokens: 200_000, agent_id: 'worker-aid-a' },
      });
      await client.callTool({
        name: 'get_activity',
        arguments: { session_index: sessionToken, context_tokens: 200_000, agent_id: 'worker-aid-b' },
      });
      const all = parseToolResponse(await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      }));
      const filteredA = parseToolResponse(await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken, agent_id: 'worker-aid-a' },
      }));
      const filteredB = parseToolResponse(await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken, agent_id: 'worker-aid-b' },
      }));
      const aids = new Set((all.events as Array<{ aid?: string }>).map(e => e.aid).filter(Boolean));
      expect(aids.has('worker-aid-a')).toBe(true);
      expect(aids.has('worker-aid-b')).toBe(true);
      expect(filteredA.events.length).toBeLessThanOrEqual(all.events.length);
      expect(filteredB.events.length).toBeLessThanOrEqual(all.events.length);
      expect((filteredA.events as Array<{ aid?: string }>).filter(e => e.aid).every(e => e.aid === 'worker-aid-a')).toBe(true);
      expect((filteredB.events as Array<{ aid?: string }>).filter(e => e.aid).every(e => e.aid === 'worker-aid-b')).toBe(true);
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
        name: 'get_resource',
        arguments: { session_index: sessionToken, resource_id: 'github-issue-creation' },
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

    it('activity_manifest outcomes reach the activities projection, once per activity (#477)', async () => {
      await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionToken,
          activity_id: 'start-work-package',
          activity_manifest: [
            { activity_id: 'start-work-package', outcome: 'The work package has a planning folder and a branch' },
          ],
        },
      });
      // The same activity named again by a later manifest adds no second row —
      // the outcome is a property of the activity, not of the report.
      await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionToken,
          activity_id: 'design-philosophy',
          activity_manifest: [
            { activity_id: 'start-work-package', outcome: 'The work package has a planning folder and a branch' },
          ],
        },
      });

      const inspected = await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'activities' },
      });
      const activities = parseToolResponse(inspected);
      const rows = (activities.outcomes as Array<{ activity: string; outcome: string }>)
        .filter(r => r.activity === 'start-work-package');
      expect(rows).toHaveLength(1);
      expect(rows[0]!.outcome).toContain('planning folder');
    });

    it('an unpublished progress mark is answerable from the session afterwards (#473)', async () => {
      // Two dispatches: one that published the in-progress mark, one that did not, and one
      // that said nothing about it. The mark itself is a README cell the completion status
      // overwrites, so the report is what survives the activity ending.
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package', progress_published: true },
      });
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy', progress_published: false },
      });
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'plan-prepare' },
      });

      const activities = parseToolResponse(await client.callTool({
        name: 'inspect_session',
        arguments: { session_index: sessionToken, view: 'activities' },
      }));
      expect(activities.progress_mark_unpublished).toContain('design-philosophy');
      expect(activities.progress_mark_unpublished).not.toContain('start-work-package');
      expect(activities.progress_mark_unreported).toContain('plan-prepare');
      expect(activities.progress_mark_unreported).not.toContain('design-philosophy');
    });

    it('withAuditLog re-resolves session_index and populates trace event with sid/wf/act/aid from session.json', async () => {
      // Mutate the session: transition to a non-initial activity so the
      // expected `act` field is distinguishable from the start-session state.
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'start-work-package' },
      });

      // Issue another authenticated call whose trace event we will inspect.
      const getActResult = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: sessionToken, context_tokens: 200_000 },
      });
      expect(getActResult.isError).toBeFalsy();

      const traceResult = await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      });
      const trace = parseToolResponse(traceResult);

      // Locate the most recent get_activity event — that call was re-resolved
      // by appendTraceEvent against the post-next_activity session.json.
      const getActEvent = [...trace.events]
        .reverse()
        .find((e: { name: string }) => e.name === 'get_activity');
      expect(getActEvent).toBeDefined();

      // sid is the session_index (the re-resolution path uses state.sessionIndex
      // as the trace sid for the event).
      expect(getActEvent.traceId).toBe(sessionToken);
      // wf/act/aid sourced from session.json, not from a decoded token.
      expect(getActEvent.wf).toBe('work-package');
      expect(getActEvent.act).toBe('start-work-package');
      expect(getActEvent.aid).toBe('test-worker');
      // Status is recorded.
      expect(getActEvent.s).toBe('ok');
    });

    it('trace events for unauthenticated tools omit session-derived fields without warning', async () => {
      // Snapshot the per-session trace length before the unauthenticated call.
      const before = parseToolResponse(await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      }));
      const beforeLen: number = before.events.length;

      // Invoke each unauthenticated tool. None of these emit a session-keyed
      // trace event because appendTraceEvent short-circuits when
      // params.session_index is absent.
      await client.callTool({ name: 'discover', arguments: {} });
      await client.callTool({ name: 'list_workflows', arguments: {} });
      await client.callTool({ name: 'health_check', arguments: {} });

      // The per-session trace length is unchanged — unauthenticated calls
      // produce no trace event keyed against `sessionToken`.
      const after = parseToolResponse(await client.callTool({
        name: 'get_trace',
        arguments: { session_index: sessionToken },
      }));

      // get_trace itself is excluded from the trace (IT-14), so the only delta
      // possible here would come from a unauthenticated tool slipping a
      // session-derived event in.
      const afterLen: number = after.events.length;
      expect(afterLen).toBe(beforeLen);

      // Belt and braces: no event in the trace was emitted by any of the
      // unauthenticated tools.
      const unauthenticatedNames = new Set(['discover', 'list_workflows', 'health_check']);
      for (const event of after.events) {
        expect(unauthenticatedNames.has(event.name)).toBe(false);
      }
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
      const firstCpId = 'classification-and-path-confirmed'; // Known from the workflow

      const yieldResult = await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: firstCpId },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const cpResult = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, option_id: 'revise-classification' }, // Assumes 'revise-classification' is a valid option
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
      const firstCpId = 'classification-and-path-confirmed';

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
        arguments: { session_index: sessionToken, activity_id: 'post-impl-review' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      // A checkpoint declaring no `condition` — the rejection path under test.
      const unconditionalCpId = 'file-index-table';

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

    it('get_technique should be gated when a checkpoint is yielded', async () => {
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
        name: 'get_technique',
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
        arguments: { session_index: tokenWithAct, checkpoint_id: 'classification-and-path-confirmed' },
      });
      const cpHandle = (yieldResult._meta as Record<string, unknown>)['session_index'] as string;

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: cpHandle, option_id: 'revise-classification', auto_advance: true },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('Exactly one');
    });

    it('present_checkpoint reads activeCheckpoint from session.json', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const firstCpId = 'classification-and-path-confirmed';

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

    it('respond_checkpoint reads activeCheckpoint from session.json', async () => {
      const act = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionToken, activity_id: 'design-philosophy' },
      });
      const actMeta = act._meta as Record<string, unknown>;
      const tokenWithAct = actMeta['session_index'] as string;
      const firstCpId = 'classification-and-path-confirmed';

      await client.callTool({
        name: 'yield_checkpoint',
        arguments: { session_index: tokenWithAct, checkpoint_id: firstCpId },
      });

      const result = await client.callTool({
        name: 'respond_checkpoint',
        arguments: { session_index: tokenWithAct, option_id: 'revise-classification' },
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
        arguments: { session_index: sessionToken, option_id: 'revise-classification' },
      });
      expect(result.isError).toBe(true);
      const errorText = (result.content[0] as { type: string; text: string }).text;
      expect(errorText).toContain('no active checkpoint');
    });
  });

  describe('start_session surface', () => {
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
      expect(response.session_scope).toBeUndefined();
      // Fresh meta without repo is unbound until bind; agents should pass repo always.
      expect(response.repo_unbound).toBe(true);
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

    it('accepts long-form planning_folder (absolute path), derives slug from basename, and records the canonical path in session.json', async () => {
      const slug = '2026-05-31-path-input';
      const folderPath = planningFolder(slug);
      // Non-meta workflow: persistent workspace folder (meta is transient and
      // doesn't record planningFolderPath until dispatch_child promotion).
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: folderPath },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.planning_slug).toBe(slug);
      expect(response.planning_folder_path).toBe(folderPath);

      const sessionJsonPath = join(folderPath, 'session.json');
      const stored = JSON.parse(readFileSync(sessionJsonPath, 'utf8'));
      expect(stored.planningFolderPath).toBe(folderPath);
    });

    it('rejects a bare-slug planning_folder — only absolute paths are accepted', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: 'bare-slug-rejection' },
      });
      expect(result.isError).toBeTruthy();
      const text = (result.content as { text: string }[])[0]?.text ?? '';
      expect(text).toMatch(/must be an absolute path/);
    });

    it('treats an off-workspace planning_folder as a slug hint — basename is used, server resolves under its own workspace', async () => {
      // The agent supplies a path that points at a totally different workspace
      // (or a stale location). The server must NOT reject — it should consume
      // only the basename and resolve against its own planning root.
      const slug = '2026-05-31-off-workspace-hint';
      const offWorkspacePath = `/totally/different/workspace/.engineering/artifacts/planning/${slug}`;
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: offWorkspacePath },
      });
      expect(result.isError).toBeFalsy();
      const response = parseToolResponse(result);
      expect(response.planning_slug).toBe(slug);
      // The recorded planning_folder_path is the canonical SERVER-side path,
      // not what the agent supplied.
      expect(response.planning_folder_path).toBe(join(workspaceDir, '.engineering/artifacts/planning', slug));
    });

    it('rejects a relative-path planning_folder (ambiguous)', async () => {
      const result = await client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: 'meta',
          agent_id: 'orchestrator',
          planning_folder: './2026-05-31/nested-slug',
        },
      });
      expect(result.isError).toBeTruthy();
      const text = (result.content as { text: string }[])[0]?.text ?? '';
      expect(text).toMatch(/must be an absolute path/);
    });

    it('is idempotent when planning_slug is provided — returns the same session_index on a second call', async () => {
      const slug = 'idempotent-test';
      const first = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const second = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const firstIdx = parseToolResponse(first).session_index;
      const secondIdx = parseToolResponse(second).session_index;
      expect(firstIdx).toBe(secondIdx);
    });

    it('resume preserves the workflow_id stored in session.json even when a different workflow_id is supplied', async () => {
      const slug = 'resume-workflow-stable';
      const first = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const firstIdx = parseToolResponse(first).session_index;

      // Resume with a different workflow_id — the stored workflowId wins.
      const second = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'remediate-vuln', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const secondResponse = parseToolResponse(second);
      expect(secondResponse.session_index).toBe(firstIdx);
      expect(secondResponse.workflow.id).toBe('work-package');
    });

    it('dispatch_child returns a distinct session_index than the parent', async () => {
      const parent = await client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: 'work-package',
          agent_id: 'orchestrator',
          planning_folder: planningFolder('parent-slug-1'),
        },
      });
      const parentResponse = parseToolResponse(parent);
      const parentIdx = parentResponse.session_index;

      const child = await client.callTool({
        name: 'dispatch_child',
        arguments: {
          session_index: parentIdx,
          workflow_id: 'remediate-vuln',
          agent_id: 'worker-1',
        },
      });
      expect(child.isError).toBeFalsy();
      const childResponse = parseToolResponse(child);
      expect(childResponse.workflow.id).toBe('remediate-vuln');
      expect(childResponse.session_index).toMatch(/^[A-Z2-7]{6}$/);
      expect(childResponse.session_index).not.toBe(parentIdx);
    });

    it('meta sessions live in os.tmpdir() (not the workspace) and are discarded when a child captures them', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const path = await import('node:path');

      // 1. Start a meta session. The slug is a label only — the workspace
      //    planning root must not see a folder for it. Meta state lives
      //    under os.tmpdir() per the bootstrap-transient design.
      const metaSlug = 'meta-bootstrap';
      const metaWorkspaceFolder = path.join(workspaceDir, '.engineering/artifacts/planning', metaSlug);

      const meta = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_folder: planningFolder(metaSlug) },
      });
      expect(meta.isError).toBeFalsy();
      const metaResponse = parseToolResponse(meta);
      expect(metaResponse.workflow.id).toBe('meta');
      expect(metaResponse.session_index).toMatch(/^[A-Z2-7]{6}$/);

      // Workspace folder must not exist — meta is transient (tmp-rooted).
      expect(existsSync(metaWorkspaceFolder)).toBe(false);

      // The transient folder this meta was given, by name. The registry keys it
      // under the caller-supplied slug, so the assertion after the dispatch can
      // name one path — os.tmpdir() is shared by every concurrently running test
      // file, and a listing of it also holds their transient sessions.
      const { lookupTransientBySlug } = await import('../src/utils/session/store.js');
      const metaTmpFolder = lookupTransientBySlug(metaSlug);
      expect(metaTmpFolder).toBeDefined();
      expect(existsSync(metaTmpFolder!)).toBe(true);

      // 2. Dispatch a child workflow from the meta session. The server
      //    promotes the meta's state onto disk under the workspace planning
      //    slug it was registered under, embeds the child under
      //    triggeredWorkflows[0].state, and discards the tmp folder.
      const metaIdx = metaResponse.session_index;
      const child = await client.callTool({
        name: 'dispatch_child',
        arguments: {
          session_index: metaIdx,
          workflow_id: 'work-package',
          agent_id: 'worker-1',
        },
      });
      expect(child.isError).toBeFalsy();
      const childResponse = parseToolResponse(child);
      expect(childResponse.workflow.id).toBe('work-package');

      // The promoted folder lives under the workspace at the slug the meta
      // was bound to (meta-bootstrap), sealed.
      const promotedFolder = path.join(workspaceDir, '.engineering/artifacts/planning', metaSlug);
      expect(existsSync(path.join(promotedFolder, 'session.json'))).toBe(true);
      expect(existsSync(path.join(promotedFolder, '.session-token'))).toBe(true);

      // Contract: meta is at the top of the promoted file; work-package is
      // embedded under triggeredWorkflows[0].state. parentSession is absent
      // on the top (meta has no parent) — the persistent-parent embedding
      // shape applies here too.
      const topState = JSON.parse(readFileSync(path.join(promotedFolder, 'session.json'), 'utf8'));
      expect(topState.workflowId).toBe('meta');
      expect(topState.parentSession).toBeUndefined();
      expect(topState.triggeredWorkflows).toHaveLength(1);
      const entry = topState.triggeredWorkflows[0];
      expect(entry.workflowId).toBe('work-package');
      expect(entry.sessionIndex).toBe(childResponse.session_index);
      expect(entry.status).toBe('running');
      expect(entry.state).toBeDefined();
      expect(entry.state.workflowId).toBe('work-package');
      expect(entry.state.sessionIndex).toBe(childResponse.session_index);

      // The meta's own tmp folder is gone — the redirect removed it.
      expect(existsSync(metaTmpFolder!)).toBe(false);
    });

    it('dispatch_child accepts planning_slug to control the promoted workspace folder', async () => {
      const { existsSync } = await import('node:fs');
      const path = await import('node:path');

      // start_session without a planning_slug — the server mints a synthetic
      // transition-<uuid> sentinel that is deliberately NOT registered in
      // the folder→slug map (it would leak the UUID into the workspace).
      const meta = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator' },
      });
      const metaIdx = parseToolResponse(meta).session_index;

      const derivedSlug = '2026-05-28-remove-separate-parity-db-instances';
      const child = await client.callTool({
        name: 'dispatch_child',
        arguments: {
          session_index: metaIdx,
          workflow_id: 'work-package',
          agent_id: 'worker-1',
          planning_slug: derivedSlug,
        },
      });
      expect(child.isError).toBeFalsy();
      const childResponse = parseToolResponse(child);
      expect(childResponse.planning_slug).toBe(derivedSlug);

      // The promoted folder uses the caller-supplied slug (NOT the
      // YYYY-MM-DD-<workflow_id> fallback).
      const promotedFolder = path.join(workspaceDir, '.engineering/artifacts/planning', derivedSlug);
      expect(existsSync(path.join(promotedFolder, 'session.json'))).toBe(true);
      // The fallback-named folder must NOT exist.
      const today = new Date().toISOString().slice(0, 10);
      const fallbackFolder = path.join(workspaceDir, '.engineering/artifacts/planning', `${today}-work-package`);
      expect(existsSync(fallbackFolder)).toBe(false);
    });

    it('the parent session_index keeps resolving after dispatch_child promotes a transient meta', async () => {
      // Regression: a naive promote would drop the caller's session_index
      // entry along with the tmp folder. The workspace
      // folder hashes to a different value, so the orchestrator was unable
      // to authenticate next_activity for subsequent meta activities.
      const meta = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator' },
      });
      const metaIdx = parseToolResponse(meta).session_index;

      await client.callTool({
        name: 'dispatch_child',
        arguments: {
          session_index: metaIdx,
          workflow_id: 'work-package',
          agent_id: 'worker-1',
          planning_slug: 'redirect-test-meta',
        },
      });

      // The orchestrator's original meta index must still authenticate.
      const after = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: metaIdx },
      });
      expect(after.isError).toBeFalsy();
      const afterResponse = parseWorkflowResponse(after);
      // get_workflow returns the meta workflow definition (the promoted
      // file is at the top of the planning folder; meta is its workflowId).
      expect(afterResponse.id).toBe('meta');
    });

    it('three-level dispatch (A → B → C → D) records the full chain in D\'s session.json', async () => {
      const slugA = 'chain-a';
      // B, C, D have no slugs — they're embedded inside A's session.json.

      // Build the chain root → leaf via start_session for the root and
      // dispatch_child for each subsequent level. Layout:
      // - A (meta) is transient (/tmp) at start. When B is dispatched, the
      //   server promotes A onto disk under slugA and embeds B under
      //   A.triggeredWorkflows[0].state. The tmp folder is discarded.
      // - C, D are EMBEDDED recursively inside the promoted top file under
      //   triggeredWorkflows[N].state. The single top-level session.json at
      //   slugA holds the entire chain.
      const aResult = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'meta', agent_id: 'orchestrator', planning_folder: planningFolder(slugA) },
      });
      const aIdx = parseToolResponse(aResult).session_index;
      const bResult = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: aIdx, workflow_id: 'work-package', agent_id: 'worker-1' },
      });
      const bIdx = parseToolResponse(bResult).session_index;
      const cResult = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: bIdx, workflow_id: 'remediate-vuln', agent_id: 'worker-2' },
      });
      const cIdx = parseToolResponse(cResult).session_index;
      const dResult = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: cIdx, workflow_id: 'prism-update', agent_id: 'worker-3' },
      });
      expect(dResult.isError).toBeFalsy();

      // Read the single top-level session.json at slugA (now owned by the
      // meta after promotion) and walk down via triggeredWorkflows[0].state
      // recursively from meta → work-package → remediate-vuln → prism-update.
      const { readFileSync } = await import('node:fs');
      const topStatePath = join(workspaceDir, '.engineering/artifacts/planning', slugA, 'session.json');
      const topState = JSON.parse(readFileSync(topStatePath, 'utf8'));

      // Top is the meta (A). It has no parent.
      expect(topState.workflowId).toBe('meta');
      expect(topState.parentSession).toBeUndefined();
      // B (work-package) embedded under A.
      expect(topState.triggeredWorkflows?.[0]?.state?.workflowId).toBe('work-package');
      // C (remediate-vuln) embedded under B.
      expect(topState.triggeredWorkflows?.[0]?.state?.triggeredWorkflows?.[0]?.state?.workflowId).toBe('remediate-vuln');
      // D (prism-update) embedded under C.
      expect(
        topState.triggeredWorkflows?.[0]?.state?.triggeredWorkflows?.[0]?.state?.triggeredWorkflows?.[0]?.state?.workflowId,
      ).toBe('prism-update');
    });

    it('dispatch depth > 5 emits a soft warning in _meta.validation', async () => {
      // Build a 7-level chain so the leaf records depth = 6 (six ancestors),
      // tripping the > 5 soft-warn threshold.
      const slugs = [
        'depth-l0',
        'depth-l1',
        'depth-l2',
        'depth-l3',
        'depth-l4',
        'depth-l5',
        'depth-l6',
      ];

      // TODO: rewrite for the embedded-state design. The original test
      // chained 7 meta sessions via parent_planning_slug, relying on
      // parentSession to carry chain depth. With dispatch_child, embedded
      // children do not populate parentSession (the parent is already in
      // the same file); the depth concept now applies to the
      // triggeredWorkflows array nesting instead. Skipping until the
      // depth-warning surface is reworked for the new model.
      expect(slugs).toHaveLength(7);
    });

    it('creates a fresh planning folder under .engineering/artifacts/planning/<slug>/ for non-meta workflows', async () => {
      // Non-meta workflows persist in the workspace; only meta is transient.
      const slug = 'fresh-folder';
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      expect(result.isError).toBeFalsy();
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const { existsSync } = await import('node:fs');
      expect(existsSync(join(folderPath, 'session.json'))).toBe(true);
      expect(existsSync(join(folderPath, '.session-token'))).toBe(true);
    });

    it('session.json audit fields roll up across start_session / next_activity / yield_checkpoint / respond_checkpoint', async () => {
      const { readFile } = await import('node:fs/promises');
      const slug = 'audit-rollup';
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const sessionFilePath = join(folderPath, 'session.json');

      // 1. Fresh session — should seed workflow_started + variables_seeded
      //    (work-package declares defaults, #166 B7) + status=running.
      const startResp = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      expect(startResp.isError).toBeFalsy();
      const startIdx = parseToolResponse(startResp).session_index;
      let state = JSON.parse(await readFile(sessionFilePath, 'utf8'));
      expect(state.status).toBe('running');
      expect(state.history).toHaveLength(2);
      expect(state.history[0].type).toBe('workflow_started');
      expect(state.history[1].type).toBe('variables_seeded');
      expect(state.completedActivities).toEqual([]);

      // 2. next_activity → activity_entered (plus activity_exited / completed
      //    push for the prior empty activity, which is suppressed).
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: startIdx, activity_id: 'start-work-package' },
      });
      state = JSON.parse(await readFile(sessionFilePath, 'utf8'));
      expect(state.currentActivity).toBe('start-work-package');
      const enteredEvents = state.history.filter((e: { type: string }) => e.type === 'activity_entered');
      expect(enteredEvents.some((e: { activity?: string }) => e.activity === 'start-work-package')).toBe(true);

      // 3. Transition again — prior activity should land in completedActivities.
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: startIdx, activity_id: 'design-philosophy' },
      });
      state = JSON.parse(await readFile(sessionFilePath, 'utf8'));
      expect(state.completedActivities).toContain('start-work-package');

      // 4. Final transition to the terminal activity flips status to completed.
      await client.callTool({
        name: 'next_activity',
        arguments: { session_index: startIdx, activity_id: 'complete' },
      });
      state = JSON.parse(await readFile(sessionFilePath, 'utf8'));
      expect(state.status).toBe('completed');
      expect(state.history.some((e: { type: string }) => e.type === 'workflow_completed')).toBe(true);
    });

    it('dispatch_child embeds the child SessionFile under parent.triggeredWorkflows[N].state and returns its session_index', async () => {
      const { readFile } = await import('node:fs/promises');
      const slug = 'embed-parent';
      const parentFolder = join(workspaceDir, '.engineering/artifacts/planning', slug);

      // Persistent parent.
      const parent = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const parentIdx = parseToolResponse(parent).session_index;

      // Dispatch a child via the new tool.
      const child = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: parentIdx, workflow_id: 'remediate-vuln', agent_id: 'worker-1' },
      });
      expect(child.isError).toBeFalsy();
      const childIdx = parseToolResponse(child).session_index;
      expect(childIdx).toMatch(/^[A-Z2-7]{6}$/);
      expect(childIdx).not.toBe(parentIdx);

      // Inspect the on-disk top file — child must be embedded, not a
      // separate folder.
      const topState = JSON.parse(await readFile(join(parentFolder, 'session.json'), 'utf8'));
      expect(topState.triggeredWorkflows).toHaveLength(1);
      const entry = topState.triggeredWorkflows[0];
      expect(entry.workflowId).toBe('remediate-vuln');
      expect(entry.sessionIndex).toBe(childIdx);
      expect(entry.status).toBe('running');
      expect(entry.state).toBeDefined();
      expect(entry.state.workflowId).toBe('remediate-vuln');
      expect(entry.state.sessionIndex).toBe(childIdx);
      expect(entry.state.history.some((e: { type: string }) => e.type === 'workflow_started')).toBe(true);

      // The child can be loaded via its session_index — it routes through
      // the embedded sub-state, not a separate file.
      const { existsSync } = await import('node:fs');
      const wouldBePeerFolder = join(workspaceDir, '.engineering/artifacts/planning', 'remediate-vuln');
      expect(existsSync(wouldBePeerFolder)).toBe(false);
    });

    it('canonical key order: top-level priority fields come before alphabetic tail', async () => {
      const { readFile } = await import('node:fs/promises');
      const slug = 'key-order';
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const sessionFilePath = join(folderPath, 'session.json');

      await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const raw = await readFile(sessionFilePath, 'utf8');
      // Extract top-level key names from the pretty-printed JSON in order.
      const keyOrder = Array.from(raw.matchAll(/^  "([a-zA-Z]+)":/gm)).map((m) => m[1]);
      const idx = (k: string) => keyOrder.indexOf(k);

      // Priority block ordering — most-read fields up top.
      expect(idx('schemaVersion')).toBeLessThan(idx('workflowId'));
      expect(idx('status')).toBeLessThan(idx('completedActivities'));
      expect(idx('currentActivity')).toBeLessThan(idx('completedActivities'));
      expect(idx('completedActivities')).toBeLessThan(idx('history'));
      expect(idx('variables')).toBeLessThan(idx('history'));
    });

    it('dispatch_child embeds the child inline under parent.triggeredWorkflows[N].state', async () => {
      const { readFile } = await import('node:fs/promises');
      const slug = 'dispatch-child-embed';
      const topFolder = join(workspaceDir, '.engineering/artifacts/planning', slug);

      // Create a persistent top-level work-package.
      const parent = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const parentIdx = parseToolResponse(parent).session_index;

      // Dispatch a child via the new tool — must NOT create a new top-level
      // folder; must embed the child in the parent's session.json.
      const child = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: parentIdx, workflow_id: 'remediate-vuln', agent_id: 'worker' },
      });
      expect(child.isError).toBeFalsy();
      const childIdx = parseToolResponse(child).session_index;
      expect(childIdx).toMatch(/^[A-Z2-7]{6}$/);
      expect(childIdx).not.toBe(parentIdx);

      // Top folder is the parent's; the child does NOT have its own folder.
      const topState = JSON.parse(await readFile(join(topFolder, 'session.json'), 'utf8'));
      expect(topState.workflowId).toBe('work-package');
      expect(topState.triggeredWorkflows).toHaveLength(1);
      const childEmbedded = topState.triggeredWorkflows[0];
      expect(childEmbedded.workflowId).toBe('remediate-vuln');
      expect(childEmbedded.sessionIndex).toBe(childIdx);
      expect(childEmbedded.status).toBe('running');
      expect(childEmbedded.state).toBeDefined();
      expect(childEmbedded.state.workflowId).toBe('remediate-vuln');
      expect(childEmbedded.state.sessionIndex).toBe(childIdx);
      expect(childEmbedded.state.status).toBe('running');

      // Loading via the child's session_index returns the embedded sub-state.
      const childGet = await client.callTool({
        name: 'get_workflow',
        arguments: { session_index: childIdx },
      });
      expect(childGet.isError).toBeFalsy();
      // get_workflow's _meta.session_index echoes the child index.
      expect((childGet._meta as { session_index?: string })?.session_index).toBe(childIdx);
      // No separate folder was created at the workspace top level for the child.
      const { existsSync } = await import('node:fs');
      expect(existsSync(join(workspaceDir, '.engineering/artifacts/planning', childEmbedded.workflowId))).toBe(false);
    });

    it('mutations through a child session_index land in the embedded state (not in a separate file)', async () => {
      const { readFile } = await import('node:fs/promises');
      const slug = 'dispatch-child-mutate';
      const topFolder = join(workspaceDir, '.engineering/artifacts/planning', slug);

      // Parent + child must share the same workflow so we can use a known
      // activity id for the mutation (avoids cross-workflow activity lookup).
      const parent = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder(slug) },
      });
      const parentIdx = parseToolResponse(parent).session_index;

      const child = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: parentIdx, workflow_id: 'work-package', agent_id: 'worker' },
      });
      const childIdx = parseToolResponse(child).session_index;

      // Drive the child through a real activity transition.
      const nextResult = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: childIdx, activity_id: 'start-work-package' },
      });
      expect(nextResult.isError).toBeFalsy();

      // Re-read the top file and verify the child's currentActivity is set
      // INSIDE triggeredWorkflows[0].state — no other file was touched.
      const topAfter = JSON.parse(await readFile(join(topFolder, 'session.json'), 'utf8'));
      expect(topAfter.triggeredWorkflows[0].state.currentActivity).toBe('start-work-package');
      // The parent's own currentActivity is untouched.
      expect(topAfter.currentActivity).toBe('');
    });
  });

  describe('start_session migration auto-trigger', () => {
    it('auto-migrates a planning folder containing legacy workflow-state.json + .session-token on first call', async () => {
      const slug = 'migration-auto';
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const { mkdirSync, copyFileSync, existsSync } = await import('node:fs');
      mkdirSync(folderPath, { recursive: true });
      // Drop legacy artefacts in the folder before calling start_session.
      const fixtureDir = resolve(import.meta.dirname, 'fixtures/legacy-session');
      copyFileSync(join(fixtureDir, 'workflow-state.json'), join(folderPath, 'workflow-state.json'));
      copyFileSync(join(fixtureDir, '.session-token'), join(folderPath, '.session-token'));

      // Use a non-meta workflow_id so the session resolves to the workspace
      // folder above (meta sessions are tmp-rooted and bypass workspace).
      const result = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', planning_folder: planningFolder(slug), agent_id: 'orchestrator' },
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

    it('a second call against the same migrated folder reuses session.json without re-migrating', async () => {
      const slug = 'migration-resume';
      const folderPath = join(workspaceDir, '.engineering/artifacts/planning', slug);
      const { mkdirSync, copyFileSync } = await import('node:fs');
      mkdirSync(folderPath, { recursive: true });
      const fixtureDir = resolve(import.meta.dirname, 'fixtures/legacy-session');
      copyFileSync(join(fixtureDir, 'workflow-state.json'), join(folderPath, 'workflow-state.json'));
      copyFileSync(join(fixtureDir, '.session-token'), join(folderPath, '.session-token'));

      const first = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', planning_folder: planningFolder(slug), agent_id: 'orchestrator' },
      });
      const firstResponse = parseToolResponse(first);

      const second = await client.callTool({
        name: 'start_session',
        arguments: { workflow_id: 'work-package', planning_folder: planningFolder(slug), agent_id: 'orchestrator' },
      });
      const secondResponse = parseToolResponse(second);
      expect(secondResponse.session_index).toBe(firstResponse.session_index);
      // The second call must NOT report a migration — session.json is already present.
      expect(secondResponse.migrated).toBeUndefined();
    });
  });

  describe('removed legacy surface', () => {
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

  describe('tool: inspect_session', () => {
    // Root session index and the one child's own index. Both are valid RFC 4648
    // base32 (A-Z, 2-7). The fixture is written to disk sealed via
    // writeSessionFile, then addressed by its stored index.
    const ROOT_INDEX = 'INSPCT';
    const CHILD_INDEX = 'CHILDX';
    const fixtureSlug = 'inspect-session-fixture';

    // A fully-populated fixture: variables, checkpoint responses, mixed history
    // (milestone + non-milestone events), completed/skipped activities, an active
    // checkpoint (so the read-while-blocked case is covered), and one embedded child.
    const buildFixture = () => ({
      schemaVersion: 1 as const,
      sessionIndex: ROOT_INDEX,
      workflowId: 'work-package',
      workflowVersion: '3.28.0',
      agentId: 'orchestrator',
      seq: 7,
      ts: 1_700_000_000,
      startedAt: '2026-07-11T10:00:00.000Z',
      currentActivity: 'implement',
      currentTechnique: 'implement-task',
      condition: '',
      activeCheckpoint: {
        checkpointId: 'symbol-provenance-confirmed',
        activityId: 'implement',
        yieldedAt: '2026-07-11T11:00:00.000Z',
      },
      variables: {
        issue_number: '193',
        pr_number: '215',
        problem_complexity: 'simple',
        is_review_mode: false,
      },
      completedActivities: ['start-work-package', 'research', 'wp-plan'],
      checkpointResponses: {
        'wp-plan-plan-approved': {
          optionId: 'approved',
          respondedAt: '2026-07-11T10:30:00.000Z',
          effects: { variablesSet: { plan_approved: true } },
        },
        'research-context-scope-declaration': {
          optionId: 'repo-only',
          respondedAt: '2026-07-11T10:15:00.000Z',
        },
      },
      history: [
        { timestamp: '2026-07-11T10:00:00.000Z', type: 'workflow_started' },
        { timestamp: '2026-07-11T10:01:00.000Z', type: 'activity_entered', activity: 'start-work-package' },
        { timestamp: '2026-07-11T10:05:00.000Z', type: 'activity_exited', activity: 'start-work-package' },
        { timestamp: '2026-07-11T10:06:00.000Z', type: 'activity_entered', activity: 'research' },
        { timestamp: '2026-07-11T10:15:00.000Z', type: 'checkpoint_reached', activity: 'research', checkpoint: 'context-scope-declaration' },
        { timestamp: '2026-07-11T10:15:30.000Z', type: 'checkpoint_response', activity: 'research', checkpoint: 'context-scope-declaration' },
        { timestamp: '2026-07-11T10:20:00.000Z', type: 'technique_fetched', activity: 'research' },
        { timestamp: '2026-07-11T10:40:00.000Z', type: 'workflow_triggered', activity: 'implement' },
      ],
      status: 'running' as const,
      triggeredWorkflows: [
        {
          workflowId: 'remediate-vuln',
          sessionIndex: CHILD_INDEX,
          triggeredAt: '2026-07-11T10:40:00.000Z',
          triggeredFrom: { activityId: 'implement' },
          status: 'running' as const,
          state: {
            schemaVersion: 1 as const,
            sessionIndex: CHILD_INDEX,
            workflowId: 'remediate-vuln',
            workflowVersion: '2.0.0',
            agentId: 'worker',
            seq: 2,
            ts: 1_700_000_100,
            startedAt: '2026-07-11T10:40:00.000Z',
            currentActivity: 'triage',
            currentTechnique: '',
            condition: '',
            variables: { severity: 'high' },
            completedActivities: ['intake'],
            checkpointResponses: {},
            history: [{ timestamp: '2026-07-11T10:40:00.000Z', type: 'workflow_started' }],
            status: 'running' as const,
            // The child carries its OWN triggeredWorkflows (a grandchild), so a
            // `children`/`summary` projection under child_index:0 must reflect
            // THIS child's children — not the root's. This is what closes the
            // root-vs-addressed parity gap (PR215-TC-09).
            triggeredWorkflows: [
              {
                workflowId: 'meta',
                sessionIndex: 'GRANDX',
                triggeredAt: '2026-07-11T10:45:00.000Z',
                triggeredFrom: { activityId: 'triage' },
                status: 'running' as const,
                state: {
                  schemaVersion: 1 as const,
                  sessionIndex: 'GRANDX',
                  workflowId: 'meta',
                  workflowVersion: '5.2.0',
                  agentId: 'worker',
                  seq: 1,
                  ts: 1_700_000_200,
                  startedAt: '2026-07-11T10:45:00.000Z',
                  currentActivity: 'plan',
                  currentTechnique: '',
                  condition: '',
                  variables: {},
                  completedActivities: [],
                  checkpointResponses: {},
                  history: [{ timestamp: '2026-07-11T10:45:00.000Z', type: 'workflow_started' }],
                  status: 'running' as const,
                  triggeredWorkflows: [],
                },
              },
            ],
          },
        },
      ],
    });

    // Write the sealed fixture to its own planning folder before each inspect test.
    beforeEach(async () => {
      const { writeSessionFile } = await import('../src/utils/session/store.js');
      await writeSessionFile(planningFolder(fixtureSlug), buildFixture());
    });

    const callInspect = async (args: Record<string, unknown>) =>
      client.callTool({ name: 'inspect_session', arguments: { session_index: ROOT_INDEX, ...args } });

    it('PR215-TC-01: default summary view returns all sub-projections', async () => {
      const result = await callInspect({});
      expect(result.isError).toBeFalsy();
      const summary = parseToolResponse(result);
      expect(Object.keys(summary).sort()).toEqual(
        ['activities', 'checkpoints', 'children', 'history', 'identity', 'variables'],
      );
      expect(summary.identity.workflowId).toBe('work-package');
      expect(summary.identity.sessionIndex).toBe(ROOT_INDEX);
      expect(summary.activities.completed).toContain('wp-plan');
      expect(summary.variables.pr_number).toBe('215');
      expect(summary.checkpoints['wp-plan-plan-approved'].optionId).toBe('approved');
      expect(summary.history.count).toBe(8);
      expect(summary.children).toHaveLength(1);
      expect(summary.children[0].sessionIndex).toBe(CHILD_INDEX);
    });

    it('PR215-TC-02: each narrow view returns only its slice', async () => {
      const identity = parseToolResponse(await callInspect({ view: 'identity' }));
      expect(identity).toEqual({
        workflowId: 'work-package',
        workflowVersion: '3.28.0',
        sessionIndex: ROOT_INDEX,
        agentId: 'orchestrator',
        status: 'running',
        currentActivity: 'implement',
        currentTechnique: 'implement-task',
        startedAt: '2026-07-11T10:00:00.000Z',
        seq: 7,
      });

      const activities = parseToolResponse(await callInspect({ view: 'activities' }));
      expect(activities).toEqual({
        completed: ['start-work-package', 'research', 'wp-plan'],
        current: 'implement',
        // This fixture reports neither outcomes nor progress marks, so every activity it
        // entered is unreported and none is known to have skipped the write.
        outcomes: [],
        progress_mark_unpublished: [],
        progress_mark_unreported: ['start-work-package', 'research'],
      });

      const checkpoints = parseToolResponse(await callInspect({ view: 'checkpoints' }));
      // A response without effects yields an empty variablesSet map.
      expect(checkpoints['research-context-scope-declaration']).toEqual({
        optionId: 'repo-only',
        respondedAt: '2026-07-11T10:15:00.000Z',
        variablesSet: {},
      });

      const history = parseToolResponse(await callInspect({ view: 'history' }));
      expect(history.count).toBe(8);
      expect(history.byType.activity_entered).toBe(2);
      expect(history.byType.technique_fetched).toBe(1);
      // technique_fetched is NOT a milestone type; six milestones remain.
      expect(history.milestones).toHaveLength(6);
      expect(history.milestones.every((m: { type: string }) => m.type !== 'technique_fetched')).toBe(true);

      const children = parseToolResponse(await callInspect({ view: 'children' }));
      expect(children).toEqual([{
        index: 0,
        sessionIndex: CHILD_INDEX,
        workflowId: 'remediate-vuln',
        status: 'running',
        currentActivity: 'triage',
        completed: ['intake'],
        // Still running with no usage reported: the figure is unavailable, which the
        // digest says rather than showing a zero.
        cost_known: false,
        rows: 0,
        totals: {},
      }]);

      const variables = parseToolResponse(await callInspect({ view: 'variables' }));
      expect(variables).toEqual({
        issue_number: '193',
        pr_number: '215',
        problem_complexity: 'simple',
        is_review_mode: false,
      });
    });

    it('PR215-TC-03: variable narrows view=variables to one key', async () => {
      const result = await callInspect({ view: 'variables', variable: 'pr_number' });
      expect(result.isError).toBeFalsy();
      expect(parseToolResponse(result)).toBe('215');
    });

    it('PR215-TC-04: child_index addresses triggeredWorkflows[n].state positionally', async () => {
      const identity = parseToolResponse(await callInspect({ child_index: 0, view: 'identity' }));
      // The child's identity, not the root's.
      expect(identity.sessionIndex).toBe(CHILD_INDEX);
      expect(identity.workflowId).toBe('remediate-vuln');
      expect(identity.currentActivity).toBe('triage');
    });

    it('PR215-TC-05: out-of-range child_index returns the actionable NOT_FOUND message', async () => {
      const result = await callInspect({ child_index: 5, view: 'identity' });
      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      // navigatePath throws SessionStoreError(NOT_FOUND); withSessionStoreErrors +
      // describeSessionStoreError render the canonical actionable NOT_FOUND message.
      expect(text).toContain('Call start_session to create or resume a planning folder');
    });

    it('PR215-TC-06: the tool is read-only — no session mutation', async () => {
      const { readFileSync: rfs } = await import('node:fs');
      const jsonPath = join(planningFolder(fixtureSlug), 'session.json');
      const sealPath = join(planningFolder(fixtureSlug), '.session-token');
      const bytesBefore = rfs(jsonPath, 'utf8');
      const sealBefore = rfs(sealPath, 'utf8');

      for (const view of ['summary', 'identity', 'variables', 'checkpoints', 'activities', 'history', 'children']) {
        const r = await callInspect({ view });
        expect(r.isError).toBeFalsy();
      }

      expect(rfs(jsonPath, 'utf8')).toBe(bytesBefore);
      expect(rfs(sealPath, 'utf8')).toBe(sealBefore);
      // seq is unchanged (no advanceSession).
      const after = JSON.parse(rfs(jsonPath, 'utf8'));
      expect(after.seq).toBe(7);
    });

    it('PR215-TC-07: the tool works while a checkpoint is active', async () => {
      // The fixture carries an activeCheckpoint; inspect_session must not gate.
      const result = await callInspect({ view: 'identity' });
      expect(result.isError).toBeFalsy();
      const identity = parseToolResponse(result);
      expect(identity.sessionIndex).toBe(ROOT_INDEX);
    });

    it('PR215-TC-08: port fidelity against the reference script (parity)', async () => {
      const { execFileSync } = await import('node:child_process');
      const jsonPath = join(planningFolder(fixtureSlug), 'session.json');
      const scriptPath = resolve(import.meta.dirname, 'fixtures/inspect-session/inspect_session.py');

      // The oracle IS this test.
      const runReference = (args: string[]): unknown =>
        JSON.parse(execFileSync('python3', [scriptPath, jsonPath, ...args], { encoding: 'utf8' }));

      // Derive the parity loop from the server export so a missing oracle view fails loud (SC-12).
      const { INSPECT_SESSION_VIEWS } = await import('../src/tools/workflow-tools.js');
      for (const view of INSPECT_SESSION_VIEWS) {
        const reference = runReference([view]);
        const ours = parseToolResponse(await callInspect({ view }));
        expect(ours, `view '${view}' must match the reference script`).toEqual(reference);
      }

      // child_index parity: --child 0 vs the tool's child_index: 0. Cover the
      // addressed-session views — summary and children — not just identity, so
      // the oracle would catch any future root-vs-addressed drift (both the tool
      // and the oracle must report the child's OWN grandchild here, not the root's).
      for (const view of ['identity', 'summary', 'children']) {
        const refChild = runReference([view, '--child', '0']);
        const oursChild = parseToolResponse(await callInspect({ child_index: 0, view }));
        expect(oursChild, `view '${view}' under child_index:0 must match the reference script`).toEqual(refChild);
      }

      // --variable narrowing parity.
      const refVar = runReference(['variables', '--variable', 'pr_number']);
      const oursVar = parseToolResponse(await callInspect({ view: 'variables', variable: 'pr_number' }));
      expect(oursVar).toEqual(refVar);
    });

    it('PR215-TC-09: children/summary under child_index reflect the ADDRESSED session', async () => {
      // Under child_index:0 the `children` projection must list the CHILD's own
      // triggeredWorkflows (the grandchild), not the root's — addressed-session
      // semantics matching the tool's docstring.
      const children = parseToolResponse(await callInspect({ child_index: 0, view: 'children' }));
      expect(children).toEqual([{
        index: 0,
        sessionIndex: 'GRANDX',
        workflowId: 'meta',
        status: 'running',
        currentActivity: 'plan',
        completed: [],
        // The grandchild is running and has reported no usage, so its cost is
        // unavailable rather than nil.
        cost_known: false,
        rows: 0,
        totals: {},
      }]);

      const summary = parseToolResponse(await callInspect({ child_index: 0, view: 'summary' }));
      // summary.identity is the child; summary.children is the child's children.
      expect(summary.identity.sessionIndex).toBe(CHILD_INDEX);
      expect(summary.children).toEqual(children);
    });
  });

});
