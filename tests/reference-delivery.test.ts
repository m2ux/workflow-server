import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve, join } from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import { contentHash, deliveredHash, recordDeliveries, unchangedMarker } from '../src/utils/delivery.js';
import { createInitialSessionFile, safeValidateSessionFile } from '../src/schema/session.schema.js';

/** An unchanged-reference marker as it appears in a parsed bundle. */
interface UnchangedMarker {
  delivery: 'unchanged';
  content_hash: string;
}

function isUnchangedMarker(value: unknown): value is UnchangedMarker {
  return typeof value === 'object' && value !== null
    && (value as Record<string, unknown>)['delivery'] === 'unchanged'
    && typeof (value as Record<string, unknown>)['content_hash'] === 'string';
}

/** Split a get_activity response into its parsed bundle (before ---) and body text (after). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function splitActivityResponse(result: any): { bundle: Record<string, unknown>; bodyText: string } {
  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const sepIdx = text.indexOf('\n\n---\n\n');
  expect(sepIdx).toBeGreaterThan(0);
  return {
    bundle: parse(text.substring(0, sepIdx)) as Record<string, unknown>,
    bodyText: text.substring(sepIdx + 7),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function responseText(result: any): string {
  return (result.content[0] as { type: 'text'; text: string }).text;
}

describe('delivery ledger helpers', () => {
  it('contentHash is deterministic and 16 hex chars', () => {
    expect(contentHash('abc')).toBe(contentHash('abc'));
    expect(contentHash('abc')).toMatch(/^[0-9a-f]{16}$/);
    expect(contentHash('abc')).not.toBe(contentHash('abd'));
  });

  it('recordDeliveries merges per-agent entries and deliveredHash reads them back', () => {
    const state = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'work-package',
      workflowVersion: '1.0.0',
      agentId: 'solo',
    });
    recordDeliveries(state, 'solo', { 'technique:a': contentHash('a') });
    recordDeliveries(state, 'solo', { 'technique:b': contentHash('b') });
    recordDeliveries(state, 'other', { 'technique:a': contentHash('x') });
    expect(deliveredHash(state, 'technique:a')).toBe(contentHash('a'));
    expect(deliveredHash(state, 'technique:b')).toBe(contentHash('b'));
    expect(state.deliveredContent?.['other']?.['technique:a']).toBe(contentHash('x'));
  });

  it('unchangedMarker carries the hash', () => {
    expect(unchangedMarker('deadbeefdeadbeef')).toEqual({ delivery: 'unchanged', content_hash: 'deadbeefdeadbeef' });
  });
});

describe('session schema: contextMode + deliveredContent', () => {
  it('accepts a session file without the delivery fields (back-compat)', () => {
    const state = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'work-package',
      workflowVersion: '1.0.0',
      agentId: 'solo',
    });
    expect(state.contextMode).toBeUndefined();
    expect(safeValidateSessionFile(state).success).toBe(true);
  });

  it('round-trips contextMode and deliveredContent', () => {
    const state = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'work-package',
      workflowVersion: '1.0.0',
      agentId: 'solo',
      contextMode: 'persistent',
    });
    recordDeliveries(state, 'solo', { 'bundle:rules': contentHash('rules') });
    const parsed = safeValidateSessionFile(JSON.parse(JSON.stringify(state)));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contextMode).toBe('persistent');
      expect(parsed.data.deliveredContent?.['solo']?.['bundle:rules']).toBe(contentHash('rules'));
    }
  });

  it('rejects an invalid contextMode value', () => {
    const state = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'work-package',
      workflowVersion: '1.0.0',
      agentId: 'solo',
    });
    const tampered = { ...JSON.parse(JSON.stringify(state)), contextMode: 'sticky' };
    expect(safeValidateSessionFile(tampered).success).toBe(false);
  });
});

describe('reference-not-repeat delivery (B1)', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workspaceDir: string;

  const planningFolder = (slug: string) => join(workspaceDir, '.engineering/artifacts/planning', slug);

  beforeAll(async () => {
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-refdel-test-'));
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

  afterAll(async () => {
    await closeTransport();
    try { rmSync(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  async function startSession(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = await client.callTool({ name: 'start_session', arguments: args });
    expect(result.isError).toBeFalsy();
    return JSON.parse(responseText(result)) as Record<string, unknown>;
  }

  async function enterActivity(sessionIndex: string, activityId: string): Promise<void> {
    const result = await client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: activityId },
    });
    expect(result.isError).toBeFalsy();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getActivity(sessionIndex: string, extra?: Record<string, unknown>): Promise<any> {
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, ...(extra ?? {}) },
    });
    expect(result.isError).toBeFalsy();
    return result;
  }

  describe('get_activity default mode is unchanged', () => {
    it('repeats the full bundle on every call and never emits markers', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');

      const first = splitActivityResponse(await getActivity(idx));
      const second = splitActivityResponse(await getActivity(idx));

      for (const parsed of [first, second]) {
        expect(parsed.bundle['bundle_mode']).toBeUndefined();
        const techniques = parsed.bundle['techniques'] as Record<string, unknown>;
        expect(Object.keys(techniques).length).toBeGreaterThan(0);
        for (const value of Object.values(techniques)) {
          expect(isUnchangedMarker(value)).toBe(false);
        }
      }
      // Byte-identical repetition — the pre-B1 behaviour full mode preserves.
      expect(responseText(await getActivity(idx))).toBe(responseText(await getActivity(idx)));
    });
  });

  describe('persistent context mode', () => {
    it('start_session echoes context_mode and re-fetching an activity collapses the bundle to markers', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-03-persistent-refetch'),
        context_mode: 'persistent',
      });
      expect(session['context_mode']).toBe('persistent');
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');

      const first = splitActivityResponse(await getActivity(idx));
      expect(first.bundle['bundle_mode']).toBe('reference');
      expect(first.bundle['bundle_note']).toBeDefined();
      const firstTechniques = first.bundle['techniques'] as Record<string, unknown>;
      // First delivery is full content — nothing has been delivered yet.
      for (const value of Object.values(firstTechniques)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
      expect(Array.isArray(first.bundle['rules'])).toBe(true);

      const second = splitActivityResponse(await getActivity(idx));
      const secondTechniques = second.bundle['techniques'] as Record<string, unknown>;
      expect(Object.keys(secondTechniques)).toEqual(Object.keys(firstTechniques));
      // Byte-identical refetch: every technique collapses to a marker.
      for (const [key, value] of Object.entries(secondTechniques)) {
        expect(isUnchangedMarker(value), `expected marker for ${key}`).toBe(true);
      }
      expect(isUnchangedMarker(second.bundle['rules'])).toBe(true);
      // The inherited worker rules block also collapses.
      const secondBody = parse(second.bodyText) as Record<string, unknown>;
      expect(isUnchangedMarker(secondBody['activity_rules'])).toBe(true);
      // The activity body itself is still delivered.
      expect(secondBody['id']).toBe('start-work-package');
      expect(secondBody['steps']).toBeDefined();

      // Marker hashes match the full content delivered on the first call.
      for (const [key, value] of Object.entries(secondTechniques)) {
        const marker = value as UnchangedMarker;
        // stringifyForResponse is YAML; hash the same projection of the first call's body.
        const { stringify } = await import('yaml');
        expect(marker.content_hash).toBe(contentHash(stringify(firstTechniques[key], { lineWidth: 0 })));
      }
    });

    it('across activities, shared inherited techniques collapse while new ones arrive in full', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-03-persistent-cross-activity'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;

      await enterActivity(idx, 'start-work-package');
      const first = splitActivityResponse(await getActivity(idx));
      const firstTechniques = first.bundle['techniques'] as Record<string, unknown>;

      // `implement` declares its own activity-level technique (scatter-gather)
      // on top of the workflow-inherited set.
      await enterActivity(idx, 'implement');
      const second = splitActivityResponse(await getActivity(idx));
      const secondTechniques = second.bundle['techniques'] as Record<string, unknown>;

      // The workflow-inherited technique appears in both bundles; the second
      // delivery is a marker because the composed content is byte-identical.
      expect(Object.keys(firstTechniques)).toContain('variable-binding');
      expect(isUnchangedMarker(secondTechniques['variable-binding'])).toBe(true);

      // Techniques introduced by the second activity arrive in full.
      const newKeys = Object.keys(secondTechniques).filter(k => !(k in firstTechniques));
      expect(newKeys).toContain('scatter-gather');
      for (const key of newKeys) {
        expect(isUnchangedMarker(secondTechniques[key]), `expected full content for ${key}`).toBe(false);
      }
    });

    it('bundle: "full" overrides persistent mode and re-delivers everything', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-03-persistent-full-escape'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');
      await getActivity(idx);

      const forced = splitActivityResponse(await getActivity(idx, { bundle: 'full' }));
      expect(forced.bundle['bundle_mode']).toBeUndefined();
      const techniques = forced.bundle['techniques'] as Record<string, unknown>;
      for (const value of Object.values(techniques)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
      expect(Array.isArray(forced.bundle['rules'])).toBe(true);
    });

    it('persists contextMode and the delivery ledger in session.json', async () => {
      const slug = '2026-07-03-persistent-ledger-on-disk';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');
      await getActivity(idx);

      const onDisk = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));
      expect(onDisk.contextMode).toBe('persistent');
      expect(onDisk.deliveredContent?.solo).toBeDefined();
      const keys = Object.keys(onDisk.deliveredContent.solo as Record<string, string>);
      expect(keys.some(k => k.startsWith('bundle:'))).toBe(true);
      // Rules entries are content-keyed (set semantics) so alternating rule
      // sets across activities still collapse.
      expect(keys.some(k => /^bundle:rules:[0-9a-f]{16}$/.test(k))).toBe(true);
      expect(keys.some(k => /^activity_rules:[0-9a-f]{16}$/.test(k))).toBe(true);
    });

    it('a different agent_id on resume starts from an empty ledger (full delivery)', async () => {
      const slug = '2026-07-03-agent-switch';
      const sessionA = await startSession({
        workflow_id: 'work-package',
        agent_id: 'agent-a',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = sessionA['session_index'] as string;
      await enterActivity(idx, 'start-work-package');
      await getActivity(idx);
      // Same agent: refetch collapses.
      const collapsed = splitActivityResponse(await getActivity(idx));
      expect(isUnchangedMarker((collapsed.bundle['techniques'] as Record<string, unknown>)['variable-binding'])).toBe(true);

      // Resume the same session as a different agent: reference mode is still
      // active (contextMode persisted) but agent-b's ledger is empty, so the
      // bundle arrives in full.
      const sessionB = await startSession({
        workflow_id: 'work-package',
        agent_id: 'agent-b',
        planning_folder: planningFolder(slug),
      });
      expect(sessionB['session_index']).toBe(idx);
      expect(sessionB['context_mode']).toBe('persistent');

      const afterSwitch = splitActivityResponse(await getActivity(idx));
      expect(afterSwitch.bundle['bundle_mode']).toBe('reference');
      const techniques = afterSwitch.bundle['techniques'] as Record<string, unknown>;
      for (const value of Object.values(techniques)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
    });
  });

  describe('per-call bundle: "reference" opt-in on a default session', () => {
    it('references content recorded by earlier full-mode deliveries', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');

      // Default full-mode call: delivers and records.
      const first = splitActivityResponse(await getActivity(idx));
      expect(first.bundle['bundle_mode']).toBeUndefined();

      // Explicit per-call opt-in: everything already delivered collapses.
      const referenced = splitActivityResponse(await getActivity(idx, { bundle: 'reference' }));
      expect(referenced.bundle['bundle_mode']).toBe('reference');
      const techniques = referenced.bundle['techniques'] as Record<string, unknown>;
      for (const [key, value] of Object.entries(techniques)) {
        expect(isUnchangedMarker(value), `expected marker for ${key}`).toBe(true);
      }
      expect(isUnchangedMarker(referenced.bundle['rules'])).toBe(true);

      // Omitting the opt-in returns to full delivery.
      const backToFull = splitActivityResponse(await getActivity(idx));
      expect(backToFull.bundle['bundle_mode']).toBeUndefined();
      for (const value of Object.values(backToFull.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
    });
  });

  describe('get_technique delta mode', () => {
    async function findTechniqueStepId(idx: string): Promise<string> {
      const parsed = splitActivityResponse(await getActivity(idx, { bundle: 'full' }));
      const body = parse(parsed.bodyText) as { steps?: Array<{ id?: string; technique?: unknown }> };
      const step = (body.steps ?? []).find(s => typeof s.technique === 'string' && s.id);
      expect(step, 'expected a technique-bound step').toBeTruthy();
      return step!.id!;
    }

    it('answers a byte-identical refetch with an unchanged-reference; full: true re-fetches', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-03-technique-delta'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'codebase-comprehension');
      const stepId = await findTechniqueStepId(idx);

      // Eager bundling may already have delivered this step's technique via get_activity, so
      // establish a known-full baseline with full: true before exercising the delta collapse.
      const first = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepId, full: true },
      });
      expect(first.isError).toBeFalsy();
      expect(responseText(first)).toContain('capability:');

      const second = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepId },
      });
      expect(second.isError).toBeFalsy();
      const secondText = responseText(second);
      expect(secondText).not.toContain('capability:');
      const stub = parse(secondText.substring(secondText.indexOf('\n\n') + 2)) as Record<string, unknown>;
      expect(stub['delivery']).toBe('unchanged');
      expect(stub['content_hash']).toMatch(/^[0-9a-f]{16}$/);
      expect(stub['note']).toBeDefined();
      expect((second._meta as Record<string, unknown>)['delivery']).toBe('unchanged');

      const escaped = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepId, full: true },
      });
      expect(escaped.isError).toBeFalsy();
      expect(responseText(escaped)).toContain('capability:');
      expect(responseText(escaped)).toBe(responseText(first));
    });

    it('never returns references on a default (fresh-context) session', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'codebase-comprehension');
      const stepId = await findTechniqueStepId(idx);

      const first = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepId },
      });
      const second = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepId },
      });
      expect(responseText(first)).toContain('capability:');
      expect(responseText(second)).toBe(responseText(first));
    });

    it('applies to the workflow-level technique before any activity', async () => {
      // The default (meta) workflow declares techniques.workflow, so a
      // pre-activity get_technique resolves its first entry.
      const session = await startSession({ agent_id: 'solo-meta', context_mode: 'persistent' });
      expect(session['context_mode']).toBe('persistent');
      const idx = session['session_index'] as string;

      const first = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx },
      });
      expect(first.isError).toBeFalsy();
      expect(responseText(first)).toContain('capability:');

      const second = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx },
      });
      expect(second.isError).toBeFalsy();
      const secondText = responseText(second);
      expect(secondText).not.toContain('capability:');
      const stub = parse(secondText.substring(secondText.indexOf('\n\n') + 2)) as Record<string, unknown>;
      expect(stub['delivery']).toBe('unchanged');

      const escaped = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, full: true },
      });
      expect(responseText(escaped)).toBe(responseText(first));
    });
  });

  describe('binding-seam provenance (B3)', () => {
    async function findTechniqueStepId(idx: string): Promise<string> {
      const parsed = splitActivityResponse(await getActivity(idx, { bundle: 'full' }));
      const body = parse(parsed.bodyText) as { steps?: Array<{ id?: string; technique?: unknown }> };
      const step = (body.steps ?? []).find(s => typeof s.technique === 'string' && s.id);
      expect(step, 'expected a technique-bound step').toBeTruthy();
      return step!.id!;
    }

    it('a step-bound fetch annotates own inputs, noteworthy inherited ones, and warns on UNRESOLVED', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'design-philosophy');

      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'define-problem' },
      });
      expect(result.isError).toBeFalsy();
      const text = responseText(result);
      const technique = parse(text.substring(text.indexOf('\n\n') + 2)) as {
        provenance_note?: string;
        inputs?: Array<{ id: string; source?: string }>;
        inherited_inputs?: { items: Array<{ id: string; source?: string }> };
      };
      expect(technique.provenance_note).toBeDefined();
      // Own inputs are always annotated; the documented seam case resolves as authored.
      for (const input of technique.inputs ?? []) {
        expect(input.source, `expected a source on own input '${input.id}'`).toBeDefined();
      }
      const own = new Map((technique.inputs ?? []).map((i) => [i.id, i.source]));
      expect(own.get('issue_details')).toMatch(/^UNRESOLVED/);
      expect(own.get('problem_context')).toContain('optional input');
      // Inherited entries carry a source only where it says something the block note does not
      // (e.g. a later-positioned producer); settled ambient constants stay bare.
      const inherited = technique.inherited_inputs?.items ?? [];
      expect(inherited.length).toBeGreaterThan(0);
      expect(inherited.some((i) => i.source === undefined)).toBe(true);
      for (const item of inherited) {
        if (item.source !== undefined) {
          expect(item.source).toMatch(/produced later in the workflow|step-binding/);
        }
      }
      // The UNRESOLVED own input surfaces as a warn-only validation entry.
      const validation = (result._meta as Record<string, unknown>)['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('warning');
      expect(validation.warnings.some((w) => w.includes("'issue_details'"))).toBe(true);
    });

    it('a fetch without step context carries no provenance', async () => {
      // Pre-activity fetch of the default (meta) workflow's first declared technique —
      // no step binding to resolve against.
      const session = await startSession({ agent_id: 'w1' });
      const idx = session['session_index'] as string;

      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx },
      });
      expect(result.isError).toBeFalsy();
      expect(responseText(result)).toContain('capability:');
      expect(responseText(result)).not.toContain('provenance_note:');
    });
  });

  describe('context_mode on resume', () => {
    it('resuming with context_mode: "fresh" downgrades a persistent session to full delivery', async () => {
      const slug = '2026-07-03-resume-downgrade';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');
      await getActivity(idx);
      // Sanity: reference mode is active before the downgrade.
      const collapsed = splitActivityResponse(await getActivity(idx));
      expect(collapsed.bundle['bundle_mode']).toBe('reference');

      const resumed = await startSession({
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'fresh',
      });
      expect(resumed['session_index']).toBe(idx);
      expect(resumed['context_mode']).toBe('fresh');

      const afterDowngrade = splitActivityResponse(await getActivity(idx));
      expect(afterDowngrade.bundle['bundle_mode']).toBeUndefined();
      for (const value of Object.values(afterDowngrade.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
    });

    it('resuming with context_mode: "persistent" upgrades a default session and references full-mode deliveries', async () => {
      const slug = '2026-07-03-resume-upgrade';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
      });
      const idx = session['session_index'] as string;
      await enterActivity(idx, 'start-work-package');
      // Full-mode delivery records to the ledger.
      await getActivity(idx);

      const resumed = await startSession({
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      expect(resumed['context_mode']).toBe('persistent');

      const afterUpgrade = splitActivityResponse(await getActivity(idx));
      expect(afterUpgrade.bundle['bundle_mode']).toBe('reference');
      for (const [key, value] of Object.entries(afterUpgrade.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value), `expected marker for ${key}`).toBe(true);
      }
    });
  });

  describe('dispatch_child context_mode', () => {
    it('threads context_mode to the child and the ledger lands on the embedded child state', async () => {
      const slug = '2026-07-03-child-ledger';
      const parent = await startSession({
        workflow_id: 'work-package',
        agent_id: 'parent-orch',
        planning_folder: planningFolder(slug),
      });
      const parentIdx = parent['session_index'] as string;

      const dispatch = await client.callTool({
        name: 'dispatch_child',
        arguments: { session_index: parentIdx, workflow_id: 'work-package', agent_id: 'child-worker', context_mode: 'persistent' },
      });
      expect(dispatch.isError).toBeFalsy();
      const childIdx = (JSON.parse(responseText(dispatch)) as Record<string, unknown>)['session_index'] as string;
      expect(childIdx).not.toBe(parentIdx);

      await enterActivity(childIdx, 'start-work-package');
      const first = splitActivityResponse(await getActivity(childIdx));
      expect(first.bundle['bundle_mode']).toBe('reference');
      const second = splitActivityResponse(await getActivity(childIdx));
      for (const [key, value] of Object.entries(second.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value), `expected marker for ${key}`).toBe(true);
      }

      // The ledger belongs to the embedded child state, keyed by the child's
      // agent_id; the parent's top level stays clean, and the whole file still
      // loads (seal + schema) after the nested write.
      const onDisk = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));
      expect(onDisk.deliveredContent).toBeUndefined();
      expect(onDisk.triggeredWorkflows[0].state.contextMode).toBe('persistent');
      const childLedger = onDisk.triggeredWorkflows[0].state.deliveredContent as Record<string, Record<string, string>>;
      expect(Object.keys(childLedger)).toEqual(['child-worker']);
      expect(Object.keys(childLedger['child-worker']!).length).toBeGreaterThan(0);
    });
  });

  describe('changed content re-delivers in full', () => {
    it('a technique mutated mid-session arrives full once, then collapses under its new hash', async () => {
      // Second server over a mutable copy of the workflows dir, so the
      // definition can change between calls without touching the shared copy.
      const mutableWorkflowDir = mkdtempSync(join(tmpdir(), 'wf-refdel-mutable-'));
      const mutableWorkspace = mkdtempSync(join(tmpdir(), 'wf-refdel-ws2-'));
      cpSync(resolve(import.meta.dirname, '../workflows'), mutableWorkflowDir, {
        recursive: true,
        filter: (src) => !src.includes('.git'),
      });
      const server2 = createServer({
        workflowDir: mutableWorkflowDir,
        schemasDir: resolve(import.meta.dirname, '../schemas'),
        workspaceDir: mutableWorkspace,
        serverName: 'test-workflow-server-2',
        serverVersion: '1.0.0',
        minCheckpointResponseSeconds: 0,
      });
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      await server2.connect(serverTransport);
      const client2 = new Client({ name: 'test-client-2', version: '1.0.0' }, {});
      await client2.connect(clientTransport);

      try {
        const startResult = await client2.callTool({
          name: 'start_session',
          arguments: {
            workflow_id: 'work-package',
            agent_id: 'solo',
            planning_folder: join(mutableWorkspace, '.engineering/artifacts/planning', '2026-07-03-mutable'),
            context_mode: 'persistent',
          },
        });
        expect(startResult.isError).toBeFalsy();
        const idx = (JSON.parse(responseText(startResult)) as Record<string, unknown>)['session_index'] as string;
        await client2.callTool({
          name: 'next_activity',
          arguments: { session_index: idx, activity_id: 'start-work-package' },
        });
        const call1 = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx, context_tokens: 200_000 } });
        expect(call1.isError).toBeFalsy();

        // Mutate the workflow-inherited technique between calls.
        const techniqueFile = join(mutableWorkflowDir, 'meta/techniques/variable-binding.md');
        const original = readFileSync(techniqueFile, 'utf8');
        expect(original).toContain('Bind a step');
        writeFileSync(techniqueFile, original.replace('## Capability\n\nBind a step', '## Capability\n\nMUTATED: Bind a step'));

        // The changed technique arrives in full (new content, hash mismatch);
        // untouched techniques collapse to markers.
        const call2 = splitActivityResponse(await (async () => {
          const r = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx, context_tokens: 200_000 } });
          expect(r.isError).toBeFalsy();
          return r;
        })());
        const techniques2 = call2.bundle['techniques'] as Record<string, unknown>;
        expect(isUnchangedMarker(techniques2['variable-binding'])).toBe(false);
        expect(JSON.stringify(techniques2['variable-binding'])).toContain('MUTATED');
        const otherKeys = Object.keys(techniques2).filter(k => k !== 'variable-binding');
        expect(otherKeys.length).toBeGreaterThan(0);
        for (const key of otherKeys) {
          expect(isUnchangedMarker(techniques2[key]), `expected marker for ${key}`).toBe(true);
        }

        // The ledger now records the new hash: a further refetch collapses again.
        const call3 = splitActivityResponse(await (async () => {
          const r = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx, context_tokens: 200_000 } });
          expect(r.isError).toBeFalsy();
          return r;
        })());
        expect(isUnchangedMarker((call3.bundle['techniques'] as Record<string, unknown>)['variable-binding'])).toBe(true);
      } finally {
        await client2.close();
        await server2.close();
        try { rmSync(mutableWorkflowDir, { recursive: true, force: true }); } catch { /* ignore */ }
        try { rmSync(mutableWorkspace, { recursive: true, force: true }); } catch { /* ignore */ }
      }
    });
  });

  // C2 — block-level delivery ledger (#189). Finer-grained than the whole-technique
  // dedup above: a NOT-yet-seen technique whose shared contract/rules blocks were already
  // delivered (by a sibling technique or an earlier fetch) returns those blocks as markers
  // while its technique-specific core stays full — the case whole-payload hashing cannot
  // catch, since the core always changes the whole hash.
  describe('block-level delivery ledger (C2)', () => {
    // Parse a get_technique response body into its technique record (drops the
    // `session_index:` header line before the first blank line).
    function parseTechniqueBody(result: { content: Array<{ text: string }> }): Record<string, unknown> {
      const text = responseText(result as never);
      return parse(text.substring(text.indexOf('\n\n') + 2)) as Record<string, unknown>;
    }

    // Two distinct technique-bound steps within an activity, discovered on a THROWAWAY
    // fresh session so the probe's get_activity does not pollute the test session's
    // ledger (eager bundling records whole-technique keys in every mode). The C2 tests
    // then fetch these steps directly via get_technique, never calling get_activity, so a
    // block-marker (not a whole-technique marker) is exercised on the second fetch.
    async function findTwoTechniqueStepIds(activityId: string): Promise<[string, string]> {
      const probe = await startSession({ workflow_id: 'work-package', agent_id: 'probe' });
      const probeIdx = probe['session_index'] as string;
      await enterActivity(probeIdx, activityId);
      const parsed = splitActivityResponse(await getActivity(probeIdx, { bundle: 'full' }));
      const body = parse(parsed.bodyText) as { steps?: Array<{ id?: string; technique?: unknown }> };
      const flat: Array<{ id?: string; technique?: unknown }> = [];
      const walk = (steps?: Array<{ id?: string; technique?: unknown; steps?: unknown }>): void => {
        for (const s of steps ?? []) {
          if (Array.isArray((s as { steps?: unknown }).steps)) walk((s as { steps?: Array<{ id?: string; technique?: unknown }> }).steps);
          else if (typeof s.technique === 'string' && s.id) flat.push(s);
        }
      };
      walk(body.steps as never);
      const ids = flat.map(s => s.id!).filter((v, i, a) => a.indexOf(v) === i);
      expect(ids.length, 'expected at least two technique-bound steps').toBeGreaterThanOrEqual(2);
      return [ids[0], ids[1]];
    }

    it('collapses already-delivered contract/rules blocks to markers while the core stays full', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-12-block-dedup-cross-technique'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      const [stepA, stepB] = await findTwoTechniqueStepIds('implement');
      await enterActivity(idx, 'implement');

      // Technique A (persistent, no prior get_activity) delivers in full and establishes
      // the shared contract blocks in the ledger.
      const first = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepA },
      });
      expect(first.isError).toBeFalsy();
      const bodyA = parseTechniqueBody(first as never);
      expect(bodyA['capability']).toBeDefined();
      // At least one shared block is present and delivered full (an object, not a marker).
      const sharedBlocks = ['inherited_inputs', 'inherited_outputs', 'rules'] as const;
      const presentInA = sharedBlocks.filter(b => bodyA[b] !== undefined);
      expect(presentInA.length, 'technique A should carry at least one shared block').toBeGreaterThan(0);
      for (const b of presentInA) expect(isUnchangedMarker(bodyA[b])).toBe(false);

      // Technique B (not yet seen): its OWN core is delivered full, but any shared block
      // whose content matches one already delivered by A collapses to a marker.
      const second = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepB },
      });
      expect(second.isError).toBeFalsy();
      const bodyB = parseTechniqueBody(second as never);
      // B is not the same technique as A — its core (capability) is delivered full.
      expect(bodyB['capability']).toBeDefined();
      // The inherited contract is shared across a workflow's techniques, so at least one
      // block collapses to a marker whose hash matches A's block projection.
      const { stringify } = await import('yaml');
      const collapsed = sharedBlocks.filter(b => isUnchangedMarker(bodyB[b]));
      expect(collapsed.length, 'expected at least one shared block to collapse for technique B').toBeGreaterThan(0);
      for (const b of collapsed) {
        const marker = bodyB[b] as UnchangedMarker;
        expect(marker.content_hash).toBe(contentHash(stringify({ [b]: bodyA[b] }, { lineWidth: 0 })));
      }
    });

    it('full: true re-delivers every block full even when block-delivered', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-12-block-dedup-full-escape'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      const [stepA, stepB] = await findTwoTechniqueStepIds('implement');
      await enterActivity(idx, 'implement');

      await client.callTool({ name: 'get_technique', arguments: { session_index: idx, step_id: stepA } });
      // B under reference delivery would collapse shared blocks; full: true forces full.
      const forced = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepB, full: true },
      });
      expect(forced.isError).toBeFalsy();
      const body = parseTechniqueBody(forced as never);
      for (const b of ['inherited_inputs', 'inherited_outputs', 'rules'] as const) {
        if (body[b] !== undefined) expect(isUnchangedMarker(body[b]), `expected full ${b} under full:true`).toBe(false);
      }
    });

    it('fresh mode never markers blocks', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      const [stepA, stepB] = await findTwoTechniqueStepIds('implement');
      await enterActivity(idx, 'implement');

      await client.callTool({ name: 'get_technique', arguments: { session_index: idx, step_id: stepA } });
      const second = await client.callTool({ name: 'get_technique', arguments: { session_index: idx, step_id: stepB } });
      const body = parseTechniqueBody(second as never);
      for (const b of ['inherited_inputs', 'inherited_outputs', 'rules'] as const) {
        if (body[b] !== undefined) expect(isUnchangedMarker(body[b]), `fresh mode must not marker ${b}`).toBe(false);
      }
    });

    it('records block hashes under the technique:<block>:<hash> channel', async () => {
      const slug = '2026-07-12-block-dedup-ledger-keys';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      const [stepA] = await findTwoTechniqueStepIds('implement');
      await enterActivity(idx, 'implement');
      await client.callTool({ name: 'get_technique', arguments: { session_index: idx, step_id: stepA } });

      const onDisk = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));
      const keys = Object.keys(onDisk.deliveredContent.solo as Record<string, string>);
      expect(keys.some(k => /^technique:(inherited_inputs|inherited_outputs|rules):[0-9a-f]{16}$/.test(k))).toBe(true);
    });

    // The eager-bundle path is the second call site of dedupTechniqueBlocks (the cases above
    // exercise get_technique). Within a single persistent get_activity, the bundled step
    // techniques are projected in document order, so a later step whose shared contract/rules
    // block matches one an earlier bundled step already delivered collapses to a marker while
    // its own core stays full — all in one response.
    it('collapses shared blocks inside get_activity eager step_techniques entries', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-12-block-dedup-eager-bundle'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      // Entry activity: no transition prerequisites, and it eager-bundles several
      // technique steps that share the work-package contract.
      await enterActivity(idx, 'start-work-package');

      const { bundle } = splitActivityResponse(await getActivity(idx));
      expect(bundle['bundle_mode']).toBe('reference');
      const stq = bundle['step_techniques'] as Record<string, Record<string, unknown>>;
      expect(stq, 'expected an eager step_techniques bundle').toBeDefined();
      expect(Object.keys(stq).length, 'need >=2 bundled steps to dedup across siblings').toBeGreaterThanOrEqual(2);

      const sharedBlocks = ['inherited_inputs', 'inherited_outputs', 'rules'] as const;
      let fullBlockSeen = false;
      let markerBlockSeen = false;
      for (const entry of Object.values(stq)) {
        // A whole-technique unchanged marker carries no block fields; skip it — we assert on
        // otherwise-full entries whose individual blocks may be markered.
        if (isUnchangedMarker(entry)) continue;
        expect(entry['capability'], 'a full entry keeps its technique-specific core').toBeDefined();
        for (const b of sharedBlocks) {
          if (entry[b] === undefined) continue;
          if (isUnchangedMarker(entry[b])) markerBlockSeen = true;
          else fullBlockSeen = true;
        }
      }
      // The first bundled occurrence of each shared block is delivered full; a later sibling
      // sharing that block collapses it to a marker.
      expect(fullBlockSeen, 'at least one shared block delivered full').toBe(true);
      expect(markerBlockSeen, 'at least one sibling shared block collapsed to a marker').toBe(true);
    });
  });

  // C12 — get_workflow orchestrator ops-bundle slimming (#189). Under persistent mode the
  // ops bundle (above the `---` separator) collapses to a single content-keyed
  // workflow_bundle:<hash> marker on the second (resume) call; fresh mode always sends it full.
  describe('get_workflow ops-bundle slimming (C12)', () => {
    function splitWorkflowResponse(result: { content: Array<{ text: string }> }): { opsBlock: string; summary: Record<string, unknown> } {
      const text = responseText(result as never);
      const sepIdx = text.indexOf('\n\n---\n\n');
      expect(sepIdx).toBeGreaterThan(0);
      return {
        opsBlock: text.substring(0, sepIdx),
        summary: parse(text.substring(sepIdx + 7)) as Record<string, unknown>,
      };
    }

    it('collapses the ops bundle on a second persistent-mode call; summary stays full', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-12-c12-persistent'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;

      const first = await client.callTool({ name: 'get_workflow', arguments: { session_index: idx } });
      expect(first.isError).toBeFalsy();
      const firstSplit = splitWorkflowResponse(first as never);
      // First call: ops bundle delivered full (carries technique bodies, not a marker).
      expect(firstSplit.opsBlock).toContain('capability:');
      expect(isUnchangedMarker(parse(firstSplit.opsBlock))).toBe(false);

      const second = await client.callTool({ name: 'get_workflow', arguments: { session_index: idx } });
      expect(second.isError).toBeFalsy();
      const secondSplit = splitWorkflowResponse(second as never);
      // Second (resume) call: ops bundle collapses to the canonical marker; summary stays full.
      const marker = parse(secondSplit.opsBlock) as Record<string, unknown>;
      expect(marker['delivery']).toBe('unchanged');
      expect(marker['content_hash']).toBe(contentHash(firstSplit.opsBlock));
      expect(marker['note']).toBeDefined();
      expect(secondSplit.summary['initialActivity']).toBeDefined();
      expect(secondSplit.summary['activities']).toBeDefined();
    });

    it('never markers the ops bundle in fresh mode', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;

      const first = await client.callTool({ name: 'get_workflow', arguments: { session_index: idx } });
      const second = await client.callTool({ name: 'get_workflow', arguments: { session_index: idx } });
      expect(first.isError).toBeFalsy();
      expect(second.isError).toBeFalsy();
      // Ops bundle repeats in full on every call — byte-identical, never a marker.
      expect(splitWorkflowResponse(first as never).opsBlock).toContain('capability:');
      expect(splitWorkflowResponse(second as never).opsBlock).toBe(splitWorkflowResponse(first as never).opsBlock);
    });

    it('records the workflow_bundle:<hash> channel key on first persistent delivery', async () => {
      const slug = '2026-07-12-c12-ledger-key';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await client.callTool({ name: 'get_workflow', arguments: { session_index: idx } });

      const onDisk = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));
      const keys = Object.keys(onDisk.deliveredContent.solo as Record<string, string>);
      expect(keys.some(k => /^workflow_bundle:[0-9a-f]{16}$/.test(k))).toBe(true);
    });
  });
});
