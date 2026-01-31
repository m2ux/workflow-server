import type { Checkpoint } from '../schema/activity.schema.js';

/** Position within a workflow */
export interface Position {
  workflow: string;
  activity: {
    id: string;
    name: string;
  };
  step?: {
    id: string;
    index: number;
    name: string;
  };
  loop?: {
    id: string;
    name: string;
    iteration: number;
    total?: number;
    item?: string;
  };
}

/** An available action the agent can take */
export interface Action {
  action: 'complete_step' | 'respond_to_checkpoint' | 'transition' | 'advance_loop' | 'get_resource';
  step?: string;
  checkpoint?: string;
  activity?: string;
  loop?: string;
  resource?: { index: string; name: string; };
  description?: string;
  /** Required effectivities to perform this action */
  effectivities?: string[];
}

/** A blocked action with reason */
export interface BlockedAction {
  action: string;
  reason: string;
}

/** Available actions categorized by requirement */
export interface AvailableActions {
  required: Action[];
  optional: Action[];
  blocked: BlockedAction[];
}

/** Active checkpoint requiring response */
export interface ActiveCheckpoint {
  id: string;
  message: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

/** Standard response from all navigation tools */
export interface NavigationResponse {
  success: boolean;
  position: Position;
  message: string;
  availableActions: AvailableActions;
  checkpoint?: ActiveCheckpoint;
  complete?: boolean;
  state: string;
  error?: {
    code: string;
    message: string;
  };
}

/** Error response when navigation fails */
export interface NavigationError {
  success: false;
  error: {
    code: 'INVALID_STATE' | 'INVALID_ACTION' | 'CHECKPOINT_BLOCKING' | 'WORKFLOW_NOT_FOUND' | 'INVALID_TRANSITION';
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Result type for navigation operations */
export type NavigationResult<T> = 
  | { success: true; value: T }
  | { success: false; error: NavigationError['error'] };
