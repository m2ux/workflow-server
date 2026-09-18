/**
 * Reading routine definitions off disk (#704).
 *
 * Separate from `routine-resolver.ts`, which is synchronous and pure over a `RoutineLookup` so the
 * async loaders and the synchronous guard scripts share one resolution semantics. This module is
 * the filesystem half: discovery of a workflow's `routines/` directory, and the closure that
 * pre-reads every workflow a set of references can name.
 *
 * It is its own module rather than part of the workflow loader because the contract derivation
 * needs it too, and the workflow loader already depends on the derivation.
 */
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Activity, populateStepIds } from '../schema/activity.schema.js';
import { type Routine, safeValidateRoutine } from '../schema/routine.schema.js';
import { parseDefinition } from '../utils/serialization.js';
import { type CorpusIndex, indexCorpus, namespaceLocation } from './corpus-index.js';
import {
  META_WORKFLOW_ID,
  type RoutineLookup,
  RoutineResolutionError,
  collectNestedRoutineRefs,
  parseRoutineRef,
} from './routine-resolver.js';

/** The directory a workflow declares its routines in, beside `activities/`. */
export const ROUTINES_DIR = 'routines';

const formatZodIssues = (issues: Array<{ path: PropertyKey[]; message: string }>): string =>
  issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');

/**
 * Read a workflow's `routines/` directory: one file per routine, named for the routine it declares,
 * with no position number because a routine holds no place in an order.
 *
 * The filename is the name every reference resolves, so the file's own `id` has to agree with it —
 * the same identity rule a workflow directory carries, and for the same reason: a reference reaches
 * the routine by its filename while the definition publishes its declaration. Returns an empty map
 * where the workflow has no `routines/`, so a corpus that declares none costs one `existsSync`.
 */
export async function readWorkflowRoutines(
  workflowDir: string,
  workflowId: string,
  index: CorpusIndex = indexCorpus(workflowDir),
): Promise<ReadonlyMap<string, Routine>> {
  const routines = new Map<string, Routine>();
  const dir = namespaceLocation(index, workflowId)?.dir;
  if (!dir) return routines;
  const routinesPath = join(dir, ROUTINES_DIR);
  if (!existsSync(routinesPath)) return routines;

  for (const file of await readdir(routinesPath)) {
    const name = /^(.+)\.ya?ml$/.exec(file)?.[1];
    if (!name) continue;
    const content = await readFile(join(routinesPath, file), 'utf-8');
    const validation = safeValidateRoutine(parseDefinition(content));
    if (!validation.success) {
      throw new RoutineResolutionError(
        `Routine '${workflowId}::${name}' (${ROUTINES_DIR}/${file}) is not a valid routine: `
        + formatZodIssues(validation.error.issues),
      );
    }
    if (validation.data.id !== name) {
      throw new RoutineResolutionError(
        `Routine ${ROUTINES_DIR}/${file} in workflow '${workflowId}' declares id '${validation.data.id}' `
        + `but sits in a file named '${name}' — a reference reaches a routine by its filename, so the two names have to match.`,
      );
    }
    populateStepIds({ id: validation.data.id, steps: validation.data.steps } as Activity);
    routines.set(name, validation.data);
  }
  return routines;
}

/**
 * Build a synchronous RoutineLookup covering every workflow a set of references can name — the
 * declaring scopes, the meta fallback, and any workflow a qualified reference targets. Closed over
 * the references the routines themselves make, so a nested reference into a third workflow resolves.
 */
export async function buildRoutineLookup(
  workflowDir: string,
  scopeWorkflowIds: Iterable<string>,
  refs: Iterable<string>,
): Promise<RoutineLookup> {
  const index = indexCorpus(workflowDir);
  const loaded = new Map<string, ReadonlyMap<string, Routine>>();
  const pending = new Set<string>([META_WORKFLOW_ID, ...scopeWorkflowIds]);
  const noteRef = (ref: string): void => {
    try {
      const { namespace } = parseRoutineRef(ref, 'Routine lookup');
      if (namespace && !loaded.has(namespace)) pending.add(namespace);
    } catch {
      // Malformed: surfaces as a resolution error at materialisation, where the site is known.
    }
  };
  for (const ref of refs) noteRef(ref);

  // A routine may refer to another, so reading one workflow's routines can name a workflow nothing
  // has read yet. The walk closes over that rather than assuming one level.
  while (pending.size > 0) {
    const batch = [...pending];
    pending.clear();
    await Promise.all(batch.map(async (id) => {
      if (loaded.has(id)) return;
      loaded.set(id, await readWorkflowRoutines(workflowDir, id, index));
    }));
    for (const id of batch) {
      for (const routine of loaded.get(id)?.values() ?? []) {
        for (const ref of collectNestedRoutineRefs(routine)) noteRef(ref);
      }
    }
  }
  return (workflowId) => loaded.get(workflowId);
}

/**
 * Every workflow in the corpus that declares at least one routine, with what it declares, and the
 * workflows whose `routines/` could not be read.
 *
 * A corpus-wide sweep reports rather than aborts: a single unreadable file is a defect to name, and
 * a reader that threw would take the whole sweep down and report nothing at all — including for the
 * files that are fine. The per-workflow read still throws, because a LOAD wants the failure loud.
 */
export async function readCorpusRoutines(
  workflowDir: string,
  index: CorpusIndex = indexCorpus(workflowDir),
): Promise<{ byWorkflow: Map<string, ReadonlyMap<string, Routine>>; errors: Array<{ workflowId: string; error: string }> }> {
  const byWorkflow = new Map<string, ReadonlyMap<string, Routine>>();
  const errors: Array<{ workflowId: string; error: string }> = [];
  // Keyed by name, which is the spelling a caller enumerating the corpus holds. A namespace whose
  // name two directories claim is absent here for the same reason it is absent from resolution.
  await Promise.all([...index.namespacesByName.keys()].map(async (id) => {
    try {
      const routines = await readWorkflowRoutines(workflowDir, id, index);
      if (routines.size > 0) byWorkflow.set(id, routines);
    } catch (error) {
      errors.push({ workflowId: id, error: error instanceof Error ? error.message : String(error) });
    }
  }));
  return { byWorkflow, errors };
}
