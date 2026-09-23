import { type Result, ok, err } from '../result.js';
import { TechniqueNotFoundError } from '../errors.js';
import { logInfo, logWarn } from '../logging.js';
import { stringifyForResponse } from '../utils/serialization.js';
import type { Technique } from '../schema/technique.schema.js';
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
 * Project an in-memory Technique object into its ordered merged shape.
 *
 * This is the composed value: own fields plus inherited blocks. Role-facing delivery and
 * `get_technique` use `projectTechniqueWire` instead, which keeps own rules on the body and names
 * ancestor scopes in `inherits`. `projectTechniqueToYaml` serialises this merged record.
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

/** A scope's authored contract, delivered once per bundle under `contracts`. */
export interface InheritScope {
  id: string;
  rules?: Technique['rules'];
  inputs?: Technique['inputs'];
  outputs?: Technique['outputs'];
}

/** Scope note on a contract block and on in-memory `inherited_*`. Claims only what is always
 *  true of contract-inherited entries — a group-contract input may still be a prior step's
 *  output (e.g. a shared artifact), so how each value resolves is deliberately not stated here. */
const INHERITED_SCOPE_NOTE =
  'Declared by the workflow or group contract and shared by every technique in its scope — not specific to this technique.';

export interface ResolvedTechnique {
  source: string;
  workflow?: string | undefined;
  name: string;
  type: 'rule' | 'technique' | 'not-found';
  body: unknown;
  ref: string;
  /** Scopes this operation inherits from; each id is a key of the bundle's `contracts` map. */
  scopes?: InheritScope[];
}

type LoadedComposition = {
  technique: Technique;
  scopes: InheritScope[];
  ownRuleKeys: Set<string>;
};

/**
 * The deliverable body of a technique reference. One projection for ALL techniques — standalone or
 * nested. A nested technique ("sub-technique" informally) is just a technique.
 *
 * A body states the capability, the interface, the procedure, and the rules the technique itself
 * declares. Rules and declarations a scope shares with every technique under it arrive once under
 * `contracts`, and the body names those scopes in `inherits`. The bundle's `rules` list carries
 * what is left — see `dropRulesStatedBy` for which rule takes which home.
 */
export function inheritContractBlock(scope: InheritScope): Record<string, unknown> {
  const block: Record<string, unknown> = { note: INHERITED_SCOPE_NOTE };
  if (scope.rules) block['rules'] = scope.rules;
  if (scope.inputs) block['inputs'] = scope.inputs;
  if (scope.outputs) block['outputs'] = scope.outputs;
  return block;
}

export function putInheritContracts(
  contracts: Record<string, unknown>,
  scopes: InheritScope[],
): void {
  for (const scope of scopes) {
    if (scope.id in contracts) continue;
    contracts[scope.id] = inheritContractBlock(scope);
  }
}

/**
 * Wire projection of one composed technique: own interface, own rules, and `inherits` naming the
 * scopes whose contracts ride beside it. Inherited blocks do not copy onto the body.
 */
export function projectTechniqueWire(
  t: Technique,
  scopes: InheritScope[],
  ownRuleKeys: Set<string>,
): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  ordered['id'] = t.id;
  ordered['version'] = t.version;
  if (t.capability) ordered['capability'] = t.capability;
  if (t.provenance_note !== undefined) ordered['provenance_note'] = t.provenance_note;
  Object.assign(ordered, projectTechniqueBody(t, scopes, ownRuleKeys));
  for (const key of Object.keys(t) as (keyof Technique)[]) {
    if (key === 'inherited_inputs' || key === 'inherited_outputs' || key === 'rules') continue;
    if (!(key in ordered) && t[key] !== undefined) {
      ordered[String(key)] = t[key];
    }
  }
  return ordered;
}

/**
 * One operation for `get_technique` and for an inlined step: the wire body hashed as
 * `technique:<id>`, and the ancestor contracts that body names, each hashed as
 * `bundle:contract:<scopeId>`.
 */
export function projectTechniqueFetch(
  t: Technique,
  scopes: InheritScope[],
  ownRuleKeys: Set<string>,
): { wire: Record<string, unknown>; contracts: Record<string, unknown> } {
  const wire = projectTechniqueWire(t, scopes, ownRuleKeys);
  const contracts: Record<string, unknown> = {};
  putInheritContracts(contracts, scopes);
  return { wire, contracts };
}

function projectTechniqueBody(t: Technique, scopes: InheritScope[], ownRuleKeys: Set<string>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (t.capability) body['capability'] = t.capability;
  if (t.inputs) body['inputs'] = t.inputs;
  if (t.protocol) body['protocol'] = t.protocol;
  if (t.outputs) body['outputs'] = t.outputs;
  if (t.rules) {
    const own: NonNullable<Technique['rules']> = {};
    for (const [name, value] of Object.entries(t.rules)) {
      if (ownRuleKeys.has(name)) own[name] = value;
    }
    if (Object.keys(own).length > 0) body['rules'] = own;
  }
  if (scopes.length > 0) body['inherits'] = scopes.map((s) => s.id);
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
        const loaded = await composeLoaded(tRes.value.technique, [technique0], wholeDir, tRes.value.sourceWorkflowId);
        results.push({
          source: technique0,
          workflow: path.namespace,
          name: '',
          type: 'technique',
          body: projectTechniqueBody(loaded.technique, loaded.scopes, loaded.ownRuleKeys),
          ref,
          scopes: loaded.scopes,
        });
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
      const home = opWorkflow ?? META_WORKFLOW_ID;
      const loaded = await composeLoaded(nested, path.segments, nestedDir, home);
      results.push({
        source: parsed.technique,
        workflow: opWorkflow,
        name: parsed.name,
        type: 'technique',
        body: projectTechniqueBody(loaded.technique, loaded.scopes, loaded.ownRuleKeys),
        ref,
        scopes: loaded.scopes,
      });
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

/** Union two id-keyed arrays (inputs/outputs); child entries override parent entries by `id`. */
function mergeById<T extends { id: string }>(parent: T[] | undefined, child: T[] | undefined): T[] | undefined {
  if (!parent?.length && !child?.length) return undefined;
  const map = new Map<string, T>();
  for (const e of parent ?? []) map.set(e.id, e);
  for (const e of child ?? []) map.set(e.id, e);
  const arr = [...map.values()];
  return arr.length ? arr : undefined;
}

/** Union two name-keyed records (rules); child entries override parent entries by key. */
function mergeKeyed<T>(parent: Record<string, T> | undefined, child: Record<string, T> | undefined): Record<string, T> | undefined {
  if (!parent && !child) return undefined;
  const out: Record<string, T> = { ...(parent ?? {}), ...(child ?? {}) };
  return Object.keys(out).length ? out : undefined;
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
 *     own entries stay under `inputs`/`outputs`; ancestor-contract entries stay on the in-memory
 *     value under `inherited_inputs`/`inherited_outputs` with a scope note (B2, #166). Role-facing
 *     wire delivery names those ancestors in `inherits` and carries each block once under
 *     `contracts`.
 *
 * A container contributes a contract, never a procedure: the technique's own protocol is what it
 * carries, whatever ancestors it composes against.
 *
 * Used by both `composeTechnique` (get_technique path) and `resolveTechniques` (bundle path)
 * so the two delivery paths share a single composition implementation.
 *
 * Returns the original technique unchanged on validation failure.
 */
function emptyComposition(technique: Technique): LoadedComposition {
  return { technique, scopes: [], ownRuleKeys: new Set(Object.keys(technique.rules ?? {})) };
}

function authoredScope(id: string, ancestor: Technique): InheritScope | undefined {
  const scope: InheritScope = { id };
  if (ancestor.rules && Object.keys(ancestor.rules).length > 0) scope.rules = ancestor.rules;
  if (ancestor.inputs?.length) scope.inputs = ancestor.inputs;
  if (ancestor.outputs?.length) scope.outputs = ancestor.outputs;
  if (scope.rules === undefined && scope.inputs === undefined && scope.outputs === undefined) return undefined;
  return scope;
}

async function composeLoaded(
  technique: Technique,
  pathSegments: string[],
  techniquesDir: string | null,
  rootScopeId: string,
): Promise<LoadedComposition> {
  if (pathSegments.length === 1 && pathSegments[0] === ROOT_INDEX_ID) return emptyComposition(technique);

  const ownRuleKeys = new Set(Object.keys(technique.rules ?? {}));
  const ancestors: Array<{ loadId: string; technique: Technique }> = [];
  const loadAnc = async (id: string): Promise<void> => {
    try {
      const t = await tryLoadMarkdownTechnique(techniquesDir, id);
      if (t && t.id !== technique.id) ancestors.push({ loadId: id, technique: t });
    } catch (e) {
      if (!(e instanceof MarkdownTechniqueParseError)) throw e;
      logWarn('Skipping malformed ancestor while composing', { id, error: (e as Error).message });
    }
  };
  await loadAnc(ROOT_INDEX_ID);
  for (let i = 0; i < pathSegments.length - 1; i++) {
    await loadAnc(pathSegments.slice(0, i + 1).join('/'));
  }
  if (ancestors.length === 0) return emptyComposition(technique);

  const scopes: InheritScope[] = [];
  const takenIds = new Set<string>();
  for (const ancestor of ancestors) {
    const preferred = ancestor.loadId === ROOT_INDEX_ID ? rootScopeId : ancestor.loadId;
    const id = takenIds.has(preferred) ? `${rootScopeId}/${ancestor.loadId}` : preferred;
    takenIds.add(id);
    const scope = authoredScope(id, ancestor.technique);
    if (scope) scopes.push(scope);
  }

  // Merge outermost-first: reversing puts innermost first so each mergeById(ancestor, acc)
  // call treats the ancestor as "parent" (provides base) and acc as "child" (wins).
  // Final precedence: technique > innermost ancestor > ... > workflow root.
  let inputs = technique.inputs;
  let outputs = technique.outputs;
  let rules = technique.rules;
  for (const ancestor of [...ancestors].reverse()) {
    inputs = mergeById(ancestor.technique.inputs, inputs);
    outputs = mergeById(ancestor.technique.outputs, outputs);
    rules = mergeKeyed(ancestor.technique.rules, rules);
  }

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

  const result = safeValidateTechnique(composed);
  if (!result.success) {
    logWarn('Composed technique failed validation; returning uncomposed', {
      id: technique.id,
      errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return { technique, scopes, ownRuleKeys };
  }
  return { technique: result.data, scopes, ownRuleKeys };
}

/**
 * Load and compose a technique with the full ancestor-chain contract of the workflow holding it.
 *
 * Takes a reference in any form the rule admits — a bare name, a `group::op` path, a workflow
 * prefix in either spelling. Composition is delegated to `composeLoaded`, the single implementation
 * shared with the bundle path (`resolveTechniques`), so both produce identical inputs, outputs and
 * rules.
 */
export async function composeTechnique(
  techniqueId: string,
  workflowDir: string,
  workflowId: string,
): Promise<Result<Technique, TechniqueReadError>> {
  const composed = await composeTechniqueWithSource(techniqueId, workflowDir, workflowId);
  return composed.success ? ok(composed.value.technique) : composed;
}

/** A composed technique plus the scopes its wire body names in `inherits`. */
export interface ComposedTechnique {
  technique: Technique;
  sourceWorkflowId: string;
  scopes: InheritScope[];
  ownRuleKeys: Set<string>;
}

/** `composeTechnique`, plus the workflow the technique file was found in (`readTechniqueWithSource`). */
export async function composeTechniqueWithSource(
  techniqueId: string,
  workflowDir: string,
  workflowId: string,
): Promise<Result<ComposedTechnique, TechniqueReadError>> {
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
  const loaded = await composeLoaded(
    base.value.technique,
    ref.value.segments,
    getNamespaceTechniquesDir(index, base.value.sourceWorkflowId),
    base.value.sourceWorkflowId,
  );
  return ok({
    technique: loaded.technique,
    sourceWorkflowId: base.value.sourceWorkflowId,
    scopes: loaded.scopes,
    ownRuleKeys: loaded.ownRuleKeys,
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
 * compose against the same ancestors and project the same wire.
 */
export async function composeActivityTechnique(
  ref: string,
  workflowDir: string,
  workflowId: string,
  activityId?: string,
): Promise<Result<ComposedTechnique & { techniqueId: string }, TechniqueReadError>> {
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
 * Every rule line a bundle's operation bodies state, keyed by name and text.
 *
 * A body's `rules` is a map from name to one line or several; the list is one entry per line. Both
 * halves join on a NUL, which no rule name or rule text holds, so no pair can collide by one name
 * ending where the next one's text begins.
 */
function rulesStatedByOperations(bodies: Record<string, unknown>, contracts?: Record<string, unknown>): Set<string> {
  const stated = new Set<string>();
  const takeRules = (rules: unknown): void => {
    if (!rules || typeof rules !== 'object' || Array.isArray(rules)) return;
    for (const [name, value] of Object.entries(rules as Record<string, string | string[]>)) {
      for (const line of Array.isArray(value) ? value : [value]) stated.add(`${name}\0${String(line)}`);
    }
  };
  for (const body of Object.values(bodies)) {
    if (!body || typeof body !== 'object') continue;
    takeRules((body as Record<string, unknown>)['rules']);
  }
  if (contracts) {
    for (const block of Object.values(contracts)) {
      if (!block || typeof block !== 'object') continue;
      takeRules((block as Record<string, unknown>)['rules']);
    }
  }
  return stated;
}

/**
 * Give the role's `rules` list up to the bodies and the scope contracts, for every rule those
 * already state.
 *
 * Which home a rule takes is decided by what it governs. A rule a technique declares governs that
 * operation and rides the body that states it. A rule a scope shares with every technique under it
 * arrives once under `contracts`. The list keeps what is left: rules that govern the agent rather
 * than any one operation. The list gives way rather than the body or the contract because those
 * homes say WHICH operation or scope the rule binds, which the flat list cannot.
 *
 * A body or contract a delivery collapsed to a marker states nothing here, so a rule it holds
 * stays in the list. That is a rule delivered twice to a context that already had it, which costs
 * a repeat delivery a few characters and costs a reader nothing.
 *
 * Empties the list rather than leaving it empty: a `rules` key with nothing under it reads as a
 * role with no rules of its own, which is the same thing said twice.
 */
export function dropRulesStatedBy(
  bundle: Record<string, unknown>,
  bodies: Record<string, unknown>,
  contracts?: Record<string, unknown>,
): void {
  const list = bundle['rules'];
  if (!Array.isArray(list)) return;
  const stated = rulesStatedByOperations(
    bodies,
    contracts ?? (bundle['contracts'] as Record<string, unknown> | undefined),
  );
  const kept = (list as Array<[string, string]>)
    .filter(([name, line]) => !stated.has(`${name}\0${String(line)}`));
  if (kept.length > 0) bundle['rules'] = kept;
  else delete bundle['rules'];
}

/**
 * Shape a resolved-operations array for tool-response output.
 * Bundle shape is wire-stable — no markdown-migration-driven changes.
 *
 * A rule has one home in the response, and which home is decided by what the rule governs. A rule
 * a technique declares governs that operation and rides the body that states it. A rule a scope
 * shares with every technique under it arrives once under `contracts`, and each technique names
 * that scope in `inherits`. `rules` carries what is left: the role's own rules, declared
 * standalone and referenced by the workflow, which govern the agent rather than any one operation.
 * The three sets are disjoint, so no rule is read twice and none is anywhere but where it belongs.
 */
export function formatTechniqueBundle(resolved: ResolvedTechnique[]): Record<string, unknown> {
  const techniques: Record<string, unknown> = {};
  const roleRules: Array<[string, string]> = [];
  const unresolved: string[] = [];
  const contracts: Record<string, unknown> = {};

  for (const entry of resolved) {
    if (entry.type === 'technique') {
      // A technique is keyed by its full path. A nested technique carries a `name` (the op),
      // appended as `::name`; a standalone has an empty name. No separate sub-technique bucket.
      const base = entry.workflow ? `${entry.workflow}/${entry.source}` : entry.source;
      techniques[entry.name ? `${base}::${entry.name}` : base] = entry.body;
      putInheritContracts(contracts, entry.scopes ?? []);
    } else if (entry.type === 'rule') {
      const lines = Array.isArray(entry.body) ? entry.body : [entry.body];
      for (const line of lines) {
        roleRules.push([entry.name, String(line)]);
      }
    } else {
      unresolved.push(entry.ref);
    }
  }

  const out: Record<string, unknown> = {};
  if (Object.keys(techniques).length > 0) out['techniques'] = techniques;
  if (Object.keys(contracts).length > 0) out['contracts'] = contracts;
  if (roleRules.length > 0) out['rules'] = roleRules;
  if (unresolved.length > 0) out['unresolved'] = unresolved;
  dropRulesStatedBy(out, techniques);
  return out;
}
