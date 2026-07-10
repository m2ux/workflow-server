import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import type { HistoryEntry } from '../src/schema/state.schema.js';

/**
 * Deterministic context-window sweep for automatic context-derived step-technique
 * bundling (#189 C1c). Where hybrid-bundling.test.ts asserts the on/off extremes
 * (a generous 200k window vs. a degenerate 1-token window), this file demonstrates
 * the GRADUATED, cumulative-budget relationship: with a fixture whose ungated
 * step techniques are all roughly the same known size, a rising `context_tokens`
 * grows the inlined `step_techniques` prefix MONOTONICALLY — 0 → 2 → all 4.
 *
 * Budget math (server config, in-code fallbacks; see src/config.ts and the eager
 * loop in src/tools/workflow-tools.ts):
 *
 *     eagerBudgetChars = context_tokens × bundleHeadroomFraction × bundleCharsPerToken
 *                      = context_tokens × 0.80 × 4
 *                      = context_tokens × 3.2
 *
 * Inlining walks the activity's UNGATED technique steps in DOCUMENT ORDER and
 * STOPS at the first whose composed `projectTechniqueToYaml(technique).length`
 * would push the cumulative total over the budget (stop-and-break); the rest stay
 * lazy. Per-technique size is the composed+provenance-decorated technique body
 * serialized to YAML — NOT the raw markdown source.
 *
 * The fixture pads each of t1..t4 to a composed size of ~STEP_CHARS chars. The
 * exact composed size is MEASURED in-test (see the `measures ... sizes` test /
 * BUNDLE_DEBUG log) and the tiers below are chosen to land cleanly mid-band with
 * comfortable (>=20%) margin from any boundary, so the sweep is not brittle to
 * small rounding in the projection. A gated step (`when: run_optional == true`)
 * is included to assert it stays lazy at EVERY window size.
 */
describe('context-window sweep — graduated cumulative bundling (#189 C1c)', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workflowDir: string;
  let workspaceDir: string;

  // Target composed size for each of the four equal ungated techniques (~chars).
  // Sizing rationale (verified by the "measures" test which logs actuals):
  //   budget(context_tokens) = context_tokens × 3.2
  //   SMALL 2_000  → 6_400  chars → fits 0  (< one ~10k technique)      → []
  //   MID   8_000  → 25_600 chars → fits 2  (2×10k=20k <25.6k <3×10k=30k) → [t1,t2]
  //   LARGE 20_000 → 64_000 chars → fits 4  (4×10k=40k < 64k)            → [t1..t4]
  // Every tier sits >=20% clear of the nearest 10k boundary.
  const STEP_CHARS = 10_000;

  // A padded body whose composed YAML lands near STEP_CHARS. The bulk is a run of
  // protocol bullets; markdown→technique→YAML projection is close to 1:1 on plain
  // bullet text, so we pad slightly under target and let the composed size be
  // measured/asserted in-test rather than guessed.
  const paddedBody = (): string => {
    const line = '- Perform elaborate sub-operation with full attention to every relevant detail here.';
    // ~86 chars/line incl newline; ~110 lines ≈ ~9_400 chars of bullets, plus the
    // Capability/Outputs/Protocol scaffolding brings the composed YAML near ~10k.
    const bullets = Array.from({ length: 110 }, () => line).join('\n');
    return `## Outputs\n\n### out_val\n\nThe produced value.\n\n## Protocol\n\n### 1. Go\n\n${bullets}\n`;
  };

  const op = (capability: string, body: string): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;

  const planningFolder = (slug: string) => join(workspaceDir, '.engineering/artifacts/planning', slug);
  const sessionHistory = (slug: string): HistoryEntry[] => {
    const state = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8')) as { history: HistoryEntry[] };
    return state.history;
  };

  beforeAll(async () => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-ctxwin-corpus-'));
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-ctxwin-ws-'));

    const wf = join(workflowDir, 'sweepwf');
    mkdirSync(join(wf, 'activities'), { recursive: true });
    mkdirSync(join(wf, 'techniques'), { recursive: true });

    writeFileSync(join(wf, 'workflow.yaml'), [
      'id: sweepwf',
      'version: 1.0.0',
      'title: Context-window sweep fixture',
      'initialActivity: sweep',
      'variables:',
      '  - name: run_optional',
      '    type: boolean',
      '    required: false',
    ].join('\n'));

    // One activity, four EQUAL ungated technique steps in document order (t1..t4),
    // plus one gated step that must never bundle. No bundleTechniques.maxChars cap,
    // so ONLY the cumulative context-derived budget governs the prefix.
    writeFileSync(join(wf, 'activities', '01-sweep.yaml'), [
      'id: sweep',
      'version: 1.0.0',
      'name: Sweep',
      'steps:',
      '  - kind: technique',
      '    id: t1',
      '    technique: t1',
      '  - kind: technique',
      '    id: t2',
      '    technique: t2',
      '  - kind: technique',
      '    id: t3',
      '    technique: t3',
      '  - kind: technique',
      '    id: t4',
      '    technique: t4',
      '  - kind: technique',
      '    id: gated',
      '    technique: gated',
      '    when: run_optional == true',
      'transitions:',
      '  - to: done',
    ].join('\n'));

    writeFileSync(join(wf, 'activities', '02-done.yaml'), [
      'id: done',
      'version: 1.0.0',
      'name: Done',
      'steps:',
      '  - kind: technique',
      '    id: t1',
      '    technique: t1',
    ].join('\n'));

    const t = join(wf, 'techniques');
    for (const id of ['t1', 't2', 't3', 't4', 'gated']) {
      writeFileSync(join(t, `${id}.md`), op(`Capability of ${id}.`, paddedBody()));
    }

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
        workflow_id: 'sweepwf',
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

  async function getActivity(sessionIndex: string, contextTokens: number, extra: Record<string, unknown> = {}): Promise<{ ops: Record<string, unknown>; meta: Record<string, unknown> }> {
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: contextTokens, ...extra },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    const text = result.content![0]!.text;
    const ops = parse(text.split('\n\n---\n\n')[0]!) as Record<string, unknown>;
    return { ops, meta: result._meta ?? {} };
  }

  // --- Calibration: measure the real composed size so tier math is grounded. ---
  it('composes four roughly-equal ungated techniques (calibration)', async () => {
    const slug = 'sizes';
    const idx = await startSession(slug, 'measure');
    await enterActivity(idx, 'sweep');
    // A huge window inlines everything; read each composed entry's serialized size.
    const { ops, meta } = await getActivity(idx, 1_000_000);
    const st = ops['step_techniques'] as Record<string, Record<string, unknown>>;
    expect(meta['bundled_steps']).toEqual(['t1', 't2', 't3', 't4']);

    const sizes = Object.fromEntries(
      (['t1', 't2', 't3', 't4'] as const).map((id) => {
        // Reconstruct the composed entry sans its ▼ STEP marker (the budget measures
        // projectTechniqueToYaml(technique), i.e. the composed technique body).
        const entry = { ...st[id]! };
        delete entry['marker'];
        return [id, JSON.stringify(entry).length];
      }),
    );
    if (process.env['BUNDLE_DEBUG']) {
      // eslint-disable-next-line no-console
      console.log('composed entry sizes:', sizes);
    }
    const values = Object.values(sizes);
    // All four are within 5% of each other (roughly equal) and comfortably in the
    // ~10k band the tier math assumes (>=8k, <=13k), keeping every tier mid-band.
    const min = Math.min(...values);
    const max = Math.max(...values);
    expect(max - min).toBeLessThan(min * 0.05);
    expect(min).toBeGreaterThan(8_000);
    expect(max).toBeLessThan(13_000);
  });

  // --- The sweep: three tiers, monotonically growing bundled prefix. ---
  interface Tier {
    label: string;
    contextTokens: number;
    budgetChars: number; // context_tokens × 3.2
    expectBundled: string[]; // exact bundled_steps prefix (document order)
  }

  const tiers: Tier[] = [
    // 2_000 × 3.2 = 6_400 < ~10k → the first technique already overflows → none.
    { label: 'SMALL (fits 0)', contextTokens: 2_000, budgetChars: 6_400, expectBundled: [] },
    // 8_000 × 3.2 = 25_600 → fits two (~20k) but not three (~30k) → [t1, t2].
    { label: 'MID (fits 2)', contextTokens: 8_000, budgetChars: 25_600, expectBundled: ['t1', 't2'] },
    // 20_000 × 3.2 = 64_000 → fits all four (~40k) → [t1, t2, t3, t4].
    { label: 'LARGE (fits all 4)', contextTokens: 20_000, budgetChars: 64_000, expectBundled: ['t1', 't2', 't3', 't4'] },
  ];

  for (const tier of tiers) {
    it(`${tier.label}: context_tokens=${tier.contextTokens} → budget≈${tier.budgetChars} → bundles ${JSON.stringify(tier.expectBundled)}`, async () => {
      const slug = `sweep-${tier.contextTokens}`; // fresh session per tier ⇒ clean event counts
      const idx = await startSession(slug, 'w1');
      await enterActivity(idx, 'sweep');
      const { ops, meta } = await getActivity(idx, tier.contextTokens);

      const bundled = tier.expectBundled;

      if (bundled.length === 0) {
        // Nothing fits: no step_techniques map, no bundled_steps meta, no events.
        expect(ops['step_techniques']).toBeUndefined();
        expect(meta['bundled_steps']).toBeUndefined();
      } else {
        const st = ops['step_techniques'] as Record<string, Record<string, unknown>>;
        expect(st).toBeDefined();
        // Exact bundled set = the document-order prefix that fits, and NOTHING beyond.
        expect(meta['bundled_steps']).toEqual(bundled);
        expect(Object.keys(st).sort()).toEqual([...bundled].sort());

        // Each inlined entry carries the ▼ STEP marker and the composed capability/content.
        for (const id of bundled) {
          expect(st[id]!['marker']).toBe(`▼ STEP ${id} · technique ${id}`);
          expect(st[id]!['id']).toBe(id);
          expect(st[id]!['capability']).toContain(`Capability of ${id}`);
        }
        // Techniques past the budget stayed lazy — absent from the map.
        for (const id of ['t1', 't2', 't3', 't4']) {
          if (!bundled.includes(id)) expect(st[id]).toBeUndefined();
        }
      }

      // The gated step is ALWAYS lazy, at every window size.
      const st = ops['step_techniques'] as Record<string, unknown> | undefined;
      expect(st?.['gated']).toBeUndefined();

      // One technique_bundled event per inlined step, and no more (fresh session).
      const events = sessionHistory(slug).filter(h => h.type === 'technique_bundled');
      expect(events).toHaveLength(bundled.length);
      const byStep = new Set(events.map(e => (e.data as { stepId: string }).stepId));
      expect([...byStep].sort()).toEqual([...bundled].sort());
    });
  }

  // --- Unchanged-marker shape on a persistent-context bundle re-delivery. ---
  it('persistent-context re-delivery collapses inlined entries to unchanged markers', async () => {
    const slug = 'ctxwin-ledger';
    const idx = await startSession(slug, 'solo', 'persistent');
    await enterActivity(idx, 'sweep');

    // First MID delivery inlines [t1, t2] with full content.
    const first = await getActivity(idx, 8_000);
    const firstT1 = (first.ops['step_techniques'] as Record<string, Record<string, unknown>>)['t1']!;
    expect(firstT1['capability']).toContain('Capability of t1');
    expect(first.meta['bundled_steps']).toEqual(['t1', 't2']);

    // Re-delivery at the SAME window collapses the already-delivered t1/t2 to
    // unchanged markers (near-zero cost — they no longer draw down the budget),
    // keeping the ▼ STEP marker and a content_hash. Because the freed budget now
    // covers t3 then t4 in full, the second delivery's bundled prefix GROWS to all
    // four: the ledger and the cumulative budget compose exactly as documented.
    const second = await getActivity(idx, 8_000);
    const st = second.ops['step_techniques'] as Record<string, Record<string, unknown>>;

    const secondT1 = st['t1']!;
    expect(secondT1['delivery']).toBe('unchanged');
    expect(typeof secondT1['content_hash']).toBe('string');
    expect(secondT1['marker']).toBe('▼ STEP t1 · technique t1');
    // t2 likewise collapses to an unchanged marker.
    expect(st['t2']!['delivery']).toBe('unchanged');

    // t3 and t4 are delivered full this time (never delivered before), so they
    // carry composed content rather than an unchanged marker.
    expect(st['t3']!['delivery']).toBeUndefined();
    expect(st['t3']!['capability']).toContain('Capability of t3');
    expect(st['t4']!['delivery']).toBeUndefined();

    expect(second.meta['bundled_steps']).toEqual(['t1', 't2', 't3', 't4']);
  });
});
