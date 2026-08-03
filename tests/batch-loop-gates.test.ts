import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { evaluateWhenExpression } from '../src/schema/when-expression.js';
import { corpusRoot } from './corpus-root.js';

/**
 * The client activity loop's control flow (#407).
 *
 * A batch is carried by the loop in `03-dispatch-client-workflow`, and which of its steps fires is
 * decided entirely by `when:` gates over the variable bag. Two of those gates decide whether a worker
 * is continued onto the next activity or replaced, and getting either wrong is silent: the walk still
 * completes, having skipped a commit or redone an activity.
 *
 * So this reads the gates OUT of the definition and evaluates them against the bag states a walk
 * actually reaches. Reading rather than restating them is the point — a copy here would drift from the
 * YAML and pass while the definition broke.
 */
describe('client activity loop gates (#407)', () => {
  const activity = parseYaml(
    readFileSync(join(corpusRoot(), 'meta/activities/03-dispatch-client-workflow.yaml'), 'utf8'),
  ) as { steps: Array<{ id: string; kind: string; steps?: Array<{ id: string; when?: string }> }> };

  const loop = activity.steps.find((s) => s.kind === 'loop');
  const body = loop?.steps ?? [];
  const gateOf = (id: string): string => {
    const step = body.find((s) => s.id === id);
    if (!step) throw new Error(`loop body has no step '${id}'`);
    if (step.when === undefined) throw new Error(`step '${id}' carries no when: gate`);
    return step.when;
  };

  /** Which of the loop's mutually-exclusive worker steps fire for a given bag. */
  function firing(vars: Record<string, unknown>): Record<string, boolean> {
    return {
      continueBatch: evaluateWhenExpression(gateOf('continue-batched-worker'), vars),
      dispatch: evaluateWhenExpression(gateOf('dispatch-activity'), vars),
      gatePath: evaluateWhenExpression(gateOf('present-yielded-checkpoint'), vars),
      commit: evaluateWhenExpression(gateOf('commit-activity-artifacts'), vars),
      release: evaluateWhenExpression(gateOf('release-spent-worker'), vars),
    };
  }

  const complete = (over: Record<string, unknown>): Record<string, unknown> => ({
    worker_agent_id: 'worker-1',
    worker_result: { result_type: 'activity_complete', batch_may_continue: true, next_activity_id: 'plan-prepare', ...over },
  });

  it('continues the held worker before it could dispatch a second one', () => {
    // Order matters as much as the gates: the continuation must be reached before dispatch, so a
    // worker carried into an iteration is continued rather than replaced.
    const ids = body.map((s) => s.id);
    expect(ids.indexOf('continue-batched-worker')).toBeLessThan(ids.indexOf('dispatch-activity'));
    // And the commit must be reached before the pointer advances off the activity it covers.
    expect(ids.indexOf('commit-activity-artifacts')).toBeLessThan(ids.indexOf('advance-activity'));
    // Releasing a spent identity comes last, so the continuation gate reads it on the NEXT iteration.
    expect(ids.indexOf('advance-activity')).toBeLessThan(ids.indexOf('release-spent-worker'));
  });

  it('dispatches a fresh worker on the first iteration, when the bag holds nothing', () => {
    const fired = firing({});
    expect(fired.dispatch).toBe(true);
    expect(fired.continueBatch).toBe(false);
    expect(fired.gatePath).toBe(false);
    expect(fired.commit).toBe(false);
    expect(fired.release).toBe(false);
  });

  it('holds the identity when a completed activity leaves the batch room', () => {
    const fired = firing(complete({}));
    expect(fired.continueBatch).toBe(true);
    expect(fired.dispatch).toBe(false);
    expect(fired.commit).toBe(true);
    // Not released, so the next iteration continues this same context.
    expect(fired.release).toBe(false);
  });

  it('releases the identity when the batch is spent, so the next activity is dispatched afresh', () => {
    const fired = firing(complete({ batch_may_continue: false }));
    expect(fired.release).toBe(true);
    expect(fired.commit).toBe(true);
    // With the identity released, the following iteration reaches dispatch rather than continuation.
    expect(firing({ worker_result: (complete({ batch_may_continue: false }) as { worker_result: unknown }).worker_result }))
      .toMatchObject({ continueBatch: false, dispatch: true });
  });

  it('releases the identity on the terminal activity, whatever the batch had left', () => {
    // The walk ends with no next activity, so the loop exits. Holding the identity past that point
    // leaves a live worker nothing will continue, and a stale identity in the bag for a re-entry
    // from end-workflow — which would skip the dispatch and continue on a stale result.
    const fired = firing(complete({ next_activity_id: null, batch_may_continue: true }));
    expect(fired.release).toBe(true);
    expect(fired.commit).toBe(true);
  });

  it('takes the gate path without touching dispatch or the commit', () => {
    const fired = firing({ worker_agent_id: 'worker-1', worker_result: { result_type: 'checkpoint_pending' } });
    expect(fired.gatePath).toBe(true);
    expect(fired.continueBatch).toBe(false);
    expect(fired.dispatch).toBe(false);
    // A gate is not an activity boundary: nothing is committed and nothing is released.
    expect(fired.commit).toBe(false);
    expect(fired.release).toBe(false);
  });
});
