import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { deliverActivity } from './deliver-activity.js';
import { liveCorpusRoot } from '../corpus-root.js';
import { evaluateWhenExpression } from '../../src/schema/when-expression.js';
import { evaluateCondition, type Condition } from '../../src/schema/condition.schema.js';
import type { Step } from '../../src/schema/activity.schema.js';

/**
 * The materialised loop RUN, not merely delivered.
 *
 * Every other check over a routine reads the step list a worker receives. That answers whether the
 * construct materialised and nothing about whether the run it stands for works: the gates are
 * strings until something evaluates them, the continuation test is never taken, and a loop that
 * could never terminate delivers exactly like one that does. The walker in this directory makes a
 * single deterministic pass through a loop body on purpose — iterating is the runner's job — so the
 * question has had no asker.
 *
 * This is that runner. The body comes from the live server, materialised at the site under test, and
 * is then executed here: the operation the site supplied is stood in for by a stub whose returns are
 * the run's own input, the gates are taken with the server's own evaluators, and the loop iterates
 * until its continuation test clears or its declared bound stops it.
 *
 * What that buys over a delivery assertion: termination is observed rather than assumed, each gate
 * is shown to select on a real value, the accumulation lands under the name the SITE bound, and two
 * sites running in one bag are shown not to tread on each other's internals.
 */

const LIVE_CORPUS = liveCorpusRoot();

let harness: Harness;

beforeAll(async () => { if (LIVE_CORPUS) harness = await createHarness({ workflowDir: LIVE_CORPUS }); });
afterAll(async () => { await harness?.close(); });

/** What one measurement reports for one target: how much it held, and where the run goes next. */
interface Reading { entry_count: number; next_target: string | null }

/**
 * A directory shaped to reach every branch of the run: a target holding entries, one holding none,
 * and one naming nothing to follow. Three passes, and the third ends the walk.
 */
const TREE: Record<string, Reading> = {
  '.': { entry_count: 3, next_target: 'src' },
  src: { entry_count: 0, next_target: 'src/util' },
  'src/util': { entry_count: 2, next_target: null },
};

/** A tree whose every target names another, which nothing but the declared bound stops. */
const ENDLESS: Record<string, Reading> = { '.': { entry_count: 1, next_target: '.' } };

interface RunLog {
  /** Every step id executed, in order, across every pass. */
  executed: string[];
  /** The variable bag as the run left it. */
  bag: Record<string, unknown>;
  /** How many passes the loop made. */
  passes: number;
  /** True when the declared iteration bound stopped the loop rather than its continuation test. */
  hitBound: boolean;
}

/** `{a.b}` against the bag, walking dotted paths; a whole-string token keeps its value's type. */
function interpolate(value: unknown, bag: Record<string, unknown>): unknown {
  if (typeof value !== 'string') return value;
  const whole = /^\{([a-z_][a-z0-9_]*(?:\.[a-z0-9_]+)*)\}$/.exec(value);
  const read = (path: string): unknown =>
    path.split('.').reduce<unknown>((at, key) => (at as Record<string, unknown> | undefined)?.[key], bag);
  if (whole) return read(whole[1]!);
  return value.replace(/\{([a-z_][a-z0-9_]*(?:\.[a-z0-9_]+)*)\}/g, (_, p: string) => String(read(p) ?? ''));
}

/**
 * Execute a materialised body: technique steps stand in for the measurement, action steps apply
 * their `set`s, and a `while` loop iterates under its own continuation test and its own bound.
 */
function run(steps: Step[], tree: Record<string, Reading>, bag: Record<string, unknown> = {}): RunLog {
  const log: RunLog = { executed: [], bag, passes: 0, hitBound: false };

  const gated = (step: Step): boolean => {
    const structured = 'condition' in step ? step.condition as Condition | undefined : undefined;
    if (structured && !evaluateCondition(structured, bag)) return false;
    if (step.when && !evaluateWhenExpression(step.when, bag)) return false;
    return true;
  };

  const exec = (list: Step[]): void => {
    for (const step of list) {
      if (step.kind === 'loop') {
        if (step.loopType !== 'while') throw new Error(`unsupported loop type ${String(step.loopType)}`);
        if (!gated(step)) continue;
        const bound = step.maxIterations ?? 1;
        let passes = 0;
        while (evaluateCondition(step.continueWhile as Condition, bag)) {
          if (passes >= bound) { log.hitBound = true; break; }
          passes += 1;
          exec(step.steps as Step[]);
        }
        log.passes = passes;
        continue;
      }
      if (!gated(step)) continue;
      log.executed.push(step.id!);
      if (step.kind === 'technique') {
        // The site's operation, stood in for: the run reads `probe_result` without knowing which
        // measurement produced it, which is the whole contract under test.
        const bound = (step.technique as { inputs?: Record<string, string> }).inputs ?? {};
        const target = bag[bound['probe_target'] ?? ''] as string;
        const reading = tree[target];
        if (!reading) throw new Error(`the run asked for a target the tree does not hold: ${String(target)}`);
        bag['probe_result'] = reading;
      }
      const actions = 'actions' in step ? step.actions ?? [] : [];
      for (const action of actions) {
        if (action.action !== 'set' || !action.target) continue;
        // A `set` with no value is an accumulation: the run appends what this pass measured.
        if (action.value === undefined) {
          const into = (bag[action.target] as unknown[] | undefined) ?? [];
          bag[action.target] = [...into, bag['probe_result']];
          continue;
        }
        bag[action.target] = interpolate(action.value, bag);
      }
    }
  };

  exec(steps);
  return log;
}

/** The body as the live server materialises it at one site. */
async function body(activityId: string): Promise<Step[]> {
  const { activity } = await deliverActivity(harness, 'routine-conformance', activityId);
  return (activity.steps ?? []) as Step[];
}

describe.skipIf(!LIVE_CORPUS)('the materialised run, executed', () => {
  it('walks every target the measurement names and stops when it names none', async () => {
    const log = run(await body('count-pass'), TREE, { initial_target: '.' });
    expect(log.passes).toBe(3);
    expect(log.hitBound, 'the loop stopped at its bound rather than at its continuation test').toBe(false);
    // The run ends holding nothing, which is what its continuation test reads.
    expect(log.bag['count_pass_counting_current_target']).toBeNull();
  });

  it('accumulates under the name the site bound, once per target that measured something', async () => {
    const log = run(await body('count-pass'), TREE, { initial_target: '.' });
    // Three targets walked, one of them empty, so two readings land — under the site's own name.
    expect(log.bag['entry_counts']).toEqual([TREE['.'], TREE['src/util']]);
    expect(log.bag['size_measurements']).toBeUndefined();
  });

  it('takes the empty-target branch on the target that measured nothing, and only there', async () => {
    const log = run(await body('count-pass'), TREE, { initial_target: '.' });
    const announced = log.executed.filter((id) => id.endsWith('.announce-empty-target'));
    const noted = log.executed.filter((id) => id.endsWith('.note-empty-target'));
    expect(noted).toHaveLength(1);
    expect(announced).toHaveLength(1);
    // Cleared in the step that reads it, so the pass after the empty one does not announce again.
    expect(log.bag['count_pass_counting_empty_target']).toBeNull();
  });

  it('runs the same sequence at the other site, under its own operation and its own names', async () => {
    const log = run(await body('size-pass'), TREE, { initial_target: '.' });
    expect(log.passes).toBe(3);
    expect(log.bag['size_measurements']).toEqual([TREE['.'], TREE['src/util']]);
    expect(log.bag['size_pass_sizing_current_target']).toBeNull();
    // One authored body, so the two sites execute the same sequence with their own prefixes.
    const counting = run(await body('count-pass'), TREE, { initial_target: '.' });
    expect(log.executed.map((id) => id.replace('sizing.', '')))
      .toEqual(counting.executed.map((id) => id.replace('counting.', '')));
  });

  it('keeps two sites out of each other\'s way when both run against one bag', async () => {
    const bag: Record<string, unknown> = { initial_target: '.' };
    run(await body('count-pass'), TREE, bag);
    run(await body('size-pass'), TREE, bag);
    // Each site's internal is its own, so the second run cannot resume or corrupt the first's.
    expect(bag['count_pass_counting_current_target']).toBeNull();
    expect(bag['size_pass_sizing_current_target']).toBeNull();
    expect(bag['entry_counts']).toHaveLength(2);
    expect(bag['size_measurements']).toHaveLength(2);
  });

  it('stops at the declared bound when the measurement never names an end', async () => {
    const log = run(await body('count-pass'), ENDLESS, { initial_target: '.' });
    expect(log.hitBound).toBe(true);
    expect(log.passes).toBe(10); // the bound the run declares
  });
});
