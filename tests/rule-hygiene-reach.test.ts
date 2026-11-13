import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { extractMarkdownSection, extractResourceIds } from '../src/utils/resource-ref.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { liveCorpusRoot } from './corpus-root.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * What the rule-hygiene audit reaches, and what the entry it reaches names.
 *
 * An entry the pass does not name in the scope it declares, or cites only as the family around it,
 * is an entry that pass never applies. `one-invariant-per-rule` sits outside the Rule Hygiene
 * family, so the pass reaches it only by loading that heading. A file check can see that the
 * catalogue names the signals and the carve-outs. It cannot see that a run is handed the entry.
 * The walk is that half: the orchestrator enters `quality-review` on `workflow-design`, the worker
 * fetches the gated `audit-rule-hygiene` step the activity leaves to be fetched, then fetches the
 * criteria that pass tells it to load. Every call goes through the server, so what is asserted is
 * what an agent receives.
 *
 *   1. The catalogue file's entry names the three Detect signals and the two Do-not-flag carve-outs.
 *   2. The pass names `one-invariant-per-rule` in the scope it declares, and the entry arrives
 *      through `get_resource` addressed at its own section. The served entry carries the same
 *      signals and carve-outs, so a delivery stripped of them fails.
 *
 * Conditional on a corpus holding `workflow-design`, never on the assertions: a present workflow
 * whose pass does not reach the entry fails. Point it at a checkout of the definitions branch with
 * `WORKFLOWS_DIR`.
 */

const CORPUS = liveCorpusRoot();
const WORKFLOW = 'workflow-design';
const PRESENT = CORPUS !== null && indexCorpus(CORPUS).workflows.has(WORKFLOW);

/** The catalogue entry this pass must reach, by the kebab name the catalogue cites entries under. */
const ENTRY = 'one-invariant-per-rule';

/**
 * The three Detect signals, each by the phrase the entry states it in. The entry enumerates them
 * under one `Signals:` clause, so the count below and these three are one claim read twice: a
 * fourth signal, or one of these reworded away, fails rather than passing unnoticed.
 */
const SIGNALS = [
  'bolded sentence-lede',
  'length far outside',
  'consecutive paragraphs whose subjects differ',
];

/**
 * The two Do-not-flag carve-outs, each by the phrase the entry states it in. They are what holds
 * the entry off the shapes that resemble it and are correct — a constraint stated with the failure
 * mode that makes it matter, and one constraint elaborated across the cases it covers.
 */
const CARVE_OUTS = [
  'single constraint stated with the failure mode',
  'elaborating one constraint across the cases it covers',
];

/** The body of one `**Name:**` block of a catalogue entry, up to the next one. */
function block(entry: string, name: string): string {
  const match = new RegExp(`\\*\\*${name}:\\*\\*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`).exec(entry);
  return match?.[1]?.trim() ?? '';
}

/** A `get_resource` response is a header stanza, a blank line, then the resource body. */
function body(text: string): string {
  const split = text.indexOf('\n\n');
  return split < 0 ? text : text.slice(split + 2);
}

/** The signals under Detect and the carve-outs under Do not flag, as the entry states them. */
function expectNamed(entry: string): void {
  const signals = /Signals:\s*([^.]+)\./.exec(block(entry, 'Detect'))?.[1] ?? '';
  expect(signals.split(';').map(s => s.trim()).filter(Boolean)).toHaveLength(SIGNALS.length);
  expect(SIGNALS.filter(signal => !signals.includes(signal))).toEqual([]);

  const exclusions = block(entry, 'Do not flag');
  expect(CARVE_OUTS.filter(carveOut => !exclusions.includes(carveOut))).toEqual([]);
}

describe.skipIf(!PRESENT)(`the catalogue entry names the signals and the carve-outs (corpus: ${CORPUS})`, () => {
  it('names the three signals under Detect and the two carve-outs under Do not flag', () => {
    const catalogue = readFileSync(join(CORPUS!, 'corpus/canon/resources/anti-patterns.md'), 'utf8');
    const entry = extractMarkdownSection(catalogue, 'ap-156-one-invariant-per-rule');
    expect(entry, 'the catalogue has no heading for the entry').not.toBeNull();
    expectNamed(entry!);
  });
});

describe.skipIf(!PRESENT)(`the rule-hygiene audit reaches ${ENTRY} (corpus: ${CORPUS})`, () => {
  let harness: Harness;
  let client: Client;
  let session: SessionOps;
  let sessionIndex: string;
  /** The `audit-rule-hygiene` technique as the worker on `quality-review` receives it. */
  let pass: string;
  /** The resource ids that delivery points the worker at, read by the server's own extractor. */
  let linked: string[];

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    session = sessionOps(harness, WORKFLOW);

    sessionIndex = await session.start('rule-hygiene-reach', 'orchestrator');
    // The graph enters quality review from intake. Entering the activity by that edge is the run
    // that fetches the step; loading the technique by id alone would show it is readable, not that
    // the activity's worker reaches it.
    await session.enter(sessionIndex, 'intake-and-context');
    await session.enter(sessionIndex, 'quality-review', 'intake-and-context');

    // The step carries a `when`, so the activity does not bundle it eagerly — a worker on this
    // activity fetches it by step id. This is that fetch, not a way around it.
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, activity_id: 'quality-review', step_id: 'audit-rule-hygiene' },
    }) as { isError?: boolean; content?: Array<{ text: string }> };
    expect(fetched.isError ?? false, `fetch failed: ${JSON.stringify(fetched.content)}`).toBe(false);

    pass = fetched.content![0]!.text;
    // The same reader the server runs over an eagerly bundled step to decide what `resource_refs`
    // lists, so these are the ids this delivery hands the worker and not a spelling of this test's.
    linked = extractResourceIds(pass);
  });

  afterAll(async () => { await harness.close(); });

  it('names the entry in the scope the pass declares for itself', () => {
    expect(pass).toMatch(/This pass's scope is[\s\S]*one-invariant-per-rule/);
  });

  it('addresses the entry at its own section, not at the file or the family around it', () => {
    const entryRefs = linked.filter(ref => ref.includes(ENTRY));
    expect(entryRefs, `resource ids this delivery points at: ${linked.join(', ')}`).not.toEqual([]);
    // A ref with no anchor is the whole catalogue, which exceeds the eager cap and is dropped from
    // a bundle with no warning; a ref at the family around it hands the worker that family.
    expect(entryRefs.filter(ref => !ref.includes('#'))).toEqual([]);
  });

  it('serves the entry itself when the walk fetches what the pass loads', async () => {
    const entry = await fetchEntry();
    expect(entry).toMatch(new RegExp(`^### AP-\\d+\\. ${ENTRY}$`, 'm'));
    for (const part of ['Detect', 'Do not flag', 'Fix']) {
      expect(block(entry, part), `the ${part} block did not survive delivery`).not.toBe('');
    }
  });

  it('delivers an entry naming the three signals and the two carve-outs', async () => {
    expectNamed(await fetchEntry());
  });

  /** The entry as `get_resource` serves it for the id the pass links. */
  async function fetchEntry(): Promise<string> {
    const resourceId = linked.find(ref => ref.includes(ENTRY));
    expect(resourceId, `no delivered resource id names ${ENTRY}`).toBeDefined();
    const loaded = await client.callTool({
      name: 'get_resource',
      arguments: { session_index: sessionIndex, resource_id: resourceId },
    }) as { isError?: boolean; content?: Array<{ text: string }> };
    expect(loaded.isError ?? false, `fetch failed: ${JSON.stringify(loaded.content)}`).toBe(false);
    return body(loaded.content![0]!.text);
  }
});
