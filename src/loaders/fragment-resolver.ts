/**
 * Shared-fragment resolution (#166 B10).
 *
 * A workflow declares a checkpoint body once under `fragments.checkpoints` in its workflow.yaml
 * and imports it by `ref` on a kind:checkpoint step. This module resolves those references and
 * materializes them in place, so everything downstream of the loaders (tool payloads, checkpoint
 * yield/respond, guards) sees full checkpoint steps and never a reference.
 *
 * Rules are not shared this way: a rule two workflows both need is neither one's to own, so its
 * home is the conduct technique whose audience it binds and the bundle delivers it (#518, #519).
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
import type { WorkflowFragments } from '../schema/workflow.schema.js';
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

/** The body fields a ref-form checkpoint step must NOT declare locally (the fragment owns them). */
const CHECKPOINT_BODY_FIELDS = ['message', 'options', 'defaultOption', 'autoAdvanceMs'] as const;

/**
 * A checkpoint's softness is the `defaultOption` + `autoAdvanceMs` pair, so half a pair is not a
 * weaker gate but an unreadable one: a default with no interval names an answer the server will
 * never apply, and an interval with no default names a wait with nothing to take. The step schema
 * cannot say this — it is a discriminated-union member, and a Zod refinement is not one — so the
 * loader does, for the inline and the fragment form alike.
 */
function assertSoftnessPaired(step: CheckpointStep, context: string): void {
  const hasDefault = step.defaultOption !== undefined;
  const hasInterval = step.autoAdvanceMs !== undefined;
  if (hasDefault === hasInterval) return;
  const declared = hasDefault ? 'defaultOption' : 'autoAdvanceMs';
  const missing = hasDefault ? 'autoAdvanceMs' : 'defaultOption';
  throw new FragmentResolutionError(
    `${context}: checkpoint '${step.id}' declares ${declared} without ${missing}. `
    + 'A soft gate declares both; a gate that waits for an explicit selection declares neither.',
  );
}

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
    assertSoftnessPaired(step, context);
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
  if (body.condition) step.condition = structuredClone(body.condition);
  delete step.ref;
  assertSoftnessPaired(step, context);
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

