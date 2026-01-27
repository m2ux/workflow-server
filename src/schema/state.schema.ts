import { z } from 'zod';

// Phase and step indices are 1-based integers
const PhaseIndex = z.number().int().min(1);
const StepIndex = z.number().int().min(1);

export const HistoryEventTypeSchema = z.enum([
  'workflow_started', 'workflow_completed', 'workflow_aborted',
  'phase_entered', 'phase_exited', 'phase_skipped',
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
  phase: PhaseIndex.optional(),
  step: StepIndex.optional(),
  checkpoint: z.number().int().min(1).optional(),
  decision: z.number().int().min(1).optional(),
  loop: z.number().int().min(1).optional(),
  data: z.record(z.unknown()).optional(),
  error: z.object({ message: z.string(), code: z.string().optional() }).optional(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

// Key format: "phaseIndex-checkpointIndex" (e.g., "1-2")
export const CheckpointResponseSchema = z.object({
  optionId: z.string(),
  respondedAt: z.string().datetime(),
  effects: z.object({
    variablesSet: z.record(z.unknown()).optional(),
    transitionedTo: PhaseIndex.optional(),
    phasesSkipped: z.array(PhaseIndex).optional(),
  }).optional(),
});
export type CheckpointResponse = z.infer<typeof CheckpointResponseSchema>;

// Key format: "phaseIndex-decisionIndex" (e.g., "7-2")
export const DecisionOutcomeSchema = z.object({
  branchId: z.string(),
  decidedAt: z.string().datetime(),
  transitionedTo: PhaseIndex,
});
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

export const LoopStateSchema = z.object({
  phaseIndex: PhaseIndex,
  loopIndex: z.number().int().min(1),
  currentIteration: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative().optional(),
  currentItem: z.unknown().optional(),
  startedAt: z.string().datetime(),
});
export type LoopState = z.infer<typeof LoopStateSchema>;

export const WorkflowStateSchema = z.object({
  workflowId: z.string(),
  workflowVersion: z.string(),
  stateVersion: z.number().int().positive().default(1),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  currentPhase: PhaseIndex,
  currentStep: StepIndex.optional(),
  completedPhases: z.array(PhaseIndex).default([]),
  skippedPhases: z.array(PhaseIndex).default([]),
  completedSteps: z.record(z.array(StepIndex)).default({}),
  checkpointResponses: z.record(CheckpointResponseSchema).default({}),
  decisionOutcomes: z.record(DecisionOutcomeSchema).default({}),
  activeLoops: z.array(LoopStateSchema).default([]),
  variables: z.record(z.unknown()).default({}),
  history: z.array(HistoryEntrySchema).default([]),
  status: z.enum(['running', 'paused', 'completed', 'aborted', 'error']).default('running'),
  lastError: z.object({
    message: z.string(),
    code: z.string().optional(),
    phase: PhaseIndex.optional(),
    step: StepIndex.optional(),
    timestamp: z.string().datetime(),
  }).optional(),
});
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

export function createInitialState(workflowId: string, workflowVersion: string, initialPhase: number, initialVariables?: Record<string, unknown>): WorkflowState {
  const now = new Date().toISOString();
  return {
    workflowId, workflowVersion, stateVersion: 1, startedAt: now, updatedAt: now, currentPhase: initialPhase,
    completedPhases: [], skippedPhases: [], completedSteps: {}, checkpointResponses: {}, decisionOutcomes: {},
    activeLoops: [], variables: initialVariables ?? {},
    history: [{ timestamp: now, type: 'workflow_started', phase: initialPhase, data: { initialVariables } }],
    status: 'running',
  };
}

export function validateState(data: unknown): WorkflowState { return WorkflowStateSchema.parse(data); }
export function safeValidateState(data: unknown) { return WorkflowStateSchema.safeParse(data); }

export function addHistoryEvent(state: WorkflowState, type: HistoryEventType, details?: Partial<Omit<HistoryEntry, 'timestamp' | 'type'>>): WorkflowState {
  const now = new Date().toISOString();
  return { ...state, stateVersion: state.stateVersion + 1, updatedAt: now, history: [...state.history, { timestamp: now, type, ...details }] };
}
