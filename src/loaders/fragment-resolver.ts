/**
 * Shared-fragment resolution (#166 B10).
 *
 * A workflow declares reusable content once under `fragments` in its workflow.yaml — rule texts
 * (`fragments.rules`) and checkpoint bodies (`fragments.checkpoints`) — and imports it by
 * reference: a `{ ref }` entry in a rules partition, or `ref` on a kind:checkpoint step. This
 * module resolves those references and materializes them in place, so everything downstream of
 * the loaders (tool payloads, checkpoint yield/respond, guards) sees plain rules and full
 * checkpoint steps and never a reference.
 *
 * Reference addressing mirrors the technique convention:
 *   - `workflow::name` — resolved ONLY in that workflow's fragments (no fallback).
 *   - `name` — the declaring workflow's fragments first, then meta's.
 *
 * The core is synchronous and pure over a `FragmentsLookup`, so the async loaders and the
 * synchronous guard scripts share one resolution semantics. Fragment bodies are plain content —
 * a fragment cannot itself contain a reference — so resolution never recurses.
 */
import type { CheckpointFragmentBody, CheckpointStep, Step } from '../schema/activity.schema.js';
import type { RuleEntry, WorkflowFragments } from '../schema/workflow.schema.js';
import { stringifyForResponse } from '../utils/serialization.js';

/** The meta workflow: the fallback namespace for bare fragment (and technique) references. */
export const META_WORKFLOW_ID = 'meta';

/** Sync fragment lookup by workflow id; undefined when the workflow (or its fragments) is absent. */
export type FragmentsLookup = (workflowId: string) => WorkflowFragments | undefined;

export class FragmentResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FragmentResolutionError';
  }
}

/** Split `[workflow::]name`. A ref with more than one `::` is malformed. */
export function parseFragmentRef(ref: string): { workflowId?: string; name: string } {
  const segments = ref.split('::');
  if (segments.length === 1) return { name: ref };
  if (segments.length === 2 && segments[0] && segments[1]) {
    return { workflowId: segments[0], name: segments[1] };
  }
  throw new FragmentResolutionError(`Malformed fragment ref '${ref}' — expected 'name' or 'workflow::name'.`);
}

function candidateWorkflows(ref: string, currentWorkflowId: string): { workflowIds: string[]; name: string } {
  const { workflowId, name } = parseFragmentRef(ref);
  if (workflowId) return { workflowIds: [workflowId], name };
  const workflowIds = currentWorkflowId === META_WORKFLOW_ID
    ? [META_WORKFLOW_ID]
    : [currentWorkflowId, META_WORKFLOW_ID];
  return { workflowIds, name };
}

/** Resolve a rule-fragment ref to its rule strings (a string fragment yields one). */
export function resolveRuleFragment(lookup: FragmentsLookup, currentWorkflowId: string, ref: string): string[] {
  const { workflowIds, name } = candidateWorkflows(ref, currentWorkflowId);
  for (const wf of workflowIds) {
    const body = lookup(wf)?.rules?.[name];
    if (body !== undefined) return typeof body === 'string' ? [body] : [...body];
  }
  throw new FragmentResolutionError(
    `Unresolved rule fragment '${ref}' — no fragments.rules entry '${name}' in ${workflowIds.map(w => `'${w}'`).join(' or ')}.`,
  );
}

/** Resolve a checkpoint-fragment ref to its body. */
export function resolveCheckpointFragment(lookup: FragmentsLookup, currentWorkflowId: string, ref: string): CheckpointFragmentBody {
  const { workflowIds, name } = candidateWorkflows(ref, currentWorkflowId);
  for (const wf of workflowIds) {
    const body = lookup(wf)?.checkpoints?.[name];
    if (body !== undefined) return body;
  }
  throw new FragmentResolutionError(
    `Unresolved checkpoint fragment '${ref}' — no fragments.checkpoints entry '${name}' in ${workflowIds.map(w => `'${w}'`).join(' or ')}.`,
  );
}

/**
 * Splice rule-fragment refs in place: each `{ ref }` entry is replaced by its fragment's rule
 * string(s), preserving order. Returns plain strings — the only shape delivered to agents.
 */
export function materializeRuleEntries(
  entries: RuleEntry[] | undefined,
  lookup: FragmentsLookup,
  currentWorkflowId: string,
): string[] | undefined {
  if (!entries) return undefined;
  const out: string[] = [];
  for (const entry of entries) {
    if (typeof entry === 'string') out.push(entry);
    else out.push(...resolveRuleFragment(lookup, currentWorkflowId, entry.ref));
  }
  return out;
}

/** The body fields a ref-form checkpoint step must NOT declare locally (the fragment owns them). */
const CHECKPOINT_BODY_FIELDS = ['message', 'options', 'defaultOption', 'autoAdvanceMs', 'blocking'] as const;

/**
 * Materialize one checkpoint step in place. A ref step contributes its id (and site gates:
 * `when`, `required`, and — only when the fragment declares none — `condition`); the fragment
 * contributes the body. Enforces the one-home rule: a local body field alongside `ref`, or a
 * condition on both sides, is an error. An inline step (no ref) must carry its own body.
 */
export function materializeCheckpointStep(
  step: CheckpointStep,
  lookup: FragmentsLookup,
  currentWorkflowId: string,
  context: string,
): void {
  if (step.ref === undefined) {
    if (step.message === undefined || step.options === undefined) {
      throw new FragmentResolutionError(
        `${context}: checkpoint '${step.id}' declares neither a fragment ref nor a full body (message + options).`,
      );
    }
    return;
  }
  const declaredLocally = CHECKPOINT_BODY_FIELDS.filter((f) => step[f] !== undefined);
  if (declaredLocally.length > 0) {
    throw new FragmentResolutionError(
      `${context}: checkpoint '${step.id}' declares ref '${step.ref}' alongside body field(s) ${declaredLocally.join(', ')} — the fragment is the single home for the body.`,
    );
  }
  const body = resolveCheckpointFragment(lookup, currentWorkflowId, step.ref);
  if (body.condition && step.condition) {
    throw new FragmentResolutionError(
      `${context}: checkpoint '${step.id}' declares a condition, but fragment '${step.ref}' already carries one — declare it in exactly one place.`,
    );
  }
  step.message = body.message;
  step.options = structuredClone(body.options);
  step.defaultOption = body.defaultOption;
  step.autoAdvanceMs = body.autoAdvanceMs;
  step.blocking = body.blocking;
  if (body.condition) step.condition = structuredClone(body.condition);
  delete step.ref;
}

/**
 * Materialize every checkpoint step in an activity (top-level and loop bodies), scoped to the
 * workflow the activity file belongs to — a borrowed cross-workflow activity resolves its bare
 * refs against its SOURCE workflow, not the borrower.
 */
export function materializeActivityFragments(
  activity: { id: string; steps?: Step[] | undefined },
  lookup: FragmentsLookup,
  sourceWorkflowId: string,
): void {
  const walk = (steps: Step[] | undefined): void => {
    for (const step of steps ?? []) {
      if (step.kind === 'checkpoint') {
        materializeCheckpointStep(step, lookup, sourceWorkflowId, `Activity '${activity.id}'`);
      } else if (step.kind === 'loop') {
        walk(step.steps as Step[]);
      }
    }
  };
  walk(activity.steps);
}

/**
 * Materialize checkpoint fragment refs in RAW activity YAML, for delivery paths that hand the
 * worker the original file text (get_activity). Each `ref:` line inside a kind:checkpoint step is
 * replaced, at its own indentation, by the fragment body serialized to YAML — the surrounding
 * lines (the step's id, a local condition, everything else in the file) stay byte-identical. A
 * `ref:` line outside a checkpoint step is left untouched.
 */
export function injectCheckpointFragmentBodies(
  rawDefinition: string,
  resolve: (ref: string) => CheckpointFragmentBody,
): string {
  const lines = rawDefinition.split('\n');
  const out: string[] = [];

  const isCheckpointStep = (refLineIdx: number, fieldIndent: number): boolean => {
    // The step opens at the nearest preceding `- ` list item whose fields sit at fieldIndent.
    let start = -1;
    for (let i = refLineIdx; i >= 0; i--) {
      const line = lines[i]!;
      if (line.trim() === '') continue;
      const indent = line.length - line.trimStart().length;
      if (line.trimStart().startsWith('- ') && indent === fieldIndent - 2) { start = i; break; }
      if (indent < fieldIndent && !line.trimStart().startsWith('- ')) return false;
    }
    if (start === -1) return false;
    // Scan the step block for its kind discriminator.
    for (let i = start; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim() === '') continue;
      const indent = line.length - line.trimStart().length;
      if (i > start && indent < fieldIndent) break;
      if (/^(- )?kind:\s*["']?checkpoint["']?\s*$/.test(line.trimStart())) return true;
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const match = /^(\s*)ref:[ \t]*(["']?)([^"']+?)\2[ \t]*$/.exec(line);
    if (!match || !isCheckpointStep(i, match[1]!.length)) {
      out.push(line);
      continue;
    }
    const indent = match[1]!;
    const body = resolve(match[3]!);
    const serialized: Record<string, unknown> = {
      ...(body.condition !== undefined ? { condition: body.condition } : {}),
      message: body.message,
      ...(body.blocking !== undefined ? { blocking: body.blocking } : {}),
      ...(body.defaultOption !== undefined ? { defaultOption: body.defaultOption } : {}),
      ...(body.autoAdvanceMs !== undefined ? { autoAdvanceMs: body.autoAdvanceMs } : {}),
      options: body.options,
    };
    for (const bodyLine of stringifyForResponse(serialized).trimEnd().split('\n')) {
      out.push(indent + bodyLine);
    }
  }
  return out.join('\n');
}

/**
 * Cheap textual pre-scan for candidate `ref:` lines in raw activity YAML — the delivery path's
 * fast gate, avoiding a full parse of ref-free activities (the overwhelmingly common case). May
 * over-match a non-checkpoint `ref:` key; the injector's context check filters those.
 */
export function scanCheckpointRefLines(rawDefinition: string): string[] {
  const refs: string[] = [];
  const re = /^\s*ref:[ \t]*(["']?)([^"']+?)\1[ \t]*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawDefinition))) refs.push(m[2]!);
  return refs;
}

/** Every fragment ref used by an activity's checkpoint steps (for lookup pre-loading). */
export function collectCheckpointRefs(activity: { steps?: Step[] | undefined }): string[] {
  const refs: string[] = [];
  const walk = (steps: Step[] | undefined): void => {
    for (const step of steps ?? []) {
      if (step.kind === 'checkpoint' && step.ref !== undefined) refs.push(step.ref);
      else if (step.kind === 'loop') walk(step.steps as Step[]);
    }
  };
  walk(activity.steps);
  return refs;
}

/** Every fragment ref used by a workflow's rules partitions. */
export function collectRuleRefs(rules: { workflow?: RuleEntry[] | undefined; activity?: RuleEntry[] | undefined; universal?: RuleEntry[] | undefined } | undefined): string[] {
  if (!rules) return [];
  const refs: string[] = [];
  for (const partition of [rules.workflow, rules.activity, rules.universal]) {
    for (const entry of partition ?? []) {
      if (typeof entry !== 'string') refs.push(entry.ref);
    }
  }
  return refs;
}
