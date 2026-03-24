import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getActivity, getCheckpoint, validateTransition } from '../loaders/workflow-loader.js';
import { withAuditLog } from '../logging.js';
import { decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';

export function registerWorkflowTools(server: McpServer, config: ServerConfig): void {

  server.tool('help', 'How to use this server. Call this first. Returns the bootstrap procedure and session protocol.', {},
    withAuditLog('help', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      const guide = {
        server: config.serverName,
        version: config.serverVersion,
        bootstrap: {
          step_1: {
            action: 'Call list_workflows to discover available workflows',
            tool: 'list_workflows',
            note: 'Match the user goal to a workflow from the returned list',
          },
          step_2: {
            action: 'Call start_session with the chosen workflow_id',
            tool: 'start_session',
            params: { workflow_id: '<chosen workflow ID>' },
            returns: 'Agent behavioral rules, workflow metadata, and an opaque session token',
          },
        },
        session_protocol: {
          token_usage: 'Pass the session_token to ALL subsequent tool calls. It encodes workflow context so you do not need to pass workflow_id or activity_id separately.',
          token_update: 'Every tool response includes an updated token in _meta.session_token. Use the updated token for the next call.',
          token_opacity: 'Treat the token as opaque. Do not attempt to parse, decode, or fabricate tokens.',
          staleness: 'The token includes a counter that increments on each call. Stale tokens indicate missed exchanges.',
          exempt_tools: ['help', 'list_workflows', 'start_session', 'health_check'],
        },
        available_workflows: workflows.map(w => ({ id: w.id, title: w.title, version: w.version })),
      };
      return { content: [{ type: 'text' as const, text: JSON.stringify(guide, null, 2) }] };
    }));

  server.tool('list_workflows', 'List all available workflow definitions. Call this after help to choose a workflow.', {},
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

  server.tool('get_activity', 'Get details of a specific activity within the session workflow',
    { ...sessionTokenParam, activity_id: z.string().describe('Activity ID to load (also updates the session activity)') },
    withAuditLog('get_activity', async ({ session_token, activity_id }) => {
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
