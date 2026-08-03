import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHarness, type Harness } from './harness.js';
import { walk } from './walker.js';
import { fullWorkflowPolicy } from './policies.js';
import type { HistoryEntry } from '../../src/schema/state.schema.js';

/**
 * Worker identity across a whole reference walk (#408).
 *
 * The per-call tests prove the server collapses a re-request under a reused identity. What they
 * cannot show is whether the identity survives gate after gate across a real workflow, which is
 * where the corpus lost it: thirteen of work-package's fifteen activities carry a gate, and a
 * third of the crossings in the profiled runs arrived under a fresh identity. This walk dispatches
 * each activity under its own identity, crosses every gate the full-workflow policy reaches, and
 * re-requests the activity after each one — so identity reuse is measured over many crossings
 * rather than asserted once.
 */
describe('worker identity survives every gate of a reference walk (#408)', () => {
  let h: Harness;
  let workspaceDir: string;

  beforeAll(async () => {
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-identity-walk-'));
    h = await createHarness({ workspaceDir });
  });
  afterAll(async () => { await h.close(); });

  it('reuses one identity per activity and never re-delivers a payload', async () => {
    const result = await walk(h, 'work-package', fullWorkflowPolicy, {
      mode: 'robot',
      workerIdentity: true,
      planningFolder: workspaceDir,
    });

    // The walk has to actually reach the gate-heavy middle of the workflow, or the assertions
    // below pass by covering nothing.
    expect(result.finalStatus).toBe('completed');
    expect(result.gateRefetches.length).toBeGreaterThanOrEqual(10);

    const history = JSON.parse(
      readFileSync(join(workspaceDir, '.engineering/artifacts/planning', result.planningSlug, 'session.json'), 'utf8'),
    ) as { history: HistoryEntry[] };

    // 1. Nothing was ever delivered twice. This is the event that exists precisely to make the
    //    fault visible, so a zero here is the whole claim of the change.
    const redelivered = history.history.filter(e => e.type === 'activity_redelivered');
    expect(redelivered.map(e => `${e.activity}:${JSON.stringify(e.data)}`)).toEqual([]);

    // 2. One identity per activity, across every arrival that activity saw.
    const byActivity = new Map<string, Set<string>>();
    for (const e of history.history.filter(h => h.type === 'activity_dispatched')) {
      const agentId = (e.data as { agentId: string }).agentId;
      const key = e.activity ?? '(none)';
      if (!byActivity.has(key)) byActivity.set(key, new Set());
      byActivity.get(key)!.add(agentId);
    }
    for (const [activity, ids] of byActivity) {
      expect([...ids], `${activity} saw more than one delivery identity`).toHaveLength(1);
    }

    // 3. Every post-gate re-request is a resume of a context the server has met — never a first
    //    arrival. A 'fresh' here is the #408 fault reproducing.
    const kinds = new Set(result.gateRefetches.map(r => r.dispatch));
    expect([...kinds]).toEqual(['resume']);

    // 4. The collapse is real, not nominal: after the first gate of an activity the payload the
    //    resumed worker receives is a fraction of what its dispatch delivered.
    const firstDelivery = new Map<string, number>();
    for (const e of history.history.filter(h => h.type === 'activity_dispatched')) {
      const key = e.activity ?? '(none)';
      const chars = (e.data as { chars?: number }).chars;
      if (chars !== undefined && !firstDelivery.has(key)) firstDelivery.set(key, chars);
    }
    let delivered = 0, wouldHaveBeen = 0;
    for (const r of result.gateRefetches) {
      const full = firstDelivery.get(r.activityId);
      if (full === undefined) continue;
      expect(r.chars, `${r.activityId}/${r.checkpointId} did not collapse at all`).toBeLessThan(full);
      delivered += r.chars;
      wouldHaveBeen += full;
    }
    const saved = 1 - delivered / wouldHaveBeen;
    // eslint-disable-next-line no-console
    console.log(`[identity-walk] ${result.gateRefetches.length} gates; re-request saving ${(saved * 100).toFixed(1)}% (${delivered} of ${wouldHaveBeen} chars)`);
    expect(saved).toBeGreaterThan(0.25);
  }, 120_000);
});
