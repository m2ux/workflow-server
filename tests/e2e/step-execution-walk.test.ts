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
 * These cover the two remaining workflows whose step sequence changed when the variable contracts
 * landed (#493): `plain-language` and `prism` each lost an action step whose only content was a
 * write nothing read. A removal is the change most likely to strand a neighbour — a step that read
 * what the removed one set, or a sequence that no longer reaches its end.
 *
 * What each asserts: the walk reaches the activity that changed, executes steps there, the step
 * that went is absent, and the steps around it still run. It is not a completion check. The generic
 * policy drives `plain-language` to a terminal state but leaves `prism` mid-pipeline, because
 * prism's onward route depends on a lens selection no workflow-agnostic policy can invent — so
 * whole-graph reachability stays where it already lives, in the all-workflows walk, and this asks
 * the narrower question that walk cannot answer.
 */
describe('step execution for the workflows whose sequence changed', () => {
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

  it('[plain-language] runs intake-and-profile without the profile-confirmation step it no longer has', async () => {
    const { result, executed } = await robotWalk('plain-language');

    expect(result.loadErrors).toEqual([]);
    expect(result.steps.flatMap((s) => s.unresolved)).toEqual([]);
    expect(result.path).toContain('intake-and-profile');
    // The removed step, and the two that followed it in the same activity.
    expect(executed).not.toContain('settle-profile-when-clear');
    expect(executed).toContain('persist-document-profile');
    expect(executed).toContain('seed-planning-readme');
  }, 300_000);

  it('[prism] runs structural-pass without the unit-output step it no longer has', async () => {
    const { result, executed } = await robotWalk('prism');

    expect(result.loadErrors).toEqual([]);
    expect(result.steps.flatMap((s) => s.unresolved)).toEqual([]);
    expect(result.path).toContain('structural-pass');
    // The removed step sat first in the analysis-unit loop body; the probe after it still runs.
    expect(executed).not.toContain('resolve-unit-output');
    expect(executed).toContain('check-gitnexus');
  }, 300_000);
});
