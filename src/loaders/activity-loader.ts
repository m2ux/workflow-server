import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ActivityNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { decodeToon } from '../utils/toon.js';
import { type Activity, safeValidateActivity } from '../schema/activity.schema.js';

/** Default workflow for standalone activities (backward compatibility) */
const DEFAULT_ACTIVITY_WORKFLOW = 'meta';

export interface ActivityEntry { 
  index: string;
  id: string; 
  name: string; 
  path: string;
  workflowId: string;
}

/** Parse activity filename to extract index and id: NN-activity-id.toon */
function parseActivityFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d{2})-(.+)\.toon$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
}

export interface ActivityWithGuidance extends Activity {
  workflowId?: string;
  next_action: {
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
    
    return workflowIds;
  } catch {
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
    // Find file matching NN-{activityId}.toon pattern
    const files = await readdir(activityDir);
    const matchingFile = files.find(f => {
      const parsed = parseActivityFilename(f);
      return parsed && parsed.id === activityId;
    });
    
    if (!matchingFile) {
      return err(new ActivityNotFoundError(activityId));
    }
    
    const filePath = join(activityDir, matchingFile);
    const content = await readFile(filePath, 'utf-8');
    const decoded = decodeToon<Activity>(content);
    
    // Validate against schema
    const validation = safeValidateActivity(decoded);
    if (!validation.success) {
      logWarn('Activity validation failed', { activityId, workflowId, errors: validation.error.issues });
    }
    
    const activity = validation.success ? validation.data : decoded;
    logInfo('Activity loaded', { id: activityId, workflowId, path: filePath });
    
    // Add next_action guidance for the primary skill
    const activityWithGuidance: ActivityWithGuidance = {
      ...activity,
      workflowId,
      next_action: {
        tool: 'get_skill',
        parameters: { skill_id: activity.skills.primary },
      },
    };
    
    return ok(activityWithGuidance);
  } catch {
    return err(new ActivityNotFoundError(activityId));
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
  } catch { 
    return []; 
  }
}

export interface ActivityIndexEntry {
  id: string;
  workflowId: string;
  problem: string;
  primary_skill: string;
  next_action: {
    tool: string;
    parameters: Record<string, string>;
  };
}

export interface ActivityIndex {
  description: string;
  usage: string;
  next_action: {
    tool: string;
    parameters: Record<string, unknown>;
  };
  activities: ActivityIndexEntry[];
  quick_match: Record<string, string>;
}

/**
 * Build activity index dynamically from activity files across all workflows.
 * Each activity's `recognition` patterns become quick_match entries.
 */
export async function readActivityIndex(workflowDir: string): Promise<Result<ActivityIndex, ActivityNotFoundError>> {
  const activityEntries = await listActivities(workflowDir);
  
  if (activityEntries.length === 0) {
    return err(new ActivityNotFoundError('index'));
  }
  
  const activities: ActivityIndex['activities'] = [];
  const quick_match: Record<string, string> = {};
  
  for (const entry of activityEntries) {
    const result = await readActivity(workflowDir, entry.id, entry.workflowId);
    if (result.success) {
      const activity = result.value;
      
      // Build activity entry for index
      const activityEntry: ActivityIndex['activities'][number] = {
        id: activity.id,
        workflowId: entry.workflowId,
        problem: activity.problem ?? activity.description ?? activity.name,
        primary_skill: activity.skills.primary,
        next_action: {
          tool: 'get_skill',
          parameters: { skill_id: activity.skills.primary },
        },
      };
      
      activities.push(activityEntry);
      
      // Build quick_match from recognition patterns
      if (activity.recognition) {
        for (const pattern of activity.recognition) {
          quick_match[pattern.toLowerCase()] = activity.id;
        }
      }
    }
  }
  
  const index: ActivityIndex = {
    description: 'Match user goal to an activity. Activities use skills to achieve outcomes.',
    usage: 'Call the tool in next_action first (get_rules), then proceed to the matched activity.',
    next_action: {
      tool: 'get_rules',
      parameters: {},
    },
    activities,
    quick_match,
  };
  
  logInfo('Activity index built dynamically', { activityCount: activities.length });
  return ok(index);
}
