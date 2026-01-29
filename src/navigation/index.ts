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
