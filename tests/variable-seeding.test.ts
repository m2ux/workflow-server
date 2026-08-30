/**
 * Variable-model honesty (#166 B7): defaultValue seeding at session creation
 * and warn-only type validation of checkpoint setVariable effects.
 *
 * Runs against the fixture corpus in tests/fixtures/variable-model (not the
 * live workflows checkout) so the type-mismatch paths can be exercised — the
 * real corpus is kept mismatch-free by check:variable-model.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { resolve, join } from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { seedDefaults, jsonTypeOf, isTemplateReference } from '../src/utils/variable-seed.js';
import { createInitialSessionFile } from '../src/schema/session.schema.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';

const SEEDED_FIXTURE_BAG = {
  review_needed: false,
  reference_note: '',
  retry_count: 0,
  mode_label: 'standard',
};

describe('seedDefaults / jsonTypeOf / isTemplateReference', () => {
  it('seeds every declaration with a defaultValue, including falsy ones, and skips the rest', () => {
    expect(seedDefaults([
      { name: 'review_needed', type: 'boolean', defaultValue: false, required: false },
      { name: 'reference_note', type: 'string', defaultValue: '', required: false },
      { name: 'retry_count', type: 'number', defaultValue: 0, required: false },
      { name: 'unset_marker', type: 'string', required: false },
    ])).toEqual({ review_needed: false, reference_note: '', retry_count: 0 });
  });

  it('returns an empty bag for undefined or empty declarations', () => {
    expect(seedDefaults(undefined)).toEqual({});
    expect(seedDefaults([])).toEqual({});
  });

  it('jsonTypeOf maps values onto the variable type enum', () => {
    expect(jsonTypeOf('x')).toBe('string');
    expect(jsonTypeOf(3)).toBe('number');
    expect(jsonTypeOf(false)).toBe('boolean');
    expect(jsonTypeOf([])).toBe('array');
    expect(jsonTypeOf({})).toBe('object');
    expect(jsonTypeOf(null)).toBe('null');
  });

  it('isTemplateReference accepts exactly one {name} passthrough', () => {
    expect(isTemplateReference('{ingest_plan}')).toBe(true);
    expect(isTemplateReference('prefix {ingest_plan}')).toBe(false);
    expect(isTemplateReference('{}')).toBe(false);
    expect(isTemplateReference(true)).toBe(false);
  });
});

describe('createInitialSessionFile variable seeding', () => {
  const base = { sessionIndex: 'ABC234', workflowId: 'seed-fixture', workflowVersion: '1.0.0', agentId: 'orchestrator' };

  it('records seeded variables and ONE variables_seeded history event', () => {
    const file = createInitialSessionFile({ ...base, variables: { review_needed: false } });
    expect(file.variables).toEqual({ review_needed: false });
    const seededEvents = file.history.filter(h => h.type === 'variables_seeded');
    expect(seededEvents).toHaveLength(1);
    expect(seededEvents[0]?.data).toEqual({ variables: { review_needed: false } });
  });

  it('emits no variables_seeded event when nothing seeds', () => {
    for (const file of [createInitialSessionFile(base), createInitialSessionFile({ ...base, variables: {} })]) {
      expect(file.variables).toEqual({});
      expect(file.history.filter(h => h.type === 'variables_seeded')).toHaveLength(0);
    }
  });
});

describe('B7 seeding + setVariable type validation (fixture corpus)', () => {
  let harness: Harness;
  let client: Client;
  const planningFolder = (slug: string) => planningFolderPath(harness.workspaceDir, slug);
  const readSession = (slug: string) => JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function call(name: string, args: Record<string, unknown>): Promise<any> {
    const result = await client.callTool({ name, arguments: args });
    if (result.isError) throw new Error(`${name} failed: ${(result.content as { text: string }[])[0]?.text}`);
    return result;
  }

  /** start seed-fixture, enter its activity, yield the type-check checkpoint. */
  async function startAtCheckpoint(slug: string): Promise<string> {
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
    await call('yield_checkpoint', { session_index: sessionIndex, checkpoint_id: 'type-check' });
    return sessionIndex;
  }

  beforeAll(async () => {
    harness = await createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model') });
    client = harness.client;
  });

  afterAll(async () => { await harness.close(); });

  it('start_session seeds declared defaults — including false, "" and 0 — and skips undeclared defaults', async () => {
    const slug = '2026-07-07-seed-basic';
    await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const stored = readSession(slug);
    expect(stored.variables).toEqual(SEEDED_FIXTURE_BAG);
    expect('unset_marker' in stored.variables).toBe(false);
    const seededEvents = stored.history.filter((h: { type: string }) => h.type === 'variables_seeded');
    expect(seededEvents).toHaveLength(1);
    expect(seededEvents[0].data).toEqual({ variables: SEEDED_FIXTURE_BAG });
  });

  it('start_session with a no-defaults workflow leaves the bag empty with no seeding event', async () => {
    const slug = '2026-07-07-seed-bare';
    await call('start_session', { workflow_id: 'bare-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const stored = readSession(slug);
    expect(stored.variables).toEqual({});
    expect(stored.history.filter((h: { type: string }) => h.type === 'variables_seeded')).toHaveLength(0);
  });

  it('resume preserves the mutated bag and does not re-seed', async () => {
    const slug = '2026-07-07-seed-resume';
    const sessionIndex = await startAtCheckpoint(slug);
    await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'matching-assignment' });
    expect(readSession(slug).variables.review_needed).toBe(true);

    await call('start_session', { agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const resumed = readSession(slug);
    expect(resumed.variables.review_needed).toBe(true);
    expect(resumed.history.filter((h: { type: string }) => h.type === 'variables_seeded')).toHaveLength(1);
  });

  it('dispatch_child (persistent parent) seeds the child bag from the CHILD workflow and leaves the parent untouched', async () => {
    const slug = '2026-07-07-seed-child';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture' });
    const stored = readSession(slug);
    expect(stored.variables).toEqual(SEEDED_FIXTURE_BAG);
    const child = stored.triggeredWorkflows[0].state;
    expect(child.variables).toEqual({ child_ready: false, child_label: 'seeded' });
    expect(child.history.filter((h: { type: string }) => h.type === 'variables_seeded')).toHaveLength(1);
  });

  it('a child that reported no usage is recorded as cost unknown, outside the parent totals (#477)', async () => {
    const slug = '2026-07-07-child-cost';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture' });
    // The parent records its own spend; the child is dispatched and reports nothing,
    // which is the shape a stalled analysis run leaves behind.
    await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
    await call('record_usage', {
      session_index: sessionIndex,
      activity: 'checkpoint-activity',
      usage: { total_tokens: 40 },
      basis: 'delta',
    });

    const usage = JSON.parse(
      ((await call('inspect_session', { session_index: sessionIndex, view: 'usage' })).content as Array<{ text: string }>)[0]!.text,
    );
    expect(usage.totals.total_tokens).toBe(40);
    expect(usage.children_outside_totals).toHaveLength(1);
    const child = usage.children_outside_totals[0];
    expect(child.workflowId).toBe('child-fixture');
    // The figure is unavailable, which is a different claim from nil.
    expect(child.cost_known).toBe(false);
    expect(child.rows).toBe(0);
    expect(child.totals).toEqual({});
  });

  it('next_activity persists variables_changed into the bag, attributed to the activity being exited', async () => {
    const slug = '2026-07-07-worker-outputs';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
    await call('next_activity', {
      session_index: sessionIndex,
      activity_id: 'followup-activity',
      variables_changed: { review_needed: true, retry_count: 2, unset_marker: 'produced' },
    });

    const stored = readSession(slug);
    // Worker outputs land alongside the seeded defaults, including a variable
    // that had no default and was therefore absent from the bag.
    expect(stored.variables).toEqual({ ...SEEDED_FIXTURE_BAG, review_needed: true, retry_count: 2, unset_marker: 'produced' });

    const events = stored.history.filter((h: { type: string }) => h.type === 'variable_set');
    expect(events).toHaveLength(3);
    for (const event of events) {
      expect(event.activity).toBe('checkpoint-activity');
      expect(event.data.source).toBe('variables_changed');
    }
  });

  it('next_activity type-checks variables_changed warn-only, storing the value as written', async () => {
    const slug = '2026-07-07-worker-mismatch';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
    const result = await call('next_activity', {
      session_index: sessionIndex,
      activity_id: 'followup-activity',
      variables_changed: { review_needed: 'yes' },
    });

    const validation = (result._meta as { validation: { status: string; warnings: string[] } }).validation;
    expect(validation.status).toBe('warning');
    expect(validation.warnings.join('\n')).toMatch(/variables_changed.*review_needed.*string.*declared boolean/);

    const stored = readSession(slug);
    expect(stored.variables.review_needed).toBe('yes');
    const event = stored.history.find((h: { type: string; data?: Record<string, unknown> }) => h.type === 'variable_set');
    expect(event.data).toMatchObject({ typeMismatch: true, declaredType: 'boolean', valueType: 'string' });
  });

  it('a checkpoint condition reads worker-written state, so worker outputs can gate a checkpoint', async () => {
    // The regression this closes: `has_saved_state`-style variables set by a
    // worker were invisible to the server, so a checkpoint condition reading
    // one could never fire. The bag is now the single source both sides share.
    const slug = '2026-07-07-worker-gates-checkpoint';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity', variables_changed: { review_needed: true } });
    expect(readSession(slug).variables.review_needed).toBe(true);

    // A fresh orchestrator that lost its context recovers the worker's value
    // from the server rather than from a prompt.
    const status = await call('get_workflow_status', { session_index: sessionIndex });
    expect(JSON.parse((status.content as { text: string }[])[0].text).variables.review_needed).toBe(true);
  });

  it('omitting variables_changed leaves the bag untouched', async () => {
    const slug = '2026-07-07-worker-no-outputs';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
    await call('next_activity', { session_index: sessionIndex, activity_id: 'followup-activity' });
    const stored = readSession(slug);
    expect(stored.variables).toEqual(SEEDED_FIXTURE_BAG);
    expect(stored.history.filter((h: { type: string }) => h.type === 'variable_set')).toHaveLength(0);
  });

  it('dispatch_child reports the child workflow\'s first activity, which only the child declares', async () => {
    // A fresh session has no current activity, so the server accepts no id but this one on the child's
    // first `next_activity`. The parent knows its own workflow's first activity and not the child's, so
    // without this the caller either guesses or learns the answer from a rejection.
    const slug = '2026-07-07-report-initial';
    const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    const result = await call('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture' });
    const body = JSON.parse((result.content[0] as { type: 'text'; text: string }).text) as {
      workflow: { id: string; initialActivity?: string };
    };
    expect(body.workflow.id).toBe('child-fixture');
    // The child's, not the parent's — the seed-fixture parent starts at `checkpoint-activity`.
    expect(body.workflow.initialActivity).toBe('child-activity');
    // The response carries the workflow's metadata and nothing about a prior run: re-dispatching from a
    // transient parent replaces the child rather than continuing it, which is #429.
    expect(Object.keys(body.workflow)).toEqual(['id', 'version', 'initialActivity']);
  });

  it('reports the first activity from the transient-promotion path too, which is the one bootstrap takes', async () => {
    // `start_session` with no planning folder is how the meta bootstrap opens, so the promotion branch
    // is the return site production reaches. It is a second `return` in the same handler, and covering
    // only the persistent-parent one leaves the live path free to drop the field.
    const started = await call('start_session', { agent_id: 'orchestrator' });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    const result = await call('dispatch_child', {
      session_index: sessionIndex,
      workflow_id: 'child-fixture',
      planning_slug: '2026-07-07-promoted-initial',
    });
    const body = JSON.parse((result.content[0] as { type: 'text'; text: string }).text) as {
      planning_slug?: string; workflow: { id: string; initialActivity?: string };
    };
    expect(body.planning_slug).toBe('2026-07-07-promoted-initial');
    expect(body.workflow.initialActivity).toBe('child-activity');
  });

  it('dispatch_child (transient meta promotion) seeds both the promoted parent and the embedded child', async () => {
    const started = await call('start_session', { agent_id: 'orchestrator' });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    const slug = '2026-07-07-seed-promoted';
    await call('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture', planning_slug: slug });
    const stored = readSession(slug);
    expect(stored.variables).toEqual({ bootstrap_ready: false });
    expect(stored.triggeredWorkflows[0].state.variables).toEqual({ child_ready: false, child_label: 'seeded' });
  });

  it('respond_checkpoint stores a type-mismatched value as written and warns in _meta.validation and history', async () => {
    const sessionIndex = await startAtCheckpoint('2026-07-07-type-mismatch');
    const result = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'mismatched-assignment' });
    const validation = (result._meta as { validation: { status: string; warnings: string[] } }).validation;
    expect(validation.status).toBe('warning');
    expect(validation.warnings.join('\n')).toMatch(/review_needed.*string.*declared boolean/);

    const stored = readSession('2026-07-07-type-mismatch');
    expect(stored.variables.review_needed).toBe('yes');
    const event = stored.history.find((h: { type: string; data?: Record<string, unknown> }) => h.type === 'variable_set' && h.data?.name === 'review_needed');
    expect(event.data).toMatchObject({ typeMismatch: true, declaredType: 'boolean', valueType: 'string' });
  });

  it('respond_checkpoint is silent for matching assignments', async () => {
    const sessionIndex = await startAtCheckpoint('2026-07-07-type-match');
    const result = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'matching-assignment' });
    const validation = (result._meta as { validation: { warnings: string[] } }).validation;
    expect(validation.warnings.filter(w => w.includes('setVariable'))).toEqual([]);
    const event = readSession('2026-07-07-type-match').history.find((h: { type: string; data?: Record<string, unknown> }) => h.type === 'variable_set' && h.data?.name === 'review_needed');
    expect(event.data.typeMismatch).toBeUndefined();
  });

  it('respond_checkpoint stores a value outside the declared set as written and warns (#518 W5.4)', async () => {
    const sessionIndex = await startAtCheckpoint('2026-07-07-off-set');
    const result = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'off-set-assignment' });
    const validation = (result._meta as { validation: { status: string; warnings: string[] } }).validation;
    expect(validation.status).toBe('warning');
    expect(validation.warnings.join('\n')).toMatch(/operation_type.*"audit".*outside the declared value set \[create, review\]/);

    const stored = readSession('2026-07-07-off-set');
    expect(stored.variables.operation_type).toBe('audit');
    const event = stored.history.find((h: { type: string; data?: Record<string, unknown> }) => h.type === 'variable_set' && h.data?.name === 'operation_type');
    expect(event.data).toMatchObject({ valueOutsideSet: true, declaredValues: ['create', 'review'] });
  });

  it('respond_checkpoint is silent for a member of the declared set', async () => {
    const sessionIndex = await startAtCheckpoint('2026-07-07-in-set');
    const result = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'in-set-assignment' });
    const validation = (result._meta as { validation: { warnings: string[] } }).validation;
    expect(validation.warnings.filter(w => w.includes('value set'))).toEqual([]);
    const event = readSession('2026-07-07-in-set').history.find((h: { type: string; data?: Record<string, unknown> }) => h.type === 'variable_set' && h.data?.name === 'operation_type');
    expect(event.data.valueOutsideSet).toBeUndefined();
  });

  it('respond_checkpoint exempts {name} template passthroughs from type validation', async () => {
    const sessionIndex = await startAtCheckpoint('2026-07-07-type-template');
    const result = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'template-assignment' });
    const validation = (result._meta as { validation: { warnings: string[] } }).validation;
    expect(validation.warnings.filter(w => w.includes('setVariable'))).toEqual([]);
    expect(readSession('2026-07-07-type-template').variables.mode_label).toBe('{unset_marker}');
  });

  // #324 A1: the user's request reaches downstream agents as bag state, so a
  // technique that matches or classifies it binds a variable instead of relying
  // on the orchestrator to inline the request into a spawn prompt.
  describe('user_request seeding (#324 A1)', () => {
    it('start_session seeds user_request alongside the declared defaults', async () => {
      const slug = '2026-07-28-request-seeded';
      await call('start_session', {
        workflow_id: 'seed-fixture', agent_id: 'orchestrator',
        planning_folder: planningFolder(slug), user_request: 'review PR 49',
      });
      expect(readSession(slug).variables).toEqual({ ...SEEDED_FIXTURE_BAG, user_request: 'review PR 49' });
    });

    it('omitting user_request leaves it absent, so exists gates stay meaningful', async () => {
      const slug = '2026-07-28-request-absent';
      await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
      expect('user_request' in readSession(slug).variables).toBe(false);
    });

    it('a resume rebinds user_request to the request that reopened the session', async () => {
      const slug = '2026-07-28-request-rebound';
      const args = { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) };
      await call('start_session', { ...args, user_request: 'start the work package' });
      await call('start_session', { ...args, user_request: 'carry on where we left off' });
      expect(readSession(slug).variables.user_request).toBe('carry on where we left off');
    });

    it('dispatch_child hands user_request down to the child bag', async () => {
      const started = await call('start_session', { agent_id: 'orchestrator', user_request: 'plan issue 141' });
      const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
      const slug = '2026-07-28-request-inherited';
      await call('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture', planning_slug: slug });
      const stored = readSession(slug);
      expect(stored.variables.user_request).toBe('plan issue 141');
      expect(stored.triggeredWorkflows[0].state.variables).toEqual({
        child_ready: false, child_label: 'seeded', user_request: 'plan issue 141',
      });
    });
  });

  // #324 B1: per-activity token accounting. The worker cannot self-measure, so
  // the orchestrator relays what the harness reported for the activity it exits.
  describe('per-dispatch usage accounting (#324 B1, #346 DI-33)', () => {
    const usage = { input_tokens: 1200, output_tokens: 340, cache_read_input_tokens: 8000 };

    it('records usage against the named activity and surfaces it on the usage view', async () => {
      const slug = '2026-07-28-usage-recorded';
      const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
      const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
      await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
      await call('record_usage', { session_index: sessionIndex, activity: 'checkpoint-activity', usage, basis: 'delta' });

      const events = readSession(slug).history.filter((h: { type: string }) => h.type === 'activity_usage');
      expect(events).toHaveLength(1);
      expect(events[0].activity).toBe('checkpoint-activity');
      expect(events[0].data).toEqual({ usage, basis: 'delta' });

      const view = await call('inspect_session', { session_index: sessionIndex, view: 'usage' });
      const projected = JSON.parse((view.content as { text: string }[])[0]!.text);
      const rows = projected.rows ?? projected;
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ activity: 'checkpoint-activity', usage });
      expect(projected.totals).toBeDefined();
    });

    it('records a dispatch the graph never transitions away from', async () => {
      // The case the transition-keyed ledger could not reach: an activity is entered,
      // dispatched, and the run ends there. Nothing exits it, so nothing could have
      // carried its cost.
      const slug = '2026-07-28-usage-terminal';
      const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
      const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
      await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
      await call('record_usage', { session_index: sessionIndex, activity: 'checkpoint-activity', usage, basis: 'delta' });

      const rows = readSession(slug).history.filter((h: { type: string }) => h.type === 'activity_usage');
      expect(rows).toHaveLength(1);
      expect(rows[0].activity).toBe('checkpoint-activity');
    });

    it('keeps each dispatch of one activity as its own row', async () => {
      const slug = '2026-07-28-usage-repeat';
      const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
      const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
      await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
      await call('record_usage', { session_index: sessionIndex, activity: 'checkpoint-activity', usage: { total_tokens: 10 }, basis: 'delta' });
      await call('record_usage', { session_index: sessionIndex, activity: 'checkpoint-activity', usage: { total_tokens: 20 }, basis: 'delta' });

      const rows = readSession(slug).history.filter((h: { type: string }) => h.type === 'activity_usage');
      expect(rows).toHaveLength(2);
      expect(rows.map((r: { data?: { usage?: { total_tokens?: number } } }) => r.data?.usage?.total_tokens)).toEqual([10, 20]);
    });

    it('recording nothing leaves the usage view empty', async () => {
      const slug = '2026-07-28-usage-absent';
      const started = await call('start_session', { workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug) });
      const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
      await call('next_activity', { session_index: sessionIndex, activity_id: 'checkpoint-activity' });
      await call('next_activity', { session_index: sessionIndex, activity_id: 'followup-activity' });
      expect(readSession(slug).history.filter((h: { type: string }) => h.type === 'activity_usage')).toHaveLength(0);
    });
  });
});

/**
 * Definition drift on resume: the bag is seeded from the declarations that were on disk when the
 * session was created, and a resume runs whatever is on disk now. A declaration added since is
 * absent from the bag, so a gate on it reads unbound.
 *
 * Runs against a COPY of the fixture corpus so the definition can be edited under a live session.
 */
describe('resume against an edited workflow definition', () => {
  let harness: Harness;
  let client: Client;
  let corpusDir: string;
  const slug = '2026-08-17-definition-drift';
  const planningFolder = () => planningFolderPath(harness.workspaceDir, slug);
  const readSession = () => JSON.parse(readFileSync(join(planningFolder(), 'session.json'), 'utf8'));
  const workflowPath = () => join(corpusDir, 'seed-fixture/workflow.yaml');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function call(name: string, args: Record<string, unknown>): Promise<any> {
    const result = await client.callTool({ name, arguments: args });
    if (result.isError) throw new Error(`${name} failed: ${(result.content as { text: string }[])[0]?.text}`);
    return result;
  }

  beforeAll(async () => {
    corpusDir = mkdtempSync(join(tmpdir(), 'wf-drift-corpus-'));
    cpSync(resolve(import.meta.dirname, 'fixtures/variable-model'), corpusDir, { recursive: true });
    harness = await createHarness({ workflowDir: corpusDir });
    client = harness.client;
  });

  afterAll(async () => {
    await harness.close();
    rmSync(corpusDir, { recursive: true, force: true });
  });

  it('seeds declarations the bag lacks and re-stamps the recorded version', async () => {
    await call('start_session', {
      workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(),
    });
    const created = readSession();
    expect(created.workflowVersion).toBe('1.0.0');
    expect(created.variables.late_gate).toBeUndefined();
    // A run decision the resume must not overwrite with the declared default.
    expect(created.variables.mode_label).toBe('standard');

    const edited = readFileSync(workflowPath(), 'utf8')
      .replace('version: 1.0.0', 'version: 1.1.0')
      + '\n  - name: late_gate\n    type: boolean\n    description: Declared after the session opened.\n    defaultValue: false\n';
    writeFileSync(workflowPath(), edited);

    await call('start_session', {
      workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(),
    });
    const resumed = readSession();
    expect(resumed.workflowVersion).toBe('1.1.0');
    expect(resumed.variables.late_gate).toBe(false);
    expect(resumed.variables.mode_label).toBe('standard');
  });
});
