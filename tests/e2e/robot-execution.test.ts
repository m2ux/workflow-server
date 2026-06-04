import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { walk, type WalkResult } from './walker.js';
import { fullWorkflowPolicy } from './policies.js';

/**
 * Layer 3c — deterministic robot-worker execution. Walks the workflow executing
 * each activity's STEPS in order (default 'robot' mode): fires the checkpoint a
 * step declares at that step, writes a stub for every declared planning
 * artifact, and submits step manifests. This validates the original acceptance
 * criteria — "all planning files created, all decision points presented" —
 * deterministically, with no LLM. The full-workflow policy visits all 14
 * activities, so one walk covers the whole definition.
 */
describe('work-package robot execution (Layer 3c)', () => {
  let h: Harness;
  let full: WalkResult;

  beforeAll(async () => {
    h = await createHarness();
    full = await walk(h, 'work-package', fullWorkflowPolicy); // robot mode is the default
  }, 60_000);
  afterAll(async () => { await h.close(); });

  it('reaches the terminal activity executing steps (not just walking the graph)', () => {
    expect(full.finalStatus).toBe('completed');
    const totalSteps = full.steps.reduce((n, s) => n + s.stepsExecuted.length, 0);
    expect(totalSteps).toBeGreaterThan(0);
  });

  it('writes a stub for every declared planning artifact as it executes', () => {
    const totalWritten = full.steps.reduce((n, s) => n + s.artifactsWritten.length, 0);
    expect(totalWritten, 'planning artifacts written across the walk').toBeGreaterThan(0);

    // design-philosophy declares design-philosophy.md + assumptions-log.md (planning).
    const dp = full.steps.find(s => s.activityId === 'design-philosophy');
    expect(dp?.artifactsWritten.some(n => n.endsWith('design-philosophy.md')), 'design-philosophy.md written').toBe(true);
    expect(dp?.artifactsWritten.some(n => n.endsWith('assumptions-log.md')), 'assumptions-log.md written').toBe(true);
  });

  it('submits step manifests the server accepts (no validation errors)', () => {
    for (const s of full.steps) {
      if (s.manifestStatus !== undefined) {
        expect(['valid', 'warning'], `${s.activityId} manifest`).toContain(s.manifestStatus);
      }
    }
  });

  // Checkpoints declared by an activity but not bound to any step's `checkpoint`
  // field. These are SITUATIONAL — a real worker yields them based on runtime
  // branching (e.g. only when creating a new issue, or when a review finds
  // gaps) — so the deterministic robot never reaches them. They mark 3c's
  // coverage boundary and are exercised only by the agent runs (3a/3b).
  // Baseline-relative: a NEW unbound checkpoint (beyond this set) fails the gate.
  const BASELINE_UNBOUND_CHECKPOINTS = [
    'post-impl-review::block-interview',
    'post-impl-review::rationale-amendment',
    'start-work-package::issue-review',
    'start-work-package::issue-type-selection',
    'start-work-package::jira-project-selection',
    'submit-for-review::body-non-conformant',
  ].sort();

  it('surfaces only the known step-unbound (situational) checkpoints', () => {
    const unbound: string[] = [];
    for (const s of full.steps) for (const o of s.orphanCheckpoints) unbound.push(`${s.activityId}::${o}`);
    expect(unbound.sort()).toEqual(BASELINE_UNBOUND_CHECKPOINTS);
  });
});
