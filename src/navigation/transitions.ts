import type { Workflow, Activity } from '../schema/workflow.schema.js';
import type { WorkflowState, CheckpointResponse } from '../schema/state.schema.js';
import { getCurrentActivity, isActivityComplete, getDefaultTransition, isCheckpointBlocking } from './compute.js';

/**
 * Error thrown when a transition is invalid.
 */
export class TransitionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TransitionError';
  }
}

/**
 * Result of a transition operation.
 */
export interface TransitionResult {
  success: boolean;
  state: WorkflowState;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Complete a step in the current activity.
 * Returns new state with step marked complete.
 */
export function completeStep(
  workflow: Workflow,
  state: WorkflowState,
  stepId: string
): TransitionResult {
  const activity = getCurrentActivity(workflow, state);
  
  if (!activity) {
    return {
      success: false,
      state,
      error: {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity '${state.currentActivity}' not found in workflow`,
      },
    };
  }
  
  // Check if checkpoint is blocking
  if (isCheckpointBlocking(workflow, state)) {
    return {
      success: false,
      state,
      error: {
        code: 'CHECKPOINT_BLOCKING',
        message: 'Must respond to checkpoint before completing steps',
      },
    };
  }
  
  // Validate step exists
  const stepIndex = activity.steps?.findIndex(s => s.id === stepId);
  if (stepIndex === undefined || stepIndex === -1) {
    return {
      success: false,
      state,
      error: {
        code: 'STEP_NOT_FOUND',
        message: `Step '${stepId}' not found in activity '${activity.id}'`,
      },
    };
  }
  
  const stepNumber = stepIndex + 1; // 1-indexed
  
  // Check if already completed
  const completedInActivity = state.completedSteps[activity.id] ?? [];
  if (completedInActivity.includes(stepNumber)) {
    return {
      success: false,
      state,
      error: {
        code: 'STEP_ALREADY_COMPLETE',
        message: `Step '${stepId}' is already completed`,
      },
    };
  }
  
  // Create new state with step completed
  const newCompletedSteps = {
    ...state.completedSteps,
    [activity.id]: [...completedInActivity, stepNumber],
  };
  
  // Advance currentStep to next incomplete step
  const completedForActivity = newCompletedSteps[activity.id] ?? [];
  const nextStepNumber = findNextIncompleteStep(activity, completedForActivity);
  
  const newState: WorkflowState = {
    ...state,
    completedSteps: newCompletedSteps,
    currentStep: nextStepNumber,
  };
  
  return {
    success: true,
    state: newState,
  };
}

/**
 * Respond to a checkpoint.
 * Returns new state with checkpoint response recorded.
 */
export function respondToCheckpoint(
  workflow: Workflow,
  state: WorkflowState,
  checkpointId: string,
  optionId: string
): TransitionResult {
  const activity = getCurrentActivity(workflow, state);
  
  if (!activity) {
    return {
      success: false,
      state,
      error: {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity '${state.currentActivity}' not found in workflow`,
      },
    };
  }
  
  // Validate checkpoint exists
  const checkpoint = activity.checkpoints?.find(c => c.id === checkpointId);
  if (!checkpoint) {
    return {
      success: false,
      state,
      error: {
        code: 'CHECKPOINT_NOT_FOUND',
        message: `Checkpoint '${checkpointId}' not found in activity '${activity.id}'`,
      },
    };
  }
  
  // Validate option exists
  const option = checkpoint.options.find(o => o.id === optionId);
  if (!option) {
    return {
      success: false,
      state,
      error: {
        code: 'OPTION_NOT_FOUND',
        message: `Option '${optionId}' not found in checkpoint '${checkpointId}'`,
      },
    };
  }
  
  // Check if already responded
  const responseKey = `${activity.id}-${checkpointId}`;
  if (state.checkpointResponses[responseKey]) {
    return {
      success: false,
      state,
      error: {
        code: 'CHECKPOINT_ALREADY_RESPONDED',
        message: `Checkpoint '${checkpointId}' already has a response`,
      },
    };
  }
  
  // Create response
  const response: CheckpointResponse = {
    optionId,
    respondedAt: new Date().toISOString(),
  };
  
  const newState: WorkflowState = {
    ...state,
    checkpointResponses: {
      ...state.checkpointResponses,
      [responseKey]: response,
    },
  };
  
  return {
    success: true,
    state: newState,
  };
}

/**
 * Transition to a new activity.
 * Returns new state positioned at the start of the new activity.
 */
export function transitionToActivity(
  workflow: Workflow,
  state: WorkflowState,
  targetActivityId: string
): TransitionResult {
  const currentActivity = getCurrentActivity(workflow, state);
  
  if (!currentActivity) {
    return {
      success: false,
      state,
      error: {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Current activity '${state.currentActivity}' not found`,
      },
    };
  }
  
  // Check if current activity is complete
  if (!isActivityComplete(workflow, state)) {
    return {
      success: false,
      state,
      error: {
        code: 'ACTIVITY_NOT_COMPLETE',
        message: 'Current activity must be completed before transitioning',
      },
    };
  }
  
  // Validate target activity exists
  const targetActivity = workflow.activities.find(a => a.id === targetActivityId);
  if (!targetActivity) {
    return {
      success: false,
      state,
      error: {
        code: 'TARGET_ACTIVITY_NOT_FOUND',
        message: `Target activity '${targetActivityId}' not found in workflow`,
      },
    };
  }
  
  // Validate transition is allowed
  const validTransition = currentActivity.transitions?.some(t => t.to === targetActivityId);
  if (!validTransition) {
    return {
      success: false,
      state,
      error: {
        code: 'INVALID_TRANSITION',
        message: `Transition from '${currentActivity.id}' to '${targetActivityId}' is not allowed`,
      },
    };
  }
  
  // Create new state at start of target activity
  const newState: WorkflowState = {
    ...state,
    currentActivity: targetActivityId,
    currentStep: 1,
    // Keep completed steps and checkpoint responses for history
  };
  
  return {
    success: true,
    state: newState,
  };
}

/**
 * Start or advance a loop iteration.
 * Returns new state with loop state updated.
 */
export function advanceLoop(
  workflow: Workflow,
  state: WorkflowState,
  loopId: string,
  items?: unknown[]
): TransitionResult {
  const activity = getCurrentActivity(workflow, state);
  
  if (!activity) {
    return {
      success: false,
      state,
      error: {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity '${state.currentActivity}' not found`,
      },
    };
  }
  
  // Find existing loop state
  const existingLoopIndex = state.activeLoops.findIndex(
    l => l.activityId === activity.id && l.loopId === loopId
  );
  
  if (existingLoopIndex === -1) {
    // Start new loop
    if (!items || items.length === 0) {
      return {
        success: false,
        state,
        error: {
          code: 'LOOP_ITEMS_REQUIRED',
          message: 'Items array required to start a new loop',
        },
      };
    }
    
    const newLoopState = {
      activityId: activity.id,
      loopId,
      currentIteration: 0,
      totalItems: items.length,
      currentItem: items[0],
      startedAt: new Date().toISOString(),
    };
    
    const newState: WorkflowState = {
      ...state,
      activeLoops: [...state.activeLoops, newLoopState],
      currentStep: 1, // Reset to first step of loop
    };
    
    return {
      success: true,
      state: newState,
    };
  }
  
  // Advance existing loop
  const existingLoop = state.activeLoops[existingLoopIndex];
  if (!existingLoop) {
    throw new TransitionError(`Loop not found at index ${existingLoopIndex}`, 'LOOP_NOT_FOUND');
  }
  const nextIteration = existingLoop.currentIteration + 1;
  const totalItems = existingLoop.totalItems ?? 0;
  
  if (nextIteration >= totalItems) {
    // Loop complete, remove it
    const newActiveLoops = state.activeLoops.filter((_, i) => i !== existingLoopIndex);
    
    const newState: WorkflowState = {
      ...state,
      activeLoops: newActiveLoops,
    };
    
    return {
      success: true,
      state: newState,
    };
  }
  
  // Move to next iteration
  const updatedLoop = {
    ...existingLoop,
    currentIteration: nextIteration,
    currentItem: items ? items[nextIteration] : undefined,
  };
  
  const newActiveLoops = [...state.activeLoops];
  newActiveLoops[existingLoopIndex] = updatedLoop;
  
  const newState: WorkflowState = {
    ...state,
    activeLoops: newActiveLoops,
    currentStep: 1, // Reset to first step of loop iteration
  };
  
  return {
    success: true,
    state: newState,
  };
}

/**
 * Find the next incomplete step number, or undefined if all complete.
 */
function findNextIncompleteStep(
  activity: Activity,
  completedSteps: number[]
): number | undefined {
  if (!activity.steps) return undefined;
  
  for (let i = 0; i < activity.steps.length; i++) {
    const stepNumber = i + 1;
    if (!completedSteps.includes(stepNumber)) {
      return stepNumber;
    }
  }
  
  return undefined; // All steps complete
}

/**
 * Apply default transition if activity is complete.
 * Convenience function that combines isActivityComplete and transitionToActivity.
 */
export function tryDefaultTransition(
  workflow: Workflow,
  state: WorkflowState
): TransitionResult {
  if (!isActivityComplete(workflow, state)) {
    return {
      success: false,
      state,
      error: {
        code: 'ACTIVITY_NOT_COMPLETE',
        message: 'Activity not yet complete',
      },
    };
  }
  
  const nextActivity = getDefaultTransition(workflow, state);
  if (!nextActivity) {
    return {
      success: false,
      state,
      error: {
        code: 'NO_DEFAULT_TRANSITION',
        message: 'No default transition defined for current activity',
      },
    };
  }
  
  return transitionToActivity(workflow, state, nextActivity);
}
