import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { parse } from 'yaml';
import { DEFAULT_MAX_WORKFLOW_RESPONSE_CHARS } from '../src/config.js';
import { liveCorpusRoot } from './corpus-root.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * `get_workflow` is on the startup path every orchestrator follows, and a harness caps what a tool
 * result may carry — so the one delivery with nothing bounding it was the one that stopped being
 * readable. These cases hold the bound, and hold open the fetch path that makes what it leaves out
 * reachable.
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
    expect(bundleChars).toBeLessThanOrEqual(DEFAULT_MAX_WORKFLOW_RESPONSE_CHARS);
    expect(workflowText.length).toBeLessThan(DEFAULT_MAX_WORKFLOW_RESPONSE_CHARS * 1.2);
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
