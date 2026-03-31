import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { type Workflow, safeValidateWorkflow } from '../schema/workflow.schema.js';
import { type Activity, safeValidateActivity } from '../schema/activity.schema.js';
import { type Result, ok, err } from '../result.js';
import { WorkflowNotFoundError, WorkflowValidationError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import { decodeToonRaw } from '../utils/toon.js';
import { parseActivityFilename } from './filename-utils.js';

export interface WorkflowManifestEntry { id: string; title: string; version: string; description?: string | undefined; }

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
async function loadActivitiesFromDir(activitiesPath: string): Promise<Activity[]> {
  if (!existsSync(activitiesPath)) return [];
  
  const files = await readdir(activitiesPath);
  const activities: Activity[] = [];
  
  for (const file of files) {
    const parsed = parseActivityFilename(file);
    if (!parsed) continue;
    
    try {
      const content = await readFile(join(activitiesPath, file), 'utf-8');
      const decoded = decodeToonRaw(content);
      
      const validation = safeValidateActivity(decoded);
      if (!validation.success) {
        logWarn('Skipping invalid activity', { activityId: parsed.id, errors: validation.error.issues });
        continue;
      }
      const activity = validation.data;
      activity.artifactPrefix = parsed.index;
      activities.push(activity);
    } catch (error) {
      logWarn('Failed to load activity', { file, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  
  return activities.sort((a, b) =>
    (a.artifactPrefix ?? '').localeCompare(b.artifactPrefix ?? '')
  );
}

/**
 * Resolve the path to a workflow file.
 * Supports two directory structures:
 * 1. Subdirectory (preferred): {workflowDir}/{workflowId}/workflow.toon
 * 2. Root-level (legacy): {workflowDir}/{workflowId}.toon
 */
function resolveWorkflowPath(workflowDir: string, workflowId: string): string | null {
  // Try subdirectory first (preferred pattern)
  const subPath = join(workflowDir, workflowId, 'workflow.toon');
  if (existsSync(subPath)) return subPath;
  
  // Fall back to root-level (legacy)
  const rootPath = join(workflowDir, `${workflowId}.toon`);
  if (existsSync(rootPath)) return rootPath;
  
  return null;
}

export async function loadWorkflow(workflowDir: string, workflowId: string): Promise<Result<Workflow, WorkflowNotFoundError | WorkflowValidationError>> {
  const filePath = resolveWorkflowPath(workflowDir, workflowId);
  if (!filePath) return err(new WorkflowNotFoundError(workflowId));
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const rawWorkflow = decodeToonRaw(content) as RawWorkflow;
    
    // Load activities from directory if not inline
    // Default to 'activities/' subfolder, or use activitiesDir if specified
    const existingActivities = rawWorkflow['activities'] as Activity[] | undefined;
    if (!existingActivities || existingActivities.length === 0) {
      const workflowDirPath = dirname(filePath);
      const activitiesDirName = rawWorkflow.activitiesDir ?? 'activities';
      const activitiesPath = join(workflowDirPath, activitiesDirName);
      
      const activities = await loadActivitiesFromDir(activitiesPath);
      if (activities.length > 0) {
        rawWorkflow['activities'] = activities;
        logInfo('Loaded activities from directory', { workflowId, activitiesDir: activitiesDirName, count: activities.length });
      }
      
      // Clean up non-schema property
      if (rawWorkflow.activitiesDir) {
        delete rawWorkflow.activitiesDir;
      }
    }
    
    const result = safeValidateWorkflow(rawWorkflow);
    if (!result.success) {
      return err(new WorkflowValidationError(workflowId, result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)));
    }
    
    logInfo('Workflow loaded', { workflowId, version: result.data.version, activityCount: result.data.activities.length });
    return ok(result.data);
  } catch (error) {
    logError('Failed to load workflow', error instanceof Error ? error : undefined, { workflowId });
    return err(new WorkflowValidationError(workflowId, [error instanceof Error ? error.message : 'Unknown error']));
  }
}

export async function listWorkflows(workflowDir: string): Promise<WorkflowManifestEntry[]> {
  if (!existsSync(workflowDir)) return [];
  try {
    const entries = await readdir(workflowDir);
    const manifests: WorkflowManifestEntry[] = [];
    
    for (const entry of entries) {
      if (entry === META_WORKFLOW_ID) continue;
      const entryPath = join(workflowDir, entry);
      const stats = await stat(entryPath);
      
      let toonPath: string | null = null;
      if (stats.isFile() && entry.endsWith('.toon')) {
        toonPath = entryPath;
      } else if (stats.isDirectory()) {
        const subWorkflowPath = join(entryPath, 'workflow.toon');
        if (existsSync(subWorkflowPath)) {
          toonPath = subWorkflowPath;
        }
      }
      
      if (toonPath) {
        try {
          const content = await readFile(toonPath, 'utf-8');
          const raw = decodeToonRaw(content) as RawWorkflow;
          if (raw.id && raw.title && raw.version) {
            manifests.push({ id: raw.id, title: raw.title, version: raw.version, description: raw.description });
          }
        } catch (error) {
          logWarn('Failed to read workflow manifest', { path: toonPath, error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
    
    return manifests;
  } catch (error) {
    logWarn('Failed to list workflows', { workflowDir, error: error instanceof Error ? error.message : String(error), code: error instanceof Error && 'code' in error ? (error as NodeJS.ErrnoException).code : undefined });
    return [];
  }
}

/** Get an activity from a workflow by ID */
export function getActivity(workflow: Workflow, activityId: string): Activity | undefined { 
  return workflow.activities.find(a => a.id === activityId); 
}

/** Get a checkpoint from an activity */
export function getCheckpoint(workflow: Workflow, activityId: string, checkpointId: string) { 
  return getActivity(workflow, activityId)?.checkpoints?.find(c => c.id === checkpointId); 
}

/** Get all valid transitions from an activity */
export function getValidTransitions(workflow: Workflow, fromActivityId: string): string[] {
  const activity = getActivity(workflow, fromActivityId);
  if (!activity) return [];
  const transitions: string[] = [];
  activity.transitions?.forEach(t => transitions.push(t.to));
  activity.decisions?.forEach(d => d.branches.forEach(b => { if (b.transitionTo) transitions.push(b.transitionTo); }));
  activity.checkpoints?.forEach(c => c.options.forEach(o => o.effect?.transitionTo && transitions.push(o.effect.transitionTo)));
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

  for (const c of activity.checkpoints ?? []) {
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

/** Validate a transition between activities */
export function validateTransition(workflow: Workflow, fromActivityId: string, toActivityId: string): { valid: boolean; reason?: string } {
  if (!getActivity(workflow, fromActivityId)) return { valid: false, reason: `Source activity not found: ${fromActivityId}` };
  if (!getActivity(workflow, toActivityId)) return { valid: false, reason: `Target activity not found: ${toActivityId}` };
  const valid = getValidTransitions(workflow, fromActivityId);
  if (!valid.includes(toActivityId)) return { valid: false, reason: `No valid transition. Valid: ${valid.join(', ') || 'none'}` };
  return { valid: true };
}

