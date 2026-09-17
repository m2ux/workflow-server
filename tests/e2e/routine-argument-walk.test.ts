import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { deliverActivity } from './deliver-activity.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { liveCorpusRoot } from '../corpus-root.js';
import type { Step } from '../../src/schema/activity.schema.js';

/**
 * One run at two sites that disagree about the operation, driven against the live corpus.
 *
 * The fixture files above prove a routine materialises; what they do not carry is the shape a run
 * takes when the work it does is the site's choice — an operation standing in a body step, gates
 * reading what that operation reported, and a second site supplying something else. That shape is
 * what `meta/routines/activity-loop.yaml` has, and a specimen is where it can be walked without
 * standing up a client session and a child session to watch it.
 *
 * The specimen is `routine-conformance`, whose two passes refer to one run and supply a different
 * measurement each. Every assertion here is on what a worker receives at each site, because the
 * guarantee is about the two deliveries differing in exactly one thing and agreeing in the rest.
 */

// The specimen may be absent: the engine suite runs against whatever corpus is checked out, and
// this one is only meaningful where routine-conformance is in it.
const CORPUS = liveCorpusRoot();
const LIVE_CORPUS = CORPUS !== null && existsSync(join(CORPUS, 'corpus', 'specimens', 'routine-conformance')) ? CORPUS : null;

let harness: Harness;

beforeAll(async () => {
  if (LIVE_CORPUS) harness = await createHarness({ workflowDir: LIVE_CORPUS });
});
afterAll(async () => { await harness?.close(); });

/** The body of the pass, which is the loop the run's one reference step materialises into. */
async function passBody(activityId: string): Promise<Step[]> {
  const { activity } = await deliverActivity(harness, 'routine-conformance', activityId);
  const steps = activity.steps ?? [];
  const loop = steps.find((s) => s.kind === 'loop') as Extract<Step, { kind: 'loop' }> | undefined;
  expect(loop, `${activityId} delivered no loop`).toBeDefined();
  return loop!.steps as Step[];
}

/** What the measuring step of a pass binds — the operation that site supplied. */
const boundOperation = (body: Step[]): string => {
  const measure = body.find((s) => s.id?.endsWith('.measure')) as Extract<Step, { kind: 'technique' }>;
  expect(measure, 'no measuring step in the delivered body').toBeDefined();
  return typeof measure.technique === 'string' ? measure.technique : measure.technique.name;
};

describe.skipIf(!LIVE_CORPUS)('one run delivered at two sites that supply different operations', () => {
  it('delivers ordinary steps at both sites, with no kind:routine at any depth', async () => {
    for (const site of ['count-pass', 'size-pass']) {
      const { activity } = await deliverActivity(harness, 'routine-conformance', site);
      const kinds: string[] = [];
      const walkSteps = (steps: Step[]): void => {
        for (const step of steps) { kinds.push(step.kind); if (step.kind === 'loop') walkSteps(step.steps as Step[]); }
      };
      walkSteps(activity.steps ?? []);
      expect(kinds, `${site} delivered a construct a worker should never meet`).not.toContain('routine');
      expect(kinds[0], `${site} should open with the run's priming action`).toBe('action');
    }
  });

  it('substitutes each site\'s own operation into the step that stands for it', async () => {
    expect(boundOperation(await passBody('count-pass'))).toBe('count-entries');
    expect(boundOperation(await passBody('size-pass'))).toBe('measure-size');
  });

  it('delivers both bodies under their own reference prefix', async () => {
    const counting = (await passBody('count-pass')).map((s) => s.id);
    const sizing = (await passBody('size-pass')).map((s) => s.id);
    expect(counting.every((id) => id!.startsWith('counting.'))).toBe(true);
    expect(sizing.every((id) => id!.startsWith('sizing.'))).toBe(true);
    // One authored body, so the two differ in the prefix and in nothing else.
    expect(counting.map((id) => id!.replace('counting.', '')))
      .toEqual(sizing.map((id) => id!.replace('sizing.', '')));
  });

  it('delivers the gates that read what the supplied operation produced', async () => {
    for (const site of ['count-pass', 'size-pass']) {
      const gates = (await passBody(site)).map((s) => s.when).filter(Boolean);
      // The run declares `probe_result` as neither input nor output: its own step puts it in the bag
      // and its own gates read it back. Both readings reach the worker at both sites.
      expect(gates, `${site} lost a gate on the operation's own production`)
        .toEqual(expect.arrayContaining(['probe_result.entry_count > 0', 'probe_result.entry_count == 0']));
    }
  });

  it('materialises the run\'s internal under a name of each site\'s own', async () => {
    const nameIn = (body: Step[]): string => {
      const announce = body.find((s) => s.id?.endsWith('.announce-empty-target')) as Extract<Step, { kind: 'action' }>;
      expect(announce, 'no announcement step in the delivered body').toBeDefined();
      return announce.when!;
    };
    const counting = nameIn(await passBody('count-pass'));
    const sizing = nameIn(await passBody('size-pass'));
    // An internal never becomes a workflow variable, so the two sites cannot collide on one.
    expect(counting).not.toBe(sizing);
    expect(counting).toContain('count_pass_counting_');
    expect(sizing).toContain('size_pass_sizing_');
  });
});
