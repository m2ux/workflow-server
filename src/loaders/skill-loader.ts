import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { decodeToonRaw } from '../utils/toon.js';
import type { Skill } from '../schema/skill.schema.js';
import { safeValidateSkill } from '../schema/skill.schema.js';
import { parseActivityFilename as parseSkillFilename } from './filename-utils.js';

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

/** Get the workflow-specific skills directory */
function getWorkflowSkillDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'skills');
}

/** Find all workflows that have a skills folder */
async function findWorkflowsWithSkills(workflowDir: string): Promise<string[]> {
  if (!existsSync(workflowDir)) return [];

  try {
    const entries = await readdir(workflowDir, { withFileTypes: true });
    const workflowIds: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
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

/** Try to read raw skill TOON from a directory, validating but returning the raw string */
async function tryReadSkillRaw(skillDir: string, skillId: string): Promise<string | null> {
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
    return content;
  } catch (error) {
    logWarn('Failed to decode skill TOON', { skillId, path: filePath, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

async function listSkillIdsInDir(skillDir: string): Promise<string[]> {
  if (!existsSync(skillDir)) return [];

  try {
    const files = await readdir(skillDir);
    return files
      .map(f => parseSkillFilename(f)?.id)
      .filter((id): id is string => id !== undefined)
      .sort();
  } catch (error) {
    logWarn('Failed to list skills', { skillDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/**
 * List skill IDs from a specific workflow's skills/ directory.
 */
export async function listWorkflowSkillIds(workflowDir: string, workflowId: string): Promise<string[]> {
  return listSkillIdsInDir(getWorkflowSkillDir(workflowDir, workflowId));
}

/**
 * Read a skill by ID, with optional workflow context.
 * Resolution order:
 * 0. If skillId is prefixed with a workflow (e.g. 'work-package/manage-git'), search only that workflow
 * 1. If workflowId provided: check {workflowDir}/{workflowId}/skills/NN-{skillId}.toon
 * 2. If no workflowId: search all workflow skill directories
 */
export async function readSkill(
  skillId: string, 
  workflowDir: string, 
  workflowId?: string
): Promise<Result<Skill, SkillNotFoundError>> {
  // Handle explicitly prefixed skills (e.g. "work-package/manage-git")
  if (skillId.includes('/')) {
    const [targetWorkflow, actualSkillId] = skillId.split('/', 2);
    if (!targetWorkflow || !actualSkillId) {
      return err(new SkillNotFoundError(skillId));
    }
    const skill = await tryLoadSkill(getWorkflowSkillDir(workflowDir, targetWorkflow), actualSkillId);
    if (skill) {
      logInfo('Skill loaded (explicit prefix)', { id: skillId, targetWorkflow });
      return ok(skill);
    }
    return err(new SkillNotFoundError(skillId));
  }

  // Try workflow-specific skill first
  if (workflowId) {
    const skill = await tryLoadSkill(getWorkflowSkillDir(workflowDir, workflowId), skillId);
    if (skill) {
      logInfo('Skill loaded (workflow-specific)', { id: skillId, workflowId });
      return ok(skill);
    }
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
 * Read raw skill TOON by ID, with the same resolution as readSkill.
 * Validates the content but returns the original TOON string.
 */
export async function readSkillRaw(
  skillId: string,
  workflowDir: string,
  workflowId?: string
): Promise<Result<string, SkillNotFoundError>> {
  if (skillId.includes('/')) {
    const [targetWorkflow, actualSkillId] = skillId.split('/', 2);
    if (!targetWorkflow || !actualSkillId) {
      return err(new SkillNotFoundError(skillId));
    }
    const raw = await tryReadSkillRaw(getWorkflowSkillDir(workflowDir, targetWorkflow), actualSkillId);
    if (raw) {
      logInfo('Skill loaded raw (explicit prefix)', { id: skillId, targetWorkflow });
      return ok(raw);
    }
    return err(new SkillNotFoundError(skillId));
  }

  if (workflowId) {
    const raw = await tryReadSkillRaw(getWorkflowSkillDir(workflowDir, workflowId), skillId);
    if (raw) {
      logInfo('Skill loaded raw (workflow-specific)', { id: skillId, workflowId });
      return ok(raw);
    }
  }

  if (!workflowId) {
    const workflowIds = await findWorkflowsWithSkills(workflowDir);
    for (const wfId of workflowIds) {
      const raw = await tryReadSkillRaw(getWorkflowSkillDir(workflowDir, wfId), skillId);
      if (raw) {
        logInfo('Skill loaded raw (cross-workflow search)', { id: skillId, foundIn: wfId });
        return ok(raw);
      }
    }
  }

  return err(new SkillNotFoundError(skillId));
}
