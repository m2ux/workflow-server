import { z } from 'zod';
import type { Workflow } from '../schema/workflow.schema.js';
import { getValidTransitions, getActivity, getTransitionList } from '../loaders/workflow-loader.js';

/**
 * Minimal view of session state required by the validation helpers. Both the
 * legacy `SessionPayload` (token-decoded) and the new `SessionFile`
 * (server-managed) can be projected onto this shape with a tiny adapter, so
 * the validation surface stays storage-agnostic while Phase 4 swaps the
 * authenticated tools across.
 */
export interface SessionView {
  /** Workflow id (`wf` on the legacy payload, `workflowId` on the file). */
  wf: string;
  /** Current activity id (`act` on the legacy payload, `currentActivity` on the file). */
  act: string;
  /** Workflow version (`v` on the legacy payload, `workflowVersion` on the file). */
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

export function validateWorkflowConsistency(view: SessionView, workflowId: string): string | null {
  if (view.wf && view.wf !== workflowId) {
    return `Workflow mismatch: session was on '${view.wf}' but call targets '${workflowId}'. Start a new session for a different workflow.`;
  }
  return null;
}

export function validateActivityTransition(view: SessionView, workflow: Workflow, activityId: string): string | null {
  if (!view.act) {
    if (workflow.initialActivity && activityId !== workflow.initialActivity) {
      return `First activity must be '${workflow.initialActivity}' but '${activityId}' was requested. Start with the workflow's initialActivity.`;
    }
    return null;
  }
  if (view.act === activityId) return null;

  const valid = getValidTransitions(workflow, view.act);
  if (valid.length === 0) return null;

  if (!valid.includes(activityId)) {
    return `Activity '${activityId}' is not a direct transition from '${view.act}'. Valid transitions: [${valid.join(', ')}]`;
  }
  return null;
}

export function validateSkillAssociation(workflow: Workflow, activityId: string, skillId: string): string | null {
  if (!activityId) return 'Skill association check skipped: no current activity in session';

  const activity = getActivity(workflow, activityId);
  if (!activity) return `Skill association check skipped: activity '${activityId}' not found in workflow`;

  const declared = new Set<string>();

  if (activity.skills?.primary) declared.add(activity.skills.primary);
  if (activity.skills?.supporting) activity.skills.supporting.forEach(s => declared.add(s));

  if (activity.steps) {
    for (const step of activity.steps) {
      if (step.skill) declared.add(step.skill);
    }
  }
  if (activity.loops) {
    for (const loop of activity.loops) {
      if (loop.steps) {
        for (const step of loop.steps) {
          if (step.skill) declared.add(step.skill);
        }
      }
    }
  }

  if (declared.size === 0) return null;

  if (!declared.has(skillId)) {
    return `Skill '${skillId}' is not declared by activity '${activityId}'. Declared skills: [${[...declared].join(', ')}]`;
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

  const expectedIds = steps.map(s => s.id);
  const manifestIds = manifest.map(m => m.step_id);
  const warnings: string[] = [];

  const missing = expectedIds.filter(id => !manifestIds.includes(id));
  if (missing.length > 0) {
    warnings.push(`Missing steps in manifest: [${missing.join(', ')}]`);
  }

  const unexpected = manifestIds.filter(id => !expectedIds.includes(id));
  if (unexpected.length > 0) {
    warnings.push(`Unexpected steps in manifest: [${unexpected.join(', ')}]`);
  }

  for (let i = 0; i < manifestIds.length && i < expectedIds.length; i++) {
    if (manifestIds[i] !== expectedIds[i]) {
      warnings.push(`Step order mismatch at position ${i}: expected '${expectedIds[i]}' but got '${manifestIds[i]}'`);
    }
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

export function buildErrorValidation(error: string, ...warnings: (string | null)[]): ValidationResult {
  const result = buildValidation(...warnings);
  result.status = 'error';
  result.errors = [error];
  return result;
}

export const ValidationResultSchema = z.object({
  status: z.enum(['valid', 'warning', 'error']),
  warnings: z.array(z.string()),
  errors: z.array(z.string()).optional(),
});

/**
 * Response `_meta` envelope returned by every authenticated tool. The legacy
 * `session_token` field is removed in Phase 4 (R3) — the agent identifies the
 * session via the stable `session_index` parameter passed on every call, and
 * authoritative state lives in `session.json` on disk, so there is nothing for
 * the server to thread back through the response.
 *
 * `session_index` is included as an optional field so handlers may echo the
 * resolved index for parity with the input (helpful for trace correlation in
 * test fixtures), but agents are not expected to read it back from the
 * response.
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
