import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getActivity, getCheckpoint, validateTransition } from '../loaders/workflow-loader.js';
import { withAuditLog } from '../logging.js';
import { decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation, validateWorkflowConsistency, validateWorkflowVersion, validateActivityTransition, validateStepManifest } from '../utils/validation.js';
import type { StepManifestEntry } from '../utils/validation.js';

const stepManifestSchema = z.array(z.object({
  step_id: z.string(),
  output: z.string(),
})).optional().describe('Step completion manifest from the previous activity. Each entry reports a step ID and its output summary.');


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
          token_usage: 'Pass the session_token to all subsequent tool calls alongside explicit workflow_id and activity_id parameters. The token enables server-side validation of call consistency.',
          token_update: 'Every tool response includes an updated token in _meta.session_token. Use the updated token for the next call.',
          token_opacity: 'Treat the token as opaque. Do not attempt to parse, decode, or fabricate tokens.',
          validation: 'The server validates each call against the token: workflow consistency, activity transition validity, skill-activity association, and version drift. Warnings are returned in _meta.validation.',
          exempt_tools: ['help', 'list_workflows', 'start_session', 'health_check'],
        },
        available_workflows: workflows.map(w => ({ id: w.id, title: w.title, version: w.version })),
      };
      return { content: [{ type: 'text' as const, text: JSON.stringify(guide, null, 2) }] };
    }));

  server.tool('list_workflows', 'List all available workflow definitions. Call this after help to choose a workflow.', {},
    withAuditLog('list_workflows', async () => ({
      content: [{ type: 'text' as const, text: JSON.stringify(await listWorkflows(config.workflowDir), null, 2) }],
    })));

  server.tool('get_workflow', 'Get the complete workflow definition by ID',
    { ...sessionTokenParam, workflow_id: z.string().describe('Workflow ID (e.g., "work-package")') },
    withAuditLog('get_workflow', async ({ session_token, workflow_id }) => {
      const token = await decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, result.value),
      );

      const content: Array<{ type: 'text'; text: string }> = [];
      if (config.schemaPreamble) {
        content.push({ type: 'text', text: config.schemaPreamble });
      }
      content.push({ type: 'text', text: JSON.stringify(result.value, null, 2) });
      return { content, _meta: { session_token: await advanceToken(session_token, { wf: workflow_id }), validation } };
    }));

  server.tool('get_activity', 'Get details of a specific activity within a workflow',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      activity_id: z.string().describe('Activity ID to load'),
      step_manifest: stepManifestSchema,
    },
    withAuditLog('get_activity', async ({ session_token, workflow_id, activity_id, step_manifest }) => {
      const token = await decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const activity = getActivity(result.value, activity_id);
      if (!activity) throw new Error(`Activity not found: ${activity_id}`);

      const manifestWarnings: (string | null)[] = [];
      if (step_manifest && token.act) {
        const mw = validateStepManifest(step_manifest as StepManifestEntry[], result.value, token.act);
        manifestWarnings.push(...mw);
      } else if (!step_manifest && token.act) {
        manifestWarnings.push(`No step_manifest provided for previous activity '${token.act}'. Include a manifest to enable step completion validation.`);
      }

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateActivityTransition(token, result.value, activity_id),
        validateWorkflowVersion(token, result.value),
        ...manifestWarnings,
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(activity, null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, act: activity_id }), validation },
      };
    }));

  server.tool('get_checkpoint', 'Get checkpoint details for an activity',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      activity_id: z.string().describe('Activity ID containing the checkpoint'),
      checkpoint_id: z.string().describe('Checkpoint ID'),
    },
    withAuditLog('get_checkpoint', async ({ session_token, workflow_id, activity_id, checkpoint_id }) => {
      const token = await decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, activity_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id}`);

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, result.value),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(checkpoint, null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, act: activity_id }), validation },
      };
    }));

  server.tool('validate_transition', 'Validate if a transition between activities is allowed',
    { ...sessionTokenParam, workflow_id: z.string(), from_activity: z.string(), to_activity: z.string(), step_manifest: stepManifestSchema },
    withAuditLog('validate_transition', async ({ session_token, workflow_id, from_activity, to_activity, step_manifest }) => {
      const token = await decodeSessionToken(session_token);
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const manifestWarnings: (string | null)[] = [];
      if (step_manifest) {
        const mw = validateStepManifest(step_manifest as StepManifestEntry[], result.value, from_activity);
        manifestWarnings.push(...mw);
      }

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, result.value),
        ...manifestWarnings,
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(validateTransition(result.value, from_activity, to_activity), null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id }), validation },
      };
    }));

  server.tool('health_check', 'Check server health', {},
    withAuditLog('health_check', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'healthy', server: config.serverName, version: config.serverVersion,
          workflows_available: workflows.length, uptime_seconds: Math.floor(process.uptime()),
        }, null, 2) }],
      };
    }));
}
