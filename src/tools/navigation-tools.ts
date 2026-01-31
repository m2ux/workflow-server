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
 * Check if workflow is complete (no more actions available or status is completed).
 */
function isWorkflowComplete(state: WorkflowState, availableActions: { required: unknown[]; optional: unknown[] }): boolean {
  if (state.status === 'completed') return true;
  // Workflow is complete when there are no required or optional actions
  return availableActions.required.length === 0 && availableActions.optional.length === 0;
}

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
  const complete = isWorkflowComplete(state, availableActions);
  
  const response: NavigationResponse = {
    success,
    position,
    message,
    availableActions,
    state: encodeState(state),
  };
  if (checkpoint) {
    response.checkpoint = checkpoint;
  }
  if (complete) {
    response.complete = true;
  }
  if (error) {
    response.error = error;
  }
  return response;
}

/**
 * Register navigation tools for workflow traversal.
 * These tools provide the "navigation landscape" for agents.
 */
export function registerNavigationTools(server: McpServer, config: ServerConfig): void {
  
  // Tool 1: Start a workflow and get initial situation
  server.tool(
    'start-workflow',
    'Start a new workflow execution and get the initial navigation situation. Returns position, available actions, and an opaque state token.',
    {
      workflow_id: z.string().describe('ID of the workflow to start'),
      initial_variables: z.record(z.unknown()).optional().describe('Optional initial variables for the workflow'),
    },
    withAuditLog('start-workflow', async ({ workflow_id, initial_variables }) => {
      // Load workflow
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) {
        throw new Error(`Workflow not found: ${workflow_id}`);
      }
      const workflow = result.value;
      
      // Determine initial activity
      const initialActivity = workflow.initialActivity ?? workflow.activities[0]?.id;
      if (!initialActivity) {
        throw new Error(`Workflow '${workflow_id}' has no activities`);
      }
      
      // Create initial state
      const state = createInitialState(
        workflow.id,
        workflow.version,
        initialActivity,
        initial_variables
      );
      
      // Build response
      const response = buildResponse(
        workflow,
        state,
        `Started workflow '${workflow.title}' at activity '${initialActivity}'`
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
        }],
      };
    })
  );
  
  // Tool 2: Resume workflow from saved state token
  server.tool(
    'resume-workflow',
    'Resume a workflow from a saved state token. Returns current position, available actions, and any active checkpoint.',
    {
      state: z.string().describe('Opaque state token from previous navigation response'),
    },
    withAuditLog('resume-workflow', async ({ state: stateToken }) => {
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
  
  // Tool 3: Advance workflow by performing an action
  server.tool(
    'advance-workflow',
    'Advance the workflow by performing an action (complete_step, respond_to_checkpoint, transition, advance_loop). Returns updated situation with new state token.',
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
    withAuditLog('advance-workflow', async (params) => {
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
  
  // Tool 4: End workflow early (proceed to final activity)
  server.tool(
    'end-workflow',
    'End the workflow early. If the workflow has a finalActivity, transitions there. Otherwise marks workflow as complete.',
    {
      state: z.string().describe('Opaque state token from previous navigation response'),
      reason: z.string().optional().describe('Optional reason for ending the workflow early'),
    },
    withAuditLog('end-workflow', async ({ state: stateToken, reason }) => {
      // Decode state
      let state = decodeState(stateToken);
      
      // Load workflow
      const result = await loadWorkflow(config.workflowDir, state.workflowId);
      if (!result.success) {
        throw new Error(`Workflow not found: ${state.workflowId}`);
      }
      const workflow = result.value;
      
      // Record the end request in history
      state = addHistoryEvent(state, 'workflow_ending', { 
        activity: state.currentActivity,
        data: reason ? { reason } : undefined
      });
      
      // Check if workflow has a final activity
      if (workflow.finalActivity) {
        const finalActivity = workflow.activities.find(
          a => a.id === workflow.finalActivity
        );
        
        if (finalActivity) {
          // Transition to final activity
          const transitionResult = transitionToActivity(workflow, state, workflow.finalActivity);
          
          if (transitionResult.success) {
            state = addHistoryEvent(transitionResult.state, 'activity_entered', {
              activity: workflow.finalActivity
            });
            
            const response = buildResponse(
              workflow,
              state,
              `Workflow ending - transitioned to final activity '${finalActivity.name}'`
            );
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(response, null, 2),
              }],
            };
          }
          // If transition fails, fall through to complete immediately
        }
      }
      
      // No final activity or transition failed - mark as complete
      const now = new Date().toISOString();
      state = addHistoryEvent(state, 'workflow_completed', {
        activity: state.currentActivity,
        data: { earlyEnd: true, reason }
      });
      
      // Mark workflow as completed
      state = { ...state, status: 'completed', completedAt: now };
      
      const position = computePosition(workflow, state);
      const response: NavigationResponse = {
        success: true,
        position,
        message: 'Workflow ended' + (reason ? `: ${reason}` : ''),
        availableActions: { required: [], optional: [], blocked: [] },
        complete: true,
        state: encodeState(state),
      };
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
        }],
      };
    })
  );
}
