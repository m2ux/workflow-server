import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadWorkflow, loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { readWorkflowRoutines } from '../src/loaders/routine-loader.js';
import { stringifyForResponse } from '../src/utils/serialization.js';
import type { Step } from '../src/schema/activity.schema.js';

/**
 * A routine read off disk and materialised through the real loader (#704 W02).
 *
 * The in-memory cases live in `routine-materialisation.test.ts`; this file is about what the LOADER
 * does — discovery of `routines/`, the identity rule on a routine file, the authored form travelling
 * beside the materialised one, and the refusals as they reach a caller. A load failure is asserted
 * against its message, because a message naming the author's fix site is the whole product of a
 * refusal.
 */

let root: string;
let counter = 0;

beforeAll(() => { root = mkdtempSync(join(tmpdir(), 'routine-load-')); });
afterAll(() => { rmSync(root, { recursive: true, force: true }); });

interface TreeSpec {
  activities: Array<Record<string, unknown>>;
  routines?: Array<Record<string, unknown>>;
  /** Routines written into a second workflow, and into `meta`, for the resolution cases. */
  otherRoutines?: Array<Record<string, unknown>>;
  metaRoutines?: Array<Record<string, unknown>>;
  /** A filename that deliberately disagrees with the routine's declared id. */
  routineFilenames?: Record<string, string>;
}

/**
 * Write a workflow (plus `other` and `meta` where a case needs them) into a corpus of its own, and
 * return that corpus root and the workflow's id.
 *
 * A root per case rather than one shared root, because the two names resolution turns on are fixed:
 * the shared home is always `meta` and a qualified reference always names one workflow. Sharing a
 * root lets one case's `meta::shared-run` satisfy the next case's assertion that nothing resolves.
 */
function writeTree(spec: TreeSpec): { corpus: string; id: string } {
  counter += 1;
  const corpus = join(root, `case-${counter}`);
  const id = `fixture-${counter}`;
  const write = (workflowId: string, routines: Array<Record<string, unknown>>, activities: Array<Record<string, unknown>>): void => {
    const dir = join(corpus, workflowId);
    mkdirSync(join(dir, 'activities'), { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), stringifyForResponse({
      id: workflowId,
      version: '1.0.0',
      title: workflowId,
      ...(activities.length > 0 ? { initialActivity: activities[0]!['id'] } : {}),
      graph: Object.fromEntries(activities.map((a) => [a['id'] as string, {}])),
    }));
    activities.forEach((activity, index) => {
      writeFileSync(
        join(dir, 'activities', `${String(index + 1).padStart(2, '0')}-${activity['id']}.yaml`),
        stringifyForResponse({ version: '1.0.0', name: activity['id'], ...activity }),
      );
    });
    if (routines.length === 0) return;
    mkdirSync(join(dir, 'routines'), { recursive: true });
    for (const routine of routines) {
      const filename = spec.routineFilenames?.[routine['id'] as string] ?? (routine['id'] as string);
      writeFileSync(join(dir, 'routines', `${filename}.yaml`), stringifyForResponse({
        version: '1.0.0', name: routine['id'], ...routine,
      }));
    }
  };
  write(id, spec.routines ?? [], spec.activities);
  if (spec.otherRoutines) write('other', spec.otherRoutines, []);
  if (spec.metaRoutines) write('meta', spec.metaRoutines, []);
  return { corpus, id };
}

/** Load a tree and return the activity-level failures, which is where a refusal lands. */
async function activityErrors(spec: TreeSpec): Promise<string[]> {
  const { corpus, id } = writeTree(spec);
  const result = await loadWorkflowWithDiagnostics(corpus, id);
  if (!result.success) return (result.error as { issues?: string[] }).issues ?? [result.error.message];
  return result.value.activityLoadErrors.map((e) => e.error);
}

/** A routine with the minimum a legal one carries. */
const routine = (id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id,
  steps: [{ kind: 'action', id: 'do-it', actions: [{ action: 'log', message: 'ran' }] }],
  ...overrides,
});

/** A host activity whose only step is one reference. */
const host = (reference: Record<string, unknown>, id = 'host'): Record<string, unknown> => ({
  id, steps: [{ kind: 'routine', id: 'run', ...reference }],
});

describe('discovery — the routines directory', () => {
  it('reads one file per routine, keyed by its filename', async () => {
    const { corpus, id } = writeTree({ activities: [host({ routine: 'shared-run' })], routines: [routine('shared-run')] });
    const routines = await readWorkflowRoutines(corpus, id);
    expect([...routines.keys()]).toEqual(['shared-run']);
    expect(routines.get('shared-run')!.steps).toHaveLength(1);
  });

  it('returns an empty map for a workflow declaring no routines', async () => {
    const { corpus, id } = writeTree({ activities: [{ id: 'plain', steps: [{ kind: 'action', id: 'a' }] }] });
    expect((await readWorkflowRoutines(corpus, id)).size).toBe(0);
  });

  it('refuses a routine whose declared id disagrees with its filename', async () => {
    const { corpus, id } = writeTree({
      activities: [host({ routine: 'shared-run' })],
      routines: [routine('shared-run')],
      routineFilenames: { 'shared-run': 'differently-named' },
    });
    await expect(readWorkflowRoutines(corpus, id)).rejects.toThrow(/declares id 'shared-run'.*named 'differently-named'/s);
  });

  it('refuses a routine file the schema rejects, naming the file and the issue', async () => {
    const { corpus, id } = writeTree({
      activities: [host({ routine: 'empty-run' })],
      routines: [{ id: 'empty-run', steps: [] }],
    });
    await expect(readWorkflowRoutines(corpus, id)).rejects.toThrow(/routines\/empty-run\.yaml.*steps/s);
  });
});

describe('resolution — where a reference looks', () => {
  it('resolves a bare name in the referring workflow', async () => {
    expect(await activityErrors({ activities: [host({ routine: 'shared-run' })], routines: [routine('shared-run')] })).toEqual([]);
  });

  it('falls back to meta for a bare name the workflow does not declare', async () => {
    expect(await activityErrors({
      activities: [host({ routine: 'shared-run' })],
      metaRoutines: [routine('shared-run')],
    })).toEqual([]);
  });

  it('resolves a qualified name in that workflow only', async () => {
    expect(await activityErrors({
      activities: [host({ routine: 'other::shared-run' })],
      otherRoutines: [routine('shared-run')],
    })).toEqual([]);
  });

  it('gives a qualified name no meta fallback', async () => {
    const errors = await activityErrors({
      activities: [host({ routine: 'other::shared-run' })],
      otherRoutines: [routine('unrelated-run')],
      metaRoutines: [routine('shared-run')],
    });
    expect(errors.join('\n')).toMatch(/unresolved routine 'other::shared-run'/);
    expect(errors.join('\n')).not.toMatch(/meta/);
  });

  it('names the routine, the site and both homes when nothing resolves', async () => {
    const errors = await activityErrors({ activities: [host({ routine: 'nonesuch' })] });
    expect(errors.join('\n')).toMatch(/Activity 'host'.*nonesuch.*or 'meta'/s);
  });

  it('refuses a second separator, naming the one-separator rule', async () => {
    const errors = await activityErrors({ activities: [host({ routine: 'a::b::c' })] });
    expect(errors.join('\n')).toMatch(/carries 2 separators.*no group grammar/s);
  });
});

describe('the loaded workflow carries both forms', () => {
  it('keeps the authored reference beside the materialised steps', async () => {
    const { corpus, id } = writeTree({
      activities: [host({ routine: 'shared-run' })],
      routines: [routine('shared-run')],
    });
    const result = await loadWorkflowWithDiagnostics(corpus, id);
    if (!result.success) throw new Error(`load failed: ${result.error.message}`);

    const materialised = result.value.workflow.activities!.find((a) => a.id === 'host')!;
    expect(materialised.steps!.map((s) => s.kind)).toEqual(['action']);
    expect(materialised.steps![0]!.id).toBe('run.do-it');

    const authored = result.value.authoredActivities.get('host')!;
    expect(authored.steps!.map((s) => s.kind)).toEqual(['routine']);
    expect((authored.steps![0] as Extract<Step, { kind: 'routine' }>).routine).toBe('shared-run');
  });

  it('shares one object between the forms for an activity carrying no routine', async () => {
    const { corpus, id } = writeTree({ activities: [{ id: 'plain', steps: [{ kind: 'action', id: 'a' }] }] });
    const result = await loadWorkflowWithDiagnostics(corpus, id);
    if (!result.success) throw new Error(`load failed: ${result.error.message}`);
    const loaded = result.value.workflow.activities!.find((a) => a.id === 'plain')!;
    expect(result.value.authoredActivities.get('plain')).toBe(loaded);
  });
});

describe('a reference that does not resolve drops its activity and reports why', () => {
  it('excludes the activity and keeps the workflow loading', async () => {
    const { corpus, id } = writeTree({
      activities: [
        host({ routine: 'nonesuch' }),
        { id: 'sound', steps: [{ kind: 'action', id: 'a' }] },
      ],
    });
    const result = await loadWorkflowWithDiagnostics(corpus, id);
    if (!result.success) throw new Error(`load failed: ${result.error.message}`);
    expect(result.value.workflow.activities!.map((a) => a.id)).toEqual(['sound']);
    expect(result.value.activityLoadErrors).toHaveLength(1);
    expect(result.value.activityLoadErrors[0]!.activity_id).toBe('host');
    expect(result.value.authoredActivities.has('host')).toBe(false);
  });
});

describe('a routine body carrying a loop and a nested reference', () => {
  it('loads clean and prefixes through every level', async () => {
    const { corpus, id } = writeTree({
      activities: [host({ routine: 'outer-run', outputs: { run_total: 'host_total' } })],
      routines: [
        routine('inner-run', {
          outputs: [{ id: 'inner_count', type: 'number', description: 'what it counted' }],
          steps: [{ kind: 'action', id: 'count', actions: [{ action: 'set', target: 'inner_count', value: 1 }] }],
        }),
        routine('outer-run', {
          outputs: [{ id: 'run_total', type: 'number', description: 'the total' }],
          internals: [{ id: 'current_item', description: 'the item in hand' }],
          steps: [{
            kind: 'loop', id: 'each', loopType: 'forEach', variable: 'current_item', over: 'work_items',
            steps: [{ kind: 'routine', id: 'tally', routine: 'inner-run', outputs: { inner_count: 'run_total' } }],
          }],
        }),
      ],
    });
    const result = await loadWorkflowWithDiagnostics(corpus, id);
    if (!result.success) throw new Error(`load failed: ${result.error.message}`);

    const steps = result.value.workflow.activities!.find((a) => a.id === 'host')!.steps!;
    const loop = steps[0] as Extract<Step, { kind: 'loop' }>;
    expect(loop.id).toBe('run.each');
    expect(loop.variable).toBe('host_run_current_item');
    const inner = (loop.steps as Step[])[0] as Extract<Step, { kind: 'action' }>;
    expect(inner.id).toBe('run.each.tally.count');
    // inner_count -> run_total (the nested binding) -> host_total (the site binding), in one pass.
    expect(inner.actions![0]!.target).toBe('host_total');
  });
});

describe('an activity with no routine loads exactly as it did', () => {
  it('is byte-identical through loadWorkflow', async () => {
    const steps = [
      { kind: 'technique', id: 'analyse', technique: 'group::analyse' },
      { kind: 'checkpoint', id: 'gate', message: 'Go?', options: [{ id: 'y', label: 'Yes' }] },
    ];
    const { corpus, id } = writeTree({ activities: [{ id: 'plain', steps }] });
    const result = await loadWorkflow(corpus, id);
    if (!result.success) throw new Error(`load failed: ${result.error.message}`);
    expect(result.value.activities!.find((a) => a.id === 'plain')!.steps).toEqual(steps);
  });
});
