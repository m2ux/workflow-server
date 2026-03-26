import type { SessionPayload } from './session.js';
import type { Workflow } from '../schema/workflow.schema.js';
import { getValidTransitions, getActivity, getTransitionList } from '../loaders/workflow-loader.js';

export interface ValidationResult {
  status: 'valid' | 'warning';
  warnings: string[];
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

  const skills = activity.skills;
  if (!skills) return null;

  const declared: string[] = [];
  if (typeof skills === 'object' && 'primary' in skills) {
    declared.push((skills as { primary: string }).primary);
    const supporting = (skills as { supporting?: string[] }).supporting;
    if (supporting) declared.push(...supporting);
  }

  if (declared.length > 0 && !declared.includes(skillId)) {
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

  const steps = (activity as Record<string, unknown>)['steps'] as Array<{ id: string }> | undefined;
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
      break;
    }
  }

  for (const entry of manifest) {
    if (!entry.output || entry.output.trim().length === 0) {
      warnings.push(`Step '${entry.step_id}' has empty output`);
    }
  }

  return warnings;
}

export function validateTransitionCondition(token: SessionPayload, workflow: Workflow, activityId: string, claimedCondition: string): string | null {
  if (!token.act) return null;
  if (token.act === activityId) return null;

  const transitions = getTransitionList(workflow, token.act);
  if (transitions.length === 0) return null;

  const matchingTransition = transitions.find(t => t.to === activityId);
  if (!matchingTransition) return null;

  if (claimedCondition === '' || claimedCondition === 'default') {
    if (matchingTransition.isDefault) return null;
    if (matchingTransition.condition) {
      return `Transition to '${activityId}' requires condition '${matchingTransition.condition}' but agent claimed default transition.`;
    }
    return null;
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
    if (!entry.outcome || entry.outcome.trim().length === 0) {
      warnings.push(`Activity '${entry.activity_id}' has empty outcome`);
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
