import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deriveActivityContract } from '../src/utils/activity-variables.js';
import type { RoutineLookup } from '../src/loaders/routine-resolver.js';
import { type Routine, RoutineSchema } from '../src/schema/routine.schema.js';
import type { Activity, Step } from '../src/schema/activity.schema.js';

/**
 * The contract boundary (#704 W03).
 *
 * A routine reference contributes a DECLARED signature and its body is never consulted. That is the
 * same standing a technique step already has — `readSignature` reads what the technique file
 * declares and never inspects a body — so the boundary itself is not new. What a routine adds is
 * that the declared signature is checkable against the thing it describes, which is what
 * `routines-guard.test.ts` covers.
 *
 * These cases are what the guard suite's derivation is held to, so they assert the contract EXACTLY
 * rather than asserting a name is present: an assertion that a set contains what it should would
 * pass on a derivation that also charged the host every internal in the body.
 */

const routine = (partial: Partial<Routine> & { id: string; steps: Step[] }): Routine =>
  RoutineSchema.parse({ version: '1.0.0', name: partial.id, ...partial });

const lookupFrom = (routines: Routine[]): RoutineLookup =>
  (workflowId) => (workflowId === 'wf' ? new Map(routines.map((r) => [r.id, r])) : undefined);

/**
 * The run whose body reads and writes far more than its signature names — which is the whole point.
 * `interim_finding` is an internal and `body_only_read` is a name reachable only through the body;
 * neither may reach the host.
 */
const SHARED_RUN = routine({
  id: 'shared-run',
  inputs: [
    { id: 'gate_message', description: 'presented at the gate' },
    { id: 'decision_space', description: 'which options the gate offers', default: 'resolve-or-defer' },
    { id: 'target_path', description: 'where the run looks' },
  ],
  outputs: [
    { id: 'run_verdict', type: 'string', description: 'what the run settled' },
    { id: 'run_notes', type: 'string', description: 'what it noted', optional: true },
  ],
  internals: [
    { id: 'interim_finding', description: 'handed from one step to the next' },
  ],
  steps: [
    {
      kind: 'action', id: 'look',
      actions: [
        { action: 'set', target: 'interim_finding', value: '{target_path} under {body_only_read}' },
      ],
    },
    {
      kind: 'checkpoint', id: 'gate', message: '{gate_message} ({decision_space})',
      options: [{
        id: 'go', label: 'Go',
        effect: { setVariable: { run_verdict: '{interim_finding}', run_notes: 'seen' } },
      }],
    },
  ] as Step[],
});

/** Derive the contract of an activity whose only step is one reference. */
async function contractOf(reference: Record<string, unknown>, namespace: string[]): Promise<{
  reads: string[]; writes: string[]; mentions: string[];
}> {
  const root = mkdtempSync(join(tmpdir(), 'wf-contract-'));
  try {
    const activity = {
      id: 'host', version: '1.0.0', name: 'Host', required: true,
      steps: [{ kind: 'routine', id: 'run', routine: 'shared-run', ...reference }],
    } as unknown as Activity;
    const derived = await deriveActivityContract({
      activity, workflowDir: root, scopeWorkflowId: 'wf',
      namespace: new Set(namespace), routines: lookupFrom([SHARED_RUN]),
    });
    return {
      reads: [...derived.reads].sort(),
      writes: [...derived.writes].sort(),
      mentions: [...derived.mentions].sort(),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const NAMESPACE = [
  'assumption_review_presentation', 'host_verdict', 'host_notes', 'target_path',
  // Declared, so that if the boundary leaked they would appear rather than being filtered out.
  'interim_finding', 'body_only_read', 'decision_space', 'gate_message', 'run_verdict',
];

describe('an activity whose only step is a routine reference', () => {
  it('is charged exactly the declared signature', async () => {
    const contract = await contractOf({
      with: { gate_message: '{assumption_review_presentation}' },
      outputs: { run_verdict: 'host_verdict', run_notes: 'host_notes' },
    }, NAMESPACE);

    // Reads: the braced argument's target, plus `target_path` — declared, bound nowhere, and with no
    // default, so it takes the host's value under its own name.
    expect(contract.reads).toEqual(['assumption_review_presentation', 'target_path']);
    // Writes: the bound outputs under the names the site gave them.
    expect(contract.writes).toEqual(['host_notes', 'host_verdict']);
  });

  it('charges no internal and no name reachable only through the body', async () => {
    const contract = await contractOf({
      with: { gate_message: '{assumption_review_presentation}' },
      outputs: { run_verdict: 'host_verdict', run_notes: 'host_notes' },
    }, NAMESPACE);

    // Both are declared workflow variables here, so their absence is the boundary holding rather
    // than the namespace filtering them away.
    for (const name of ['interim_finding', 'body_only_read']) {
      expect(contract.reads).not.toContain(name);
      expect(contract.writes).not.toContain(name);
      expect(contract.mentions).not.toContain(name);
    }
  });

  it('does not read an input a binding satisfies with a literal', async () => {
    const contract = await contractOf({
      with: { gate_message: 'Open assumptions remain.', target_path: 'docs/' },
      outputs: { run_verdict: 'host_verdict', run_notes: 'host_notes' },
    }, NAMESPACE);
    expect(contract.reads).toEqual([]);
  });

  it('does not read an input the declaration defaults', async () => {
    const contract = await contractOf({
      with: { gate_message: 'x', target_path: 'y' },
      outputs: { run_verdict: 'host_verdict', run_notes: 'host_notes' },
    }, NAMESPACE);
    // `decision_space` carries a default, so no site is on the hook for it.
    expect(contract.reads).not.toContain('decision_space');
  });

  it('reads a bare argument that names a variable, as a rename', async () => {
    const contract = await contractOf({
      with: { gate_message: 'assumption_review_presentation', target_path: 'y' },
      outputs: { run_verdict: 'host_verdict', run_notes: 'host_notes' },
    }, NAMESPACE);
    expect(contract.reads).toEqual(['assumption_review_presentation']);
  });

  it('writes nothing for an output the site leaves unbound', async () => {
    const contract = await contractOf({
      with: { gate_message: 'x', target_path: 'y' },
      outputs: { run_verdict: 'host_verdict' },
    }, NAMESPACE);
    expect(contract.writes).toEqual(['host_verdict']);
  });
});
