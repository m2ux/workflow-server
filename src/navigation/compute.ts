import type { Workflow, Activity, Checkpoint, Step, Loop } from '../schema/workflow.schema.js';
import type { WorkflowState, LoopState } from '../schema/state.schema.js';
import type { Position, Action, BlockedAction, AvailableActions, ActiveCheckpoint } from './types.js';

/**
 * Compute the current position within a workflow from state.
 */
export function computePosition(workflow: Workflow, state: WorkflowState): Position {
  const activity = workflow.activities.find(a => a.id === state.currentActivity);
  
  const position: Position = {
    workflow: workflow.id,
    activity: {
      id: state.currentActivity,
      name: activity?.name ?? state.currentActivity,
    },
  };
  
  // Add step info if we have a current step
  if (state.currentStep !== undefined && activity?.steps) {
    const stepIndex = state.currentStep;
    const step = activity.steps[stepIndex - 1]; // Steps are 1-indexed in state
    if (step) {
      position.step = {
        id: step.id,
        index: stepIndex,
        name: step.name,
      };
    }
  }
  
  // Add loop info if in an active loop
  const activeLoop = state.activeLoops[state.activeLoops.length - 1];
  if (activeLoop) {
    const activityForLoop = workflow.activities.find(a => a.id === activeLoop.activityId);
    const loopDef = activityForLoop?.loops?.find(l => l.id === activeLoop.loopId);
    position.loop = {
      id: activeLoop.loopId,
      name: loopDef?.name ?? activeLoop.loopId,
      iteration: activeLoop.currentIteration + 1, // Display as 1-indexed
      total: activeLoop.totalItems,
      item: activeLoop.currentItem !== undefined ? String(activeLoop.currentItem) : undefined,
    };
  }
  
  return position;
}

/**
 * Get the current activity definition.
 */
export function getCurrentActivity(workflow: Workflow, state: WorkflowState): Activity | undefined {
  return workflow.activities.find(a => a.id === state.currentActivity);
}

/**
 * Check if a checkpoint is currently blocking progress.
 * A checkpoint blocks if:
 * 1. We've reached it (current step is past checkpoint trigger)
 * 2. It hasn't been responded to yet
 */
export function getActiveCheckpoint(
  workflow: Workflow, 
  state: WorkflowState
): ActiveCheckpoint | null {
  const activity = getCurrentActivity(workflow, state);
  if (!activity?.checkpoints) return null;
  
  // Find checkpoints that are blocking
  for (const checkpoint of activity.checkpoints) {
    const responseKey = `${activity.id}-${checkpoint.id}`;
    const hasResponse = state.checkpointResponses[responseKey] !== undefined;
    
    // If checkpoint is required and not responded, it's blocking
    if (checkpoint.required !== false && checkpoint.blocking !== false && !hasResponse) {
      // Check if we should show this checkpoint based on current step
      // For now, show first unresponded blocking checkpoint
      return {
        id: checkpoint.id,
        message: checkpoint.message,
        options: checkpoint.options.map(opt => ({
          id: opt.id,
          label: opt.label,
          description: opt.description,
        })),
      };
    }
  }
  
  return null;
}

/**
 * Check if any checkpoint is currently blocking progress.
 */
export function isCheckpointBlocking(workflow: Workflow, state: WorkflowState): boolean {
  return getActiveCheckpoint(workflow, state) !== null;
}

/**
 * Get the current step within the activity.
 */
export function getCurrentStep(
  workflow: Workflow, 
  state: WorkflowState
): Step | null {
  const activity = getCurrentActivity(workflow, state);
  if (!activity?.steps || state.currentStep === undefined) return null;
  
  return activity.steps[state.currentStep - 1] ?? null;
}

/**
 * Get steps that need to be completed in the current activity.
 */
export function getRemainingSteps(
  workflow: Workflow,
  state: WorkflowState
): Step[] {
  const activity = getCurrentActivity(workflow, state);
  if (!activity?.steps) return [];
  
  const completedInActivity = state.completedSteps[activity.id] ?? [];
  return activity.steps.filter((step, index) => {
    const stepIndex = index + 1; // 1-indexed
    return !completedInActivity.includes(stepIndex);
  });
}

/**
 * Compute available actions from the current state.
 * This is the core affordance computation.
 */
export function computeAvailableActions(
  workflow: Workflow,
  state: WorkflowState
): AvailableActions {
  const required: Action[] = [];
  const optional: Action[] = [];
  const blocked: BlockedAction[] = [];
  
  const activity = getCurrentActivity(workflow, state);
  if (!activity) {
    return { required, optional, blocked };
  }
  
  // Check for blocking checkpoint first
  const activeCheckpoint = getActiveCheckpoint(workflow, state);
  if (activeCheckpoint) {
    // When checkpoint is active, responding is required
    required.push({
      action: 'respond_to_checkpoint',
      checkpoint: activeCheckpoint.id,
      description: `Respond to checkpoint: ${activeCheckpoint.message}`,
    });
    
    // All other actions are blocked
    blocked.push({
      action: 'complete_step',
      reason: `Checkpoint '${activeCheckpoint.id}' requires response before proceeding`,
    });
    
    return { required, optional, blocked };
  }
  
  // Check if we're in a loop
  const activeLoop = state.activeLoops.find(l => l.activityId === activity.id);
  if (activeLoop) {
    const loopDef = activity.loops?.find(l => l.id === activeLoop.loopId);
    if (loopDef?.steps) {
      // Get current step within loop
      const loopStepIndex = state.currentStep ?? 1;
      const loopStep = loopDef.steps[loopStepIndex - 1];
      
      if (loopStep) {
        required.push({
          action: 'complete_step',
          step: loopStep.id,
          description: `Complete: ${loopStep.name}`,
        });
      }
    }
    
    return { required, optional, blocked };
  }
  
  // Regular step completion
  if (activity.steps && activity.steps.length > 0) {
    const currentStepIndex = state.currentStep ?? 1;
    const currentStep = activity.steps[currentStepIndex - 1];
    
    if (currentStep) {
      required.push({
        action: 'complete_step',
        step: currentStep.id,
        description: `Complete: ${currentStep.name}`,
      });
    } else if (currentStepIndex > activity.steps.length) {
      // All steps complete, can transition
      // This would be handled by transition logic
    }
  }
  
  // Optional: get resources for help
  optional.push({
    action: 'get_resource',
    description: 'Get guidance resource for current activity',
  });
  
  return { required, optional, blocked };
}

/**
 * Generate a human-readable message describing the current situation.
 */
export function generateSituationMessage(
  workflow: Workflow,
  state: WorkflowState
): string {
  const position = computePosition(workflow, state);
  const parts: string[] = [];
  
  parts.push(`Activity: ${position.activity.name}`);
  
  if (position.step) {
    parts.push(`Step ${position.step.index}: ${position.step.name}`);
  }
  
  if (position.loop) {
    const total = position.loop.total ? ` of ${position.loop.total}` : '';
    parts.push(`Loop: ${position.loop.name} (iteration ${position.loop.iteration}${total})`);
  }
  
  const checkpoint = getActiveCheckpoint(workflow, state);
  if (checkpoint) {
    parts.push(`Checkpoint: ${checkpoint.message}`);
  }
  
  return parts.join(' | ');
}

/**
 * Check if the current activity is complete (all required steps done).
 */
export function isActivityComplete(
  workflow: Workflow,
  state: WorkflowState
): boolean {
  const activity = getCurrentActivity(workflow, state);
  if (!activity) return false;
  
  // Check all required steps are complete
  if (activity.steps) {
    const completedInActivity = state.completedSteps[activity.id] ?? [];
    const requiredSteps = activity.steps.filter(s => s.required !== false);
    
    for (let i = 0; i < requiredSteps.length; i++) {
      if (!completedInActivity.includes(i + 1)) {
        return false;
      }
    }
  }
  
  // Check no blocking checkpoints remain
  if (isCheckpointBlocking(workflow, state)) {
    return false;
  }
  
  // Check loops are complete
  const activityLoops = state.activeLoops.filter(l => l.activityId === activity.id);
  if (activityLoops.length > 0) {
    return false;
  }
  
  return true;
}

/**
 * Get the default next activity based on transitions.
 */
export function getDefaultTransition(
  workflow: Workflow,
  state: WorkflowState
): string | null {
  const activity = getCurrentActivity(workflow, state);
  if (!activity?.transitions) return null;
  
  // Find default transition
  const defaultTransition = activity.transitions.find(t => t.isDefault);
  return defaultTransition?.to ?? activity.transitions[0]?.to ?? null;
}
