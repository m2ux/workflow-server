// State codec
export { 
  encodeState, 
  decodeState, 
  isValidTokenFormat, 
  getTokenVersion,
  getCompressionRatio,
  StateCodecError 
} from './state-codec.js';

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
