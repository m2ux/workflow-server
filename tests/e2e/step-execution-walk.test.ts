import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHarness, type Harness } from './harness.js';
import { walk, type WalkResult } from './walker.js';
import { defaultPolicy } from './policies.js';

/**
 * Step execution for the workflows the work-package matrix does not reach.
 *
 * The all-workflows walk runs in `mode: 'graph'`: it traverses activities and transitions and
 * executes no steps, so a workflow whose step sequence broke would still pass it. The six
 * work-package policy walks do execute steps, which covers work-package and the thirteen activities
 * remediate-vuln borrows from it — and nothing else.
 *
 * These cover the two remaining workflows the matrix leaves out: `plain-language` and `prism`. Each
 * has an activity whose step sequence is asserted here by name, so a step dropped from the middle of
 * it — stranding a neighbour that reads what it set, or a sequence that stops short of its end —
 * fails on the definition change that drops it.
 *
 * What each asserts: the walk reaches the activity, executes steps there, and runs the sequence the
 * definition declares for it. It is not a completion check. The generic
 * policy drives `plain-language` to a terminal state but leaves `prism` mid-pipeline, because
 * prism's onward route depends on a lens selection no workflow-agnostic policy can invent — so
 * whole-graph reachability stays where it already lives, in the all-workflows walk, and this asks
 * the narrower question that walk cannot answer.
 */
describe('step execution for the workflows the policy matrix leaves out', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); }, 120_000);
  afterAll(async () => { await h.close(); });

  /** One robot walk, with a planning folder for the artifact stubs the worker writes. */
  async function robotWalk(workflowId: string): Promise<{ result: WalkResult; executed: string[] }> {
    const result = await walk(h, workflowId, defaultPolicy, {
      planningFolder: mkdtempSync(join(tmpdir(), `wf-steps-${workflowId}-`)),
      autoAdvance: true,
      maxVisits: 60,
    });
    const executed = result.steps.flatMap((s) => s.stepsExecuted);
    // eslint-disable-next-line no-console
    console.log(`[${workflowId}] ${result.finalStatus} | ${executed.length} steps over: ${result.path.join(' > ')}`);
    return { result, executed };
  }

  it('[plain-language] runs the intake-and-profile sequence', async () => {
    const { result, executed } = await robotWalk('plain-language');

    expect(result.loadErrors).toEqual([]);
    expect(result.steps.flatMap((s) => s.unresolved)).toEqual([]);
    expect(result.path).toContain('intake-and-profile');
    // The activity's sequence: these two steps, and no settle-profile-when-clear between them.
    expect(executed).not.toContain('settle-profile-when-clear');
    expect(executed).toContain('persist-document-profile');
    expect(executed).toContain('seed-planning-readme');
  }, 300_000);

  it('[prism] runs the structural-pass sequence', async () => {
    const { result, executed } = await robotWalk('prism');

    expect(result.loadErrors).toEqual([]);
    expect(result.steps.flatMap((s) => s.unresolved)).toEqual([]);
    expect(result.path).toContain('structural-pass');
    // The analysis-unit loop body opens with the probe, with no resolve-unit-output ahead of it.
    expect(executed).not.toContain('resolve-unit-output');
    expect(executed).toContain('check-gitnexus');
  }, 300_000);
});
