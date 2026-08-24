import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import { safeValidateActivity } from '../src/schema/activity.schema.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

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
  let harness: Harness;
  let client: Client;
  let session: SessionOps;
  let workflowDir: string;

  const op = (capability: string, body: string): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;

  beforeAll(async () => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-bundling-corpus-'));

    const wf = join(workflowDir, 'bundlewf');
    mkdirSync(join(wf, 'activities'), { recursive: true });
    mkdirSync(join(wf, 'techniques', 'work'), { recursive: true });

    writeFileSync(join(wf, 'workflow.yaml'), [
      'id: bundlewf',
      'version: 1.0.0',
      'title: Bundling fixture',
      'initialActivity: work',
      'graph:',
      '  work:',
      '    done: wrap',
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
      'exits:',
      '  - id: done',
      '    isDefault: true',
    ].join('\n'));

    writeFileSync(join(wf, 'activities', '02-wrap.yaml'), [
      'id: wrap',
      'version: 1.0.0',
      'name: Wrap',
      'steps:',
      '  - kind: technique',
      '    technique: gather',
    ].join('\n'));

    mkdirSync(join(wf, 'resources'), { recursive: true });
    writeFileSync(join(wf, 'resources', 'guide.md'), [
      '---',
      'name: guide',
      'description: Fixture guide resource',
      '---',
      '',
      '# Guide',
      '',
      '## Overview',
      '',
      'Use this guide when gathering.',
      '',
    ].join('\n'));

    // Two chunky resources for the eager-budget test (#323 T2): each body is far larger than any
    // technique in this corpus, so a budget sized to admit one of them must exclude the other.
    for (const name of ['big-a', 'big-b']) {
      const body = Array.from(
        { length: 60 },
        (_, i) => `Paragraph ${i} of ${name}: ${'policy detail '.repeat(7)}`,
      ).join('\n\n');
      writeFileSync(join(wf, 'resources', `${name}.md`), [
        '---', `name: ${name}`, `description: Fixture bulk resource ${name}`, '---', '', body, '',
      ].join('\n'));
    }
    writeFileSync(join(wf, 'activities', '04-wide.yaml'), [
      'id: wide',
      'version: 1.0.0',
      'name: Wide',
      'steps:',
      '  - kind: technique',
      '    id: consult',
      '    technique: consult',
    ].join('\n'));

    // A resource cited both whole and by section, for the delivery-grain tests below. `small`
    // fits the eager cap; `oversized` exceeds it, so its file never lands and its section must.
    writeFileSync(join(wf, 'resources', 'small-both.md'), [
      '---', 'name: small-both', 'description: Fixture cited both ways', '---', '',
      '# Small Both', '', '## Alpha', '', 'Alpha guidance.', '', '## Beta', '', 'Beta guidance.', '',
    ].join('\n'));
    const oversized = Array.from(
      { length: 900 },
      (_, i) => `Paragraph ${i}: ${'exhaustive policy detail '.repeat(5)}`,
    ).join('\n\n');
    writeFileSync(join(wf, 'resources', 'oversized-both.md'), [
      '---', 'name: oversized-both', 'description: Fixture over the eager cap', '---', '',
      '# Oversized Both', '', '## Slice', '', 'The one slice a technique reads.', '',
      '## Bulk', '', oversized, '',
    ].join('\n'));
    for (const [num, id] of [['05', 'cite-small'], ['06', 'cite-oversized']] as const) {
      writeFileSync(join(wf, 'activities', `${num}-${id}.yaml`), [
        `id: ${id}`, 'version: 1.0.0', `name: ${id}`, 'steps:',
        '  - kind: technique', `    id: ${id}`, `    technique: ${id}`,
      ].join('\n'));
    }

    const t = join(wf, 'techniques');
    writeFileSync(join(t, 'work', 'classify.md'), op('Classify.', '## Outputs\n\n### classified_intake\n\nThe classification.\n\n## Protocol\n\n### 1. Go\n\n- Classify it.\n'));
    writeFileSync(join(t, 'gather.md'), op(
      'Gather.',
      '## Outputs\n\n### analysis_report\n\nThe report.\n\n## Protocol\n\n### 1. Go\n\n- Gather it using the [guide](../resources/guide.md#overview).\n',
    ));
    writeFileSync(join(t, 'record.md'), op('Record.', '## Inputs\n\n### analysis_report\n\nThe report.\n\n## Outputs\n\n### record_log\n\nThe log.\n\n### record_summary\n\nThe summary.\n\n## Protocol\n\n### 1. Go\n\n- Record it.\n'));
    writeFileSync(join(t, 'optional-op.md'), op('Optional.', '## Protocol\n\n### 1. Go\n\n- Maybe do it.\n'));
    writeFileSync(join(t, 'loop-op.md'), op('Iterate.', '## Protocol\n\n### 1. Go\n\n- Handle the current item.\n'));
    const bigBody = Array.from({ length: 100 }, (_, i) => `- Perform elaborate sub-operation number ${i} with full attention to every detail.`).join('\n');
    writeFileSync(join(t, 'bigone.md'), op('Big.', `## Protocol\n\n### 1. Go\n\n${bigBody}\n`));
    writeFileSync(join(t, 'consult.md'), op(
      'Consult.',
      '## Protocol\n\n### 1. Go\n\n- Apply [big-a](../resources/big-a.md), then [big-b](../resources/big-b.md).\n',
    ));
    writeFileSync(join(t, 'cite-small.md'), op(
      'Cite small both ways.',
      '## Protocol\n\n### 1. Go\n\n- Read [small-both](../resources/small-both.md), then [Alpha](../resources/small-both.md#alpha).\n',
    ));
    writeFileSync(join(t, 'cite-oversized.md'), op(
      'Cite oversized both ways.',
      '## Protocol\n\n### 1. Go\n\n- Read [oversized-both](../resources/oversized-both.md), then [Slice](../resources/oversized-both.md#slice).\n',
    ));

    harness = await createHarness({ workflowDir });
    client = harness.client;
    session = sessionOps(harness, 'bundlewf');
  });

  afterAll(async () => {
    await harness.close();
    try { rmSync(workflowDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  type ToolResult = { isError?: boolean; content?: Array<{ text: string }>; _meta?: Record<string, unknown> };

  async function getActivity(sessionIndex: string, extra: Record<string, unknown> = {}): Promise<{ ops: Record<string, unknown>; meta: Record<string, unknown>; text: string }> {
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, ...extra },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    const text = result.content![0]!.text;
    const ops = parse(text.split('\n\n---\n\n')[0]!) as Record<string, unknown>;
    return { ops, meta: result._meta ?? {}, text };
  }

  it('inlines small ungated step techniques and leaves large and gated ones lazy', async () => {
    const slug = 'b11-shape';
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'work');
    const { ops, meta } = await getActivity(idx);

    const stepTechniques = ops['step_techniques'] as Record<string, Record<string, unknown>>;
    expect(stepTechniques).toBeDefined();
    expect(Object.keys(stepTechniques).sort()).toEqual(['classify', 'gather', 'loop-op', 'record']);
    expect(ops['step_techniques_note']).toContain('get_technique { step_id }');
    // The note prescribes the deliberate in-order step-begin beat (#189 C1c(C)2).
    expect(ops['step_techniques_note']).toContain('▶ step');
    expect(ops['step_techniques_note']).toContain('resources_note');

    // Each entry leads with a ▼ STEP arrival marker (#189 C1c(C)1), then the full composed
    // technique resolved through the activity-group shorthand at the same level.
    expect(stepTechniques['classify']!['marker']).toBe('▼ STEP classify · technique work::classify');
    expect(stepTechniques['gather']!['marker']).toBe('▼ STEP gather · technique gather');
    expect(stepTechniques['classify']!['id']).toBe('classify');
    expect(stepTechniques['classify']!['capability']).toContain('Classify');
    expect(stepTechniques['gather']!['capability']).toContain('Gather');
    // Resource bodies are siblings — not nested inside step_techniques entries.
    expect(stepTechniques['gather']!['content']).toBeUndefined();

    // The large technique, the when-gated step, and the step inside a gated loop stay lazy.
    expect(meta['bundled_steps']).toEqual(['classify', 'gather', 'record', 'loop-op']);
  });

  it('eager-bundles technique-linked resource BODIES as a sibling resources map under reference delivery', async () => {
    const slug = 'b11-resources';
    const idx = await session.start(slug, 'w1', 'persistent');
    await session.enter(idx, 'work');
    const { ops, meta } = await getActivity(idx);

    const resources = ops['resources'] as Record<string, Record<string, unknown>>;
    expect(resources).toBeDefined();
    expect(resources['guide#overview']).toBeDefined();
    expect(String(resources['guide#overview']!['content'])).toContain('Use this guide when gathering');
    expect(ops['resources_note']).toContain('resource:');
    expect(meta['bundled_resources']).toContain('guide#overview');
    // Every linked id has a body, so there is nothing left for the worker to fetch.
    expect(ops['resource_refs']).toBeUndefined();
    expect(meta['resource_refs']).toBeUndefined();

    const history = session.history(slug);
    expect(history.some((h) =>
      h.type === 'resource_fetched' &&
      (h.data as { resourceId?: string; bundled?: boolean } | undefined)?.resourceId === 'guide#overview' &&
      (h.data as { bundled?: boolean } | undefined)?.bundled === true,
    )).toBe(true);
  });

  it('delivers the file alone when a technique cites a resource whole and by section', async () => {
    const slug = 'b11-grain-small';
    const idx = await session.start(slug, 'w1', 'persistent');
    await session.enter(idx, 'cite-small');
    const { ops, meta } = await getActivity(idx);

    const resources = ops['resources'] as Record<string, Record<string, unknown>>;
    // The file body already contains Alpha, and the two ids ledger separately, so shipping
    // both would send Alpha's text twice and charge the eager budget for it twice.
    expect(Object.keys(resources)).toEqual(['small-both']);
    expect(String(resources['small-both']!['content'])).toContain('Alpha guidance.');
    expect(meta['bundled_resources']).toEqual(['small-both']);
    // The section is already in context, so it is not something left for the worker to fetch.
    expect(ops['resource_refs']).toBeUndefined();
  });

  it('still delivers the section when the file it belongs to is over the eager cap', async () => {
    const slug = 'b11-grain-oversized';
    const idx = await session.start(slug, 'w1', 'persistent');
    await session.enter(idx, 'cite-oversized');
    const { ops, meta } = await getActivity(idx);

    const resources = ops['resources'] as Record<string, Record<string, unknown>>;
    expect(Object.keys(resources)).toEqual(['oversized-both#slice']);
    expect(String(resources['oversized-both#slice']!['content'])).toContain('The one slice');
    expect(meta['bundled_resources']).toEqual(['oversized-both#slice']);
    // The file itself never lands, so it stays fetchable rather than becoming unreachable.
    expect(ops['resource_refs']).toEqual(['oversized-both']);
  });

  it('under full delivery, ships linked resource IDS only — no bodies, no ledger writes (#323 T1)', async () => {
    // A fresh worker context cannot collapse a repeat delivery, so a body inlined here would ship
    // again in full in every activity that links it. The ids are what the worker needs.
    const slug = 'b11-resources-fresh';
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'work');
    const { ops, meta } = await getActivity(idx);

    expect(ops['resources']).toBeUndefined();
    expect(meta['bundled_resources']).toBeUndefined();
    expect(ops['resource_refs']).toEqual(['guide#overview']);
    expect(meta['resource_refs']).toEqual(['guide#overview']);
    expect(ops['resources_note']).toContain('resource_refs');
    expect(ops['resources_note']).toContain('get_resource');
    // The step-technique note must not promise a map this mode did not send.
    expect(ops['step_techniques_note']).toContain('resources_note');

    // No `resources` map was delivered, so no resource:* ledger key is written — under the old
    // behaviour these were recorded and never read.
    const state = JSON.parse(readFileSync(join(session.folder(slug), 'session.json'), 'utf8')) as {
      deliveredContent?: Record<string, Record<string, string>>;
    };
    const keys = Object.keys(state.deliveredContent?.['w1'] ?? {});
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.filter((k) => k.startsWith('resource:'))).toEqual([]);

    // And no bundled resource_fetched event claims a delivery that never happened.
    expect(session.history(slug).filter((h) =>
      h.type === 'resource_fetched' && (h.data as { bundled?: boolean } | undefined)?.bundled === true,
    )).toHaveLength(0);
  });

  it('resource bodies draw down the eager budget; the overflow stays fetchable (#323 T2)', async () => {
    // `wide` links two bulk resources. The budget is sized to admit the technique plus the first
    // body only, so the second must be excluded — and the whole eager bundle must stay under it.
    const slug = 'b11-resource-budget';
    const idx = await session.start(slug, 'w1', 'persistent');
    await session.enter(idx, 'wide');

    const contextTokens = 4_000;
    const budget = contextTokens * 0.8 * 4;
    const { ops, meta, text } = await getActivity(idx, { context_tokens: contextTokens });

    const resources = (ops['resources'] ?? {}) as Record<string, Record<string, unknown>>;
    expect(Object.keys(resources)).toEqual(['big-a']);
    expect(ops['resource_refs']).toEqual(['big-b']);
    expect(meta['bundled_resources']).toEqual(['big-a']);

    // The eager bundle — inlined technique bodies plus inlined resource bodies — is bounded by
    // `context_tokens`, which is the stated purpose of the budget policy in src/config.ts.
    const eagerChars =
      JSON.stringify(ops['step_techniques']).length + JSON.stringify(ops['resources']).length;
    expect(eagerChars).toBeLessThanOrEqual(budget);
    // And with it, the whole response — the acceptance form of the same bound. (The always-full
    // parts of a response — activity body, inherited rules — are not budget-governed, so this
    // holds for an activity whose non-eager content is small, as `wide` is.)
    expect(text.length).toBeLessThanOrEqual(budget);
    // Both bodies together would have overflowed it.
    const bigA = String(resources['big-a']!['content']);
    expect(bigA.length * 2).toBeGreaterThan(budget);
  });

  it('collapses eagerly bundled resources under persistent mode and shares the get_resource ledger', async () => {
    const slug = 'b11-resources-persistent';
    const idx = await session.start(slug, 'w1', 'persistent');
    await session.enter(idx, 'work');
    const first = await getActivity(idx);
    const firstRes = (first.ops['resources'] as Record<string, Record<string, unknown>>)['guide#overview']!;
    expect(firstRes['content']).toBeDefined();

    const second = await getActivity(idx);
    const secondRes = (second.ops['resources'] as Record<string, Record<string, unknown>>)['guide#overview']!;
    expect(secondRes['delivery']).toBe('unchanged');
    expect(secondRes['content_hash']).toBeTruthy();

    const getRes = await client.callTool({
      name: 'get_resource',
      arguments: { session_index: idx, resource_id: 'guide#overview' },
    }) as ToolResult;
    expect(getRes.isError).toBeFalsy();
    const stub = parse(getRes.content![0]!.text.split('\n\n').slice(1).join('\n\n')) as Record<string, unknown>;
    expect(stub['delivery']).toBe('unchanged');
  });

  it('decorates bundled entries with binding-seam provenance, like a step-bound get_technique', async () => {
    const slug = 'b11-provenance';
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'work');
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
    const idx = await session.start(slug, 'w7');
    await session.enter(idx, 'work');
    await getActivity(idx);

    const bundled = session.history(slug).filter(h => h.type === 'technique_bundled');
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
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'work');
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
    const idx = await session.start(slug, 'solo', 'persistent');
    await session.enter(idx, 'work');

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
    const bundledEvents = session.history(slug).filter(h => h.type === 'technique_bundled');
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
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'wrap');
    const { ops, meta } = await getActivity(idx);
    const stepTechniques = ops['step_techniques'] as Record<string, Record<string, unknown>>;
    expect(stepTechniques).toBeDefined();
    expect(stepTechniques['gather']!['capability']).toContain('Gather');
    expect(meta['bundled_steps']).toEqual(['gather']);
    expect(session.history(slug).filter(h => h.type === 'technique_bundled')).toHaveLength(1);
  });

  it('a tiny context_tokens budget bundles nothing — every step stays lazy', async () => {
    // budget = context_tokens × 0.8 × 4 chars/token. context_tokens: 1 → ~3.2 chars, below any
    // composed technique, so document-order inlining stops before the first entry.
    const slug = 'tiny-budget';
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'work');
    const { ops, meta } = await getActivity(idx, { context_tokens: 1 });
    expect(ops['step_techniques']).toBeUndefined();
    expect(meta['bundled_steps']).toBeUndefined();
    expect(session.history(slug).filter(h => h.type === 'technique_bundled')).toHaveLength(0);
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
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'optout');
    const { ops, meta } = await getActivity(idx);
    expect(ops['step_techniques']).toBeUndefined();
    expect(meta['bundled_steps']).toBeUndefined();
    expect(session.history(slug).filter(h => h.type === 'technique_bundled')).toHaveLength(0);
  });

  it('rejects get_activity without the required context_tokens param', async () => {
    const slug = 'required-param';
    const idx = await session.start(slug, 'w1');
    await session.enter(idx, 'work');
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
