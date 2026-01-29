// State codec
export { 
  encodeState, 
  decodeState, 
  isValidTokenFormat, 
  getTokenVersion,
  getCompressionRatio,
  StateCodecError 
} from './state-codec.js';

// Navigation computation
export {
  computePosition,
  computeAvailableActions,
  getCurrentActivity,
  getCurrentStep,
  getRemainingSteps,
  getActiveCheckpoint,
  isCheckpointBlocking,
  isActivityComplete,
  getDefaultTransition,
  generateSituationMessage,
} from './compute.js';

// State transitions
export {
  completeStep,
  respondToCheckpoint,
  transitionToActivity,
  advanceLoop,
  tryDefaultTransition,
  TransitionError,
  type TransitionResult,
} from './transitions.js';

// Types
export type { 
  Position, 
  Action, 
  BlockedAction, 
  AvailableActions, 
  ActiveCheckpoint,
  NavigationResponse, 
  NavigationError,
  NavigationResult 
} from './types.js';
