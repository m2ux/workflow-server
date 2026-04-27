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

/**
 * Resolved entry returned by resolveOperations.
 * Carries the skill source, the element name, its kind (operation/rule/error), and its body.
 */
export interface ResolvedOperation {
  source: string;                  // canonical skill id (e.g. "workflow-orchestrator")
  workflow?: string | undefined;   // optional workflow context (e.g. "meta") when the ref was prefixed
  name: string;                    // element name (operation/rule/error name)
  type: 'operation' | 'rule' | 'error' | 'not-found';
  body: unknown;                   // the element body (operation object, rule string/array, error object) — null when not-found
  ref: string;                     // original reference string from the request (for traceability)
}

/**
 * Parse a skill::element reference. Supports optional workflow prefix.
 * Examples:
 *   "agent-conduct::file-sensitivity" → { workflow: undefined, skill: "agent-conduct", name: "file-sensitivity" }
 *   "meta/agent-conduct::file-sensitivity" → { workflow: "meta", skill: "agent-conduct", name: "file-sensitivity" }
 */
function parseOperationRef(ref: string): { workflow?: string; skill: string; name: string } | null {
  // Find the :: separator
  const sepIdx = ref.indexOf('::');
  if (sepIdx < 0) return null;
  const skillPart = ref.slice(0, sepIdx);
  const name = ref.slice(sepIdx + 2);
  if (!name) return null;

  // Skill part may be workflow-prefixed (e.g. "meta/agent-conduct")
  const slashIdx = skillPart.indexOf('/');
  if (slashIdx > 0) {
    const workflow = skillPart.slice(0, slashIdx);
    const skill = skillPart.slice(slashIdx + 1);
    if (!workflow || !skill) return null;
    return { workflow, skill, name };
  }
  return { skill: skillPart, name };
}

/**
 * Resolve a list of skill::element references into their bodies.
 * Looks up each element across the appropriate skill files (handling workflow prefixes
 * and cross-workflow search). Each ref resolves to one entry; not-found refs are surfaced
 * with type "not-found" rather than dropped, so callers can detect and report.
 *
 * Auto-inclusion: when at least one element from a skill is resolved, that skill's
 * global rules are appended to the result with type 'rule' and an "auto: true" marker
 * (skipping rules already explicitly requested). This lets activities reference a
 * single operation and still receive the skill's invariants.
 *
 * No session token required — this is a purely structural lookup.
 */
export async function resolveOperations(
  refs: string[],
  workflowDir: string,
): Promise<ResolvedOperation[]> {
  const results: ResolvedOperation[] = [];
  // Track which (workflow, skill, ruleName) tuples were explicitly requested,
  // so auto-inclusion does not duplicate them.
  const explicitRules = new Set<string>();
  // Track which skills had at least one successful resolution; for each, we will
  // auto-append remaining global rules at the end.
  const touchedSkills = new Map<string, { workflow: string | undefined; skill: string; cached: Skill }>();

  const skillKey = (workflow: string | undefined, skill: string) => `${workflow ?? ''}::${skill}`;
  const ruleKey = (workflow: string | undefined, skill: string, name: string) => `${workflow ?? ''}::${skill}::${name}`;

  for (const ref of refs) {
    const parsed = parseOperationRef(ref);
    if (!parsed) {
      results.push({ source: '', name: '', type: 'not-found', body: null, ref });
      continue;
    }

    const skillResult = await readSkill(
      parsed.workflow ? `${parsed.workflow}/${parsed.skill}` : parsed.skill,
      workflowDir,
    );
    if (!skillResult.success) {
      results.push({ source: parsed.skill, workflow: parsed.workflow, name: parsed.name, type: 'not-found', body: null, ref });
      continue;
    }
    const skill = skillResult.value;

    // Prefer operations, then rules, then errors
    if (skill.operations && parsed.name in skill.operations) {
      results.push({
        source: parsed.skill,
        workflow: parsed.workflow,
        name: parsed.name,
        type: 'operation',
        body: skill.operations[parsed.name],
        ref,
      });
      touchedSkills.set(skillKey(parsed.workflow, parsed.skill), { workflow: parsed.workflow, skill: parsed.skill, cached: skill });
      continue;
    }
    if (skill.rules && parsed.name in skill.rules) {
      explicitRules.add(ruleKey(parsed.workflow, parsed.skill, parsed.name));
      results.push({
        source: parsed.skill,
        workflow: parsed.workflow,
        name: parsed.name,
        type: 'rule',
        body: skill.rules[parsed.name],
        ref,
      });
      touchedSkills.set(skillKey(parsed.workflow, parsed.skill), { workflow: parsed.workflow, skill: parsed.skill, cached: skill });
      continue;
    }
    if (skill.errors && parsed.name in skill.errors) {
      results.push({
        source: parsed.skill,
        workflow: parsed.workflow,
        name: parsed.name,
        type: 'error',
        body: skill.errors[parsed.name],
        ref,
      });
      touchedSkills.set(skillKey(parsed.workflow, parsed.skill), { workflow: parsed.workflow, skill: parsed.skill, cached: skill });
      continue;
    }
    results.push({ source: parsed.skill, workflow: parsed.workflow, name: parsed.name, type: 'not-found', body: null, ref });
  }

  // Auto-append global rules from each touched skill (skipping rules already explicitly requested).
  for (const { workflow, skill: skillId, cached: skill } of touchedSkills.values()) {
    if (!skill.rules) continue;
    for (const [ruleName, ruleBody] of Object.entries(skill.rules)) {
      if (explicitRules.has(ruleKey(workflow, skillId, ruleName))) continue;
      results.push({
        source: skillId,
        workflow,
        name: ruleName,
        type: 'rule',
        body: ruleBody,
        ref: `${workflow ? workflow + '/' : ''}${skillId}::${ruleName}`,
      });
    }
  }

  return results;
}
