import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ActivityNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { parseDefinition } from '../utils/serialization.js';
import { type Activity, safeValidateActivity, populateStepIds } from '../schema/activity.schema.js';
import { parseActivityFilename } from './filename-utils.js';

export interface ActivityEntry { 
  index: string;
  id: string; 
  name: string; 
  path: string;
  workflowId: string;
}

export interface ActivityWithGuidance extends Activity {
  workflowId?: string;
  next_action?: {
    tool: string;
    parameters: Record<string, string>;
  };
}

/** Get the activity directory for a specific workflow */
function getActivityDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'activities');
}

/** Find all workflows that have an activities folder */
async function findWorkflowsWithActivities(workflowDir: string): Promise<string[]> {
  if (!existsSync(workflowDir)) return [];
  
  try {
    const entries = await readdir(workflowDir, { withFileTypes: true });
    const workflowIds: string[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const activityDir = getActivityDir(workflowDir, entry.name);
        if (existsSync(activityDir)) {
          workflowIds.push(entry.name);
        }
      }
    }
    
    return workflowIds.sort();
  } catch (error) {
    logWarn('Failed to list workflows with activities', { workflowDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/**
 * Read an activity from a specific workflow's activities folder.
 * If workflowId is not specified, searches all workflows with activities folders.
 */
export async function readActivity(
  workflowDir: string, 
  activityId: string, 
  workflowId?: string
): Promise<Result<ActivityWithGuidance, ActivityNotFoundError>> {
  // If workflowId specified, look only in that workflow
  if (workflowId) {
    return readActivityFromWorkflow(workflowDir, workflowId, activityId);
  }
  
  // Otherwise, search all workflows with activities folders
  const workflowIds = await findWorkflowsWithActivities(workflowDir);
  
  for (const wfId of workflowIds) {
    const result = await readActivityFromWorkflow(workflowDir, wfId, activityId);
    if (result.success) {
      return result;
    }
  }
  
  return err(new ActivityNotFoundError(activityId));
}

/** Read an activity from a specific workflow's activities folder */
async function readActivityFromWorkflow(
  workflowDir: string,
  workflowId: string,
  activityId: string
): Promise<Result<ActivityWithGuidance, ActivityNotFoundError>> {
  const activityDir = getActivityDir(workflowDir, workflowId);
  
  if (!existsSync(activityDir)) {
    return err(new ActivityNotFoundError(activityId));
  }
  
  try {
    // Find file matching NN-{activityId}.{yaml|yml} pattern
    const files = await readdir(activityDir);
    const matchingFile = files.find(f => {
      const parsed = parseActivityFilename(f);
      return parsed && parsed.id === activityId;
    });
    
    if (!matchingFile) {
      return err(new ActivityNotFoundError(activityId));
    }
    
    const parsedMatch = parseActivityFilename(matchingFile);
    if (parsedMatch && parsedMatch.id === 'index') {
      return err(new ActivityNotFoundError(activityId));
    }
    
    const filePath = join(activityDir, matchingFile);
    const content = await readFile(filePath, 'utf-8');
    const decoded = parseDefinition(content);
    
    const validation = safeValidateActivity(decoded);
    if (!validation.success) {
      logWarn('Activity validation failed', { activityId, workflowId, errors: validation.error.issues });
      return err(new ActivityNotFoundError(activityId, workflowId));
    }
    
    const activity = validation.data;
    populateStepIds(activity);

    // Infer artifactPrefix from the activity filename index
    const parsedFilename = parseActivityFilename(matchingFile);
    if (parsedFilename) {
      activity.artifactPrefix = parsedFilename.index;
    }

    logInfo('Activity loaded', { id: activityId, workflowId, path: filePath });

    const primaryStep = activity.steps?.find(s => s.technique);

    const activityWithGuidance: ActivityWithGuidance = {
      ...activity,
      workflowId,
      ...(primaryStep?.id ? {
        next_action: {
          tool: 'get_technique',
          parameters: { step_id: primaryStep.id },
        },
      } : {}),
    };

    return ok(activityWithGuidance);
  } catch (error) {
    logWarn('Failed to load activity', { activityId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return err(new ActivityNotFoundError(activityId, workflowId));
  }
}

/**
 * List activities from a specific workflow or all workflows.
 * If workflowId is not specified, lists from all workflows with activities folders.
 */
export async function listActivities(workflowDir: string, workflowId?: string): Promise<ActivityEntry[]> {
  if (workflowId) {
    return listActivitiesFromWorkflow(workflowDir, workflowId);
  }
  
  // List from all workflows with activities folders
  const workflowIds = await findWorkflowsWithActivities(workflowDir);
  const allActivities: ActivityEntry[] = [];
  
  for (const wfId of workflowIds) {
    const activities = await listActivitiesFromWorkflow(workflowDir, wfId);
    allActivities.push(...activities);
  }
  
  // Sort by workflow then by index
  return allActivities.sort((a, b) => {
    if (a.workflowId !== b.workflowId) {
      return a.workflowId.localeCompare(b.workflowId);
    }
    return a.index.localeCompare(b.index);
  });
}

/** List activities from a specific workflow's activities folder */
async function listActivitiesFromWorkflow(workflowDir: string, workflowId: string): Promise<ActivityEntry[]> {
  const activityDir = getActivityDir(workflowDir, workflowId);
  
  if (!existsSync(activityDir)) return [];
  
  try {
    const files = await readdir(activityDir);
    return files
      .map(file => {
        const parsed = parseActivityFilename(file);
        if (!parsed || parsed.id === 'index') return null;
        const name = parsed.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { index: parsed.index, id: parsed.id, name, path: file, workflowId };
      })
      .filter((entry): entry is ActivityEntry => entry !== null)
      .sort((a, b) => a.index.localeCompare(b.index));
  } catch (error) {
    logWarn('Failed to list activities', { workflowId, error: error instanceof Error ? error.message : String(error) });
    return []; 
  }
}
