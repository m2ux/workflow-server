import { z } from 'zod';

// Step indices are 1-based integers
const StepIndex = z.number().int().min(1);

export const HistoryEventTypeSchema = z.enum([
  'workflow_started', 'workflow_completed', 'workflow_aborted',
  'workflow_triggered', 'workflow_returned', 'workflow_suspended',
  'activity_entered', 'activity_exited', 'activity_skipped',
  'step_started', 'step_completed',
  'checkpoint_reached', 'checkpoint_response', 'checkpoint_replayed',
  'decision_reached', 'decision_branch_taken',
  'loop_started', 'loop_iteration', 'loop_completed', 'loop_break',
  'variable_set', 'error',
  // Fidelity observability (#166 B8): content-fetch events recorded by
  // get_technique / get_resource. `data` carries { techniqueId, stepId?,
  // agentId } / { resourceId, agentId }; `activity` is the activity current
  // at fetch time (omitted before the first next_activity).
  'technique_fetched', 'resource_fetched',
  // Hybrid bundling (#166 B11): a step-bound technique delivered inline by
  // get_activity for an activity that declares `bundleTechniques`. `data`
  // carries { techniqueId, stepId, agentId }. Distinct from technique_fetched
  // so the fidelity stream still separates agent-initiated fetches from
  // server-pushed bundle deliveries; manifest validation accepts either.
  'technique_bundled',
  // Variable-model honesty (#166 B7): declared defaults seeded into the
  // session variable bag at session creation. ONE event per session; `data`
  // carries { variables: <the seeded map> }.
  'variables_seeded',
  // Token-use tracking (#232): per-activity native usage relayed by the
  // orchestrator at the next_activity transition seam. `data` carries the
  // token figures, model, cost_usd (nullable), and priceTableVersion.
  'usage_recorded',
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
  /**
   * Slug of the child's planning folder. Required for server-managed state —
   * the parent or any other caller resumes the child by calling
   * `start_session({ planning_folder: "<workspace>/.engineering/artifacts/planning/<slug>" })`
   * (long-form path; the server derives the slug from `basename(path)`).
   * Optional in the legacy `workflow-state.json` migration path where the
   * field didn't exist.
   */
  planningSlug: z.string().optional(),
  /** 6-char base32 session_index of the child session. */
  sessionIndex: z.string().regex(/^[A-Z2-7]{6}$/).optional(),
  triggeredAt: z.string().datetime(),
  triggeredFrom: z.object({
    activityId: z.string(),
    stepIndex: StepIndex.optional(),
  }),
  status: z.enum(['running', 'completed', 'aborted', 'error']),
  /** Set when the child reaches its terminal activity. */
  completedAt: z.string().datetime().optional(),
  returnedContext: z.record(z.unknown()).optional(),
});
export type TriggeredWorkflowRef = z.infer<typeof TriggeredWorkflowRefSchema>;

const ActiveStatuses = ['running', 'paused', 'suspended'] as const;

export const WorkflowStateBaseSchema = z.object({
  workflowId: z.string(),
  workflowVersion: z.string(),
  stateVersion: z.number().int().positive().default(1),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  currentActivity: z.string().optional(),
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

export const WorkflowStateSchema = WorkflowStateBaseSchema.refine(
  (state) => !(ActiveStatuses as readonly string[]).includes(state.status) || state.currentActivity != null,
  { message: 'currentActivity is required when status is running, paused, or suspended', path: ['currentActivity'] },
);
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

// --- Recursive schemas for state persistence ---
// These extend the base schemas to support nested child workflow state within
// triggeredWorkflows entries, enabling hierarchical save/restore.

export interface NestedTriggeredWorkflowRef extends TriggeredWorkflowRef {
  state?: NestedWorkflowState;
}

export interface NestedWorkflowState extends Omit<WorkflowState, 'triggeredWorkflows'> {
  triggeredWorkflows: NestedTriggeredWorkflowRef[];
}

export const NestedTriggeredWorkflowRefSchema: z.ZodType<NestedTriggeredWorkflowRef> = TriggeredWorkflowRefSchema.extend({
  state: z.lazy(() => NestedWorkflowStateSchema).optional(),
}) as z.ZodType<NestedTriggeredWorkflowRef>;

export const NestedWorkflowStateSchema: z.ZodType<NestedWorkflowState> = WorkflowStateBaseSchema.extend({
  triggeredWorkflows: z.array(z.lazy(() => NestedTriggeredWorkflowRefSchema)).default([]),
}).refine(
  (state) => !(ActiveStatuses as readonly string[]).includes(state.status) || state.currentActivity != null,
  { message: 'currentActivity is required when status is running, paused, or suspended', path: ['currentActivity'] },
) as z.ZodType<NestedWorkflowState>;

/** Creates initial workflow state. Caller must ensure initialActivity is a valid activity ID in the workflow. */
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

/** Appends a history event. The details parameter is type-constrained to known HistoryEntry fields via Partial<Omit<...>>. */
export function addHistoryEvent(state: WorkflowState, type: HistoryEventType, details?: Partial<Omit<HistoryEntry, 'timestamp' | 'type'>>): WorkflowState {
  const now = new Date().toISOString();
  return { ...state, stateVersion: state.stateVersion + 1, updatedAt: now, history: [...state.history, { timestamp: now, type, ...details }] };
}

