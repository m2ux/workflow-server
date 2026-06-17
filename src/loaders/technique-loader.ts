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
  if (technique.outputs !== undefined) ordered['outputs'] = technique.outputs;
  if (technique.rules !== undefined) ordered['rules'] = technique.rules;
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
 *   1. Workflow-local (workflowId provided): `{workflowDir}/{workflowId}/techniques/{techniqueId}.md` (flat) or `.../{techniqueId}/TECHNIQUE.md` (grouped).
 *   2. Meta fallback: `{workflowDir}/meta/techniques/{techniqueId}.md` or `.../{techniqueId}/TECHNIQUE.md`.
 *
 * Meta is the shared layer: an unprefixed reference resolves current-workflow-first, then meta.
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

  // Handle nested :: path (group::op or deeper group::subgroup::op).
  if (techniqueId.includes('::')) {
    const segs = techniqueId.split('::');
    // A leading segment that names a real workflow's techniques directory is a CROSS-WORKFLOW
    // prefix (`workflow::technique` or `workflow::group::op`): resolve the remainder within THAT
    // workflow exactly, with no meta fallback — mirroring the legacy `/` explicit-prefix form and
    // parseTechniquePath, so the canonical `::` form resolves identically on the bundle
    // (resolveTechniques) and standalone (composeTechnique / get_technique) paths.
    if (segs.length >= 2 && existsSync(getWorkflowTechniquesDir(workflowDir, segs[0]!))) {
      const targetWorkflow = segs[0]!;
      const rest = segs.slice(1);
      try {
        const t = rest.length === 1
          ? await tryLoadSkillInWorkflow(workflowDir, targetWorkflow, rest[0]!)
          : await tryLoadNestedTechnique(getWorkflowTechniquesDir(workflowDir, targetWorkflow), rest[0]!, rest.slice(1).join('/'));
        if (t) {
          logInfo('Technique loaded (cross-workflow ::)', { id: techniqueId, targetWorkflow });
          return ok(t);
        }
      } catch (error) {
        if (!(error instanceof MarkdownTechniqueParseError)) throw error;
        logWarn('Malformed nested technique file', { techniqueId, workflowId: targetWorkflow, error: error instanceof Error ? error.message : String(error) });
      }
      return err(new TechniqueNotFoundError(techniqueId));
    }

    const group = segs[0]!;
    const opPath = segs.slice(1).join('/');
    const candidates = workflowId && workflowId !== META_WORKFLOW_ID ? [workflowId, META_WORKFLOW_ID] : [META_WORKFLOW_ID];
    for (const wf of candidates) {
      try {
        const t = await tryLoadNestedTechnique(getWorkflowTechniquesDir(workflowDir, wf), group, opPath);
        if (t) {
          logInfo('Technique loaded (nested)', { id: techniqueId, workflowId: wf });
          return ok(t);
        }
      } catch (error) {
        if (!(error instanceof MarkdownTechniqueParseError)) throw error;
        logWarn('Malformed nested technique file', { techniqueId, workflowId: wf, error: error instanceof Error ? error.message : String(error) });
      }
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
 * The output is the projection `projectTechniqueToToon(loadedTechnique)`, which decodes back to a
 * Technique object that validates against TechniqueSchema.
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
  type: 'rule' | 'technique' | 'not-found';
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
  if (t.inputs) body['inputs'] = t.inputs;
  if (t.protocol) body['protocol'] = t.protocol;
  if (t.outputs) body['outputs'] = t.outputs;
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
        const wholeDir = getWorkflowTechniquesDir(workflowDir, path.workflow ?? currentWorkflow ?? META_WORKFLOW_ID);
        const body = await composeLoaded(tRes.value, [path.technique], wholeDir);
        results.push({ source: path.technique, workflow: path.workflow, name: '', type: 'technique', body: projectTechniqueBody(body), ref });
        touchedSkills.set(skillKey(path.workflow, path.technique), { workflow: path.workflow, technique: path.technique, cached: tRes.value });
      } else {
        results.push({ source: path.technique, workflow: path.workflow, name: '', type: 'not-found', body: null, ref });
      }
      continue;
    }

    // Nested reference — resolved below as a `<group>/<op>.md` technique file, else a rule.
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
      const nestedDir = getWorkflowTechniquesDir(workflowDir, opWorkflow ?? META_WORKFLOW_ID);
      const pathSegments = [parsed.technique, ...parsed.name.split('/')];
      const body = await composeLoaded(nested, pathSegments, nestedDir);
      results.push({ source: parsed.technique, workflow: opWorkflow, name: parsed.name, type: 'technique', body: projectTechniqueBody(body), ref });
      touchedSkills.set(skillKey(opWorkflow, `${parsed.technique}::${parsed.name}`), { workflow: opWorkflow, technique: `${parsed.technique}::${parsed.name}`, cached: nested });
      const idxRef = opWorkflow ? `${opWorkflow}/${parsed.technique}` : parsed.technique;
      const idxResult = await readTechnique(idxRef, workflowDir);
      if (idxResult.success) {
        touchedSkills.set(skillKey(opWorkflow, parsed.technique), { workflow: opWorkflow, technique: parsed.technique, cached: idxResult.value });
      }
      continue;
    }

    // 2. Rule on the technique index.
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

  // Mirror composeTechnique: include the executing workflow-root contract rules in every bundle.
  // Inserted into touchedSkills before the auto-include pass so the existing dedup logic applies.
  if (currentWorkflow) {
    const rootKey = skillKey(currentWorkflow, ROOT_INDEX_ID);
    if (!touchedSkills.has(rootKey)) {
      const root = await loadWorkflowRoot(workflowDir, currentWorkflow);
      if (root) {
        touchedSkills.set(rootKey, { workflow: currentWorkflow, technique: ROOT_INDEX_ID, cached: root });
      }
    }
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

/** Protocol blocks whose (ordinal-stripped) title names a thematic wrapper, case-insensitive. */
function blocksTitled(protocol: ProtocolBlock[] | undefined, title: string): ProtocolBlock[] {
  const want = title.toLowerCase();
  return (protocol ?? []).filter((b) => (b.title ?? '').trim().toLowerCase() === want);
}

/**
 * Wrap a technique's own protocol with the `Initial`/`Final` blocks of each ANCESTOR container,
 * recursively from the workflow root inward. Every ancestor — the workflow-root `TECHNIQUE.md`
 * and each containing group's `TECHNIQUE.md` along the path — contributes ONLY its `Initial`
 * blocks (prepended) and `Final` blocks (appended). Any OTHER ancestor block is parent-only: it
 * is excluded here and appears solely when that ancestor is referenced directly. Order:
 * root.Initial … innermostParent.Initial, own protocol, innermostParent.Final … root.Final.
 *
 * `pathSegments` is the technique's location under `techniquesDir`; the LAST segment is the
 * technique itself (never an ancestor). e.g. ['cargo-operations','check'] or ['classify-problem'].
 */
async function wrapProtocolWithAncestors(
  techniquesDir: string,
  pathSegments: string[],
  ownProtocol: ProtocolBlock[] | undefined,
): Promise<ProtocolBlock[] | undefined> {
  const ancestorProtocols: Array<ProtocolBlock[] | undefined> = [];
  const loadAncestor = async (id: string): Promise<void> => {
    try {
      const t = await tryLoadMarkdownTechnique(techniquesDir, id);
      if (t) ancestorProtocols.push(t.protocol);
    } catch (error) {
      if (!(error instanceof MarkdownTechniqueParseError)) throw error;
      logWarn('Skipping malformed ancestor technique while composing protocol', { id, error: error.message });
    }
  };
  // Workflow root index — ancestor of every technique except itself.
  if (!(pathSegments.length === 1 && pathSegments[0] === ROOT_INDEX_ID)) {
    await loadAncestor(ROOT_INDEX_ID);
  }
  // Each containing group along the path (every prefix except the technique itself).
  for (let i = 0; i < pathSegments.length - 1; i++) {
    await loadAncestor(pathSegments.slice(0, i + 1).join('/'));
  }

  const initials = ancestorProtocols.flatMap((p) => blocksTitled(p, 'Initial'));
  const finals = [...ancestorProtocols].reverse().flatMap((p) => blocksTitled(p, 'Final'));
  const composed = [...initials, ...(ownProtocol ?? []), ...finals];
  return composed.length > 0 ? composed : undefined;
}

/** Load the executing workflow's root index (`techniques/TECHNIQUE.md`) for its contract, or null. */
async function loadWorkflowRoot(workflowDir: string, workflowId: string): Promise<Technique | null> {
  return tryLoadMarkdownTechnique(getWorkflowTechniquesDir(workflowDir, workflowId), ROOT_INDEX_ID);
}

/**
 * Apply the full ancestor-chain contract to an already-loaded technique.
 *
 * Loads every ancestor container reachable from `techniquesDir` along `pathSegments` — the
 * workflow root (`TECHNIQUE.md`) and each containing group — then:
 *   - Merges inputs/outputs/rules: ancestor provides the base, closer ancestors override,
 *     the technique itself wins (outermost-first merge, reversed so each mergeById call
 *     treats the ancestor as "parent" and the accumulated value as "child").
 *   - Wraps the protocol with every ancestor's `Initial`/`Final` blocks via
 *     `wrapProtocolWithAncestors` (same full-chain order as the bundle path).
 *
 * Used by both `composeTechnique` (get_technique path) and `resolveTechniques` (bundle path)
 * so the two delivery paths share a single composition implementation.
 *
 * Returns the original technique unchanged on validation failure.
 */
async function composeLoaded(
  technique: Technique,
  pathSegments: string[],
  techniquesDir: string,
): Promise<Technique> {
  if (pathSegments.length === 1 && pathSegments[0] === ROOT_INDEX_ID) return technique;

  const ancestors: Technique[] = [];
  const loadAnc = async (id: string): Promise<void> => {
    try {
      const t = await tryLoadMarkdownTechnique(techniquesDir, id);
      if (t && t.id !== technique.id) ancestors.push(t);
    } catch (e) {
      if (!(e instanceof MarkdownTechniqueParseError)) throw e;
      logWarn('Skipping malformed ancestor while composing', { id, error: (e as Error).message });
    }
  };
  await loadAnc(ROOT_INDEX_ID);
  for (let i = 0; i < pathSegments.length - 1; i++) {
    await loadAnc(pathSegments.slice(0, i + 1).join('/'));
  }
  if (ancestors.length === 0) return technique;

  // Merge outermost-first: reversing puts innermost first so each mergeById(ancestor, acc)
  // call treats the ancestor as "parent" (provides base) and acc as "child" (wins).
  // Final precedence: technique > innermost ancestor > ... > workflow root.
  let inputs = technique.inputs;
  let outputs = technique.outputs;
  let rules = technique.rules;
  for (const anc of [...ancestors].reverse()) {
    inputs = mergeById(anc.inputs, inputs);
    outputs = mergeById(anc.outputs, outputs);
    rules = mergeKeyed(anc.rules, rules);
  }

  const protocol = await wrapProtocolWithAncestors(techniquesDir, pathSegments, technique.protocol);

  const composed: Record<string, unknown> = { ...technique };
  if (inputs) composed['inputs'] = inputs; else delete composed['inputs'];
  if (outputs) composed['outputs'] = outputs; else delete composed['outputs'];
  if (rules) composed['rules'] = rules; else delete composed['rules'];
  if (protocol) composed['protocol'] = protocol; else delete composed['protocol'];

  const result = safeValidateTechnique(composed);
  if (!result.success) {
    logWarn('Composed technique failed validation; returning uncomposed', {
      id: technique.id,
      errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return technique;
  }
  return result.data;
}

/**
 * Load and compose a technique with the full ancestor-chain contract from its executing workflow.
 *
 * Accepts plain IDs, `workflow/id` cross-workflow prefixes, and `group::op` nested paths.
 * Delegates composition to `composeLoaded` — the single implementation shared with the bundle
 * path (`resolveTechniques`). Both paths therefore produce identical inputs/outputs, rules, and
 * protocol (full Initial/Final wrap across the ancestor chain).
 */
export async function composeTechnique(
  techniqueId: string,
  workflowDir: string,
  workflowId: string,
): Promise<Result<Technique, TechniqueNotFoundError>> {
  const base = await readTechnique(techniqueId, workflowDir, workflowId);
  if (!base.success) return base;

  // Derive path segments within the workflow's techniques directory.
  // Strip any leading 'workflow/' cross-workflow prefix, then split on '::'.
  const rawId = techniqueId.includes('/') ? (techniqueId.split('/', 2)[1] ?? techniqueId) : techniqueId;
  const pathSegments = rawId.split('::').filter(s => s.length > 0);
  const techniquesDir = getWorkflowTechniquesDir(workflowDir, workflowId);

  return ok(await composeLoaded(base.value, pathSegments, techniquesDir));
}

/**
 * Shape a resolved-operations array for tool-response output.
 * Bundle shape is wire-stable — no markdown-migration-driven changes.
 */
export function formatTechniqueBundle(resolved: ResolvedTechnique[]): Record<string, unknown> {
  const techniques: Record<string, unknown> = {};
  const rules: Array<[string, string]> = [];
  const unresolved: string[] = [];

  for (const entry of resolved) {
    if (entry.type === 'technique') {
      // A technique is keyed by its full path. A nested technique carries a `name` (the op),
      // appended as `::name`; a standalone has an empty name. No separate sub-technique bucket.
      const base = entry.workflow ? `${entry.workflow}/${entry.source}` : entry.source;
      techniques[entry.name ? `${base}::${entry.name}` : base] = entry.body;
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
  if (unresolved.length > 0) out['unresolved'] = unresolved;
  return out;
}
