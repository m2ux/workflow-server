/**
 * Records a walk must not leave behind.
 *
 * Two facts about a run were corrected rather than asserted: the artifact contract an activity hands
 * its worker names each artifact once, and a review-mode run records no assumption outcome. Each
 * correction lives in a definition — a filename dropped during composition, a conjunct on a gate —
 * and a definition that loses it is a wrong record in a real run rather than a failing load.
 *
 * Both readings are predicates over a finished walk, named here rather than written inline at the
 * assertion, so the same reading that guards the live corpus can be put to a run that carries the
 * defect. An assertion only ever shown passing is not evidence that it would catch anything.
 */
import { loadWorkflow } from '../../src/loaders/workflow-loader.js';
import { flattenActivitySteps, techniqueName } from '../../src/schema/activity.schema.js';
import { corpusRoot } from '../corpus-root.js';
import type { WalkResult } from './walker.js';

/**
 * One logical artifact, as `manage-artifacts::write-artifact` keys it: the bare filename with any
 * minted `<NN>-` prefix removed.
 *
 * The prefix is the server's, assigned at the first write and kept for the artifact's life, so
 * `findings.md` and `04-findings.md` are one file that two names reach — which is why the write
 * protocol finds-or-creates on the bare name and refuses to mint a second instance of it. The
 * snapshot suite's update-in-place test groups written artifacts the same way.
 */
export function logicalArtifact(name: string): string {
  return name.replace(/^\d+-/, '');
}

/**
 * Every activity in the walk whose delivered artifact contract names one logical artifact twice,
 * as `<activity>: <artifact> <- <the spellings that reached it>`.
 *
 * The contract is composed from the `#### artifact` filenames of the techniques an activity's steps
 * bind, and composition drops a filename it has already seen. That drop is what keeps the contract
 * single, and it is load-bearing: nine corpus activities bind two or more outputs declaring one
 * filename, and `assumptions-review` binds three for `assumptions-log.md`. Nothing asserted its
 * result, so this is the claim the drop exists to make. It is also wider than the drop, which
 * compares exact strings: two spellings of one logical artifact pass it and arrive here.
 *
 * Read off the contract as announced, never off the rendered names. A dry walk has no agent, so the
 * walker fills its bag with stand-in values, and a token two names share would invent a collision
 * there that no run has.
 */
export function doubledAnnouncements(result: WalkResult): string[] {
  const found = new Set<string>();
  for (const step of result.steps) {
    const spellings = new Map<string, string[]>();
    for (const name of step.artifactContract) {
      const bare = logicalArtifact(name);
      spellings.set(bare, [...(spellings.get(bare) ?? []), name]);
    }
    for (const [bare, names] of spellings) {
      if (names.length > 1) found.add(`${step.activityId}: ${bare} <- ${names.join(', ')}`);
    }
  }
  return [...found].sort();
}

/**
 * The technique that writes an assumption's outcome into the log. Named, because "records an
 * assumption outcome" is not a structural property: `collect` and `reconcile` declare the same log
 * as their output and neither settles anything.
 */
export const ASSUMPTION_RECORD_TECHNIQUE = 'review-assumptions::record';

/** Whether a step's technique reference resolves to the assumption recorder, under any namespace. */
function recordsAnAssumption(ref: string): boolean {
  return ref === ASSUMPTION_RECORD_TECHNIQUE || ref.endsWith(`::${ASSUMPTION_RECORD_TECHNIQUE}`);
}

/**
 * Every step binding the assumption recorder, by activity, as the loader materialises them.
 *
 * Read from the definitions rather than listed here: the run sits inside a routine, hosted twice, so
 * its step ids are composed from the reference site and a list written out by hand would be a second
 * home for them. A site added to a third host is covered without this file changing, and a renamed
 * one is covered because the walk reports the same composed id the loader does.
 */
export async function assumptionRecordSteps(
  workflowIds: readonly string[],
  root: string = corpusRoot(),
): Promise<Map<string, string[]>> {
  const byActivity = new Map<string, string[]>();
  for (const workflowId of workflowIds) {
    const loaded = await loadWorkflow(root, workflowId);
    // A workflow that will not load would contribute no recording step and read as a clean run.
    if (!loaded.success) throw new Error(`cannot read '${workflowId}': ${loaded.error.message}`);
    for (const activity of loaded.value.activities ?? []) {
      if (byActivity.has(activity.id)) continue;
      const ids = flattenActivitySteps(activity)
        .filter((s) => {
          const ref = techniqueName((s as { technique?: unknown }).technique as Parameters<typeof techniqueName>[0]);
          return ref !== undefined && recordsAnAssumption(ref);
        })
        .map((s) => s.id)
        .filter((id): id is string => id !== undefined);
      if (ids.length) byActivity.set(activity.id, [...new Set(ids)].sort());
    }
  }
  return byActivity;
}

/** The activities holding a recording step that the walk actually entered. */
export function recordHostsEntered(
  result: WalkResult,
  recorders: ReadonlyMap<string, readonly string[]>,
): string[] {
  return [...new Set(result.steps.map((s) => s.activityId).filter((id) => recorders.has(id)))].sort();
}

/** Every `<activity>/<step>` the walk ran that writes an assumption outcome into the log. */
export function recordedAssumptionOutcomes(
  result: WalkResult,
  recorders: ReadonlyMap<string, readonly string[]>,
): string[] {
  const found = new Set<string>();
  for (const step of result.steps) {
    const recording = recorders.get(step.activityId);
    if (!recording) continue;
    for (const id of step.stepsExecuted) {
      if (recording.includes(id)) found.add(`${step.activityId}/${id}`);
    }
  }
  return [...found].sort();
}
