import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { TechniqueNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { decodeToonRaw, encodeToon } from '../utils/toon.js';
import type { Technique, ProtocolBlock } from '../schema/technique.schema.js';
import { safeValidateTechnique } from '../schema/technique.schema.js';
import { parseActivityFilename } from './filename-utils.js';
import {
  tryLoadMarkdownTechnique,
  tryReadMarkdownTechniqueRaw,
  getWorkflowTechniquesDir,
} from './markdown-technique-loader.js';

/** Environment-driven safety fallback. When set to "true", the loader continues to read legacy TOON
 *  techniques as a fallback after the markdown reader misses. Removed in Phase C — defaults off. */
const LEGACY_TOON_ENABLED = process.env['SKILL_LOADER_LEGACY_TOON'] === 'true';

/* -------------------------------------------------------------------------- */
/* TOON-projection delivery (B3)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Project an in-memory Technique object into its TOON wire form.
 *
 * Used by readTechniqueRaw (and indirectly by get_skill / get_skills / get_workflow's primary-technique preamble)
 * to render markdown-sourced techniques in the same shape consumers parsed pre-migration.
 *
 * Field-ordering follows the canonical TechniqueSchema field declaration order — encodeToon serialises
 * object keys in insertion order, so we construct the projection with the fields in the intended sequence
 * (id, version, capability, description, then the optional structured fields) instead of letting the
 * caller-built object's accidental key order leak into the wire payload.
 */
export function projectTechniqueToToon(technique: Technique): string {
  const ordered: Record<string, unknown> = {};
  ordered['id'] = technique.id;
  ordered['version'] = technique.version;
  ordered['capability'] = technique.capability;
  if (technique.description !== undefined) ordered['description'] = technique.description;
  if (technique.inputs !== undefined) ordered['inputs'] = technique.inputs;
  if (technique.protocol !== undefined) ordered['protocol'] = technique.protocol;
  if (technique.output !== undefined) ordered['output'] = technique.output;
  if (technique.rules !== undefined) ordered['rules'] = technique.rules;
  if (technique.errors !== undefined) ordered['errors'] = technique.errors;
  if (technique.resources !== undefined) ordered['resources'] = technique.resources;
  if (technique.operations !== undefined) ordered['operations'] = technique.operations;
  // Trail with the catch-all extension surface — anything an authoring path adds that the canonical
  // ordering above does not cover is still emitted, just at the end.
  for (const key of Object.keys(technique) as (keyof Technique)[]) {
    if (!(key in ordered) && technique[key] !== undefined) {
      ordered[String(key)] = technique[key];
    }
  }
  return encodeToon(ordered);
}

/* -------------------------------------------------------------------------- */
/* Legacy TOON loader (retained behind SKILL_LOADER_LEGACY_TOON until Phase C) */
/* -------------------------------------------------------------------------- */

/** Find a legacy TOON technique file by ID inside the workflow's legacy `techniques/` directory. */
async function findLegacySkillFile(techniqueDir: string, techniqueId: string): Promise<string | null> {
  if (!existsSync(techniqueDir)) return null;
  try {
    const files = await readdir(techniqueDir);
    const matchingFile = files.find((f) => {
      const parsed = parseActivityFilename(f);
      return parsed && parsed.id === techniqueId;
    });
    return matchingFile ? join(techniqueDir, matchingFile) : null;
  } catch (error) {
    logWarn('Failed to read legacy technique directory', { techniqueDir, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

function getWorkflowLegacySkillsDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'techniques');
}

async function tryLoadLegacyToonSkill(techniqueDir: string, techniqueId: string): Promise<Technique | null> {
  const filePath = await findLegacySkillFile(techniqueDir, techniqueId);
  if (!filePath) return null;

  try {
    const content = await readFile(filePath, 'utf-8');
    const decoded = decodeToonRaw(content);
    const result = safeValidateTechnique(decoded);
    if (!result.success) {
      logWarn('Legacy TOON technique validation failed', {
        techniqueId,
        path: filePath,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return null;
    }
    return result.data;
  } catch (error) {
    logWarn('Failed to decode legacy TOON technique', { techniqueId, path: filePath, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

async function tryReadLegacyToonSkillRaw(techniqueDir: string, techniqueId: string): Promise<string | null> {
  const filePath = await findLegacySkillFile(techniqueDir, techniqueId);
  if (!filePath) return null;

  try {
    const content = await readFile(filePath, 'utf-8');
    const decoded = decodeToonRaw(content);
    const result = safeValidateTechnique(decoded);
    if (!result.success) {
      logWarn('Legacy TOON technique validation failed', {
        techniqueId,
        path: filePath,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return null;
    }
    return content;
  } catch (error) {
    logWarn('Failed to decode legacy TOON technique', { techniqueId, path: filePath, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Markdown-first leaf loaders (B2)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Try to load a technique from a workflow's techniques directory, falling back to the legacy TOON
 * `techniques/` directory when SKILL_LOADER_LEGACY_TOON is enabled.
 *
 * The signature accepts `workflowDir + workflowId` rather than a pre-joined `techniqueDir` so a single
 * call site here owns the path layout (techniques vs techniques) — callers in readTechnique / readTechniqueRaw
 * don't need to know about either.
 */
async function tryLoadSkillInWorkflow(workflowDir: string, workflowId: string, techniqueId: string): Promise<Technique | null> {
  try {
    const md = await tryLoadMarkdownTechnique(getWorkflowTechniquesDir(workflowDir, workflowId), techniqueId);
    if (md) return md;
  } catch (error) {
    // Markdown parser surfaced a loud-failure on a malformed technique. Log and treat as "not found"
    // so the caller's Result-typed contract isn't broken by a synchronous throw deep in the parser.
    logWarn('Markdown technique parse error', { techniqueId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
  if (LEGACY_TOON_ENABLED) {
    return tryLoadLegacyToonSkill(getWorkflowLegacySkillsDir(workflowDir, workflowId), techniqueId);
  }
  return null;
}

async function tryReadSkillRawInWorkflow(workflowDir: string, workflowId: string, techniqueId: string): Promise<string | null> {
  try {
    const md = await tryReadMarkdownTechniqueRaw(getWorkflowTechniquesDir(workflowDir, workflowId), techniqueId, projectTechniqueToToon);
    if (md !== null) return md;
  } catch (error) {
    logWarn('Markdown technique parse error', { techniqueId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
  if (LEGACY_TOON_ENABLED) {
    return tryReadLegacyToonSkillRaw(getWorkflowLegacySkillsDir(workflowDir, workflowId), techniqueId);
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

async function listLegacyToonSkillIds(techniqueDir: string): Promise<string[]> {
  if (!existsSync(techniqueDir)) return [];
  try {
    const files = await readdir(techniqueDir);
    return files
      .map((f) => parseActivityFilename(f)?.id)
      .filter((id): id is string => id !== undefined)
      .sort();
  } catch (error) {
    logWarn('Failed to list legacy TOON techniques', { techniqueDir, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/**
 * List technique IDs available in a workflow's techniques (or legacy techniques) directory.
 * Markdown techniques are the primary source; legacy TOON ids are appended when the safety flag is on.
 */
export async function listWorkflowTechniqueIds(workflowDir: string, workflowId: string): Promise<string[]> {
  const md = await listMarkdownTechniqueIds(getWorkflowTechniquesDir(workflowDir, workflowId));
  if (md.length > 0 || !LEGACY_TOON_ENABLED) return md;
  return listLegacyToonSkillIds(getWorkflowLegacySkillsDir(workflowDir, workflowId));
}

/* -------------------------------------------------------------------------- */
/* Public read API with workflow-local → meta precedence (B4)                  */
/* -------------------------------------------------------------------------- */

const META_WORKFLOW_ID = 'meta';

/**
 * Read a technique by ID.
 *
 * Resolution order:
 *   0. Explicit prefix (`{workflow}/{techniqueId}`): load only from that workflow's techniques folder.
 *   1. Workflow-local (workflowId provided): `{workflowDir}/{workflowId}/techniques/{techniqueId}/SKILL.md`.
 *   2. Meta fallback: `{workflowDir}/meta/techniques/{techniqueId}/SKILL.md`.
 *
 * The legacy cross-workflow scan-all fallback is gone; meta now plays the explicit shared-layer role.
 * When SKILL_LOADER_LEGACY_TOON is on, every step above also tries the workflow's `techniques/` TOON
 * directory as a safety net.
 */
export async function readTechnique(
  techniqueId: string,
  workflowDir: string,
  workflowId?: string,
): Promise<Result<Technique, TechniqueNotFoundError>> {
  if (techniqueId.includes('/')) {
    const [targetWorkflow, actualSkillId] = techniqueId.split('/', 2);
    if (!targetWorkflow || !actualSkillId) {
      return err(new TechniqueNotFoundError(techniqueId));
    }
    const technique = await tryLoadSkillInWorkflow(workflowDir, targetWorkflow, actualSkillId);
    if (technique) {
      logInfo('Technique loaded (explicit prefix)', { id: techniqueId, targetWorkflow });
      return ok(technique);
    }
    return err(new TechniqueNotFoundError(techniqueId));
  }

  if (workflowId) {
    const local = await tryLoadSkillInWorkflow(workflowDir, workflowId, techniqueId);
    if (local) {
      logInfo('Technique loaded (workflow-local)', { id: techniqueId, workflowId });
      return ok(local);
    }
  }

  // Fall back to the meta shared layer (unless the caller already targeted meta).
  if (workflowId !== META_WORKFLOW_ID) {
    const shared = await tryLoadSkillInWorkflow(workflowDir, META_WORKFLOW_ID, techniqueId);
    if (shared) {
      logInfo('Technique loaded (meta shared layer)', { id: techniqueId, workflowId: workflowId ?? '(none)' });
      return ok(shared);
    }
  }

  return err(new TechniqueNotFoundError(techniqueId));
}

/**
 * Read a technique's projected TOON wire form by ID. Same precedence as readTechnique.
 *
 * The output is the projection `projectTechniqueToToon(loadedSkill)` for markdown techniques, or the
 * original on-disk TOON for legacy techniques (when SKILL_LOADER_LEGACY_TOON is on). Either way it
 * decodes back to a Technique object that validates against TechniqueSchema.
 */
export async function readTechniqueRaw(
  techniqueId: string,
  workflowDir: string,
  workflowId?: string,
): Promise<Result<string, TechniqueNotFoundError>> {
  if (techniqueId.includes('/')) {
    const [targetWorkflow, actualSkillId] = techniqueId.split('/', 2);
    if (!targetWorkflow || !actualSkillId) {
      return err(new TechniqueNotFoundError(techniqueId));
    }
    const raw = await tryReadSkillRawInWorkflow(workflowDir, targetWorkflow, actualSkillId);
    if (raw !== null) {
      logInfo('Technique loaded raw (explicit prefix)', { id: techniqueId, targetWorkflow });
      return ok(raw);
    }
    return err(new TechniqueNotFoundError(techniqueId));
  }

  if (workflowId) {
    const local = await tryReadSkillRawInWorkflow(workflowDir, workflowId, techniqueId);
    if (local !== null) {
      logInfo('Technique loaded raw (workflow-local)', { id: techniqueId, workflowId });
      return ok(local);
    }
  }

  if (workflowId !== META_WORKFLOW_ID) {
    const shared = await tryReadSkillRawInWorkflow(workflowDir, META_WORKFLOW_ID, techniqueId);
    if (shared !== null) {
      logInfo('Technique loaded raw (meta shared layer)', { id: techniqueId, workflowId: workflowId ?? '(none)' });
      return ok(shared);
    }
  }

  return err(new TechniqueNotFoundError(techniqueId));
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

function parseOperationRef(ref: string): { workflow?: string; technique: string; name: string } | null {
  const sepIdx = ref.indexOf('::');
  if (sepIdx < 0) return null;
  const skillPart = ref.slice(0, sepIdx);
  const name = ref.slice(sepIdx + 2);
  if (!name) return null;

  const slashIdx = skillPart.indexOf('/');
  if (slashIdx > 0) {
    const workflow = skillPart.slice(0, slashIdx);
    const technique = skillPart.slice(slashIdx + 1);
    if (!workflow || !technique) return null;
    return { workflow, technique, name };
  }
  return { technique: skillPart, name };
}

/**
 * Resolve a list of technique::element references into their bodies.
 *
 * Behaviour preserved verbatim from the pre-migration loader — only the underlying technique load
 * is now markdown-sourced. Auto-inclusion of global rules and the not-found surfacing both stay.
 */
export async function resolveOperations(
  refs: string[],
  workflowDir: string,
): Promise<ResolvedOperation[]> {
  const results: ResolvedOperation[] = [];
  const explicitRules = new Set<string>();
  const touchedSkills = new Map<string, { workflow: string | undefined; technique: string; cached: Technique }>();

  const skillKey = (workflow: string | undefined, technique: string) => `${workflow ?? ''}::${technique}`;
  const ruleKey = (workflow: string | undefined, technique: string, name: string) => `${workflow ?? ''}::${technique}::${name}`;

  for (const ref of refs) {
    const parsed = parseOperationRef(ref);
    if (!parsed) {
      results.push({ source: '', name: '', type: 'not-found', body: null, ref });
      continue;
    }

    const skillResult = await readTechnique(
      parsed.workflow ? `${parsed.workflow}/${parsed.technique}` : parsed.technique,
      workflowDir,
    );
    if (!skillResult.success) {
      results.push({ source: parsed.technique, workflow: parsed.workflow, name: parsed.name, type: 'not-found', body: null, ref });
      continue;
    }
    const technique = skillResult.value;

    if (technique.operations && parsed.name in technique.operations) {
      results.push({
        source: parsed.technique,
        workflow: parsed.workflow,
        name: parsed.name,
        type: 'operation',
        body: technique.operations[parsed.name],
        ref,
      });
      touchedSkills.set(skillKey(parsed.workflow, parsed.technique), { workflow: parsed.workflow, technique: parsed.technique, cached: technique });
      continue;
    }
    if (technique.rules && parsed.name in technique.rules) {
      explicitRules.add(ruleKey(parsed.workflow, parsed.technique, parsed.name));
      results.push({
        source: parsed.technique,
        workflow: parsed.workflow,
        name: parsed.name,
        type: 'rule',
        body: technique.rules[parsed.name],
        ref,
      });
      touchedSkills.set(skillKey(parsed.workflow, parsed.technique), { workflow: parsed.workflow, technique: parsed.technique, cached: technique });
      continue;
    }
    if (technique.errors && parsed.name in technique.errors) {
      results.push({
        source: parsed.technique,
        workflow: parsed.workflow,
        name: parsed.name,
        type: 'error',
        body: technique.errors[parsed.name],
        ref,
      });
      touchedSkills.set(skillKey(parsed.workflow, parsed.technique), { workflow: parsed.workflow, technique: parsed.technique, cached: technique });
      continue;
    }
    results.push({ source: parsed.technique, workflow: parsed.workflow, name: parsed.name, type: 'not-found', body: null, ref });
  }

  for (const { workflow, technique: techniqueId, cached: technique } of touchedSkills.values()) {
    if (!technique.rules) continue;
    for (const [ruleName, ruleBody] of Object.entries(technique.rules)) {
      if (explicitRules.has(ruleKey(workflow, techniqueId, ruleName))) continue;
      results.push({
        source: techniqueId,
        workflow,
        name: ruleName,
        type: 'rule',
        body: ruleBody,
        ref: `${workflow ? workflow + '/' : ''}${techniqueId}::${ruleName}`,
      });
    }
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Technique composition — root-contract inheritance (R4)                      */
/* -------------------------------------------------------------------------- */

/** Filename stem of the per-workflow root index. Loadable for its contract, but never an
 *  addressable technique (excluded from listWorkflowTechniqueIds). */
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
async function loadWorkflowRoot(workflowDir: string, workflowId: string): Promise<Technique | null> {
  return tryLoadMarkdownTechnique(getWorkflowTechniquesDir(workflowDir, workflowId), ROOT_INDEX_ID);
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
): Promise<Result<Technique, TechniqueNotFoundError>> {
  const base = await readTechnique(techniqueId, workflowDir, workflowId);
  if (!base.success) return base;
  const technique = base.value;

  const root = await loadWorkflowRoot(workflowDir, workflowId);
  if (!root || root.id === technique.id) return ok(technique); // no root, or the technique IS the root index

  const composed: Record<string, unknown> = { ...technique };
  const inputs = mergeById(root.inputs, technique.inputs);
  const output = mergeById(root.output, technique.output);
  const rules = mergeKeyed(root.rules, technique.rules);
  const errors = mergeKeyed(root.errors, technique.errors);
  const protocol = concatProtocol(root.protocol, technique.protocol);
  if (inputs) composed['inputs'] = inputs; else delete composed['inputs'];
  if (output) composed['output'] = output; else delete composed['output'];
  if (rules) composed['rules'] = rules; else delete composed['rules'];
  if (errors) composed['errors'] = errors; else delete composed['errors'];
  if (protocol) composed['protocol'] = protocol; else delete composed['protocol'];

  if (technique.operations) {
    const ops: Record<string, unknown> = {};
    for (const [name, opRaw] of Object.entries(technique.operations)) {
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

  const result = safeValidateTechnique(composed);
  if (!result.success) {
    logWarn('Composed technique failed validation; returning uncomposed', {
      techniqueId,
      workflowId,
      errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return ok(technique);
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
