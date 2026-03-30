import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { decodeToonRaw } from '../utils/toon.js';
import type { Skill } from '../schema/skill.schema.js';
import { safeValidateSkill } from '../schema/skill.schema.js';
import { parseActivityFilename as parseSkillFilename } from './filename-utils.js';

/** The meta workflow contains universal skills */
const META_WORKFLOW_ID = 'meta';

export interface SkillEntry { 
  index: string;
  id: string; 
  name: string; 
  path: string;
  workflowId?: string;
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
  } catch (error) {
    logWarn('Failed to read skill directory', { skillDir, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/** Get the universal skills directory (meta workflow skills/) */
function getUniversalSkillDir(workflowDir: string): string {
  return join(workflowDir, META_WORKFLOW_ID, 'skills');
}

/** Get the workflow-specific skills directory */
function getWorkflowSkillDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'skills');
}

/** Find all workflows that have a skills folder (excluding meta, which is searched separately as universal) */
async function findWorkflowsWithSkills(workflowDir: string): Promise<string[]> {
  if (!existsSync(workflowDir)) return [];

  try {
    const entries = await readdir(workflowDir, { withFileTypes: true });
    const workflowIds: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== META_WORKFLOW_ID) {
        const skillDir = getWorkflowSkillDir(workflowDir, entry.name);
        if (existsSync(skillDir)) {
          workflowIds.push(entry.name);
        }
      }
    }

    return workflowIds.sort();
  } catch (error) {
    logWarn('Failed to list workflows with skills', { workflowDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/** Try to load a skill from a specific directory, returning the validated Skill or null */
async function tryLoadSkill(skillDir: string, skillId: string): Promise<Skill | null> {
  const filePath = await findSkillFile(skillDir, skillId);
  if (!filePath) return null;

  try {
    const content = await readFile(filePath, 'utf-8');
    const decoded = decodeToonRaw(content);
    const result = safeValidateSkill(decoded);
    if (!result.success) {
      logWarn('Skill validation failed', { skillId, path: filePath, errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
      return null;
    }
    return result.data;
  } catch (error) {
    logWarn('Failed to decode skill TOON', { skillId, path: filePath, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Read a skill by ID, with optional workflow context.
 * Resolution order:
 * 1. If workflowId provided: check {workflowDir}/{workflowId}/skills/NN-{skillId}.toon
 * 2. Universal: check {workflowDir}/meta/skills/NN-{skillId}.toon
 * 3. If no workflowId: search all workflow skill directories
 */
export async function readSkill(
  skillId: string, 
  workflowDir: string, 
  workflowId?: string
): Promise<Result<Skill, SkillNotFoundError>> {
  // Try workflow-specific skill first
  if (workflowId && workflowId !== META_WORKFLOW_ID) {
    const skill = await tryLoadSkill(getWorkflowSkillDir(workflowDir, workflowId), skillId);
    if (skill) {
      logInfo('Skill loaded (workflow-specific)', { id: skillId, workflowId });
      return ok(skill);
    }
  }
  
  // Try universal skill (from meta workflow)
  const universalSkill = await tryLoadSkill(getUniversalSkillDir(workflowDir), skillId);
  if (universalSkill) {
    logInfo('Skill loaded (universal)', { id: skillId });
    return ok(universalSkill);
  }
  
  // If no workflowId was specified, search all workflow skill directories
  if (!workflowId) {
    const workflowIds = await findWorkflowsWithSkills(workflowDir);
    for (const wfId of workflowIds) {
      const skill = await tryLoadSkill(getWorkflowSkillDir(workflowDir, wfId), skillId);
      if (skill) {
        logInfo('Skill loaded (cross-workflow search)', { id: skillId, foundIn: wfId });
        return ok(skill);
      }
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
  } catch (error) {
    logWarn('Failed to list universal skills', { error: error instanceof Error ? error.message : String(error) });
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
  } catch (error) {
    logWarn('Failed to list workflow skills', { workflowId, error: error instanceof Error ? error.message : String(error) });
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
  
  if (existsSync(workflowDir)) {
    try {
      const entries = (await readdir(workflowDir)).sort();
      for (const entry of entries) {
        if (entry === META_WORKFLOW_ID) continue;
        const entryPath = join(workflowDir, entry);
        const stats = await stat(entryPath);
        if (stats.isDirectory()) {
          const workflowSkills = await listWorkflowSkills(workflowDir, entry);
          skills.push(...workflowSkills);
        }
      }
    } catch (error) {
      logWarn('Failed to enumerate workflow skill directories', { workflowDir, error: error instanceof Error ? error.message : String(error) });
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
 * Loads skills directly from enumerated entries to avoid redundant readdir calls.
 */
export async function readSkillIndex(workflowDir: string): Promise<Result<SkillIndex, SkillNotFoundError>> {
  const universal: SkillIndex['universal'] = [];
  const workflow_specific: SkillIndex['workflow_specific'] = {};
  
  // Load universal skills directly from already-enumerated entries
  const universalEntries = await listUniversalSkills(workflowDir);
  const universalSkillDir = getUniversalSkillDir(workflowDir);
  for (const entry of universalEntries) {
    const skill = await tryLoadSkill(universalSkillDir, entry.id);
    if (skill) {
      universal.push({
        id: skill.id,
        capability: skill.capability,
        next_action: {
          tool: 'get_skill',
          parameters: { skill_id: skill.id },
        },
      });
    }
  }
  
  // Load workflow-specific skills directly from enumerated entries
  if (existsSync(workflowDir)) {
    try {
      const entries = await readdir(workflowDir);
      for (const workflowId of entries.sort()) {
        if (workflowId === META_WORKFLOW_ID) continue;
        const entryPath = join(workflowDir, workflowId);
        const stats = await stat(entryPath);
        if (stats.isDirectory()) {
          const workflowSkillEntries = await listWorkflowSkills(workflowDir, workflowId);
          if (workflowSkillEntries.length > 0) {
            const skillDir = getWorkflowSkillDir(workflowDir, workflowId);
            workflow_specific[workflowId] = [];
            for (const skillEntry of workflowSkillEntries) {
              const skill = await tryLoadSkill(skillDir, skillEntry.id);
              if (skill) {
                workflow_specific[workflowId].push({
                  id: skill.id,
                  capability: skill.capability,
                  next_action: {
                    tool: 'get_skill',
                    parameters: { skill_id: skill.id, workflow_id: workflowId },
                  },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      logWarn('Failed to build skill index', { workflowDir, error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  if (universal.length === 0 && Object.keys(workflow_specific).length === 0) {
    return err(new SkillNotFoundError('index'));
  }
  
  const index: SkillIndex = {
    description: 'Skills provide tool orchestration patterns for executing activities.',
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
