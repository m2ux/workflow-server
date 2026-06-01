import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { decodeToonRaw, encodeToon } from '../utils/toon.js';
import type { Skill, ProtocolBlock } from '../schema/skill.schema.js';
import { safeValidateSkill } from '../schema/skill.schema.js';
import { parseActivityFilename } from './filename-utils.js';
import {
  tryLoadMarkdownSkill,
  tryReadMarkdownSkillRaw,
  getWorkflowTechniquesDir,
} from './markdown-skill-loader.js';

/** Environment-driven safety fallback. When set to "true", the loader continues to read legacy TOON
 *  skills as a fallback after the markdown reader misses. Removed in Phase C — defaults off. */
const LEGACY_TOON_ENABLED = process.env['SKILL_LOADER_LEGACY_TOON'] === 'true';

/* -------------------------------------------------------------------------- */
/* TOON-projection delivery (B3)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Project an in-memory Skill object into its TOON wire form.
 *
 * Used by readSkillRaw (and indirectly by get_skill / get_skills / get_workflow's primary-skill preamble)
 * to render markdown-sourced techniques in the same shape consumers parsed pre-migration.
 *
 * Field-ordering follows the canonical SkillSchema field declaration order — encodeToon serialises
 * object keys in insertion order, so we construct the projection with the fields in the intended sequence
 * (id, version, capability, description, then the optional structured fields) instead of letting the
 * caller-built object's accidental key order leak into the wire payload.
 */
export function projectSkillToToon(skill: Skill): string {
  const ordered: Record<string, unknown> = {};
  ordered['id'] = skill.id;
  ordered['version'] = skill.version;
  ordered['capability'] = skill.capability;
  if (skill.description !== undefined) ordered['description'] = skill.description;
  if (skill.inputs !== undefined) ordered['inputs'] = skill.inputs;
  if (skill.protocol !== undefined) ordered['protocol'] = skill.protocol;
  if (skill.output !== undefined) ordered['output'] = skill.output;
  if (skill.rules !== undefined) ordered['rules'] = skill.rules;
  if (skill.errors !== undefined) ordered['errors'] = skill.errors;
  if (skill.resources !== undefined) ordered['resources'] = skill.resources;
  if (skill.operations !== undefined) ordered['operations'] = skill.operations;
  // Trail with the catch-all extension surface — anything an authoring path adds that the canonical
  // ordering above does not cover is still emitted, just at the end.
  for (const key of Object.keys(skill) as (keyof Skill)[]) {
    if (!(key in ordered) && skill[key] !== undefined) {
      ordered[String(key)] = skill[key];
    }
  }
  return encodeToon(ordered);
}

/* -------------------------------------------------------------------------- */
/* Legacy TOON loader (retained behind SKILL_LOADER_LEGACY_TOON until Phase C) */
/* -------------------------------------------------------------------------- */

/** Find a legacy TOON skill file by ID inside the workflow's legacy `skills/` directory. */
async function findLegacySkillFile(skillDir: string, skillId: string): Promise<string | null> {
  if (!existsSync(skillDir)) return null;
  try {
    const files = await readdir(skillDir);
    const matchingFile = files.find((f) => {
      const parsed = parseActivityFilename(f);
      return parsed && parsed.id === skillId;
    });
    return matchingFile ? join(skillDir, matchingFile) : null;
  } catch (error) {
    logWarn('Failed to read legacy skill directory', { skillDir, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

function getWorkflowLegacySkillsDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'skills');
}

async function tryLoadLegacyToonSkill(skillDir: string, skillId: string): Promise<Skill | null> {
  const filePath = await findLegacySkillFile(skillDir, skillId);
  if (!filePath) return null;

  try {
    const content = await readFile(filePath, 'utf-8');
    const decoded = decodeToonRaw(content);
    const result = safeValidateSkill(decoded);
    if (!result.success) {
      logWarn('Legacy TOON skill validation failed', {
        skillId,
        path: filePath,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return null;
    }
    return result.data;
  } catch (error) {
    logWarn('Failed to decode legacy TOON skill', { skillId, path: filePath, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

async function tryReadLegacyToonSkillRaw(skillDir: string, skillId: string): Promise<string | null> {
  const filePath = await findLegacySkillFile(skillDir, skillId);
  if (!filePath) return null;

  try {
    const content = await readFile(filePath, 'utf-8');
    const decoded = decodeToonRaw(content);
    const result = safeValidateSkill(decoded);
    if (!result.success) {
      logWarn('Legacy TOON skill validation failed', {
        skillId,
        path: filePath,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return null;
    }
    return content;
  } catch (error) {
    logWarn('Failed to decode legacy TOON skill', { skillId, path: filePath, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Markdown-first leaf loaders (B2)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Try to load a skill from a workflow's techniques directory, falling back to the legacy TOON
 * `skills/` directory when SKILL_LOADER_LEGACY_TOON is enabled.
 *
 * The signature accepts `workflowDir + workflowId` rather than a pre-joined `skillDir` so a single
 * call site here owns the path layout (techniques vs skills) — callers in readSkill / readSkillRaw
 * don't need to know about either.
 */
async function tryLoadSkillInWorkflow(workflowDir: string, workflowId: string, skillId: string): Promise<Skill | null> {
  try {
    const md = await tryLoadMarkdownSkill(getWorkflowTechniquesDir(workflowDir, workflowId), skillId);
    if (md) return md;
  } catch (error) {
    // Markdown parser surfaced a loud-failure on a malformed technique. Log and treat as "not found"
    // so the caller's Result-typed contract isn't broken by a synchronous throw deep in the parser.
    logWarn('Markdown skill parse error', { skillId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
  if (LEGACY_TOON_ENABLED) {
    return tryLoadLegacyToonSkill(getWorkflowLegacySkillsDir(workflowDir, workflowId), skillId);
  }
  return null;
}

async function tryReadSkillRawInWorkflow(workflowDir: string, workflowId: string, skillId: string): Promise<string | null> {
  try {
    const md = await tryReadMarkdownSkillRaw(getWorkflowTechniquesDir(workflowDir, workflowId), skillId, projectSkillToToon);
    if (md !== null) return md;
  } catch (error) {
    logWarn('Markdown skill parse error', { skillId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
  if (LEGACY_TOON_ENABLED) {
    return tryReadLegacyToonSkillRaw(getWorkflowLegacySkillsDir(workflowDir, workflowId), skillId);
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Listing (used by external callers — preserves the public contract)         */
/* -------------------------------------------------------------------------- */

async function listMarkdownTechniqueIds(techniquesDir: string): Promise<string[]> {
  if (!existsSync(techniquesDir)) return [];
  try {
    const entries = await readdir(techniquesDir, { withFileTypes: true });
    const result = new Set<string>();
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Grouped technique: folder with a TECHNIQUE.md index (SKILL.md transitional).
        const folder = join(techniquesDir, entry.name);
        if (existsSync(join(folder, 'TECHNIQUE.md')) || existsSync(join(folder, 'SKILL.md'))) {
          result.add(entry.name);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Standalone technique: flat <slug>.md. Exclude the workflow-root index and READMEs.
        if (entry.name === 'TECHNIQUE.md' || entry.name === 'README.md') continue;
        result.add(entry.name.replace(/\.md$/, ''));
      }
    }
    return [...result].sort();
  } catch (error) {
    logWarn('Failed to list markdown techniques', { techniquesDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

async function listLegacyToonSkillIds(skillDir: string): Promise<string[]> {
  if (!existsSync(skillDir)) return [];
  try {
    const files = await readdir(skillDir);
    return files
      .map((f) => parseActivityFilename(f)?.id)
      .filter((id): id is string => id !== undefined)
      .sort();
  } catch (error) {
    logWarn('Failed to list legacy TOON skills', { skillDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/**
 * List skill IDs available in a workflow's techniques (or legacy skills) directory.
 * Markdown techniques are the primary source; legacy TOON ids are appended when the safety flag is on.
 */
export async function listWorkflowSkillIds(workflowDir: string, workflowId: string): Promise<string[]> {
  const md = await listMarkdownTechniqueIds(getWorkflowTechniquesDir(workflowDir, workflowId));
  if (md.length > 0 || !LEGACY_TOON_ENABLED) return md;
  return listLegacyToonSkillIds(getWorkflowLegacySkillsDir(workflowDir, workflowId));
}

/* -------------------------------------------------------------------------- */
/* Public read API with workflow-local → meta precedence (B4)                  */
/* -------------------------------------------------------------------------- */

const META_WORKFLOW_ID = 'meta';

/**
 * Read a skill by ID.
 *
 * Resolution order:
 *   0. Explicit prefix (`{workflow}/{skillId}`): load only from that workflow's techniques folder.
 *   1. Workflow-local (workflowId provided): `{workflowDir}/{workflowId}/techniques/{skillId}/SKILL.md`.
 *   2. Meta fallback: `{workflowDir}/meta/techniques/{skillId}/SKILL.md`.
 *
 * The legacy cross-workflow scan-all fallback is gone; meta now plays the explicit shared-layer role.
 * When SKILL_LOADER_LEGACY_TOON is on, every step above also tries the workflow's `skills/` TOON
 * directory as a safety net.
 */
export async function readSkill(
  skillId: string,
  workflowDir: string,
  workflowId?: string,
): Promise<Result<Skill, SkillNotFoundError>> {
  if (skillId.includes('/')) {
    const [targetWorkflow, actualSkillId] = skillId.split('/', 2);
    if (!targetWorkflow || !actualSkillId) {
      return err(new SkillNotFoundError(skillId));
    }
    const skill = await tryLoadSkillInWorkflow(workflowDir, targetWorkflow, actualSkillId);
    if (skill) {
      logInfo('Skill loaded (explicit prefix)', { id: skillId, targetWorkflow });
      return ok(skill);
    }
    return err(new SkillNotFoundError(skillId));
  }

  if (workflowId) {
    const local = await tryLoadSkillInWorkflow(workflowDir, workflowId, skillId);
    if (local) {
      logInfo('Skill loaded (workflow-local)', { id: skillId, workflowId });
      return ok(local);
    }
  }

  // Fall back to the meta shared layer (unless the caller already targeted meta).
  if (workflowId !== META_WORKFLOW_ID) {
    const shared = await tryLoadSkillInWorkflow(workflowDir, META_WORKFLOW_ID, skillId);
    if (shared) {
      logInfo('Skill loaded (meta shared layer)', { id: skillId, workflowId: workflowId ?? '(none)' });
      return ok(shared);
    }
  }

  return err(new SkillNotFoundError(skillId));
}

/**
 * Read a skill's projected TOON wire form by ID. Same precedence as readSkill.
 *
 * The output is the projection `projectSkillToToon(loadedSkill)` for markdown techniques, or the
 * original on-disk TOON for legacy skills (when SKILL_LOADER_LEGACY_TOON is on). Either way it
 * decodes back to a Skill object that validates against SkillSchema.
 */
export async function readSkillRaw(
  skillId: string,
  workflowDir: string,
  workflowId?: string,
): Promise<Result<string, SkillNotFoundError>> {
  if (skillId.includes('/')) {
    const [targetWorkflow, actualSkillId] = skillId.split('/', 2);
    if (!targetWorkflow || !actualSkillId) {
      return err(new SkillNotFoundError(skillId));
    }
    const raw = await tryReadSkillRawInWorkflow(workflowDir, targetWorkflow, actualSkillId);
    if (raw !== null) {
      logInfo('Skill loaded raw (explicit prefix)', { id: skillId, targetWorkflow });
      return ok(raw);
    }
    return err(new SkillNotFoundError(skillId));
  }

  if (workflowId) {
    const local = await tryReadSkillRawInWorkflow(workflowDir, workflowId, skillId);
    if (local !== null) {
      logInfo('Skill loaded raw (workflow-local)', { id: skillId, workflowId });
      return ok(local);
    }
  }

  if (workflowId !== META_WORKFLOW_ID) {
    const shared = await tryReadSkillRawInWorkflow(workflowDir, META_WORKFLOW_ID, skillId);
    if (shared !== null) {
      logInfo('Skill loaded raw (meta shared layer)', { id: skillId, workflowId: workflowId ?? '(none)' });
      return ok(shared);
    }
  }

  return err(new SkillNotFoundError(skillId));
}

/* -------------------------------------------------------------------------- */
/* Operations resolution (unchanged in shape — only the underlying load layer  */
/* has flipped from TOON to markdown).                                         */
/* -------------------------------------------------------------------------- */

export interface ResolvedOperation {
  source: string;
  workflow?: string | undefined;
  name: string;
  type: 'operation' | 'rule' | 'error' | 'not-found';
  body: unknown;
  ref: string;
}

function parseOperationRef(ref: string): { workflow?: string; skill: string; name: string } | null {
  const sepIdx = ref.indexOf('::');
  if (sepIdx < 0) return null;
  const skillPart = ref.slice(0, sepIdx);
  const name = ref.slice(sepIdx + 2);
  if (!name) return null;

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
 *
 * Behaviour preserved verbatim from the pre-migration loader — only the underlying skill load
 * is now markdown-sourced. Auto-inclusion of global rules and the not-found surfacing both stay.
 */
export async function resolveOperations(
  refs: string[],
  workflowDir: string,
): Promise<ResolvedOperation[]> {
  const results: ResolvedOperation[] = [];
  const explicitRules = new Set<string>();
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

/* -------------------------------------------------------------------------- */
/* Technique composition — root-contract inheritance (R4)                      */
/* -------------------------------------------------------------------------- */

/** Filename stem of the per-workflow root index. Loadable for its contract, but never an
 *  addressable technique (excluded from listWorkflowSkillIds). */
const ROOT_INDEX_ID = 'TECHNIQUE';

/** Union two id-keyed arrays (inputs/outputs); child entries override parent entries by `id`. */
function mergeById<T extends { id: string }>(parent: T[] | undefined, child: T[] | undefined): T[] | undefined {
  if (!parent?.length && !child?.length) return undefined;
  const map = new Map<string, T>();
  for (const e of parent ?? []) map.set(e.id, e);
  for (const e of child ?? []) map.set(e.id, e);
  const arr = [...map.values()];
  return arr.length ? arr : undefined;
}

/** Union two name-keyed records (rules/errors); child entries override parent entries by key. */
function mergeKeyed<T>(parent: Record<string, T> | undefined, child: Record<string, T> | undefined): Record<string, T> | undefined {
  if (!parent && !child) return undefined;
  const out: Record<string, T> = { ...(parent ?? {}), ...(child ?? {}) };
  return Object.keys(out).length ? out : undefined;
}

/** Concatenate protocol block lists: ancestor blocks first, then the nested technique's own. */
function concatProtocol(parent: ProtocolBlock[] | undefined, child: ProtocolBlock[] | undefined): ProtocolBlock[] | undefined {
  const arr = [...(parent ?? []), ...(child ?? [])];
  return arr.length ? arr : undefined;
}

/** Load the executing workflow's root index (`techniques/TECHNIQUE.md`) for its contract, or null. */
async function loadWorkflowRoot(workflowDir: string, workflowId: string): Promise<Skill | null> {
  return tryLoadMarkdownSkill(getWorkflowTechniquesDir(workflowDir, workflowId), ROOT_INDEX_ID);
}

/**
 * Compose a technique with its workflow-root base contract (R4).
 *
 * Inheritance is **executing-workflow-only** — `workflowId`'s root, never meta's. Keyed sections
 * (inputs/outputs/rules/errors) union with the technique-local entry overriding; protocol blocks are
 * prepended (root → technique) preserving order (the array order IS the renumbering). The technique's
 * operations recursively inherit the composed technique's rules/errors and protocol preamble.
 */
export async function composeTechnique(
  techniqueId: string,
  workflowDir: string,
  workflowId: string,
): Promise<Result<Skill, SkillNotFoundError>> {
  const base = await readSkill(techniqueId, workflowDir, workflowId);
  if (!base.success) return base;
  const skill = base.value;

  const root = await loadWorkflowRoot(workflowDir, workflowId);
  if (!root || root.id === skill.id) return ok(skill); // no root, or the skill IS the root index

  const composed: Record<string, unknown> = { ...skill };
  const inputs = mergeById(root.inputs, skill.inputs);
  const output = mergeById(root.output, skill.output);
  const rules = mergeKeyed(root.rules, skill.rules);
  const errors = mergeKeyed(root.errors, skill.errors);
  const protocol = concatProtocol(root.protocol, skill.protocol);
  if (inputs) composed['inputs'] = inputs; else delete composed['inputs'];
  if (output) composed['output'] = output; else delete composed['output'];
  if (rules) composed['rules'] = rules; else delete composed['rules'];
  if (errors) composed['errors'] = errors; else delete composed['errors'];
  if (protocol) composed['protocol'] = protocol; else delete composed['protocol'];

  if (skill.operations) {
    const ops: Record<string, unknown> = {};
    for (const [name, opRaw] of Object.entries(skill.operations)) {
      const op = opRaw as Record<string, unknown>;
      const composedOp: Record<string, unknown> = { ...op };
      const opRules = mergeKeyed(rules as Record<string, unknown> | undefined, op['rules'] as Record<string, unknown> | undefined);
      const opErrors = mergeKeyed(errors as Record<string, unknown> | undefined, op['errors'] as Record<string, unknown> | undefined);
      const opProtocol = concatProtocol(protocol, op['protocol'] as ProtocolBlock[] | undefined);
      if (opRules) composedOp['rules'] = opRules;
      if (opErrors) composedOp['errors'] = opErrors;
      if (opProtocol) composedOp['protocol'] = opProtocol;
      ops[name] = composedOp;
    }
    composed['operations'] = ops;
  }

  const result = safeValidateSkill(composed);
  if (!result.success) {
    logWarn('Composed technique failed validation; returning uncomposed', {
      techniqueId,
      workflowId,
      errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return ok(skill);
  }
  return ok(result.data);
}

/**
 * Shape a resolved-operations array for tool-response output.
 * Bundle shape is wire-stable — no markdown-migration-driven changes.
 */
export function formatOperationsBundle(resolved: ResolvedOperation[]): Record<string, unknown> {
  const operations: Record<string, unknown> = {};
  const errors: Record<string, unknown> = {};
  const rules: Array<[string, string]> = [];
  const unresolved: string[] = [];

  for (const entry of resolved) {
    if (entry.type === 'operation') {
      operations[`${entry.source}::${entry.name}`] = entry.body;
    } else if (entry.type === 'error') {
      errors[`${entry.source}::${entry.name}`] = entry.body;
    } else if (entry.type === 'rule') {
      const lines = Array.isArray(entry.body) ? entry.body : [entry.body];
      for (const line of lines) {
        rules.push([entry.name, String(line)]);
      }
    } else {
      unresolved.push(entry.ref);
    }
  }

  const out: Record<string, unknown> = {};
  if (Object.keys(operations).length > 0) out['operations'] = operations;
  if (rules.length > 0) out['rules'] = rules;
  if (Object.keys(errors).length > 0) out['errors'] = errors;
  if (unresolved.length > 0) out['unresolved'] = unresolved;
  return out;
}
