import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { parse } from 'yaml';
import { DEFAULT_MAX_RESPONSE_CHARS } from '../src/config.js';
import { DELIVERY_COST_FIELDS } from '../src/tools/workflow-tools.js';
import { stringifyForResponse } from '../src/utils/serialization.js';
import { liveCorpusRoot } from './corpus-root.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * An agent receives its whole contract when it receives its work.
 *
 * Both role-facing deliveries sit on a path their role cannot skip: `get_workflow` opens every
 * orchestrator, and `get_activity` is the call a dispatched worker makes to receive its work. Each
 * carries every operation of that role's contract entire — capability, interface, procedure and the
 * rules it is held to — and what one tool result may carry is measured and reported rather than
 * spent deciding which of those to withhold.
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

const RECORD_SHAPED = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMarker = (value: unknown): boolean =>
  RECORD_SHAPED(value) && value['delivery'] === 'unchanged';

/**
 * Every operation body in a delivery, from both maps that carry one.
 *
 * A collapsed entry is a whole-item marker rather than a body, and stands for the same bytes
 * delivered earlier — so it is not a body this response is accountable for.
 */
function operationBodies(bundle: Record<string, unknown>): Array<[string, Record<string, unknown>]> {
  const maps = ['techniques', 'step_techniques'] as const;
  const out: Array<[string, Record<string, unknown>]> = [];
  for (const map of maps) {
    for (const [key, body] of Object.entries((bundle[map] ?? {}) as Record<string, unknown>)) {
      if (!RECORD_SHAPED(body) || isMarker(body)) continue;
      out.push([`${map}.${key}`, body]);
    }
  }
  return out;
}

/**
 * A response has two homes for a rule: the bodies of the operations it governs, and the role's own
 * `rules` list, for a rule that governs no one operation.
 *
 * `bodies` reads every rule line the first home holds. `list` reads the lines the second holds that
 * a body ALREADY states -- the overlap between the two, which is empty when each rule has one home.
 *
 * A name and its text join on a vertical bar, which no rule name holds, so no pair of lines can
 * collide by one name ending where the next one's text begins.
 */
function ruleLines(bundle: Record<string, unknown>, where: 'list' | 'bodies'): string[] {
  const key = (name: string, line: unknown): string => `${name}|${String(line)}`;
  const stated = new Set<string>();
  const takeRules = (rules: unknown): void => {
    if (!RECORD_SHAPED(rules)) return;
    for (const [name, value] of Object.entries(rules as Record<string, string | string[]>)) {
      for (const line of Array.isArray(value) ? value : [value]) stated.add(key(name, line));
    }
  };
  for (const [, body] of operationBodies(bundle)) {
    takeRules(body['rules']);
  }
  for (const block of Object.values((bundle['contracts'] ?? {}) as Record<string, unknown>)) {
    if (RECORD_SHAPED(block)) takeRules(block['rules']);
  }
  if (where === 'bodies') return [...stated];
  const list = (bundle['rules'] ?? []) as Array<[string, string]>;
  return list.filter(([name, line]) => stated.has(key(name, line))).map(([name]) => name);
}

describe.skipIf(!liveCorpusRoot())('the startup response carries the orchestrator contract whole', () => {
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
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: mcp.folder('2026-09-17-startup-contract') },
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

  it('carries a body for every operation, and names none it withheld', () => {
    const carried = Object.keys((ops['techniques'] ?? {}) as Record<string, unknown>);
    expect(carried.length, 'no operation body rode the startup response').toBeGreaterThan(0);
    expect(ops['operation_refs'], 'the response named an operation it carried no body for').toBeUndefined();
    expect(ops['operations_note']).toBeUndefined();
  });

  it('carries the rules of each operation, on the body or on a contract it names', () => {
    // An agent reading one operation reads the rules it is held to in the same response: the
    // rules the technique declares ride its body, and the rules a scope shares arrive once
    // under `contracts`, named from `inherits`.
    const contracts = (ops['contracts'] ?? {}) as Record<string, { rules?: Record<string, unknown> }>;
    const held = operationBodies(ops).filter(([, body]) => {
      if (body['rules'] !== undefined) return true;
      const names = body['inherits'];
      if (!Array.isArray(names)) return false;
      return names.some((id) => RECORD_SHAPED(contracts[String(id)]) && contracts[String(id)]!['rules'] !== undefined);
    });
    expect(held.length, 'no operation arrived with the rules it is held to').toBeGreaterThan(0);
    expect(Object.keys(contracts).length, 'inherited rules had no contract to ride').toBeGreaterThan(0);
  });

  it('carries the role\'s own rules, and states no rule twice', () => {
    // A rule has one home, and which home is decided by what it governs. A rule an operation
    // declares rides that operation's body; a rule a scope shares rides that scope's contract;
    // `rules` carries what governs the agent rather than any one operation. Reading both and
    // finding a line in each would be a reader asked to hold the same boundary twice over,
    // from two places that can drift apart.
    expect(Array.isArray(ops['rules'])).toBe(true);
    const list = ops['rules'] as Array<[string, string]>;
    expect(list.length).toBeGreaterThan(0);
    expect(ruleLines(ops, 'list'), 'the list restates a rule a body or contract already carries')
      .toEqual([]);
  });

  /**
   * The roster an orchestrator drives a run by: every name the run holds, with the facts a driver
   * acts on. It recognises a name a worker reports back and reads a value out of the session by it,
   * so a missing declaration is a run it cannot follow.
   *
   * The prose explaining what each one is FOR is not here, and its absence is the contract rather
   * than a limit having reached it — nothing the orchestrator decides turns on it, and the activity
   * that produces a value and the activity that consumes it each carry it in their own definition.
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
    expect(summary['variables_note']).toBeUndefined();
  });

  /**
   * The limit reports; it decides nothing. `work-package` is the corpus's widest startup response,
   * so this reads what the largest opening call now comes to — and a result over the limit is a
   * workflow that wants dividing, which the server logs and delivers anyway.
   */
  it('goes out whole whether or not it fits what one tool result may carry', () => {
    expect(wholeResult).toBeGreaterThan(0);
    expect(ops['techniques'], 'the limit shed an operation body').toBeDefined();
  });

  it('refuses an id outside the contract this session names', async () => {
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: 'some-other-workflow::secret' },
    });
    expect(fetched.isError).toBe(true);
    expect(JSON.stringify(fetched.content)).toContain('not an operation this session');
  });

  it('still serves an operation by id, for a context that lost its delivery', async () => {
    const carried = Object.keys((ops['techniques'] ?? {}) as Record<string, unknown>);
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: carried[0] },
    });
    expect(fetched.isError ?? false, `fetch failed: ${JSON.stringify(fetched.content)}`).toBe(false);
    expect(responseText(fetched).length).toBeGreaterThan(0);
  });

  it('refuses a call naming both an operation and a step', async () => {
    const fetched = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, technique_id: 'agent-conduct', step_id: 'resolve-target' },
    });
    expect(fetched.isError).toBe(true);
  });
});

describe.skipIf(!liveCorpusRoot())('a worker delivery carries the worker contract whole', () => {
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
      response_bound_chars: number; fixed_chars: number; worker_bundle_chars: number;
    };
    operation_refs?: string[];
  };

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    mcp = sessionOps(harness, 'work-package');
    sessionIndex = await mcp.start('2026-09-18-worker-contract', 'orchestrator');
    await mcp.enter(sessionIndex, 'start-work-package');
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: 'w-1' },
    });
    expect(result.isError).toBeFalsy();
    text = responseText(result);
    bundle = parse(text.slice(0, text.indexOf('\n\n---\n\n'))) as Record<string, unknown>;
    meta = result._meta as typeof meta;
  });

  afterAll(async () => { await harness.close(); });

  it('carries the activity, the rules and every operation, and names none it withheld', () => {
    const body = parse(text.slice(text.indexOf('\n\n---\n\n') + 7)) as Record<string, unknown>;
    expect(body['id']).toBe('start-work-package');
    expect(body['steps']).toBeDefined();
    // Every rule this worker is held to rides the body of the operation or step it governs, so on
    // this activity the role's own list is empty and absent rather than empty and present. A rule
    // governing no one operation would put it back.
    expect(ruleLines(bundle, 'list'), 'the list restates a rule an operation body already carries')
      .toEqual([]);
    expect(ruleLines(bundle, 'bodies').length, 'the worker was handed no rules at all')
      .toBeGreaterThan(0);
    expect(Object.keys((bundle['techniques'] ?? {}) as Record<string, unknown>).length).toBeGreaterThan(0);
    expect(bundle['operation_refs'], 'the payload named an operation it carried no body for').toBeUndefined();
    expect(bundle['operations_note']).toBeUndefined();
    expect(meta.operation_refs, 'the metadata named an operation the payload withheld').toBeUndefined();
  });

  it('carries the rules of each operation and each inlined step in the body that states them', () => {
    const withRules = operationBodies(bundle).filter(([, entry]) => entry['rules'] !== undefined);
    expect(withRules.length, 'no delivered body carried the rules it is held to').toBeGreaterThan(0);
  });

  /**
   * The activity this opens on walks eleven ungated steps, and every one of them is a certain round
   * trip rather than a possible one. So the whole map rides: what the window budget holds back is
   * speculative content, and nothing here is.
   */
  it('inlines every step the activity walks unconditionally', () => {
    const inlined = Object.keys((bundle['step_techniques'] ?? {}) as Record<string, unknown>);
    expect(inlined.length).toBeGreaterThanOrEqual(11);
    // The window had room to spare, so the map is what the activity declares rather than what fitted.
    expect(meta.delivery_cost.spent_chars).toBeLessThan(meta.delivery_cost.eager_budget_chars);
  });

  it('inlined steps name inherited contracts instead of copying them', () => {
    const contracts = (bundle['contracts'] ?? {}) as Record<string, unknown>;
    const steps = Object.values((bundle['step_techniques'] ?? {}) as Record<string, unknown>);
    const named = steps.filter((step) => RECORD_SHAPED(step) && !isMarker(step) && Array.isArray(step['inherits']));
    expect(named.length, 'no inlined step named a contract').toBeGreaterThan(0);
    for (const step of steps) {
      if (!RECORD_SHAPED(step) || isMarker(step)) continue;
      expect(step['inherited_inputs'], 'an inlined step copied inherited inputs').toBeUndefined();
      expect(step['inherited_outputs'], 'an inlined step copied inherited outputs').toBeUndefined();
      const names = step['inherits'];
      if (!Array.isArray(names)) continue;
      for (const id of names) {
        expect(RECORD_SHAPED(contracts[String(id)]), `contract '${String(id)}' was named and absent`).toBe(true);
      }
    }
  });

  it('reports what the delivery came to against what one tool result may carry', () => {
    expect(meta.delivery_cost.response_bound_chars).toBe(DEFAULT_MAX_RESPONSE_CHARS);
    // The batch block reports on the handover rather than being part of what was handed over, so
    // the delivery is the text ahead of it.
    const delivery = text.slice(0, text.lastIndexOf('\n\nbatch:'));
    expect(delivery.length).toBeGreaterThan(0);
    expect(meta.delivery_cost.response_spent_chars).toBe(delivery.length);
    expect(meta.delivery_cost.fixed_chars).toBeGreaterThan(0);
    expect(meta.delivery_cost.fixed_chars).toBeLessThan(delivery.length);
    expect(Object.keys(meta.delivery_cost).sort()).toEqual([...DELIVERY_COST_FIELDS].sort());
  });
});

/**
 * No marker names a fragment (#829).
 *
 * A marker stands for a WHOLE item — one composed technique, one rules list, one note, one resource
 * — so a reader that cannot resolve one has a call that returns the thing it lacks. A marker on a
 * FIELD of a body has no such call: the field is not a thing with an identity, only a component of
 * an operation that was delivered anyway.
 *
 * Read over both delivery modes and both maps, because the fragmenting pass ran across the
 * operations bundle and the step map alike.
 */
describe.skipIf(!liveCorpusRoot())('a marker stands for a whole item', () => {
  it('holds across a walk delivered twice to one worker', async () => {
    const harness = await createHarness();
    const mcp = sessionOps(harness, 'work-package');
    let sawEntries = 0;
    let sawMarkers = 0;
    try {
      const idx = await mcp.start('2026-09-18-whole-item-markers', 'orchestrator');
      await mcp.enter(idx, 'start-work-package');
      await mcp.enter(idx, 'requirements-elicitation');
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
        for (const [map, entries] of [
          ['techniques', parsed['techniques']], ['step_techniques', parsed['step_techniques']],
          ['resources', parsed['resources']],
        ] as const) {
          for (const [key, entry] of Object.entries((entries ?? {}) as Record<string, unknown>)) {
            if (!RECORD_SHAPED(entry)) continue;
            // A whole-entry marker is the shape this asserts is the only one.
            if (isMarker(entry)) { sawMarkers += 1; continue; }
            sawEntries += 1;
            for (const [field, value] of Object.entries(entry)) {
              expect(isMarker(value),
                `${map}.${key}.${field} is a marker naming a piece of a body`).toBe(false);
            }
          }
        }
      }
      expect(sawEntries, 'no body was delivered, so nothing was checked').toBeGreaterThan(0);
      expect(sawMarkers, 'nothing collapsed, so the whole-item claim was not exercised').toBeGreaterThan(0);
    } finally {
      await harness.close();
    }
  }, 120_000);
});

/**
 * What a role is sent does not vary with the room left for it.
 *
 * The limit measures the whole tool result and logs a result that exceeds it. It decides nothing, so
 * the same walk driven at a quarter of the default limit hands over byte-identical deliveries. A
 * single reading at the served limit could not tell that from a payload that merely fitted, which is
 * why this sweeps a fourfold range.
 *
 * A call too big to hand over in one piece is work that wants dividing, and that is what the log
 * line says; #836 carries what, if anything, should happen beyond reporting it.
 */
describe.skipIf(!liveCorpusRoot())('a delivery is the same however the limit is set', () => {
  const LIMITS = [80_000, 60_000, 44_000, 20_000];
  const RUN = ['start-work-package', 'design-philosophy', 'requirements-elicitation'];

  it('sends the same workflow definition and the same contract at every limit', async () => {
    const seen: string[] = [];
    for (const limit of LIMITS) {
      const harness = await createHarness({ maxResponseChars: limit });
      const mcp = sessionOps(harness, 'work-package');
      try {
        const idx = await mcp.start(`2026-09-19-definition-${limit}`, 'orchestrator');
        const result = await harness.client.callTool({
          name: 'get_workflow', arguments: { session_index: idx },
        });
        expect(result.isError).toBeFalsy();
        const { ops, summary } = splitWorkflowResponse(responseText(result));
        const declared = (summary['variables'] ?? []) as Array<Record<string, unknown>>;
        // The prose is absent because it is not owed, so a tighter limit has nothing to take.
        expect(declared.filter(v => v['description'] !== undefined),
          `${limit}: prose rode a response that does not owe it`).toEqual([]);
        expect(summary['initialActivity'], `${limit}: no initial activity`).toBeTruthy();
        expect(Object.keys((summary['graph'] ?? {}) as object).length, `${limit}: no graph`).toBeGreaterThan(0);
        expect((summary['activities'] as unknown[]).length, `${limit}: no roster`).toBeGreaterThan(0);
        expect(ops['operation_refs'], `${limit}: the limit shed an operation body`).toBeUndefined();
        // Less what identifies the session rather than the workflow: a fresh session per limit
        // carries its own index and its own planning folder by construction.
        const { session_index: _idx, planning_folder_path: _folder, ...definition } = summary;
        seen.push(stringifyForResponse({ ops, definition }));
      } finally {
        await harness.close();
      }
    }
    expect(new Set(seen).size, `the opening call varied with the limit: ${LIMITS.join(', ')}`).toBe(1);
  }, 300_000);

  it('sends the same worker deliveries across a run of three at every limit', async () => {
    const seen: string[] = [];
    for (const limit of LIMITS) {
      const harness = await createHarness({ maxResponseChars: limit });
      const mcp = sessionOps(harness, 'work-package');
      const walk: string[] = [];
      try {
        const idx = await mcp.start(`2026-09-19-worker-${limit}`, 'orchestrator');
        for (const activityId of RUN) {
          await mcp.enter(idx, activityId);
          // A fresh scope per activity, so every delivery is a full one and no reading of this
          // depends on what a sibling case left in a ledger.
          const taken = await harness.client.callTool({
            name: 'get_activity',
            arguments: { session_index: idx, context_tokens: 200_000, agent_id: `w-${activityId}` },
          });
          expect(taken.isError ?? false, `${limit} ${activityId}: ${JSON.stringify(taken.content)}`).toBe(false);
          const meta = taken._meta as {
            operation_refs?: string[]; bundled_steps?: string[]; bundled_resources?: string[];
          };
          expect(meta.operation_refs, `${limit} ${activityId}: an operation was withheld`).toBeUndefined();
          // The session index rides the header of every delivery and is fresh per limit.
          walk.push(responseText(taken).split('\n').filter(l => !l.startsWith('session_index:')).join('\n'));
        }
      } finally {
        await harness.close();
      }
      seen.push(walk.join('\n@@\n'));
    }
    expect(new Set(seen).size, `a worker delivery varied with the limit: ${LIMITS.join(', ')}`).toBe(1);
  }, 300_000);
});
