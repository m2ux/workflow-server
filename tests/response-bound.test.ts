import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { parse } from 'yaml';
import { DEFAULT_MAX_RESPONSE_CHARS } from '../src/config.js';
import { liveCorpusRoot } from './corpus-root.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * A harness caps what a tool result may carry, and both role-facing deliveries sit on a path their
 * role cannot skip: `get_workflow` opens every orchestrator, and `get_activity` is the call a
 * dispatched worker makes to receive its work. These cases hold each response to the bound, and
 * hold open the fetch paths that make what a bound leaves out reachable.
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
    ops = splitWorkflowResponse(workflowText).ops;
  });

  afterAll(async () => { await harness.close(); });

  /**
   * The bound governs the operations bundle. The workflow metadata after the separator rides on
   * top of it, and is a couple of thousand characters against the bundle's tens of thousands — so
   * a bounded bundle plus that metadata is what the harness actually receives, and both are
   * checked here rather than only the half the bound reads.
   */
  it('holds the operations bundle inside the bound, and the response near it', () => {
    const bundleChars = workflowText.indexOf('\n\n---\n\n');
    expect(bundleChars).toBeGreaterThan(0);
    expect(bundleChars).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    expect(workflowText.length).toBeLessThan(DEFAULT_MAX_RESPONSE_CHARS * 1.2);
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
  });

  afterAll(async () => { await harness.close(); });

  it('holds the whole response inside the bound, batch reading included', () => {
    expect(text.length).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    // Against the window budget alone this delivery runs to 113,000 characters, so a response that
    // merely fits is not evidence: the bound has to be what stopped it, and the window has to have
    // had room to spare when it did.
    expect(meta.delivery_cost.spent_chars).toBeLessThan(meta.delivery_cost.eager_budget_chars / 2);
    expect(meta.delivery_cost.response_bound_chars).toBe(DEFAULT_MAX_RESPONSE_CHARS);
    expect(meta.delivery_cost.response_spent_chars).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    // The response tally is what the delivery is written in, so it accounts for the whole of it.
    expect(meta.delivery_cost.response_spent_chars).toBeGreaterThanOrEqual(text.length);
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
    const second = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: 'w-1', bundle: 'reference' },
    });
    expect(second.isError).toBeFalsy();
    const secondText = responseText(second);
    const secondBundle = parse(secondText.slice(0, secondText.indexOf('\n\n---\n\n'))) as Record<string, unknown>;
    const techniques = (secondBundle['techniques'] ?? {}) as Record<string, Record<string, unknown>>;
    for (const ref of meta.operation_refs ?? []) {
      expect(techniques[ref], `${ref} was deferred and never served`).toBeDefined();
      expect(techniques[ref]!['delivery'], `${ref} came back as a marker it was never sent`).not.toBe('unchanged');
    }
    expect(secondText.length).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
  });

  // Last, because it walks the session on to another activity: a marker draws down no window
  // budget — the worker holds the content — but it is still bytes on the wire, and a response is
  // weighed by a harness that cannot know what the worker holds. An activity whose step map has
  // already been delivered is where the two readings part company.
  it('counts what a collapsed entry costs the response, though it costs the context nothing', async () => {
    await mcp.enter(sessionIndex, 'requirements-elicitation');
    const first = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: 'w-2' },
    });
    expect(first.isError).toBeFalsy();
    expect((first._meta as typeof meta & { bundled_steps?: string[] }).bundled_steps?.length ?? 0)
      .toBeGreaterThan(0);

    const repeat = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: 'w-2', bundle: 'reference' },
    });
    expect(repeat.isError).toBeFalsy();
    const repeatCost = (repeat._meta as typeof meta).delivery_cost;
    const repeatText = responseText(repeat);
    expect(repeatText).toContain('delivery: unchanged');
    expect(repeatText.length).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
    // The response tally covers the collapsed entries; the window tally does not have to.
    expect(repeatCost.response_spent_chars).toBeGreaterThanOrEqual(repeatText.length);
    expect(repeatCost.response_spent_chars).toBeLessThanOrEqual(DEFAULT_MAX_RESPONSE_CHARS);
  });
});
