/**
 * Binding-seam provenance (#166 B3).
 *
 * Computes, for each declared input of a step-bound technique, where its value comes from under
 * the name-match convention: a step-binding value, a workflow variable, a prior step's output, a
 * declared default — or UNRESOLVED when nothing in the workflow supplies it. `get_technique`
 * renders the result as a per-input `source:` (and per-remapped-output `destination:`) annotation
 * so the executing agent no longer has to guess the wiring, and surfaces UNRESOLVED own inputs as
 * warn-only validation entries.
 *
 * Classification is purely static — declarations and document order — so a payload is a
 * deterministic function of the corpus and the step: no session-state reads, and byte-identical
 * refetches stay byte-identical for reference delivery. Producers positioned after the current
 * step are reported as such rather than claimed — a read whose only producer comes later in the
 * workflow is a real seam, not a resolution.
 *
 * Own inputs are always annotated. Contract-inherited entries (ambient by design, marked by
 * their block note) are annotated only when the resolution says something the block note does
 * not: a step-binding override, or a producer positioned later in the workflow.
 *
 * This module is the single source of truth for the convention's building blocks — the
 * identifier grammar, the `*(optional)*` marker, the ambient ids — shared with
 * scripts/check-binding-fidelity.ts so the server annotation and the guard cannot drift apart.
 */
import type { Workflow } from '../schema/workflow.schema.js';
import type { TechniqueBinding } from '../schema/activity.schema.js';
import { flattenActivitySteps, techniqueName } from '../schema/activity.schema.js';
import type { Technique, InputItemDefinition, OutputItemDefinition } from '../schema/technique.schema.js';
import { readTechnique } from '../loaders/technique-loader.js';
import { logWarn } from '../logging.js';

/** Bag names supplied by the caller/user at runtime rather than produced inside a workflow. */
export const AMBIENT_CONTEXT_IDS: ReadonlySet<string> = new Set(['target_symbol', 'impact_report', 'model_id']);

/** The bag-name identifier grammar (snake_case and camelCase ids like `issueKey`). */
export const IDENTIFIER_PATTERN = '[a-zA-Z_][a-zA-Z0-9_]*';

/** Corpus convention: an input is optional when its description leads with `*(optional)*`. */
export const OPTIONAL_INPUT_RE = /^[*_]{0,2}\(optional\)/i;

/** Note delivered alongside the annotations: the output delivery mechanics (probe class 3's
 *  "set variable X — how?"). The `source:` vocabulary is self-explanatory in situ and is
 *  documented on the tool description, so it is not restated here. */
export const PROVENANCE_NOTE =
  'Outputs land in the session bag under their declared id (or the shown `destination:`); '
  + 'deliver each by reporting it in your step-manifest `output`.';

/** A place in the workflow that puts a value into the session bag under `name`. */
export interface ProducerSite {
  name: string;
  via: 'output' | 'remap' | 'checkpoint' | 'action' | 'loop';
  /** For `remap`: the op output id the bag name was remapped from. */
  origOutputId?: string | undefined;
  stepId: string;
  activityId: string;
  /** Document-order position across the whole workflow (activities in declared order, steps flattened). */
  ordinal: number;
}

/** Everything the classifier needs, assembled once per get_technique call. */
export interface ProvenanceContext {
  /** Names declared as workflow-level variables. */
  declaredVariables: Set<string>;
  /** Every producer site in the workflow, in document order. */
  producers: ProducerSite[];
  /** Document-order position of the step being fetched. */
  position: number;
}

/* ------------------------------- context assembly ------------------------------- */

/**
 * Walk the whole workflow (activities in declared order, steps flattened in document order) and
 * collect every producer site: technique-step outputs (the bound op's own declared outputs, or the
 * step-binding remap targets), checkpoint-effect `setVariable` keys, `action: set` targets, and
 * loop variables. Returns null when the current step cannot be located.
 *
 * Bound-op signatures are read uncomposed (`readTechnique`, memoized per activity+ref): a producer
 * claim belongs to the op's own file, not to root/group contract entries every sibling would then
 * appear to produce. Reads are best-effort — a malformed sibling op never fails the fetch, but is
 * logged, since it silently degrades the provenance of the technique being delivered.
 */
export async function buildProvenanceContext(args: {
  workflow: Workflow;
  workflowDir: string;
  currentActivityId: string;
  currentStepId: string;
}): Promise<ProvenanceContext | null> {
  const { workflow, workflowDir, currentActivityId, currentStepId } = args;
  const declaredVariables = new Set((workflow.variables ?? []).map((v) => v.name));
  const producers: ProducerSite[] = [];
  let position = -1;
  let ordinal = 0;

  const ownOutputsCache = new Map<string, string[]>();
  const ownOutputsOf = async (ref: string, activityId: string): Promise<string[]> => {
    const key = `${activityId}|${ref}`;
    const hit = ownOutputsCache.get(key);
    if (hit) return hit;
    let ids: string[] = [];
    try {
      // Mirror get_technique's activity-group shorthand: a bare op resolves first against the
      // group named after its activity, then as-authored.
      let result = (!ref.includes('::') && !ref.includes('/'))
        ? await readTechnique(`${activityId}::${ref}`, workflowDir, workflow.id)
        : null;
      if (!result?.success) result = await readTechnique(ref, workflowDir, workflow.id);
      if (result.success) ids = (result.value.outputs ?? []).map((o) => o.id);
    } catch (error) {
      logWarn('Provenance producer scan skipped an unreadable bound op', {
        ref, activityId, workflowId: workflow.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    ownOutputsCache.set(key, ids);
    return ids;
  };

  for (const activity of workflow.activities ?? []) {
    for (const step of flattenActivitySteps(activity)) {
      const at = ordinal++;
      const stepId = step.id ?? techniqueName(step.technique) ?? '?';
      if (activity.id === currentActivityId && step.id === currentStepId) position = at;

      const push = (name: string, via: ProducerSite['via'], origOutputId?: string): void => {
        producers.push({ name, via, origOutputId, stepId, activityId: activity.id, ordinal: at });
      };

      const binding: TechniqueBinding | undefined =
        step.technique && typeof step.technique === 'object' ? step.technique : undefined;
      const ref = techniqueName(step.technique);
      if (step.kind === 'technique' && ref) {
        const remapped = new Set(Object.keys(binding?.outputs ?? {}));
        for (const [outputId, bagName] of Object.entries(binding?.outputs ?? {})) {
          push(bagName, 'remap', outputId);
        }
        for (const outputId of await ownOutputsOf(ref, activity.id)) {
          if (!remapped.has(outputId)) push(outputId, 'output');
        }
      }
      if (step.kind === 'checkpoint') {
        for (const option of step.options ?? []) {
          for (const name of Object.keys(option.effect?.setVariable ?? {})) push(name, 'checkpoint');
        }
      }
      for (const action of step.actions ?? []) {
        if (action.action === 'set' && action.target) push(action.target, 'action');
      }
      if (step.kind === 'loop' && step.variable) push(step.variable, 'loop');
    }
  }

  if (position < 0) return null;
  return { declaredVariables, producers, position };
}

/* --------------------------------- classification --------------------------------- */

/**
 * How an input resolved. `prior`/`declared` are settled facts; `later`/`declared-later` reference
 * a producer positioned after the current step; `binding` came from the step's own inputs map;
 * the rest are fallbacks.
 */
export type SourceKind =
  | 'binding' | 'prior' | 'declared' | 'declared-later' | 'later' | 'ambient'
  | 'default' | 'optional' | 'inherited-ambient' | 'unresolved';

interface BagResolution { text: string; resolved: boolean; kind: SourceKind }

function producerText(p: ProducerSite, later: boolean): string {
  const where = `'${p.stepId}' (activity '${p.activityId}')`;
  const suffix = later ? ' — produced later in the workflow, not yet available' : '';
  if (p.via === 'output' || p.via === 'remap') {
    const remap = p.via === 'remap' ? `, remapped from output '${p.origOutputId}'` : '';
    return `output of step ${where}${remap}${suffix}`;
  }
  const verb = p.via === 'checkpoint' ? 'set by checkpoint' : p.via === 'loop' ? 'bound by loop' : 'set by step';
  return `${verb} ${where}${suffix}`;
}

/**
 * Resolve a session-bag name under the name-match convention. Priority: the closest producer
 * before the current step, then a declared workflow variable, then a producer that only exists
 * later in the workflow, then a known ambient id.
 */
function resolveBagName(name: string, ctx: ProvenanceContext): BagResolution {
  const sites = ctx.producers.filter((p) => p.name === name);
  const prior = sites.filter((p) => p.ordinal < ctx.position).pop();
  const later = sites.find((p) => p.ordinal >= ctx.position);

  if (prior) return { text: producerText(prior, false), resolved: true, kind: 'prior' };
  if (ctx.declaredVariables.has(name)) {
    return later
      ? { text: `workflow variable '${name}' (declared; ${producerText(later, true)})`, resolved: true, kind: 'declared-later' }
      : { text: `workflow variable '${name}' (declared)`, resolved: true, kind: 'declared' };
  }
  if (later) return { text: producerText(later, true), resolved: true, kind: 'later' };
  if (AMBIENT_CONTEXT_IDS.has(name)) return { text: `ambient context '${name}' (supplied at runtime)`, resolved: true, kind: 'ambient' };
  return { text: `'${name}'`, resolved: false, kind: 'unresolved' };
}

const TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN})\\}`, 'g');
const EXACT_TOKEN_RE = new RegExp(`^\\{(${IDENTIFIER_PATTERN})\\}$`);

export interface InputSourceResolution { source: string; unresolved: boolean; kind: SourceKind }

/**
 * Resolve one declared input. Priority: an explicit step-binding entry (literal, `{token}`, or a
 * bare rename of a resolvable bag name), then the input's own id under the name-match convention,
 * then a declared default or "(optional)" marking, then — for contract-inherited entries —
 * ambient session context. `unresolved` is true only where the agent would have to invent the
 * value (required own inputs with no source; binding tokens with no producer): those surface as
 * warn-only validation entries.
 */
export function resolveInputSource(
  inputId: string,
  ctx: ProvenanceContext,
  binding: TechniqueBinding | undefined,
  opts: { hasDefault: boolean; optional: boolean; inherited: boolean },
): InputSourceResolution {
  const bound = binding?.inputs?.[inputId];
  if (bound !== undefined) {
    if (typeof bound !== 'string') return { source: `step-binding literal ${JSON.stringify(bound)}`, unresolved: false, kind: 'binding' };
    const exact = EXACT_TOKEN_RE.exec(bound);
    if (exact) {
      const inner = resolveBagName(exact[1]!, ctx);
      return inner.resolved
        ? { source: `step-binding: ${inner.text}`, unresolved: false, kind: 'binding' }
        : { source: `step-binding '${bound}' — UNRESOLVED (no producer for '${exact[1]}' in this workflow)`, unresolved: true, kind: 'binding' };
    }
    if (bound.includes('{')) {
      const missing: string[] = [];
      for (const m of bound.matchAll(TOKEN_RE)) {
        if (!resolveBagName(m[1]!, ctx).resolved) missing.push(m[1]!);
      }
      const gap = missing.length ? ` — no producer for ${missing.map((t) => `'{${t}}'`).join(', ')}` : '';
      return { source: `step-binding template ${JSON.stringify(bound)}${gap}`, unresolved: missing.length > 0, kind: 'binding' };
    }
    // A bare string is a rename when it names a resolvable bag entry, otherwise a literal —
    // statically indistinguishable, so an unmatched bare value is reported as the literal it
    // most likely is rather than flagged.
    const renamed = resolveBagName(bound, ctx);
    return renamed.resolved
      ? { source: `step-binding: ${renamed.text}`, unresolved: false, kind: 'binding' }
      : { source: `step-binding literal ${JSON.stringify(bound)}`, unresolved: false, kind: 'binding' };
  }

  const own = resolveBagName(inputId, ctx);
  if (own.resolved) return { source: own.text, unresolved: false, kind: own.kind };
  if (opts.hasDefault) return { source: 'declared default on the input (no session producer)', unresolved: false, kind: 'default' };
  if (opts.optional) return { source: 'optional input (no session producer — supply from working context if available)', unresolved: false, kind: 'optional' };
  if (opts.inherited) return { source: 'ambient session context (inherited contract; no session producer found)', unresolved: false, kind: 'inherited-ambient' };
  return {
    source: `UNRESOLVED — no workflow variable, prior step output, or step-binding supplies '${inputId}'`,
    unresolved: true,
    kind: 'unresolved',
  };
}

/** The bag name a declared output lands under when the step binding remaps it, else undefined
 *  (it lands under its own id — stated once by the provenance note, not per item). */
export function resolveOutputDestination(outputId: string, binding: TechniqueBinding | undefined): string | undefined {
  const bagName = binding?.outputs?.[outputId];
  return bagName === undefined ? undefined : `lands as session variable '${bagName}' (step-binding remap)`;
}

/* --------------------------------- decoration --------------------------------- */

/** Inherited entries carry a `source:` only when it says something their block note does not:
 *  a step-binding override, or a producer positioned later in the workflow. Settled constants
 *  (prior producers, declared variables, ambient fallbacks) repeat per-workflow-invariant facts
 *  on every fetch and are left to the block's scope note. */
const INHERITED_NOTEWORTHY: ReadonlySet<SourceKind> = new Set(['binding', 'later', 'declared-later']);

export interface DecoratedTechnique { technique: Technique; warnings: string[] }

/**
 * Return a copy of a composed technique with per-input `source:` (all own entries; inherited
 * entries only where noteworthy) and per-remapped-output `destination:` annotations plus the
 * provenance note, and the UNRESOLVED warnings for its own inputs. Inherited entries never warn —
 * shared contract scope is ambient by design; their annotation is informational.
 */
export function decorateTechniqueProvenance(
  technique: Technique,
  ctx: ProvenanceContext,
  binding: TechniqueBinding | undefined,
  techniqueRef: string,
  stepId: string,
): DecoratedTechnique {
  const warnings: string[] = [];

  const annotateInput = (item: InputItemDefinition, inherited: boolean): InputItemDefinition => {
    const { source, unresolved, kind } = resolveInputSource(item.id, ctx, binding, {
      hasDefault: item.default !== undefined,
      optional: OPTIONAL_INPUT_RE.test(item.description?.trim() ?? ''),
      inherited,
    });
    if (inherited) {
      return INHERITED_NOTEWORTHY.has(kind) ? { ...item, source } : item;
    }
    if (unresolved) {
      warnings.push(
        `Input '${item.id}' of technique '${techniqueRef}' is UNRESOLVED at step '${stepId}': `
        + 'no workflow variable, prior step output, or step-binding supplies it.',
      );
    }
    return { ...item, source };
  };

  const annotateOutput = (item: OutputItemDefinition): OutputItemDefinition => {
    const destination = resolveOutputDestination(item.id, binding);
    return destination === undefined ? item : { ...item, destination };
  };

  const decorated: Technique = { ...technique, provenance_note: PROVENANCE_NOTE };
  if (technique.inputs) decorated.inputs = technique.inputs.map((i) => annotateInput(i, false));
  if (technique.inherited_inputs) {
    decorated.inherited_inputs = {
      ...technique.inherited_inputs,
      items: technique.inherited_inputs.items.map((i) => annotateInput(i, true)),
    };
  }
  if (technique.outputs) decorated.outputs = technique.outputs.map(annotateOutput);
  if (technique.inherited_outputs) {
    decorated.inherited_outputs = {
      ...technique.inherited_outputs,
      items: technique.inherited_outputs.items.map(annotateOutput),
    };
  }
  return { technique: decorated, warnings };
}
