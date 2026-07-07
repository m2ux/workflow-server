/**
 * Variable-model honesty (#166 B7): defaultValue seeding at session creation
 * and warn-only type validation of checkpoint setVariable effects.
 *
 * Runs against the fixture corpus in tests/fixtures/variable-model (not the
 * live workflows checkout) so the type-mismatch paths can be exercised — the
 * real corpus is kept mismatch-free by check:variable-model.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve, join } from 'node:path';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { seedDefaults, jsonTypeOf, isTemplateReference } from '../src/utils/variable-seed.js';
import { createInitialSessionFile } from '../src/schema/session.schema.js';

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
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workspaceDir: string;
  const planningFolder = (slug: string) => join(workspaceDir, '.engineering/artifacts/planning', slug);
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
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-b7-test-'));
    const server = createServer({
      workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model'),
      schemasDir: resolve(import.meta.dirname, '../schemas'),
      workspaceDir,
      serverName: 'test-workflow-server',
      serverVersion: '1.0.0',
      minCheckpointResponseSeconds: 0,
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test-client', version: '1.0.0' }, {});
    await client.connect(clientTransport);
    closeTransport = async () => { await client.close(); };
  });

  afterAll(async () => {
    await closeTransport();
    rmSync(workspaceDir, { recursive: true, force: true });
  });

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

  it('respond_checkpoint exempts {name} template passthroughs from type validation', async () => {
    const sessionIndex = await startAtCheckpoint('2026-07-07-type-template');
    const result = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'template-assignment' });
    const validation = (result._meta as { validation: { warnings: string[] } }).validation;
    expect(validation.warnings.filter(w => w.includes('setVariable'))).toEqual([]);
    expect(readSession('2026-07-07-type-template').variables.mode_label).toBe('{unset_marker}');
  });
});
