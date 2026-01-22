import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

/** The meta workflow contains universal skills */
const META_WORKFLOW_ID = 'meta';

export interface SkillEntry { 
  id: string; 
  name: string; 
  path: string;
  workflowId?: string;  // If set, this is a workflow-specific skill
}

export interface Skill {
  id: string;
  version: string;
  capability: string;
  execution_pattern: {
    start: string[];
    per_phase: string[];
    transitions: string[];
  };
  tools: Record<string, {
    when: string;
    returns: string;
    preserve?: string[];
    next?: string;
    action?: string;
  }>;
  state: {
    track: string[];
    initialize: string;
    update_on: Record<string, string>;
  };
  interpretation: Record<string, string>;
  errors: Record<string, { cause: string; recovery: string }>;
}

/** Get the universal skills directory (meta workflow skills/) */
function getUniversalSkillDir(workflowDir: string): string {
  return join(workflowDir, META_WORKFLOW_ID, 'skills');
}

/** Get the workflow-specific skills directory */
function getWorkflowSkillDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'skills');
}

/**
 * Read a skill by ID, with workflow context.
 * Resolution order:
 * 1. If workflowId provided: check {workflowDir}/{workflowId}/skills/{skillId}.toon
 * 2. Fallback to universal: check {workflowDir}/meta/skills/{skillId}.toon
 */
export async function readSkill(
  skillId: string, 
  workflowDir: string, 
  workflowId?: string
): Promise<Result<Skill, SkillNotFoundError>> {
  // Try workflow-specific skill first
  if (workflowId && workflowId !== META_WORKFLOW_ID) {
    const workflowSkillDir = getWorkflowSkillDir(workflowDir, workflowId);
    const workflowFilePath = join(workflowSkillDir, `${skillId}.toon`);
    
    if (existsSync(workflowFilePath)) {
      try {
        const content = await readFile(workflowFilePath, 'utf-8');
        const skill = decodeToon<Skill>(content);
        logInfo('Skill loaded (workflow-specific)', { id: skillId, workflowId, path: workflowFilePath });
        return ok(skill);
      } catch {
        // Fall through to universal
      }
    }
  }
  
  // Try universal skill (from meta workflow)
  const universalDir = getUniversalSkillDir(workflowDir);
  const universalFilePath = join(universalDir, `${skillId}.toon`);
  
  if (existsSync(universalFilePath)) {
    try {
      const content = await readFile(universalFilePath, 'utf-8');
      const skill = decodeToon<Skill>(content);
      logInfo('Skill loaded (universal)', { id: skillId, path: universalFilePath });
      return ok(skill);
    } catch {
      return err(new SkillNotFoundError(skillId));
    }
  }
  
  return err(new SkillNotFoundError(skillId));
}

/**
 * List all universal skills from meta/skills/
 */
export async function listUniversalSkills(workflowDir: string): Promise<SkillEntry[]> {
  const skillDir = getUniversalSkillDir(workflowDir);
  
  if (!existsSync(skillDir)) return [];
  
  try {
    const files = await readdir(skillDir);
    return files.filter(f => f.endsWith('.toon')).map(file => {
      const id = basename(file, '.toon');
      const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { id, name, path: file };
    });
  } catch { 
    return []; 
  }
}

/**
 * List skills for a specific workflow from {workflowDir}/{workflowId}/skills/
 */
export async function listWorkflowSkills(workflowDir: string, workflowId: string): Promise<SkillEntry[]> {
  const skillDir = getWorkflowSkillDir(workflowDir, workflowId);
  
  if (!existsSync(skillDir)) return [];
  
  try {
    const files = await readdir(skillDir);
    return files.filter(f => f.endsWith('.toon')).map(file => {
      const id = basename(file, '.toon');
      const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { id, name, path: `skills/${file}`, workflowId };
    });
  } catch { 
    return []; 
  }
}

/**
 * List all skills - both universal (from meta) and workflow-specific for all workflows.
 */
export async function listSkills(workflowDir: string): Promise<SkillEntry[]> {
  const skills: SkillEntry[] = [];
  
  // Add universal skills from meta workflow
  skills.push(...await listUniversalSkills(workflowDir));
  
  // Add workflow-specific skills (excluding meta which is the universal source)
  if (existsSync(workflowDir)) {
    try {
      const entries = await readdir(workflowDir);
      for (const entry of entries) {
        if (entry === META_WORKFLOW_ID) continue; // Skip meta, already included as universal
        const entryPath = join(workflowDir, entry);
        const stats = await stat(entryPath);
        if (stats.isDirectory()) {
          const workflowSkills = await listWorkflowSkills(workflowDir, entry);
          skills.push(...workflowSkills);
        }
      }
    } catch {
      // Ignore errors
    }
  }
  
  return skills;
}
