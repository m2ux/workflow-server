import { type Result, ok, err } from '../result.js';
import { TechniqueNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { stringifyForResponse } from '../utils/serialization.js';
import type { Technique, ProtocolBlock } from '../schema/technique.schema.js';
import { safeValidateTechnique } from '../schema/technique.schema.js';
import {
  tryLoadMarkdownTechnique,
  tryLoadNestedTechnique,
  getNamespaceTechniquesDir,
  MarkdownTechniqueParseError,
} from './markdown-technique-loader.js';
import { type CorpusIndex, indexCorpus } from './corpus-index.js';
import {
  SEGMENT_SEPARATOR,
  type TechniqueRef,
  TechniqueRefError,
  isBareName,
  parseTechniqueRef,
  techniquePath,
  techniqueRef,
} from './technique-ref.js';

/* -------------------------------------------------------------------------- */
/* YAML-projection delivery (B3)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Project an in-memory Technique object into its ordered wire shape.
 *
 * `projectTechnique` returns the ordered record (embedded as-is inside get_activity's
 * `step_techniques` bundle map); `projectTechniqueToYaml` serialises it for the
 * get_technique raw projection.
 *
 * Field-ordering follows the canonical TechniqueSchema field declaration order — stringifyForResponse serialises
 * object keys in insertion order, so we construct the projection with the fields in the intended sequence
 * (id, version, capability, then the optional structured fields) instead of letting the
 * caller-built object's accidental key order leak into the wire payload.
 */
export function projectTechnique(technique: Technique): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  ordered['id'] = technique.id;
  ordered['version'] = technique.version;
  ordered['capability'] = technique.capability;
  // Provenance note ahead of the interface it annotates, so a reader meets the vocabulary first.
  if (technique.provenance_note !== undefined) ordered['provenance_note'] = technique.provenance_note;
  if (technique.inputs !== undefined) ordered['inputs'] = technique.inputs;
  if (technique.inherited_inputs !== undefined) ordered['inherited_inputs'] = technique.inherited_inputs;
  if (technique.protocol !== undefined) ordered['protocol'] = technique.protocol;
  if (technique.outputs !== undefined) ordered['outputs'] = technique.outputs;
  if (technique.inherited_outputs !== undefined) ordered['inherited_outputs'] = technique.inherited_outputs;
  if (technique.rules !== undefined) ordered['rules'] = technique.rules;
  // Trail with the catch-all extension surface — anything an authoring path adds that the canonical
  // ordering above does not cover is still emitted, just at the end.
  for (const key of Object.keys(technique) as (keyof Technique)[]) {
    if (!(key in ordered) && technique[key] !== undefined) {
      ordered[String(key)] = technique[key];
    }
  }
  return ordered;
}

export function projectTechniqueToYaml(technique: Technique): string {
  return stringifyForResponse(projectTechnique(technique));
}

/* -------------------------------------------------------------------------- */
/* Markdown leaf loaders                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Load the technique one reference's segments address inside one namespace, or null where that
 * namespace holds none.
 *
 * A single segment is a standalone `<id>.md` or a grouped `<id>/TECHNIQUE.md` index; deeper
 * segments walk group folders to a `<…>/<op>.md` leaf. A malformed technique FILE is logged and
 * read as "not found", so the Result-typed contract above is not broken by a synchronous throw deep
 * in the markdown parser, and a candidate namespace's bad file does not stop the next candidate.
 */
async function tryLoadInWorkflow(source: CorpusIndex, workflowId: string, segments: string[]): Promise<Technique | null> {
  const dir = getNamespaceTechniquesDir(source, workflowId);
  try {
    return segments.length === 1
      ? await tryLoadMarkdownTechnique(dir, segments[0]!)
      : await tryLoadNestedTechnique(dir, segments[0]!, techniquePath(segments.slice(1)));
  } catch (error) {
    if (!(error instanceof MarkdownTechniqueParseError)) throw error;
    logWarn('Malformed technique file', { technique: techniquePath(segments), workflowId, error: error.message });
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Public read API with workflow-local → meta precedence (B4)                  */
/* -------------------------------------------------------------------------- */

const META_WORKFLOW_ID = 'meta';

/** What a reference can fail as: it addresses nothing, or nothing is there. */
export type TechniqueReadError = TechniqueNotFoundError | TechniqueRefError;

/**
 * The parsed reference, or the rule's refusal as this module's Result error — so a reference no
 * corpus could answer reaches a caller as a value, the way a reference nothing answers to does.
 */
function parseRef(ref: string, index: CorpusIndex): Result<TechniqueRef, TechniqueRefError> {
  try {
    return ok(parseTechniqueRef(ref, index));
  } catch (error) {
    if (!(error instanceof TechniqueRefError)) throw error;
    return err(error);
  }
}

/**
 * The namespaces a reference resolves in, in order.
 *
 * A qualified reference resolves in the namespace it names and nowhere else — a prefix says where
 * the technique lives, so a fallback would deliver a different file under the same reference. A bare
 * one resolves against the referring workflow and then `meta`, the shared layer a workflow's own
 * technique shadows. A caller naming no referring workflow has only the shared layer to read.
 */
function candidateWorkflows(ref: TechniqueRef, workflowId: string | undefined): string[] {
  if (ref.namespace) return [ref.namespace];
  return workflowId && workflowId !== META_WORKFLOW_ID ? [workflowId, META_WORKFLOW_ID] : [META_WORKFLOW_ID];
}

/**
 * Read a technique by reference — `[workflow::]technique[::nested…]`, parsed by the one rule in
 * `technique-ref.ts` and resolved current-workflow-first, then `meta`.
 */
export async function readTechnique(
  techniqueId: string,
  workflowDir: string,
  workflowId?: string,
): Promise<Result<Technique, TechniqueReadError>> {
  const found = await readTechniqueWithSource(techniqueId, workflowDir, workflowId);
  return found.success ? ok(found.value.technique) : found;
}

/**
 * `readTechnique`, plus the workflow the file was found in — which differs from the `workflowId`
 * asked for under a cross-workflow prefix or a meta fallback. This is the id a technique's own bare
 * resource links qualify against.
 */
export async function readTechniqueWithSource(
  techniqueId: string,
  workflowDir: string,
  workflowId?: string,
  index: CorpusIndex = indexCorpus(workflowDir),
): Promise<Result<{ technique: Technique; sourceWorkflowId: string }, TechniqueReadError>> {
  const ref = parseRef(techniqueId, index);
  return ref.success ? readTechniqueRef(ref.value, index, workflowId) : ref;
}

/** `readTechniqueWithSource` over an already-parsed reference. */
async function readTechniqueRef(
  ref: TechniqueRef,
  index: CorpusIndex,
  workflowId?: string,
): Promise<Result<{ technique: Technique; sourceWorkflowId: string }, TechniqueNotFoundError>> {
  for (const candidate of candidateWorkflows(ref, workflowId)) {
    const technique = await tryLoadInWorkflow(index, candidate, ref.segments);
    if (technique) {
      logInfo('Technique loaded', { id: ref.text, workflowId: candidate });
      return ok({ technique, sourceWorkflowId: candidate });
    }
  }
  return err(new TechniqueNotFoundError(ref.text));
}

/* -------------------------------------------------------------------------- */
/* Operations resolution (unchanged in shape — only the underlying load layer  */
/* loads markdown-sourced techniques).                                         */
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
  if (t.inherited_inputs) body['inherited_inputs'] = t.inherited_inputs;
  if (t.protocol) body['protocol'] = t.protocol;
  if (t.outputs) body['outputs'] = t.outputs;
  if (t.inherited_outputs) body['inherited_outputs'] = t.inherited_outputs;
  return body;
}

/**
 * Resolve a list of technique::element references into their bodies.
 *
 * Auto-inclusion of a resolved technique's remaining rules, and the explicit surfacing of anything
 * that does not resolve, are both part of the bundle contract.
 */
export async function resolveTechniques(
  refs: string[],
  workflowDir: string,
  currentWorkflow?: string,
): Promise<ResolvedTechnique[]> {
  const index = indexCorpus(workflowDir);
  const results: ResolvedTechnique[] = [];
  const explicitRules = new Set<string>();
  const touchedSkills = new Map<string, { workflow: string | undefined; technique: string; cached: Technique }>();

  const skillKey = (workflow: string | undefined, technique: string) => `${workflow ?? ''}::${technique}`;
  const ruleKey = (workflow: string | undefined, technique: string, name: string) => `${workflow ?? ''}::${technique}::${name}`;

  for (const ref of refs) {
    const parsedRef = parseRef(ref, index);
    if (!parsedRef.success) {
      logWarn('Unresolvable technique reference', { ref, error: parsedRef.error.message });
      results.push({ source: '', name: '', type: 'not-found', body: null, ref });
      continue;
    }
    const path = parsedRef.value;
    const technique0 = path.segments[0]!;
    const subName = path.segments.length > 1 ? techniquePath(path.segments.slice(1)) : undefined;

    // Whole-technique reference (no sub-technique segment): deliver the technique's
    // own protocol, capability and interface (standalone OR grouped parent) and
    // auto-include its rules. A technique IS deliverable — not just its subs. The
    // parent namespace is implicit (current-first) unless the path names one.
    if (subName === undefined) {
      const tRes = await readTechniqueRef(path, index, path.namespace ?? currentWorkflow);
      if (tRes.success) {
        const wholeDir = getNamespaceTechniquesDir(index, tRes.value.sourceWorkflowId);
        const body = await composeLoaded(tRes.value.technique, [technique0], wholeDir);
        results.push({ source: technique0, workflow: path.namespace, name: '', type: 'technique', body: projectTechniqueBody(body), ref });
        touchedSkills.set(skillKey(path.namespace, technique0), { workflow: path.namespace, technique: technique0, cached: tRes.value.technique });
      } else {
        results.push({ source: technique0, workflow: path.namespace, name: '', type: 'not-found', body: null, ref });
      }
      continue;
    }

    // Nested reference — resolved below as a `<group>/<op>.md` technique file, else a rule.
    const parsed = { workflow: path.namespace, technique: technique0, name: subName };

    const techRef = techniqueRef(parsed.workflow, [parsed.technique]);

    // 1. Nested technique: a `<group>/<op>.md` file. A `namespace::technique::op` prefix targets
    //    that namespace exactly. For an UNPREFIXED ref, the convention is "the current workflow's
    //    own technique" — so try the current workflow FIRST (its technique shadows a same-named
    //    meta one), then fall back to meta. A nested technique is just a technique.
    //    `undefined` in the candidate list means "meta (bare ref)".
    const candidates: Array<string | undefined> = parsed.workflow
      ? [parsed.workflow]
      : (currentWorkflow && currentWorkflow !== META_WORKFLOW_ID ? [currentWorkflow, undefined] : [undefined]);
    let nested: Technique | null = null;
    let opWorkflow = parsed.workflow; // namespace where the nested technique was found
    for (const wf of candidates) {
      const t = await tryLoadInWorkflow(index, wf ?? META_WORKFLOW_ID, path.segments);
      if (t) { nested = t; opWorkflow = wf; break; }
    }
    if (nested) {
      const nestedDir = getNamespaceTechniquesDir(index, opWorkflow ?? META_WORKFLOW_ID);
      const body = await composeLoaded(nested, path.segments, nestedDir);
      results.push({ source: parsed.technique, workflow: opWorkflow, name: parsed.name, type: 'technique', body: projectTechniqueBody(body), ref });
      touchedSkills.set(skillKey(opWorkflow, `${parsed.technique}::${parsed.name}`), { workflow: opWorkflow, technique: `${parsed.technique}::${parsed.name}`, cached: nested });
      const idxResult = await readTechniqueRef(techniqueRef(opWorkflow, [parsed.technique]), index);
      if (idxResult.success) {
        touchedSkills.set(skillKey(opWorkflow, parsed.technique), { workflow: opWorkflow, technique: parsed.technique, cached: idxResult.value.technique });
      }
      continue;
    }

    // 2. Rule on the technique index.
    const skillResult = await readTechniqueRef(techRef, index);
    if (!skillResult.success) {
      results.push({ source: parsed.technique, workflow: parsed.workflow, name: parsed.name, type: 'not-found', body: null, ref });
      continue;
    }
    const technique = skillResult.value.technique;

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
            ref: `${techRef.text}::${rn}`,
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
      const root = await loadWorkflowRoot(index, currentWorkflow);
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
        ref: `${techniqueRef(workflow, [techniqueId]).text}::${ruleName}`,
      });
    }
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Technique composition — root-contract inheritance (R4)                      */
/* -------------------------------------------------------------------------- */

/** Filename stem of the per-workflow root index. Loadable for its contract, but never an
 *  addressable technique. */
const ROOT_INDEX_ID = 'TECHNIQUE';

/** Scope note delivered with `inherited_inputs`/`inherited_outputs`. Claims only what is always
 *  true of contract-inherited entries — a group-contract input may still be a prior step's
 *  output (e.g. a shared artifact), so how each value resolves is deliberately not stated here. */
const INHERITED_SCOPE_NOTE =
  'Declared by the workflow or group contract and shared by every technique in its scope — not specific to this technique.';

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
  techniquesDir: string | null,
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
async function loadWorkflowRoot(source: CorpusIndex, workflowId: string): Promise<Technique | null> {
  return tryLoadMarkdownTechnique(getNamespaceTechniquesDir(source, workflowId), ROOT_INDEX_ID);
}

/**
 * Apply the full ancestor-chain contract to an already-loaded technique.
 *
 * Loads every ancestor container reachable from `techniquesDir` along `pathSegments` — the
 * workflow root (`TECHNIQUE.md`) and each containing group — then:
 *   - Merges inputs/outputs/rules: ancestor provides the base, closer ancestors override,
 *     the technique itself wins (outermost-first merge, reversed so each mergeById call
 *     treats the ancestor as "parent" and the accumulated value as "child").
 *   - Partitions the merged inputs/outputs by winning-definition provenance: the technique's
 *     own entries stay under `inputs`/`outputs`; ancestor-contract entries are delivered under
 *     `inherited_inputs`/`inherited_outputs` with a scope note (B2, #166).
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
  techniquesDir: string | null,
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

  // Partition the merged interface by winning-definition provenance (B2, #166): entries the
  // technique declares itself (including overrides of an ancestor id) stay under
  // `inputs`/`outputs`; entries whose winning definition came from an ancestor contract are
  // delivered under a marked `inherited_*` block so a consumer can tell shared contract scope
  // from the technique's own interface. Merge precedence is unchanged.
  const ownInputIds = new Set((technique.inputs ?? []).map((i) => i.id));
  const ownOutputIds = new Set((technique.outputs ?? []).map((o) => o.id));
  const ownInputs = (inputs ?? []).filter((i) => ownInputIds.has(i.id));
  const inheritedInputs = (inputs ?? []).filter((i) => !ownInputIds.has(i.id));
  const ownOutputs = (outputs ?? []).filter((o) => ownOutputIds.has(o.id));
  const inheritedOutputs = (outputs ?? []).filter((o) => !ownOutputIds.has(o.id));

  // A bind contract reaches a technique that can bind it. One declaring no interface and no
  // procedure — a rule set — has no `{id}` to resolve and no step binding it, so the inherited
  // block is content it cannot act on. Its own declarations and rules are delivered as ever, and
  // the merge above is untouched: a descendant composes its own contract from the parsed files.
  const bindsNothing = technique.protocol === undefined
    && technique.inputs === undefined
    && technique.outputs === undefined;

  const composed: Record<string, unknown> = { ...technique };
  if (ownInputs.length) composed['inputs'] = ownInputs; else delete composed['inputs'];
  if (inheritedInputs.length && !bindsNothing) composed['inherited_inputs'] = { note: INHERITED_SCOPE_NOTE, items: inheritedInputs };
  if (ownOutputs.length) composed['outputs'] = ownOutputs; else delete composed['outputs'];
  if (inheritedOutputs.length && !bindsNothing) composed['inherited_outputs'] = { note: INHERITED_SCOPE_NOTE, items: inheritedOutputs };
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
 * Load and compose a technique with the full ancestor-chain contract of the workflow holding it.
 *
 * Takes a reference in any form the rule admits — a bare name, a `group::op` path, a workflow
 * prefix in either spelling. Composition is delegated to `composeLoaded`, the single implementation
 * shared with the bundle path (`resolveTechniques`), so both produce identical inputs/outputs,
 * rules and protocol (full Initial/Final wrap across the ancestor chain).
 */
export async function composeTechnique(
  techniqueId: string,
  workflowDir: string,
  workflowId: string,
): Promise<Result<Technique, TechniqueReadError>> {
  const composed = await composeTechniqueWithSource(techniqueId, workflowDir, workflowId);
  return composed.success ? ok(composed.value.technique) : composed;
}

/** `composeTechnique`, plus the workflow the technique file was found in (`readTechniqueWithSource`). */
export async function composeTechniqueWithSource(
  techniqueId: string,
  workflowDir: string,
  workflowId: string,
): Promise<Result<{ technique: Technique; sourceWorkflowId: string }, TechniqueReadError>> {
  const index = indexCorpus(workflowDir);
  const ref = parseRef(techniqueId, index);
  if (!ref.success) return ref;
  const base = await readTechniqueRef(ref.value, index, workflowId);
  if (!base.success) return base;

  // The contract comes from the namespace the file was FOUND in, whether the reference named it,
  // fell back to the shared layer, or resolved locally: the ancestors walk that namespace's
  // `techniques/` along the reference's own path, so a technique fetched across a boundary carries
  // the shared contract written above it rather than one belonging to whoever asked. Same rule as
  // the bundle path (`resolveTechniques`), which composes each op against its own home.
  return ok({
    technique: await composeLoaded(base.value.technique, ref.value.segments, getNamespaceTechniquesDir(index, base.value.sourceWorkflowId)),
    sourceWorkflowId: base.value.sourceWorkflowId,
  });
}

/**
 * Compose a step-bound technique reference under the activity-group convention: a bare op id
 * resolves FIRST against the group named after the activity — `<activity-id>::<op>` — so a step can
 * name its op directly (`technique: classify-source` inside the `intake` activity), and an op that
 * shares its group's name resolves to the op, not the group base. A reference that already spells a
 * path says where it lives and resolves as-authored; a bare one whose activity-named group holds no
 * such op falls back to as-authored too. Returns the RESOLVED id alongside the composition — the id
 * the delivery ledger and fidelity events are keyed by — and the workflow the technique file was
 * found in, which its own bare resource links resolve against. The single resolution implementation
 * behind step-bound get_technique and get_activity's hybrid step-technique bundling, so both
 * deliver identical composition by construction.
 */
export async function composeActivityTechnique(
  ref: string,
  workflowDir: string,
  workflowId: string,
  activityId?: string,
): Promise<Result<{ techniqueId: string; technique: Technique; sourceWorkflowId: string }, TechniqueReadError>> {
  if (activityId && isBareName(ref)) {
    const groupRef = `${activityId}${SEGMENT_SEPARATOR}${ref}`;
    const viaGroup = await composeTechniqueWithSource(groupRef, workflowDir, workflowId);
    if (viaGroup.success) {
      return ok({ techniqueId: groupRef, ...viaGroup.value });
    }
  }
  const composed = await composeTechniqueWithSource(ref, workflowDir, workflowId);
  if (!composed.success) return composed;
  return ok({ techniqueId: ref, ...composed.value });
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
