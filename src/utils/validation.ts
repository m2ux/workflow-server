import { z } from 'zod';
import type { SessionPayload } from './session.js';
import type { Workflow } from '../schema/workflow.schema.js';
import { getValidTransitions, getActivity, getTransitionList } from '../loaders/workflow-loader.js';

export interface ValidationResult {
  status: 'valid' | 'warning' | 'error';
  warnings: string[];
  errors?: string[];
}

function emptyValidation(): ValidationResult {
  return { status: 'valid', warnings: [] };
}

export function validateWorkflowConsistency(token: SessionPayload, workflowId: string): string | null {
  if (token.wf && token.wf !== workflowId) {
    return `Workflow mismatch: session was on '${token.wf}' but call targets '${workflowId}'. Start a new session for a different workflow.`;
  }
  return null;
}

export function validateActivityTransition(token: SessionPayload, workflow: Workflow, activityId: string): string | null {
  if (!token.act) return null;
  if (token.act === activityId) return null;

  const valid = getValidTransitions(workflow, token.act);
  if (valid.length === 0) return null;

  if (!valid.includes(activityId)) {
    return `Activity '${activityId}' is not a direct transition from '${token.act}'. Valid transitions: [${valid.join(', ')}]`;
  }
  return null;
}

export function validateSkillAssociation(workflow: Workflow, activityId: string, skillId: string): string | null {
  if (!activityId) return null;

  const activity = getActivity(workflow, activityId);
  if (!activity) return null;

  const { skills } = activity;
  if (!skills) return null;

  const declared: string[] = [skills.primary];
  if (skills.supporting) declared.push(...skills.supporting);

  if (!declared.includes(skillId)) {
    return `Skill '${skillId}' is not declared by activity '${activityId}'. Declared skills: [${declared.join(', ')}]`;
  }
  return null;
}

export function validateWorkflowVersion(token: SessionPayload, workflow: Workflow): string | null {
  if (token.v && workflow.version && token.v !== workflow.version) {
    return `Workflow version drift: session started with v${token.v} but current definition is v${workflow.version}. Workflow may have changed mid-session.`;
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

export function validateTransitionCondition(token: SessionPayload, workflow: Workflow, activityId: string, claimedCondition: string | undefined): string | null {
  if (!token.act) return null;
  if (token.act === activityId) return null;

  const transitions = getTransitionList(workflow, token.act);
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
  const activityIds = workflow.activities.map(a => a.id);
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

export const MetaResponseSchema = z.object({
  session_token: z.string(),
  validation: ValidationResultSchema,
});
export type MetaResponse = z.infer<typeof MetaResponseSchema>;

export function buildMeta(sessionToken: string, validation: ValidationResult): MetaResponse {
  return { session_token: sessionToken, validation };
}
