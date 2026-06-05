import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { TechniqueNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { encodeToon } from '../utils/toon.js';
import type { Technique, ProtocolBlock } from '../schema/technique.schema.js';
import { safeValidateTechnique } from '../schema/technique.schema.js';
import {
  tryLoadMarkdownTechnique,
  tryReadMarkdownTechniqueRaw,
  tryLoadNestedTechnique,
  getWorkflowTechniquesDir,
  MarkdownTechniqueParseError,
} from './markdown-technique-loader.js';

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
 * (id, version, capability, then the optional structured fields) instead of letting the
 * caller-built object's accidental key order leak into the wire payload.
 */
export function projectTechniqueToToon(technique: Technique): string {
  const ordered: Record<string, unknown> = {};
  ordered['id'] = technique.id;
  ordered['version'] = technique.version;
  ordered['capability'] = technique.capability;
  if (technique.inputs !== undefined) ordered['inputs'] = technique.inputs;
  if (technique.protocol !== undefined) ordered['protocol'] = technique.protocol;
  if (technique.output !== undefined) ordered['output'] = technique.output;
  if (technique.rules !== undefined) ordered['rules'] = technique.rules;
  if (technique.errors !== undefined) ordered['errors'] = technique.errors;
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
/* Markdown leaf loaders                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Try to load a technique from a workflow's techniques directory.
 * Accepts `workflowDir + workflowId` so this call site owns the `techniques/` path layout —
 * callers in readTechnique / readTechniqueRaw don't need to know it.
 */
async function tryLoadSkillInWorkflow(workflowDir: string, workflowId: string, techniqueId: string): Promise<Technique | null> {
  try {
    return await tryLoadMarkdownTechnique(getWorkflowTechniquesDir(workflowDir, workflowId), techniqueId);
  } catch (error) {
    // Markdown parser surfaced a loud-failure on a malformed technique. Log and treat as "not found"
    // so the caller's Result-typed contract isn't broken by a synchronous throw deep in the parser.
    logWarn('Markdown technique parse error', { techniqueId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

async function tryReadSkillRawInWorkflow(workflowDir: string, workflowId: string, techniqueId: string): Promise<string | null> {
  try {
    return await tryReadMarkdownTechniqueRaw(getWorkflowTechniquesDir(workflowDir, workflowId), techniqueId, projectTechniqueToToon);
  } catch (error) {
    logWarn('Markdown technique parse error', { techniqueId, workflowId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
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
        // Grouped technique: folder with a TECHNIQUE.md index.
        if (existsSync(join(techniquesDir, entry.name, 'TECHNIQUE.md'))) {
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

/**
 * List technique IDs available in a workflow's techniques directory.
 */
export async function listWorkflowTechniqueIds(workflowDir: string, workflowId: string): Promise<string[]> {
  return listMarkdownTechniqueIds(getWorkflowTechniquesDir(workflowDir, workflowId));
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

export interface ResolvedTechnique {
  source: string;
  workflow?: string | undefined;
  name: string;
  type: 'rule' | 'error' | 'technique' | 'not-found';
  body: unknown;
  ref: string;
}

/**
 * The deliverable body of a technique reference (protocol + interface). One projection for ALL
 * techniques — standalone or nested. A nested technique ("sub-technique" informally) is just a
 * technique; its rules surface as `rule` entries via the auto-include pass, exactly like a
 * standalone technique's, rather than being inlined here.
 */
function projectTechniqueBody(t: Technique): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (t.capability) body['capability'] = t.capability;
  if (t.flow) body['flow'] = t.flow;
  if (t.inputs) body['inputs'] = t.inputs;
  if (t.protocol) body['protocol'] = t.protocol;
  if (t.output) body['output'] = t.output;
  // Errors are delivered in-body for every technique (rules go via the auto-include pass, so
  // they are NOT duplicated here; errors have no auto-include, so no duplication risk).
  if (t.errors) body['errors'] = t.errors;
  return body;
}

/**
 * Parse a technique reference path. The canonical form is a `::`-delimited path
 * `[workflow::]technique[::sub-technique[::...]]`. The parent workflow is
 * IMPLICIT for same-workflow refs (omit it — the current workflow is filled in
 * at resolution); include it only to reach another workflow. Legacy
 * `workflow/technique` is accepted and normalised.
 *
 * Returns `subName` = undefined for a whole-technique ref (deliver its protocol),
 * or the `/`-joined sub-technique path for a sub-technique/rule ref.
 */
function parseTechniquePath(ref: string, workflowDir: string): { workflow?: string | undefined; technique: string; subName?: string | undefined } | null {
  // Normalise a legacy `workflow/technique` leading segment to `workflow::technique`.
  const head = ref.split('::', 1)[0] ?? ref;
  let normalized = ref;
  if (head.includes('/')) {
    const slash = head.indexOf('/');
    normalized = `${head.slice(0, slash)}::${head.slice(slash + 1)}${ref.slice(head.length)}`;
  }
  const segs = normalized.split('::').filter(s => s.length > 0);
  if (segs.length === 0) return null;
  // Canonical leading-workflow segment (only when explicitly a known workflow);
  // otherwise the parent workflow stays implicit (resolved current-first).
  let workflow: string | undefined;
  if (segs.length >= 2 && existsSync(getWorkflowTechniquesDir(workflowDir, segs[0] as string))) {
    workflow = segs.shift();
  }
  const technique = segs[0];
  if (!technique) return null;
  return { workflow, technique, subName: segs.length > 1 ? segs.slice(1).join('/') : undefined };
}

/**
 * Resolve a list of technique::element references into their bodies.
 *
 * Behaviour preserved verbatim from the pre-migration loader — only the underlying technique load
 * is now markdown-sourced. Auto-inclusion of global rules and the not-found surfacing both stay.
 */
export async function resolveTechniques(
  refs: string[],
  workflowDir: string,
  currentWorkflow?: string,
): Promise<ResolvedTechnique[]> {
  const results: ResolvedTechnique[] = [];
  const explicitRules = new Set<string>();
  const touchedSkills = new Map<string, { workflow: string | undefined; technique: string; cached: Technique }>();

  const skillKey = (workflow: string | undefined, technique: string) => `${workflow ?? ''}::${technique}`;
  const ruleKey = (workflow: string | undefined, technique: string, name: string) => `${workflow ?? ''}::${technique}::${name}`;

  for (const ref of refs) {
    const path = parseTechniquePath(ref, workflowDir);
    if (!path) {
      results.push({ source: '', name: '', type: 'not-found', body: null, ref });
      continue;
    }

    // Whole-technique reference (no sub-technique segment): deliver the technique's
    // own protocol, capability and interface (standalone OR grouped parent) and
    // auto-include its rules. A technique IS deliverable — not just its subs. The
    // parent workflow is implicit (current-first) unless the path names one.
    if (path.subName === undefined) {
      const tRes = await readTechnique(path.workflow ? `${path.workflow}/${path.technique}` : path.technique, workflowDir, path.workflow ?? currentWorkflow);
      if (tRes.success) {
        results.push({ source: path.technique, workflow: path.workflow, name: '', type: 'technique', body: projectTechniqueBody(tRes.value), ref });
        touchedSkills.set(skillKey(path.workflow, path.technique), { workflow: path.workflow, technique: path.technique, cached: tRes.value });
      } else {
        results.push({ source: path.technique, workflow: path.workflow, name: '', type: 'not-found', body: null, ref });
      }
      continue;
    }

    // Nested reference — resolved below as a `<group>/<op>.md` technique file, else a rule/error.
    const parsed = { workflow: path.workflow, technique: path.technique, name: path.subName };

    const techRef = parsed.workflow ? `${parsed.workflow}/${parsed.technique}` : parsed.technique;

    // 1. Nested technique: a `<group>/<op>.md` file. A `workflow/technique::op` prefix targets
    //    that workflow exactly. For an UNPREFIXED ref, the convention is "the current workflow's
    //    own technique" — so try the current workflow FIRST (its technique shadows a same-named
    //    meta one), then fall back to meta. A nested technique is just a technique.
    //    `undefined` in the candidate list means "meta (bare ref)".
    const candidates: Array<string | undefined> = parsed.workflow
      ? [parsed.workflow]
      : (currentWorkflow && currentWorkflow !== META_WORKFLOW_ID ? [currentWorkflow, undefined] : [undefined]);
    let nested: Technique | null = null;
    let opWorkflow = parsed.workflow; // workflow where the nested technique was found
    for (const wf of candidates) {
      try {
        const t = await tryLoadNestedTechnique(getWorkflowTechniquesDir(workflowDir, wf ?? META_WORKFLOW_ID), parsed.technique, parsed.name);
        if (t) { nested = t; opWorkflow = wf; break; }
      } catch (error) {
        if (!(error instanceof MarkdownTechniqueParseError)) throw error;
        logWarn('Malformed nested technique file', { ref, error: error.message });
      }
    }
    if (nested) {
      results.push({ source: parsed.technique, workflow: opWorkflow, name: parsed.name, type: 'technique', body: projectTechniqueBody(nested), ref });
      // A nested technique delivers its own rules the same way a standalone one does — via the
      // auto-include pass below. Cache the nested technique (its own rules) AND its group index
      // (the group's shared rules).
      touchedSkills.set(skillKey(opWorkflow, `${parsed.technique}::${parsed.name}`), { workflow: opWorkflow, technique: `${parsed.technique}::${parsed.name}`, cached: nested });
      const idxRef = opWorkflow ? `${opWorkflow}/${parsed.technique}` : parsed.technique;
      const idxResult = await readTechnique(idxRef, workflowDir);
      if (idxResult.success) {
        touchedSkills.set(skillKey(opWorkflow, parsed.technique), { workflow: opWorkflow, technique: parsed.technique, cached: idxResult.value });
      }
      continue;
    }

    // 2. Rule / error on the technique index.
    const skillResult = await readTechnique(techRef, workflowDir);
    if (!skillResult.success) {
      results.push({ source: parsed.technique, workflow: parsed.workflow, name: parsed.name, type: 'not-found', body: null, ref });
      continue;
    }
    const technique = skillResult.value;

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
    // 3. Group-prefix rule reference: `technique::group` resolves to every rule
    //    named `group-<specifier>`. Markdown techniques flatten a rule group into
    //    individually-headed rules (e.g. checkpoint-discipline → checkpoint-
    //    discipline-workers-yield-only, ...), so a bare group ref must expand to
    //    its members. Scoped to the matched group only (not the whole technique),
    //    so role-specific groups don't leak across worker/orchestrator bundles.
    if (technique.rules) {
      const groupRules = Object.keys(technique.rules).filter(rn => rn.startsWith(`${parsed.name}-`));
      if (groupRules.length > 0) {
        for (const rn of groupRules) {
          explicitRules.add(ruleKey(parsed.workflow, parsed.technique, rn));
          results.push({
            source: parsed.technique,
            workflow: parsed.workflow,
            name: rn,
            type: 'rule',
            body: technique.rules[rn],
            ref: `${techRef}::${rn}`,
          });
        }
        continue;
      }
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
export function formatTechniqueBundle(resolved: ResolvedTechnique[]): Record<string, unknown> {
  const techniques: Record<string, unknown> = {};
  const errors: Record<string, unknown> = {};
  const rules: Array<[string, string]> = [];
  const unresolved: string[] = [];

  for (const entry of resolved) {
    if (entry.type === 'technique') {
      // A technique is keyed by its full path. A nested technique carries a `name` (the op),
      // appended as `::name`; a standalone has an empty name. No separate sub-technique bucket.
      const base = entry.workflow ? `${entry.workflow}/${entry.source}` : entry.source;
      techniques[entry.name ? `${base}::${entry.name}` : base] = entry.body;
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
  if (Object.keys(techniques).length > 0) out['techniques'] = techniques;
  if (rules.length > 0) out['rules'] = rules;
  if (Object.keys(errors).length > 0) out['errors'] = errors;
  if (unresolved.length > 0) out['unresolved'] = unresolved;
  return out;
}
