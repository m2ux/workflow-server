import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getActivity, getCheckpoint, validateTransition } from '../loaders/workflow-loader.js';
import { withAuditLog } from '../logging.js';
import { decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';

export function registerWorkflowTools(server: McpServer, config: ServerConfig): void {

  server.tool('list_workflows', 'List all available workflow definitions. Call this before start_session to choose a workflow.', {},
    withAuditLog('list_workflows', async () => ({
      content: [{ type: 'text', text: JSON.stringify(await listWorkflows(config.workflowDir), null, 2) }],
    })));

  server.tool('get_workflow', 'Get the complete workflow definition for the session workflow',
    { ...sessionTokenParam },
    withAuditLog('get_workflow', async ({ session_token }) => {
      const { wf } = decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, wf);
      if (!result.success) throw result.error;
      const content: Array<{ type: 'text'; text: string }> = [];
      if (config.schemaPreamble) {
        content.push({ type: 'text', text: config.schemaPreamble });
      }
      content.push({ type: 'text', text: JSON.stringify(result.value, null, 2) });
      return { content, _meta: { session_token: advanceToken(session_token) } };
    }));

  server.tool('validate_transition', 'Validate if a transition between activities is allowed',
    { ...sessionTokenParam, from_activity: z.string(), to_activity: z.string() },
    withAuditLog('validate_transition', async ({ session_token, from_activity, to_activity }) => {
      const { wf } = decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, wf);
      if (!result.success) throw result.error;
      return {
        content: [{ type: 'text', text: JSON.stringify(validateTransition(result.value, from_activity, to_activity), null, 2) }],
        _meta: { session_token: advanceToken(session_token) },
      };
    }));

  server.tool('get_workflow_activity', 'Get details of a specific activity within the session workflow',
    { ...sessionTokenParam, activity_id: z.string().describe('Activity ID to load (also updates the session activity)') },
    withAuditLog('get_workflow_activity', async ({ session_token, activity_id }) => {
      const { wf } = decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, wf);
      if (!result.success) throw result.error;
      const activity = getActivity(result.value, activity_id);
      if (!activity) throw new Error(`Activity not found: ${activity_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(activity, null, 2) }],
        _meta: { session_token: advanceToken(session_token, { act: activity_id }) },
      };
    }));

  server.tool('get_checkpoint', 'Get checkpoint details for the current session activity',
    { ...sessionTokenParam, checkpoint_id: z.string() },
    withAuditLog('get_checkpoint', async ({ session_token, checkpoint_id }) => {
      const { wf, act } = decodeSessionToken(session_token);
      if (!act) throw new Error('No activity set in session token');
      const result = await loadWorkflow(config.workflowDir, wf);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, act, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(checkpoint, null, 2) }],
        _meta: { session_token: advanceToken(session_token) },
      };
    }));

  server.tool('health_check', 'Check server health', {},
    withAuditLog('health_check', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      return {
        content: [{ type: 'text', text: JSON.stringify({
          status: 'healthy', server: config.serverName, version: config.serverVersion,
          workflows_available: workflows.length, uptime_seconds: Math.floor(process.uptime()),
        }, null, 2) }],
      };
    }));
}
