import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { ActivityNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

/** The meta workflow contains all activities */
const META_WORKFLOW_ID = 'meta';

export interface ActivityEntry { 
  index: string;
  id: string; 
  name: string; 
  path: string; 
}

/** Parse activity filename to extract index and id: NN-activity-id.toon */
function parseActivityFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d{2})-(.+)\.toon$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
}

export interface Activity {
  id: string;
  version: string;
  problem: string;
  recognition: string[];
  skills: {
    primary: string;
    supporting: string[];
  };
  outcome: string[];
  flow: string[];
  context_to_preserve: string[];
}

export interface ActivityWithGuidance extends Activity {
  next_action: {
    tool: string;
    parameters: Record<string, string>;
  };
}

/** Get the activity directory from the meta workflow */
function getActivityDir(workflowDir: string): string {
  return join(workflowDir, META_WORKFLOW_ID, 'intents');
}

export async function readActivity(workflowDir: string, activityId: string): Promise<Result<ActivityWithGuidance, ActivityNotFoundError>> {
  const activityDir = getActivityDir(workflowDir);
  
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
    const activity = decodeToon<Activity>(content);
    logInfo('Activity loaded', { id: activityId, path: filePath });
    
    // Add next_action guidance for the primary skill
    const activityWithGuidance: ActivityWithGuidance = {
      ...activity,
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

export async function listActivities(workflowDir: string): Promise<ActivityEntry[]> {
  const activityDir = getActivityDir(workflowDir);
  
  if (!existsSync(activityDir)) return [];
  
  try {
    const files = await readdir(activityDir);
    return files
      .map(file => {
        const parsed = parseActivityFilename(file);
        if (!parsed || parsed.id === 'index') return null;
        const name = parsed.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { index: parsed.index, id: parsed.id, name, path: file };
      })
      .filter((entry): entry is ActivityEntry => entry !== null)
      .sort((a, b) => a.index.localeCompare(b.index));
  } catch { 
    return []; 
  }
}

export interface ActivityIndex {
  description: string;
  usage: string;
  next_action: {
    tool: string;
    parameters: Record<string, unknown>;
  };
  activities: Array<{
    id: string;
    problem: string;
    primary_skill: string;
    next_action: {
      tool: string;
      parameters: Record<string, string>;
    };
  }>;
  quick_match: Record<string, string>;
}

/**
 * Build activity index dynamically from individual activity files.
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
    const result = await readActivity(workflowDir, entry.id);
    if (result.success) {
      const activity = result.value;
      activities.push({
        id: activity.id,
        problem: activity.problem,
        primary_skill: activity.skills.primary,
        next_action: {
          tool: 'get_skill',
          parameters: { skill_id: activity.skills.primary },
        },
      });
      
      // Build quick_match from recognition patterns
      for (const pattern of activity.recognition) {
        quick_match[pattern.toLowerCase()] = activity.id;
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
