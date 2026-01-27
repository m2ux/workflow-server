import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { type Workflow, safeValidateWorkflow } from '../schema/workflow.schema.js';
import { type Activity, safeValidateActivity } from '../schema/activity.schema.js';
import { type Result, ok, err } from '../result.js';
import { WorkflowNotFoundError, WorkflowValidationError } from '../errors.js';
import { logInfo, logError, logWarn } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

export interface WorkflowManifestEntry { id: string; title: string; version: string; description?: string | undefined; }

/** Raw workflow before activity loading */
interface RawWorkflow {
  id: string;
  version: string;
  title: string;
  description?: string;
  activitiesDir?: string;
  activities?: Activity[];
  initialActivity: string;
  [key: string]: unknown;
}

/** Parse activity filename to extract index and id: NN-activity-id.toon */
function parseActivityFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d{2})-(.+)\.toon$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
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
      const decoded = decodeToon<Activity>(content);
      
      const validation = safeValidateActivity(decoded);
      if (!validation.success) {
        logWarn('Activity validation failed', { activityId: parsed.id, errors: validation.error.issues });
        // Still include the activity, just with validation warning
        activities.push(decoded);
      } else {
        activities.push(validation.data);
      }
    } catch (error) {
      logWarn('Failed to load activity', { file, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  
  // Sort by index
  return activities.sort((a, b) => {
    // Find the file index for each activity by matching ID
    const aIndex = files.find(f => parseActivityFilename(f)?.id === a.id);
    const bIndex = files.find(f => parseActivityFilename(f)?.id === b.id);
    return (aIndex ?? '').localeCompare(bIndex ?? '');
  });
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
    const rawWorkflow = decodeToon<RawWorkflow>(content);
    
    // If activitiesDir is specified, load activities from that directory
    if (rawWorkflow.activitiesDir && (!rawWorkflow.activities || rawWorkflow.activities.length === 0)) {
      const workflowDirPath = dirname(filePath);
      const activitiesPath = join(workflowDirPath, rawWorkflow.activitiesDir);
      
      const activities = await loadActivitiesFromDir(activitiesPath);
      if (activities.length === 0) {
        return err(new WorkflowValidationError(workflowId, [`No activities found in ${rawWorkflow.activitiesDir}`]));
      }
      
      // Merge activities into workflow
      rawWorkflow.activities = activities;
      delete rawWorkflow.activitiesDir;
      
      logInfo('Loaded activities from directory', { workflowId, activitiesDir: rawWorkflow.activitiesDir, count: activities.length });
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
      const entryPath = join(workflowDir, entry);
      const stats = await stat(entryPath);
      
      if (stats.isFile() && entry.endsWith('.toon')) {
        // Root-level workflow file
        const result = await loadWorkflow(workflowDir, basename(entry, '.toon'));
        if (result.success) manifests.push({ id: result.value.id, title: result.value.title, version: result.value.version, description: result.value.description });
      } else if (stats.isDirectory()) {
        // Check for workflow in subdirectory (workflow.toon is the standard filename)
        const subWorkflowPath = join(entryPath, 'workflow.toon');
        if (existsSync(subWorkflowPath)) {
          const result = await loadWorkflow(workflowDir, entry);
          if (result.success) manifests.push({ id: result.value.id, title: result.value.title, version: result.value.version, description: result.value.description });
        }
      }
    }
    
    return manifests;
  } catch { return []; }
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
  activity.decisions?.forEach(d => d.branches.forEach(b => transitions.push(b.transitionTo)));
  activity.checkpoints?.forEach(c => c.options.forEach(o => o.effect?.transitionTo && transitions.push(o.effect.transitionTo)));
  return [...new Set(transitions)];
}

/** Validate a transition between activities */
export function validateTransition(workflow: Workflow, fromActivityId: string, toActivityId: string): { valid: boolean; reason?: string } {
  if (!getActivity(workflow, fromActivityId)) return { valid: false, reason: `Source activity not found: ${fromActivityId}` };
  if (!getActivity(workflow, toActivityId)) return { valid: false, reason: `Target activity not found: ${toActivityId}` };
  const valid = getValidTransitions(workflow, fromActivityId);
  if (!valid.includes(toActivityId)) return { valid: false, reason: `No valid transition. Valid: ${valid.join(', ') || 'none'}` };
  return { valid: true };
}

// Backward compatibility aliases (deprecated - will be removed)
/** @deprecated Use getActivity instead */
export const getPhase = getActivity;
