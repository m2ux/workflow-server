import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { DEFAULT_BUNDLE_HEADROOM_FRACTION, DEFAULT_BUNDLE_CHARS_PER_TOKEN } from '../config.js';
import { listWorkflows, listWorkflowsWithDiagnostics, loadWorkflow, loadWorkflowWithDiagnostics, getActivity, getCheckpoint, readActivityRaw, buildFragmentsLookup, TERMINAL_SENTINEL } from '../loaders/workflow-loader.js';
import { injectCheckpointFragmentBodies, resolveCheckpointFragment, scanCheckpointRefLines } from '../loaders/fragment-resolver.js';
import { resolveTechniques, formatTechniqueBundle, composeActivityTechnique, projectTechnique, projectTechniqueToYaml } from '../loaders/technique-loader.js';
import { CORE_ORCHESTRATOR_TECHNIQUES, CORE_WORKER_TECHNIQUES } from '../loaders/core-ops.js';
import { readResourceRaw } from '../loaders/resource-loader.js';
import { injectResolvedStepIds, techniqueName, flattenActivitySteps, type Activity, type Step } from '../schema/activity.schema.js';
import { buildProvenanceContext, decorateTechniqueProvenance } from '../utils/binding-provenance.js';
import { withAuditLog, logWarn } from '../logging.js';
import { jsonTypeOf, isTemplateReference } from '../utils/variable-seed.js';
import { stringifyForResponse } from '../utils/serialization.js';
import { contentHash, deliveredHash, recordDeliveries, unchangedMarker } from '../utils/delivery.js';
import {
  sessionIndexParam,
  contextTokensParam,
  assertNoActiveCheckpoint,
  loadSessionForTool,
  advanceSession,
  saveSessionForTool,
  sessionView,
  navigatePath,
  describeSessionStoreError,
  SessionStoreError,
} from '../utils/session/index.js';
import type { SessionFile } from '../schema/session.schema.js';
import { buildValidation, validateWorkflowVersion, validateActivityTransition, validateStepManifest, validateTechniqueFetches, validateTransitionCondition, validateActivityManifest } from '../utils/validation.js';
import type { StepManifestEntry, ActivityManifestEntry } from '../utils/validation.js';
import { createTraceToken, decodeTraceToken } from '../trace.js';
import type { TraceEvent, TraceTokenPayload } from '../trace.js';

const stepManifestSchema = z.array(z.object({
  step_id: z.string(),
  output: z.string(),
})).optional().describe('Array of completed-step entries from the previous activity, e.g. [{"step_id":"detect-review-mode","output":"is_review_mode=false"}]. Each entry has two string fields: step_id (the literal id from the activity\'s steps[] — note the field is step_id, not id) and output. output is a short summary of what the step produced; for a step with more than one declared output, report a JSON object keyed by output id, e.g. {"step_id":"resolve-reference","output":"{\\"reference_path\\":\\"lib/x\\",\\"component_name\\":\\"x\\"}"}. Omit the parameter entirely when no steps ran; do not pass an empty array or empty string.');

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

/**
 * Compose an activity's artifact contract from the `## Outputs` of the techniques its steps bind.
 * Activities no longer declare `artifacts[]`; the contract IS the union of the per-step techniques'
 * declared output artifacts — each output's `#### artifact` filename — deduped by filename in step
 * order. The technique `## Outputs` is the single source of truth for artifact identity (AP-43/65);
 * this synthesizes the activity-level view the worker reads, so it can never drift from the steps.
 */
type StepLike = { technique?: unknown; steps?: unknown[] };

export async function composeActivityArtifacts(
  activity: { steps?: Array<StepLike> } | undefined,
  workflowDir: string,
  workflowId: string,
  activityId?: string,
): Promise<Array<{ id: string; name: string }>> {
  if (!activity) return [];
  const refs = new Set<string>();
  const collect = (steps?: Array<StepLike>): void => {
    for (const s of steps ?? []) {
      const n = techniqueName(s.technique as Parameters<typeof techniqueName>[0]);
      if (n) refs.add(n);
      if (Array.isArray(s.steps)) collect(s.steps as Array<StepLike>); // loop-kind nested body
    }
  };
  collect(activity.steps);
  if (refs.size === 0) return [];
  // Resolve like get_technique: a bare op may be activity-group shorthand (`<activityId>::<op>`), so
  // try the activity-named-group form too. resolveTechniques returns type 'not-found' for a candidate
  // that doesn't exist, so passing both forms is safe.
  const candidates = new Set<string>();
  for (const r of refs) {
    candidates.add(r);
    if (activityId && !r.includes('::')) candidates.add(`${activityId}::${r}`);
  }
  const resolved = await resolveTechniques([...candidates], workflowDir, workflowId);
  const artifacts: Array<{ id: string; name: string }> = [];
  const seen = new Set<string>();
  for (const t of resolved) {
    if (t.type !== 'technique') continue;
    const outputs = (t.body as { outputs?: Array<{ id?: string; artifact?: { name?: string } }> } | undefined)?.outputs ?? [];
    for (const o of outputs) {
      const name = o.artifact?.name;
      if (name && !seen.has(name)) { seen.add(name); artifacts.push({ id: o.id ?? name, name }); }
    }
  }
  return artifacts;
}


// ─── inspect_session projections ────────────────────────────────────────────
//
// Pure, session-I/O-free projections of a loaded `SessionFile`, ported verbatim
// from the reference implementation `scripts/inspect_session.py` (the normative
// output contract). Each view returns a compact structured slice — never the raw
// session file, which accretes unbounded `history` and `deliveredContent`. Keeping
// these pure lets the parity test drive them directly against the reference script.

/** The views `inspect_session` can project. `summary` is the default composite. */
export const INSPECT_SESSION_VIEWS = [
  'summary', 'identity', 'variables', 'checkpoints', 'activities', 'history', 'children',
] as const;
export type InspectSessionView = (typeof INSPECT_SESSION_VIEWS)[number];

/**
 * History event types surfaced as `milestones` — the six the reference script
 * lists: activity entry/exit, checkpoint reach/response, and child
 * triggered/completed. All other events contribute only to the `byType` tally.
 */
const HISTORY_MILESTONE_TYPES = new Set([
  'activity_entered', 'activity_exited',
  'checkpoint_reached', 'checkpoint_response',
  'workflow_triggered', 'workflow_completed',
]);

/** Identity projection: the stable header fields identifying the session. */
export function projectIdentity(s: SessionFile): Record<string, unknown> {
  return {
    workflowId: s.workflowId,
    workflowVersion: s.workflowVersion,
    sessionIndex: s.sessionIndex,
    agentId: s.agentId,
    status: s.status,
    currentActivity: s.currentActivity,
    currentTechnique: s.currentTechnique,
    startedAt: s.startedAt,
    seq: s.seq,
  };
}

/** Checkpoint projection: each response reduced to option, timestamp, and any variables it set. */
export function projectCheckpoints(s: SessionFile): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [cid, resp] of Object.entries(s.checkpointResponses ?? {})) {
    out[cid] = {
      optionId: resp.optionId,
      respondedAt: resp.respondedAt,
      variablesSet: resp.effects?.variablesSet ?? {},
    };
  }
  return out;
}

/** Activity projection: completed / skipped lists plus the current activity. */
export function projectActivities(s: SessionFile): Record<string, unknown> {
  return {
    completed: s.completedActivities ?? [],
    skipped: s.skippedActivities ?? [],
    current: s.currentActivity,
  };
}

/**
 * History projection: total event count, a per-type tally, and the milestone
 * sub-sequence (each milestone carries only its non-empty type/activity/checkpoint
 * keys, matching the reference script's dict comprehension).
 */
export function projectHistory(s: SessionFile): Record<string, unknown> {
  const events = s.history ?? [];
  const byType: Record<string, number> = {};
  const milestones: Array<Record<string, unknown>> = [];
  for (const e of events) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
    if (HISTORY_MILESTONE_TYPES.has(e.type)) {
      const m: Record<string, unknown> = { type: e.type };
      if (e.activity) m['activity'] = e.activity;
      if (e.checkpoint) m['checkpoint'] = e.checkpoint;
      milestones.push(m);
    }
  }
  return { count: events.length, byType, milestones };
}

/**
 * Children digest: one line per `triggeredWorkflows` entry of the addressed
 * session. Positional `index`, the child's own identity, and the running
 * status/activity/completed trace read from its embedded `state`.
 */
export function projectChildren(s: SessionFile): Array<Record<string, unknown>> {
  return (s.triggeredWorkflows ?? []).map((c, i) => {
    const st = c.state;
    return {
      index: i,
      sessionIndex: c.sessionIndex,
      workflowId: c.workflowId,
      status: st?.status,
      currentActivity: st?.currentActivity,
      completed: st?.completedActivities ?? [],
    };
  });
}

/** Summary (default) view: the composite of all projections for the addressed session. */
export function projectSummary(s: SessionFile): Record<string, unknown> {
  return {
    identity: projectIdentity(s),
    activities: projectActivities(s),
    variables: s.variables ?? {},
    checkpoints: projectCheckpoints(s),
    history: projectHistory(s),
    children: projectChildren(s),
  };
}

/**
 * Dispatch a view against the addressed session. For `variables`, an optional
 * `variable` narrows the bag to a single key's value (matching the reference
 * script's `--variable KEY`); otherwise the whole bag is returned.
 */
export function projectSessionView(
  s: SessionFile,
  view: InspectSessionView,
  variable?: string,
): unknown {
  switch (view) {
    case 'identity': return projectIdentity(s);
    case 'variables': {
      const bag = s.variables ?? {};
      return variable ? bag[variable] : bag;
    }
    case 'checkpoints': return projectCheckpoints(s);
    case 'activities': return projectActivities(s);
    case 'history': return projectHistory(s);
    case 'children': return projectChildren(s);
    case 'summary':
    default:
      return projectSummary(s);
  }
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

  server.tool('list_workflows', 'List all available workflow definitions with their ID, title, version, and tags. Use this when you need to discover or filter available workflows. Returns an array of workflow summaries with tag-based categorization. If any workflow definition fails to load (unreadable file or manifest missing id/title/version), the response is instead an object with `workflows` (the loadable entries) and `load_errors` (one entry per failed file). Does not require a session_index.', {},
    withAuditLog('list_workflows', async () => {
      const { workflows, errors } = await listWorkflowsWithDiagnostics(config.workflowDir);
      // Additive shape: the payload stays a plain array unless something failed to load.
      const payload = errors.length > 0 ? { workflows, load_errors: errors } : workflows;
      return { content: [{ type: 'text' as const, text: stringifyForResponse(payload) }] };
    }));

  server.tool('get_workflow', 'Load the workflow definition for the current session. The response begins with the resolved orchestrator technique bundle, then a `---` separator, then lightweight workflow metadata: rules, variables, the initialActivity field (which activity to load first), and a stub list of all activities with their IDs and names. If any activity file failed to load (invalid or unparsable YAML), the response includes `activity_load_errors` listing each failed file with its error — those activities are absent from the activity list. Call this after start_session to learn the workflow structure — the initialActivity field in the response tells you which activity_id to pass to your first next_activity call. This is the only tool that provides initialActivity. The response also carries `planning_folder_path`: the canonical absolute planning folder for this session under THIS server\'s workspace `.engineering` root — bind it as the single artifact location and never recompose it relative to your CWD or the target component repo.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('get_workflow', withSessionStoreErrors(async ({ session_index }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;

      const result = await loadWorkflowWithDiagnostics(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const { workflow: wf, activityLoadErrors } = result.value;

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wf),
      );

      // Advance state (bump seq+ts) and persist before returning.
      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

      // Bundle the workflow's orchestrator-level technique refs (`techniques.workflow`) and the core
      // orchestrator techniques. Deduplicate by ref so a workflow that explicitly lists a core
      // technique resolves it once.
      const wfTechRefs = (wf as { techniques?: { workflow?: string[] } }).techniques?.workflow ?? [];
      const orchestratorTechniques = Array.from(new Set([...wfTechRefs, ...CORE_ORCHESTRATOR_TECHNIQUES]));
      const resolvedOrchestrator = await resolveTechniques(orchestratorTechniques, config.workflowDir, workflow_id);
      const opsBlock = stringifyForResponse(formatTechniqueBundle(resolvedOrchestrator));

      // Pre-separator preamble holds the resolved-operations bundle. Tests and clients split on
      // the first '\n\n---\n\n' to recover the workflow section, so we keep that single separator.
      const preambleParts = [opsBlock].filter(s => s.length > 0);
      const preamble = preambleParts.length > 0 ? preambleParts.join('\n\n') + '\n\n---\n\n' : '';

      // get_workflow returns lightweight metadata for the orchestrator: the technique bundle (above
      // the separator) plus rules, variables, initialActivity, and activity stubs. Per-activity step
      // detail and the worker-facing rules.activity / techniques.activity are delivered via get_activity.
      const summaryData = {
        id: wf.id,
        version: wf.version,
        title: wf.title,
        description: wf.description,
        rules: ((): string[] | undefined => {
          const r = wf.rules as { workflow?: string[]; universal?: string[] } | undefined;
          const orch = [...(r?.workflow ?? []), ...(r?.universal ?? [])];
          return orch.length ? orch : undefined;
        })(),
        variables: wf.variables,
        initialActivity: wf.initialActivity,
        activities: wf.activities?.map((a: { id: string; name?: string; required?: boolean; artifactPrefix?: string | undefined }) => ({ id: a.id, name: a.name, required: a.required, artifactPrefix: a.artifactPrefix })) ?? [],
        // Activity files that failed to load and are missing from `activities` — surfaced here
        // instead of silently skipped, so a broken definition is visible at workflow load rather
        // than as a later "Activity not found". Omitted when every activity loaded.
        activity_load_errors: activityLoadErrors.length > 0 ? activityLoadErrors : undefined,
        session_index,
        // Canonical absolute planning folder for this session, resolved by the
        // server under its own workspace `.engineering` root. This is the single
        // authoritative artifact location — the orchestrator binds
        // `planning_folder_path` from here and never composes it relative to its
        // CWD or the target component repo (which may be a submodule/worktree).
        planning_folder_path: loaded.folderAbsPath,
      };

      return {
        content: [{ type: 'text' as const, text: preamble + stringifyForResponse(summaryData) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('next_activity', 'Transition to the specified activity. This is the orchestrator\'s tool for advancing the workflow — it validates the transition, advances the session state on disk, and records the trace, but does NOT return the activity definition. After calling next_activity, the worker should call get_activity to load the complete activity definition including steps, checkpoints, transitions, and technique references. For the first call, use the initialActivity value from get_workflow. For subsequent calls, use the activity IDs from the transitions field of the current activity\'s response. Optionally include a step_manifest summarizing completed steps and a transition_condition to enable server-side validation. Manifest validation also cross-checks fidelity (warn-only): a manifested technique step with no technique_fetched event recorded during the activity (see get_technique) — and no technique_bundled event from a bundling activity\'s get_activity — draws a warning.',
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
      const isTerminal = activity_id === TERMINAL_SENTINEL;
      const activity = getActivity(result.value, activity_id);
      if (!activity && !isTerminal) throw new Error(`Activity not found: ${activity_id}`);

      const view = sessionView(state);
      const manifestWarnings: (string | null)[] = [];
      if (step_manifest && state.currentActivity) {
        const mw = validateStepManifest(step_manifest as StepManifestEntry[], result.value, state.currentActivity);
        manifestWarnings.push(...mw);
        // Fidelity observability (#166 B8): advisory cross-check of the
        // manifest against the technique_fetched events get_technique
        // recorded into the session history during this activity.
        manifestWarnings.push(...validateTechniqueFetches(step_manifest as StepManifestEntry[], result.value, state.currentActivity, state.history));
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
        // Terminal-state transition emits a workflow_completed event and flips
        // status. The activity id 'complete' is the canonical terminal marker
        // across the work-package, prism, and meta workflows; the TERMINAL_SENTINEL
        // is the contentless terminal reached via an explicit terminal transition.
        if (activity_id === 'complete' || isTerminal) {
          draft.history.push({ timestamp: now, type: 'workflow_completed' });
          draft.status = 'completed';
        }
      });
      await saveSessionForTool(loaded, next);

      // If this child just reached its terminal activity, notify the parent
      // (if any) so the parent's `triggeredWorkflows[i].status` flips from
      // `running` to `completed`. Persistent-parent only — transient parents
      // were already discarded when the child captured them. Best-effort.
      if ((activity_id === 'complete' || isTerminal) && state.parentSession?.sessionIndex) {
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
        name: activity ? activity.name : 'Workflow Complete',
        session_index,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
        _meta: meta,
      };
    }), traceOpts));

  server.tool('get_activity', 'Load the complete activity definition for the current activity in the session. This is the worker\'s tool for retrieving the full activity details after the orchestrator has called next_activity to transition. Returns the complete activity definition including all steps, checkpoints, transitions to subsequent activities, rules, and technique references — everything needed to execute the activity. The activity is determined from the session state on disk, so no activity_id parameter is needed. context_tokens is REQUIRED — the worker declares its own context window; the server derives an eager step-technique bundling budget from it (availability headroom × a token→char factor, both server config) and inlines the activity\'s ungated step-bound techniques that fit, in document order, under that budget. When reference delivery is active (session context_mode "persistent" or bundle: "reference"), inherited techniques/rules content already delivered to this session+agent arrives as short { delivery: "unchanged", content_hash } markers instead of being repeated; bundle: "full" forces full delivery. Eligible ungated step-bound techniques are inlined corpus-wide under a step_techniques map (keyed by step id, each entry a discrete ▼ STEP block identical to a get_technique { step_id } fetch — engage those steps in order without refetching); gated steps and any technique that would overflow the derived budget (or a per-activity bundleTechniques.maxChars size cap; maxChars 0 opts the activity out) stay lazy and still require get_technique. Bundled deliveries are recorded as technique_bundled history events and count as fetch coverage for next_activity\'s manifest fidelity check.',
    {
      ...sessionIndexParam,
      ...contextTokensParam,
      bundle: z.enum(['reference', 'full']).optional().describe('Optional delivery-mode override for the inherited techniques/rules bundle. "reference" replaces bundle content already delivered to this session+agent with short { delivery: "unchanged", content_hash } markers — only correct when THIS calling context received the earlier deliveries. "full" forces full delivery. Defaults from the session\'s context_mode ("persistent" → reference, otherwise full).'),
    },
    withAuditLog('get_activity', withSessionStoreErrors(async ({ session_index, context_tokens, bundle }) => {
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
      const { content: rawActivity, sourceWorkflowId } = rawResult.value;
      let activityBody = injectResolvedStepIds(rawActivity);

      // Materialize checkpoint fragment refs in the delivered YAML (#166 B10): the worker reads
      // full checkpoint bodies, never a reference. Bare refs resolve against the activity file's
      // SOURCE workflow (which differs from workflow_id for a borrowed activity). The textual
      // pre-scan keeps ref-free activities (the common case) off the resolution path entirely.
      const fragmentRefs = scanCheckpointRefLines(rawActivity);
      if (fragmentRefs.length > 0) {
        const fragmentsLookup = await buildFragmentsLookup(config.workflowDir, [sourceWorkflowId], fragmentRefs);
        activityBody = injectCheckpointFragmentBodies(activityBody, (ref) =>
          resolveCheckpointFragment(fragmentsLookup, sourceWorkflowId, ref));
      }

      const view = sessionView(state);
      const diagResult = await loadWorkflowWithDiagnostics(config.workflowDir, workflow_id);
      const result = diagResult.success
        ? { success: true as const, value: diagResult.value.workflow }
        : diagResult;
      const activitySourceWorkflow = diagResult.success
        ? diagResult.value.activitySourceWorkflow
        : new Map<string, string>();

      // Reference-not-repeat delivery: active via per-call opt-in or the session's declared
      // context mode. Full delivery stays the default — in disposable-worker topologies each
      // call lands in a fresh context and the repeated bundle is load-bearing.
      const referenceMode = (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';
      // Hashes of content delivered in full by THIS call, recorded to the session's delivery
      // ledger. Recorded in every mode so a later per-call reference opt-in can refer back to
      // content that was delivered under the default full mode.
      const newDeliveries: Record<string, string> = {};

      // Bundle the techniques the activity references (delivered as full protocols), deduped with
      // the workflow-level techniques inherited by every activity (`techniques.activity`, injected
      // here so a common technique is declared once on the workflow) and the core worker techniques.
      const activity = result.success ? getActivity(result.value, activity_id) : undefined;
      const ownTechRefs = (activity as { techniques?: string[] } | undefined)?.techniques ?? [];
      const inheritedTechRefs = result.success ? ((result.value as { techniques?: { activity?: string[] } }).techniques?.activity ?? []) : [];
      const workerTechniques = Array.from(new Set([...inheritedTechRefs, ...ownTechRefs, ...CORE_WORKER_TECHNIQUES]));
      const resolvedWorker = await resolveTechniques(workerTechniques, config.workflowDir, workflow_id);
      const bundleData = formatTechniqueBundle(resolvedWorker);

      // Per-technique dedup: each composed technique in the bundle is hashed individually, so an
      // activity that introduces one new technique still receives that one in full while the
      // inherited rest collapse to markers.
      const bundleTechniques = bundleData['techniques'] as Record<string, unknown> | undefined;
      if (bundleTechniques) {
        for (const [key, body] of Object.entries(bundleTechniques)) {
          const hash = contentHash(stringifyForResponse(body));
          const ledgerKey = `bundle:${key}`;
          if (referenceMode && deliveredHash(state, ledgerKey) === hash) {
            bundleTechniques[key] = unchangedMarker(hash);
          } else {
            newDeliveries[ledgerKey] = hash;
          }
        }
      }
      // The rules bundle varies with the activity's own techniques, and activities alternate
      // between rule sets across a walk — so rules entries are keyed by CONTENT (set semantics,
      // `bundle:rules:<hash>`): any rule set this session+agent has ever received collapses,
      // not just the most recently delivered one.
      if (bundleData['rules'] !== undefined) {
        const rulesHash = contentHash(stringifyForResponse(bundleData['rules']));
        const rulesKey = `bundle:rules:${rulesHash}`;
        if (referenceMode && deliveredHash(state, rulesKey) === rulesHash) {
          bundleData['rules'] = unchangedMarker(rulesHash);
        } else {
          newDeliveries[rulesKey] = rulesHash;
        }
      }

      // Automatic, per-agent context-derived step-technique bundling (#189 C1c): every activity
      // eagerly inlines its small, ungated step-bound techniques — no per-activity opt-in. The
      // eager-delivery budget is a CUMULATIVE per-activity character budget derived from the
      // worker's declared `context_tokens` (availability headroom × a token→char factor, both
      // server config): ungated technique steps are inlined in DOCUMENT ORDER until adding the
      // next would overflow the budget; the remainder stay lazy via get_technique. A step gated
      // by `when`/`condition` (on itself or an enclosing loop) may never execute and stays lazy
      // regardless of size. A per-activity `bundleTechniques.maxChars` is retained as an explicit
      // per-technique size cap layered on top (skip any single technique larger than it);
      // `maxChars: 0` opts the activity out of eager bundling entirely. Each entry is the step's
      // full get_technique composition (activity-group resolution, ancestor contract, provenance
      // decoration) rendered as a discrete ▼ STEP block, so bundled and lazy delivery are
      // identical by construction. Bundled entries share the `technique:<resolvedId>` delivery-
      // ledger key with get_technique, so persistent-context refetches of bundled content collapse
      // to unchanged-references in either direction.
      const bundledStepTechniques: Record<string, unknown> = {};
      const bundledSteps: Array<{ stepId: string; techniqueId: string }> = [];
      const bundlingWarnings: string[] = [];
      const bundleConfig = (activity as Activity | undefined)?.bundleTechniques;
      // maxChars: 0 is the explicit opt-out sentinel; any other declared value is a per-technique
      // size cap. Absent config means no per-technique cap (only the cumulative budget applies).
      const optedOut = bundleConfig?.maxChars === 0;
      const perTechniqueCap = bundleConfig && bundleConfig.maxChars > 0 ? bundleConfig.maxChars : Infinity;
      // Cumulative eager-delivery budget in characters, derived from the caller's own window.
      // Headroom fraction and chars-per-token are server config with in-code fallbacks.
      const headroomFraction = config.bundleHeadroomFraction ?? DEFAULT_BUNDLE_HEADROOM_FRACTION;
      const charsPerToken = config.bundleCharsPerToken ?? DEFAULT_BUNDLE_CHARS_PER_TOKEN;
      const eagerBudgetChars = context_tokens * headroomFraction * charsPerToken;
      if (!optedOut && result.success && activity) {
        const eligible: Array<Step & { kind: 'technique' }> = [];
        const collectUngated = (steps: Step[] | undefined): void => {
          for (const s of steps ?? []) {
            if (s.when !== undefined || s.condition !== undefined) continue;
            if (s.kind === 'loop') { collectUngated(s.steps as Step[]); continue; }
            if (s.kind === 'technique' && s.id) eligible.push(s);
          }
        };
        collectUngated((activity as Activity).steps);

        // Running total of full-content characters already committed to the eager bundle. An
        // unchanged-reference marker costs effectively nothing, so it never draws down the budget;
        // only full-content entries do.
        let spentChars = 0;
        for (const step of eligible) {
          const ref = techniqueName(step.technique);
          if (!ref) continue;
          // Borrowed activities resolve their step techniques against the source workflow the
          // activity file was authored in (mirroring #166 B10 fragment scoping).
          const composedStep = await composeActivityTechnique(ref, config.workflowDir, sourceWorkflowId, activity_id);
          // An unresolvable ref is the binding guard's business; delivery skips it (the step's
          // own get_technique fetch will surface the error to the worker).
          if (!composedStep.success) continue;
          const { techniqueId } = composedStep.value;
          let technique = composedStep.value.technique;
          let provenanceWarnings: string[] = [];
          const ctx = await buildProvenanceContext({
            workflow: result.value,
            workflowDir: config.workflowDir,
            currentActivityId: activity_id,
            currentStepId: step.id!,
            activitySourceWorkflow,
          });
          if (ctx) {
            const binding = typeof step.technique === 'object' ? step.technique : undefined;
            const decorated = decorateTechniqueProvenance(technique, ctx, binding, techniqueId, step.id!);
            technique = decorated.technique;
            provenanceWarnings = decorated.warnings;
          }
          // Budget accounting measures the TECHNIQUE BODY only (including its resources[] refs,
          // but NOT the resolved content of those resources). Inlining bundles techniques, never
          // their referenced resources: the worker still calls get_resource on demand for each
          // ref, exactly as for a lazy get_technique fetch. Shared-resource inlining (dedup-aware)
          // is deferred to the C2 block-level-delivery-ledger cluster; inlining resources here
          // without that ledger would duplicate content shared across techniques.
          const text = projectTechniqueToYaml(technique);
          // Per-technique size cap: an oversized single technique is skipped outright.
          if (text.length > perTechniqueCap) continue;
          const ledgerKey = `technique:${techniqueId}`;
          const hash = contentHash(text);
          const alreadyDelivered = referenceMode && (deliveredHash(state, ledgerKey) === hash || newDeliveries[ledgerKey] === hash);
          // ▼ STEP arrival marker: each entry is a discrete, self-describing unit that substitutes
          // for the intentional get_technique { step_id } call inlining removes (#189 C1c(C)1).
          const stepMarker = `▼ STEP ${step.id!} · technique ${techniqueId}`;
          if (alreadyDelivered) {
            // A reference marker is near-zero cost — it does not draw down the eager budget.
            bundledStepTechniques[step.id!] = { marker: stepMarker, ...unchangedMarker(hash) };
          } else {
            // Full content draws down the cumulative budget. Inline ungated step techniques in
            // document order and STOP at the first one that would overflow the remaining budget
            // (stop-and-break) — the remainder stay lazy. This preserves the contiguous
            // document-order prefix the spec and docs promise, rather than skipping a large
            // technique to squeeze in a later smaller one.
            if (spentChars + text.length > eagerBudgetChars) break;
            spentChars += text.length;
            newDeliveries[ledgerKey] = hash;
            // The arrival marker leads the block; the composed technique fields follow at the same
            // level, so a bundled entry reads exactly like a get_technique fetch with a step header.
            bundledStepTechniques[step.id!] = { marker: stepMarker, ...projectTechnique(technique) };
          }
          bundledSteps.push({ stepId: step.id!, techniqueId });
          bundlingWarnings.push(...provenanceWarnings);
        }

        if (bundledSteps.length > 0) {
          bundleData['step_techniques'] = bundledStepTechniques;
          bundleData['step_techniques_note'] =
            'Each step_techniques entry is a discrete ▼ STEP block whose composed technique is identical to a get_technique { step_id } fetch. Engage the inlined steps strictly in step order: on reaching each step, EMIT a one-line "▶ step <step_id>" begin-beat before executing it — that deliberate beat is the intentional act inlining moves off the get_technique call, and it is the stepwise observability trace for bundled steps (do NOT ping the server per bundled step; delivery-time technique_bundled events already record coverage). Resources are NOT inlined: for any resources[] the inlined technique references, still call get_resource { resource_id } on demand, exactly as for a lazy fetch. Technique steps absent from the map (gated, or past the derived eager-delivery budget / a per-activity size cap) still require get_technique { step_id } before execution.';
        }
      }

      const validation = buildValidation(
        result.success ? validateWorkflowVersion(view, result.value) : null,
        ...bundlingWarnings,
      );

      const opsData = referenceMode
        ? {
            bundle_mode: 'reference',
            bundle_note: 'Entries marked { delivery: "unchanged", content_hash } are byte-identical to content already delivered in this session for this agent — reuse them from your context. Re-fetch a step-bound technique with get_technique { step_id, full: true }; for inherited/core bundle entries and rules, call get_activity with bundle: "full" to re-deliver the whole bundle.',
            ...bundleData,
          }
        : bundleData;
      const opsSection = stringifyForResponse(opsData) + '\n\n---\n\n';

      // artifactPrefix is server-computed from the activity filename and is NOT in
      // the raw activity definition, so surface it in the header (and _meta) — the worker
      // needs it to name artifacts as {artifactPrefix}-{bare_filename}.
      const artifactPrefix = (activity as { artifactPrefix?: string } | undefined)?.artifactPrefix;
      const header = artifactPrefix
        ? `session_index: ${session_index}\nartifact_prefix: ${artifactPrefix}`
        : `session_index: ${session_index}`;

      // The activity's artifact contract is SYNTHESIZED from the `## Outputs` of the techniques its
      // steps bind (activities no longer declare `artifacts[]` — the technique outputs own artifact
      // identity, AP-43/65). Append the composed block to the activity body so the worker reads an
      // explicit contract that can never drift from the steps.
      const composedArtifacts = await composeActivityArtifacts(
        activity as Parameters<typeof composeActivityArtifacts>[0], config.workflowDir, workflow_id, activity_id,
      );
      const activityBodyWithArtifacts = composedArtifacts.length
        ? `${activityBody}\n${stringifyForResponse({ artifacts: composedArtifacts })}`
        : activityBody;

      // Payload-borne enforcement hints (#189 C7, R7): the enforcement model (schemas/README) lives
      // in docs that never ride the wire, so a payload-only reader still infers the SERVER executes
      // inert fields (guessing it applies `action: set`, unsure who owns auto-advance). Annotate, at
      // delivery time, only the constructs this activity actually contains — an activity without
      // them adds nothing. Delivery-side only; no schema change.
      const enforcementNotes: Record<string, string> = {};
      if (activity) {
        const flatSteps = flattenActivitySteps(activity);
        if (flatSteps.some((s) => (s.kind === 'technique' || s.kind === 'action') && (s.actions?.length ?? 0) > 0)) {
          enforcementNotes['actions'] =
            'Action verbs (a kind:action step, or an `actions:` list on a step) are AGENT-executed: you carry them out. The server records the step but applies no action verb and sets no session variable from one.';
        }
        if (flatSteps.some((s) => s.kind === 'checkpoint' && s.autoAdvanceMs !== undefined)) {
          enforcementNotes['auto_advance'] =
            "A checkpoint's auto-advance is SERVER-timed: the server enforces the full autoAdvanceMs timer when you call respond_checkpoint { auto_advance: true }, then applies its defaultOption. `blocking` is an advisory orchestrator directive (agent-honored), not a server gate.";
        }
      }
      const enforcementBlock = Object.keys(enforcementNotes).length
        ? `${stringifyForResponse({ enforcement_notes: enforcementNotes })}\n\n`
        : '';

      // Worker-facing rules inherited by EVERY activity, injected into every get_activity so a
      // worker dispatched for a single activity always receives them: the workflow's `rules.activity`
      // plus the dual-audience `rules.universal`. (`rules.workflow` are orchestrator-only.)
      const wfRules = result.success ? (result.value as { rules?: { activity?: string[]; universal?: string[] } }).rules : undefined;
      const inheritedRules = [...(wfRules?.activity ?? []), ...(wfRules?.universal ?? [])];
      let activityRulesBlock = '';
      if (inheritedRules.length) {
        const inheritedRulesHash = contentHash(stringifyForResponse(inheritedRules));
        const inheritedRulesKey = `activity_rules:${inheritedRulesHash}`;
        if (referenceMode && deliveredHash(state, inheritedRulesKey) === inheritedRulesHash) {
          activityRulesBlock = `${stringifyForResponse({ activity_rules: unchangedMarker(inheritedRulesHash) })}\n\n`;
        } else {
          newDeliveries[inheritedRulesKey] = inheritedRulesHash;
          activityRulesBlock = `${stringifyForResponse({ activity_rules: inheritedRules })}\n\n`;
        }
      }

      // Persist against a FRESH load, not the snapshot captured before composition: the session
      // store is last-writer-wins over the whole file, and composition awaits dozens of FS reads —
      // saving the pre-composition snapshot would silently revert any concurrent write (sibling
      // worker save, orchestrator checkpoint resolution) that landed in that window.
      const reloaded = await loadSessionForTool(config.workspaceDir, session_index);
      const next = advanceSession(reloaded.state, (draft) => {
        recordDeliveries(draft, reloaded.state.agentId, newDeliveries);
        // Fidelity observability for bundled deliveries (#166 B11): one technique_bundled
        // event per bundled step, on both delivery paths (full and unchanged-marker) — the
        // bundle counterpart of get_technique's technique_fetched. next_activity's manifest
        // validation accepts either event as coverage.
        const bundledAt = new Date().toISOString();
        for (const b of bundledSteps) {
          draft.history.push({
            timestamp: bundledAt,
            type: 'technique_bundled',
            activity: activity_id,
            data: { techniqueId: b.techniqueId, stepId: b.stepId, agentId: reloaded.state.agentId },
          });
        }
      });
      await saveSessionForTool(reloaded, next);

      return {
        content: [{ type: 'text' as const, text: `${opsSection}${header}\n\n${activityRulesBlock}${enforcementBlock}${activityBodyWithArtifacts}` }],
        _meta: {
          session_index, validation, artifact_prefix: artifactPrefix, artifacts: composedArtifacts, activity_rules: inheritedRules,
          ...(bundledSteps.length > 0 ? { bundled_steps: bundledSteps.map(b => b.stepId) } : {}),
          ...(Object.keys(enforcementNotes).length > 0 ? { enforcement_notes: enforcementNotes } : {}),
        },
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

      // Replay the recorded response if this checkpoint already has one from
      // a prior run of the same activity (e.g., a session being resumed).
      // The worker receives the stored option and reconstructed effect and
      // continues without yielding to the orchestrator — the user is not
      // prompted twice for the same decision. checkpointResponses is keyed
      // by `<activity-id>-<checkpoint-id>`.
      const responseKey = `${activity_id}-${checkpoint_id}`;
      const priorResponse = state.checkpointResponses?.[responseKey];
      if (priorResponse) {
        // Reconstitute the response-shape effect payload from the schema-shape
        // record (mirrors respond_checkpoint's reverse transform). The
        // variable bag has already been mutated on the original response, so
        // this payload is informational for the worker's own bookkeeping.
        const effects = priorResponse.effects;
        const effect: Record<string, unknown> = {};
        if (effects?.variablesSet) effect['setVariable'] = effects.variablesSet;
        if (effects?.transitionedTo) effect['transitionTo'] = effects.transitionedTo;
        if (effects?.activitiesSkipped) effect['skipActivities'] = effects.activitiesSkipped;

        const replayedAt = new Date().toISOString();
        const next = advanceSession(state, (draft) => {
          draft.history.push({
            timestamp: replayedAt,
            type: 'checkpoint_replayed',
            activity: activity_id,
            checkpoint: checkpoint_id,
            data: { optionId: priorResponse.optionId },
          });
        });
        await saveSessionForTool(loaded, next);

        const responsePayload: Record<string, unknown> = {
          status: 'replayed',
          checkpoint_id,
          session_index,
          resolved_option: priorResponse.optionId,
          message: `Checkpoint '${checkpoint_id}' already has a recorded response (option '${priorResponse.optionId}') from a prior run. The stored response has been replayed; apply any returned effect to your local state and continue execution WITHOUT yielding to the orchestrator.`,
        };
        if (Object.keys(effect).length > 0) responsePayload['effect'] = effect;

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(responsePayload, null, 2) }],
          _meta: { session_index, validation },
        };
      }

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
        content: [{ type: 'text' as const, text: stringifyForResponse({ ...checkpoint, session_index }) }],
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
    'setVariable effects are validated against the declared variable type, warn-only: mismatches are stored as written and surfaced in _meta.validation. ' +
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

      // Declared variable types, for warn-only validation of setVariable
      // effects (#166 B7). Values are stored as written either way; a
      // mismatch is surfaced in _meta.validation and on the history event.
      const declaredTypes = new Map((result.value.variables ?? []).map(v => [v.name, v.type]));
      const typeWarnings: string[] = [];

      const next = advanceSession(state, (draft) => {
        delete draft.activeCheckpoint;
        const recordKey = `${active.activityId}-${checkpoint_id}`;
        const respondedAt = new Date(now * 1000).toISOString();
        // CheckpointResponseSchema requires `optionId` + `respondedAt`; for
        // `condition_not_met` dismissals we still record the resolution with
        // a sentinel option id so the on-disk schema stays valid.
        const recordedOptionId = resolvedOptionId ?? (condition_not_met ? '__condition_not_met__' : '__unknown__');
        // Unwrap the response effect into the schema-flat shape:
        // The encoded effect gives { setVariable: {...}, transitionTo: '...', skipActivities: [...] };
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
        // Apply variable assignments to the rolled-up bag. Values are stored
        // as written; a declared-type mismatch is warn-only (#166 B7).
        // `{name}` template passthroughs are references resolved agent-side,
        // so their string type is exempt from validation.
        if (variablesSet) {
          for (const [name, value] of Object.entries(variablesSet)) {
            const declaredType = declaredTypes.get(name);
            const valueType = jsonTypeOf(value);
            const mismatch = declaredType !== undefined && !isTemplateReference(value) && valueType !== declaredType;
            if (mismatch) {
              typeWarnings.push(
                `setVariable '${name}': value is ${valueType} but the variable is declared ${declaredType}; stored as written.`,
              );
            }
            draft.variables[name] = value;
            draft.history.push({
              timestamp: respondedAt,
              type: 'variable_set',
              activity: active.activityId,
              data: { name, value, ...(mismatch ? { declaredType, valueType, typeMismatch: true } : {}) },
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

      if (typeWarnings.length > 0) {
        logWarn(`respond_checkpoint '${checkpoint_id}': setVariable type mismatch`, { session_index, warnings: typeWarnings });
      }

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
        ...typeWarnings,
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

  server.tool('inspect_session',
    'Read-only inspection of a workflow session\'s on-disk state. Returns a compact structured ' +
    'projection (never the raw session.json) of the addressed session, selected by `view`. Reads ' +
    'through the same sealed load path as other tools, so it verifies integrity but performs no ' +
    'mutation — safe to call at any time, including while a checkpoint is active (unlike mutating ' +
    'tools, it is not gated). Requires a session_index.',
    {
      ...sessionIndexParam,
      view: z.enum(INSPECT_SESSION_VIEWS).default('summary')
        .describe('Which projection to return. `summary` (default) is the composite of all views. ' +
          '`identity` = workflow/session/agent header + position; `variables` = the variable bag; ' +
          '`checkpoints` = checkpoint responses (option, timestamp, variables set); `activities` = ' +
          'completed/skipped/current; `history` = event count + per-type tally + milestone sub-sequence; ' +
          '`children` = one-line digest per triggeredWorkflows child.'),
      child_index: z.number().int().nonnegative().optional()
        .describe('Optional positional index into the addressed session\'s `triggeredWorkflows`. When ' +
          'given, the tool descends one level to `triggeredWorkflows[child_index].state` and projects ' +
          'that child instead of the addressed session. Out of range yields the NOT_FOUND message. ' +
          'Deeper children are reached by passing that child\'s own session_index instead of stacking indices.'),
      variable: z.string().optional()
        .describe('Optional single variable name. Only meaningful with `view: variables` — narrows the ' +
          'result to that one key\'s value instead of the whole bag.'),
    },
    withAuditLog('inspect_session', withSessionStoreErrors(async ({ session_index, view, child_index, variable }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      // Positional one-level descent into the addressed session's children, matching the
      // reference script's `--child N`. navigatePath throws SessionStoreError(NOT_FOUND) for an
      // out-of-range index, which withSessionStoreErrors renders as an actionable message.
      const addressed: SessionFile = child_index === undefined
        ? loaded.state
        : navigatePath(loaded.state, ['triggeredWorkflows', child_index, 'state']);

      const projection = projectSessionView(addressed, view, variable);

      // Read-only: no advanceSession / saveSessionForTool — the on-disk state stays untouched.
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(projection, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));
}
