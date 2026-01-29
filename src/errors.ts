export class WorkflowNotFoundError extends Error {
  readonly code = 'WORKFLOW_NOT_FOUND';
  constructor(public readonly workflowId: string) { super(`Workflow not found: ${workflowId}`); this.name = 'WorkflowNotFoundError'; }
}

export class ResourceNotFoundError extends Error {
  readonly code = 'RESOURCE_NOT_FOUND';
  constructor(public readonly resourceId: string, public readonly workflowId?: string) { 
    super(workflowId ? `Resource not found: ${resourceId} in workflow ${workflowId}` : `Resource not found: ${resourceId}`); 
    this.name = 'ResourceNotFoundError'; 
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

export class ActivityNotFoundError extends Error {
  readonly code = 'ACTIVITY_NOT_FOUND';
  constructor(public readonly activityId: string, public readonly workflowId?: string) { 
    super(workflowId ? `Activity not found: ${activityId} in workflow ${workflowId}` : `Activity not found: ${activityId}`); 
    this.name = 'ActivityNotFoundError'; 
  }
}

export class RulesNotFoundError extends Error {
  readonly code = 'RULES_NOT_FOUND';
  constructor() { super('Global rules not found'); this.name = 'RulesNotFoundError'; }
}
