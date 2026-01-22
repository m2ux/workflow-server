import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

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

/** Get the universal skills directory (prompts/skills/) */
function getUniversalSkillDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const srcDir = dirname(dirname(currentFile));
  const projectRoot = dirname(srcDir);
  return join(projectRoot, 'prompts', 'skills');
}

/** Get the workflow-specific skills directory */
function getWorkflowSkillDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'skills');
}

/**
 * Read a skill by ID, with optional workflow context.
 * Resolution order:
 * 1. If workflowId provided: check {workflowDir}/{workflowId}/skills/{skillId}.toon
 * 2. Fallback to universal: check prompts/skills/{skillId}.toon
 */
export async function readSkill(
  skillId: string, 
  workflowDir?: string, 
  workflowId?: string
): Promise<Result<Skill, SkillNotFoundError>> {
  // Try workflow-specific skill first
  if (workflowDir && workflowId) {
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
  
  // Try universal skill
  const universalDir = getUniversalSkillDir();
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
 * List all universal skills from prompts/skills/
 */
export async function listUniversalSkills(): Promise<SkillEntry[]> {
  const skillDir = getUniversalSkillDir();
  
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
 * List all skills - both universal and workflow-specific for all workflows.
 */
export async function listSkills(workflowDir?: string): Promise<SkillEntry[]> {
  const skills: SkillEntry[] = [];
  
  // Add universal skills
  skills.push(...await listUniversalSkills());
  
  // Add workflow-specific skills if workflowDir provided
  if (workflowDir && existsSync(workflowDir)) {
    try {
      const entries = await readdir(workflowDir);
      for (const entry of entries) {
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
