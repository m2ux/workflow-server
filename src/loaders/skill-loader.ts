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
  index: string;
  id: string; 
  name: string; 
  path: string;
  workflowId?: string;  // If set, this is a workflow-specific skill
}

/** Parse skill filename to extract index and id: NN-skill-id.toon */
function parseSkillFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d{2})-(.+)\.toon$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
}

/** Find skill file by ID in a directory (handles NN- prefix) */
async function findSkillFile(skillDir: string, skillId: string): Promise<string | null> {
  if (!existsSync(skillDir)) return null;
  
  try {
    const files = await readdir(skillDir);
    const matchingFile = files.find(f => {
      const parsed = parseSkillFilename(f);
      return parsed && parsed.id === skillId;
    });
    return matchingFile ? join(skillDir, matchingFile) : null;
  } catch {
    return null;
  }
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
 * 1. If workflowId provided: check {workflowDir}/{workflowId}/skills/NN-{skillId}.toon
 * 2. Fallback to universal: check {workflowDir}/meta/skills/NN-{skillId}.toon
 */
export async function readSkill(
  skillId: string, 
  workflowDir: string, 
  workflowId?: string
): Promise<Result<Skill, SkillNotFoundError>> {
  // Try workflow-specific skill first
  if (workflowId && workflowId !== META_WORKFLOW_ID) {
    const workflowSkillDir = getWorkflowSkillDir(workflowDir, workflowId);
    const workflowFilePath = await findSkillFile(workflowSkillDir, skillId);
    
    if (workflowFilePath) {
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
  const universalFilePath = await findSkillFile(universalDir, skillId);
  
  if (universalFilePath) {
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
    return files
      .map(file => {
        const parsed = parseSkillFilename(file);
        if (!parsed) return null;
        const name = parsed.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { index: parsed.index, id: parsed.id, name, path: file };
      })
      .filter((entry): entry is SkillEntry => entry !== null)
      .sort((a, b) => a.index.localeCompare(b.index));
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
    const entries: SkillEntry[] = [];
    
    for (const file of files) {
      const parsed = parseSkillFilename(file);
      if (!parsed) continue;
      const name = parsed.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      entries.push({ index: parsed.index, id: parsed.id, name, path: `skills/${file}`, workflowId });
    }
    
    return entries.sort((a, b) => a.index.localeCompare(b.index));
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

export interface SkillIndex {
  description: string;
  usage: string;
  universal: Array<{
    id: string;
    capability: string;
    next_action: {
      tool: string;
      parameters: Record<string, string>;
    };
  }>;
  workflow_specific: Record<string, Array<{
    id: string;
    capability: string;
    next_action: {
      tool: string;
      parameters: Record<string, string>;
    };
  }>>;
}

/**
 * Build skill index dynamically from skill files.
 * Returns universal skills and workflow-specific skills grouped by workflow.
 */
export async function readSkillIndex(workflowDir: string): Promise<Result<SkillIndex, SkillNotFoundError>> {
  const universal: SkillIndex['universal'] = [];
  const workflow_specific: SkillIndex['workflow_specific'] = {};
  
  // Load universal skills
  const universalEntries = await listUniversalSkills(workflowDir);
  for (const entry of universalEntries) {
    const result = await readSkill(entry.id, workflowDir);
    if (result.success) {
      universal.push({
        id: result.value.id,
        capability: result.value.capability,
        next_action: {
          tool: 'get_skill',
          parameters: { skill_id: result.value.id },
        },
      });
    }
  }
  
  // Load workflow-specific skills
  if (existsSync(workflowDir)) {
    try {
      const entries = await readdir(workflowDir);
      for (const workflowId of entries) {
        if (workflowId === META_WORKFLOW_ID) continue;
        const entryPath = join(workflowDir, workflowId);
        const stats = await stat(entryPath);
        if (stats.isDirectory()) {
          const workflowSkillEntries = await listWorkflowSkills(workflowDir, workflowId);
          if (workflowSkillEntries.length > 0) {
            workflow_specific[workflowId] = [];
            for (const skillEntry of workflowSkillEntries) {
              const result = await readSkill(skillEntry.id, workflowDir, workflowId);
              if (result.success) {
                workflow_specific[workflowId].push({
                  id: result.value.id,
                  capability: result.value.capability,
                  next_action: {
                    tool: 'get_skill',
                    parameters: { skill_id: result.value.id, workflow_id: workflowId },
                  },
                });
              }
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }
  
  if (universal.length === 0 && Object.keys(workflow_specific).length === 0) {
    return err(new SkillNotFoundError('index'));
  }
  
  const index: SkillIndex = {
    description: 'Skills provide tool orchestration patterns for executing intents.',
    usage: 'After identifying a skill, call the tool specified in next_action with the given parameters to get full execution guidance.',
    universal,
    workflow_specific,
  };
  
  logInfo('Skill index built dynamically', { 
    universalCount: universal.length, 
    workflowCount: Object.keys(workflow_specific).length 
  });
  return ok(index);
}
