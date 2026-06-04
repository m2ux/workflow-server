import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getActivity, getCheckpoint, readActivityRaw, readWorkflowRaw } from '../loaders/workflow-loader.js';
import { readTechniqueRaw, resolveTechniques, formatTechniqueBundle } from '../loaders/technique-loader.js';
import { CORE_ORCHESTRATOR_TECHNIQUES, CORE_WORKER_TECHNIQUES } from '../loaders/core-ops.js';
import { readResourceRaw } from '../loaders/resource-loader.js';
import { withAuditLog } from '../logging.js';
import { encodeToon } from '../utils/toon.js';
import {
  sessionIndexParam,
  assertNoActiveCheckpoint,
  loadSessionForTool,
  advanceSession,
  saveSessionForTool,
  sessionView,
  describeSessionStoreError,
  SessionStoreError,
} from '../utils/session/index.js';
import { buildValidation, validateWorkflowVersion, validateActivityTransition, validateStepManifest, validateTransitionCondition, validateActivityManifest } from '../utils/validation.js';
import type { StepManifestEntry, ActivityManifestEntry } from '../utils/validation.js';
import { createTraceToken, decodeTraceToken } from '../trace.js';
import type { TraceEvent, TraceTokenPayload } from '../trace.js';

const stepManifestSchema = z.array(z.object({
  step_id: z.string(),
  output: z.string(),
})).optional().describe('Array of completed-step entries from the previous activity, e.g. [{"step_id":"detect-review-mode","output":"is_review_mode=false"}]. Each entry has two string fields: step_id (the literal id from the activity\'s steps[] — note the field is step_id, not id) and output (a short summary). Omit the parameter entirely when no steps ran; do not pass an empty array or empty string.');

const activityManifestSchema = z.array(z.object({
  activity_id: z.string(),
  outcome: z.string(),
  transition_condition: z.string().optional(),
})).optional().describe('Activity completion manifest from the orchestrator. Reports the sequence of activities completed so far with outcomes and transition conditions.');

/**
 * Wrap a tool handler so any thrown `SessionStoreError` is re-thrown with a
 * user-facing message. Keeps the per-handler logic terse — handlers can
 * assume `loadSessionForTool` succeeded or surface a clear error.
 */
function withSessionStoreErrors<T extends Record<string, unknown>, R>(
  handler: (args: T) => Promise<R>,
): (args: T) => Promise<R> {
  return async (args: T) => {
    try {
      return await handler(args);
    } catch (err) {
      if (err instanceof SessionStoreError) {
        throw new Error(describeSessionStoreError(err));
      }
      throw err;
    }
  };
}


export function registerWorkflowTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  server.tool('discover', 'Entry point for this server. Call this before any other tool to learn the bootstrap procedure for starting a session. Returns the server name, version, and the bootstrap guide explaining the full tool-calling sequence. Use list_workflows to discover available workflows. No parameters required and no session_index needed.', {},
    withAuditLog('discover', async () => {
      const bootstrapResult = await readResourceRaw(config.workflowDir, 'meta', 'bootstrap-protocol');
      const lines = [
        `server: ${config.serverName}`,
        `version: ${config.serverVersion}`,
      ];
      if (bootstrapResult.success) {
        lines.push('', bootstrapResult.value.content);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    }));

  server.tool('list_workflows', 'List all available workflow definitions with their ID, title, version, and tags. Use this when you need to discover or filter available workflows. Returns an array of workflow summaries with tag-based categorization. Does not require a session_index.', {},
    withAuditLog('list_workflows', async () => ({
      content: [{ type: 'text' as const, text: encodeToon(await listWorkflows(config.workflowDir)) }],
    })));

  server.tool('get_workflow', 'Load the workflow definition for the current session. The response begins with the workflow\'s primary technique (raw TOON), followed by the workflow definition. Use summary=true (the default) to get lightweight metadata including rules, variables, orchestration model, the initialActivity field (which activity to load first), and a stub list of all activities with their IDs and names. Use summary=false for the raw workflow definition in TOON format. Call this after start_session to learn the workflow structure — the initialActivity field in the response tells you which activity_id to pass to your first next_activity call. This is the only tool that provides initialActivity.',
    {
      ...sessionIndexParam,
      summary: z.boolean().optional().default(true).describe('Returns lightweight summary by default. Set to false for the raw workflow definition.'),
    },
    withAuditLog('get_workflow', withSessionStoreErrors(async ({ session_index, summary }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;

      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const wf = result.value;

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wf),
      );

      // Advance state (bump seq+ts) and persist before returning.
      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

      const primaryTechniqueId = wf.techniques?.primary;
      let primaryTechniqueContent = '';
      if (primaryTechniqueId) {
        const techniqueResult = await readTechniqueRaw(primaryTechniqueId, config.workflowDir, workflow_id);
        if (techniqueResult.success) {
          primaryTechniqueContent = techniqueResult.value;
        }
      }

      // Bundle operations: workflow.operations + core orchestrator ops.
      // Deduplicate by ref so a workflow that explicitly lists a core op only resolves it once.
      const wfTech = (wf as { techniques?: { primary?: string; supporting?: string[] } }).techniques;
      const wfTechRefs = [...(wfTech?.primary ? [wfTech.primary] : []), ...(wfTech?.supporting ?? [])];
      const declaredOps = (wf as { operations?: string[] }).operations ?? [];
      const orchestratorOps = Array.from(new Set([...wfTechRefs, ...declaredOps, ...CORE_ORCHESTRATOR_TECHNIQUES]));
      const resolvedOps = await resolveTechniques(orchestratorOps, config.workflowDir, workflow_id);
      const opsBlock = encodeToon(formatTechniqueBundle(resolvedOps));

      // Pre-separator preamble holds the legacy primary-technique body (when present)
      // followed by the resolved-operations bundle. Tests and clients split on
      // the first '\n\n---\n\n' to recover the workflow section, so we keep
      // that single separator and concatenate technique + ops before it.
      const preambleParts = [primaryTechniqueContent, opsBlock].filter(s => s.length > 0);
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
          activities: wf.activities?.map((a: { id: string; name?: string; required?: boolean; artifactPrefix?: string | undefined }) => ({ id: a.id, name: a.name, required: a.required, artifactPrefix: a.artifactPrefix })) ?? [],
          session_index,
        };

        return {
          content: [{ type: 'text' as const, text: preamble + encodeToon(summaryData) }],
          _meta: { session_index, validation },
        };
      } else {
        const rawResult = await readWorkflowRaw(config.workflowDir, workflow_id);
        if (!rawResult.success) throw rawResult.error;

        return {
          content: [{ type: 'text' as const, text: preamble + `session_index: ${session_index}\n\n${rawResult.value}` }],
          _meta: { session_index, validation },
        };
      }
    }), traceOpts));

  server.tool('next_activity', 'Transition to the specified activity. This is the orchestrator\'s tool for advancing the workflow — it validates the transition, advances the session state on disk, and records the trace, but does NOT return the activity definition. After calling next_activity, the worker should call get_activity to load the complete activity definition including steps, checkpoints, transitions, and technique references. For the first call, use the initialActivity value from get_workflow. For subsequent calls, use the activity IDs from the transitions field of the current activity\'s response. Optionally include a step_manifest summarizing completed steps and a transition_condition to enable server-side validation.',
    {
      ...sessionIndexParam,
      activity_id: z.string().describe('Activity ID to transition to. For the first call, use initialActivity from get_workflow. For subsequent calls, use an activity ID from the transitions field of the current activity.'),
      transition_condition: z.string().optional().describe('The transition condition that led to this activity (from the transitions field of the previous activity). Enables server-side validation of condition-activity consistency.'),
      step_manifest: stepManifestSchema,
      activity_manifest: activityManifestSchema,
    },
    withAuditLog('next_activity', withSessionStoreErrors(async ({ session_index, activity_id, transition_condition, step_manifest, activity_manifest }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;

      const workflow_id = state.workflowId;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      if (state.activeCheckpoint) {
        throw new Error(
          `Cannot transition to '${activity_id}': Active checkpoint '${state.activeCheckpoint.checkpointId}' ` +
          `on activity '${state.activeCheckpoint.activityId}'. The orchestrator must resolve it by calling respond_checkpoint.`
        );
      }
      const activity = getActivity(result.value, activity_id);
      if (!activity) throw new Error(`Activity not found: ${activity_id}`);

      const view = sessionView(state);
      const manifestWarnings: (string | null)[] = [];
      if (step_manifest && state.currentActivity) {
        const mw = validateStepManifest(step_manifest as StepManifestEntry[], result.value, state.currentActivity);
        manifestWarnings.push(...mw);
      } else if (!step_manifest && state.currentActivity) {
        manifestWarnings.push(`No step_manifest provided for previous activity '${state.currentActivity}'. Include a manifest to enable step completion validation.`);
      }

      const condWarning = (transition_condition !== undefined && state.currentActivity)
        ? validateTransitionCondition(view, result.value, activity_id, transition_condition)
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
        validateActivityTransition(view, result.value, activity_id),
        validateWorkflowVersion(view, result.value),
        condWarning,
        ...manifestWarnings,
        ...activityManifestWarnings,
      );

      const next = advanceSession(state, (draft) => {
        const now = new Date().toISOString();
        // Exit-prior: any non-empty previous activity is recorded as
        // completed once we transition off it.
        if (draft.currentActivity) {
          draft.history.push({ timestamp: now, type: 'activity_exited', activity: draft.currentActivity });
          if (!draft.completedActivities.includes(draft.currentActivity)) {
            draft.completedActivities.push(draft.currentActivity);
          }
        }
        draft.currentActivity = activity_id;
        draft.condition = transition_condition ?? '';
        delete draft.activeCheckpoint;
        draft.history.push({ timestamp: now, type: 'activity_entered', activity: activity_id });
        // Terminal-state transition emits a workflow_completed event and
        // flips status. The activity id 'complete' is the canonical terminal
        // marker across the work-package, prism, and meta workflows.
        if (activity_id === 'complete') {
          draft.history.push({ timestamp: now, type: 'workflow_completed' });
          draft.status = 'completed';
        }
      });
      await saveSessionForTool(loaded, next);

      // If this child just reached its terminal activity, notify the parent
      // (if any) so the parent's `triggeredWorkflows[i].status` flips from
      // `running` to `completed`. Persistent-parent only — transient parents
      // were already discarded when the child captured them. Best-effort.
      if (activity_id === 'complete' && state.parentSession?.sessionIndex) {
        const parentIdx = state.parentSession.sessionIndex;
        try {
          const parentLoaded = await loadSessionForTool(config.workspaceDir, parentIdx);
          const completedAt = new Date().toISOString();
          const parentNext = advanceSession(parentLoaded.state, (draft) => {
            const ref = draft.triggeredWorkflows.find((t) => t.sessionIndex === state.sessionIndex);
            if (ref && ref.status === 'running') {
              ref.status = 'completed';
              ref.completedAt = completedAt;
              draft.history.push({
                timestamp: completedAt,
                type: 'workflow_returned',
                data: { sessionIndex: state.sessionIndex, workflowId: state.workflowId },
              });
            }
          });
          await saveSessionForTool(parentLoaded, parentNext);
        } catch {
          // Parent may have been a transient and discarded long ago, or its
          // folder may have moved. Don't fail the child's completion.
        }
      }

      const meta: Record<string, unknown> = { session_index, validation };

      if (config.traceStore) {
        const segment = config.traceStore.getSegmentAndAdvanceCursor(state.sessionIndex);
        if (segment.events.length > 0) {
          const firstEvent = segment.events[0];
          const lastEvent = segment.events[segment.events.length - 1];
          const payload: TraceTokenPayload = {
            sid: state.sessionIndex,
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
        session_index,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
        _meta: meta,
      };
    }), traceOpts));

  server.tool('get_activity', 'Load the complete activity definition for the current activity in the session. This is the worker\'s tool for retrieving the full activity details after the orchestrator has called next_activity to transition. Returns the complete activity definition including all steps, checkpoints, transitions to subsequent activities, mode overrides, rules, and technique references — everything needed to execute the activity. The activity is determined from the session state on disk, so no activity_id parameter is needed.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('get_activity', withSessionStoreErrors(async ({ session_index }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);

      const activity_id = state.currentActivity;
      if (!activity_id) {
        throw new Error('No current activity in session state. Call next_activity first.');
      }

      const workflow_id = state.workflowId;
      const rawResult = await readActivityRaw(config.workflowDir, workflow_id, activity_id);
      if (!rawResult.success) throw new Error(`Activity not found: ${activity_id}`);

      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

      const view = sessionView(state);
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      const validation = buildValidation(
        result.success ? validateWorkflowVersion(view, result.value) : null,
      );

      // Bundle techniques the activity references (primary + supporting — delivered
      // as full protocols), the legacy operations[] (transitional alias), and core
      // worker techniques. supporting[] is now the primary delivery declaration.
      const activity = result.success ? getActivity(result.value, activity_id) : undefined;
      const actTech = (activity as { techniques?: { primary?: string; supporting?: string[] } } | undefined)?.techniques;
      const techRefs = [...(actTech?.primary ? [actTech.primary] : []), ...(actTech?.supporting ?? [])];
      const declaredOps = (activity as { operations?: string[] } | undefined)?.operations ?? [];
      const workerOps = Array.from(new Set([...techRefs, ...declaredOps, ...CORE_WORKER_TECHNIQUES]));
      const resolvedOps = await resolveTechniques(workerOps, config.workflowDir, workflow_id);
      const opsSection = encodeToon(formatTechniqueBundle(resolvedOps)) + '\n\n---\n\n';

      // artifactPrefix is server-computed from the activity filename and is NOT in
      // the raw activity TOON, so surface it in the header (and _meta) — the worker
      // needs it to name artifacts as {artifactPrefix}-{bare_filename}.
      const artifactPrefix = (activity as { artifactPrefix?: string } | undefined)?.artifactPrefix;
      const header = artifactPrefix
        ? `session_index: ${session_index}\nartifact_prefix: ${artifactPrefix}`
        : `session_index: ${session_index}`;

      return {
        content: [{ type: 'text' as const, text: `${opsSection}${header}\n\n${rawResult.value}` }],
        _meta: { session_index, validation, artifact_prefix: artifactPrefix },
      };
    }), traceOpts));

  server.tool('yield_checkpoint', 'Yield execution to the orchestrator at a checkpoint. Call this tool when you encounter a checkpoint step during activity execution. It records the checkpoint as active in the session state and returns the session_index, which the worker yields back to the orchestrator via a <checkpoint_yield> block.',
    {
      ...sessionIndexParam,
      checkpoint_id: z.string().describe('The ID of the checkpoint being yielded.'),
    },
    withAuditLog('yield_checkpoint', withSessionStoreErrors(async ({ session_index, checkpoint_id }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;

      if (state.activeCheckpoint) {
        throw new Error(`Cannot yield checkpoint '${checkpoint_id}': Checkpoint '${state.activeCheckpoint.checkpointId}' is already active and awaiting orchestrator resolution.`);
      }

      const workflow_id = state.workflowId;
      const activity_id = state.currentActivity;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const checkpoint = getCheckpoint(result.value, activity_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id} in activity ${activity_id}`);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
      );

      const yieldedAt = new Date().toISOString();
      const next = advanceSession(state, (draft) => {
        draft.activeCheckpoint = {
          checkpointId: checkpoint_id,
          activityId: activity_id,
          yieldedAt,
        };
        draft.history.push({
          timestamp: yieldedAt,
          type: 'checkpoint_reached',
          activity: activity_id,
          checkpoint: checkpoint_id,
        });
      });
      await saveSessionForTool(loaded, next);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'yielded',
          checkpoint_id,
          session_index,
          message: `Checkpoint '${checkpoint_id}' successfully yielded. Yield this session_index to the orchestrator using a <checkpoint_yield> block, then STOP execution and wait to be resumed.`
        }, null, 2) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('resume_checkpoint', 'Resume execution after the orchestrator resolves a checkpoint. Call this tool when the orchestrator resumes you with a checkpoint response. It verifies the checkpoint was resolved (no activeCheckpoint in state) and returns any variable updates you need to apply to your state.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('resume_checkpoint', withSessionStoreErrors(async ({ session_index }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;

      if (state.activeCheckpoint) {
        throw new Error(`Cannot resume: Checkpoint '${state.activeCheckpoint.checkpointId}' is still active and has not been resolved by the orchestrator.`);
      }

      const validation = buildValidation();
      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

      // Note: The orchestrator passes variable effects directly in its prompt when resuming the worker.
      // This tool exists to verify the lock is cleared and advance the session sequence.
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'resumed',
          session_index,
          message: `Checkpoint cleared. You may proceed to the next step. Note any variable updates provided by the orchestrator.`
        }, null, 2) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('present_checkpoint', 'Load the full details of the currently-active checkpoint for the session. Returns the checkpoint definition including its message, user-facing options (with labels, descriptions, and effects like variable assignments), and any auto-advance configuration. Use this when you need to present a checkpoint interaction to the user based on a worker\'s yield. Reads the active checkpoint from state.activeCheckpoint — no separate checkpoint handle is needed.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('present_checkpoint', withSessionStoreErrors(async ({ session_index }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;

      const active = state.activeCheckpoint;
      if (!active) {
        throw new Error(
          `present_checkpoint: no active checkpoint on session '${session_index}'. The worker must yield a checkpoint via yield_checkpoint before the orchestrator can present it.`,
        );
      }

      const workflow_id = state.workflowId;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, active.activityId, active.checkpointId);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${active.checkpointId} in activity ${active.activityId}`);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
      );

      return {
        content: [{ type: 'text' as const, text: encodeToon({ ...checkpoint, session_index }) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  const MIN_RESPONSE_SECONDS = config.minCheckpointResponseSeconds ?? 3;

  server.tool('respond_checkpoint',
    'Submit a checkpoint response to clear the active-checkpoint gate. *MUST* present the checkpoint to the user and wait for their input. ' +
    'Exactly one of option_id, auto_advance, or condition_not_met must be provided. ' +
    'option_id: the user\'s selected option (works for all checkpoint types, enforces minimum response time). ' +
    'auto_advance: use the checkpoint\'s defaultOption (only for checkpoints with autoAdvanceMs; the server enforces the full timer). ' +
    'condition_not_met: dismiss a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a condition field). ' +
    'Reads the active checkpoint from state.activeCheckpoint — no separate checkpoint handle is needed.',
    {
      ...sessionIndexParam,
      option_id: z.string().optional().describe('The option ID selected by the user. Must match one of the checkpoint\'s defined options.'),
      auto_advance: z.boolean().optional().describe('Set to true to auto-advance a checkpoint using its defaultOption. Only valid for checkpoints with defaultOption and autoAdvanceMs. The server enforces the autoAdvanceMs timer. If you use auto_advance, present a message to the user that you are proceeding with the default option because no input was provided.'),
      condition_not_met: z.boolean().optional().describe('Set to true to dismiss a conditional checkpoint whose condition was not met. Only valid for checkpoints that have a condition field.'),
    },
    withAuditLog('respond_checkpoint', withSessionStoreErrors(async ({ session_index, option_id, auto_advance, condition_not_met }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      const active = state.activeCheckpoint;
      if (!active) {
        throw new Error(
          `respond_checkpoint: no active checkpoint on session '${session_index}'. The worker must yield a checkpoint via yield_checkpoint before the orchestrator can respond to it.`,
        );
      }
      const checkpoint_id = active.checkpointId;

      const modeCount = [option_id, auto_advance, condition_not_met].filter(v => v !== undefined).length;
      if (modeCount !== 1) {
        throw new Error('Exactly one of option_id, auto_advance, or condition_not_met must be provided.');
      }

      const result = await loadWorkflow(config.workflowDir, state.workflowId);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, active.activityId, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint definition not found: ${checkpoint_id} in activity ${active.activityId}`);

      const now = Math.floor(Date.now() / 1000);
      // Time since the checkpoint was yielded (recorded on activeCheckpoint).
      const yieldedAtSeconds = Math.floor(new Date(active.yieldedAt).getTime() / 1000);
      const elapsed = now - yieldedAtSeconds;
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

      const next = advanceSession(state, (draft) => {
        delete draft.activeCheckpoint;
        const recordKey = `${active.activityId}-${checkpoint_id}`;
        const respondedAt = new Date(now * 1000).toISOString();
        // CheckpointResponseSchema requires `optionId` + `respondedAt`; for
        // `condition_not_met` dismissals we still record the resolution with
        // a sentinel option id so the on-disk schema stays valid.
        const recordedOptionId = resolvedOptionId ?? (condition_not_met ? '__condition_not_met__' : '__unknown__');
        // Unwrap the TOON effect into the schema-flat shape:
        // TOON gives { setVariable: {...}, transitionTo: '...', skipActivities: [...] };
        // the schema stores variablesSet / transitionedTo / activitiesSkipped.
        const effectObj = effect as undefined | { setVariable?: Record<string, unknown>; transitionTo?: string; skipActivities?: string[] };
        const variablesSet = effectObj?.setVariable;
        const transitionedTo = effectObj?.transitionTo;
        const activitiesSkipped = effectObj?.skipActivities;
        const record: { optionId: string; respondedAt: string; effects?: { variablesSet?: Record<string, unknown>; transitionedTo?: string; activitiesSkipped?: string[] } } = {
          optionId: recordedOptionId,
          respondedAt,
        };
        if (variablesSet || transitionedTo || activitiesSkipped) {
          record.effects = {};
          if (variablesSet) record.effects.variablesSet = variablesSet;
          if (transitionedTo) record.effects.transitionedTo = transitionedTo;
          if (activitiesSkipped) record.effects.activitiesSkipped = activitiesSkipped;
        }
        draft.checkpointResponses = { ...(draft.checkpointResponses ?? {}), [recordKey]: record };
        draft.history.push({
          timestamp: respondedAt,
          type: 'checkpoint_response',
          activity: active.activityId,
          checkpoint: checkpoint_id,
          data: { optionId: recordedOptionId },
        });
        // Apply variable assignments to the rolled-up bag.
        if (variablesSet) {
          for (const [name, value] of Object.entries(variablesSet)) {
            draft.variables[name] = value;
            draft.history.push({
              timestamp: respondedAt,
              type: 'variable_set',
              activity: active.activityId,
              data: { name, value },
            });
          }
        }
        // Apply explicitly-skipped activities to the bookkeeping array.
        if (activitiesSkipped) {
          for (const id of activitiesSkipped) {
            if (!draft.skippedActivities.includes(id)) {
              draft.skippedActivities.push(id);
              draft.history.push({
                timestamp: respondedAt,
                type: 'activity_skipped',
                activity: id,
              });
            }
          }
        }
      });
      await saveSessionForTool(loaded, next);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
      );

      const responseData: Record<string, unknown> = {
        checkpoint_id,
        resolved: true,
        session_index,
      };
      if (resolvedOptionId !== undefined) responseData['resolved_option'] = resolvedOptionId;
      if (effect !== undefined) responseData['effect'] = effect;
      if (condition_not_met) responseData['dismissed'] = true;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('get_trace', 'Retrieve the execution trace for the current workflow session. Accepts an optional array of trace_tokens accumulated from next_activity _meta.trace_token responses to reconstruct a specific trace segment. If no trace_tokens are provided, returns the full in-memory trace for the current session (requires server-side tracing to be enabled). Use this for debugging, auditing, or reviewing the sequence of tool calls made during the session.',
    {
      ...sessionIndexParam,
      trace_tokens: z.array(z.string()).optional().describe('Accumulated trace tokens from next_activity _meta.trace_token responses. If not provided, returns the full in-memory trace for the current session.'),
    },
    withAuditLog('get_trace', withSessionStoreErrors(async ({ session_index, trace_tokens }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

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
        const result: Record<string, unknown> = { traceId: state.sessionIndex, source: 'tokens', event_count: allEvents.length, events: allEvents, session_index };
        if (errors.length > 0) result['token_errors'] = errors;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          _meta: { session_index, validation: buildValidation() },
        };
      }

      if (!config.traceStore) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ traceId: state.sessionIndex, source: 'memory', tracing_enabled: false, event_count: 0, events: [], session_index }, null, 2) }],
          _meta: { session_index, validation: buildValidation() },
        };
      }

      const events = config.traceStore.getEvents(state.sessionIndex);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ traceId: state.sessionIndex, source: 'memory', tracing_enabled: true, event_count: events.length, events, session_index }, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));

  server.tool('health_check', 'Check server health and availability. Returns server status, name, version, number of available workflows, and uptime in seconds. Does not require a session_index. Use this to verify the server is running before starting a workflow.', {},
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
    'completed activities trace, last checkpoint info, and parent context if nested. Requires a session_index.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('get_workflow_status', withSessionStoreErrors(async ({ session_index }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      const clientWf = state.workflowId;
      const clientAct = state.currentActivity;
      const clientActive = state.activeCheckpoint;

      const wfResult = await loadWorkflow(config.workflowDir, clientWf || 'unknown');
      const workflow = wfResult.success ? wfResult.value : null;

      let status: string;
      if (clientActive) {
        status = 'blocked';
      } else {
        status = 'active';
      }

      const traceEvents = config.traceStore ? config.traceStore.getEvents(state.sessionIndex) : [];

      // Completed activities come from authoritative session state (the trace
      // store may be disabled). Fall back to trace-derived only if state is empty.
      let completedActivities: string[] = Array.isArray(state.completedActivities) ? [...state.completedActivities] : [];
      if (completedActivities.length === 0 && traceEvents.length > 0) {
        const activitySet = new Set<string>();
        for (const event of traceEvents) {
          if (event.name === 'next_activity' && event.act && event.s === 'ok' && !activitySet.has(event.act)) {
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
        // Rolled-up variable bag from session state, so workers/orchestrators can
        // read decisions and computed values on resume without re-deriving them.
        variables: state.variables ?? {},
        workflow: workflow ? {
          id: workflow.id,
          version: workflow.version,
          title: workflow.title,
        } : { id: clientWf },
      };

      if (state.parentSession) {
        response['parent'] = {
          session_index: state.parentSession.sessionIndex,
          workflow_id: state.parentSession.workflowId,
          activity: state.parentSession.currentActivity,
          version: state.parentSession.workflowVersion,
        };
      }

      if (lastCheckpoint) {
        response['last_checkpoint'] = {
          activity_id: lastCheckpoint.act,
          timestamp: lastCheckpoint.ts,
        };
      }

      // get_workflow_status reads but does not advance — keep the on-disk state stable.
      response['session_index'] = session_index;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));
}
