import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { flattenActivitySteps, type Activity, type Step } from '../src/schema/activity.schema.js';

/**
 * Where a routine reference meets another mechanism that also decides identity or scope.
 *
 * Each case is a product of two features built apart: the loader scopes a borrowed activity's
 * unqualified names to the workflow it was authored in, and a graph destination runs one activity
 * once per element of a collection. A reference carries its own scope rule and its own prefixing,
 * so the question each product asks is whether the two agree — which neither feature's own tests
 * reach, because each holds the other fixed.
 *
 * The corpus sits under `tests/fixtures/routine-cross/` as committed trees rather than directories
 * written at run time, so a permutation is a file a reader opens rather than a string in a test.
 */

const CORPUS = resolve(import.meta.dirname, 'fixtures/routine-cross');

const stepsOf = (activity: Activity): Step[] => flattenActivitySteps(activity);

function activityById(activities: Activity[], id: string): Activity {
  const found = activities.find((a) => a.id === id);
  expect(found, `the fixture declares no activity '${id}'`).toBeDefined();
  return found!;
}

describe('a borrowed activity referring to a routine by bare name', () => {
  it('records the workflow the borrowed activity was authored in', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'borrower-wf');
    expect(result.success, 'the borrower workflow failed to load').toBe(true);
    if (!result.success) return;

    expect(result.value.activitySourceWorkflow.get('shared-review')).toBe('source-wf');
    expect(result.value.activitySourceWorkflow.get('own-start')).toBe('borrower-wf');
  });

  /**
   * Both `source-wf` and `meta` declare a routine named `settle`, with bodies of different lengths.
   * The bare name therefore has one right answer and one plausible wrong one, and the assertion
   * reads which body arrived rather than that something did.
   */
  it('takes the source workflow\'s body where meta declares that name too', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'borrower-wf');
    expect(result.success).toBe(true);
    if (!result.success) return;

    const borrowed = activityById(result.value.workflow.activities as Activity[], 'shared-review');
    expect(stepsOf(borrowed).map((s) => s.id))
      .toEqual(['settle-the-scope.weigh', 'settle-the-scope.mark']);
  });

  it('leaves no reference step behind in the borrowed activity', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'borrower-wf');
    expect(result.success).toBe(true);
    if (!result.success) return;

    const borrowed = activityById(result.value.workflow.activities as Activity[], 'shared-review');
    expect(stepsOf(borrowed).some((s) => s.kind === 'routine')).toBe(false);
  });
});

describe('an instance-fanned activity referring to a routine', () => {
  it('loads, so a fan destination and a reference step coexist in one activity', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'fanned-fixture');
    expect(result.success, 'the fanned fixture failed to load').toBe(true);
  });

  /**
   * The fan repeats the whole activity per element and each reference prefixes from its own id, so
   * the two sites stay distinct in the definition the fan repeats. A collision here is one the fan
   * would reproduce once per element.
   */
  it('keeps two references to one routine distinct inside the fanned activity', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'fanned-fixture');
    expect(result.success).toBe(true);
    if (!result.success) return;

    const fanned = activityById(result.value.workflow.activities as Activity[], 'probe-unit');
    const ids = stepsOf(fanned).map((s) => s.id);

    expect(ids).toEqual([
      'first-probe.take-reading',
      'first-probe.file-reading',
      'confirming-probe.take-reading',
      'confirming-probe.file-reading',
    ]);
    expect(new Set(ids).size, 'two sites of one routine produced a duplicate id').toBe(ids.length);
  });
});

/**
 * A fanned branch may not hold a checkpoint: a session holds one outstanding decision at a time, so
 * a gate inside a fan stops its sibling branches. A run is spliced into its host before that rule is
 * applied, so a gate reaches a fanned branch by being inside the run the branch refers to — a route
 * neither the fan's rule nor the construct's own tests describe.
 */
describe('a gate reaching a fanned branch from inside a routine', () => {
  it('is refused, though the activity declares no gate of its own', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'fanned-gate-fixture');
    expect(result.success, 'a gate inside a fanned branch was accepted').toBe(false);
  });

  it('names the gate by its composed id, so the rule reads the materialised activity', async () => {
    const result = await loadWorkflowWithDiagnostics(CORPUS, 'fanned-gate-fixture');
    expect(result.success).toBe(false);
    if (result.success) return;

    const issues = (result.error as { issues?: string[] }).issues ?? [];
    expect(issues.join('\n')).toContain('first-probe.confirm');
    // The id written in the routine file, unprefixed, would name a step no activity holds.
    expect(issues.some((i) => /\bconfirm\b(?!\.)/.test(i.replace(/first-probe\.confirm/g, '')))).toBe(false);
  });
});
