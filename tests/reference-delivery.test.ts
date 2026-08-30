import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { join } from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import { contentHash, deliveredHash, recordDeliveries, unchangedMarker } from '../src/utils/delivery.js';
import { createInitialSessionFile, safeValidateSessionFile } from '../src/schema/session.schema.js';
import { corpusRoot } from './corpus-root.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

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
  let harness: Harness;
  let client: Client;
  let mcp: SessionOps;

  const planningFolder = (slug: string) => mcp.folder(slug);

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    mcp = sessionOps(harness, 'work-package');
  });

  afterAll(async () => { await harness.close(); });

  async function startSession(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = await client.callTool({ name: 'start_session', arguments: args });
    expect(result.isError).toBeFalsy();
    return JSON.parse(responseText(result)) as Record<string, unknown>;
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

  describe('get_activity in the default mode', () => {
    it('delivers the worker bundle in full to an identity the server has not met', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');

      const first = splitActivityResponse(await getActivity(idx));
      expect(first.bundle['bundle_mode']).toBeUndefined();
      const techniques = first.bundle['techniques'] as Record<string, unknown>;
      expect(Object.keys(techniques).length).toBeGreaterThan(0);
      for (const value of Object.values(techniques)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
    });

    it('refers an identity it has already delivered to back to the bundle it holds', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');
      await getActivity(idx);

      // Same agent_id, no context_mode declared: the orchestrator holds one identity for as long as
      // a worker carries its batch, so a second delivery under it is that same context arriving again.
      const second = splitActivityResponse(await getActivity(idx));
      const techniques = second.bundle['techniques'] as Record<string, unknown>;
      for (const [key, value] of Object.entries(techniques)) {
        expect(isUnchangedMarker(value), `expected a marker for ${key}`).toBe(true);
      }
      expect(isUnchangedMarker(second.bundle['rules'])).toBe(true);
      expect(second.bundle['bundle_note']).toBeDefined();
      // The activity body is never collapsed, whatever the identity holds.
      expect(second.bodyText.length).toBeGreaterThan(0);
    });

    it('re-delivers everything to a fresh identity in the same session', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');
      await getActivity(idx);

      const replacement = splitActivityResponse(await getActivity(idx, { agent_id: 'w2' }));
      for (const value of Object.values(replacement.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value)).toBe(false);
      }
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
      await mcp.enter(idx, 'start-work-package');

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
      // The activity body itself is still delivered. (`work-package` declares no rules buckets of
      // its own — its conduct comes from the conduct home and its one activity-scoped rule set sits
      // on the activity that owns it — so no inherited `activity_rules` block reaches this worker.
      // The block's own dedup path is covered against `requirements-refinement` below.)
      const secondBody = parse(second.bodyText) as Record<string, unknown>;
      expect(secondBody['activity_rules']).toBeUndefined();
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

    it('the inherited activity_rules block collapses on refetch', async () => {
      // `requirements-refinement` declares both `rules.activity` and `rules.universal`, the two
      // buckets every activity inherits — so its get_activity carries an `activity_rules` block.
      const session = await startSession({
        workflow_id: 'requirements-refinement',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-03-persistent-activity-rules'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'intake-and-analyze');

      const firstBody = parse(splitActivityResponse(await getActivity(idx)).bodyText) as Record<string, unknown>;
      expect(Array.isArray(firstBody['activity_rules'])).toBe(true);
      expect((firstBody['activity_rules'] as unknown[]).length).toBeGreaterThan(0);

      const secondBody = parse(splitActivityResponse(await getActivity(idx)).bodyText) as Record<string, unknown>;
      expect(isUnchangedMarker(secondBody['activity_rules'])).toBe(true);
      // The activity body itself is still delivered in full.
      expect(secondBody['id']).toBe('intake-and-analyze');
    });

    it('across activities, shared inherited techniques collapse while new ones arrive in full', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-03-persistent-cross-activity'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;

      await mcp.enter(idx, 'start-work-package');
      const first = splitActivityResponse(await getActivity(idx));
      const firstTechniques = first.bundle['techniques'] as Record<string, unknown>;

      // `implement` declares its own activity-level technique (scatter-gather)
      // on top of the workflow-inherited set.
      await mcp.enter(idx, 'implement');
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
      await mcp.enter(idx, 'start-work-package');
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
      // `requirements-refinement` declares inherited `rules.activity` / `rules.universal`, so one
      // walk exercises all three key shapes asserted below, `activity_rules:*` included.
      const session = await startSession({
        workflow_id: 'requirements-refinement',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'intake-and-analyze');
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
      await mcp.enter(idx, 'start-work-package');
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
      await mcp.enter(idx, 'start-work-package');

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

      // Omitting the opt-in drops `bundle_mode`, and `bundle: "full"` is what re-delivers the
      // bundle this identity has already been sent.
      const backToFull = splitActivityResponse(await getActivity(idx));
      expect(backToFull.bundle['bundle_mode']).toBeUndefined();

      const forced = splitActivityResponse(await getActivity(idx, { bundle: 'full' }));
      for (const value of Object.values(forced.bundle['techniques'] as Record<string, unknown>)) {
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
      await mcp.enter(idx, 'codebase-comprehension');
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
      await mcp.enter(idx, 'codebase-comprehension');
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

    // The UNRESOLVED warn path is unit-covered in binding-provenance.test.ts against a synthetic
    // fixture. It used to be asserted here against `design-philosophy::define`'s `issue_details`,
    // which #336 closed by renaming the input to the `issue_record` its producers already declare —
    // a corpus fixture for a defect state goes green the moment the defect is fixed, so this case
    // now pins the RESOLVED annotation instead: a producer in an earlier activity, named.
    it('a step-bound fetch annotates own inputs and noteworthy inherited ones', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'post-impl-review');

      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'code-review' },
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
      expect(own.get('changed_files')).toMatch(/output of step '.+' \(activity '.+'\)/);
      // The optional-with-no-producer form is pinned on a technique that has one: every own input
      // of `review-code` resolves to a producer, so it cannot exhibit that annotation.
      await mcp.enter(idx, 'design-philosophy');
      const optionalCase = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'define-problem' },
      });
      expect(optionalCase.isError).toBeFalsy();
      const optionalText = responseText(optionalCase);
      const defineTechnique = parse(optionalText.substring(optionalText.indexOf('\n\n') + 2)) as {
        inputs?: Array<{ id: string; source?: string }>;
      };
      const defineOwn = new Map((defineTechnique.inputs ?? []).map((i) => [i.id, i.source]));
      expect(defineOwn.get('problem_context')).toContain('optional input');
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
      // Every own input resolves at this seam, so the fetch validates clean with no warnings.
      const validation = (result._meta as Record<string, unknown>)['validation'] as { status: string; warnings: string[] };
      expect(validation.status).toBe('valid');
      expect(validation.warnings).toEqual([]);
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
      await mcp.enter(idx, 'start-work-package');
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
      await mcp.enter(idx, 'start-work-package');
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

      await mcp.enter(childIdx, 'start-work-package');
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
      cpSync(corpusRoot(), mutableWorkflowDir, {
        recursive: true,
        filter: (src) => !src.includes('.git'),
      });
      const mutable = await createHarness({ workflowDir: mutableWorkflowDir });
      const client2 = mutable.client;
      const mutableSession = sessionOps(mutable, 'work-package');

      try {
        const idx = await mutableSession.start('2026-07-03-mutable', 'solo', 'persistent');
        await client2.callTool({
          name: 'next_activity',
          arguments: { session_index: idx, activity_id: 'start-work-package' },
        });
        const call1 = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx, context_tokens: 200_000 } });
        expect(call1.isError).toBeFalsy();

        // Mutate the workflow-inherited technique between calls.
        const techniqueFile = join(mutableWorkflowDir, 'meta/techniques/variable-binding.md');
        // Anchor the mutation on the structural heading, not on the capability's wording —
        // the latter is corpus prose and drifts.
        const original = readFileSync(techniqueFile, 'utf8');
        expect(original).toContain('## Capability\n');
        writeFileSync(techniqueFile, original.replace('## Capability\n', '## Capability\n\nMUTATED.\n'));

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
        await mutable.close();
        try { rmSync(mutableWorkflowDir, { recursive: true, force: true }); } catch { /* ignore */ }
      }
    });
  });

  // Block-level delivery ledger. Finer-grained than the whole-technique dedup above:
  // a NOT-yet-seen technique whose shared contract/rules blocks were already delivered
  // (by a sibling technique or an earlier fetch) returns those blocks as markers while
  // its technique-specific core stays full — the case whole-payload hashing cannot catch,
  // since the core always changes the whole hash.
  describe('block-level delivery ledger', () => {
    // Parse a get_technique response body into its technique record (drops the
    // `session_index:` header line before the first blank line).
    function parseTechniqueBody(result: { content: Array<{ text: string }> }): Record<string, unknown> {
      const text = responseText(result as never);
      return parse(text.substring(text.indexOf('\n\n') + 2)) as Record<string, unknown>;
    }

    // Two distinct technique-bound steps within an activity, discovered on a THROWAWAY
    // fresh session so the probe's get_activity does not pollute the test session's
    // ledger (eager bundling records whole-technique keys in every mode). These tests
    // then fetch these steps directly via get_technique, never calling get_activity, so a
    // block-marker (not a whole-technique marker) is exercised on the second fetch.
    async function findTwoTechniqueStepIds(activityId: string): Promise<[string, string]> {
      const probe = await startSession({ workflow_id: 'work-package', agent_id: 'probe' });
      const probeIdx = probe['session_index'] as string;
      await mcp.enter(probeIdx, activityId);
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
      // Two operations of the same group, so the contracts the loader merges into both are
      // identical and a collapse is possible at all. Across groups the inherited blocks differ by
      // construction, and nothing delivered twice would be there to collapse.
      const stepA = 'review-strategy';
      const stepB = 'document-findings';
      await mcp.enter(idx, 'strategic-review');

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
      await mcp.enter(idx, 'implement');

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
      await mcp.enter(idx, 'implement');

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
      await mcp.enter(idx, 'implement');
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
      await mcp.enter(idx, 'start-work-package');

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

    it('PR366-TC-08: provenance_note collapses to marker on second sibling technique', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-31-block-dedup-provenance-note'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      const [stepA, stepB] = await findTwoTechniqueStepIds('implement');
      await mcp.enter(idx, 'implement');
      const first = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepA },
      });
      expect(first.isError).toBeFalsy();
      const bodyA = parseTechniqueBody(first as never);
      if (bodyA['provenance_note'] === undefined) return; // corpus without provenance is out of scope
      expect(isUnchangedMarker(bodyA['provenance_note'])).toBe(false);
      const second = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepB },
      });
      expect(second.isError).toBeFalsy();
      const bodyB = parseTechniqueBody(second as never);
      if (bodyB['provenance_note'] !== undefined) {
        expect(isUnchangedMarker(bodyB['provenance_note'])).toBe(true);
      }
    });

    it('PR366-TC-09: inherited note may marker while items stay full when items differ', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-31-block-dedup-split-note-items'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      const [stepA, stepB] = await findTwoTechniqueStepIds('implement');
      await mcp.enter(idx, 'implement');
      await client.callTool({ name: 'get_technique', arguments: { session_index: idx, step_id: stepA } });
      const second = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepB },
      });
      expect(second.isError).toBeFalsy();
      const bodyB = parseTechniqueBody(second as never);
      const inh = bodyB['inherited_inputs'];
      if (inh && typeof inh === 'object' && !isUnchangedMarker(inh)) {
        const rec = inh as Record<string, unknown>;
        // When note collapsed and items differ, items remain a full array/object.
        if (rec['note'] !== undefined && isUnchangedMarker(rec['note'])) {
          expect(rec['items']).toBeDefined();
          expect(isUnchangedMarker(rec['items'])).toBe(false);
        }
      }
    });
  });

  // get_workflow orchestrator ops-bundle slimming. Under persistent mode the ops bundle
  // (above the `---` separator) collapses to a single content-keyed workflow_bundle:<hash>
  // marker on the second (resume) call; fresh mode always sends it full.
  describe('get_workflow ops-bundle slimming', () => {
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
        planning_folder: planningFolder('2026-07-12-ops-bundle-slimming-persistent'),
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
      const slug = '2026-07-12-ops-bundle-slimming-ledger-key';
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

  describe('get_resource delta mode', () => {
    const RESOURCE_ID = 'pr-description';
    const SECTION_ID = 'pr-description#link-row-forms';

    it('answers a byte-identical refetch with an unchanged-reference; full: true re-fetches', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-16-resource-delta'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;

      const first = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      expect(first.isError).toBeFalsy();
      const firstText = responseText(first);
      expect(firstText).toContain('resource_id: pr-description');
      expect(firstText).toContain('Pull Request Description Guide');

      const second = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      expect(second.isError).toBeFalsy();
      const secondText = responseText(second);
      expect(secondText).not.toContain('Pull Request Description Guide');
      const stub = parse(secondText.substring(secondText.indexOf('\n\n') + 2)) as Record<string, unknown>;
      expect(stub['resource_id']).toBe(RESOURCE_ID);
      expect(stub['delivery']).toBe('unchanged');
      expect(stub['content_hash']).toMatch(/^[0-9a-f]{16}$/);
      expect(stub['note']).toBeDefined();
      expect((second._meta as Record<string, unknown>)['delivery']).toBe('unchanged');

      const escaped = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID, full: true },
      });
      expect(escaped.isError).toBeFalsy();
      expect(responseText(escaped)).toBe(firstText);
    });

    it('never returns references on a default (fresh-context) session', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'w1' });
      const idx = session['session_index'] as string;

      const first = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      const second = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      expect(responseText(first)).toContain('Pull Request Description Guide');
      expect(responseText(second)).toBe(responseText(first));
      expect((second._meta as Record<string, unknown>)['delivery']).toBeUndefined();
    });

    it('does not collapse across different agentIds', async () => {
      const slug = '2026-07-16-resource-agent-scope';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo-a',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });

      // Resume under a different agent_id — empty ledger for that agent.
      const resumed = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo-b',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      expect(resumed['session_index']).toBe(idx);
      const second = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      expect(responseText(second)).toContain('Pull Request Description Guide');
      expect((second._meta as Record<string, unknown>)['delivery']).toBeUndefined();
    });

    it('treats bare and #section resource_ids as independent ledger keys', async () => {
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder('2026-07-16-resource-section-keys'),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;

      const bare = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      const section = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: SECTION_ID },
      });
      expect(bare.isError).toBeFalsy();
      expect(section.isError).toBeFalsy();
      expect(responseText(bare)).toContain('Pull Request Description Guide');
      expect(responseText(section)).toContain('Link Row Forms');
      // Section fetch is still full content (different key), not a marker from the bare fetch.
      expect((section._meta as Record<string, unknown>)['delivery']).toBeUndefined();

      const sectionAgain = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: SECTION_ID },
      });
      expect((sectionAgain._meta as Record<string, unknown>)['delivery']).toBe('unchanged');

      const onDisk = JSON.parse(readFileSync(
        join(planningFolder('2026-07-16-resource-section-keys'), 'session.json'),
        'utf8',
      ));
      const keys = Object.keys(onDisk.deliveredContent.solo as Record<string, string>);
      expect(keys).toContain(`resource:${RESOURCE_ID}`);
      expect(keys).toContain(`resource:${SECTION_ID}`);
    });

    it('still records resource_fetched when answering with an unchanged-reference', async () => {
      const slug = '2026-07-16-resource-fetched-on-collapse';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'solo',
        planning_folder: planningFolder(slug),
        context_mode: 'persistent',
      });
      const idx = session['session_index'] as string;
      await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });
      await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID },
      });

      const onDisk = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));
      const fetches = (onDisk.history as Array<{ type: string; data?: { resourceId?: string } }>)
        .filter(e => e.type === 'resource_fetched' && e.data?.resourceId === RESOURCE_ID);
      expect(fetches.length).toBe(2);
    });
  });

  /**
   * Per-call `agent_id` scoping (#353 §1.1–§1.2).
   *
   * A dispatched worker authenticates against the ORCHESTRATOR's session_index, so before this the
   * ledger keyed on `state.agentId` was shared by every worker of a session — which is why
   * reference delivery was forbidden on workers outright. These tests pin the three properties the
   * relaxation rests on: a fresh scope gets full delivery, the SAME scope resumed gets references,
   * and one worker never sees another worker's markers.
   */
  describe('per-call agent_id scopes the delivery ledger (#353)', () => {
    const RESOURCE_ID = 'pr-description';

    async function getTechnique(idx: string, extra: Record<string, unknown>): Promise<Awaited<ReturnType<Client['callTool']>>> {
      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, ...extra },
      });
      expect(result.isError).toBeFalsy();
      return result;
    }

    async function getResource(idx: string, extra: Record<string, unknown>): Promise<Awaited<ReturnType<Client['callTool']>>> {
      const result = await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: RESOURCE_ID, ...extra },
      });
      expect(result.isError).toBeFalsy();
      return result;
    }

    it('delivers a fresh worker scope in full and the same scope resumed as references', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'orchestrator' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');

      // Fresh spawn: no prior deliveries under this scope, so asking for reference delivery still
      // yields full content — the property that makes the opt-in safe to hand a worker.
      const spawn = splitActivityResponse(await getActivity(idx, { agent_id: 'w-1', bundle: 'reference' }));
      for (const [key, value] of Object.entries(spawn.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value), `fresh spawn must deliver ${key} in full`).toBe(false);
      }

      // Same worker resumed under the same id: it holds those payloads, so they collapse.
      const resumed = splitActivityResponse(await getActivity(idx, { agent_id: 'w-1', bundle: 'reference' }));
      for (const [key, value] of Object.entries(resumed.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value), `resumed worker must reference ${key}`).toBe(true);
      }
      expect(isUnchangedMarker(resumed.bundle['rules'])).toBe(true);
    });

    it('never hands one worker the markers of another worker on the same session', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'orchestrator' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');

      await getActivity(idx, { agent_id: 'worker-a', bundle: 'reference' });
      await getActivity(idx, { agent_id: 'worker-a', bundle: 'reference' });

      // Worker B shares the session but not the context. It must get full content even though the
      // session's ledger is populated — the defect the old shared-agentId ledger would have caused.
      const workerB = splitActivityResponse(await getActivity(idx, { agent_id: 'worker-b', bundle: 'reference' }));
      for (const [key, value] of Object.entries(workerB.bundle['techniques'] as Record<string, unknown>)) {
        expect(isUnchangedMarker(value), `worker-b must receive ${key} in full`).toBe(false);
      }
      expect(isUnchangedMarker(workerB.bundle['rules'])).toBe(false);
    });

    it('scopes get_technique and get_resource on the same identity', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'orchestrator' });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');
      const stepId = await (async () => {
        const parsed = splitActivityResponse(await getActivity(idx, { bundle: 'full' }));
        const body = parse(parsed.bodyText) as { steps?: Array<{ id?: string; technique?: unknown }> };
        const step = (body.steps ?? []).find(s => typeof s.technique === 'string' && s.id);
        expect(step, 'expected a technique-bound step').toBeTruthy();
        return step!.id!;
      })();

      // First fetch under worker-a is full; the refetch under the same id references.
      expect((await getTechnique(idx, { agent_id: 'w-a', step_id: stepId, bundle: 'reference' }))._meta?.['delivery']).toBeUndefined();
      expect((await getTechnique(idx, { agent_id: 'w-a', step_id: stepId, bundle: 'reference' }))._meta?.['delivery']).toBe('unchanged');
      // A sibling worker on the same session is a different context: full content.
      expect((await getTechnique(idx, { agent_id: 'w-b', step_id: stepId, bundle: 'reference' }))._meta?.['delivery']).toBeUndefined();

      expect((await getResource(idx, { agent_id: 'w-a', bundle: 'reference' }))._meta?.['delivery']).toBeUndefined();
      expect((await getResource(idx, { agent_id: 'w-a', bundle: 'reference' }))._meta?.['delivery']).toBe('unchanged');
      expect((await getResource(idx, { agent_id: 'w-b', bundle: 'reference' }))._meta?.['delivery']).toBeUndefined();
    });

    it('leaves get_technique and get_resource in full delivery without the opt-in, and honours full: true over it', async () => {
      const session = await startSession({ workflow_id: 'work-package', agent_id: 'orchestrator' });
      const idx = session['session_index'] as string;

      // No bundle, default (fresh) session: a byte-identical refetch still arrives in full.
      await getResource(idx, { agent_id: 'w-1' });
      expect((await getResource(idx, { agent_id: 'w-1' }))._meta?.['delivery']).toBeUndefined();

      // Opt in, then force past it: `full: true` overrides `bundle: "reference"`.
      expect((await getResource(idx, { agent_id: 'w-1', bundle: 'reference' }))._meta?.['delivery']).toBe('unchanged');
      expect((await getResource(idx, { agent_id: 'w-1', bundle: 'reference', full: true }))._meta?.['delivery']).toBeUndefined();
    });

    it('keys the on-disk ledger under the passed agent_id, leaving the session agent untouched', async () => {
      const slug = '2026-07-30-worker-scoped-ledger';
      const session = await startSession({
        workflow_id: 'work-package',
        agent_id: 'orchestrator',
        planning_folder: planningFolder(slug),
      });
      const idx = session['session_index'] as string;
      await mcp.enter(idx, 'start-work-package');
      await getActivity(idx, { agent_id: 'worker-7' });

      const onDisk = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));
      expect(onDisk.agentId).toBe('orchestrator');
      expect(Object.keys(onDisk.deliveredContent)).toEqual(['worker-7']);
    });
  });
});
