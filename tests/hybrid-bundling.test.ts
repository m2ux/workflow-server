import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import type { HistoryEntry } from '../src/schema/state.schema.js';
import { safeValidateActivity } from '../src/schema/activity.schema.js';

/**
 * Automatic, per-agent context-derived step-technique bundling (#189 C1c):
 * get_activity eagerly inlines every activity's small, ungated step-bound
 * techniques in a `step_techniques` map, sized to a cumulative budget derived
 * from the worker's declared `context_tokens`; large, over-budget, and gated
 * ones stay lazy via get_technique. Per-activity `bundleTechniques.maxChars`
 * is an explicit per-technique size cap (0 = opt out). Exercised over the MCP
 * wire against a fixture corpus.
 */
describe('hybrid technique bundling (#189 C1c)', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workflowDir: string;
  let workspaceDir: string;

  const planningFolder = (slug: string) => join(workspaceDir, '.engineering/artifacts/planning', slug);
  const sessionHistory = (slug: string): HistoryEntry[] => {
    const state = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8')) as { history: HistoryEntry[] };
    return state.history;
  };

  const op = (capability: string, body: string): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;

  beforeAll(async () => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-bundling-corpus-'));
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-bundling-ws-'));

    const wf = join(workflowDir, 'bundlewf');
    mkdirSync(join(wf, 'activities'), { recursive: true });
    mkdirSync(join(wf, 'techniques', 'work'), { recursive: true });

    writeFileSync(join(wf, 'workflow.yaml'), [
      'id: bundlewf',
      'version: 1.0.0',
      'title: Bundling fixture',
      'initialActivity: work',
      'variables:',
      '  - name: run_optional',
      '    type: boolean',
      '    required: false',
    ].join('\n'));

    writeFileSync(join(wf, 'activities', '01-work.yaml'), [
      'id: work',
      'version: 1.0.0',
      'name: Work',
      'bundleTechniques:',
      '  maxChars: 2000',
      'steps:',
      '  - kind: technique',
      '    technique: classify',
      '  - kind: technique',
      '    id: gather',
      '    technique: gather',
      '  - kind: technique',
      '    id: record',
      '    technique:',
      '      name: record',
      '      inputs:',
      "        analysis_report: '{analysis_report}'",
      '      outputs:',
      '        record_log: final_log',
      '  - kind: technique',
      '    id: bigone',
      '    technique: bigone',
      '  - kind: technique',
      '    id: optional-op',
      '    technique: optional-op',
      '    when: run_optional == true',
      '  - kind: loop',
      '    id: iterate',
      '    loopType: forEach',
      '    over: items',
      '    steps:',
      '      - kind: technique',
      '        id: loop-op',
      '        technique: loop-op',
      '  - kind: loop',
      '    id: gated-loop',
      '    loopType: while',
      '    when: run_optional == true',
      '    steps:',
      '      - kind: technique',
      '        id: gated-loop-op',
      '        technique: loop-op',
      'transitions:',
      '  - to: wrap',
    ].join('\n'));

    writeFileSync(join(wf, 'activities', '02-wrap.yaml'), [
      'id: wrap',
      'version: 1.0.0',
      'name: Wrap',
      'steps:',
      '  - kind: technique',
      '    technique: gather',
    ].join('\n'));

    const t = join(wf, 'techniques');
    writeFileSync(join(t, 'work', 'classify.md'), op('Classify.', '## Outputs\n\n### classified_intake\n\nThe classification.\n\n## Protocol\n\n### 1. Go\n\n- Classify it.\n'));
    writeFileSync(join(t, 'gather.md'), op('Gather.', '## Outputs\n\n### analysis_report\n\nThe report.\n\n## Protocol\n\n### 1. Go\n\n- Gather it.\n'));
    writeFileSync(join(t, 'record.md'), op('Record.', '## Inputs\n\n### analysis_report\n\nThe report.\n\n## Outputs\n\n### record_log\n\nThe log.\n\n### record_summary\n\nThe summary.\n\n## Protocol\n\n### 1. Go\n\n- Record it.\n'));
    writeFileSync(join(t, 'optional-op.md'), op('Optional.', '## Protocol\n\n### 1. Go\n\n- Maybe do it.\n'));
    writeFileSync(join(t, 'loop-op.md'), op('Iterate.', '## Protocol\n\n### 1. Go\n\n- Handle the current item.\n'));
    const bigBody = Array.from({ length: 100 }, (_, i) => `- Perform elaborate sub-operation number ${i} with full attention to every detail.`).join('\n');
    writeFileSync(join(t, 'bigone.md'), op('Big.', `## Protocol\n\n### 1. Go\n\n${bigBody}\n`));

    const config = {
      workflowDir,
      schemasDir: join(import.meta.dirname, '../schemas'),
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
    for (const dir of [workflowDir, workspaceDir]) {
      try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  });

  async function startSession(slug: string, agentId: string, contextMode?: string): Promise<string> {
    const result = await client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'bundlewf',
        agent_id: agentId,
        planning_folder: planningFolder(slug),
        ...(contextMode ? { context_mode: contextMode } : {}),
      },
    });
    expect(result.isError).toBeFalsy();
    const body = JSON.parse((result.content as Array<{ text: string }>)[0]!.text) as Record<string, unknown>;
    return body['session_index'] as string;
  }

  async function enterActivity(sessionIndex: string, activityId: string): Promise<void> {
    const result = await client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: activityId },
    });
    expect(result.isError).toBeFalsy();
  }

  type ToolResult = { isError?: boolean; content?: Array<{ text: string }>; _meta?: Record<string, unknown> };

  async function getActivity(sessionIndex: string, extra: Record<string, unknown> = {}): Promise<{ ops: Record<string, unknown>; meta: Record<string, unknown> }> {
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, ...extra },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    const text = result.content![0]!.text;
    const ops = parse(text.split('\n\n---\n\n')[0]!) as Record<string, unknown>;
    return { ops, meta: result._meta ?? {} };
  }

  it('inlines small ungated step techniques and leaves large and gated ones lazy', async () => {
    const slug = 'b11-shape';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'work');
    const { ops, meta } = await getActivity(idx);

    const stepTechniques = ops['step_techniques'] as Record<string, Record<string, unknown>>;
    expect(stepTechniques).toBeDefined();
    expect(Object.keys(stepTechniques).sort()).toEqual(['classify', 'gather', 'loop-op', 'record']);
    expect(ops['step_techniques_note']).toContain('get_technique { step_id }');
    // The note prescribes the deliberate in-order step-begin beat (#189 C1c(C)2).
    expect(ops['step_techniques_note']).toContain('▶ step');

    // Each entry leads with a ▼ STEP arrival marker (#189 C1c(C)1), then the full composed
    // technique resolved through the activity-group shorthand at the same level.
    expect(stepTechniques['classify']!['marker']).toBe('▼ STEP classify · technique work::classify');
    expect(stepTechniques['gather']!['marker']).toBe('▼ STEP gather · technique gather');
    expect(stepTechniques['classify']!['id']).toBe('classify');
    expect(stepTechniques['classify']!['capability']).toContain('Classify');
    expect(stepTechniques['gather']!['capability']).toContain('Gather');

    // The large technique, the when-gated step, and the step inside a gated loop stay lazy.
    expect(meta['bundled_steps']).toEqual(['classify', 'gather', 'record', 'loop-op']);
  });

  it('decorates bundled entries with binding-seam provenance, like a step-bound get_technique', async () => {
    const slug = 'b11-provenance';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'work');
    const { ops } = await getActivity(idx);

    const record = (ops['step_techniques'] as Record<string, Record<string, unknown>>)['record']!;
    const inputs = record['inputs'] as Array<{ id: string; source?: string }>;
    const analysisReport = inputs.find(i => i.id === 'analysis_report');
    expect(analysisReport?.source).toContain("output of step 'gather'");
    const outputs = record['outputs'] as Array<{ id: string; destination?: string }>;
    const recordLog = outputs.find(o => o.id === 'record_log');
    expect(recordLog?.destination).toContain("'final_log'");
  });

  it('records one technique_bundled history event per bundled step', async () => {
    const slug = 'b11-history';
    const idx = await startSession(slug, 'w7');
    await enterActivity(idx, 'work');
    await getActivity(idx);

    const bundled = sessionHistory(slug).filter(h => h.type === 'technique_bundled');
    expect(bundled).toHaveLength(4);
    for (const entry of bundled) {
      expect(entry.activity).toBe('work');
      expect((entry.data as { agentId: string }).agentId).toBe('w7');
    }
    const byStep = new Map(bundled.map(h => [(h.data as { stepId: string }).stepId, (h.data as { techniqueId: string }).techniqueId]));
    expect(byStep.get('classify')).toBe('work::classify');
    expect(byStep.get('gather')).toBe('gather');
  });

  it('bundled steps satisfy the manifest fidelity check; lazy steps still need a fetch', async () => {
    const slug = 'b11-fidelity';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'work');
    await getActivity(idx);

    const result = await client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: 'wrap',
        step_manifest: [
          { step_id: 'classify', output: 'classified' },
          { step_id: 'gather', output: 'gathered' },
          { step_id: 'record', output: 'recorded' },
          { step_id: 'loop-op', output: 'iterated' },
          { step_id: 'bigone', output: 'done at length' },
        ],
      },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;
    const fidelity = warnings.filter(w => w.includes('without an in-session technique fetch'));
    expect(fidelity).toHaveLength(1);
    const unfetched = fidelity[0]!.match(/\[([^\]]*)\]/)![1];
    expect(unfetched).toBe('bigone');
  });

  it('shares the delivery ledger with get_technique in persistent context, both directions', async () => {
    const slug = 'b11-ledger';
    const idx = await startSession(slug, 'solo', 'persistent');
    await enterActivity(idx, 'work');

    // First delivery is full.
    const first = await getActivity(idx);
    const firstGather = (first.ops['step_techniques'] as Record<string, Record<string, unknown>>)['gather']!;
    expect(firstGather['capability']).toContain('Gather');

    // A bundled delivery collapses the step-bound refetch to an unchanged-reference stub.
    const refetch = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: idx, step_id: 'gather' },
    }) as ToolResult;
    expect(refetch.isError).toBeFalsy();
    expect((refetch._meta as Record<string, unknown>)['delivery']).toBe('unchanged');

    // A technique that stayed lazy was never delivered — its first fetch is full.
    const lazyFetch = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: idx, step_id: 'bigone' },
    }) as ToolResult;
    expect(lazyFetch.isError).toBeFalsy();
    expect((lazyFetch._meta as Record<string, unknown>)['delivery']).toBeUndefined();

    // Re-delivery of the bundle collapses bundled entries to unchanged markers,
    // and still records their technique_bundled events.
    const second = await getActivity(idx);
    const secondGather = (second.ops['step_techniques'] as Record<string, Record<string, unknown>>)['gather']!;
    expect(secondGather['delivery']).toBe('unchanged');
    expect(typeof secondGather['content_hash']).toBe('string');
    // Even the collapsed entry keeps its ▼ STEP arrival marker.
    expect(secondGather['marker']).toBe('▼ STEP gather · technique gather');
    expect(second.meta['bundled_steps']).toEqual(['classify', 'gather', 'record', 'loop-op']);
    const bundledEvents = sessionHistory(slug).filter(h => h.type === 'technique_bundled');
    expect(bundledEvents).toHaveLength(8);

    // bundle: "full" forces full re-delivery.
    const forced = await getActivity(idx, { bundle: 'full' });
    const forcedGather = (forced.ops['step_techniques'] as Record<string, Record<string, unknown>>)['gather']!;
    expect(forcedGather['capability']).toContain('Gather');
  });

  it('an activity WITHOUT bundleTechniques still bundles its ungated step techniques (auto, corpus-wide)', async () => {
    // `wrap` declares no bundleTechniques, yet under automatic context-derived bundling its one
    // ungated technique step (gather) is inlined — the opt-in requirement is gone (#189 C1c).
    const slug = 'auto-no-optin';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'wrap');
    const { ops, meta } = await getActivity(idx);
    const stepTechniques = ops['step_techniques'] as Record<string, Record<string, unknown>>;
    expect(stepTechniques).toBeDefined();
    expect(stepTechniques['gather']!['capability']).toContain('Gather');
    expect(meta['bundled_steps']).toEqual(['gather']);
    expect(sessionHistory(slug).filter(h => h.type === 'technique_bundled')).toHaveLength(1);
  });

  it('a tiny context_tokens budget bundles nothing — every step stays lazy', async () => {
    // budget = context_tokens × 0.8 × 4 chars/token. context_tokens: 1 → ~3.2 chars, below any
    // composed technique, so document-order inlining stops before the first entry.
    const slug = 'tiny-budget';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'work');
    const { ops, meta } = await getActivity(idx, { context_tokens: 1 });
    expect(ops['step_techniques']).toBeUndefined();
    expect(meta['bundled_steps']).toBeUndefined();
    expect(sessionHistory(slug).filter(h => h.type === 'technique_bundled')).toHaveLength(0);
  });

  it('bundleTechniques.maxChars: 0 opts the activity out of eager bundling entirely', async () => {
    // A dedicated fixture activity that sets maxChars: 0 delivers no step_techniques even though
    // the derived budget is generous.
    const wf = join(workflowDir, 'bundlewf');
    writeFileSync(join(wf, 'activities', '03-optout.yaml'), [
      'id: optout',
      'version: 1.0.0',
      'name: Opt Out',
      'bundleTechniques:',
      '  maxChars: 0',
      'steps:',
      '  - kind: technique',
      '    id: gather',
      '    technique: gather',
    ].join('\n'));
    // Point the fixture workflow's initial-activity transition at it so next_activity accepts it.
    const slug = 'optout';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'optout');
    const { ops, meta } = await getActivity(idx);
    expect(ops['step_techniques']).toBeUndefined();
    expect(meta['bundled_steps']).toBeUndefined();
    expect(sessionHistory(slug).filter(h => h.type === 'technique_bundled')).toHaveLength(0);
  });

  it('rejects get_activity without the required context_tokens param', async () => {
    const slug = 'required-param';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'work');
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: idx },
    }) as ToolResult;
    expect(result.isError).toBe(true);
  });

  describe('BundleTechniquesSchema', () => {
    const base = { id: 'a', version: '1.0.0', name: 'A' };

    it('accepts a positive integer maxChars', () => {
      expect(safeValidateActivity({ ...base, bundleTechniques: { maxChars: 4000 } }).success).toBe(true);
    });

    it('accepts maxChars: 0 as the opt-out sentinel', () => {
      expect(safeValidateActivity({ ...base, bundleTechniques: { maxChars: 0 } }).success).toBe(true);
    });

    it('rejects a negative maxChars, unknown keys, and an empty object', () => {
      expect(safeValidateActivity({ ...base, bundleTechniques: { maxChars: -1 } }).success).toBe(false);
      expect(safeValidateActivity({ ...base, bundleTechniques: { maxChars: 4000, mode: 'all' } }).success).toBe(false);
      expect(safeValidateActivity({ ...base, bundleTechniques: {} }).success).toBe(false);
    });
  });
});
