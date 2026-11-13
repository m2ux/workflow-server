import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { evaluateWhenExpression } from '../src/schema/when-expression.js';
import { liveCorpusRoot } from './corpus-root.js';
import { workflowSubdir } from '../src/loaders/corpus-index.js';

/**
 * The client activity loop's control flow (#407).
 *
 * A batch is carried by the `activity-cycle` loop of the `activity-loop` run, and which of its steps
 * fires is decided entirely by `when:` gates over the variable bag. Those gates decide whether a
 * worker is continued onto the next activity or its identity released, and getting either wrong is
 * silent: the walk still completes, having skipped a commit or redone an activity.
 *
 * So this reads the gates OUT of the definition and evaluates them against the bag states a walk
 * actually reaches. Reading rather than restating them is the point — a copy here would drift from the
 * YAML and pass while the definition broke.
 *
 * What the gates no longer read is as load-bearing as what they do (#710). Whether a context may take
 * the next activity is answered by the advance that retires the current one, which counts everything
 * that activity fetched; the completion envelope carries no such field, and a gate reading one would
 * be deciding from a reading taken before the activity ran.
 */
describe.skipIf(!liveCorpusRoot())('client activity loop gates (#407)', () => {
  const root = liveCorpusRoot();
  if (!root) return;
  interface BodyStep {
    id: string;
    when?: string;
    technique?: { name?: string; inputs?: Record<string, unknown> };
  }
  const routine = parseYaml(
    readFileSync(workflowSubdir(root, 'meta', 'routines/activity-loop.yaml')!, 'utf8'),
  ) as { steps: Array<{ id: string; kind: string; steps?: BodyStep[] }> };

  const loop = routine.steps.find((s) => s.kind === 'loop');
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
      enterActivity: evaluateWhenExpression(gateOf('enter-activity'), vars),
      enterFan: evaluateWhenExpression(gateOf('enter-fan'), vars),
      gatePath: evaluateWhenExpression(gateOf('present-yielded-checkpoint'), vars),
      commit: evaluateWhenExpression(gateOf('commit-activity-artifacts'), vars),
      release: evaluateWhenExpression(gateOf('release-spent-worker'), vars),
    };
  }

  const complete = (over: Record<string, unknown>): Record<string, unknown> => ({
    worker_agent_id: 'worker-1',
    worker_result: { result_type: 'activity_complete', next_activity_id: 'plan-prepare', ...over },
  });

  const fanDestination = { activity: 'probe-unit', over: 'targets', variable: 'probe_target' };
  const fanComplete = (over: Record<string, unknown> = {}): Record<string, unknown> =>
    complete({ next_activity_id: fanDestination, next_activity_fans: true, ...over });

  it('continues the held worker before it could dispatch a second one', () => {
    // Order matters as much as the gates: the continuation must be reached before dispatch, so a
    // worker carried into an iteration is continued rather than replaced.
    const ids = body.map((s) => s.id);
    expect(ids.indexOf('continue-batched-worker')).toBeLessThan(ids.indexOf('enter-activity'));
    // And the commit must be reached before the pointer advances off the activity it covers.
    expect(ids.indexOf('commit-activity-artifacts')).toBeLessThan(ids.indexOf('advance-activity'));
    // Releasing the identity comes last, so the dispatch gate reads its absence on the NEXT iteration.
    expect(ids.indexOf('advance-activity')).toBeLessThan(ids.indexOf('release-spent-worker'));
  });

  it('dispatches a fresh worker on the first iteration, when the bag holds nothing', () => {
    const fired = firing({});
    expect(fired.enterActivity).toBe(true);
    expect(fired.continueBatch).toBe(false);
    expect(fired.gatePath).toBe(false);
    expect(fired.commit).toBe(false);
    expect(fired.release).toBe(false);
  });

  it('holds the identity at an ordinary boundary, leaving the standing to the advance', () => {
    const fired = firing(complete({}));
    expect(fired.continueBatch).toBe(true);
    expect(fired.enterActivity).toBe(false);
    expect(fired.commit).toBe(true);
    // Not released, so the next iteration reaches the continuation, whose own advance answers
    // whether this context may take the activity it advances onto.
    expect(fired.release).toBe(false);
  });

  it('decides nothing from a continue field on the envelope', () => {
    // The question the loop used to answer here — may this context take another activity — is
    // answered by the advance the continuation makes, against the activity it advances onto and
    // after that activity's predecessor has finished fetching. An envelope field would answer it
    // from before the finished activity ran, so no gate may read one: a walk carrying a stale
    // `false` would end a batch that has room, and a stale `true` would send a spent context on.
    for (const bags of [
      [complete({}), complete({ batch_may_continue: false })],
      [complete({}), complete({ batch_may_continue: true })],
      [complete({ next_activity_id: '__terminal__' }), complete({ next_activity_id: '__terminal__', batch_may_continue: true })],
      [fanComplete(), fanComplete({ batch_may_continue: true })],
      [
        { worker_agent_id: 'worker-1', worker_result: { result_type: 'checkpoint_pending' } },
        { worker_agent_id: 'worker-1', worker_result: { result_type: 'checkpoint_pending', batch_may_continue: false } },
      ],
    ]) {
      expect(firing(bags[1]!), JSON.stringify(bags[1])).toEqual(firing(bags[0]!));
    }
    // And the field appears in no gate at all, so the agreement above is not a coincidence of the
    // bags chosen: a gate mentioning it would have to be evaluated against a bag that moves it.
    for (const step of body) {
      expect(step.when ?? '', `step '${step.id}'`).not.toMatch(/batch_may_continue|may_continue/);
    }
  });

  it('asks the advance for the standing, by declaring the window it is measured against', () => {
    // The advance reports where the context stands only when the call declares that context's
    // window alongside its identity. Without the binding the continuation advances blind and the
    // batch ends on a refusal instead, which is the recovery path rather than the decision.
    const step = body.find((s) => s.id === 'continue-batched-worker');
    expect(step?.technique?.name).toBe('workflow-engine::continue-batch');
    expect(Object.keys(step?.technique?.inputs ?? {})).toEqual(
      expect.arrayContaining(['worker_agent_id', 'context_tokens']),
    );
  });

  it('releases the identity on the terminal activity', () => {
    // The last activity routes to `__terminal__`, which no worker carries. Holding the identity past
    // that point leaves a live worker nothing will continue, and a stale identity in the bag for a
    // re-entry from end-workflow — which would skip the dispatch and continue on a stale result.
    const terminal = complete({ next_activity_id: '__terminal__' });
    const fired = firing(terminal);
    expect(fired.release).toBe(true);
    expect(fired.commit).toBe(true);
    // And the continuation is shut too, so it cannot continue into `__terminal__`.
    expect(fired.continueBatch).toBe(false);
    // With the identity released, the following iteration's entry is what advances onto `__terminal__`.
    expect(firing({ worker_result: (terminal as { worker_result: unknown }).worker_result }))
      .toMatchObject({ continueBatch: false, enterActivity: true, enterFan: false });
  });

  it('never continues and dispatches in the same iteration', () => {
    // The two are complements on the identity, so the pointer is advanced by exactly one of them.
    // Both firing would advance twice — and a second advance onto an activity already current records
    // it exited and complete before a worker has walked a step of it.
    const bags: Array<Record<string, unknown>> = [
      {},
      complete({}),
      complete({ next_activity_id: '__terminal__' }),
      { worker_result: { result_type: 'workflow_complete' } },
      fanComplete(),
      { worker_result: (fanComplete() as { worker_result: unknown }).worker_result },
      { worker_agent_id: 'worker-1', worker_result: { result_type: 'checkpoint_pending' } },
      { worker_agent_id: 'worker-1' },
      { worker_result: (complete({}) as { worker_result: unknown }).worker_result },
    ];
    for (const vars of bags) {
      const fired = firing(vars);
      expect(fired.continueBatch && fired.enterActivity).toBe(false);
      expect(fired.continueBatch && fired.enterFan).toBe(false);
      expect(fired.enterActivity && fired.enterFan).toBe(false);
    }
  });

  it('ends the batch when the next destination fans, whatever the advance would have answered', () => {
    // A fan is not another activity for this worker. continue-batch would call next_activity with
    // one identity; spawn-branches mints one per branch. The identity is released this iteration so
    // the next iteration can open the fan.
    const held = fanComplete();
    const fired = firing(held);
    expect(fired.continueBatch).toBe(false);
    expect(fired.enterActivity).toBe(false);
    expect(fired.enterFan).toBe(false);
    expect(fired.commit).toBe(true);
    expect(fired.release).toBe(true);
  });

  it('opens the fan on the following iteration, once the identity is gone', () => {
    const opened = firing({
      worker_result: {
        result_type: 'activity_complete',
        next_activity_id: fanDestination,
        next_activity_fans: true,
      },
    });
    expect(opened.enterFan).toBe(true);
    expect(opened.continueBatch).toBe(false);
    expect(opened.enterActivity).toBe(false);
    expect(opened.release).toBe(true);
    expect(opened.commit).toBe(true);
  });

  it('shuts the continuation on an envelope that is not a completed activity', () => {
    // A worker that yielded reports a gate, not a finished activity. Continuing on that envelope
    // would advance the pointer off an activity still in progress.
    const fired = firing({
      worker_agent_id: 'worker-1',
      worker_result: { result_type: 'checkpoint_pending', next_activity_id: 'plan-prepare' },
    });
    expect(fired.continueBatch).toBe(false);
    expect(fired.gatePath).toBe(true);
  });

  it('takes the gate path without touching dispatch or the commit', () => {
    const fired = firing({ worker_agent_id: 'worker-1', worker_result: { result_type: 'checkpoint_pending' } });
    expect(fired.gatePath).toBe(true);
    expect(fired.continueBatch).toBe(false);
    expect(fired.enterActivity).toBe(false);
    // A gate is not an activity boundary: nothing is committed and nothing is released.
    expect(fired.commit).toBe(false);
    expect(fired.release).toBe(false);
  });
});
