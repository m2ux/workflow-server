import { z } from 'zod';
import type { Workflow } from '../schema/workflow.schema.js';
import { flattenActivitySteps } from '../schema/activity.schema.js';
import { getValidTransitions, getActivity, getTransitionList, TERMINAL_SENTINEL } from '../loaders/workflow-loader.js';

/**
 * Minimal view of session state required by the validation helpers. The
 * server-managed `SessionFile` is projected onto this shape via the
 * `sessionView()` adapter in `session-resolver.ts`, keeping the validation
 * surface storage-agnostic.
 */
export interface SessionView {
  /** Workflow id (`workflowId` on the `SessionFile`). */
  wf: string;
  /** Current activity id (`currentActivity` on the `SessionFile`). */
  act: string;
  /** Workflow version (`workflowVersion` on the `SessionFile`). */
  v: string;
}

export interface ValidationResult {
  status: 'valid' | 'warning' | 'error';
  warnings: string[];
  errors?: string[];
}

function emptyValidation(): ValidationResult {
  return { status: 'valid', warnings: [] };
}

export function validateActivityTransition(view: SessionView, workflow: Workflow, activityId: string): string | null {
  if (!view.act) {
    if (workflow.initialActivity && activityId !== workflow.initialActivity) {
      return `First activity must be '${workflow.initialActivity}' but '${activityId}' was requested. Start with the workflow's initialActivity.`;
    }
    return null;
  }
  if (view.act === activityId) return null;
  // The terminal sentinel is a valid terminal target from any activity (it may
  // be reached via an abort/checkpoint effect rather than a declared transition).
  if (activityId === TERMINAL_SENTINEL) return null;

  const valid = getValidTransitions(workflow, view.act);
  if (valid.length === 0) return null;

  if (!valid.includes(activityId)) {
    return `Activity '${activityId}' is not a direct transition from '${view.act}'. Valid transitions: [${valid.join(', ')}]`;
  }
  return null;
}

export function validateWorkflowVersion(view: SessionView, workflow: Workflow): string | null {
  if (view.v && workflow.version && view.v !== workflow.version) {
    return `Workflow version drift: session started with v${view.v} but current definition is v${workflow.version}. Workflow may have changed mid-session.`;
  }
  return null;
}

export interface StepManifestEntry {
  step_id: string;
  output: string;
}

export function validateStepManifest(
  manifest: StepManifestEntry[],
  workflow: Workflow,
  activityId: string,
): string[] {
  const activity = getActivity(workflow, activityId);
  if (!activity) return [`Cannot validate manifest: activity '${activityId}' not found`];

  const { steps } = activity;
  if (!steps || steps.length === 0) return [];

  const topLevelIds = steps.map(s => s.id).filter((id): id is string => id !== undefined);
  // `when`/`condition` gates are evaluated agent-side; a gated step may be
  // legitimately skipped, so only ungated top-level steps are required.
  const requiredIds = steps
    .filter(s => s.when === undefined && s.condition === undefined)
    .map(s => s.id)
    .filter((id): id is string => id !== undefined);
  // Loop-body step ids are legitimate manifest entries (executed per
  // iteration) but never required — the iteration count may be zero.
  const knownIds = new Set(
    flattenActivitySteps(activity).map(s => s.id).filter((id): id is string => id !== undefined),
  );
  const manifestIds = manifest.map(m => m.step_id);
  const manifestIdSet = new Set(manifestIds);
  const warnings: string[] = [];

  const missing = requiredIds.filter(id => !manifestIdSet.has(id));
  if (missing.length > 0) {
    warnings.push(`Missing steps in manifest: [${missing.join(', ')}]`);
  }

  const unexpected = manifestIds.filter(id => !knownIds.has(id));
  if (unexpected.length > 0) {
    warnings.push(`Unexpected steps in manifest: [${unexpected.join(', ')}]`);
  }

  // Gated steps may be absent and loop-body ids interleave per iteration, so
  // order is a subsequence check over top-level ids, not a positional one.
  const declarationIndex = new Map(topLevelIds.map((id, i) => [id, i] as const));
  let prevId: string | undefined;
  let prevIndex = -1;
  for (const id of manifestIds) {
    const index = declarationIndex.get(id);
    if (index === undefined) continue;
    if (prevId !== undefined && index < prevIndex) {
      warnings.push(`Step order mismatch: '${id}' reported after '${prevId}' but declared before it`);
    }
    prevId = id;
    prevIndex = index;
  }

  for (const entry of manifest) {
    if (!entry.output || (typeof entry.output === 'string' && entry.output.trim().length === 0)) {
      warnings.push(`Step '${entry.step_id}' has empty output`);
    }
  }

  return warnings;
}

export function validateTransitionCondition(view: SessionView, workflow: Workflow, activityId: string, claimedCondition: string | undefined): string | null {
  if (!view.act) return null;
  if (view.act === activityId) return null;

  const transitions = getTransitionList(workflow, view.act);
  if (transitions.length === 0) return null;

  const matchingTransition = transitions.find(t => t.to === activityId);
  if (!matchingTransition) return null;

  const claimIsEmpty = claimedCondition === undefined || claimedCondition === '';
  const claimIsDefault = claimedCondition === 'default';

  if (claimIsEmpty || claimIsDefault) {
    if (matchingTransition.isDefault || !matchingTransition.condition) return null;
    return `Transition to '${activityId}' requires condition '${matchingTransition.condition}' but agent claimed ${claimIsDefault ? "'default'" : 'no condition'}.`;
  }

  if (matchingTransition.isDefault && !matchingTransition.condition) {
    return `Transition to '${activityId}' is the default (no condition) but agent claimed condition '${claimedCondition}'.`;
  }

  if (matchingTransition.condition && matchingTransition.condition !== claimedCondition) {
    return `Condition mismatch for transition to '${activityId}': workflow defines '${matchingTransition.condition}' but agent claimed '${claimedCondition}'.`;
  }

  return null;
}

export interface ActivityManifestEntry {
  activity_id: string;
  outcome: string;
  transition_condition?: string;
}

export function validateActivityManifest(
  manifest: ActivityManifestEntry[],
  workflow: Workflow,
): string[] {
  const activityIds = (workflow.activities ?? []).map(a => a.id);
  const warnings: string[] = [];

  for (const entry of manifest) {
    if (!activityIds.includes(entry.activity_id)) {
      warnings.push(`Activity manifest references unknown activity '${entry.activity_id}'`);
    }
    if (!entry.outcome || (typeof entry.outcome === 'string' && entry.outcome.trim().length === 0)) {
      warnings.push(`Activity '${entry.activity_id}' has empty outcome`);
    }
    if (entry.transition_condition !== undefined && entry.transition_condition !== '') {
      const activity = getActivity(workflow, entry.activity_id);
      if (activity) {
        const transitions = getTransitionList(workflow, entry.activity_id);
        const hasMatchingCondition = transitions.some(
          t => t.condition === entry.transition_condition || (t.isDefault && entry.transition_condition === 'default')
        );
        if (!hasMatchingCondition && transitions.length > 0) {
          warnings.push(`Activity '${entry.activity_id}' claims transition condition '${entry.transition_condition}' not found in workflow transitions`);
        }
      }
    }
  }

  return warnings;
}

export function buildValidation(...warnings: (string | null)[]): ValidationResult {
  const result = emptyValidation();
  for (const w of warnings) {
    if (w) {
      result.warnings.push(w);
      result.status = 'warning';
    }
  }
  return result;
}

export const ValidationResultSchema = z.object({
  status: z.enum(['valid', 'warning', 'error']),
  warnings: z.array(z.string()),
  errors: z.array(z.string()).optional(),
});

/**
 * Response `_meta` envelope returned by every authenticated tool. The session
 * is identified by the stable `session_index` parameter passed on every call;
 * authoritative state lives in `session.json` on disk. Handlers may echo the
 * resolved index for trace correlation.
 */
export const MetaResponseSchema = z.object({
  session_index: z.string().regex(/^[A-Z2-7]{6}$/).optional(),
  validation: ValidationResultSchema,
});
export type MetaResponse = z.infer<typeof MetaResponseSchema>;

export function buildMeta(sessionIndex: string | undefined, validation: ValidationResult): MetaResponse {
  return sessionIndex
    ? { session_index: sessionIndex, validation }
    : { validation };
}
