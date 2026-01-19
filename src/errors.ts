export class WorkflowNotFoundError extends Error {
  readonly code = 'WORKFLOW_NOT_FOUND';
  constructor(public readonly workflowId: string) { super(`Workflow not found: ${workflowId}`); this.name = 'WorkflowNotFoundError'; }
}

export class GuideNotFoundError extends Error {
  readonly code = 'GUIDE_NOT_FOUND';
  constructor(public readonly guideName: string) { super(`Guide not found: ${guideName}`); this.name = 'GuideNotFoundError'; }
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
