export class WorkflowNotFoundError extends Error {
  constructor(public readonly workflowId: string) { super(`Workflow not found: ${workflowId}`); this.name = 'WorkflowNotFoundError'; }
}

export class ResourceNotFoundError extends Error {
  constructor(public readonly resourceId: string, public readonly workflowId?: string) {
    super(workflowId ? `Resource not found: ${resourceId} in workflow ${workflowId}` : `Resource not found: ${resourceId}`);
    this.name = 'ResourceNotFoundError';
  }
}

export class WorkflowValidationError extends Error {
  constructor(public readonly workflowId: string, public readonly issues: string[]) {
    super(`Workflow validation failed for ${workflowId}: ${issues.join(', ')}`); this.name = 'WorkflowValidationError';
  }
}

export class TechniqueNotFoundError extends Error {
  constructor(public readonly techniqueId: string) { super(`Technique not found: ${techniqueId}`); this.name = 'TechniqueNotFoundError'; }
}

export class ActivityNotFoundError extends Error {
  constructor(public readonly activityId: string, public readonly workflowId?: string) {
    super(workflowId ? `Activity not found: ${activityId} in workflow ${workflowId}` : `Activity not found: ${activityId}`);
    this.name = 'ActivityNotFoundError';
  }
}
