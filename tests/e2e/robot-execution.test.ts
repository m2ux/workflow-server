import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { walk, type WalkResult } from './walker.js';
import { fullWorkflowPolicy } from './policies.js';

/**
 * Source of truth for the expected numeric prefix of each activity, read from
 * the activity FILENAMES (e.g. 02-design-philosophy.toon → design-philosophy: "02").
 * This is independent of the server's artifactPrefix computation, so comparing
 * written artifact names against it verifies the whole chain: filename →
 * server artifactPrefix → get_workflow exposure → robot application.
 */
function expectedActivityPrefixes(): Map<string, string> {
  const dir = resolve(import.meta.dirname, '../../workflows/work-package/activities');
  const map = new Map<string, string>();
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(\d+)-(.+)\.toon$/);
    if (m) map.set(m[2], m[1]);
  }
  return map;
}

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

  it('prefixes every written artifact with its activity\'s filename-derived number', () => {
    const expected = expectedActivityPrefixes();
    const wrong: string[] = [];
    for (const s of full.steps) {
      const prefix = expected.get(s.activityId);
      expect(prefix, `no filename prefix known for activity ${s.activityId}`).toBeDefined();
      for (const name of s.artifactsWritten) {
        // Every written artifact must lead with "<NN>-" matching the activity's number.
        if (!name.startsWith(`${prefix}-`)) wrong.push(`${s.activityId}: ${name} (expected ${prefix}-*)`);
      }
    }
    expect(wrong, 'artifacts whose prefix does not match the activity filename').toEqual([]);
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
