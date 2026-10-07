import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { evaluateWhenExpression } from '../src/schema/when-expression.js';
import { evaluateCondition, validateCondition } from '../src/schema/condition.schema.js';
import { liveCorpusRoot } from './corpus-root.js';
import { indexCorpus, workflowSubdir } from '../src/loaders/corpus-index.js';

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
 * The gates and their order come from the definition, so a change to either is picked up, and so do
 * the `set` actions of every action step, which the walk applies as the definition declares them. The
 * effects of the technique steps are declared in `EFFECTS` below — this file's reading of what each
 * technique does to the bag, not something the server enforces, since the loop is executed by an
 * agent. That reading can be wrong in the same way the definition can, which is why `EFFECTS` is
 * written as a table to be audited against the techniques rather than buried in the walk.
 */

/**
 * The body step ids that call `next_activity`, and so move the session pointer.
 *
 * `enter-activity` makes no call when the session already stands on the activity it carries — the
 * convergence a fan entered — so the walk logs an advance only for the entries that make one.
 * `retire-branch` also calls it, once per branch, but it sits inside the `branch-retirement` forEach
 * rather than in the body — this walk reads the body only, so a branch retirement is one body step
 * whose inner advances are outside what these scenarios model.
 */
const ADVANCING_STEPS = ['continue-batched-worker', 'enter-activity', 'enter-fan'];

/** The destination an activity routes to when it ends the run — through an exit, or for want of one. */
const TERMINAL = '__terminal__';

interface Envelope {
  /**
   * `none` and `absent` are not result types the corpus declares. `absent` scripts a worker that ended
   * before yielding, so the call returned no envelope. `none` scripts a return that is not one of the
   * two tagged results. `workflow_complete` is never scripted: the entry onto `__terminal__` composes
   * it, since no worker runs there.
   */
  result_type: 'activity_complete' | 'checkpoint_pending' | 'workflow_complete' | 'none' | 'absent';
  next_activity_id?: string | Record<string, unknown>;
  next_activity_fans?: boolean;
  steps_completed?: unknown[];
  /**
   * Whether the advance that reaches this envelope found room for the context it was continuing —
   * the `may_continue` the continuation's own `next_activity` returns, scripted on the envelope the
   * step goes on to produce because that is the one call's two answers (#710). It is NOT a field of
   * the envelope the corpus declares: `finalize-activity` folds no such field, and the gates test
   * asserts that no gate reads one. Absent reads as room, which is what every boundary but a spent
   * one answers.
   */
  advanceFoundRoom?: boolean;
}

type Bag = Record<string, unknown>;

/**
 * What each technique step of the loop does to the variable bag, read off the technique it binds.
 * An action step has no row: its `set` actions are read from the definition (`applySets`).
 *
 * - `continue-batched-worker` → `workflow-engine::continue-batch`: advances the pointer and, where the
 *   reading leaves room, continues the held identity and returns its envelope. It mints nothing. A
 *   missing envelope, a reading that refuses, or a continuation that is not an accepted result leaves
 *   the held identity in place, leaves `worker_result` unset, and sets `continuation_held` false, so
 *   the loop can release it and dispatch.
 * - `enter-activity` → the run's `enter_activity` input: advances the pointer unless
 *   `stands_on_activity` says the session already stands on the activity, mints an identity named for
 *   that activity, and returns an envelope. Entering `__terminal__` completes the session: it returns
 *   the `workflow_complete` envelope and mints no identity.
 * - `enter-fan` → `fan::enter-fan`: one call opens every branch and reports the activity they
 *   converge on.
 * - `spawn-branches` → `fan::spawn-branches`: emits the batch and collects the returns. No gate
 *   reads what it produces.
 * - `branch-retirement` → the forEach over `branch_activities`, whose `fan::retire-branch` advances
 *   once per branch, the last retirement entering the convergence activity. Its inner steps are
 *   outside this walk, which reads the body only.
 * - `persist-the-fan` → `workflow-engine::commit-and-persist` over the branch activities: the fan's
 *   one commit, at convergence.
 * - `resume-yielded-worker` → `workflow-engine::resume-worker`: returns a fresh envelope under the
 *   identity already held. It does NOT touch the pointer.
 * - `commit-activity-artifacts` → `workflow-engine::commit-and-persist`: the activity's one commit.
 */
interface EnvelopeSource {
  (): Envelope;
  /** Put an envelope back for the dispatch that carries the activity the advance already entered. */
  restore(envelope: Envelope): void;
}

const EFFECTS: Record<string, (bag: Bag, next: EnvelopeSource, log: string[]) => void> = {
  'continue-batched-worker': (bag, next, log) => {
    log.push('advance');
    // The advance answers the standing before anything is composed. A missing envelope, a context
    // the reading refuses, or a return that is not an accepted result is not replaced here: the
    // identity stays the one that entered, and the result is left unset. The envelope of the
    // activity just entered belongs to the dispatch that follows the release. A refusal carries
    // that envelope, so it is put back. An `absent` is the worker ending with nothing to put back,
    // and a `none` is the failed continuation itself — neither is that activity's result.
    const envelope = next();
    const unheld = (): void => {
      bag['continuation_held'] = false;
      delete bag['worker_result'];
    };
    if (envelope.result_type === 'absent') {
      unheld();
      return;
    }
    if (envelope.advanceFoundRoom === false) {
      unheld();
      next.restore(envelope);
      return;
    }
    if (envelope.result_type === 'none') {
      unheld();
      return;
    }
    bag['continuation_held'] = true;
    bag['worker_result'] = envelope;
  },
  // Also declares trace_tokens, which no gate reads.
  'enter-activity': (bag, next, log) => {
    const activity = bag['current_activity'] as string;
    if (activity === TERMINAL) {
      // The advance onto `__terminal__` completes the session, and no worker runs there.
      log.push('terminal');
      bag['worker_result'] = { result_type: 'workflow_complete' };
      return;
    }
    if (!bag['stands_on_activity']) log.push('advance');
    bag['worker_agent_id'] = `worker:${activity}`;
    bag['worker_result'] = next();
  },
  'enter-fan': (bag, _next, log) => {
    log.push('advance');
    // One call opens every branch. Branch envelopes belong to the spawn that follows; this walk
    // only sees the convergence the barrier reported.
    bag['fan_convergence_activity'] = 'gather';
    bag['branch_activities'] = ['probe-unit#0', 'probe-unit#1'];
  },
  'spawn-branches': () => { /* returns branch_envelopes; no gate reads it */ },
  'branch-retirement': () => { /* the forEach whose retirements advance, one per branch */ },
  'persist-the-fan': (_bag, _next, log) => { log.push('commit'); },
  // Both declare Outputs, and both are consumed — `user_selection` by `respond-checkpoint`'s
  // `checkpoint_resolution`, `effects` by `resume-worker`'s `effects` — but no `when:` in the loop reads
  // either, so a faithful encoding and an empty one produce identical walks. Left empty, and both named
  // here so the table stays auditable and neither reads as unconsumed.
  'present-yielded-checkpoint': () => { /* returns user_selection; no gate reads it */ },
  'respond-yielded-checkpoint': () => { /* returns effects; no gate reads it */ },
  // take-activity skips the advance when checkpoint_reply is bound, so this entry
  // carries the activity the session already stands on and does not move the pointer.
  'resume-entered-activity': (bag, next) => {
    bag['worker_result'] = next();
  },
  'resume-yielded-worker': (bag, next) => {
    const envelope = next();
    if (envelope.result_type === 'none') {
      // `resume-worker` step 3: the continued context is gone, so a replacement is spawned under a new
      // identity for the SAME activity and its envelope is what the step returns. Without this the bag
      // stays on `checkpoint_pending` and the loop re-presents a gate the orchestrator already resolved.
      bag['worker_agent_id'] = 'worker-replacement';
      bag['worker_result'] = next();
      return;
    }
    bag['worker_result'] = envelope;
  },
  'commit-activity-artifacts': (_bag, _next, log) => { log.push('commit'); },
};

interface LoopStep { kind: string; id: string; when?: string; actions?: SetAction[] }
interface SetAction { action?: string; target?: string; value?: unknown }
interface OuterStep {
  kind: string;
  id?: string;
  when?: string;
  steps?: LoopStep[];
  loopType?: string;
  maxIterations?: number;
  continueWhile?: { type?: string; variable?: string; operator?: string; value?: unknown };
  actions?: SetAction[];
}
interface LoopDef extends OuterStep { steps: LoopStep[] }

/** The value at a dotted path in the bag, or undefined where a segment is absent. */
function valueAt(bag: Bag, path: string): unknown {
  let cursor: unknown = bag;
  for (const segment of path.split('.')) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

/**
 * Apply an action step's `set` actions as the definition declares them. A value written `{name}` is a
 * reference, resolved whole against the bag so an envelope's structured destination survives; any
 * other value is the literal the definition gives.
 */
function applySets(step: LoopStep, bag: Bag): void {
  for (const action of step.actions ?? []) {
    if (action.action !== 'set' || action.target === undefined) continue;
    const reference = typeof action.value === 'string' ? /^\{([^{}]+)\}$/.exec(action.value) : null;
    bag[action.target] = reference ? valueAt(bag, reference[1]!) : action.value;
  }
}

function activityDef(): { steps: OuterStep[] } {
  return parseYaml(
    readFileSync(workflowSubdir(liveCorpusRoot()!, 'meta', 'activities/03-dispatch-client-workflow.yaml')!, 'utf8'),
  ) as { steps: OuterStep[] };
}

function routineDef(): { steps: OuterStep[] } {
  return parseYaml(
    readFileSync(workflowSubdir(liveCorpusRoot()!, 'meta', 'routines/activity-loop.yaml')!, 'utf8'),
  ) as { steps: OuterStep[] };
}

function loop(): LoopDef {
  const found = routineDef().steps.find((s) => s.kind === 'loop');
  if (!found?.steps?.length) throw new Error('no loop body in the activity-loop run');
  return found as LoopDef;
}

/**
 * The loop's continuation test, read from its declared `continueWhile` and evaluated by the server's
 * own evaluator.
 *
 * Both halves matter. Restating the test lets a change to the operator, the variable, or the whole
 * block leave every walk below passing. Hand-rolling the comparison is worse: coalescing the two sides
 * to null reads an ABSENT `value` as `null`, where `evaluateCondition` compares strictly — so `!=` with
 * no declared value holds against a null pointer and the loop never exits. Coalescing turned that
 * runaway into a clean stop. Parsing through `validateCondition` also proves the test is
 * schema-valid, and fails by naming the field when it is not.
 */
function loopHolds(def: LoopDef, bag: Bag): boolean {
  return evaluateCondition(validateCondition(def.continueWhile), bag);
}

interface Walk {
  /** Step ids that fired, per iteration. */
  iterations: string[][];
  /**
   * `advance`, `commit` and `terminal` markers in the order they occurred across the whole walk.
   * `terminal` is the advance onto `__terminal__`, which completes the session and enters no activity.
   */
  log: string[];
  /** Every identity a step wrote into the bag, in the order they appeared. */
  minted: string[];
  /** The bag when the loop exited. */
  bag: Bag;
  /** Why the walk stopped. */
  stopped: 'condition' | 'envelopes-exhausted' | 'walk-cap';
}

/**
 * Apply the action steps before the loop, in order, honouring each step's `when`.
 * That is the opening of a walk: a second walk at one site, or a walk opened on the
 * activity the session already stands on.
 */
function opensWalk(prior: Bag): Bag {
  const bag: Bag = { ...prior };
  for (const step of routineDef().steps) {
    if (step.kind === 'loop') break;
    if (step.kind !== 'action') continue;
    if (step.when !== undefined && !evaluateWhenExpression(step.when, bag)) continue;
    applySets(step as LoopStep, bag);
  }
  return bag;
}

/**
 * Walk the loop until its continuation test fails or the scripted envelopes run out.
 * `initialActivity` primes the pointer the way `prime-initial-activity` does, unless `seed`
 * is the bag `opensWalk` already produced. The loop's own test is `current_activity != null`.
 */
function walk(envelopes: Envelope[], initialActivity = 'implementation-analysis', seed?: Bag): Walk {
  const def = loop();
  const body = def.steps;
  const bag: Bag = seed
    ? { ...seed }
    : { current_activity: initialActivity, client_session_index: 'AAAAAA' };
  const queue = [...envelopes];
  const iterations: string[][] = [];
  const log: string[] = [];
  const minted: string[] = [];
  let exhausted = false;

  const next = (() => {
    const take = (): Envelope => {
      const envelope = queue.shift();
      if (!envelope) { exhausted = true; throw new Error('envelopes exhausted'); }
      return envelope;
    };
    take.restore = (envelope: Envelope): void => { queue.unshift(envelope); };
    return take;
  })();

  // The declared ceiling bounds the walk, but so does WALK_CAP, and the two mean different things: a
  // walk that reaches the cap is a runaway this file stopped, not a batch the definition ended. An
  // absent ceiling is unbounded under the schema, so it is an error here rather than a zero — read as
  // zero it would model the loop as never running, which is the opposite of what it does.
  const ceiling = def.maxIterations;
  if (typeof ceiling !== 'number' || ceiling < 1) {
    throw new Error(`the loop declares no usable iteration ceiling (got ${String(ceiling)})`);
  }
  for (let i = 0; i < Math.min(ceiling, WALK_CAP); i++) {
    if (!loopHolds(def, bag)) return { iterations, log, minted, bag, stopped: 'condition' };
    const fired: string[] = [];
    try {
      for (const step of body) {
        if (step.when !== undefined && !evaluateWhenExpression(step.when, bag)) continue;
        fired.push(step.id);
        const held = bag['worker_agent_id'];
        if (step.kind === 'action') applySets(step, bag);
        else EFFECTS[step.id]?.(bag, next, log);
        const holding = bag['worker_agent_id'];
        if (typeof holding === 'string' && holding !== held) minted.push(holding);
      }
    } catch {
      iterations.push(fired);
      return { iterations, log, minted, bag, stopped: 'envelopes-exhausted' };
    }
    iterations.push(fired);
    if (exhausted) return { iterations, log, minted, bag, stopped: 'envelopes-exhausted' };
  }
  return { iterations, log, minted, bag, stopped: 'walk-cap' };
}

const complete = (next: string | Record<string, unknown>, fans = false): Envelope =>
  ({ result_type: 'activity_complete', next_activity_id: next, next_activity_fans: fans, steps_completed: [] });
/** The same envelope, from a continuation whose advance found the held context past its bound. */
const completeAfterRefusal = (next: string | Record<string, unknown>): Envelope =>
  ({ ...complete(next), advanceFoundRoom: false });
const gate = (): Envelope => ({ result_type: 'checkpoint_pending' });
/** The worker ended before yielding, so the continuation returned no envelope. */
const absent = (): Envelope => ({ result_type: 'absent' });
/** A continuation that returned something other than the two tagged results. */
const gone = (): Envelope => ({ result_type: 'none' });

/** This file's runaway stop, well above the longest scenario and unrelated to the declared ceiling. */
const WALK_CAP = 20;

/**
 * Activities in the longest workflow the corpus carries. The loop's ceiling has to clear this for a
 * batch to walk a whole workflow, with headroom, since rework transitions revisit activities.
 */
function longestWorkflowActivityCount(): number {
  let most = 0;
  for (const { dir: workflowDir } of indexCorpus(liveCorpusRoot()!).workflows.values()) {
    const dir = join(workflowDir, 'activities');
    if (!existsSync(dir)) continue;
    most = Math.max(most, readdirSync(dir).filter((f) => f.endsWith('.yaml')).length);
  }
  if (most === 0) throw new Error('no workflow activities found under the corpus root');
  return most;
}

describe.skipIf(!liveCorpusRoot())('client activity loop walked (#407)', () => {
  it('carries the frame a batch of any length needs, outside the body', () => {
    const def = routineDef();

    // Exactly these steps up to and including the loop, in this order. Naming positions instead would
    // miss a step inserted between the prime and the loop — one that nulls the pointer keeps the loop
    // from ever running — and a second `kind: loop` the walk's own `find` cannot see.
    const ids = def.steps.map((s) => s.id);
    const loopAt = ids.indexOf('activity-cycle');
    expect(ids.slice(0, loopAt + 1)).toEqual([
      'verify-preconditions',
      'prime-initial-activity',
      'resume-standing-activity',
      'activity-cycle',
    ]);
    expect(def.steps.filter((s) => s.kind === 'loop')).toHaveLength(1);
    // A step after the loop reads the pointer to say how the loop ended; one that WRITES it re-primes a
    // spent walk, so the activity's transition never fires and close-out is never reached. The run's
    // own tail and the activity's steps after the reference are both downstream of the loop.
    const host = activityDef();
    const hostAt = host.steps.map((s) => s.id).indexOf('client-activity-loop');
    for (const after of [...def.steps.slice(loopAt + 1), ...host.steps.slice(hostAt + 1)]) {
      expect(
        after.actions?.some((a) => a.action === 'set' && a.target === 'current_activity'),
        `step '${after.id}' sits after the loop and re-primes the pointer`,
      ).toBeFalsy();
    }

    const [precondition, prime] = def.steps;
    const l = loop();

    // Nothing in the body checks that a session exists, and nothing primes the pointer the
    // continuation test reads. Both live ahead of the loop, and a walk that starts inside the body
    // cannot see either — so they are asserted here rather than assumed.
    expect(precondition?.actions?.some((a) => a.action === 'validate' && a.target === 'session_index')).toBe(true);
    const primeWrite = prime?.actions?.find((a) => a.action === 'set');
    expect(primeWrite?.target).toBe(l.continueWhile?.variable);
    // Primed from a bound input, braced like every other reference in the corpus. Written bare it
    // reads as the literal string, and no workflow declares an activity by that name, so the first
    // `next_activity` fails outright — an error naming the id it could not find, not the one to use.
    expect(primeWrite?.value).toBe('{initial_activity}');
    expect(l.loopType).toBe('while');
    // The exit test is on the pointer the body advances, against null — the two have to agree, or the
    // walk either never enters or never leaves.
    expect(l.continueWhile?.variable).toBe('current_activity');
    expect(l.continueWhile?.operator).toBe('!=');
    // Declared null, not merely absent: `value` is schema-optional, and the server compares strictly, so
    // omitting it makes `!= null` hold against a null pointer and the loop runs to its ceiling.
    expect(l.continueWhile && 'value' in l.continueWhile).toBe(true);
    expect(l.continueWhile?.value).toBeNull();
    // The ceiling has to clear the longest workflow the corpus carries, with room for rework — a bound
    // tuned to this file's longest scenario would certify a frame that truncates real batches.
    expect(l.maxIterations ?? 0).toBeGreaterThan(longestWorkflowActivityCount());

    // The advance's pointer write lands on the variable the continuation test reads, carrying the id the
    // worker returned. Either half retargeted and the pointer never moves, so the loop runs to its ceiling.
    const advanceWrite = l.steps.find((s) => s.id === 'advance-activity')?.actions?.find((a) => a.action === 'set');
    expect(advanceWrite?.target).toBe(l.continueWhile?.variable);
    expect(advanceWrite?.value).toBe('{worker_result.next_activity_id}');

    // And the activity leaves for close-out on the same condition the loop exits by.
    const exits = (host as unknown as { exits?: Array<{ id: string; when?: string }> }).exits ?? [];
    expect(exits.map((e) => e.when)).toContain('current_activity == null');
  });

  it('advances the session pointer exactly once per activity, never twice in an iteration', () => {
    // The invariant the whole loop rests on, and it is per ACTIVITY rather than per iteration: an
    // iteration that only answers a gate must not advance, because the worker is still on the activity
    // it holds. Two advances onto one activity records it exited and complete before a worker has
    // walked a step of it; the alternation of advance and commit across the walk is what pins the
    // one-each half.
    const scenarios: Record<string, Envelope[]> = {
      'clean batch of three': [complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)],
      'gate on the first activity': [gate(), complete('plan-prepare'), complete(TERMINAL)],
      'gate on the second': [complete('plan-prepare'), gate(), complete(TERMINAL)],
      'batch refused at the second boundary': [complete('plan-prepare'), completeAfterRefusal('assumptions-review'), complete(TERMINAL)],
      'terminal with room left': [complete(TERMINAL)],
      'two gates on one activity': [gate(), gate(), complete(TERMINAL)],
    };
    for (const [name, envelopes] of Object.entries(scenarios)) {
      const result = walk(envelopes);
      for (const [index, fired] of result.iterations.entries()) {
        // enter-activity advances except where release-unheld-worker has already moved the pointer
        // and marked the session standing on the activity. That dispatch is the replacement, and it
        // is not a second advance.
        const advancing = fired.filter((id) =>
          id === 'continue-batched-worker' || id === 'enter-fan'
          || (id === 'enter-activity' && !fired.includes('release-unheld-worker')));
        expect(advancing.length, `${name}, iteration ${index + 1}: ${fired.join(' → ')}`).toBeLessThanOrEqual(1);
      }
      // Every scenario ends on the entry onto `__terminal__`, which ends the loop. A runaway would
      // otherwise pass every count below, since the advance/commit counts stay equal per iteration.
      expect(result.stopped, `${name}: stopped`).toBe('condition');
      // One advance per activity walked, which is one commit per activity walked.
      const advances = result.log.filter((e) => e === 'advance').length;
      const commits = result.log.filter((e) => e === 'commit').length;
      expect(advances, `${name}: advances`).toBe(commits);
      // And one advance onto `__terminal__`, last, which completes the session and commits nothing.
      expect(result.log.filter((e) => e === 'terminal'), `${name}: terminal`).toHaveLength(1);
      expect(result.log.at(-1), `${name}: last`).toBe('terminal');
      // The walk ends holding no identity, the last activity's worker released before the entry onto
      // `__terminal__`, and that entry's iteration runs nothing but the entry and the walk's end — no
      // continuation carries a held worker into it, and no gate or commit follows it.
      expect(result.bag['worker_agent_id'], `${name}: identity`).toBeNull();
      expect(result.iterations.at(-1), `${name}: terminal iteration`).toEqual(['enter-activity', 'end-walk']);
    }
  });

  it('replaces a continued worker that returns nothing, rather than re-presenting a resolved gate', () => {
    // A gate, a continuation that comes back with nothing, then the replacement finishing the activity.
    // Without a recovery branch the bag stays on `checkpoint_pending`: every gate step fires a second
    // time, and the orchestrator asks the server to present a checkpoint it has already resolved — which
    // the server refuses. The loop can then neither advance nor dispatch.
    const result = walk([gate(), gone(), complete(TERMINAL)]);

    expect(result.stopped).toBe('condition');
    // The gate is presented once. A second presentation is the stall.
    expect(result.log.filter((e) => e === 'commit')).toHaveLength(1);
    expect(result.iterations.flat().filter((id) => id === 'present-yielded-checkpoint')).toHaveLength(1);
    // The activity still commits and advances exactly once, so the recovery costs one context, not the
    // activity — and the walk ends on `__terminal__` holding no identity, like any other completed walk.
    expect(result.log).toEqual(['advance', 'commit', 'terminal']);
    expect(result.minted).toEqual(['worker:implementation-analysis', 'worker-replacement']);
    expect(result.bag['worker_agent_id']).toBeNull();
  });

  it('walks a clean batch of three as one dispatch and two continuations, then enters the terminal', () => {
    const result = walk([complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)]);

    expect(result.stopped).toBe('condition');
    expect(result.iterations).toEqual([
      ['enter-activity', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity'],
      ['continue-batched-worker', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity'],
      ['continue-batched-worker', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity', 'release-spent-worker'],
      ['enter-activity', 'end-walk'],
    ]);
    // Every activity commits before the next advance, the identity is released once, after the last
    // activity, and the entry onto `__terminal__` is the walk's final advance.
    expect(result.log).toEqual(['advance', 'commit', 'advance', 'commit', 'advance', 'commit', 'terminal']);
    expect(result.bag['worker_agent_id']).toBeNull();
    // One identity carries the whole batch. Each continuation advances and mints nothing.
    expect(result.minted).toEqual(['worker:implementation-analysis']);
    for (const fired of result.iterations) {
      if (!fired.includes('continue-batched-worker')) continue;
      expect(fired).not.toContain('release-unheld-worker');
      expect(fired).not.toContain('enter-activity');
    }
  });

  it('carries the identity across a gate and continues on the following iteration', () => {
    const result = walk([gate(), complete('plan-prepare'), complete(TERMINAL)]);

    // The gate iteration presents, responds and resumes — and does NOT commit or advance the pointer,
    // because a gate is not an activity boundary. The resumed envelope then completes the activity in
    // that same iteration, which is where the commit belongs.
    expect(result.iterations[0]).toEqual([
      'enter-activity',
      'present-yielded-checkpoint',
      'respond-yielded-checkpoint',
      'resume-yielded-worker',
      'commit-activity-artifacts',
      'note-exiting-activity',
      'advance-activity',
    ]);
    // The identity survived the gate, so the next activity is a continuation rather than a dispatch.
    expect(result.iterations[1]?.[0]).toBe('continue-batched-worker');
  });

  it('answers two gates on one activity under one identity, committing once', () => {
    const result = walk([gate(), gate(), complete(TERMINAL)]);

    // The second gate takes its own iteration, and that iteration neither dispatches nor continues —
    // the worker is still on the activity it holds, so the pointer must not move. A one-gate walk
    // finishes its activity in one iteration, so the count is what distinguishes them; each walk
    // takes one more iteration to enter `__terminal__`.
    expect(result.iterations).toHaveLength(3);
    expect(walk([gate(), complete(TERMINAL)]).iterations).toHaveLength(2);
    expect(result.iterations[1]![0]).toBe('present-yielded-checkpoint');
    expect(result.iterations[1]!.filter((id) => ADVANCING_STEPS.includes(id))).toEqual([]);
    // One activity, one commit — a second gate does not buy a second commit, or a second advance.
    expect(result.log.filter((e) => e === 'commit')).toHaveLength(1);
    expect(result.log.filter((e) => e === 'advance')).toHaveLength(1);
  });

  it('opens a fan by ending the batch, then dispatches the join without an advance', () => {
    // A source that fans is a completed activity: it commits and releases even when the batch has
    // room. The next iteration opens the fan; retire clears the envelope so the join is a fresh
    // dispatch. continue-batch never fires — a fan is not the next activity of this worker.
    //
    // The fan iteration commits once, through `persist-the-fan` rather than through
    // `commit-activity-artifacts`: retiring the envelope precedes that step and empties the result
    // its gate reads, which is what keeps a fan from committing twice.
    //
    // The last branch retirement entered the join, so `advance-past-fan` marks it entered and the
    // join's dispatch carries it without calling `next_activity`. `spend-entered-activity` clears the
    // mark in that same iteration, so the join's own exit is an ordinary advance.
    const fanDest = { activity: 'probe-unit', over: 'targets', variable: 'probe_target' };
    const result = walk([complete(fanDest, true), complete(TERMINAL)]);

    expect(result.stopped).toBe('condition');
    expect(result.iterations).toEqual([
      ['enter-activity', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity', 'release-spent-worker'],
      ['enter-fan', 'spawn-branches', 'branch-retirement', 'persist-the-fan', 'advance-past-fan', 'retire-fan-envelope'],
      ['enter-activity', 'spend-entered-activity', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity', 'release-spent-worker'],
      ['enter-activity', 'end-walk'],
    ]);
    expect(result.iterations.flat().filter((id) => id === 'continue-batched-worker')).toEqual([]);
    // Two advances: the source's entry and the call that opens the fan. The join's entry adds none —
    // its commit follows the fan's with no advance between them.
    expect(result.log).toEqual(['advance', 'commit', 'advance', 'commit', 'commit', 'terminal']);
    expect(result.minted).toEqual(['worker:implementation-analysis', 'worker:gather']);
    expect(result.bag['stands_on_activity']).toBe(false);
    expect(result.bag['current_activity']).toBeNull();
    expect(result.bag['worker_agent_id']).toBeNull();
  });

  it('dispatches after releasing the context the advance refuses, on the activity that advance entered', () => {
    // The continuation advances and mints nothing (#710). What makes the second boundary different
    // is the answer the advance itself returned. The held identity is released, and the activity the
    // pointer already stands on is a dispatch, which logs no advance of its own.
    const refusedSecond = walk([complete('plan-prepare'), completeAfterRefusal('assumptions-review'), complete(TERMINAL)]);
    const roomThroughout = walk([complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)]);

    expect(refusedSecond.stopped).toBe('condition');
    expect(roomThroughout.minted).toEqual(['worker:implementation-analysis']);
    // Same advances and commits: the dispatch is not a second advance onto the activity.
    expect(refusedSecond.log).toEqual(roomThroughout.log);
    expect(refusedSecond.log.filter((e) => e === 'advance')).toHaveLength(3);
    // The refused iteration releases the held identity, then dispatches. The new identity is the
    // activity's, and nothing minted by the continuation sits between the two.
    expect(refusedSecond.iterations[1]).toEqual([
      'continue-batched-worker',
      'release-unheld-worker',
      'enter-activity',
      'spend-entered-activity',
      'commit-activity-artifacts',
      'note-exiting-activity',
      'advance-activity',
    ]);
    expect(refusedSecond.minted).toEqual(['worker:implementation-analysis', 'worker:plan-prepare']);
    expect(refusedSecond.bag['worker_agent_id']).toBeNull();
  });

  it('walks a missing envelope, a refusal, and a failed continue without minting a replacement', () => {
    // Three returns, one observation. The identity that enters the continuation is the identity
    // that leaves it. The only identities the walk records are the opening dispatch and the
    // dispatch after the release — nothing is written between them.
    const room = walk([complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)]);
    const paths: Record<string, Envelope[]> = {
      'a missing envelope': [complete('plan-prepare'), absent(), complete('assumptions-review'), complete(TERMINAL)],
      'a refusal': [complete('plan-prepare'), completeAfterRefusal('assumptions-review'), complete(TERMINAL)],
      'a failed continue': [complete('plan-prepare'), gone(), complete('assumptions-review'), complete(TERMINAL)],
    };
    for (const [name, envelopes] of Object.entries(paths)) {
      const result = walk(envelopes);
      expect(result.stopped, name).toBe('condition');
      expect(result.log, name).toEqual(room.log);
      expect(result.log.filter((e) => e === 'advance'), name).toHaveLength(3);
      expect(result.iterations[1]?.slice(0, 3), name).toEqual([
        'continue-batched-worker',
        'release-unheld-worker',
        'enter-activity',
      ]);
      expect(result.minted, name).toEqual(['worker:implementation-analysis', 'worker:plan-prepare']);
      expect(result.bag['worker_agent_id'], name).toBeNull();
    }
  });

  it('dispatches after releasing a continuation that returns no envelope', () => {
    // The same release-then-dispatch as a refusal. The `none` is the failed continuation, not the
    // activity's result; the envelope that follows is what the dispatch returns.
    const failed = walk([complete('plan-prepare'), gone(), complete('assumptions-review'), complete(TERMINAL)]);
    const roomThroughout = walk([complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)]);

    expect(failed.stopped).toBe('condition');
    expect(failed.log).toEqual(roomThroughout.log);
    expect(failed.iterations[1]?.slice(0, 3)).toEqual([
      'continue-batched-worker',
      'release-unheld-worker',
      'enter-activity',
    ]);
    expect(failed.minted).toEqual(['worker:implementation-analysis', 'worker:plan-prepare']);
    expect(failed.log.filter((e) => e === 'advance')).toHaveLength(3);
  });

  it('walks the same batches with no continue field on any envelope', () => {
    // `finalize-activity` folds no continue field, so every envelope scripted in this file is one the
    // corpus can actually produce — and these walks are the ones the loop has to get right without it.
    // The second half is the guard against the field creeping back in as something the walk depends
    // on. Both answers are tried: a loop reading one would end these batches on `false` and carry
    // them on `true`, so agreement across the two is what says the field decides nothing.
    for (const [name, envelopes] of Object.entries({
      'clean batch of three': [complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)],
      'gate part-way through': [gate(), complete('plan-prepare'), complete(TERMINAL)],
      'a refusal at the second boundary': [complete('plan-prepare'), completeAfterRefusal('assumptions-review'), complete(TERMINAL)],
      'a destination that fans': [complete({ activity: 'probe-unit', over: 'targets', variable: 'probe_target' }, true), complete(TERMINAL)],
    })) {
      for (const envelope of envelopes) {
        expect(envelope, `${name}: scripted envelope`).not.toHaveProperty('batch_may_continue');
      }
      const plain = walk(envelopes);
      for (const answer of [false, true]) {
        const decorated = walk(envelopes.map((e) => ({ ...e, batch_may_continue: answer })));
        expect(decorated.iterations, `${name}, carrying ${answer}: iterations`).toEqual(plain.iterations);
        expect(decorated.log, `${name}, carrying ${answer}: log`).toEqual(plain.log);
        expect(decorated.minted, `${name}, carrying ${answer}: identities`).toEqual(plain.minted);
        expect(decorated.stopped, `${name}, carrying ${answer}: stopped`).toBe(plain.stopped);
      }
    }
  });

  it('stops on the terminal activity by entering it without a worker', () => {
    const result = walk([complete(TERMINAL)]);

    // The first activity routes to `__terminal__`, which no worker carries. The identity is released, so
    // the continuation cannot carry the held worker into `__terminal__`, and no identity is left held
    // for a re-entry to continue on. The next iteration's entry completes the session and ends the walk.
    expect(result.stopped).toBe('condition');
    expect(result.iterations).toHaveLength(2);
    expect(result.iterations[0]).toContain('release-spent-worker');
    expect(result.iterations[1]).toEqual(['enter-activity', 'end-walk']);
    expect(result.bag['worker_result']).toEqual({ result_type: 'workflow_complete' });
    expect(result.minted).toEqual(['worker:implementation-analysis']);
    expect(result.bag['current_activity']).toBeNull();
    expect(result.bag['worker_agent_id']).toBeNull();
  });

  it('opens a second walk with nothing retired', (ctx) => {
    const prime = routineDef().steps.find((s) => s.id === 'prime-initial-activity');
    const clearsRetired = prime?.actions?.some((a) => a.action === 'set' && a.target === 'from_activity' && a.value == null)
      && prime?.actions?.some((a) => a.action === 'set' && a.target === 'worker_result' && a.value == null);
    if (!clearsRetired) { ctx.skip(); return; }

    const opened = opensWalk({
      initial_activity: 'start',
      from_activity: 'plan-prepare',
      worker_result: { result_type: 'activity_complete', next_activity_id: 'research' },
      trace_tokens: ['previous-walk'],
    });
    expect(opened['from_activity']).toBeNull();
    expect(opened['worker_result']).toBeNull();
    expect(opened['trace_tokens']).toEqual([]);
    expect(opened['current_activity']).toBe('start');
  });

  it('advances once when the walk opens on the activity the session already stands on', (ctx) => {
    const resume = routineDef().steps.find((s) => s.id === 'resume-standing-activity');
    if (!resume?.actions?.some((a) => a.target === 'stands_on_activity' && a.value === true)) { ctx.skip(); return; }

    const opened = opensWalk({
      standing_activity: 'plan-prepare',
      initial_activity: 'start',
      from_activity: 'old',
      worker_result: { result_type: 'activity_complete' },
    });
    expect(opened['stands_on_activity']).toBe(true);
    expect(opened['current_activity']).toBe('plan-prepare');
    expect(opened['from_activity']).toBe('plan-prepare');

    const result = walk(
      [complete('research'), complete(TERMINAL)],
      'plan-prepare',
      opened,
    );
    // The standing activity is carried, not advanced onto. The next activity is the one advance.
    expect(result.iterations[0]).toContain('enter-activity');
    expect(result.iterations[0]).toContain('spend-entered-activity');
    expect(result.log.filter((entry) => entry === 'advance')).toEqual(['advance']);
    expect(result.bag['stands_on_activity']).toBe(false);
  });

  it('resumes a yielded checkpoint without advancing', (ctx) => {
    const body = loop().steps;
    if (!body.some((step) => step.id === 'resume-entered-activity')) { ctx.skip(); return; }

    const result = walk(
      [complete('research'), complete(TERMINAL)],
      'plan-prepare',
      {
        current_activity: 'plan-prepare',
        worker_result: { result_type: 'checkpoint_pending' },
        checkpoint_reply: 'confirm',
        client_session_index: 'AAAAAA',
      },
    );
    expect(result.iterations[0]).toContain('resume-entered-activity');
    expect(result.iterations[0]).not.toContain('enter-activity');
    expect(result.log.filter((entry) => entry === 'advance')).toEqual(['advance']);
    expect(result.bag['checkpoint_reply']).toBeNull();
  });

  it('never commits an activity after the pointer has moved off it', () => {
    // `commit-after-activity` requires the commit to precede the transition it covers. In the log that
    // means no 'commit' may follow the 'advance' that moved off its activity — so within each iteration
    // the commit comes after that iteration's advance, and before the next.
    for (const envelopes of [
      [complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)],
      [gate(), complete('plan-prepare'), complete(TERMINAL)],
      [complete('plan-prepare'), completeAfterRefusal(TERMINAL)],
    ]) {
      const { log } = walk(envelopes);
      // The advance onto `__terminal__` closes the log, after the last activity's commit.
      expect(log.at(-1)).toBe('terminal');
      const walked = log.slice(0, -1);
      // Before it, the log alternates advance, commit — one commit for each advance, immediately after it.
      expect(walked.filter((e) => e === 'advance').length).toBe(walked.filter((e) => e === 'commit').length);
      for (let i = 0; i < walked.length; i += 2) {
        expect(walked[i]).toBe('advance');
        expect(walked[i + 1]).toBe('commit');
      }
    }
  });
});
