// Activity types (from unified activity schema)
export type { 
  Action, 
  Step, 
  CheckpointOption, 
  Checkpoint, 
  DecisionBranch, 
  Decision, 
  Transition, 
  Loop, 
  SkillsReference,
  WorkflowTrigger,
  Activity,
} from '../schema/activity.schema.js';

export { 
  ActionSchema, 
  StepSchema, 
  CheckpointOptionSchema, 
  CheckpointSchema, 
  DecisionBranchSchema, 
  DecisionSchema, 
  TransitionSchema, 
  LoopSchema, 
  SkillsReferenceSchema,
  WorkflowTriggerSchema,
  ActivitySchema,
  validateActivity, 
  safeValidateActivity,
} from '../schema/activity.schema.js';

// Workflow types
export type { VariableDefinition, Workflow } from '../schema/workflow.schema.js';
export { VariableDefinitionSchema, WorkflowSchema, validateWorkflow, safeValidateWorkflow } from '../schema/workflow.schema.js';

// Condition types
export type { ComparisonOperator, SimpleCondition, AndCondition, OrCondition, NotCondition, Condition } from '../schema/condition.schema.js';
export { ComparisonOperatorSchema, SimpleConditionSchema, AndConditionSchema, OrConditionSchema, NotConditionSchema, ConditionSchema, evaluateCondition, validateCondition, safeValidateCondition } from '../schema/condition.schema.js';

// Backward compatibility aliases (deprecated)
/** @deprecated Use Activity instead */
export type Phase = Activity;
import { type Activity } from '../schema/activity.schema.js';
