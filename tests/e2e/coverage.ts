/**
 * Option coverage — what the corpus declares, against what the walks reach.
 *
 * `enumeratePaths` reports `branchesCovered/branchesKnown`, and `known` is what the walks happened
 * to encounter. A checkpoint no walk reaches contributes to neither side, so the ratio reads 100%
 * with the checkpoint unvisited: the same shape as the executed-step list, which records what
 * happened rather than what should have (#472).
 *
 * The denominator here comes from the definitions instead, so it does not move when the walk does.
 * Two things make the loader the only honest source for it. A checkpoint may arrive by fragment
 * `ref`, which raw YAML shows as a step with no options at all; and an activity may be borrowed by
 * another workflow, so the walk that reaches it need not be the walk of the workflow it lives in.
 * Loading each workflow the way the server does resolves both, and coverage is then a corpus-wide
 * question: one entry per declared option, covered if any walk took it.
 */
import { loadWorkflow } from '../../src/loaders/workflow-loader.js';
import { type Activity, type Step, activityCheckpoints, flattenActivitySteps } from '../../src/schema/activity.schema.js';
import { corpusRoot } from '../corpus-root.js';

/** The branch key `enumeratePaths` records for a checkpoint option, so both sides are comparable. */
export function optionKey(activityId: string, checkpointId: string, optionId: string): string {
  return `checkpoint:${activityId}:${checkpointId}=${optionId}`;
}

export interface DeclaredCheckpoint {
  activityId: string;
  checkpointId: string;
  optionIds: string[];
  /** Workflows declaring this activity. More than one means it is borrowed, so any of them may reach it. */
  workflowIds: string[];
  /** The step's own gate, as authored — the evidence for why an unreached checkpoint was skipped. */
  gate?: string;
  /** True where the checkpoint sits inside a loop body, so reaching it needs a non-empty collection. */
  inLoop: boolean;
}

function gatesById(activity: Activity): Map<string, string> {
  const gates = new Map<string, string>();
  for (const s of flattenActivitySteps(activity)) {
    if (s.id === undefined) continue;
    const gate = s.when ?? (s.condition ? JSON.stringify(s.condition) : undefined);
    if (gate !== undefined) gates.set(s.id, gate);
  }
  return gates;
}

function loopBodyStepIds(activity: Activity): Set<string> {
  const ids = new Set<string>();
  const walk = (steps: Step[] | undefined, insideLoop: boolean): void => {
    for (const s of steps ?? []) {
      if (insideLoop && s.id) ids.add(s.id);
      if (s.kind === 'loop') walk(s.steps as Step[], true);
    }
  };
  walk(activity.steps, false);
  return ids;
}

/**
 * Every checkpoint the corpus declares, keyed by activity so a borrowed activity is one entry.
 *
 * An activity two workflows share is the same checkpoints either way, so it is counted once and
 * either workflow's walk can cover it. Counting it per borrower would inflate the denominator and
 * report a covered checkpoint as partly uncovered.
 */
export async function declaredCheckpoints(workflowIds: readonly string[]): Promise<DeclaredCheckpoint[]> {
  const root = corpusRoot();
  const byActivity = new Map<string, DeclaredCheckpoint>();
  for (const workflowId of workflowIds) {
    const loaded = await loadWorkflow(root, workflowId);
    // Skipping a workflow that will not load would shrink the denominator and report the coverage
    // of what remains as the coverage of the corpus. Unmeasured is not the same as covered.
    if (!loaded.success) throw new Error(`cannot count options in '${workflowId}': ${loaded.error.message}`);
    for (const activity of loaded.value.activities ?? []) {
      const gates = gatesById(activity);
      const inLoop = loopBodyStepIds(activity);
      for (const cp of activityCheckpoints(activity)) {
        const key = `${activity.id}:${cp.id}`;
        const already = byActivity.get(key);
        if (already) {
          if (!already.workflowIds.includes(workflowId)) already.workflowIds.push(workflowId);
          continue;
        }
        byActivity.set(key, {
          activityId: activity.id,
          checkpointId: cp.id,
          optionIds: cp.options.map((o) => o.id),
          workflowIds: [workflowId],
          gate: gates.get(cp.id),
          inLoop: inLoop.has(cp.id),
        });
      }
    }
  }
  return [...byActivity.values()]
    .sort((a, b) => `${a.activityId}:${a.checkpointId}`.localeCompare(`${b.activityId}:${b.checkpointId}`));
}

/** Every declared checkpoint option across the given workflows, as branch keys. */
export async function declaredOptions(workflowIds: readonly string[]): Promise<string[]> {
  const checkpoints = await declaredCheckpoints(workflowIds);
  return checkpoints
    .flatMap((cp) => cp.optionIds.map((id) => optionKey(cp.activityId, cp.checkpointId, id)))
    .sort();
}

export interface OptionCoverage {
  declared: string[];
  covered: string[];
  /** Declared and never taken by any walk — the coverage gap, whatever its cause. */
  uncovered: string[];
  /**
   * Taken by a walk but matching no declared option. Should always be empty: it is the check that
   * the two sides name a checkpoint the same way. A checkpoint id may carry an interpolation suffix
   * (`submodule-selection#{candidate_component.path}`), and nothing renders it before either side
   * records it, so they agree — an entry here says that stopped being true.
   */
  unexpected: string[];
}

/** Compare the corpus's declared options against the branch keys the walks actually took. */
export function optionCoverage(declared: readonly string[], coveredBranches: readonly string[]): OptionCoverage {
  const declaredSet = new Set(declared);
  // Transition branches share the recorder but are not options, so only checkpoint keys compare.
  const covered = [...new Set(coveredBranches.filter((b) => b.startsWith('checkpoint:')))].sort();
  const coveredSet = new Set(covered);
  return {
    declared: [...declared].sort(),
    covered,
    uncovered: [...declared].filter((k) => !coveredSet.has(k)).sort(),
    unexpected: covered.filter((k) => !declaredSet.has(k)),
  };
}

/**
 * Every step id the given workflows' activities declare, by activity. Loop bodies are flattened, so
 * a step inside a loop counts once however many times an iteration would run it.
 */
export async function declaredSteps(workflowIds: readonly string[]): Promise<Map<string, string[]>> {
  const root = corpusRoot();
  const byActivity = new Map<string, string[]>();
  for (const workflowId of workflowIds) {
    const loaded = await loadWorkflow(root, workflowId);
    if (!loaded.success) throw new Error(`cannot count steps in '${workflowId}': ${loaded.error.message}`);
    for (const activity of loaded.value.activities ?? []) {
      if (byActivity.has(activity.id)) continue;
      const ids = flattenActivitySteps(activity).map((s) => s.id).filter((id): id is string => id !== undefined);
      byActivity.set(activity.id, [...new Set(ids)].sort());
    }
  }
  return byActivity;
}

export interface ActivityStepCoverage {
  activity: string;
  declared: number;
  executed: number;
  /** Step ids no walk in the matrix ran. */
  missed: string[];
}

/**
 * Per-activity step coverage for a set of walks: what each activity declares, against what any walk
 * in the set actually ran.
 *
 * The executed list on its own says what happened; against the declared count it says what did not,
 * which is the figure a reader needs to know how much of the workflow the matrix speaks for (#472).
 * Only activities some walk entered are reported — an activity no walk reached is a path-coverage
 * gap that the option ratchet measures, and reporting it here as 0-of-N would count it twice.
 */
export function stepCoverage(
  declared: ReadonlyMap<string, readonly string[]>,
  executedByActivity: ReadonlyMap<string, ReadonlySet<string>>,
): ActivityStepCoverage[] {
  const out: ActivityStepCoverage[] = [];
  for (const [activity, executed] of [...executedByActivity].sort((a, b) => a[0].localeCompare(b[0]))) {
    const ids = declared.get(activity) ?? [];
    out.push({
      activity,
      declared: ids.length,
      executed: ids.filter((id) => executed.has(id)).length,
      missed: ids.filter((id) => !executed.has(id)),
    });
  }
  return out;
}

export interface CheckpointGap {
  activityId: string;
  checkpointId: string;
  workflowIds: string[];
  /** How many of the checkpoint's options no walk took, against how many it declares. */
  missed: number;
  declared: number;
  gate?: string;
  inLoop: boolean;
  /**
   * Whether any walk entered the activity at all. False is the more basic cause and hides the rest:
   * a checkpoint in an activity nothing entered is uncovered whatever its own gate says.
   */
  activityEntered: boolean;
}

/**
 * The gap grouped by checkpoint rather than by option, with what explains it.
 *
 * Options come in sets, so an unreached checkpoint shows up once per option it declares and inflates
 * the count without adding a cause. Grouping states the cause once: a checkpoint whose every option
 * is missed was never reached at all, and its gate — or the loop it sits in, or the fact that no walk
 * entered its activity — says why.
 */
export function checkpointGaps(
  checkpoints: readonly DeclaredCheckpoint[],
  uncovered: readonly string[],
  activitiesEntered: ReadonlySet<string> = new Set(),
): CheckpointGap[] {
  const missedBy = new Map<string, number>();
  for (const key of uncovered) {
    const cp = key.slice(0, key.lastIndexOf('='));
    missedBy.set(cp, (missedBy.get(cp) ?? 0) + 1);
  }
  return checkpoints
    .map((cp) => ({ cp, missed: missedBy.get(`checkpoint:${cp.activityId}:${cp.checkpointId}`) ?? 0 }))
    .filter((e) => e.missed > 0)
    .map(({ cp, missed }) => ({
      activityId: cp.activityId,
      checkpointId: cp.checkpointId,
      workflowIds: cp.workflowIds,
      missed,
      declared: cp.optionIds.length,
      activityEntered: activitiesEntered.has(cp.activityId),
      gate: cp.gate,
      inLoop: cp.inLoop,
    }));
}
