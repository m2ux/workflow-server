import { z } from 'zod';

// Step indices are 1-based integers
const StepIndex = z.number().int().min(1);

export const HistoryEventTypeSchema = z.enum([
  'workflow_started', 'workflow_ending', 'workflow_completed', 'workflow_aborted',
  'workflow_triggered', 'workflow_returned', 'workflow_suspended',
  'activity_entered', 'activity_exited', 'activity_skipped',
  'step_started', 'step_completed',
  'checkpoint_reached', 'checkpoint_response',
  'decision_reached', 'decision_branch_taken',
  'loop_started', 'loop_iteration', 'loop_completed', 'loop_break',
  'variable_set', 'error',
]);
export type HistoryEventType = z.infer<typeof HistoryEventTypeSchema>;

export const HistoryEntrySchema = z.object({
  timestamp: z.string().datetime(),
  type: HistoryEventTypeSchema,
  activity: z.string().optional(),
  step: StepIndex.optional(),
  checkpoint: z.string().optional(),
  decision: z.string().optional(),
  loop: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  error: z.object({ message: z.string(), code: z.string().optional() }).optional(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

// Key format: "activityId-checkpointId" (e.g., "review-approve")
export const CheckpointResponseSchema = z.object({
  optionId: z.string(),
  respondedAt: z.string().datetime(),
  effects: z.object({
    variablesSet: z.record(z.unknown()).optional(),
    transitionedTo: z.string().optional(),
    activitiesSkipped: z.array(z.string()).optional(),
  }).optional(),
});
export type CheckpointResponse = z.infer<typeof CheckpointResponseSchema>;

// Key format: "activityId-decisionId"
export const DecisionOutcomeSchema = z.object({
  branchId: z.string(),
  decidedAt: z.string().datetime(),
  transitionedTo: z.string(),
});
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

export const LoopStateSchema = z.object({
  activityId: z.string(),
  loopId: z.string(),
  currentIteration: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative().optional(),
  currentItem: z.unknown().optional(),
  startedAt: z.string().datetime(),
});
export type LoopState = z.infer<typeof LoopStateSchema>;

export const ParentWorkflowRefSchema = z.object({
  workflowId: z.string(),
  activityId: z.string(),
  passedContext: z.record(z.unknown()).optional(),
  returnTo: z.object({
    activityId: z.string(),
    stepIndex: StepIndex.optional(),
  }).optional(),
});
export type ParentWorkflowRef = z.infer<typeof ParentWorkflowRefSchema>;

export const TriggeredWorkflowRefSchema = z.object({
  workflowId: z.string(),
  triggeredAt: z.string().datetime(),
  triggeredFrom: z.object({
    activityId: z.string(),
    stepIndex: StepIndex.optional(),
  }),
  status: z.enum(['running', 'completed', 'aborted', 'error']),
  returnedContext: z.record(z.unknown()).optional(),
});
export type TriggeredWorkflowRef = z.infer<typeof TriggeredWorkflowRefSchema>;

export const WorkflowStateSchema = z.object({
  workflowId: z.string(),
  workflowVersion: z.string(),
  stateVersion: z.number().int().positive().default(1),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  currentActivity: z.string(),
  currentStep: StepIndex.optional(),
  completedActivities: z.array(z.string()).default([]),
  skippedActivities: z.array(z.string()).default([]),
  completedSteps: z.record(z.array(StepIndex)).default({}),
  checkpointResponses: z.record(CheckpointResponseSchema).default({}),
  decisionOutcomes: z.record(DecisionOutcomeSchema).default({}),
  activeLoops: z.array(LoopStateSchema).default([]),
  variables: z.record(z.unknown()).default({}),
  history: z.array(HistoryEntrySchema).default([]),
  status: z.enum(['running', 'paused', 'suspended', 'completed', 'aborted', 'error']).default('running'),
  parentWorkflow: ParentWorkflowRefSchema.optional(),
  triggeredWorkflows: z.array(TriggeredWorkflowRefSchema).default([]),
  lastError: z.object({
    message: z.string(),
    code: z.string().optional(),
    activity: z.string().optional(),
    step: StepIndex.optional(),
    timestamp: z.string().datetime(),
  }).optional(),
});
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

export function createInitialState(workflowId: string, workflowVersion: string, initialActivity: string, initialVariables?: Record<string, unknown>): WorkflowState {
  const now = new Date().toISOString();
  return {
    workflowId, workflowVersion, stateVersion: 1, startedAt: now, updatedAt: now, currentActivity: initialActivity,
    completedActivities: [], skippedActivities: [], completedSteps: {}, checkpointResponses: {}, decisionOutcomes: {},
    activeLoops: [], variables: initialVariables ?? {}, triggeredWorkflows: [],
    history: [{ timestamp: now, type: 'workflow_started', activity: initialActivity, data: { initialVariables } }],
    status: 'running',
  };
}

export function validateState(data: unknown): WorkflowState { return WorkflowStateSchema.parse(data); }
export function safeValidateState(data: unknown) { return WorkflowStateSchema.safeParse(data); }

export function addHistoryEvent(state: WorkflowState, type: HistoryEventType, details?: Partial<Omit<HistoryEntry, 'timestamp' | 'type'>>): WorkflowState {
  const now = new Date().toISOString();
  return { ...state, stateVersion: state.stateVersion + 1, updatedAt: now, history: [...state.history, { timestamp: now, type, ...details }] };
}
