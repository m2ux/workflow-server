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
const ADVANCING_STEPS = ['continue-batched-worker', 'dispatch-entry', 'enter-activity', 'enter-fan'];

/**
 * The two entry steps, by the `enter_activity` binding that selects one.
 *
 * The loop holds a gated pair — `dispatch-entry` where the binding is the declared default, and
 * `enter-activity` where it names anything else — and both are live: meta's own host leaves the
 * input unbound, and four client workflows bind `workflow-engine::take-activity`. A walk that seeds
 * neither takes the second by accident, because an unset binding is not the default string, so the
 * path the corpus actually runs goes unwalked. Each scenario below runs under both.
 */
const TAKE_ACTIVITY = 'workflow-engine::take-activity';

/** The step id the loop enters through, for a given `enter_activity` binding. */
function entryStep(binding: string): string {
  return binding === defaultEntryBinding() ? 'dispatch-entry' : 'enter-activity';
}

/** Both live bindings, the declared default first. Read lazily: there is no corpus at module load. */
function entryBindings(): string[] {
  return [defaultEntryBinding(), TAKE_ACTIVITY];
}

/** The destination an activity routes to when it ends the run — through an exit, or for want of one. */
const TERMINAL = '__terminal__';

interface Envelope {
  /**
   * `none` is not a result type the corpus declares — it is this file's way of scripting a worker that
   * returned no accepted envelope at all, which the declared types cannot express and which is the
   * case every worker-producing technique carries a recovery branch for. `workflow_complete` is never
   * scripted: the entry onto `__terminal__` composes it, since no worker runs there.
   */
  result_type: 'activity_complete' | 'checkpoint_pending' | 'workflow_complete' | 'none';
  next_activity_id?: string | Record<string, unknown>;
  next_activity_fans?: boolean;
  batch_may_continue?: boolean;
  steps_completed?: unknown[];
}

type Bag = Record<string, unknown>;

/**
 * Carry the activity the pointer names, under a minted identity, and return its envelope.
 *
 * The reading of both entry steps. The advance is skipped where `stands_on_activity` says the session
 * already stands on the activity — the convergence a fan entered, or the activity an earlier walk left
 * in flight. Entering `__terminal__` completes the session: it returns the `workflow_complete`
 * envelope, mints no identity, and runs no worker.
 */
function enters(bag: Bag, next: () => Envelope, log: string[]): void {
  const activity = bag['current_activity'] as string;
  if (activity === TERMINAL) {
    log.push('terminal');
    bag['worker_result'] = { result_type: 'workflow_complete' };
    return;
  }
  if (!bag['stands_on_activity']) log.push('advance');
  bag['worker_agent_id'] = `worker:${activity}`;
  bag['worker_result'] = next();
}

/**
 * What each technique and routine step of the loop does to the variable bag, read off what it binds.
 * An action step has no row: its `set` actions are read from the definition (`applySets`).
 *
 * Every body step is covered, and the coverage is asserted — a step added to the loop, or one
 * renamed, has to be read and placed here rather than defaulting to no effect. A row that does
 * nothing says so, and why.
 *
 * - `continue-batched-worker` → `continue-entry`: advances the pointer, then returns an envelope and
 *   the identity now holding the activity — the held one, or a replacement it spawned.
 * - `dispatch-entry` and `enter-activity` → the gated entry pair, selected by `enter_activity`.
 * - `enter-fan` → `fan::enter-fan`: one call opens every branch and reports the activity they
 *   converge on.
 * - `mint-branches` → `fan::spawn-branches`, and `open-branches` → the routine that runs them: the
 *   batch and its returns. No gate reads what either produces.
 * - `branch-retirement` → the forEach over `branches`, whose `fan::retire-branch` advances once per
 *   branch, the last retirement entering the convergence activity. Its inner steps are outside this
 *   walk, which reads the body only.
 * - `persist-the-fan` → the `persist-activity` routine over the branch activities: the fan's one
 *   commit, at convergence, reporting whether its push landed.
 * - `persist-entering` → the `persist-entering` routine: the entering mark for a fan's source.
 * - `resume-yielded-worker` → `resume-entry`: returns a fresh envelope under the identity already
 *   held. It does NOT touch the pointer.
 * - `finish-entered-activity` and `finish-resumed-activity` → `finish-activity`: the fold of a
 *   worker's `steps_complete` into the envelope the loop's gates read.
 * - `commit-activity-artifacts` → the `persist-activity` routine: the activity's one commit,
 *   reporting whether its push landed.
 *
 * `advance_trace_tokens` is unmodelled throughout. Every entry returns it and six action steps append
 * it to `trace_tokens`, but no `when:` in the loop reads the tokens, so modelling them would change
 * which steps this walk records as fired without changing a single gate. The append steps therefore
 * stay unfired here, and what the tokens accumulate is asserted elsewhere.
 */
const EFFECTS: Record<string, (bag: Bag, next: () => Envelope, log: string[]) => void> = {
  'continue-batched-worker': (bag, next, log) => {
    log.push('advance');
    // `continue-batch` returns the identity now holding the activity — the held one, or a replacement it
    // spawned. The step's own gate requires an identity already, so the bag holds one either way and a
    // walk cannot tell the two apart; the bag is left alone rather than implying it can.
    bag['worker_result'] = next();
  },
  // The gated entry pair. Both carry the activity the pointer names and return its envelope under a
  // minted identity; they differ in the binding that selects them, not in what they do to the bag, so
  // one reading serves both. Each also returns `advance_trace_tokens`, left unmodelled below.
  'dispatch-entry': enters,
  'enter-activity': enters,
  'enter-fan': (bag, _next, log) => {
    log.push('advance');
    // One call opens every branch. Branch envelopes belong to the spawn that follows; this walk
    // only sees the convergence the barrier reported.
    bag['fan_convergence_activity'] = 'gather';
    bag['branch_activities'] = ['probe-unit#0', 'probe-unit#1'];
  },
  'mint-branches': () => { /* returns the branches; no gate reads them */ },
  'open-branches': () => { /* returns branch_envelopes; no gate reads it */ },
  'branch-retirement': () => { /* the forEach whose retirements advance, one per branch */ },
  'persist-the-fan': (bag, _next, log) => {
    log.push('commit');
    bag['push_landed'] = true;
  },
  // Writes the entering mark for a fan's source. Gated on a planning folder, which these walks do not
  // bind, so it is named for the table's completeness and fires in none of them.
  'persist-entering': () => { /* commits the entering mark; no gate reads what it returns */ },
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
  'commit-activity-artifacts': (bag, _next, log) => {
    log.push('commit');
    // `persist-activity` reports whether the push landed, and the two steps after this one read it:
    // one aborts the walk where it did not, the other advances where it did. A commit that reports
    // nothing reads as a push that failed, and the walk ends on its first activity.
    bag['push_landed'] = true;
  },
  // The fold of a worker's own `steps_complete` into the envelope the loop's gates read. Scenarios
  // script the post-fold `activity_complete` directly, so the fold itself is outside these walks.
  'finish-entered-activity': () => { /* folds steps_complete; no scenario scripts that type */ },
  'finish-resumed-activity': () => { /* folds steps_complete; no scenario scripts that type */ },
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

interface RunDef {
  steps: OuterStep[];
  inputs?: Array<{ id: string; default?: unknown }>;
}

function routineDef(): RunDef {
  return parseYaml(
    readFileSync(workflowSubdir(liveCorpusRoot()!, 'meta', 'routines/activity-loop.yaml')!, 'utf8'),
  ) as RunDef;
}

/**
 * The `enter_activity` binding a caller that binds nothing gets, read from the input's declared
 * default. Hard-coding it would let the default move to the other entry step with every walk below
 * still passing, since the two are gated on this exact string.
 */
function defaultEntryBinding(): string {
  const declared = routineDef().inputs?.find((i) => i.id === 'enter_activity')?.default;
  if (typeof declared !== 'string') {
    throw new Error(`the loop declares no default enter_activity binding (got ${String(declared)})`);
  }
  return declared;
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
 *
 * `entryBinding` is the `enter_activity` a caller bound, and selects which of the two entry steps
 * the body reaches. It is seeded onto the bag whether or not the caller named one, because the
 * gates compare it against a literal and an unset binding silently picks the non-default branch.
 */
function walk(
  envelopes: Envelope[],
  initialActivity = 'implementation-analysis',
  seed?: Bag,
  entryBinding: string = defaultEntryBinding(),
): Walk {
  const def = loop();
  const body = def.steps;
  const bag: Bag = seed
    ? { enter_activity: entryBinding, ...seed }
    : { current_activity: initialActivity, client_session_index: 'AAAAAA', enter_activity: entryBinding };
  const queue = [...envelopes];
  const iterations: string[][] = [];
  const log: string[] = [];
  const minted: string[] = [];
  let exhausted = false;

  const next = (): Envelope => {
    const envelope = queue.shift();
    if (!envelope) { exhausted = true; throw new Error('envelopes exhausted'); }
    return envelope;
  };

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

const complete = (next: string | Record<string, unknown>, room = true, fans = false): Envelope =>
  ({ result_type: 'activity_complete', next_activity_id: next, next_activity_fans: fans, batch_may_continue: room, steps_completed: [] });
const gate = (): Envelope => ({ result_type: 'checkpoint_pending' });
/** A continuation that returned no accepted envelope — the context ended, or answered with neither type. */
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
  it('reads every body step, and reads no step the body dropped', () => {
    // The walk applies `EFFECTS[step.id]` and tolerates a miss, so an unread step and a renamed one
    // both produce a walk that simply skips it — every scenario below still passing, and the model
    // quietly describing a loop the corpus no longer has. Both directions are named here instead.
    const ids = loop().steps.map((s) => s.id);
    const unread = ids.filter((id) => !EFFECTS[id]).filter((id) => {
      const step = loop().steps.find((s) => s.id === id);
      return step?.kind !== 'action';
    });
    expect(unread, `read these steps and give each a row in EFFECTS:\n${unread.join('\n')}`).toEqual([]);

    const dead = Object.keys(EFFECTS).filter((id) => !ids.includes(id));
    expect(dead, `the body holds no such step; drop these rows:\n${dead.join('\n')}`).toEqual([]);

    // An action step's effect is read from its `set` actions, so a row for one would be a second,
    // divergent reading of something the definition already states.
    const shadowed = ids.filter((id) => EFFECTS[id] && loop().steps.find((s) => s.id === id)?.kind === 'action');
    expect(shadowed, `these are action steps; their effects are their own:\n${shadowed.join('\n')}`).toEqual([]);
  });

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
      'batch spent after one': [complete('plan-prepare', false), complete('assumptions-review'), complete(TERMINAL)],
      'terminal with room left': [complete(TERMINAL, true)],
      'two gates on one activity': [gate(), gate(), complete(TERMINAL)],
    };
    for (const binding of entryBindings()) {
    for (const [label, envelopes] of Object.entries(scenarios)) {
      const name = `${label} (${binding})`;
      const result = walk(envelopes, undefined, undefined, binding);
      for (const [index, fired] of result.iterations.entries()) {
        const advancing = fired.filter((id) => ADVANCING_STEPS.includes(id));
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
      expect(result.iterations.at(-1), `${name}: terminal iteration`)
        .toEqual(['open-entry-tokens', entryStep(binding), 'end-walk']);
    }
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
    for (const binding of entryBindings()) {
      const result = walk(
        [complete('plan-prepare'), complete('assumptions-review'), complete(TERMINAL)],
        undefined, undefined, binding,
      );
      const entry = entryStep(binding);

      expect(result.stopped, binding).toBe('condition');
      expect(result.iterations, binding).toEqual([
        ['open-entry-tokens', entry, 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity'],
        ['open-entry-tokens', 'continue-batched-worker', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity'],
        ['open-entry-tokens', 'continue-batched-worker', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity', 'release-spent-worker'],
        ['open-entry-tokens', entry, 'end-walk'],
      ]);
      // Every activity commits before the next advance, the identity is released once, after the last
      // activity, and the entry onto `__terminal__` is the walk's final advance.
      expect(result.log, binding).toEqual(['advance', 'commit', 'advance', 'commit', 'advance', 'commit', 'terminal']);
      expect(result.bag['worker_agent_id'], binding).toBeNull();
      // One identity carries the whole batch.
      expect(result.minted, binding).toEqual(['worker:implementation-analysis']);
    }
  });

  it('carries the identity across a gate and continues on the following iteration', () => {
    for (const binding of entryBindings()) {
      const result = walk([gate(), complete('plan-prepare'), complete(TERMINAL)], undefined, undefined, binding);

      // The gate iteration presents, responds and resumes — and does NOT commit or advance the pointer,
      // because a gate is not an activity boundary. The resumed envelope then completes the activity in
      // that same iteration, which is where the commit belongs.
      expect(result.iterations[0], binding).toEqual([
        'open-entry-tokens',
        entryStep(binding),
        'present-yielded-checkpoint',
        'respond-yielded-checkpoint',
        'resume-yielded-worker',
        'commit-activity-artifacts',
        'note-exiting-activity',
        'advance-activity',
      ]);
      // The identity survived the gate, so the next activity is a continuation rather than a dispatch.
      expect(result.iterations[1]?.[1], binding).toBe('continue-batched-worker');
    }
  });

  it('answers two gates on one activity under one identity, committing once', () => {
    const result = walk([gate(), gate(), complete(TERMINAL)]);

    // The second gate takes its own iteration, and that iteration neither dispatches nor continues —
    // the worker is still on the activity it holds, so the pointer must not move. A one-gate walk
    // finishes its activity in one iteration, so the count is what distinguishes them; each walk
    // takes one more iteration to enter `__terminal__`.
    expect(result.iterations).toHaveLength(3);
    expect(walk([gate(), complete(TERMINAL)]).iterations).toHaveLength(2);
    expect(result.iterations[1]![1]).toBe('present-yielded-checkpoint');
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
    const result = walk([complete(fanDest, true, true), complete(TERMINAL)]);

    expect(result.stopped).toBe('condition');
    expect(result.iterations).toEqual([
      ['open-entry-tokens', 'dispatch-entry', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity', 'release-spent-worker'],
      ['open-entry-tokens', 'enter-fan', 'mint-branches', 'open-branches', 'branch-retirement', 'persist-the-fan', 'advance-past-fan', 'retire-fan-envelope'],
      ['open-entry-tokens', 'dispatch-entry', 'spend-entered-activity', 'commit-activity-artifacts', 'note-exiting-activity', 'advance-activity', 'release-spent-worker'],
      ['open-entry-tokens', 'dispatch-entry', 'end-walk'],
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

  it('releases a spent batch, so the next activity is dispatched afresh', () => {
    const result = walk([complete('plan-prepare', false), complete('assumptions-review'), complete(TERMINAL)]);

    expect(result.iterations[0]).toContain('release-spent-worker');
    // Released, so the following iteration reaches dispatch rather than continuation.
    expect(result.iterations[1]?.[1]).toBe(entryStep(defaultEntryBinding()));
    expect(result.iterations[1]).not.toContain('continue-batched-worker');
  });

  it('stops on the terminal activity by entering it without a worker', () => {
    const result = walk([complete(TERMINAL, true)]);

    // Room left in the batch, but the activity routes to `__terminal__`. The identity is released, so
    // the continuation cannot carry the held worker into `__terminal__`, and no identity is left held
    // for a re-entry to continue on. The next iteration's entry completes the session and ends the walk.
    expect(result.stopped).toBe('condition');
    expect(result.iterations).toHaveLength(2);
    expect(result.iterations[0]).toContain('release-spent-worker');
    expect(result.iterations[1]).toEqual(['open-entry-tokens', entryStep(defaultEntryBinding()), 'end-walk']);
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
    expect(result.iterations[0]).toContain(entryStep(defaultEntryBinding()));
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
      [complete('plan-prepare', false), complete(TERMINAL)],
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
