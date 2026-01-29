import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { loadWorkflow } from '../loaders/workflow-loader.js';
import { withAuditLog } from '../logging.js';
import { createInitialState, addHistoryEvent } from '../schema/state.schema.js';
import type { Workflow } from '../schema/workflow.schema.js';
import type { WorkflowState } from '../schema/state.schema.js';
import {
  encodeState,
  decodeState,
  computePosition,
  computeAvailableActions,
  generateSituationMessage,
  getActiveCheckpoint,
  completeStep,
  respondToCheckpoint,
  transitionToActivity,
  advanceLoop,
  type NavigationResponse,
} from '../navigation/index.js';

/**
 * Build a complete NavigationResponse from workflow and state.
 */
function buildResponse(
  workflow: Workflow,
  state: WorkflowState,
  message: string,
  success: boolean = true,
  error?: { code: string; message: string }
): NavigationResponse {
  const position = computePosition(workflow, state);
  const availableActions = computeAvailableActions(workflow, state);
  const checkpoint = getActiveCheckpoint(workflow, state);
  
  return {
    success,
    position,
    message,
    availableActions,
    checkpoint: checkpoint ?? undefined,
    state: encodeState(state),
    error,
  };
}

/**
 * Register navigation tools for workflow traversal.
 * These tools provide the "navigation landscape" for agents.
 */
export function registerNavigationTools(server: McpServer, config: ServerConfig): void {
  
  // Tool 1: Start a workflow and get initial situation
  server.tool(
    'nav_start',
    'Start a new workflow execution and get the initial navigation situation. Returns position, available actions, and an opaque state token.',
    {
      workflow_id: z.string().describe('ID of the workflow to start'),
      initial_variables: z.record(z.unknown()).optional().describe('Optional initial variables for the workflow'),
    },
    withAuditLog('nav_start', async ({ workflow_id, initial_variables }) => {
      // Load workflow
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) {
        throw new Error(`Workflow not found: ${workflow_id}`);
      }
      const workflow = result.value;
      
      // Create initial state
      const state = createInitialState(
        workflow.id,
        workflow.version,
        workflow.initialActivity,
        initial_variables
      );
      
      // Build response
      const response = buildResponse(
        workflow,
        state,
        `Started workflow '${workflow.title}' at activity '${workflow.initialActivity}'`
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
        }],
      };
    })
  );
  
  // Tool 2: Get current situation from state token
  server.tool(
    'nav_situation',
    'Get the current navigation situation from a state token. Returns position, available actions, and any active checkpoint.',
    {
      state: z.string().describe('Opaque state token from previous navigation response'),
    },
    withAuditLog('nav_situation', async ({ state: stateToken }) => {
      // Decode state
      const state = decodeState(stateToken);
      
      // Load workflow
      const result = await loadWorkflow(config.workflowDir, state.workflowId);
      if (!result.success) {
        throw new Error(`Workflow not found: ${state.workflowId}`);
      }
      const workflow = result.value;
      
      // Build response
      const response = buildResponse(
        workflow,
        state,
        generateSituationMessage(workflow, state)
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
        }],
      };
    })
  );
  
  // Tool 3: Execute a navigation action
  server.tool(
    'nav_action',
    'Execute a navigation action (complete_step, respond_to_checkpoint, transition, advance_loop). Returns updated situation with new state token.',
    {
      state: z.string().describe('Opaque state token from previous navigation response'),
      action: z.enum(['complete_step', 'respond_to_checkpoint', 'transition', 'advance_loop']).describe('The action to execute'),
      step_id: z.string().optional().describe('For complete_step: ID of the step to complete'),
      checkpoint_id: z.string().optional().describe('For respond_to_checkpoint: ID of the checkpoint'),
      option_id: z.string().optional().describe('For respond_to_checkpoint: ID of the selected option'),
      activity_id: z.string().optional().describe('For transition: ID of the target activity'),
      loop_id: z.string().optional().describe('For advance_loop: ID of the loop'),
      loop_items: z.array(z.unknown()).optional().describe('For advance_loop: Items to iterate over (required when starting a loop)'),
    },
    withAuditLog('nav_action', async (params) => {
      const { state: stateToken, action } = params;
      
      // Decode state
      let state = decodeState(stateToken);
      
      // Load workflow
      const result = await loadWorkflow(config.workflowDir, state.workflowId);
      if (!result.success) {
        throw new Error(`Workflow not found: ${state.workflowId}`);
      }
      const workflow = result.value;
      
      // Execute action based on type
      let transitionResult;
      let actionDescription: string;
      
      switch (action) {
        case 'complete_step': {
          if (!params.step_id) {
            throw new Error('step_id is required for complete_step action');
          }
          transitionResult = completeStep(workflow, state, params.step_id);
          actionDescription = `Completed step '${params.step_id}'`;
          
          // Add history event if successful
          if (transitionResult.success) {
            transitionResult.state = addHistoryEvent(
              transitionResult.state,
              'step_completed',
              { activity: state.currentActivity, step: state.currentStep }
            );
          }
          break;
        }
        
        case 'respond_to_checkpoint': {
          if (!params.checkpoint_id || !params.option_id) {
            throw new Error('checkpoint_id and option_id are required for respond_to_checkpoint action');
          }
          transitionResult = respondToCheckpoint(workflow, state, params.checkpoint_id, params.option_id);
          actionDescription = `Responded to checkpoint '${params.checkpoint_id}' with '${params.option_id}'`;
          
          // Add history event if successful
          if (transitionResult.success) {
            transitionResult.state = addHistoryEvent(
              transitionResult.state,
              'checkpoint_response',
              { 
                activity: state.currentActivity, 
                checkpoint: params.checkpoint_id,
                data: { optionId: params.option_id }
              }
            );
          }
          break;
        }
        
        case 'transition': {
          if (!params.activity_id) {
            throw new Error('activity_id is required for transition action');
          }
          transitionResult = transitionToActivity(workflow, state, params.activity_id);
          actionDescription = `Transitioned to activity '${params.activity_id}'`;
          
          // Add history events if successful
          if (transitionResult.success) {
            // Exit current activity
            transitionResult.state = addHistoryEvent(
              transitionResult.state,
              'activity_exited',
              { activity: state.currentActivity }
            );
            // Enter new activity
            transitionResult.state = addHistoryEvent(
              transitionResult.state,
              'activity_entered',
              { activity: params.activity_id }
            );
          }
          break;
        }
        
        case 'advance_loop': {
          if (!params.loop_id) {
            throw new Error('loop_id is required for advance_loop action');
          }
          transitionResult = advanceLoop(workflow, state, params.loop_id, params.loop_items);
          
          const existingLoop = state.activeLoops.find(l => l.loopId === params.loop_id);
          if (existingLoop) {
            actionDescription = `Advanced loop '${params.loop_id}' to iteration ${existingLoop.currentIteration + 2}`;
          } else {
            actionDescription = `Started loop '${params.loop_id}'`;
          }
          
          // Add history event if successful
          if (transitionResult.success) {
            const newLoop = transitionResult.state.activeLoops.find(l => l.loopId === params.loop_id);
            if (newLoop) {
              transitionResult.state = addHistoryEvent(
                transitionResult.state,
                existingLoop ? 'loop_iteration' : 'loop_started',
                { 
                  activity: state.currentActivity, 
                  loop: params.loop_id,
                  data: { iteration: newLoop.currentIteration }
                }
              );
            } else {
              // Loop completed
              transitionResult.state = addHistoryEvent(
                transitionResult.state,
                'loop_completed',
                { activity: state.currentActivity, loop: params.loop_id }
              );
            }
          }
          break;
        }
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Build response
      if (transitionResult.success) {
        const response = buildResponse(
          workflow,
          transitionResult.state,
          actionDescription
        );
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2),
          }],
        };
      } else {
        // Action failed - return error response with original state
        const response = buildResponse(
          workflow,
          state,
          `Action failed: ${transitionResult.error?.message}`,
          false,
          transitionResult.error
        );
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2),
          }],
        };
      }
    })
  );
  
  // Tool 4: Get checkpoint details
  server.tool(
    'nav_checkpoint',
    'Get detailed information about the currently active checkpoint. Returns null if no checkpoint is blocking.',
    {
      state: z.string().describe('Opaque state token from previous navigation response'),
    },
    withAuditLog('nav_checkpoint', async ({ state: stateToken }) => {
      // Decode state
      const state = decodeState(stateToken);
      
      // Load workflow
      const result = await loadWorkflow(config.workflowDir, state.workflowId);
      if (!result.success) {
        throw new Error(`Workflow not found: ${state.workflowId}`);
      }
      const workflow = result.value;
      
      // Get active checkpoint
      const checkpoint = getActiveCheckpoint(workflow, state);
      
      if (!checkpoint) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              active: false,
              message: 'No checkpoint is currently blocking progress',
            }, null, 2),
          }],
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            active: true,
            checkpoint,
          }, null, 2),
        }],
      };
    })
  );
}
