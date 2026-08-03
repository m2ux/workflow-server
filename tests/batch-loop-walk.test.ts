import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { evaluateWhenExpression } from '../src/schema/when-expression.js';
import { corpusRoot } from './corpus-root.js';

/**
 * The client activity loop, walked (#407).
 *
 * `tests/batch-loop-gates.test.ts` evaluates the loop's gates against one bag apiece, which cannot see
 * what makes this loop hard: `worker_result` is REWRITTEN mid-iteration — a dispatch or a continuation
 * sets it, and on the gate path `resume-worker` sets it again — so a gate that reads correctly against a
 * frozen bag can still fire at the wrong moment. Two faults of exactly that shape reached review.
 *
 * So this walks iterations. It reads the loop body out of the definition, evaluates each step's real
 * `when:` against a live bag, applies that step's effect, and records which steps fired in which
 * iteration. Scenarios are scripted as the envelopes the worker-producing steps return.
 *
 * The two files divide cleanly, and each catches what the other cannot. Dropping a clause from a gate
 * fails the gates test and passes here, because the loop often exits before the missing clause could
 * matter. Reordering two steps, or moving the commit past the advance, fails here and passes there,
 * because a frozen bag has no order. Both faults that reached review were the second kind.
 *
 * ## What this does and does not prove
 *
 * The gates and their order come from the definition, so a change to either is picked up. The step
 * EFFECTS are declared in `EFFECTS` below — this file's reading of what each step does to the bag, not
 * something the server enforces, since the loop is executed by an agent. That reading can be wrong in
 * the same way the definition can, which is why `EFFECTS` is written as a table to be audited against
 * the operations rather than buried in the walk.
 */

/** The step ids that call `next_activity`, and so move the session pointer. */
const ADVANCING_STEPS = ['continue-batched-worker', 'dispatch-activity'];

interface Envelope {
  result_type: 'activity_complete' | 'checkpoint_pending';
  next_activity_id?: string | null;
  batch_may_continue?: boolean;
  steps_completed?: unknown[];
}

type Bag = Record<string, unknown>;

/**
 * What each loop step does to the variable bag, read off the operations the step binds.
 *
 * - `continue-batched-worker` → `workflow-engine::continue-batch`: advances the pointer, then returns
 *   an envelope and the identity now holding the activity — the held one, or a replacement it spawned.
 * - `dispatch-activity` → `workflow-engine::dispatch-activity`: advances the pointer, mints an
 *   identity, returns an envelope.
 * - `resume-yielded-worker` → `workflow-engine::resume-worker`: returns a fresh envelope under the
 *   identity already held. It does NOT touch the pointer.
 * - `commit-activity-artifacts`, `advance-activity`, `release-spent-worker`: as the YAML declares.
 */
const EFFECTS: Record<string, (bag: Bag, next: () => Envelope, log: string[]) => void> = {
  'continue-batched-worker': (bag, next, log) => {
    log.push('advance');
    const envelope = next();
    // A continuation that cannot complete spawns the replacement itself and returns its identity, so
    // the bag always leaves this step holding one.
    bag['worker_agent_id'] = bag['worker_agent_id'] ?? 'worker-replacement';
    bag['worker_result'] = envelope;
  },
  // Also declares trace_token, which no gate reads.
  'dispatch-activity': (bag, next, log) => {
    log.push('advance');
    bag['worker_agent_id'] = 'worker-minted';
    bag['worker_result'] = next();
  },
  // These two do declare Outputs — `user_selection` and `effects`, the latter consumed by
  // `resume-worker`'s `effects` input — but no `when:` in the loop reads either, so a faithful encoding
  // and an empty one produce identical walks. Left empty, and named here so the table stays auditable.
  'present-yielded-checkpoint': () => { /* returns user_selection; no gate reads it */ },
  'respond-yielded-checkpoint': () => { /* returns effects; no gate reads it */ },
  'resume-yielded-worker': (bag, next) => { bag['worker_result'] = next(); },
  'commit-activity-artifacts': (_bag, _next, log) => { log.push('commit'); },
  'advance-activity': (bag) => {
    bag['current_activity'] = (bag['worker_result'] as Envelope).next_activity_id ?? null;
  },
  'release-spent-worker': (bag) => { bag['worker_agent_id'] = null; },
};

interface LoopStep { id: string; when?: string }
interface SetAction { action?: string; target?: string; value?: unknown }
interface OuterStep {
  kind: string;
  id?: string;
  steps?: LoopStep[];
  loopType?: string;
  maxIterations?: number;
  condition?: { type?: string; variable?: string; operator?: string; value?: unknown };
  actions?: SetAction[];
}
interface LoopDef extends OuterStep { steps: LoopStep[] }

function activityDef(): { steps: OuterStep[] } {
  return parseYaml(
    readFileSync(join(corpusRoot(), 'meta/activities/03-dispatch-client-workflow.yaml'), 'utf8'),
  ) as { steps: OuterStep[] };
}

function loop(): LoopDef {
  const found = activityDef().steps.find((s) => s.kind === 'loop');
  if (!found?.steps?.length) throw new Error('no loop body in 03-dispatch-client-workflow');
  return found as LoopDef;
}

/**
 * The loop's own exit test, read from its declared `condition` rather than restated here. Written out,
 * a change to the operator, the variable, or the whole block would leave every walk below passing.
 */
function loopHolds(def: LoopDef, bag: Bag): boolean {
  const cond = def.condition;
  if (!cond || cond.type !== 'simple' || typeof cond.variable !== 'string' || typeof cond.operator !== 'string') {
    throw new Error('the loop declares no simple condition to walk');
  }
  const actual = bag[cond.variable] ?? null;
  const expected = cond.value ?? null;
  if (cond.operator === '!=') return actual !== expected;
  if (cond.operator === '==') return actual === expected;
  throw new Error(`unhandled loop operator '${cond.operator}'`);
}

interface Walk {
  /** Step ids that fired, per iteration. */
  iterations: string[][];
  /** `advance` and `commit` markers in the order they occurred across the whole walk. */
  log: string[];
  /** The bag when the loop exited. */
  bag: Bag;
  /** Why the walk stopped. */
  stopped: 'condition' | 'envelopes-exhausted' | 'max-iterations';
}

/**
 * Walk the loop until its condition fails or the scripted envelopes run out. `initialActivity` primes
 * the pointer the way `prime-initial-activity` does; the loop's own condition is `current_activity !=
 * null`, which the YAML declares as a structured condition rather than a `when:` string.
 */
function walk(envelopes: Envelope[], initialActivity = 'implementation-analysis'): Walk {
  const def = loop();
  const body = def.steps;
  const bag: Bag = { current_activity: initialActivity, client_session_index: 'AAAAAA' };
  const queue = [...envelopes];
  const iterations: string[][] = [];
  const log: string[] = [];
  let exhausted = false;

  const next = (): Envelope => {
    const envelope = queue.shift();
    if (!envelope) { exhausted = true; throw new Error('envelopes exhausted'); }
    return envelope;
  };

  // The declared bound, not a number of this file's choosing — a walk that outruns it is the loop's
  // own ceiling, which the definition must carry for a batch of any length to finish.
  const ceiling = def.maxIterations ?? 0;
  for (let i = 0; i < Math.min(ceiling, 20); i++) {
    if (!loopHolds(def, bag)) return { iterations, log, bag, stopped: 'condition' };
    const fired: string[] = [];
    try {
      for (const step of body) {
        if (step.when !== undefined && !evaluateWhenExpression(step.when, bag)) continue;
        fired.push(step.id);
        EFFECTS[step.id]?.(bag, next, log);
      }
    } catch {
      iterations.push(fired);
      return { iterations, log, bag, stopped: 'envelopes-exhausted' };
    }
    iterations.push(fired);
    if (exhausted) return { iterations, log, bag, stopped: 'envelopes-exhausted' };
  }
  return { iterations, log, bag, stopped: 'max-iterations' };
}

const complete = (next: string | null, room = true): Envelope =>
  ({ result_type: 'activity_complete', next_activity_id: next, batch_may_continue: room, steps_completed: [] });
const gate = (): Envelope => ({ result_type: 'checkpoint_pending' });

describe('client activity loop walked (#407)', () => {
  it('carries the frame a batch of any length needs, outside the body', () => {
    const def = activityDef();
    const [precondition, prime] = def.steps;

    // Nothing in the body checks that a client session exists, and nothing primes the pointer the
    // condition tests. Both live ahead of the loop, and a walk that starts inside the body cannot see
    // either — so they are asserted here rather than assumed.
    expect(precondition?.actions?.some((a) => a.action === 'validate' && a.target === 'client_session_index')).toBe(true);
    expect(prime?.actions?.some((a) => a.action === 'set' && a.target === 'current_activity')).toBe(true);

    const l = loop();
    expect(l.loopType).toBe('while');
    // The exit test is on the pointer the body advances, against null — the two have to agree, or the
    // walk either never enters or never leaves.
    expect(l.condition?.variable).toBe('current_activity');
    expect(l.condition?.operator).toBe('!=');
    expect(l.condition?.value ?? null).toBeNull();
    // A ceiling of one would abort every batch after its first activity.
    expect(l.maxIterations ?? 0).toBeGreaterThan(3);

    // And the activity leaves for close-out on the same condition the loop exits by.
    const transitions = (def as unknown as { transitions?: Array<{ to?: string; condition?: { variable?: string; operator?: string; value?: unknown } }> }).transitions ?? [];
    const exit = transitions.find((tr) => tr.to === 'end-workflow');
    expect(exit?.condition?.variable).toBe('current_activity');
    expect(exit?.condition?.operator).toBe('==');
    expect(exit?.condition?.value ?? null).toBeNull();
  });

  it('advances the session pointer exactly once per activity, never twice in an iteration', () => {
    // The invariant the whole loop rests on, and it is per ACTIVITY rather than per iteration: an
    // iteration that only answers a gate must not advance, because the worker is still on the activity
    // it holds. Two advances onto one activity records it exited and complete before a worker has
    // walked a step of it; the alternation of advance and commit across the walk is what pins the
    // one-each half.
    const scenarios: Record<string, Envelope[]> = {
      'clean batch of three': [complete('plan-prepare'), complete('assumptions-review'), complete(null)],
      'gate on the first activity': [gate(), complete('plan-prepare'), complete(null)],
      'gate on the second': [complete('plan-prepare'), gate(), complete(null)],
      'batch spent after one': [complete('plan-prepare', false), complete('assumptions-review'), complete(null)],
      'terminal with room left': [complete(null, true)],
      'two gates on one activity': [gate(), gate(), complete(null)],
    };
    for (const [name, envelopes] of Object.entries(scenarios)) {
      const result = walk(envelopes);
      for (const [index, fired] of result.iterations.entries()) {
        const advancing = fired.filter((id) => ADVANCING_STEPS.includes(id));
        expect(advancing.length, `${name}, iteration ${index + 1}: ${fired.join(' → ')}`).toBeLessThanOrEqual(1);
      }
      // One advance per activity walked, which is one commit per activity walked.
      const advances = result.log.filter((e) => e === 'advance').length;
      const commits = result.log.filter((e) => e === 'commit').length;
      expect(advances, `${name}: advances`).toBe(commits);
      // And the walk always has a worker on the current activity — never neither continuing nor
      // dispatching while the loop is still running.
      if (result.stopped === 'condition') expect(result.bag['worker_agent_id']).toBeNull();
    }
  });

  it('walks a clean batch of three as one dispatch and two continuations', () => {
    const result = walk([complete('plan-prepare'), complete('assumptions-review'), complete(null)]);

    expect(result.stopped).toBe('condition');
    expect(result.iterations).toEqual([
      ['dispatch-activity', 'commit-activity-artifacts', 'advance-activity'],
      ['continue-batched-worker', 'commit-activity-artifacts', 'advance-activity'],
      ['continue-batched-worker', 'commit-activity-artifacts', 'advance-activity', 'release-spent-worker'],
    ]);
    // Every activity commits before the next advance, and the identity is released once, at the end.
    expect(result.log).toEqual(['advance', 'commit', 'advance', 'commit', 'advance', 'commit']);
    expect(result.bag['worker_agent_id']).toBeNull();
  });

  it('carries the identity across a gate and continues on the following iteration', () => {
    const result = walk([gate(), complete('plan-prepare'), complete(null)]);

    // The gate iteration presents, responds and resumes — and does NOT commit or advance the pointer,
    // because a gate is not an activity boundary. The resumed envelope then completes the activity in
    // that same iteration, which is where the commit belongs.
    expect(result.iterations[0]).toEqual([
      'dispatch-activity',
      'present-yielded-checkpoint',
      'respond-yielded-checkpoint',
      'resume-yielded-worker',
      'commit-activity-artifacts',
      'advance-activity',
    ]);
    // The identity survived the gate, so the next activity is a continuation rather than a dispatch.
    expect(result.iterations[1]?.[0]).toBe('continue-batched-worker');
  });

  it('answers two gates on one activity under one identity, committing once', () => {
    const result = walk([gate(), gate(), complete(null)]);

    // The second gate takes its own iteration, and that iteration neither dispatches nor continues —
    // the worker is still on the activity it holds, so the pointer must not move. A one-gate walk
    // finishes in one iteration, so the count is what distinguishes them.
    expect(result.iterations).toHaveLength(2);
    expect(walk([gate(), complete(null)]).iterations).toHaveLength(1);
    expect(result.iterations[1]![0]).toBe('present-yielded-checkpoint');
    expect(result.iterations[1]!.filter((id) => ADVANCING_STEPS.includes(id))).toEqual([]);
    // One activity, one commit — a second gate does not buy a second commit, or a second advance.
    expect(result.log.filter((e) => e === 'commit')).toHaveLength(1);
    expect(result.log.filter((e) => e === 'advance')).toHaveLength(1);
  });

  it('releases a spent batch, so the next activity is dispatched afresh', () => {
    const result = walk([complete('plan-prepare', false), complete('assumptions-review'), complete(null)]);

    expect(result.iterations[0]).toContain('release-spent-worker');
    // Released, so the following iteration reaches dispatch rather than continuation.
    expect(result.iterations[1]?.[0]).toBe('dispatch-activity');
    expect(result.iterations[1]).not.toContain('continue-batched-worker');
  });

  it('stops on the terminal activity without continuing onto a null one', () => {
    const result = walk([complete(null, true)]);

    // Room left in the batch, but no next activity. The continuation must not fire on a following
    // iteration, and the identity must not be left held for a re-entry to continue on.
    expect(result.stopped).toBe('condition');
    expect(result.iterations).toHaveLength(1);
    expect(result.iterations[0]).toContain('release-spent-worker');
    expect(result.bag['current_activity']).toBeNull();
    expect(result.bag['worker_agent_id']).toBeNull();
  });

  it('never commits an activity after the pointer has moved off it', () => {
    // `commit-after-activity` requires the commit to precede the transition it covers. In the log that
    // means no 'commit' may follow the 'advance' that moved off its activity — so within each iteration
    // the commit comes after that iteration's advance, and before the next.
    for (const envelopes of [
      [complete('plan-prepare'), complete('assumptions-review'), complete(null)],
      [gate(), complete('plan-prepare'), complete(null)],
      [complete('plan-prepare', false), complete(null)],
    ]) {
      const { log } = walk(envelopes);
      // The log alternates advance, commit — one commit for each advance, immediately after it.
      expect(log.filter((e) => e === 'advance').length).toBe(log.filter((e) => e === 'commit').length);
      for (let i = 0; i < log.length; i += 2) {
        expect(log[i]).toBe('advance');
        expect(log[i + 1]).toBe('commit');
      }
    }
  });
});
