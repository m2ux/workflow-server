import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { CORE_ORCHESTRATOR_TECHNIQUES, CORE_WORKER_TECHNIQUES, FAN_DISPATCH_TECHNIQUES } from '../src/loaders/core-ops.js';
import { resolveTechniques } from '../src/loaders/technique-loader.js';

/**
 * The delivery-cost gate walks `tests/fixtures/token-bench`, whose `meta` workflow stands in for
 * the role contract every delivery carries. A ref added to the core lists and not to the fixture
 * resolves to nothing there: the gate keeps passing while the content it was meant to price never
 * reaches the walk. These cases hold the fixture to the lists.
 *
 * Stand-ins, not copies: what the fixture owes is a technique at each ref, not the corpus's own
 * prose. A reading taken against this fixture prices how the engine delivers a contract.
 */
const FIXTURE = resolve(import.meta.dirname, 'fixtures/token-bench');

async function unresolvedIn(refs: readonly string[]): Promise<string[]> {
  const resolved = await resolveTechniques([...refs], FIXTURE, 'delivery-fixture');
  return resolved.filter((entry) => entry.type === 'not-found').map((entry) => entry.ref);
}

describe('the benchmark fixture carries the role contract the core lists name', () => {
  it('resolves every core orchestrator technique', async () => {
    expect(await unresolvedIn(CORE_ORCHESTRATOR_TECHNIQUES)).toEqual([]);
  });

  it('resolves every core worker technique', async () => {
    expect(await unresolvedIn(CORE_WORKER_TECHNIQUES)).toEqual([]);
  });

  it('reports a ref the fixture does not carry, so the check can fail', async () => {
    expect(await unresolvedIn(['workflow-engine::no-such-operation'])).toEqual(['workflow-engine::no-such-operation']);
  });
});

/**
 * The fan operations ride a response only where the graph fans, and the fixture's graph is linear.
 * They are named here so the exemption is a recorded decision rather than an omission: a fan added
 * to the fixture would need them, and this case says where to look.
 */
describe('the fan operations are outside the fixture', () => {
  it('does not carry them, the fixture graph fanning nothing', async () => {
    expect(await unresolvedIn(FAN_DISPATCH_TECHNIQUES)).toEqual([...FAN_DISPATCH_TECHNIQUES]);
  });
});
