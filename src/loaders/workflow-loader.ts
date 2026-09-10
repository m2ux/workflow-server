import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import {
  type Destination,
  type InstanceFan,
  type Workflow,
  type WorkflowFragments,
  WorkflowFragmentsSchema,
  branchKey,
  destinationTargets,
  instanceFans,
  isFan,
  safeValidateWorkflow,
} from '../schema/workflow.schema.js';
import { type Activity, type Step, safeValidateActivity, populateStepIds, activityCheckpoints, flattenActivitySteps } from '../schema/activity.schema.js';
import { VariableNameSchema } from '../schema/variable.schema.js';
import { DEFAULT_FAN_MAX_BRANCHES } from '../config.js';
import { type Result, ok, err } from '../result.js';
import { WorkflowNotFoundError, WorkflowValidationError, ActivityNotFoundError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import { parseDefinition } from '../utils/serialization.js';
import { parseActivityFilename } from './filename-utils.js';
import { mergeActivityVariables } from '../utils/activity-variables.js';
import {
  META_WORKFLOW_ID,
  type FragmentsLookup,
  parseFragmentRef,
  collectCheckpointRefs,
  materializeActivityFragments,
} from './fragment-resolver.js';

export interface WorkflowManifestEntry { id: string; title: string; version: string; tags?: string[] | undefined; }

/**
 * A definition file that failed to load (unreadable, unparsable, or schema-invalid) and was
 * excluded from the result. Loaders collect these instead of only logging, so `get_workflow` /
 * `list_workflows` can surface the failure in their payloads rather than silently skipping
 * (issue #166 B5 — a dropped activity otherwise resurfaces much later as "Activity not found").
 */
export interface DefinitionLoadError { file: string; activity_id?: string | undefined; error: string; }

/** A loaded workflow plus the per-file activity-load failures excluded from it. */
export interface WorkflowWithDiagnostics {
  workflow: Workflow;
  activityLoadErrors: DefinitionLoadError[];
  /**
   * Activity id → the workflow the activity file was authored in. Differs from the loaded
   * workflow's id only for borrowed cross-workflow activities; it scopes those activities'
   * unqualified technique refs (and fragment refs) to their source workflow.
   */
  activitySourceWorkflow: Map<string, string>;
}

const formatZodIssues = (issues: Array<{ path: PropertyKey[]; message: string }>): string =>
  issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');

/** Raw workflow before activity loading */
interface RawWorkflow {
  id: string;
  version: string;
  title: string;
  description?: string;
  activitiesDir?: string;
  initialActivity?: string;
  [key: string]: unknown;
}

/**
 * Load activities from a directory
 */
async function loadActivitiesFromDir(activitiesPath: string): Promise<{ activities: Activity[]; errors: DefinitionLoadError[] }> {
  if (!existsSync(activitiesPath)) return { activities: [], errors: [] };

  const files = await readdir(activitiesPath);
  const activities: Activity[] = [];
  const errors: DefinitionLoadError[] = [];

  for (const file of files) {
    const parsed = parseActivityFilename(file);
    if (!parsed) continue;

    try {
      const content = await readFile(join(activitiesPath, file), 'utf-8');
      const decoded = parseDefinition(content);

      const validation = safeValidateActivity(decoded);
      if (!validation.success) {
        logWarn('Skipping invalid activity', { activityId: parsed.id, errors: validation.error.issues });
        errors.push({ file, activity_id: parsed.id, error: formatZodIssues(validation.error.issues) });
        continue;
      }
      const activity = validation.data;
      populateStepIds(activity);
      activity.artifactPrefix = parsed.index;
      activities.push(activity);
    } catch (error) {
      logWarn('Failed to load activity', { file, error: error instanceof Error ? error.message : 'Unknown error' });
      errors.push({ file, activity_id: parsed.id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  activities.sort((a, b) =>
    (a.artifactPrefix ?? '').localeCompare(b.artifactPrefix ?? '')
  );
  return { activities, errors };
}

/** Definition file extensions, in resolution priority. */
const DEFINITION_EXTENSIONS = ['yaml', 'yml'] as const;

/**
 * Resolve the path to a workflow file.
 * Supports two directory structures:
 * 1. Subdirectory (preferred): {workflowDir}/{workflowId}/workflow.{yaml|yml}
 * 2. Root-level (legacy): {workflowDir}/{workflowId}.{yaml|yml}
 */
function resolveWorkflowPath(workflowDir: string, workflowId: string): string | null {
  // Try subdirectory first (preferred pattern)
  for (const ext of DEFINITION_EXTENSIONS) {
    const subPath = join(workflowDir, workflowId, `workflow.${ext}`);
    if (existsSync(subPath)) return subPath;
  }

  // Fall back to root-level (legacy)
  for (const ext of DEFINITION_EXTENSIONS) {
    const rootPath = join(workflowDir, `${workflowId}.${ext}`);
    if (existsSync(rootPath)) return rootPath;
  }

  return null;
}

/**
 * Resolve a shorthand activity reference like "work-package/02-design-philosophy.yaml"
 * or local references like "01-start-work-package.yaml".
 */
async function resolveActivityReference(workflowDir: string, workflowId: string, ref: string): Promise<{ activity: Activity; sourceWorkflowId: string } | null> {
  const parts = ref.split('/');

  let targetWorkflowId: string;
  let filename: string;

  if (parts.length === 1) {
    // Local reference within the same workflow (e.g., "01-start.yaml")
    targetWorkflowId = workflowId;
    filename = parts[0] || '';
  } else {
    // Cross-workflow reference (e.g., "work-package/02-design.yaml" or "work-package/activities/02-design.yaml")
    targetWorkflowId = parts[0] || '';
    filename = parts.slice(1).join('/');
  }
  
  // Assumes the standard structure: workflows/{workflowId}/activities/{filename}
  // The shorthand usually omits 'activities/', so we add it if missing
  const isActivitiesDirIncluded = filename.startsWith('activities/');
  const activityPath = isActivitiesDirIncluded
    ? join(workflowDir, targetWorkflowId, filename)
    : join(workflowDir, targetWorkflowId, 'activities', filename);
    
  if (!existsSync(activityPath)) return null;
  
  try {
    const content = await readFile(activityPath, 'utf-8');
    const decoded = parseDefinition(content);
    
    const validation = safeValidateActivity(decoded);
    if (!validation.success) {
      logWarn('Invalid referenced activity', { ref, errors: validation.error.issues });
      return null;
    }
    
    const activity = validation.data;
    populateStepIds(activity);

    // Attempt to parse prefix from filename
    const actualFilename = filename.split('/').pop() || '';
    const parsed = parseActivityFilename(actualFilename);
    if (parsed) {
      activity.artifactPrefix = parsed.index;
    }

    // The source workflow scopes the activity's bare fragment refs: a borrowed activity
    // resolves them against the workflow it was authored in, not the borrower.
    return { activity, sourceWorkflowId: targetWorkflowId };
  } catch (error) {
    logWarn('Failed to load referenced activity', { ref, error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

/**
 * Read just the `fragments` block of a workflow's definition file (#166 B10). Reads the raw file
 * rather than loading the workflow — fragment resolution must not recurse into full loads (a
 * cross-workflow ref would otherwise re-enter loadWorkflow). Returns undefined when the workflow
 * or its fragments block is absent; an unparsable file or invalid block also resolves to
 * undefined (the referencing workflow then reports the unresolved ref, naming the source).
 */
export async function readWorkflowFragments(workflowDir: string, workflowId: string): Promise<WorkflowFragments | undefined> {
  const filePath = resolveWorkflowPath(workflowDir, workflowId);
  if (!filePath) return undefined;
  try {
    const raw = parseDefinition(await readFile(filePath, 'utf-8')) as Record<string, unknown> | null;
    if (!raw || raw['fragments'] === undefined) return undefined;
    const parsed = WorkflowFragmentsSchema.safeParse(raw['fragments']);
    if (!parsed.success) {
      logWarn('Invalid fragments block; refs into it will not resolve', { workflowId, errors: parsed.error.issues });
      return undefined;
    }
    return parsed.data;
  } catch (error) {
    logWarn('Failed to read workflow fragments', { workflowId, error: error instanceof Error ? error.message : String(error) });
    return undefined;
  }
}

/**
 * Build a synchronous FragmentsLookup covering every workflow a set of refs (plus the declaring
 * scopes and the meta fallback) can name, pre-reading each fragments block once.
 */
export async function buildFragmentsLookup(
  workflowDir: string,
  scopeWorkflowIds: Iterable<string>,
  refs: Iterable<string>,
): Promise<FragmentsLookup> {
  const wanted = new Set<string>([META_WORKFLOW_ID, ...scopeWorkflowIds]);
  for (const ref of refs) {
    try {
      const { workflowId } = parseFragmentRef(ref);
      if (workflowId) wanted.add(workflowId);
    } catch {
      // Malformed ref: surfaces as a resolution error at materialization, not here.
    }
  }
  const fragments = new Map<string, WorkflowFragments | undefined>();
  await Promise.all(
    [...wanted].map(async (id) => fragments.set(id, await readWorkflowFragments(workflowDir, id))),
  );
  return (workflowId) => fragments.get(workflowId);
}

export async function loadWorkflow(workflowDir: string, workflowId: string): Promise<Result<Workflow, WorkflowNotFoundError | WorkflowValidationError>> {
  const result = await loadWorkflowWithDiagnostics(workflowDir, workflowId);
  return result.success ? ok(result.value.workflow) : result;
}

/**
 * Load a workflow and report the activity files that failed to load alongside it. Same contract
 * as `loadWorkflow`, but per-file activity failures (which do not fail the workflow) are returned
 * instead of only logged.
 */
export async function loadWorkflowWithDiagnostics(workflowDir: string, workflowId: string): Promise<Result<WorkflowWithDiagnostics, WorkflowNotFoundError | WorkflowValidationError>> {
  const filePath = resolveWorkflowPath(workflowDir, workflowId);
  if (!filePath) return err(new WorkflowNotFoundError(workflowId));
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const rawWorkflow = parseDefinition(content) as RawWorkflow;
    
    // Load activities from directory if not inline or resolve shorthand string refs
    const existingActivities = rawWorkflow['activities'] as (Activity | string)[] | undefined;
    let resolvedActivities: Activity[] = [];
    
    // Always attempt to load from local activities directory first
    const workflowDirPath = dirname(filePath);
    const activitiesDirName = rawWorkflow.activitiesDir ?? 'activities';
    const activitiesPath = join(workflowDirPath, activitiesDirName);
    
    const { activities: localActivities, errors: activityLoadErrors } = await loadActivitiesFromDir(activitiesPath);
    if (localActivities.length > 0) {
      resolvedActivities = [...localActivities];
      logInfo('Loaded local activities from directory', { workflowId, activitiesDir: activitiesDirName, count: localActivities.length });
    }

    // Fragment scope per activity: local activities resolve bare refs against this workflow;
    // borrowed cross-workflow activities against their source workflow (#166 B10).
    const activitySourceWorkflow = new Map<string, string>(resolvedActivities.map(a => [a.id, workflowId]));

    if (existingActivities && existingActivities.length > 0) {
      // Resolve any string shorthand references to full Activity objects
      const explicitlyReferencedActivities = await Promise.all(
        existingActivities.map(async (activityOrRef) => {
          if (typeof activityOrRef === 'string') {
            const resolved = await resolveActivityReference(workflowDir, workflowId, activityOrRef);
            if (!resolved) {
              throw new Error(`Failed to resolve activity reference: ${activityOrRef}`);
            }
            activitySourceWorkflow.set(resolved.activity.id, resolved.sourceWorkflowId);
            return resolved.activity;
          }
          return activityOrRef;
        })
      );

      // Add explicitly referenced activities, avoiding duplicates based on ID
      for (const explicitActivity of explicitlyReferencedActivities) {
        if (!resolvedActivities.some(a => a.id === explicitActivity.id)) {
          resolvedActivities.push(explicitActivity);
        }
      }
    }

    if (resolvedActivities.length > 0) {
       rawWorkflow['activities'] = resolvedActivities;
    }

    // Clean up non-schema property
    if (rawWorkflow.activitiesDir) {
      delete rawWorkflow.activitiesDir;
    }

    const result = safeValidateWorkflow(rawWorkflow);
    if (!result.success) {
      return err(new WorkflowValidationError(workflowId, result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)));
    }
    const workflow = result.data;

    // Materialize fragment references (#166 B10): rule `{ ref }` entries splice to their texts and
    // checkpoint ref steps take their fragment's body, so every downstream reader — tool payloads,
    // checkpoint yield/respond, guards — sees plain rules and full checkpoint steps. The lookup is
    // scoped to what the refs can actually name: the current workflow's fragments come from the
    // parsed object, other workflow.yaml files are read only when a qualified ref targets them or
    // a bare ref misses locally (meta fallback) — a workflow whose refs all resolve locally costs
    // no extra reads on the per-call load path.
    const wanted = new Set<string>();
    const noteRef = (ref: string, scopeWf: string): void => {
      try {
        const { workflowId: qualified, name } = parseFragmentRef(ref);
        if (qualified) { if (qualified !== workflowId) wanted.add(qualified); return; }
        if (scopeWf !== workflowId) { wanted.add(scopeWf); wanted.add(META_WORKFLOW_ID); return; }
        if (workflow.fragments?.checkpoints?.[name] === undefined) wanted.add(META_WORKFLOW_ID);
      } catch { /* malformed: surfaces at materialization */ }
    };
    for (const activity of workflow.activities ?? []) {
      const scope = activitySourceWorkflow.get(activity.id) ?? workflowId;
      for (const ref of collectCheckpointRefs(activity)) noteRef(ref, scope);
    }
    const fragmentCache = new Map<string, WorkflowFragments | undefined>([[workflowId, workflow.fragments]]);
    await Promise.all([...wanted].map(async (id) => fragmentCache.set(id, await readWorkflowFragments(workflowDir, id))));
    const lookup: FragmentsLookup = (id) => fragmentCache.get(id);
    const materialized: Activity[] = [];
    for (const activity of workflow.activities ?? []) {
      try {
        // Also validates inline checkpoints (a step with neither ref nor body is rejected here,
        // not later at yield time).
        materializeActivityFragments(activity, lookup, activitySourceWorkflow.get(activity.id) ?? workflowId);
        materialized.push(activity);
      } catch (error) {
        // Same contract as a per-file load failure: exclude the activity and surface the error
        // (#166 B5) instead of letting an unmaterialized checkpoint fail later downstream.
        const message = error instanceof Error ? error.message : String(error);
        logWarn('Excluding activity with unresolvable fragments', { workflowId, activityId: activity.id, error: message });
        activityLoadErrors.push({ file: `${activity.artifactPrefix ?? ''}${activity.artifactPrefix ? '-' : ''}${activity.id}.yaml`, activity_id: activity.id, error: message });
      }
    }
    if (workflow.activities) workflow.activities = materialized;

    // Contribute each activity's write declarations to the workflow's variable set (#493). Being
    // in the workflow IS the registration: everything downstream — seeding, declared-type validation,
    // the get_workflow payload — reads one merged set, and a name two activities declare is one
    // variable. A pair that disagrees on type or default is a contradiction, and a session seeded
    // from either reading would be wrong, so the workflow does not load.
    // Contribution stays per workflow: the same activity keeps contributing its writes flat in a
    // workflow whose graph does not fan it, so an activity is borrowable into a fanning graph and
    // a non-fanning one without carrying either shape in its own file.
    const fanned = new Set(fanGroups(workflow).flatMap((fan) => fan.branches));
    const merged = mergeActivityVariables(workflow.variables, workflow.activities, fanned);
    if (merged.contradictions.length > 0) {
      return err(new WorkflowValidationError(
        workflowId,
        merged.contradictions.map((c) => `variable ${c.detail}`),
      ));
    }
    if (merged.variables.length > 0) workflow.variables = merged.variables;

    // The exits and the graph that binds them are authored in different files, so the load is where
    // they have to agree. Checked after materialization: a ref-form checkpoint's options are the
    // fragment's, and the exit each selects has to be one the activity running it declares.
    const knownActivityIds = new Set([
      ...(workflow.activities ?? []).map(a => a.id),
      ...activityLoadErrors.map(e => e.activity_id).filter((id): id is string => id !== undefined),
    ]);
    const bindingErrors = validateExitBindings(workflow, knownActivityIds);
    if (bindingErrors.length > 0) return err(new WorkflowValidationError(workflowId, bindingErrors));

    logInfo('Workflow loaded', { workflowId, version: workflow.version, activityCount: workflow.activities?.length ?? 0 });
    return ok({ workflow, activityLoadErrors, activitySourceWorkflow });
  } catch (error) {
    logError('Failed to load workflow', error instanceof Error ? error : undefined, { workflowId });
    return err(new WorkflowValidationError(workflowId, [error instanceof Error ? error.message : 'Unknown error']));
  }
}

export async function listWorkflows(workflowDir: string): Promise<WorkflowManifestEntry[]> {
  return (await listWorkflowsWithDiagnostics(workflowDir)).workflows;
}

/**
 * List workflow manifests and report the definition files that failed to yield one — unreadable
 * or unparsable `workflow.yaml`, or a manifest missing the required id/title/version fields —
 * instead of silently skipping them.
 */
export async function listWorkflowsWithDiagnostics(workflowDir: string): Promise<{ workflows: WorkflowManifestEntry[]; errors: DefinitionLoadError[] }> {
  if (!existsSync(workflowDir)) return { workflows: [], errors: [] };
  const errors: DefinitionLoadError[] = [];
  try {
    const entries = await readdir(workflowDir);
    const manifests: WorkflowManifestEntry[] = [];

    for (const entry of entries) {
      if (entry === META_WORKFLOW_ID) continue;
      const entryPath = join(workflowDir, entry);
      const stats = await stat(entryPath);
      
      let defPath: string | null = null;
      if (stats.isFile() && /\.ya?ml$/.test(entry)) {
        defPath = entryPath;
      } else if (stats.isDirectory()) {
        for (const ext of DEFINITION_EXTENSIONS) {
          const subWorkflowPath = join(entryPath, `workflow.${ext}`);
          if (existsSync(subWorkflowPath)) {
            defPath = subWorkflowPath;
            break;
          }
        }
      }

      if (defPath) {
        try {
          const content = await readFile(defPath, 'utf-8');
          const raw = parseDefinition(content) as RawWorkflow;
          if (raw.id && raw.title && raw.version) {
            manifests.push({ id: raw.id, title: raw.title, version: raw.version, tags: Array.isArray(raw['tags']) ? raw['tags'] as string[] : undefined });
          } else {
            logWarn('Workflow manifest missing required fields', { path: defPath });
            errors.push({ file: defPath, error: 'manifest missing required fields (id, title, version)' });
          }
        } catch (error) {
          logWarn('Failed to read workflow manifest', { path: defPath, error: error instanceof Error ? error.message : String(error) });
          errors.push({ file: defPath, error: error instanceof Error ? error.message : String(error) });
        }
      }
    }

    return { workflows: manifests, errors };
  } catch (error) {
    logWarn('Failed to list workflows', { workflowDir, error: error instanceof Error ? error.message : String(error), code: error instanceof Error && 'code' in error ? (error as NodeJS.ErrnoException).code : undefined });
    errors.push({ file: workflowDir, error: error instanceof Error ? error.message : String(error) });
    return { workflows: [], errors };
  }
}

/**
 * Get an activity from a workflow by ID. An exact id match wins; otherwise an instance-qualified
 * id (`<baseId>#<instance>`) resolves to its base definition, so N instances of one fanned activity
 * share one definition while being recorded, validated and accounted for distinctly.
 */
export function getActivity(workflow: Workflow, activityId: string): Activity | undefined {
  return workflow.activities?.find(a => a.id === activityId)
    ?? workflow.activities?.find(a => a.id === baseId(activityId));
}

/**
 * The separator between a base id and its per-instance discriminator. One definition reached
 * several times — a checkpoint inside a loop body, an activity the graph fans over a collection —
 * is named `<baseId>#<instance>` so that each reach is a distinct id: a distinct checkpoint
 * response key, a distinct frontier entry, a distinct history event, a distinct usage row. The
 * base is what matches the single definition.
 */
export const INSTANCE_SEPARATOR = '#';

/** The base id — the portion before the per-instance discriminator, if any. */
export function baseId(qualifiedId: string): string {
  const i = qualifiedId.indexOf(INSTANCE_SEPARATOR);
  return i === -1 ? qualifiedId : qualifiedId.slice(0, i);
}

/** A fan instance's index, where the discriminator is one. */
export function instanceIndex(qualifiedId: string): number | undefined {
  const i = qualifiedId.indexOf(INSTANCE_SEPARATOR);
  if (i === -1) return undefined;
  const raw = qualifiedId.slice(i + 1);
  return /^\d+$/.test(raw) ? Number(raw) : undefined;
}

/**
 * Get a checkpoint from an activity (the inline kind:checkpoint step). An exact id match wins;
 * otherwise an instance-qualified id (`<baseId>#<instance>`) resolves to its base definition, so a
 * loop-body checkpoint yielded once per iteration shares one definition while recording a distinct
 * response per instance. The definition's own id may itself be a plain base (`assumption-decision`)
 * or a template (`assumption-decision#{current_assumption.id}`); both compare on their base.
 */
export function getCheckpoint(workflow: Workflow, activityId: string, checkpointId: string) {
  const activity = getActivity(workflow, activityId);
  if (!activity) return undefined;
  const defs = activityCheckpoints(activity);
  const exact = defs.find(c => c.id === checkpointId);
  if (exact) return exact;
  // No exact match: compare on base ids, so an instance-qualified query resolves to its base
  // definition (and a plain base query resolves to a templated definition). A base that matches no
  // definition still returns undefined — base equality is on the full pre-`#` segment, not a prefix.
  const base = baseId(checkpointId);
  return defs.find(c => baseId(c.id) === base);
}

export interface ExitBinding {
  /** The exit's name in the activity's own vocabulary. */
  exit: string;
  /**
   * Where the workflow binds it — an activity id, TERMINAL_SENTINEL, a list of members the run
   * opens together, or one activity with the collection to run it over. `destinationTargets`
   * flattens any of them to the activities the run can land on.
   */
  to: Destination;
  /** The inline expression selecting this exit, when it has one. */
  when?: string | undefined;
  /** The outcome when nothing else selected an exit. */
  isDefault?: boolean | undefined;
  /** Selecting this exit at a checkpoint ends the step sequence there. */
  immediate?: boolean | undefined;
}

/**
 * The activity's exits as the workflow binds them: each declared outcome paired with the
 * destination the graph gives it. The one place the two halves of the routing meet — every reader
 * that needs to know where an activity can go reads this, or `exitDestinations` for the bare list.
 * An exit the graph does not bind is absent here; the load-time check is what stops that happening.
 */
export function getExitBindings(workflow: Workflow, fromActivityId: string): ExitBinding[] {
  const activity = getActivity(workflow, fromActivityId);
  if (!activity) return [];
  // The graph is keyed by the activity's own id, so an instance-qualified caller reads its base's
  // bindings: N instances of one fanned activity share that activity's exits and its one join.
  const bound = workflow.graph?.[baseId(fromActivityId)] ?? {};
  return (activity.exits ?? [])
    .filter(e => bound[e.id] !== undefined)
    .map(e => ({ exit: e.id, to: bound[e.id]!, when: e.when, isDefault: e.isDefault, immediate: e.immediate }));
}

/** The activities an activity can reach, flattened across every fan member and deduped. */
export function exitDestinations(workflow: Workflow, fromActivityId: string): string[] {
  return [...new Set(getExitBindings(workflow, fromActivityId).flatMap(b => destinationTargets(b.to)))];
}

/**
 * Every activity the graph names as a destination, flattened across every fan member — so a branch
 * head of a fan is in the set exactly as a plain destination is.
 */
export function reachableActivities(workflow: Workflow): Set<string> {
  const reached = new Set<string>();
  for (const bindings of Object.values(workflow.graph ?? {})) {
    for (const destination of Object.values(bindings)) {
      for (const target of destinationTargets(destination)) reached.add(target);
    }
  }
  return reached;
}

/**
 * One fan the graph declares: where it is bound, the branches it opens, and the activity its
 * branches converge on. Derived from the graph object and nothing else — no activity lookup and no
 * file access — so the join has exactly one derivation and the loader keeps sole ownership of
 * agreement between the graph and the activities. `join` is undefined where the branches disagree,
 * name more than one destination each, or name none; an undefined join fails the load, which is
 * why every reader downstream takes the join as a string on the load's authority.
 */
export interface FanGroup {
  /** The activity whose exit opens the fan. */
  source: string;
  /** The exit that fans. */
  exit: string;
  /** The destination exactly as the graph names it. */
  destination: Destination;
  /** The branch activities in graph order, each named once. */
  branches: string[];
  /** The activity every branch's own exits name, or undefined where they do not agree on one. */
  join: string | undefined;
}

/** Every fan the graph declares, in graph order. */
export function fanGroups(workflow: Workflow): FanGroup[] {
  const graph = workflow.graph ?? {};
  const groups: FanGroup[] = [];
  for (const [source, bindings] of Object.entries(graph)) {
    for (const [exit, destination] of Object.entries(bindings)) {
      if (!isFan(destination)) continue;
      const branches = [...new Set(destinationTargets(destination))];
      const named = new Set<string>();
      for (const branch of branches) {
        for (const to of Object.values(graph[branch] ?? {})) {
          for (const target of destinationTargets(to)) named.add(target);
        }
      }
      groups.push({
        source,
        exit,
        destination,
        branches,
        join: named.size === 1 ? [...named][0]! : undefined,
      });
    }
  }
  return groups;
}

/**
 * Check the activities and the graph against each other. The two halves of the routing are
 * authored in different files, so the load is where they have to agree: an exit no one bound is a
 * dead end the reader cannot see, and a binding naming an exit or a destination that does not exist
 * is a graph describing a workflow other than this one. Both fail the load rather than warning,
 * because a session cannot be walked through a graph with a hole in it.
 *
 * `knownActivityIds` is the loaded activities plus the ones whose files failed to load — a binding
 * to an activity excluded by its own load error is that error's business, not a second report.
 */
export function validateExitBindings(workflow: Workflow, knownActivityIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const graph = workflow.graph ?? {};

  for (const activity of workflow.activities ?? []) {
    const exits = activity.exits ?? [];
    const bound = graph[activity.id] ?? {};

    const seen = new Set<string>();
    for (const exit of exits) {
      if (seen.has(exit.id)) errors.push(`Activity '${activity.id}' declares exit '${exit.id}' twice.`);
      seen.add(exit.id);
      if (bound[exit.id] === undefined) {
        errors.push(`Activity '${activity.id}' exit '${exit.id}' is unbound: add '${activity.id}.${exit.id}' to the workflow's graph.`);
      }
    }

    const defaults = exits.filter(e => e.isDefault);
    if (exits.length > 1 && defaults.length !== 1) {
      errors.push(
        `Activity '${activity.id}' declares ${exits.length} exits and ${defaults.length} defaults; exactly one must be isDefault, so a dismissed checkpoint and an unmatched predicate both resolve to a named exit.`,
      );
    }

    for (const checkpoint of activityCheckpoints(activity)) {
      for (const option of checkpoint.options) {
        const exit = option.effect?.exit;
        if (exit !== undefined && !seen.has(exit)) {
          errors.push(`Activity '${activity.id}' checkpoint '${checkpoint.id}' option '${option.id}' selects exit '${exit}', which the activity does not declare.`);
        }
      }
    }
  }

  for (const [activityId, bindings] of Object.entries(graph)) {
    if (!knownActivityIds.has(activityId)) {
      errors.push(`Workflow graph binds activity '${activityId}', which this workflow does not contain.`);
      continue;
    }
    const activity = getActivity(workflow, activityId);
    const declared = new Set((activity?.exits ?? []).map(e => e.id));
    for (const [exitId, destination] of Object.entries(bindings)) {
      if (activity && !declared.has(exitId)) {
        errors.push(`Workflow graph binds '${activityId}.${exitId}', which that activity does not declare as an exit.`);
      }
      // L1, one message per target: a fan's branches are destinations exactly as a plain id is.
      for (const target of destinationTargets(destination)) {
        if (target !== TERMINAL_SENTINEL && !knownActivityIds.has(target)) {
          errors.push(`Workflow graph sends '${activityId}.${exitId}' to '${target}', which this workflow does not contain.`);
        }
      }
    }
  }

  for (const fan of fanGroups(workflow)) errors.push(...fanErrors(workflow, fan));

  return errors;
}

/**
 * Operations a fan's branch cannot execute whatever its destination declares, so a fanned activity
 * binding one fails the load rather than failing inside a worker. Both are refused for what the
 * instances share beyond their checkouts: the persist operation writes the session record and the
 * planning folder, and the child-workflow dispatch records one activity id where a fan holds
 * several in flight.
 *
 * The version-control group is the conditional case and is handled at the rule rather than here.
 * It is refused where a fan's branches share one working tree and one git index — a commit derives
 * its paths from that tree's status, so no instance could stage or attribute its own change — and
 * permitted where the fanned activity binds the operation that gives each instance a checkout of
 * its own.
 */
const OPERATIONS_A_BRANCH_CANNOT_EXECUTE: ReadonlyMap<string, string> = new Map([
  [
    'workflow-engine::commit-and-persist',
    'This operation persists the session record and the planning folder, which every instance of a fan shares however their checkouts are split — so the instances would each commit a folder their siblings are still writing. Persist once, at the activity the fan converges on. Taking a checkout of its own does not admit it either: what that splits is the working tree, not the record.',
  ],
  [
    'workflow-engine::handle-sub-workflow',
    'Creating a child session records one activity id and a fan holds several in flight, so the call is refused at run time — settled here rather than left for a worker to discover.',
  ],
]);

/** The version-control group stages and commits, so none of its operations is executable in a branch. */
const CHECKOUT_GROUP_PREFIX = 'version-control::';

/**
 * The operation that gives a branch a checkout of its own, and so the evidence that lifts the
 * checkout-group refusal for it. An activity binding this materialises a worktree per instance —
 * named from the instance index the delivery carries — and commits into that rather than into the
 * tree its siblings are writing.
 */
const WORKTREE_OPERATION = 'version-control::create-worktree';

/** The operation a technique step binds, whether the step names it plainly or deviates from it. */
function boundOperation(step: Step): string | undefined {
  if (step.kind !== 'technique') return undefined;
  return typeof step.technique === 'string' ? step.technique : step.technique.name;
}

/** Every string an activity's steps carry, so a token authored anywhere in one is visible here. */
function stepStrings(activity: Activity): string[] {
  const out: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === 'string') { out.push(value); return; }
    if (Array.isArray(value)) { for (const item of value) walk(item); return; }
    if (value && typeof value === 'object') { for (const item of Object.values(value)) walk(item); }
  };
  walk(activity.steps);
  walk(activity.exits);
  return out;
}

/**
 * The rules a fan answers to, all decidable from the graph object plus the activities the workflow
 * already holds. Every message names the fan as `<source>.<exit>` and names the offending activity,
 * so the author's fix site is in the message. Putting them here and only here is what lets every
 * reader downstream assume a well-formed fan: a malformed one cannot be walked at all, so a guard
 * would let a session start on a graph the guard rejects.
 */
function fanErrors(workflow: Workflow, fan: FanGroup): string[] {
  const errors: string[] = [];
  const site = `'${fan.source}.${fan.exit}'`;
  const graph = workflow.graph ?? {};
  const members = Array.isArray(fan.destination) ? fan.destination : [fan.destination];

  // L2 — a list names no activity twice, counting the activity each instance-fan member runs. Two
  // members over one activity would derive one branch key and write one container.
  const counts = new Map<string, number>();
  for (const member of members) {
    for (const target of destinationTargets(member)) counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  for (const [target, count] of counts) {
    if (count < 2) continue;
    errors.push(
      `Workflow graph fans ${site} to '${target}' ${count === 2 ? 'twice' : `${count} times`}. Each activity in a list appears once, whether as an id of its own or as the activity an instance-fan member runs; to run one activity once per work unit, name it with the collection it runs over in a single member.`,
    );
  }

  for (const branch of fan.branches) {
    // L3 — a branch that ends the run never returns, so the fan has no last branch.
    if (branch === TERMINAL_SENTINEL) {
      errors.push(
        `Workflow graph fans ${site} to '${TERMINAL_SENTINEL}'. Every branch of a fan returns to one destination, and an activity that ends the run never returns, so the fan would have no last branch to release its destination.`,
      );
      continue;
    }

    const bindings = graph[branch] ?? {};
    const bound = Object.entries(bindings);

    // L4 — the join is read off these bindings and nothing else declares it.
    if (bound.length === 0) {
      errors.push(
        `Activity '${branch}' is a branch of the fan at ${site} and binds no exit, so the fan has no destination to converge on. Give it an exit bound to the activity its siblings name.`,
      );
      continue;
    }

    for (const [exit, destination] of bound) {
      // L5 — a branch runs in one worker and returns to the join. Also rejects a branch that is
      // the fan's own source, that activity's exit being the fan itself.
      if (isFan(destination)) {
        errors.push(
          `Activity '${branch}' is a branch of the fan at ${site}, and its exit '${exit}' fans to '${destinationTargets(destination).join(', ')}'. A branch runs in one worker and returns to the join, so each of its exits names one destination.`,
        );
        continue;
      }
      // L6 — a retry belongs inside the branch as a loop step. Also rejects a join that is one of
      // its own branches, that branch's exits having to name itself.
      if (destination === branch) {
        errors.push(
          `Activity '${branch}' is a branch of the fan at ${site} and its exit '${exit}' returns to '${branch}'. A branch runs once and returns to the join, so a retry belongs inside the branch as a loop step.`,
        );
      }
    }

    // L9 — a session holds one outstanding decision at a time and every tool call is gated while
    // it is held, so a gate inside a fan stops its siblings.
    const branchActivity = getActivity(workflow, branch);
    if (branchActivity) {
      for (const step of flattenActivitySteps(branchActivity)) {
        if (step.kind !== 'checkpoint') continue;
        const remedy = instanceFans(fan.destination).some((m) => m.activity === branch)
          ? 'Move the gate to the activity before the fan or to the activity it converges on. Every instance of a fanned activity runs the same definition, so there is no instance to take out of the fan.'
          : 'Move the gate to the activity before the fan or to the activity it converges on, or take this activity out of the fan.';
        errors.push(
          `Activity '${branch}' is a branch of the fan at ${site} and declares checkpoint '${step.id}'. A session holds one outstanding decision at a time, and every tool call is gated while it is held, so a gate inside a fan stops its sibling branches. ${remedy}`,
        );
      }

      // L14 — decidable from the flattened steps and each step's bound operation name, with no
      // composed signatures. A branch that materialises a checkout of its own commits into that
      // one, so the shared-tree reason does not hold for it and the checkout group is legal there.
      // The evidence is the branch's own binding rather than a claim on the destination: an author
      // who wired the worktree has done the thing the exemption rests on, where an author who
      // declared an intention may not have. The session-level operations stay refused either way,
      // because the record and its planning folder are shared however the checkouts are split.
      const steps = flattenActivitySteps(branchActivity);
      const ownsItsCheckout = steps.some((step) => boundOperation(step) === WORKTREE_OPERATION);
      for (const step of steps) {
        const operation = boundOperation(step);
        if (operation === undefined || operation === WORKTREE_OPERATION) continue;
        const reason = OPERATIONS_A_BRANCH_CANNOT_EXECUTE.get(operation)
          ?? (!ownsItsCheckout && operation.startsWith(CHECKOUT_GROUP_PREFIX)
            ? `A fan's instances share one working tree and one git index, and a commit derives its paths from that tree's status, so no instance can stage or attribute its own change. Move the commit to the activity before the fan or to the activity it converges on, or bind '${WORKTREE_OPERATION}' in this activity so each instance commits a checkout of its own.`
            : undefined);
        if (reason === undefined) continue;
        errors.push(`Activity '${branch}' is fanned by ${site} and binds '${operation}'. ${reason}`);
      }
    }

    // L10 — a branch lands its outputs under a key derived from its activity id.
    const key = branchKey(branch);
    if (!VariableNameSchema.safeParse(key).success) {
      errors.push(
        `Activity '${branch}' is a branch of the fan at ${site}, and its branch key '${key}' is not a legal variable name. A branch lands its outputs under a key derived from its activity id, so an activity that runs in a fan carries an id beginning with a lowercase letter.`,
      );
    }
  }

  // L7 — every exit of every branch names one and the same activity: the join.
  if (fan.join === undefined) {
    const named = fan.branches
      .filter((branch) => branch !== TERMINAL_SENTINEL && Object.keys(graph[branch] ?? {}).length > 0)
      .map((branch) => {
        const targets = [...new Set(Object.values(graph[branch] ?? {}).flatMap(destinationTargets))];
        return `'${branch}' sends its exits to ${targets.map((t) => `'${t}'`).join(' and ')}`;
      });
    if (named.length > 0) {
      errors.push(
        `The fan at ${site} converges nowhere: ${named.join(', and ')}. Bind every exit of every branch to the one activity the fan converges on, which is what the run enters when the last branch returns.`,
      );
    }
  } else {
    // L8 — the destination is entered once after the last branch returns, and there is nothing to
    // enter at the end of a run.
    if (fan.join === TERMINAL_SENTINEL) {
      errors.push(
        `The fan at ${site} converges on '${TERMINAL_SENTINEL}'. A fan converges on an activity, because the destination is entered once after the last branch returns and there is nothing to enter at the end of the run.`,
      );
    }
    // L15 — a fan reached from its own meeting point opens again on every convergence. Satisfies
    // the nesting, self-routing, convergence and join-is-an-activity rules together, so it carries
    // a rule of its own.
    if (fan.join === fan.source) {
      errors.push(
        `The fan at ${site} converges on '${fan.source}', the activity whose exit opens it. A fan reached from its own meeting point opens again on every convergence, so the graph gives it no way to finish. Converge on an activity the fan does not come from.`,
      );
    }
  }

  const declaredNames = new Set((workflow.variables ?? []).map((v) => v.name));

  for (const member of instanceFans(fan.destination)) {
    errors.push(...instanceFanErrors(workflow, fan, member, declaredNames));
  }

  // L13 — an index above the operative ceiling addresses a slot the fan can never fill, which the
  // load can see. One-sided, because the collection's run-time length is not visible to it.
  for (const branch of fan.branches) {
    const key = branchKey(branch);
    const ceiling = effectiveCeiling(fan.destination, branch);
    const indexed = new RegExp(`\\b${key}\\.(\\d+)`, 'g');
    for (const activity of workflow.activities ?? []) {
      const reported = new Set<string>();
      for (const text of stepStrings(activity)) {
        for (const match of text.matchAll(indexed)) {
          const slot = Number(match[1]);
          if (slot < ceiling || reported.has(match[0])) continue;
          reported.add(match[0]);
          const reference = text.match(new RegExp(`${key}\\.${slot}[A-Za-z0-9_.]*`))?.[0] ?? match[0];
          errors.push(
            `Activity '${activity.id}' reads '${reference}'. The fan at ${site} admits ${ceiling} instances, so slot ${slot} is never filled. Hand the container whole to a gather rather than addressing a slot the fan cannot reach.`,
          );
        }
      }
    }
  }

  return errors;
}

/** The widest fan the destination admits for one branch: its own declared bound, or the default. */
function effectiveCeiling(destination: Destination, branch: string): number {
  for (const member of instanceFans(destination)) {
    if (member.activity === branch) return member.maxInstances ?? DEFAULT_FAN_MAX_BRANCHES;
  }
  return DEFAULT_FAN_MAX_BRANCHES;
}

/** The rules an instance-fan member answers to, applied per member so a list checks each of its own. */
function instanceFanErrors(
  workflow: Workflow,
  fan: FanGroup,
  member: InstanceFan,
  declaredNames: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const site = `'${fan.source}.${fan.exit}'`;
  const lead = `Workflow graph fans ${site} to '${member.activity}' over '${member.over}'`;
  const activity = getActivity(workflow, member.activity);

  // L11 — the parameter's name lives in the destination that supplies it and the activity that
  // reads it, and this rule keeps them in agreement. Two fans of one activity disagreeing about
  // the name each fail here, so no cross-fan comparison exists.
  if (activity && !(activity.variables?.reads ?? []).includes(member.variable)) {
    errors.push(
      `${lead}, handing each instance its element at '${member.variable}', which '${member.activity}' does not declare among the names it needs its workflow to supply.`,
    );
  }

  // L12 — a fan reads its collection out of the variable bag, so the collection is a variable some
  // activity in this graph writes. Checked at the head, so a dotted expression is checked correctly.
  const collectionHead = member.over.split('.')[0]!;
  if (!declaredNames.has(collectionHead)) {
    errors.push(
      `${lead}, which this workflow declares nowhere. A fan reads its collection out of the variable bag, so the collection is a variable some activity in this graph writes.`,
    );
  }

  // L16 — the parameter carries a name of its own. Against the collection, the projection would
  // stand where the collection stands; against a declared write, the parameter is a read-only
  // projection.
  if (member.variable === collectionHead) {
    errors.push(
      `${lead}, handing each instance its element at that same name. The projection would stand where the collection stands, so an instance asking for the collection would be handed its own element.`,
    );
  }
  const writesTheParameter = (activity?.variables?.writes ?? []).some((w) => w.name === member.variable);
  if (writesTheParameter) {
    errors.push(
      `${lead}, handing each instance its element at '${member.variable}', which '${member.activity}' also declares among its writes. The parameter is a read-only projection, so it is not a name the fanned activity writes.`,
    );
  }

  return errors;
}

/**
 * Canonical terminal sentinel. A transition whose target is this id ends the
 * workflow without resolving to a real activity: `next_activity` accepts it,
 * flips the session status to `completed`, and the workflow stops. Use it for
 * a terminal reached via an explicit transition (a default end-of-flow link or
 * an `abort` checkpoint option) where there is no terminal activity to land on.
 * A workflow that ends simply by having no outgoing transition (terminal-by-
 * omission) needs no sentinel. The `complete` and `end-workflow` real terminal
 * activities remain valid and unchanged.
 */
export const TERMINAL_SENTINEL = '__terminal__';

/**
 * Read raw activity definition (YAML) by ID. Validates but returns the original file content,
 * plus the workflow the file was authored in (`sourceWorkflowId` differs from `workflowId` for a
 * borrowed cross-workflow activity) — the scope the file's bare fragment refs resolve against.
 */
export async function readActivityRaw(
  workflowDir: string,
  workflowId: string,
  activityId: string,
): Promise<Result<{ content: string; sourceWorkflowId: string }, ActivityNotFoundError>> {
  const filePath = resolveWorkflowPath(workflowDir, workflowId);
  if (!filePath) return err(new ActivityNotFoundError(activityId, workflowId));

  const activitiesDir = join(dirname(filePath), 'activities');
  if (!existsSync(activitiesDir)) return err(new ActivityNotFoundError(activityId, workflowId));

  try {
    const files = await readdir(activitiesDir);
    for (const file of files) {
      const parsed = parseActivityFilename(file);
      if (!parsed || parsed.id !== activityId) continue;

      const content = await readFile(join(activitiesDir, file), 'utf-8');
      const decoded = parseDefinition(content);
      const validation = safeValidateActivity(decoded);
      if (!validation.success) {
        logWarn('Activity validation failed (raw read)', { activityId, errors: validation.error.issues });
        return err(new ActivityNotFoundError(activityId, workflowId));
      }
      return ok({ content, sourceWorkflowId: workflowId });
    }
  } catch (error) {
    logWarn('Failed to read activity raw', { activityId, workflowId, error: error instanceof Error ? error.message : String(error) });
  }

  // Fallback: a borrowed cross-workflow activity declared as a string ref in this workflow's
  // activities[] list (e.g. "work-package/02-design-philosophy.yaml"). The local-dir scan above
  // covers only the workflow's own activities; resolve the borrowed file so a raw read returns the
  // same definition loadWorkflow already merges into the activity set — keeping get_activity in
  // step with the workflow summary and next_activity for workflows that compose another's activities.
  try {
    const wfRaw = parseDefinition(await readFile(filePath, 'utf-8')) as RawWorkflow;
    const refs = (wfRaw['activities'] as unknown[] | undefined) ?? [];
    for (const ref of refs) {
      if (typeof ref !== 'string' || !ref.includes('/')) continue;
      const targetWorkflowId = ref.split('/')[0]!;
      const filename = ref.split('/').slice(1).join('/');
      const parsed = parseActivityFilename(filename.split('/').pop() ?? '');
      if (!parsed || parsed.id !== activityId) continue;
      const borrowedPath = filename.startsWith('activities/')
        ? join(workflowDir, targetWorkflowId, filename)
        : join(workflowDir, targetWorkflowId, 'activities', filename);
      if (!existsSync(borrowedPath)) continue;
      const content = await readFile(borrowedPath, 'utf-8');
      const validation = safeValidateActivity(parseDefinition(content));
      if (!validation.success) {
        logWarn('Borrowed activity validation failed (raw read)', { activityId, ref, errors: validation.error.issues });
        return err(new ActivityNotFoundError(activityId, workflowId));
      }
      return ok({ content, sourceWorkflowId: targetWorkflowId });
    }
  } catch (error) {
    logWarn('Failed to resolve borrowed activity (raw read)', { activityId, workflowId, error: error instanceof Error ? error.message : String(error) });
  }

  return err(new ActivityNotFoundError(activityId, workflowId));
}

