import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getActivity, getCheckpoint } from '../loaders/workflow-loader.js';
import { readResourceRaw } from '../loaders/resource-loader.js';
import { withAuditLog } from '../logging.js';
import { decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation, validateWorkflowVersion, validateActivityTransition, validateStepManifest, validateTransitionCondition, validateActivityManifest } from '../utils/validation.js';
import type { StepManifestEntry, ActivityManifestEntry } from '../utils/validation.js';
import { createTraceToken, decodeTraceToken } from '../trace.js';
import type { TraceEvent, TraceTokenPayload } from '../trace.js';

const stepManifestSchema = z.array(z.object({
  step_id: z.string(),
  output: z.string(),
})).optional().describe('Step completion manifest from the previous activity. Each entry reports a step ID and its output summary.');

const activityManifestSchema = z.array(z.object({
  activity_id: z.string(),
  outcome: z.string(),
  transition_condition: z.string().optional(),
})).optional().describe('Activity completion manifest from the orchestrator. Reports the sequence of activities completed so far with outcomes and transition conditions.');


export function registerWorkflowTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  server.tool('discover', 'Entry point for this server. Call this before any other tool to learn the available workflows and the bootstrap procedure for starting a session. Returns the server name, version, a list of available workflows (each with id, title, and version), and the bootstrap guide explaining the full tool-calling sequence. No parameters required and no session token needed.', {},
    withAuditLog('discover', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      const bootstrapResult = await readResourceRaw(config.workflowDir, 'meta', '00');
      const guide: Record<string, unknown> = {
        server: config.serverName,
        version: config.serverVersion,
        available_workflows: workflows.map(w => ({ id: w.id, title: w.title, version: w.version })),
      };
      if (bootstrapResult.success) {
        guide['discovery'] = bootstrapResult.value.content;
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify(guide) }] };
    }));

  server.tool('list_workflows', 'List all available workflow definitions with their full metadata. Use this when you need more detail about available workflows than what discover provides, or to refresh the workflow list during an existing session. Returns an array of workflow summaries. Does not require a session token.', {},
    withAuditLog('list_workflows', async () => ({
      content: [{ type: 'text' as const, text: JSON.stringify(await listWorkflows(config.workflowDir)) }],
    })));

  server.tool('get_workflow', 'Load the workflow definition for the current session. Use summary=true (the default) to get lightweight metadata including rules, variables, execution model, the initialActivity field (which activity to load first), and a stub list of all activities with their IDs and names. Use summary=false for the full definition including complete activity details. Call this after start_session to learn the workflow structure — the initialActivity field in the response tells you which activity_id to pass to your first next_activity call. This is the only tool that provides initialActivity.',
    {
      ...sessionTokenParam,
      summary: z.boolean().optional().default(true).describe('Returns lightweight summary by default. Set to false for the full definition.'),
    },
    withAuditLog('get_workflow', async ({ session_token, summary }) => {
      const token = await decodeSessionToken(session_token);
      const workflow_id = token.wf;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const validation = buildValidation(
        validateWorkflowVersion(token, result.value),
      );

      const content: Array<{ type: 'text'; text: string }> = [];
      if (config.schemaPreamble) {
        content.push({ type: 'text', text: config.schemaPreamble });
      }

      const advancedToken = await advanceToken(session_token);

      if (summary) {
        const wf = result.value;
        const summaryData = {
          id: wf.id,
          version: wf.version,
          title: wf.title,
          description: wf.description,
          rules: wf.rules,
          variables: wf.variables,
          executionModel: wf.executionModel,
          initialActivity: wf.initialActivity,
          activities: wf.activities.map(a => ({ id: a.id, name: a.name, required: a.required })),
          session_token: advancedToken,
        };
        content.push({ type: 'text', text: JSON.stringify(summaryData) });
      } else {
        content.push({ type: 'text', text: JSON.stringify({ ...result.value, session_token: advancedToken }) });
      }

      return { content, _meta: { session_token: advancedToken, validation } };
    }, traceOpts));

  server.tool('next_activity', 'Load and transition to the specified activity. This is the primary tool for progressing through a workflow. Returns the complete activity definition including all steps, checkpoints, transitions to subsequent activities, mode overrides, rules, and skill references — everything needed to execute the activity. Also advances the session token to track the current activity. For the first call, use the initialActivity value from get_workflow. For subsequent calls, use the activity IDs from the transitions field in the previous activity\'s response. Optionally include a step_manifest summarizing completed steps and a transition_condition to enable server-side validation.',
    {
      ...sessionTokenParam,
      activity_id: z.string().describe('Activity ID to transition to. For the first call, use initialActivity from get_workflow. For subsequent calls, use an activity ID from the transitions field of the current activity.'),
      transition_condition: z.string().optional().describe('The transition condition that led to this activity (from the transitions field of the previous activity). Enables server-side validation of condition-activity consistency.'),
      step_manifest: stepManifestSchema,
      activity_manifest: activityManifestSchema,
    },
    withAuditLog('next_activity', async ({ session_token, activity_id, transition_condition, step_manifest, activity_manifest }) => {
      const token = await decodeSessionToken(session_token);
      const workflow_id = token.wf;
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

      const condWarning = (transition_condition !== undefined && token.act)
        ? validateTransitionCondition(token, result.value, activity_id, transition_condition)
        : null;

      const activityManifestWarnings: string[] = [];
      if (activity_manifest) {
        if (activity_manifest.length === 0) {
          activityManifestWarnings.push('Empty activity_manifest provided. Omit the parameter if no activities have been completed.');
        } else {
          const amw = validateActivityManifest(activity_manifest as ActivityManifestEntry[], result.value);
          activityManifestWarnings.push(...amw);
        }
      }

      const validation = buildValidation(
        validateActivityTransition(token, result.value, activity_id),
        validateWorkflowVersion(token, result.value),
        condWarning,
        ...manifestWarnings,
        ...activityManifestWarnings,
      );

      const advancedToken = await advanceToken(session_token, { act: activity_id, cond: transition_condition ?? '' });

      const meta: Record<string, unknown> = { session_token: advancedToken, validation };

      if (config.traceStore) {
        const segment = config.traceStore.getSegmentAndAdvanceCursor(token.sid);
        if (segment.events.length > 0) {
          const firstEvent = segment.events[0];
          const lastEvent = segment.events[segment.events.length - 1];
          const payload: TraceTokenPayload = {
            sid: token.sid,
            act: activity_id,
            from: segment.fromIndex,
            to: segment.toIndex,
            n: segment.events.length,
            t0: firstEvent ? firstEvent.ts : 0,
            t1: lastEvent ? lastEvent.ts : 0,
            ts: Math.floor(Date.now() / 1000),
            events: segment.events,
          };
          meta['trace_token'] = await createTraceToken(payload);
        }
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ ...activity, session_token: advancedToken }) }],
        _meta: meta,
      };
    }, traceOpts));

  server.tool('get_checkpoint', 'Load the full details of a specific checkpoint within an activity. Returns the checkpoint definition including its message, user-facing options (with labels, descriptions, and effects like variable assignments), and any blocking or auto-advance configuration. Use this when you need to present a checkpoint interaction to the user. Checkpoint summaries are included in the activity definition from next_activity — use this tool when you need complete details for presentation.',
    {
      ...sessionTokenParam,
      activity_id: z.string().describe('Activity ID containing the checkpoint'),
      checkpoint_id: z.string().describe('Checkpoint ID'),
    },
    withAuditLog('get_checkpoint', async ({ session_token, activity_id, checkpoint_id }) => {
      const token = await decodeSessionToken(session_token);
      const workflow_id = token.wf;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, activity_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id}`);

      const validation = buildValidation(
        validateWorkflowVersion(token, result.value),
      );

      const advancedToken = await advanceToken(session_token, { act: activity_id });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ ...checkpoint, session_token: advancedToken }) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts));

  server.tool('get_trace', 'Retrieve the execution trace for the current workflow session. Accepts an optional array of trace_tokens accumulated from next_activity _meta.trace_token responses to reconstruct a specific trace segment. If no trace_tokens are provided, returns the full in-memory trace for the current session (requires server-side tracing to be enabled). Use this for debugging, auditing, or reviewing the sequence of tool calls made during the session.',
    {
      ...sessionTokenParam,
      trace_tokens: z.array(z.string()).optional().describe('Accumulated trace tokens from next_activity _meta.trace_token responses. If not provided, returns the full in-memory trace for the current session.'),
    },
    withAuditLog('get_trace', async ({ session_token, trace_tokens }) => {
      const token = await decodeSessionToken(session_token);
      const advancedToken = await advanceToken(session_token);

      if (trace_tokens && trace_tokens.length > 0) {
        const allEvents: TraceEvent[] = [];
        const errors: string[] = [];
        for (const tt of trace_tokens) {
          try {
            const payload = await decodeTraceToken(tt);
            allEvents.push(...payload.events);
          } catch (e) {
            errors.push(e instanceof Error ? e.message : String(e));
          }
        }
        const result: Record<string, unknown> = { traceId: token.sid, source: 'tokens', event_count: allEvents.length, events: allEvents, session_token: advancedToken };
        if (errors.length > 0) result['token_errors'] = errors;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
          _meta: { session_token: advancedToken, validation: buildValidation() },
        };
      }

      if (!config.traceStore) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ traceId: token.sid, source: 'memory', tracing_enabled: false, event_count: 0, events: [], session_token: advancedToken }) }],
          _meta: { session_token: advancedToken, validation: buildValidation() },
        };
      }

      const events = config.traceStore.getEvents(token.sid);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ traceId: token.sid, source: 'memory', tracing_enabled: true, event_count: events.length, events, session_token: advancedToken }) }],
        _meta: { session_token: advancedToken, validation: buildValidation() },
      };
    }, traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));

  server.tool('health_check', 'Check server health and availability. Returns server status, name, version, number of available workflows, and uptime in seconds. Does not require a session token. Use this to verify the server is running before starting a workflow.', {},
    withAuditLog('health_check', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'healthy', server: config.serverName, version: config.serverVersion,
          workflows_available: workflows.length, uptime_seconds: Math.floor(process.uptime()),
        }) }],
      };
    }));
}
