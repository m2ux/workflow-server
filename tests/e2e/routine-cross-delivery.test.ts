import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { deliverActivity } from './deliver-activity.js';
import { walk } from './walker.js';
import { defaultPolicy } from './policies.js';
import type { Activity, Step } from '../../src/schema/activity.schema.js';

/**
 * What a worker receives from the two activities where a reference meets another mechanism.
 *
 * `routine-cross-products.test.ts` asks the loader what it produced; this asks the server what it
 * delivered. The two are different questions wherever delivery reads something materialisation
 * wrote: a borrowed activity is composed under its source workflow, and a fanned activity is
 * delivered once per element. A loader assertion passes on both while a worker receives the wrong
 * body, so the guarantee is stated here on the payload.
 */

const CORPUS = resolve(import.meta.dirname, '../fixtures/routine-cross');

let harness: Harness;

beforeAll(async () => { harness = await createHarness({ workflowDir: CORPUS }); });
afterAll(async () => { await harness?.close(); });

const deliver = (workflowId: string, activityId: string): ReturnType<typeof deliverActivity> =>
  deliverActivity(harness, workflowId, activityId);

const idsOf = (activity: Activity): Array<string | undefined> => {
  const out: Array<string | undefined> = [];
  const walk = (steps: Step[]): void => {
    for (const step of steps) { out.push(step.id); if (step.kind === 'loop') walk(step.steps as Step[]); }
  };
  walk(activity.steps ?? []);
  return out;
};

describe('a borrowed activity delivered by the workflow that borrowed it', () => {
  /**
   * `meta` declares a routine of the same name with a shorter body, so the wrong resolution is a
   * body a worker could act on rather than an error it would report.
   */
  it('delivers the body from the workflow the activity was authored in', async () => {
    const { activity } = await deliver('borrower-wf', 'shared-review');
    expect(idsOf(activity)).toEqual(['settle-the-scope.weigh', 'settle-the-scope.mark']);
  });

  it('delivers the site argument, not the placeholder the routine declares', async () => {
    const { text } = await deliver('borrower-wf', 'shared-review');
    expect(text).toContain('weighing the borrowed scope');
    expect(text).not.toContain('{settlement_subject}');
  });

  it('names neither the routine nor the construct in what the worker reads', async () => {
    const { text, activity } = await deliver('borrower-wf', 'shared-review');
    expect(text).not.toContain('kind: routine');
    expect(text).not.toContain('routine: settle');
    // The reference step's own id survives only as a prefix on the steps it stands for.
    expect(idsOf(activity)).not.toContain('settle-the-scope');
  });
});

describe('a fanned activity delivered with two references inside it', () => {
  /**
   * Walked through the graph rather than entered directly, so the fan actually runs: the collection
   * is seeded with two elements, and the activity holding the references is reached once per
   * element. Entering it by id would deliver the same body while traversing no fan at all.
   */
  it('is entered once per element, each instance carrying the run', async () => {
    const result = await walk(harness, 'fanned-fixture', defaultPolicy, { mode: 'graph', localCheckpoints: true });
    expect(result.loadErrors).toEqual([]);
    expect(result.path).toEqual(['scope-sweep', 'probe-unit#0', 'probe-unit#1', 'combine-probes']);
    expect(result.finalStatus).toBe('completed');
  });

  it('delivers both runs, each under its own reference prefix', async () => {
    const { activity } = await deliver('fanned-fixture', 'probe-unit');
    expect(idsOf(activity)).toEqual([
      'first-probe.take-reading',
      'first-probe.file-reading',
      'confirming-probe.take-reading',
      'confirming-probe.file-reading',
    ]);
  });

  it('delivers ordinary steps, so the fan repeats an activity holding no reference', async () => {
    const { text, activity } = await deliver('fanned-fixture', 'probe-unit');
    const kinds = (activity.steps ?? []).map((s) => s.kind);
    expect(new Set(kinds)).toEqual(new Set(['action']));
    expect(text).not.toContain('kind: routine');
    expect(text).not.toContain('probe-one');
  });
});
