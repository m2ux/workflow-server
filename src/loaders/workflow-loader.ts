import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { type Workflow, safeValidateWorkflow } from '../schema/workflow.schema.js';
import { type Activity, safeValidateActivity, populateStepIds, activityCheckpoints } from '../schema/activity.schema.js';
import { type Result, ok, err } from '../result.js';
import { WorkflowNotFoundError, WorkflowValidationError, ActivityNotFoundError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import { parseDefinition } from '../utils/serialization.js';
import { parseActivityFilename } from './filename-utils.js';

export interface WorkflowManifestEntry { id: string; title: string; version: string; tags?: string[] | undefined; }

/**
 * A definition file that failed to load (unreadable, unparsable, or schema-invalid) and was
 * excluded from the result. Loaders collect these instead of only logging, so `get_workflow` /
 * `list_workflows` can surface the failure in their payloads rather than silently skipping
 * (issue #166 B5 — a dropped activity otherwise resurfaces much later as "Activity not found").
 */
export interface DefinitionLoadError { file: string; activity_id?: string | undefined; error: string; }

/** A loaded workflow plus the per-file activity-load failures excluded from it. */
export interface WorkflowWithDiagnostics { workflow: Workflow; activityLoadErrors: DefinitionLoadError[]; }

const formatZodIssues = (issues: Array<{ path: PropertyKey[]; message: string }>): string =>
  issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');

const META_WORKFLOW_ID = 'meta';

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
async function resolveActivityReference(workflowDir: string, workflowId: string, ref: string): Promise<Activity | null> {
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
    
    return activity;
  } catch (error) {
    logWarn('Failed to load referenced activity', { ref, error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
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

    if (existingActivities && existingActivities.length > 0) {
      // Resolve any string shorthand references to full Activity objects
      const explicitlyReferencedActivities = await Promise.all(
        existingActivities.map(async (activityOrRef) => {
          if (typeof activityOrRef === 'string') {
            const resolved = await resolveActivityReference(workflowDir, workflowId, activityOrRef);
            if (!resolved) {
              throw new Error(`Failed to resolve activity reference: ${activityOrRef}`);
            }
            return resolved;
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

    logInfo('Workflow loaded', { workflowId, version: result.data.version, activityCount: result.data.activities?.length ?? 0 });
    return ok({ workflow: result.data, activityLoadErrors });
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

/** Get an activity from a workflow by ID */
export function getActivity(workflow: Workflow, activityId: string): Activity | undefined { 
  return workflow.activities?.find(a => a.id === activityId);
}

/**
 * The separator between a loop-body checkpoint's base id and its per-iteration instance
 * discriminator. A checkpoint inside a forEach/while loop is defined once but reached N times;
 * yielding it as `<baseId>#<instance>` (e.g. `assumption-decision#RE-1`) gives each iteration a
 * distinct checkpoint id — so the response key (`<activity>-<checkpoint>`) no longer collides and
 * iterations 2..N are recorded/prompted distinctly instead of replaying iteration 1's response
 * (issue #160 follow-up #2). The base is what matches the single checkpoint definition.
 */
export const CHECKPOINT_INSTANCE_SEPARATOR = '#';

/** The base checkpoint id — the portion before the per-iteration instance discriminator, if any. */
export function checkpointBaseId(checkpointId: string): string {
  const i = checkpointId.indexOf(CHECKPOINT_INSTANCE_SEPARATOR);
  return i === -1 ? checkpointId : checkpointId.slice(0, i);
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
  const base = checkpointBaseId(checkpointId);
  return defs.find(c => checkpointBaseId(c.id) === base);
}

/** Get all valid transitions from an activity */
export function getValidTransitions(workflow: Workflow, fromActivityId: string): string[] {
  const activity = getActivity(workflow, fromActivityId);
  if (!activity) return [];
  const transitions: string[] = [];
  activity.transitions?.forEach(t => transitions.push(t.to));
  activity.decisions?.forEach(d => d.branches.forEach(b => { if (b.transitionTo) transitions.push(b.transitionTo); }));
  activityCheckpoints(activity).forEach(c => c.options.forEach(o => o.effect?.transitionTo && transitions.push(o.effect.transitionTo)));
  return [...new Set(transitions)];
}

export interface TransitionEntry {
  to: string;
  condition?: string | undefined;
  isDefault?: boolean | undefined;
}

/** Get the transition list for an activity with human-readable conditions */
export function getTransitionList(workflow: Workflow, fromActivityId: string): TransitionEntry[] {
  const activity = getActivity(workflow, fromActivityId);
  if (!activity) return [];

  const entries: TransitionEntry[] = [];
  const seen = new Set<string>();

  for (const t of activity.transitions ?? []) {
    entries.push({
      to: t.to,
      condition: t.condition ? conditionToString(t.condition) : undefined,
      isDefault: t.isDefault || undefined,
    });
    seen.add(t.to);
  }

  for (const d of activity.decisions ?? []) {
    for (const b of d.branches) {
      if (b.transitionTo && !seen.has(b.transitionTo)) {
        entries.push({ to: b.transitionTo, condition: b.condition ? conditionToString(b.condition) : undefined, isDefault: b.isDefault || undefined });
        seen.add(b.transitionTo);
      }
    }
  }

  for (const c of activityCheckpoints(activity)) {
    for (const o of c.options) {
      if (o.effect?.transitionTo && !seen.has(o.effect.transitionTo)) {
        entries.push({ to: o.effect.transitionTo, condition: `checkpoint:${c.id}:${o.id}` });
        seen.add(o.effect.transitionTo);
      }
    }
  }

  return entries;
}

function conditionToString(condition: { type: string; variable?: string; operator?: string; value?: unknown; conditions?: unknown[]; condition?: unknown }): string {
  switch (condition.type) {
    case 'simple':
      return `${condition.variable} ${condition.operator} ${JSON.stringify(condition.value)}`;
    case 'and':
      if (!Array.isArray(condition.conditions)) return String(condition);
      return (condition.conditions as Array<typeof condition>).map(c => conditionToString(c)).join(' AND ');
    case 'or':
      if (!Array.isArray(condition.conditions)) return String(condition);
      return (condition.conditions as Array<typeof condition>).map(c => conditionToString(c)).join(' OR ');
    case 'not':
      return `NOT (${conditionToString(condition.condition as typeof condition)})`;
    default:
      return String(condition);
  }
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

/** Read raw activity definition (YAML) by ID. Validates but returns the original file content. */
export async function readActivityRaw(
  workflowDir: string,
  workflowId: string,
  activityId: string,
): Promise<Result<string, ActivityNotFoundError>> {
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
      return ok(content);
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
      return ok(content);
    }
  } catch (error) {
    logWarn('Failed to resolve borrowed activity (raw read)', { activityId, workflowId, error: error instanceof Error ? error.message : String(error) });
  }

  return err(new ActivityNotFoundError(activityId, workflowId));
}

