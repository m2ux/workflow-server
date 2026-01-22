export class WorkflowNotFoundError extends Error {
  readonly code = 'WORKFLOW_NOT_FOUND';
  constructor(public readonly workflowId: string) { super(`Workflow not found: ${workflowId}`); this.name = 'WorkflowNotFoundError'; }
}

export class GuideNotFoundError extends Error {
  readonly code = 'GUIDE_NOT_FOUND';
  constructor(public readonly guideId: string, public readonly workflowId?: string) { 
    super(workflowId ? `Guide not found: ${guideId} in workflow ${workflowId}` : `Guide not found: ${guideId}`); 
    this.name = 'GuideNotFoundError'; 
  }
}

export class TemplateNotFoundError extends Error {
  readonly code = 'TEMPLATE_NOT_FOUND';
  constructor(public readonly templateIndex: string, public readonly workflowId: string) { 
    super(`Template not found: index ${templateIndex} in workflow ${workflowId}`); 
    this.name = 'TemplateNotFoundError'; 
  }
}

export class PhaseNotFoundError extends Error {
  readonly code = 'PHASE_NOT_FOUND';
  constructor(public readonly workflowId: string, public readonly phaseId: string) {
    super(`Phase not found: ${phaseId} in workflow ${workflowId}`); this.name = 'PhaseNotFoundError';
  }
}

export class WorkflowValidationError extends Error {
  readonly code = 'WORKFLOW_VALIDATION_ERROR';
  constructor(public readonly workflowId: string, public readonly issues: string[]) {
    super(`Workflow validation failed for ${workflowId}: ${issues.join(', ')}`); this.name = 'WorkflowValidationError';
  }
}

export class SkillNotFoundError extends Error {
  readonly code = 'SKILL_NOT_FOUND';
  constructor(public readonly skillId: string) { super(`Skill not found: ${skillId}`); this.name = 'SkillNotFoundError'; }
}

export class IntentNotFoundError extends Error {
  readonly code = 'INTENT_NOT_FOUND';
  constructor(public readonly intentId: string) { super(`Intent not found: ${intentId}`); this.name = 'IntentNotFoundError'; }
}
