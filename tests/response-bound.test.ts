import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { parse } from 'yaml';
import { DEFAULT_MAX_RESPONSE_CHARS } from '../src/config.js';
import { DELIVERY_COST_FIELDS } from '../src/tools/workflow-tools.js';
import { contentHash } from '../src/utils/delivery.js';
import { stringifyForResponse } from '../src/utils/serialization.js';
import { liveCorpusRoot } from './corpus-root.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * Both role-facing deliveries sit on a path their role cannot skip: `get_workflow` opens every
 * orchestrator, and `get_activity` is the call a dispatched worker makes to receive its work. What
 * either carries is charged to that role's context for the session that follows, so each is held to
 * what one tool result may carry. These cases hold each response to that bound, and hold open the
 * fetch paths that make what a bound leaves out reachable.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function responseText(result: any): string {
  return (result.content[0] as { type: 'text'; text: string }).text;
}

/** The operations bundle a `get_workflow` response carries, and the metadata after the separator. */
function splitWorkflowResponse(text: string): { ops: Record<string, unknown>; summary: Record<string, unknown> } {
  const at = text.indexOf('\n\n---\n\n');
  expect(at).toBeGreaterThan(0);
  return {
    ops: parse(text.slice(0, at)) as Record<string, unknown>,
    summary: parse(text.slice(at + 7)) as Record<string, unknown>,
  };
}

describe.skipIf(!liveCorpusRoot())('the startup response fits what a tool result may carry', () => {
  let harness: Harness;
  let client: Client;
  let mcp: SessionOps;
  let sessionIndex: string;
  let ops: Record<string, unknown>;
  let workflowText: string;
  /** The text and the metadata beside it — what a harness actually weighs. */
  let wholeResult: number;

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    mcp = sessionOps(harness, 'work-package');
    const session = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: mcp.folder('2026-09-17-startup-bound') },
    });
    expect(session.isError).toBeFalsy();
    sessionIndex = (JSON.parse(responseText(session)) as { session_index: string }).session_index;
    const result = await client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex } });
    expect(result.isError).toBeFalsy();
    workflowText = responseText(result);
    wholeResult = workflowText.length + JSON.stringify(result._meta ?? {}).length;
    ops = splitWorkflowResponse(workflowText).ops;
  });

  afterAll(async () => { await harness.close(); });

  /**
   * Both halves of the response answer to the bound. Procedure gives way first; where every
   * operation body is already an id and the response is still over, the prose explaining a variable
   * gives way next. What no shed reaches is the roster, the graph and the declared namespace, which
   * is what an orchestrator drives the run from — so the claim that holds on both role paths is the
   * same one: a response is inside the bound, or it carries no procedure at all.
   */
  it('holds the whole result inside the bound, and carries no procedure when it cannot', () => {
    const bundleChars = workflowText.indexOf('\n\n---\n\n');
    expect(bundleChars).toBeGreaterThan(0);
    expect(bundleChars).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    // A harness weighs the metadata beside the text, so the reading that matters is the two
    // together. `work-package` is the corpus's widest startup response.
    expect(wholeResult).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    if (wholeResult > DEFAULT_MAX_RESPONSE_CHARS) {
      expect(ops['techniques'], 'over the bound with an operation body aboard').toBeUndefined();
    }
  });

  /**
   * The roster an orchestrator drives a run by: every name the run holds, with the facts a driver
   * acts on. It recognises a name a worker reports back and reads a value out of the session by it,
   * so a missing declaration is a run it cannot follow.
   *
   * The prose explaining what each one is FOR is not here, and its absence is the contract rather
   * than a limit having reached it — nothing the orchestrator decides turns on it, and the activity
   * that produces a value and the activity that consumes it each carry it in their own definition.
   * Asserted on the served bound, where the response has room to spare, so this reads as what the
   * payload owes rather than as what fitted.
   */
  it('states the roster and none of the prose explaining it', () => {
    const summary = splitWorkflowResponse(workflowText).summary;
    const declared = (summary['variables'] ?? []) as Array<Record<string, unknown>>;
    expect(declared.length).toBeGreaterThan(0);
    for (const variable of declared) {
      expect(variable['name'], `a declaration arrived with no name: ${JSON.stringify(variable)}`).toBeTruthy();
      expect(variable['type'], `${String(variable['name'])} arrived with no type`).toBeTruthy();
    }
    const described = declared.filter(v => v['description'] !== undefined);
    expect(described.map(v => v['name']), 'prose rode a response that does not owe it').toEqual([]);
    // And nothing explains an absence that is not a shed.
    expect(summary['variables_note']).toBeUndefined();
  });

  it('carries the role\'s rules whole, whatever it defers', () => {
    // The contract is what an orchestrator is held to from its first call. A bundle that deferred
    // rules would be one where a run could breach a boundary it was never handed.
    expect(Array.isArray(ops['rules'])).toBe(true);
    expect((ops['rules'] as unknown[]).length).toBeGreaterThan(0);
  });

  it('names what it deferred, and says how to get it', () => {
    const deferred = (ops['operation_refs'] ?? []) as string[];
    if (deferred.length === 0) {
      // A corpus small enough to fit whole is a valid state, and the note has nothing to say.
      expect(ops['operations_note']).toBeUndefined();
      return;
    }
    expect(String(ops['operations_note'])).toContain('technique_id');
    const carried = Object.keys((ops['techniques'] ?? {}) as Record<string, unknown>);
    for (const ref of deferred) {
      expect(carried, `${ref} was both carried and deferred`).not.toContain(ref);
    }
  });

  it('serves a deferred operation by id', async () => {
    const deferred = (ops['operation_refs'] ?? []) as string[];
    if (deferred.length === 0) return;
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: deferred[0] },
    });
    expect(fetched.isError ?? false, `fetch failed: ${JSON.stringify(fetched.content)}`).toBe(false);
    expect(responseText(fetched).length).toBeGreaterThan(0);
  });

  it('refuses an id outside the contract this session names', async () => {
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: 'some-other-workflow::secret' },
    });
    expect(fetched.isError).toBe(true);
    expect(JSON.stringify(fetched.content)).toContain('not an operation this session');
  });

  it('refuses a call naming both an operation and a step', async () => {
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: 'agent-conduct', step_id: 'resolve-target' },
    });
    expect(fetched.isError).toBe(true);
  });
});

describe.skipIf(!liveCorpusRoot())('a worker delivery fits what a tool result may carry', () => {
  let harness: Harness;
  let client: Client;
  let mcp: SessionOps;
  let sessionIndex: string;
  /** The corpus's heaviest delivery: eleven ungated steps against a 28,000-character definition. */
  let text: string;
  let bundle: Record<string, unknown>;
  let meta: {
    delivery_cost: {
      spent_chars: number; eager_budget_chars: number; response_spent_chars: number;
      response_bound_chars: number; fixed_chars: number; deferred_operations: number;
      worker_bundle_chars: number;
    };
    operation_refs?: string[];
  };
  /** The metadata as the result carries it, for measuring what rides beside the text. */
  let rawMeta: unknown;

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    mcp = sessionOps(harness, 'work-package');
    sessionIndex = await mcp.start('2026-09-18-worker-bound', 'orchestrator');
    await mcp.enter(sessionIndex, 'start-work-package');
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: 'w-1' },
    });
    expect(result.isError).toBeFalsy();
    text = responseText(result);
    bundle = parse(text.slice(0, text.indexOf('\n\n---\n\n'))) as Record<string, unknown>;
    meta = result._meta as typeof meta;
    rawMeta = result._meta ?? {};
  });

  afterAll(async () => { await harness.close(); });

  it('holds the whole result inside the bound, batch reading and metadata included', () => {
    // A harness weighs the tool result, which is the text and the protocol metadata beside it, so
    // that pair is the reading the bound has to hold.
    const wire = text.length + JSON.stringify(rawMeta).length;
    expect(wire).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    // Against the window budget alone this delivery runs to 113,000 characters, so a response that
    // merely fits is not evidence: the bound has to be what stopped it, and the window has to have
    // had room to spare when it did.
    expect(meta.delivery_cost.spent_chars).toBeLessThan(meta.delivery_cost.eager_budget_chars / 2);
    expect(meta.delivery_cost.response_bound_chars).toBe(DEFAULT_MAX_RESPONSE_CHARS);
    expect(meta.delivery_cost.response_spent_chars).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    // The response tally is what the delivery is written in, so it accounts for the whole of it.
    expect(meta.delivery_cost.response_spent_chars).toBeGreaterThanOrEqual(wire);
  });

  /**
   * The bound reserves room for `delivery_cost` before its figures are known, from a list of the
   * fields it reports. A field added to the reading and not to that list is room the reservation
   * never took, so the two are held together here rather than by a comment asking for it.
   */
  it('reserves room for every field the delivery cost reports', () => {
    expect(Object.keys(meta.delivery_cost).sort()).toEqual([...DELIVERY_COST_FIELDS].sort());
  });

  it('carries the activity and the rules whole, and defers procedure', () => {
    // The activity is what the call is for and the rules are the contract the worker is held to.
    // What gives way is the procedure — every piece of it fetchable by id.
    const body = parse(text.slice(text.indexOf('\n\n---\n\n') + 7)) as Record<string, unknown>;
    expect(body['id']).toBe('start-work-package');
    expect(body['steps']).toBeDefined();
    expect(Array.isArray(bundle['rules'])).toBe(true);
    expect((bundle['rules'] as unknown[]).length).toBeGreaterThan(0);
    expect(meta.delivery_cost.deferred_operations).toBeGreaterThan(0);
    expect(meta.operation_refs).toHaveLength(meta.delivery_cost.deferred_operations);
    const carried = Object.keys((bundle['techniques'] ?? {}) as Record<string, unknown>);
    for (const ref of meta.operation_refs ?? []) {
      expect(carried, `${ref} was both carried and deferred`).not.toContain(ref);
    }
    expect(String(bundle['operations_note'])).toContain('technique_id');
  });

  it('serves an operation it deferred, by id, to the worker it deferred it from', async () => {
    const deferred = (meta.operation_refs ?? [])[0]!;
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: deferred, agent_id: 'w-1' },
    });
    expect(fetched.isError ?? false, `fetch failed: ${JSON.stringify(fetched.content)}`).toBe(false);
    expect(responseText(fetched).length).toBeGreaterThan(0);
  });

  it('records no delivery for a body it did not send', async () => {
    // A ledger entry for a deferred body would collapse a later delivery to a marker for bytes this
    // worker never received — the one failure a bound must not introduce. The second delivery is
    // where that would show: it carries what the first left out, in full.
    //
    // Its own session and its own scope, because what this asserts is about one context's whole
    // history: a case reading a session another case has walked on is a case whose meaning moves
    // when the file is reordered.
    const own = await createHarness();
    const ownMcp = sessionOps(own, 'work-package');
    try {
      const idx = await ownMcp.start('2026-09-18-deferred-ledger', 'orchestrator');
      await ownMcp.enter(idx, 'start-work-package');
      const first = await own.client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1' },
      });
      expect(first.isError).toBeFalsy();
      const deferred = ((first._meta as typeof meta).operation_refs ?? []);
      expect(deferred.length, 'this activity is the one whose contract the bound has to cut').toBeGreaterThan(0);

      const second = await own.client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1', bundle: 'reference' },
      });
      expect(second.isError).toBeFalsy();
      const secondText = responseText(second);
      const secondBundle = parse(secondText.slice(0, secondText.indexOf('\n\n---\n\n'))) as Record<string, unknown>;
      const techniques = (secondBundle['techniques'] ?? {}) as Record<string, Record<string, unknown>>;
      for (const ref of deferred) {
        expect(techniques[ref], `${ref} was deferred and never served`).toBeDefined();
        expect(techniques[ref]!['delivery'], `${ref} came back as a marker it was never sent`).not.toBe('unchanged');
      }
      expect(secondText.length).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    } finally {
      await own.close();
    }
  });

  // A marker draws down no window budget — the worker holds the content — but it is still bytes on
  // the wire, and a response is weighed by a harness that cannot know what the worker holds. An
  // activity whose step map has already been delivered is where the two readings part company.
  it('counts what a collapsed entry costs the response, though it costs the context nothing', async () => {
    const own = await createHarness();
    const ownMcp = sessionOps(own, 'work-package');
    try {
      const idx = await ownMcp.start('2026-09-18-collapsed-entry-cost', 'orchestrator');
      await ownMcp.enter(idx, 'start-work-package');
      // An activity that inlines steps, so the repeat has a step map to collapse.
      await ownMcp.enter(idx, 'requirements-elicitation');
      const first = await own.client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-2' },
      });
      expect(first.isError).toBeFalsy();
      expect((first._meta as typeof meta & { bundled_steps?: string[] }).bundled_steps?.length ?? 0)
        .toBeGreaterThan(0);

      const repeat = await own.client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-2', bundle: 'reference' },
      });
      expect(repeat.isError).toBeFalsy();
      const repeatCost = (repeat._meta as typeof meta).delivery_cost;
      const repeatText = responseText(repeat);
      expect(repeatText).toContain('delivery: unchanged');
      expect(repeatText.length).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
      // The response tally covers the collapsed entries; the window tally does not have to.
      expect(repeatCost.response_spent_chars).toBeGreaterThanOrEqual(repeatText.length);
      expect(repeatCost.response_spent_chars).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    } finally {
      await own.close();
    }
  });
});

/**
 * The bound as a property rather than as a corpus reading.
 *
 * At the configured default the corpus fits, so a case that only measures today's deliveries would
 * pass against a server that had no bound at all. These drive the server at bounds tight enough
 * that the arithmetic has nowhere to hide, over both delivery modes and three windows, and hold it
 * to the claim the design makes:
 *
 *   a delivery is at or under the bound, OR it carries no procedure at all — no inlined step, no
 *   bundled resource — because the activity and the rules it must carry fill the response on their
 *   own;
 *
 *   and the tally the delivery reports never understates what went over the wire, which is what
 *   makes the first claim checkable from the outside.
 */
/**
 * Every block marker a delivery writes points at bytes the worker received.
 *
 * A bundled step entry is built by the same pass that records what it delivered, so an entry the
 * bound turns away must leave the ledger as it found it. If it does not, a later delivery collapses
 * a shared block to a marker the worker cannot read: it names content that was composed for an
 * entry which never shipped.
 *
 * Both halves of a marker hash the same way — `contentHash` over the field rendered under its own
 * name — so a reader can recompute, from the full copies it was sent, the hash every marker should
 * be pointing at. That is what this walks.
 */
describe.skipIf(!liveCorpusRoot())('a marker points only at content the worker was sent', () => {
  const BLOCK_SHAPED = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  /**
   * An inherited block is delivered either whole or as a `note` and `items` staged separately,
   * and its whole-block hash is taken over the block before any of that splitting. So a marker for
   * one names a rendering no response need have emitted as a unit, and the reader resolves it from
   * the halves instead. That convention predates the bound and is measurable without it (#829);
   * this case is about what the bound does, so it reads the fields that are staged and rendered
   * under the same rule.
   */
  const SPLIT_BLOCKS = ['inherited_inputs', 'inherited_outputs'];

  /** Walk one step-technique entry, collecting the hashes it references and the ones it renders. */
  function readEntry(entry: Record<string, unknown>, referenced: Set<string>, rendered: Set<string>): void {
    for (const [field, value] of Object.entries(entry)) {
      if (field === 'marker') continue;
      if (BLOCK_SHAPED(value) && value['delivery'] === 'unchanged') {
        if (!SPLIT_BLOCKS.includes(field)) referenced.add(String(value['content_hash']));
        continue;
      }
      rendered.add(contentHash(stringifyForResponse({ [field]: value })));
      // An inherited block splits into `note` and `items`, each staged under its own hash.
      if (BLOCK_SHAPED(value)) readEntry(value, referenced, rendered);
    }
  }

  it('holds for a step map the bound cut, delivered twice to one worker', async () => {
    // Tight enough that the step loop turns entries away, which is the state the hold-aside is for.
    const harness = await createHarness({ maxResponseChars: 44_000 });
    const mcp = sessionOps(harness, 'work-package');
    const referenced = new Set<string>();
    const rendered = new Set<string>();
    try {
      const idx = await mcp.start('2026-09-18-marker-provenance', 'orchestrator');
      await mcp.enter(idx, 'start-work-package');
      await mcp.enter(idx, 'requirements-elicitation');
      let sawEntries = 0;
      for (const mode of [undefined, 'reference'] as const) {
        const taken = await harness.client.callTool({
          name: 'get_activity',
          arguments: {
            session_index: idx, context_tokens: 200_000, agent_id: 'marker-w',
            ...(mode ? { bundle: mode } : {}),
          },
        });
        expect(taken.isError).toBeFalsy();
        const body = responseText(taken);
        const parsed = parse(body.slice(0, body.indexOf('\n\n---\n\n'))) as Record<string, unknown>;
        // The shared-block pass runs across the operations bundle and the step map alike, and a
        // step's marker may name a block an operation rendered in this same response — so both maps
        // are read, and only the step map is counted as coverage.
        const steps = (parsed['step_techniques'] ?? {}) as Record<string, Record<string, unknown>>;
        const operations = (parsed['techniques'] ?? {}) as Record<string, Record<string, unknown>>;
        for (const [map, entries] of [['operations', operations], ['steps', steps]] as const) {
          for (const entry of Object.values(entries)) {
            // A whole-entry marker names the technique's own composed text, which is hashed by a
            // different rule and settled by the ledger case above; the blocks inside are this one's.
            if (!BLOCK_SHAPED(entry) || entry['delivery'] === 'unchanged') continue;
            if (map === 'steps') sawEntries += 1;
            readEntry(entry, referenced, rendered);
          }
        }
      }
      expect(sawEntries, 'no step entry was delivered, so nothing was checked').toBeGreaterThan(0);
      expect(referenced.size, 'no block collapsed, so the invariant was not exercised').toBeGreaterThan(0);
      for (const hash of referenced) {
        expect(rendered.has(hash), `marker ${hash} names content this worker was never sent`).toBe(true);
      }
    } finally {
      await harness.close();
    }
  }, 120_000);
});

/**
 * What a workflow says about itself does not vary with the room left for it (#830).
 *
 * The roster, the graph and the activities are how a run is driven, so no limit reaches them — and
 * the prose explaining a variable is absent at every size, because the orchestrator does not act on
 * it. Read across a wide sweep rather than at the served bound, because a payload that happened to
 * fit would look identical to one held by a contract, and only the second is what this claims.
 *
 * A definition that fills an opening call on its own is a workflow that has outgrown one
 * orchestrator. The server reports that and changes nothing about what it sends; dividing the
 * workflow is the corpus's answer and #836 carries the question.
 */
describe.skipIf(!liveCorpusRoot())('a workflow definition rides whole at any bound', () => {
  const BOUNDS = [80_000, 60_000, 44_000, 20_000];

  it('sends the same definition however tight the limit', async () => {
    const seen: string[] = [];
    for (const bound of BOUNDS) {
      const harness = await createHarness({ maxResponseChars: bound });
      const mcp = sessionOps(harness, 'work-package');
      try {
        const idx = await mcp.start(`2026-09-19-definition-${bound}`, 'orchestrator');
        const result = await harness.client.callTool({
          name: 'get_workflow', arguments: { session_index: idx },
        });
        expect(result.isError).toBeFalsy();
        const { summary } = splitWorkflowResponse(responseText(result));
        const declared = (summary['variables'] ?? []) as Array<Record<string, unknown>>;
        // The prose is absent because it is not owed, so a tighter limit has nothing to take.
        expect(declared.filter(v => v['description'] !== undefined),
          `${bound}: prose rode a response that does not owe it`).toEqual([]);
        expect(summary['initialActivity'], `${bound}: no initial activity`).toBeTruthy();
        expect(Object.keys((summary['graph'] ?? {}) as object).length, `${bound}: no graph`).toBeGreaterThan(0);
        expect((summary['activities'] as unknown[]).length, `${bound}: no roster`).toBeGreaterThan(0);
        // Less what identifies the session rather than the workflow: a fresh session per bound
        // carries its own index and its own planning folder by construction.
        const { session_index: _idx, planning_folder_path: _folder, ...definition } = summary;
        seen.push(stringifyForResponse(definition));
      } finally {
        await harness.close();
      }
    }
    // Byte-identical across a fourfold range of limits: the definition answers to the contract and
    // to nothing else. A single reading could not tell that from a payload that merely fitted.
    expect(new Set(seen).size, `the definition varied with the limit: ${BOUNDS.join(', ')}`).toBe(1);
  }, 300_000);
});

describe.skipIf(!liveCorpusRoot())('the bound holds wherever it is set', () => {
  const RUN = ['start-work-package', 'design-philosophy', 'requirements-elicitation'];

  for (const bound of [40_000, 24_000]) {
    for (const contextTokens of [200_000, 8_000]) {
      it(`holds a run of three at ${bound} characters, ${contextTokens} declared tokens`, async () => {
        const harness = await createHarness({ maxResponseChars: bound });
        const mcp = sessionOps(harness, 'work-package');
        let checked = 0;
        try {
          const idx = await mcp.start(`2026-09-18-bound-${bound}-${contextTokens}`, 'orchestrator');
          run: for (const activityId of RUN) {
            await mcp.enter(idx, activityId);
            // One scope for the run, so the second and third deliveries collapse what it holds and
            // spend the room that frees — the state where an unaccounted marker would show.
            for (const mode of [undefined, 'reference'] as const) {
              const taken = await harness.client.callTool({
                name: 'get_activity',
                arguments: {
                  session_index: idx, context_tokens: contextTokens, agent_id: 'bound-w',
                  ...(mode ? { bundle: mode } : {}),
                },
              });
              // A small declared window is a small BATCH budget too, and a scope past it is refused
              // its next activity. That is the batch bound doing its own job; the run ends there.
              if (taken.isError) {
                expect(JSON.stringify(taken.content)).toContain('Batch full');
                break run;
              }
              const body = responseText(taken);
              const meta = taken._meta as {
                delivery_cost: { response_spent_chars: number };
                bundled_steps?: string[]; bundled_resources?: string[];
              };
              const where = `${activityId} ${mode ?? 'full'}`;
              // A harness weighs the metadata beside the text, so the wire is the two together and
              // a tally that covered only the text would claim a bound it does not hold.
              const wire = body.length + JSON.stringify(taken._meta ?? {}).length;
              expect(meta.delivery_cost.response_spent_chars,
                `${where}: the tally understates the wire`).toBeGreaterThanOrEqual(wire);
              if (wire > bound) {
                // No procedure at all, which is all three stages: the contract's operation bodies
                // give way first, so a response over the bound carrying one of those is the stage
                // this reads least and the one whose arithmetic is easiest to get wrong.
                const bundle = parse(body.slice(0, body.indexOf('\n\n---\n\n'))) as Record<string, unknown>;
                expect(bundle['techniques'],
                  `${where}: over the bound with an operation body aboard`).toBeUndefined();
                expect(meta.bundled_steps ?? [],
                  `${where}: over the bound with a step inlined`).toHaveLength(0);
                expect(meta.bundled_resources ?? [],
                  `${where}: over the bound with a resource bundled`).toHaveLength(0);
              }
              checked += 1;
            }
          }
        } finally {
          await harness.close();
        }
        // A run the batch bound ended at its first activity still proves something, but a run that
        // checked nothing at all proves nothing — and would pass in silence.
        expect(checked, 'no delivery was checked').toBeGreaterThan(0);
      }, 120_000);
    }
  }
});
