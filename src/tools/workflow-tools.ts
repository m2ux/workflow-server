import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getActivity, getCheckpoint, readActivityRaw, readWorkflowRaw } from '../loaders/workflow-loader.js';
import { readSkillRaw, resolveOperations, formatOperationsBundle } from '../loaders/skill-loader.js';
import { CORE_ORCHESTRATOR_OPS, CORE_WORKER_OPS } from '../loaders/core-ops.js';
import { readResourceRaw } from '../loaders/resource-loader.js';
import { withAuditLog } from '../logging.js';
import { encodeToon } from '../utils/toon.js';
import { decodeSessionToken, advanceToken, sessionTokenParam, assertCheckpointsResolved } from '../utils/session.js';
import { buildValidation, validateWorkflowVersion, validateActivityTransition, validateStepManifest, validateTransitionCondition, validateActivityManifest } from '../utils/validation.js';
import type { StepManifestEntry, ActivityManifestEntry } from '../utils/validation.js';
import { createTraceEvent, createTraceToken, decodeTraceToken } from '../trace.js';
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

  server.tool('discover', 'Entry point for this server. Call this before any other tool to learn the bootstrap procedure for starting a session. Returns the server name, version, and the bootstrap guide explaining the full tool-calling sequence. Use list_workflows to discover available workflows. No parameters required and no session token needed.', {},
    withAuditLog('discover', async () => {
      const bootstrapResult = await readResourceRaw(config.workflowDir, 'meta', '00');
      const lines = [
        `server: ${config.serverName}`,
        `version: ${config.serverVersion}`,
      ];
      if (bootstrapResult.success) {
        lines.push('', bootstrapResult.value.content);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    }));

  server.tool('list_workflows', 'List all available workflow definitions with their ID, title, version, and tags. Use this when you need to discover or filter available workflows. Returns an array of workflow summaries with tag-based categorization. Does not require a session token.', {},
    withAuditLog('list_workflows', async () => ({
      content: [{ type: 'text' as const, text: encodeToon(await listWorkflows(config.workflowDir)) }],
    })));

  server.tool('get_workflow', 'Load the workflow definition for the current session. The response begins with the workflow\'s primary skill (raw TOON), followed by the workflow definition. Use summary=true (the default) to get lightweight metadata including rules, variables, orchestration model, the initialActivity field (which activity to load first), and a stub list of all activities with their IDs and names. Use summary=false for the raw workflow definition in TOON format. Call this after start_session to learn the workflow structure — the initialActivity field in the response tells you which activity_id to pass to your first next_activity call. This is the only tool that provides initialActivity.',
    {
      ...sessionTokenParam,
      summary: z.boolean().optional().default(true).describe('Returns lightweight summary by default. Set to false for the raw workflow definition.'),
    },
    withAuditLog('get_workflow', async ({ session_token, summary }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);
      const workflow_id = token.wf;

      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const wf = result.value;

      const validation = buildValidation(
        validateWorkflowVersion(token, wf),
      );

      const advancedToken = await advanceToken(session_token);

      const primarySkillId = wf.skills?.primary;
      let primarySkillContent = '';
      if (primarySkillId) {
        const skillResult = await readSkillRaw(primarySkillId, config.workflowDir, workflow_id);
        if (skillResult.success) {
          primarySkillContent = skillResult.value;
        }
      }

      // Bundle operations: workflow.operations + core orchestrator ops.
      // Deduplicate by ref so a workflow that explicitly lists a core op only resolves it once.
      const declaredOps = (wf as { operations?: string[] }).operations ?? [];
      const orchestratorOps = Array.from(new Set([...declaredOps, ...CORE_ORCHESTRATOR_OPS]));
      const resolvedOps = await resolveOperations(orchestratorOps, config.workflowDir);
      const opsBlock = encodeToon(formatOperationsBundle(resolvedOps));

      // Pre-separator preamble holds the legacy primary-skill body (when present)
      // followed by the resolved-operations bundle. Tests and clients split on
      // the first '\n\n---\n\n' to recover the workflow section, so we keep
      // that single separator and concatenate skill + ops before it.
      const preambleParts = [primarySkillContent, opsBlock].filter(s => s.length > 0);
      const preamble = preambleParts.length > 0 ? preambleParts.join('\n\n') + '\n\n---\n\n' : '';

      if (summary) {
        const summaryData = {
          id: wf.id,
          version: wf.version,
          title: wf.title,
          description: wf.description,
          rules: wf.rules,
          variables: wf.variables,
          initialActivity: wf.initialActivity,
          activities: wf.activities?.map((a: { id: string; name?: string; required?: boolean }) => ({ id: a.id, name: a.name, required: a.required })) ?? [],
          session_token: advancedToken,
        };

        return {
          content: [{ type: 'text' as const, text: preamble + encodeToon(summaryData) }],
          _meta: { session_token: advancedToken, validation },
        };
      } else {
        const rawResult = await readWorkflowRaw(config.workflowDir, workflow_id);
        if (!rawResult.success) throw rawResult.error;

        return {
          content: [{ type: 'text' as const, text: preamble + `session_token: ${advancedToken}\n\n${rawResult.value}` }],
          _meta: { session_token: advancedToken, validation },
        };
      }
    }, traceOpts));

  server.tool('next_activity', 'Transition to the specified activity. This is the orchestrator\'s tool for advancing the workflow — it validates the transition, advances the session token, and records the trace, but does NOT return the activity definition. After calling next_activity, the worker should call get_activity to load the complete activity definition including steps, checkpoints, transitions, and skill references. For the first call, use the initialActivity value from get_workflow. For subsequent calls, use the activity IDs from the transitions field of the current activity\'s response. Optionally include a step_manifest summarizing completed steps and a transition_condition to enable server-side validation.',
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

      if (token.bcp) {
        throw new Error(
          `Cannot transition to '${activity_id}': Active checkpoint '${token.bcp}' ` +
          `on activity '${token.act}'. The orchestrator must resolve it by calling respond_checkpoint.`
        );
      }
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

      const advancedToken = await advanceToken(session_token, {
        act: activity_id,
        cond: transition_condition ?? '',
        bcp: null, // Clear any active checkpoint on transition
      });

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

      const responseData: Record<string, unknown> = {
        activity_id,
        name: activity.name,
        session_token: advancedToken,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
        _meta: meta,
      };
    }, traceOpts));
  server.tool('get_activity', 'Load the complete activity definition for the current activity in the session. This is the worker\'s tool for retrieving the full activity details after the orchestrator has called next_activity to transition. Returns the complete activity definition including all steps, checkpoints, transitions to subsequent activities, mode overrides, rules, and skill references — everything needed to execute the activity. The activity is determined from the session token, so no activity_id parameter is needed.',
    {
      ...sessionTokenParam,
    },
    withAuditLog('get_activity', async ({ session_token }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);

      const activity_id = token.act;
      if (!activity_id) {
        throw new Error('No current activity in session token. Call next_activity first.');
      }

      const workflow_id = token.wf;
      const rawResult = await readActivityRaw(config.workflowDir, workflow_id, activity_id);
      if (!rawResult.success) throw new Error(`Activity not found: ${activity_id}`);

      const advancedToken = await advanceToken(session_token);

      const result = await loadWorkflow(config.workflowDir, workflow_id);
      const validation = buildValidation(
        result.success ? validateWorkflowVersion(token, result.value) : null,
      );

      // Bundle operations: activity.operations + core worker ops.
      const activity = result.success ? getActivity(result.value, activity_id) : undefined;
      const declaredOps = (activity as { operations?: string[] } | undefined)?.operations ?? [];
      const workerOps = Array.from(new Set([...declaredOps, ...CORE_WORKER_OPS]));
      const resolvedOps = await resolveOperations(workerOps, config.workflowDir);
      const opsSection = encodeToon(formatOperationsBundle(resolvedOps)) + '\n\n---\n\n';

      return {
        content: [{ type: 'text' as const, text: opsSection + `session_token: ${advancedToken}\n\n${rawResult.value}` }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts));

  server.tool('yield_checkpoint', 'Yield execution to the orchestrator at a checkpoint. Call this tool when you encounter a checkpoint step during activity execution. It returns a checkpoint_handle that you MUST yield back to the orchestrator via a <checkpoint_yield> block.',
    {
      ...sessionTokenParam,
      checkpoint_id: z.string().describe('The ID of the checkpoint being yielded.'),
    },
    withAuditLog('yield_checkpoint', async ({ session_token, checkpoint_id }) => {
      const token = await decodeSessionToken(session_token);
      
      if (token.bcp) {
        throw new Error(`Cannot yield checkpoint '${checkpoint_id}': Checkpoint '${token.bcp}' is already active and awaiting orchestrator resolution.`);
      }

      const workflow_id = token.wf;
      const activity_id = token.act;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      
      const checkpoint = getCheckpoint(result.value, activity_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id} in activity ${activity_id}`);

      const validation = buildValidation(
        validateWorkflowVersion(token, result.value),
      );

      const advancedToken = await advanceToken(session_token, { bcp: checkpoint_id });
      
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'yielded',
          checkpoint_id,
          checkpoint_handle: advancedToken,
          message: `Checkpoint '${checkpoint_id}' successfully yielded. Yield this checkpoint_handle to the orchestrator using a <checkpoint_yield> block, then STOP execution and wait to be resumed.`
        }, null, 2) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts));

  server.tool('resume_checkpoint', 'Resume execution after the orchestrator resolves a checkpoint. Call this tool when the orchestrator resumes you with a checkpoint response. It verifies the checkpoint was resolved and returns any variable updates you need to apply to your state.',
    {
      ...sessionTokenParam,
    },
    withAuditLog('resume_checkpoint', async ({ session_token }) => {
      const token = await decodeSessionToken(session_token);
      
      if (token.bcp) {
        throw new Error(`Cannot resume: Checkpoint '${token.bcp}' is still active and has not been resolved by the orchestrator.`);
      }

      const validation = buildValidation();
      const advancedToken = await advanceToken(session_token);
      
      // Note: The orchestrator passes variable effects directly in its prompt when resuming the worker.
      // This tool exists to verify the lock is cleared and advance the token sequence.
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'resumed',
          message: `Checkpoint cleared. You may proceed to the next step. Note any variable updates provided by the orchestrator.`
        }, null, 2) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts));

  server.tool('present_checkpoint', 'Load the full details of a specific checkpoint yielded by a worker. Returns the checkpoint definition including its message, user-facing options (with labels, descriptions, and effects like variable assignments), and any auto-advance configuration. Use this when you need to present a checkpoint interaction to the user based on a worker\'s yield. Accepts either checkpoint_handle (preferred) or session_token — both are the same opaque token string.',
    {
      checkpoint_handle: z.string().optional().describe('The checkpoint_handle (token) provided by the worker when it yielded the checkpoint. Either this or session_token must be provided.'),
      session_token: z.string().optional().describe('The current session token (same opaque string as checkpoint_handle). Either this or checkpoint_handle must be provided. Useful when resuming a workflow and the agent only has the session_token from get_workflow_status.'),
    },
    withAuditLog('present_checkpoint', async ({ checkpoint_handle, session_token }) => {
      const handle = checkpoint_handle ?? session_token;
      if (!handle) {
        throw new Error('Either checkpoint_handle or session_token must be provided. Both were omitted.');
      }
      // The handle is just the worker's session token encoded.
      const token = await decodeSessionToken(handle);
      const workflow_id = token.wf;
      const activity_id = token.act;
      const checkpoint_id = token.bcp;
      
      if (!checkpoint_id) {
        throw new Error(`The provided checkpoint_handle does not have an active checkpoint (bcp is empty). The worker must yield a checkpoint first.`);
      }

      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, activity_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id} in activity ${activity_id}`);

      const validation = buildValidation(
        validateWorkflowVersion(token, result.value),
      );

      return {
        content: [{ type: 'text' as const, text: encodeToon({ ...checkpoint, checkpoint_handle }) }],
        _meta: { validation },
      };
    }, traceOpts));

  const MIN_RESPONSE_SECONDS = config.minCheckpointResponseSeconds ?? 3;

  server.tool('respond_checkpoint',
    'Submit a checkpoint response to clear the checkpoint gate. *MUST* present the checkpoint to the user and wait for their input. ' +
    'Exactly one of option_id, auto_advance, or condition_not_met must be provided. ' +
    'option_id: the user\'s selected option (works for all checkpoint types, enforces minimum response time). ' +
    'auto_advance: use the checkpoint\'s defaultOption (only for checkpoints with autoAdvanceMs; the server enforces the full timer). ' +
    'condition_not_met: dismiss a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a condition field). ' +
    'Accepts either checkpoint_handle (preferred) or session_token — both are the same opaque token string.',
    {
      checkpoint_handle: z.string().optional().describe('The checkpoint_handle (token) provided by the worker when it yielded the checkpoint. Either this or session_token must be provided.'),
      session_token: z.string().optional().describe('The current session token (same opaque string as checkpoint_handle). Either this or checkpoint_handle must be provided. Useful when resuming a workflow and the agent only has the session_token from get_workflow_status.'),
      option_id: z.string().optional().describe('The option ID selected by the user. Must match one of the checkpoint\'s defined options.'),
      auto_advance: z.boolean().optional().describe('Set to true to auto-advance a checkpoint using its defaultOption. Only valid for checkpoints with defaultOption and autoAdvanceMs. The server enforces the autoAdvanceMs timer. If you use auto_advance, present a message to the user that you are proceeding with the default option because no input was provided.'),
      condition_not_met: z.boolean().optional().describe('Set to true to dismiss a conditional checkpoint whose condition was not met. Only valid for checkpoints that have a condition field.'),
    },
    withAuditLog('respond_checkpoint', async ({ checkpoint_handle, session_token, option_id, auto_advance, condition_not_met }) => {
      const handle = checkpoint_handle ?? session_token;
      if (!handle) {
        throw new Error('Either checkpoint_handle or session_token must be provided. Both were omitted.');
      }
      const token = await decodeSessionToken(handle);
      const checkpoint_id = token.bcp;

      if (!checkpoint_id) {
        throw new Error(`The provided checkpoint_handle does not have an active checkpoint (bcp is empty). The worker must yield a checkpoint first.`);
      }

      const modeCount = [option_id, auto_advance, condition_not_met].filter(v => v !== undefined).length;
      if (modeCount !== 1) {
        throw new Error('Exactly one of option_id, auto_advance, or condition_not_met must be provided.');
      }

      const result = await loadWorkflow(config.workflowDir, token.wf);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, token.act, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint definition not found: ${checkpoint_id} in activity ${token.act}`);

      const now = Math.floor(Date.now() / 1000);
      // We don't have pcpt anymore, so we estimate elapsed time since the token sequence was advanced (yield time)
      const elapsed = now - token.ts;
      let resolvedOptionId: string | undefined;
      let effect: Record<string, unknown> | undefined;

      if (option_id !== undefined) {
        if (elapsed < MIN_RESPONSE_SECONDS) {
          throw new Error(
            `Checkpoint response too fast (${elapsed}s < ${MIN_RESPONSE_SECONDS}s minimum). ` +
            `Present the checkpoint to the user before responding.`
          );
        }
        const option = checkpoint.options.find(o => o.id === option_id);
        if (!option) {
          const validIds = checkpoint.options.map(o => o.id);
          throw new Error(`Invalid option '${option_id}' for checkpoint '${checkpoint_id}'. Valid options: [${validIds.join(', ')}]`);
        }
        resolvedOptionId = option_id;
        effect = option.effect as Record<string, unknown> | undefined;
      } else if (auto_advance) {
        if (!checkpoint.defaultOption || !checkpoint.autoAdvanceMs) {
          throw new Error(
            `Cannot auto-advance checkpoint '${checkpoint_id}': missing defaultOption or autoAdvanceMs.`
          );
        }
        const requiredSeconds = Math.ceil(checkpoint.autoAdvanceMs / 1000);
        if (elapsed < requiredSeconds) {
          throw new Error(
            `Auto-advance timer not elapsed for checkpoint '${checkpoint_id}' ` +
            `(${elapsed}s < ${requiredSeconds}s). Wait for the full autoAdvanceMs (${checkpoint.autoAdvanceMs}ms) before auto-advancing.`
          );
        }
        const defaultOpt = checkpoint.options.find(o => o.id === checkpoint.defaultOption);
        if (!defaultOpt) {
          throw new Error(`Default option '${checkpoint.defaultOption}' not found in checkpoint '${checkpoint_id}'.`);
        }
        resolvedOptionId = checkpoint.defaultOption;
        effect = defaultOpt.effect as Record<string, unknown> | undefined;
      } else if (condition_not_met) {
        if (!checkpoint.condition) {
          throw new Error(
            `Cannot dismiss checkpoint '${checkpoint_id}': it has no condition field. ` +
            `Only conditional checkpoints can be dismissed with condition_not_met.`
          );
        }
      }

      const advancedToken = await advanceToken(handle, { bcp: null });

      const validation = buildValidation(
        validateWorkflowVersion(token, result.value),
      );

      const responseData: Record<string, unknown> = {
        checkpoint_id,
        resolved: true,
        checkpoint_handle: advancedToken,
      };
      if (resolvedOptionId !== undefined) responseData['resolved_option'] = resolvedOptionId;
      if (effect !== undefined) responseData['effect'] = effect;
      if (condition_not_met) responseData['dismissed'] = true;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
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
      assertCheckpointsResolved(token);
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
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          _meta: { session_token: advancedToken, validation: buildValidation() },
        };
      }

      if (!config.traceStore) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ traceId: token.sid, source: 'memory', tracing_enabled: false, event_count: 0, events: [], session_token: advancedToken }, null, 2) }],
          _meta: { session_token: advancedToken, validation: buildValidation() },
        };
      }

      const events = config.traceStore.getEvents(token.sid);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ traceId: token.sid, source: 'memory', tracing_enabled: true, event_count: events.length, events, session_token: advancedToken }, null, 2) }],
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
        }, null, 2) }],
      };
    }));

  server.tool('get_workflow_status',
    'Check the status of a workflow session. Returns the session status (active/blocked/completed), current activity, ' +
    'completed activities trace, last checkpoint info, and parent context if nested. Requires a session token.',
    {
      ...sessionTokenParam,
    },
    withAuditLog('get_workflow_status', async ({ session_token }) => {
      const token = await decodeSessionToken(session_token);
      const clientSid = token.sid;
      const clientWf = token.wf;
      const clientAct = token.act;
      const clientBcp = token.bcp;

      const wfResult = await loadWorkflow(config.workflowDir, clientWf || 'unknown');
      const workflow = wfResult.success ? wfResult.value : null;

      let status: string;
      if (clientBcp) {
        status = 'blocked';
      } else {
        status = 'active';
      }

      const traceEvents = config.traceStore ? config.traceStore.getEvents(clientSid) : [];
      const completedActivities: string[] = [];
      const activitySet = new Set<string>();
      for (const event of traceEvents) {
        if (event.name === 'next_activity' && event.act && event.s === 'ok') {
          if (!activitySet.has(event.act)) {
            activitySet.add(event.act);
            completedActivities.push(event.act);
          }
        }
      }

      const lastCheckpoint = traceEvents
        .filter(e => e.name === 'respond_checkpoint' && e.s === 'ok')
        .pop();

      const response: Record<string, unknown> = {
        status,
        current_activity: clientAct || 'none',
        completed_activities: completedActivities,
        workflow: workflow ? {
          id: workflow.id,
          version: workflow.version,
          title: workflow.title,
        } : { id: clientWf },
      };

      if (token.psid) {
        response['parent'] = {
          session_id: token.psid,
          workflow_id: token.pwf,
          activity: token.pact,
          version: token.pv,
        };
      }

      if (lastCheckpoint) {
        response['last_checkpoint'] = {
          activity_id: lastCheckpoint.act,
          timestamp: lastCheckpoint.ts,
        };
      }

      const advancedToken = await advanceToken(session_token);
      response['session_token'] = advancedToken;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_token: advancedToken },
      };
    }, traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));
}
