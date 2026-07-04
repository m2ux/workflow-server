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
  unchanged: true;
  content_hash: string;
}

function isUnchangedMarker(value: unknown): value is UnchangedMarker {
  return typeof value === 'object' && value !== null
    && (value as Record<string, unknown>)['unchanged'] === true
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
    expect(unchangedMarker('deadbeefdeadbeef')).toEqual({ unchanged: true, content_hash: 'deadbeefdeadbeef' });
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
      arguments: { session_index: sessionIndex, ...(extra ?? {}) },
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

      const first = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: stepId },
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
        const call1 = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx } });
        expect(call1.isError).toBeFalsy();

        // Mutate the workflow-inherited technique between calls.
        const techniqueFile = join(mutableWorkflowDir, 'meta/techniques/variable-binding.md');
        const original = readFileSync(techniqueFile, 'utf8');
        expect(original).toContain('Bind a step');
        writeFileSync(techniqueFile, original.replace('## Capability\n\nBind a step', '## Capability\n\nMUTATED: Bind a step'));

        // The changed technique arrives in full (new content, hash mismatch);
        // untouched techniques collapse to markers.
        const call2 = splitActivityResponse(await (async () => {
          const r = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx } });
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
          const r = await client2.callTool({ name: 'get_activity', arguments: { session_index: idx } });
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
});
