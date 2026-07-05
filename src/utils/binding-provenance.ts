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
 * The classification is static (declarations and document order), enriched with one runtime fact:
 * whether the name is currently set in the session variable bag. Producers positioned after the
 * current step are reported as such rather than claimed as available — a read whose only producer
 * comes later in the workflow is a real seam, not a resolution.
 */
import type { Workflow } from '../schema/workflow.schema.js';
import type { Step, TechniqueBinding } from '../schema/activity.schema.js';
import { flattenActivitySteps, techniqueName } from '../schema/activity.schema.js';
import type { Technique, InputItemDefinition, OutputItemDefinition } from '../schema/technique.schema.js';
import { readTechnique } from '../loaders/technique-loader.js';

/** Bag names supplied by the caller/user at runtime rather than produced inside a workflow.
 *  Shared with scripts/check-binding-fidelity.ts so the server annotation and the guard agree on
 *  what counts as ambient. */
export const AMBIENT_CONTEXT_IDS: ReadonlySet<string> = new Set(['target_symbol', 'impact_report', 'model_id']);

/** Note delivered alongside the annotations. States the resolution vocabulary and the output
 *  delivery mechanics (the top probe-comprehension gaps: input provenance and "set variable X — how?"). */
export const PROVENANCE_NOTE =
  'Input `source:` entries state where each value comes from under the name-match convention (step-binding value, '
  + 'workflow variable, or prior step output), resolved at fetch time; UNRESOLVED means nothing in this workflow '
  + 'supplies the value — obtain it from your dispatch context or surface the gap. Outputs land in the session bag '
  + 'under their declared id (or the `destination:` shown when the step binding remaps them): deliver each by '
  + 'reporting it in your step-manifest `output`; downstream steps bind it by that name.';

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
  /** The live session variable bag. */
  sessionVariables: Record<string, unknown>;
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
 * appear to produce. Reads are best-effort — a malformed sibling op never fails the fetch.
 */
export async function buildProvenanceContext(args: {
  workflow: Workflow;
  workflowDir: string;
  currentActivityId: string;
  currentStepId: string;
  sessionVariables: Record<string, unknown>;
}): Promise<ProvenanceContext | null> {
  const { workflow, workflowDir, currentActivityId, currentStepId, sessionVariables } = args;
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
    } catch { /* best-effort: a malformed sibling op contributes no producers */ }
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
  return { declaredVariables, sessionVariables, producers, position };
}

/* --------------------------------- classification --------------------------------- */

interface BagResolution { text: string; resolved: boolean }

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
 * later in the workflow, then a live session-bag entry with no declared producer, then a known
 * ambient id. Live-bag state enriches rather than decides: a declared/produced name says whether
 * it is currently set.
 */
function resolveBagName(name: string, ctx: ProvenanceContext): BagResolution {
  const sites = ctx.producers.filter((p) => p.name === name);
  const prior = sites.filter((p) => p.ordinal < ctx.position).pop();
  const later = sites.find((p) => p.ordinal >= ctx.position);
  const set = Object.prototype.hasOwnProperty.call(ctx.sessionVariables, name)
    && ctx.sessionVariables[name] !== undefined;
  const setNote = set ? 'set in session' : null;

  if (prior) {
    const text = producerText(prior, false);
    return { text: setNote ? `${text}; ${setNote}` : text, resolved: true };
  }
  if (ctx.declaredVariables.has(name)) {
    const detail = setNote ?? (later ? producerText(later, true) : 'declared, not yet set in session');
    return { text: `workflow variable '${name}' (${detail})`, resolved: true };
  }
  if (later) {
    const text = producerText(later, true);
    return { text: setNote ? `${text}; ${setNote}` : text, resolved: true };
  }
  if (set) return { text: `session variable '${name}' (set in session; no declared producer)`, resolved: true };
  if (AMBIENT_CONTEXT_IDS.has(name)) return { text: `ambient context '${name}' (supplied at runtime)`, resolved: true };
  return { text: `'${name}'`, resolved: false };
}

const TOKEN_RE = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

export interface InputSourceResolution { source: string; unresolved: boolean }

/** Corpus convention: an input is optional when its description leads with `*(optional)*`. */
export const OPTIONAL_INPUT_RE = /^[*_]{0,2}\(optional\)/i;

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
    if (typeof bound !== 'string') return { source: `step-binding literal ${JSON.stringify(bound)}`, unresolved: false };
    const exact = /^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/.exec(bound);
    if (exact) {
      const inner = resolveBagName(exact[1]!, ctx);
      return inner.resolved
        ? { source: `step-binding: ${inner.text}`, unresolved: false }
        : { source: `step-binding '${bound}' — UNRESOLVED (no producer for '${exact[1]}' in this workflow)`, unresolved: true };
    }
    if (bound.includes('{')) {
      const missing: string[] = [];
      for (const m of bound.matchAll(TOKEN_RE)) {
        if (!resolveBagName(m[1]!, ctx).resolved) missing.push(m[1]!);
      }
      const gap = missing.length ? ` — no producer for ${missing.map((t) => `'{${t}}'`).join(', ')}` : '';
      return { source: `step-binding template ${JSON.stringify(bound)}${gap}`, unresolved: missing.length > 0 };
    }
    // A bare string is a rename when it names a resolvable bag entry, otherwise a literal —
    // statically indistinguishable, so an unmatched bare value is reported as the literal it
    // most likely is rather than flagged.
    const renamed = resolveBagName(bound, ctx);
    return renamed.resolved
      ? { source: `step-binding: ${renamed.text}`, unresolved: false }
      : { source: `step-binding literal ${JSON.stringify(bound)}`, unresolved: false };
  }

  const own = resolveBagName(inputId, ctx);
  if (own.resolved) return { source: own.text, unresolved: false };
  if (opts.hasDefault) return { source: 'declared default on the input (no session producer)', unresolved: false };
  if (opts.optional) return { source: 'optional input (no session producer — supply from working context if available)', unresolved: false };
  if (opts.inherited) return { source: 'ambient session context (inherited contract; no session producer found)', unresolved: false };
  return {
    source: `UNRESOLVED — no workflow variable, prior step output, or step-binding supplies '${inputId}'`,
    unresolved: true,
  };
}

/** The bag name a declared output lands under when the step binding remaps it, else undefined
 *  (it lands under its own id — stated once by the provenance note, not per item). */
export function resolveOutputDestination(outputId: string, binding: TechniqueBinding | undefined): string | undefined {
  const bagName = binding?.outputs?.[outputId];
  return bagName === undefined ? undefined : `lands as session variable '${bagName}' (step-binding remap)`;
}

/* --------------------------------- decoration --------------------------------- */

export interface DecoratedTechnique { technique: Technique; warnings: string[] }

/**
 * Return a copy of a composed technique with per-input `source:` (own and inherited blocks) and
 * per-remapped-output `destination:` annotations plus the provenance note, and the UNRESOLVED
 * warnings for its own inputs. Inherited entries never warn — shared contract scope is ambient by
 * design; their annotation is informational.
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
    const { source, unresolved } = resolveInputSource(item.id, ctx, binding, {
      hasDefault: item.default !== undefined,
      optional: OPTIONAL_INPUT_RE.test(item.description?.trim() ?? ''),
      inherited,
    });
    if (unresolved && !inherited) {
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
